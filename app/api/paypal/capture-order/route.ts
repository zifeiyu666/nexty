import { savePayPalPayerId } from "@/actions/paypal";
import { apiResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { orders as ordersSchema } from "@/lib/db/schema";
import { getErrorMessage } from "@/lib/error-utils";
import {
  capturePayPalOrder,
  decodePayPalCustomId,
  getPayPalOrder,
  isPayPalEnabled,
} from "@/lib/paypal";
import { upgradeOneTimeCredits } from "@/lib/payments/credit-manager";
import { ORDER_STATUSES, ORDER_TYPES } from "@/lib/payments/provider-utils";
import { and, eq } from "drizzle-orm";

interface CaptureOrderRequest {
  orderId: string;
}

/**
 * Build an API response from an existing order record based on its status.
 */
function orderStatusResponse(
  record: { id: string; status: string },
  planName: string
) {
  if (record.status === ORDER_STATUSES.SUCCEEDED) {
    return apiResponse.success({
      orderId: record.id,
      planName,
      message: "Payment already captured and order confirmed.",
    });
  }
  if (record.status === ORDER_STATUSES.PENDING) {
    return apiResponse.success({
      orderId: record.id,
      planName,
      pending: true,
      message: "Your payment is being processed. Please check back in a moment.",
    });
  }
  return apiResponse.badRequest(
    `Payment already processed with status: ${record.status}.`
  );
}

/**
 * Insert a PayPal order record, handling unique-constraint violations
 * (concurrent requests) by recovering the existing record.
 */
async function insertPayPalOrderWithIdempotency(params: {
  userId: string;
  captureId: string;
  status: string;
  planId: string | null;
  amount: string;
  currency: string;
  metadata: Record<string, unknown>;
}): Promise<{ id: string; status: string }> {
  try {
    const [insertedOrder] = await db
      .insert(ordersSchema)
      .values({
        userId: params.userId,
        provider: "paypal",
        providerOrderId: params.captureId,
        status: params.status,
        orderType: ORDER_TYPES.ONE_TIME_PURCHASE,
        planId: params.planId,
        priceId: null,
        productId: null,
        amountSubtotal: params.amount,
        amountDiscount: "0",
        amountTax: "0",
        amountTotal: params.amount,
        currency: params.currency,
        metadata: params.metadata,
      })
      .returning({ id: ordersSchema.id });

    if (!insertedOrder) {
      throw new Error("Failed to create order record.");
    }
    return { id: insertedOrder.id, status: params.status };
  } catch (dbError: any) {
    // Catch the unique-constraint violation: a concurrent request already inserted the record
    if (
      dbError?.code === "23505" ||
      dbError?.message?.includes("unique constraint")
    ) {
      const recoveredOrder = await db
        .select({ id: ordersSchema.id, status: ordersSchema.status })
        .from(ordersSchema)
        .where(
          and(
            eq(ordersSchema.provider, "paypal"),
            eq(ordersSchema.providerOrderId, params.captureId)
          )
        )
        .limit(1);

      if (recoveredOrder.length > 0) {
        return recoveredOrder[0];
      }
    }
    throw dbError;
  }
}

export async function POST(req: Request) {
  // 1. Make sure the user is signed in
  const session = await getSession();
  const user = session?.user;
  if (!user) {
    return apiResponse.unauthorized();
  }

  // 2. Make sure PayPal is enabled
  if (!isPayPalEnabled) {
    return apiResponse.serverError("PayPal is not configured.");
  }

  // 3. Parse the request body
  let requestData: CaptureOrderRequest;
  try {
    requestData = await req.json();
  } catch (error) {
    console.error("[PayPal Capture Order] Invalid request body:", error);
    return apiResponse.badRequest("Invalid request body.");
  }

  const { orderId } = requestData;

  if (!orderId) {
    return apiResponse.badRequest("Missing orderId.");
  }

  try {
    // 4. Call the PayPal API to capture the payment
    const captureResult = await capturePayPalOrder(orderId);

    // 5. Decode the metadata from custom_id
    const purchaseUnit = captureResult.purchase_units[0];
    const capture = purchaseUnit?.payments?.captures?.[0];

    // In a PayPal capture response, custom_id may live on the purchase_unit or the capture, and may be absent
    let customId = purchaseUnit?.custom_id || capture?.custom_id;

    // If neither has it, look it up from the original order
    if (!customId) {
      try {
        const originalOrder = await getPayPalOrder(orderId);
        customId = originalOrder.purchase_units[0]?.custom_id;
      } catch (lookupError) {
        console.error(
          "[PayPal Capture] Failed to fetch original order for custom_id:",
          lookupError
        );
      }
    }

    const customIdData = decodePayPalCustomId(customId);

    if (!customIdData) {
      return apiResponse.serverError(
        "Failed to decode payment metadata. Please contact support."
      );
    }

    const { userId, planId } = customIdData;

    // 6. Verify the decoded userId matches the currently signed-in user
    if (userId !== user.id) {
      console.warn(
        `[PayPal Capture] User ID mismatch! Auth User: ${user.id}, Custom ID User: ${userId}`
      );
      return apiResponse.forbidden("User ID mismatch.");
    }

    // 7. Determine captureId, preferring capture.id; no longer fall back to orderId
    let captureId = capture?.id;

    // If the captureOrder response is missing capture.id, look it up from the original order
    if (!captureId) {
      try {
        const originalOrder = await getPayPalOrder(orderId);
        const originalCapture =
          originalOrder.purchase_units[0]?.payments?.captures?.[0];
        captureId = originalCapture?.id;
      } catch (lookupError) {
        console.error(
          "[PayPal Capture] Failed to fetch original order for capture id:",
          lookupError
        );
      }
    }

    if (!captureId) {
      return apiResponse.serverError(
        "Failed to determine payment capture ID. Please contact support."
      );
    }

    // 8. Idempotency check - use the capture ID as providerOrderId
    const existingOrder = await db
      .select({ id: ordersSchema.id, status: ordersSchema.status })
      .from(ordersSchema)
      .where(
        and(
          eq(ordersSchema.provider, "paypal"),
          eq(ordersSchema.providerOrderId, captureId)
        )
      )
      .limit(1);

    const planName = purchaseUnit?.description || "Plan";

    if (existingOrder.length > 0) {
      return orderStatusResponse(existingOrder[0], planName);
    }

    // 9. Build shared insert parameters
    const metadata = {
      paypalOrderId: orderId,
      paypalCaptureId: captureId,
      paypalPayerId: captureResult.payer?.payer_id,
      planId,
      planName: purchaseUnit?.description,
    };

    const amount = capture?.amount?.value || "0";
    const currency = capture?.amount?.currency_code || "USD";

    // 10. Branch on the capture status
    if (captureResult.status === "COMPLETED") {
      const record = await insertPayPalOrderWithIdempotency({
        userId,
        captureId,
        status: ORDER_STATUSES.SUCCEEDED,
        planId: planId ?? null,
        amount,
        currency,
        metadata,
      });

      if (record.status !== ORDER_STATUSES.SUCCEEDED) {
        return orderStatusResponse(record, planName);
      }

      // 11. Save the PayPal Payer ID to the user table
      if (captureResult.payer?.payer_id) {
        await savePayPalPayerId(userId, captureResult.payer.payer_id);
      }

      // 12. Grant the one-time credits for this plan (mirrors Stripe/Creem)
      if (planId) {
        try {
          await upgradeOneTimeCredits(userId, planId, record.id);
        } catch (creditError) {
          console.error(
            `[PayPal Capture] Failed to upgrade one-time credits for order ${record.id}:`,
            creditError
          );
        }
      }

      // 13. Return the success result
      return apiResponse.success({
        orderId: record.id,
        planName,
        message: "Payment captured and order confirmed.",
      });
    }

    if (captureResult.status === "PENDING") {
      const record = await insertPayPalOrderWithIdempotency({
        userId,
        captureId,
        status: ORDER_STATUSES.PENDING,
        planId: planId ?? null,
        amount,
        currency,
        metadata,
      });

      if (record.status !== ORDER_STATUSES.PENDING) {
        return orderStatusResponse(record, planName);
      }

      return apiResponse.success({
        orderId: record.id,
        planName,
        pending: true,
        message: "Your payment is being processed. Please check back in a moment.",
      });
    }

    // DECLINED / FAILED / any other non-success status
    return apiResponse.badRequest(
      `Payment capture failed with status: ${captureResult.status}`
    );
  } catch (error) {
    console.error("[PayPal Capture Order] Error:", error);
    const errorMessage = getErrorMessage(error);
    return apiResponse.serverError(
      `Failed to capture PayPal payment: ${errorMessage}`
    );
  }
}
