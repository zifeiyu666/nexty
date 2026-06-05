/**
 * PayPal payment verification handlers
 */

import { syncPayPalSubscriptionData } from "@/actions/paypal";
import { apiResponse } from "@/lib/api-response";
import { db } from "@/lib/db";
import { subscriptions as subscriptionsSchema } from "@/lib/db/schema";
import { getPayPalSubscription } from "@/lib/paypal";
import { and, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

/**
 * Main handler for PayPal payment verification.
 *
 * - One-time payments are captured synchronously by /api/paypal/capture-order,
 *   so when there is no subscription_id we simply acknowledge success.
 * - Subscriptions return to this page with a `subscription_id`, which we verify
 *   and sync (fallback in case the webhook hasn't processed yet).
 */
export async function verifyPayPalPayment(
  req: NextRequest,
  userId: string
): Promise<NextResponse> {
  const subscriptionId = req.nextUrl.searchParams.get("subscription_id");

  // PayPal one-time payments do not need this route (handled by the capture-order API)
  if (!subscriptionId) {
    return apiResponse.success({
      message: "Payment verified successfully.",
    });
  }

  try {
    // Fetch the PayPal subscription details
    const subscription = await getPayPalSubscription(subscriptionId);

    // Validate the subscription status
    if (subscription.status !== "ACTIVE") {
      return apiResponse.badRequest(
        `Subscription status is not active (${subscription.status})`
      );
    }

    // Sync the subscription data (fallback if the webhook hasn't processed yet)
    try {
      await syncPayPalSubscriptionData(subscriptionId);
    } catch (syncError) {
      console.error(
        `[Verify API] Error during PayPal subscription sync for ${subscriptionId}:`,
        syncError
      );
    }

    // Query the local subscription record
    const [subscriptionRecord] = await db
      .select({
        id: subscriptionsSchema.id,
        planId: subscriptionsSchema.planId,
        status: subscriptionsSchema.status,
        metadata: subscriptionsSchema.metadata,
      })
      .from(subscriptionsSchema)
      .where(
        and(
          eq(subscriptionsSchema.subscriptionId, subscriptionId),
          eq(subscriptionsSchema.userId, userId),
          inArray(subscriptionsSchema.status, ["active", "trialing"])
        )
      )
      .limit(1);

    if (!subscriptionRecord) {
      return apiResponse.success({
        message:
          "Payment successful! Subscription activation may take a moment. Please refresh shortly.",
      });
    }

    return apiResponse.success({
      subscriptionId: subscriptionRecord.id,
      planName: (subscriptionRecord.metadata as any)?.planName,
      planId: subscriptionRecord.planId,
      status: subscriptionRecord.status,
      message: "Subscription verified and active.",
    });
  } catch (error: any) {
    console.error(`[Verify API] Error verifying PayPal payment:`, error);
    return apiResponse.serverError(
      error?.message || "Failed to verify PayPal payment."
    );
  }
}
