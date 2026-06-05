"use server";

import { db } from "@/lib/db";
import {
  pricingPlans as pricingPlansSchema,
  subscriptions as subscriptionsSchema,
  user as userSchema,
} from "@/lib/db/schema";
import { getErrorMessage } from "@/lib/error-utils";
import {
  cancelPayPalSubscription,
  decodePayPalCustomId,
  getPayPalSubscription,
} from "@/lib/paypal";
import { eq, InferInsertModel } from "drizzle-orm";

function toDate(value?: string | null) {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Save the PayPal Payer ID to the user table.
 * Mirrors Creem's saveCreemCustomerId pattern.
 */
export async function savePayPalPayerId(
  userId: string,
  payerId: string
): Promise<void> {
  try {
    const userResults = await db
      .select({ paypalPayerId: userSchema.paypalPayerId })
      .from(userSchema)
      .where(eq(userSchema.id, userId))
      .limit(1);

    const existingPayerId = userResults[0]?.paypalPayerId;

    if (existingPayerId) {
      if (existingPayerId !== payerId) {
        console.warn(
          `[PayPal] User ${userId} already has a different paypalPayerId: ${existingPayerId} vs ${payerId}`
        );
      }
      return;
    }

    await db
      .update(userSchema)
      .set({ paypalPayerId: payerId })
      .where(eq(userSchema.id, userId));

    console.log(`[PayPal] Saved payerId ${payerId} for user ${userId}`);
  } catch (error) {
    console.error(`[PayPal] Failed to save payerId for user ${userId}:`, error);
  }
}

/**
 * Sync PayPal subscription data into the subscriptions table.
 * Equivalent to Stripe's syncSubscriptionData and Creem's
 * syncCreemSubscriptionData.
 *
 * Note: this only syncs subscription state. Credit granting for subscriptions
 * happens in the webhook on PAYMENT.SALE.COMPLETED (initial + renewal), mirroring
 * how the Creem integration grants credits in handleCreemInvoicePaid.
 */
export async function syncPayPalSubscriptionData(
  subscriptionId: string,
  initialMetadata?: Record<string, any>
): Promise<void> {
  try {
    const subscription = await getPayPalSubscription(subscriptionId);

    if (!subscription?.status) {
      console.error(
        `[PayPal] getPayPalSubscription returned no status for ${subscriptionId}. Response:`,
        JSON.stringify(subscription)
      );
      throw new Error(
        `PayPal subscription ${subscriptionId} returned without a status field`
      );
    }

    // Parse userId and planId from custom_id or initialMetadata
    const decodedCustom = subscription.custom_id
      ? decodePayPalCustomId(subscription.custom_id)
      : null;
    let userId: string | null = decodedCustom?.userId ?? null;
    let planId: string | null = decodedCustom?.planId ?? null;

    // Merge metadata (initialMetadata may carry extra keys such as paypalPlanId)
    const metadata: Record<string, any> = {
      ...(initialMetadata || {}),
      ...(decodedCustom || {}),
    };

    if (!userId) {
      userId = metadata?.userId ?? null;
    }

    if (!planId) {
      planId = metadata?.planId ?? null;
    }

    // If userId is still missing, try to look it up via subscriber.payer_id
    if (!userId && subscription.subscriber?.payer_id) {
      const userResults = await db
        .select({ id: userSchema.id })
        .from(userSchema)
        .where(eq(userSchema.paypalPayerId, subscription.subscriber.payer_id))
        .limit(1);
      userId = userResults[0]?.id || null;
    }

    // If planId is still missing, try to look it up via paypalPlanId
    if (!planId && metadata?.paypalPlanId) {
      const planResults = await db
        .select({ id: pricingPlansSchema.id })
        .from(pricingPlansSchema)
        .where(eq(pricingPlansSchema.paypalPlanId, metadata.paypalPlanId))
        .limit(1);
      planId = planResults[0]?.id || null;
    }

    if (!userId) {
      console.error(
        `[PayPal] Cannot determine userId for subscription ${subscriptionId}`
      );
      throw new Error(`Cannot determine userId for subscription ${subscriptionId}`);
    }

    if (!planId) {
      console.error(
        `[PayPal] Cannot determine planId for subscription ${subscriptionId}`
      );
      throw new Error(`Cannot determine planId for subscription ${subscriptionId}`);
    }

    // Map PayPal statuses to our database statuses
    const statusMap: Record<string, string> = {
      ACTIVE: "active",
      SUSPENDED: "past_due",
      CANCELLED: "canceled",
      EXPIRED: "expired",
      APPROVAL_PENDING: "incomplete",
      APPROVED: "active", // approved but not yet active (awaiting first payment)
    };

    const subscriptionData: InferInsertModel<typeof subscriptionsSchema> = {
      userId,
      planId,
      provider: "paypal",
      subscriptionId: subscription.id,
      // customerId is NOT NULL in this template's schema, so fall back to the
      // subscription id when the payer id is not yet available.
      customerId: subscription.subscriber?.payer_id || subscription.id,
      productId: metadata?.paypalPlanId || subscription.plan_id,
      priceId: subscription.plan_id,
      status:
        statusMap[subscription.status] ||
        subscription.status?.toLowerCase() ||
        "incomplete",
      currentPeriodStart: toDate(subscription.billing_info?.last_payment?.time),
      currentPeriodEnd: toDate(subscription.billing_info?.next_billing_time),
      cancelAtPeriodEnd: false, // PayPal does not expose this directly; derive it from business logic if needed
      canceledAt:
        subscription.status === "CANCELLED"
          ? toDate(subscription.update_time)
          : null,
      endedAt:
        subscription.status === "EXPIRED"
          ? toDate(subscription.update_time)
          : null,
      trialStart: null,
      trialEnd: null,
      metadata: {
        ...metadata,
        paypalSubscriptionId: subscription.id,
        paypalPlanId: subscription.plan_id,
        paypalPayerId: subscription.subscriber?.payer_id,
        paypalStatus: subscription.status,
        lastPayment: subscription.billing_info?.last_payment,
        nextBillingTime: subscription.billing_info?.next_billing_time,
      },
    };

    // Upsert into the subscriptions table
    const { subscriptionId: _, ...updateData } = subscriptionData;

    await db
      .insert(subscriptionsSchema)
      .values(subscriptionData)
      .onConflictDoUpdate({
        target: subscriptionsSchema.subscriptionId,
        set: updateData,
      });

    console.log(
      `[PayPal] Subscription ${subscriptionId} synced successfully for user ${userId}`
    );
  } catch (error) {
    console.error(
      `[PayPal] Failed to sync subscription ${subscriptionId}:`
    );
    const errorMessage = getErrorMessage(error);
    throw new Error(`Subscription sync failed (${subscriptionId}): ${errorMessage}`);
  }
}

/**
 * Cancel a PayPal subscription.
 * POST /v1/billing/subscriptions/{id}/cancel
 */
export async function cancelPayPalSubscriptionAction(
  subscriptionId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Call the PayPal API to cancel the subscription
    await cancelPayPalSubscription(subscriptionId, reason);

    // 2. Update the local subscriptions table
    await db
      .update(subscriptionsSchema)
      .set({
        status: "canceled",
        canceledAt: new Date(),
      })
      .where(eq(subscriptionsSchema.subscriptionId, subscriptionId));

    console.log(`[PayPal] Subscription ${subscriptionId} cancelled successfully.`);

    return { success: true };
  } catch (error) {
    console.error(`[PayPal] Failed to cancel subscription ${subscriptionId}:`, error);
    const errorMessage = getErrorMessage(error);
    return { success: false, error: errorMessage };
  }
}
