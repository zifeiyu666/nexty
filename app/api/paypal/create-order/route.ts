import { apiResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { pricingPlans as pricingPlansSchema } from "@/lib/db/schema";
import { getErrorMessage } from "@/lib/error-utils";
import { createPayPalOrder, isPayPalEnabled } from "@/lib/paypal";
import { eq } from "drizzle-orm";

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
  const { planId } = await req.json();

  if (!planId) {
    return apiResponse.badRequest("Missing planId.");
  }

  try {
    // 4. Look up the plan details in the pricingPlans table
    const planResults = await db
      .select({
        id: pricingPlansSchema.id,
        cardTitle: pricingPlansSchema.cardTitle,
        provider: pricingPlansSchema.provider,
        paymentType: pricingPlansSchema.paymentType,
        price: pricingPlansSchema.price,
        currency: pricingPlansSchema.currency,
      })
      .from(pricingPlansSchema)
      .where(eq(pricingPlansSchema.id, planId))
      .limit(1);

    const plan = planResults[0];

    if (!plan) {
      return apiResponse.notFound("Plan not found.");
    }

    // 5. Ensure the plan's provider is "paypal" and paymentType is "one_time"
    if (plan.provider !== "paypal") {
      return apiResponse.badRequest(`Invalid provider: ${plan.provider}. Expected: paypal`);
    }

    if (plan.paymentType !== "one_time") {
      if (!plan.paymentType) {
        return apiResponse.badRequest(
          "Plan payment type is not configured."
        );
      }
      return apiResponse.badRequest(
        `Invalid paymentType: ${plan.paymentType}. Expected: one_time. For subscriptions, use /api/payment/checkout-session.`
      );
    }

    if (!plan.price || !plan.currency) {
      return apiResponse.serverError("Plan price or currency is not configured.");
    }

    // 6. Create the PayPal Order
    const paypalOrder = await createPayPalOrder({
      amount: plan.price,
      currency: plan.currency,
      description: plan.cardTitle,
      customIdData: {
        userId: user.id,
        planId: plan.id,
        submitProductId: null,
      },
    });

    // 7. Return the orderId to the frontend
    return apiResponse.success({
      orderId: paypalOrder.id,
    });
  } catch (error) {
    console.error("[PayPal Create Order] Error:", error);
    const errorMessage = getErrorMessage(error);
    return apiResponse.serverError(`Failed to create PayPal order: ${errorMessage}`);
  }
}
