import { savePayPalPayerId, syncPayPalSubscriptionData } from "@/actions/paypal";
import {
  buildPendingUnlockSongResult,
  finalizeAndRecordOrderUnlockSong,
  parseUnlockSongMetadata,
  recordOrderUnlockSongResult,
  recordUnlockSongResultForOrderAndSubscription,
} from "@/lib/ai/song-unlock-after-payment";
import { db } from "@/lib/db";
import {
  orders as ordersSchema,
  subscriptions as subscriptionsSchema,
  user as userSchema,
} from "@/lib/db/schema";
import {
  decodePayPalCustomId,
  getPayPalOrder,
  PayPalBillingSubscriptionActivated,
  PayPalBillingSubscriptionCancelled,
  PayPalBillingSubscriptionExpired,
  PayPalBillingSubscriptionSuspended,
  PayPalCapture,
  PayPalPaymentCaptureCompleted,
  PayPalPaymentCaptureDeclined,
  PayPalPaymentCapturePending,
  PayPalPaymentCaptureRefunded,
  PayPalPaymentSaleCompleted,
  PayPalPaymentSaleDenied,
  PayPalPaymentSalePending,
  PayPalPaymentSaleRefunded,
  PayPalPaymentSaleReversed,
  PayPalWebhookEvent,
} from "@/lib/paypal";
import {
  revokeOneTimeCredits,
  revokeRemainingSubscriptionCreditsOnEnd,
  revokeSubscriptionCredits,
  upgradeOneTimeCredits,
  upgradeSubscriptionCredits,
} from "@/lib/payments/credit-manager";
import { ORDER_STATUSES, ORDER_TYPES } from "@/lib/payments/provider-utils";
import type { Order } from "@/lib/payments/types";
import {
  findOriginalOrderForRefund,
  refundOrderExists,
  updateOrderStatusAfterRefund,
} from "@/lib/payments/webhook-helpers";
import { and, eq, inArray } from "drizzle-orm";

/** Convert a currency amount string (e.g. "9.99") to integer cents. */
function toCents(amount: string | null | undefined): number {
  return Math.round(parseFloat(amount || "0") * 100);
}

/**
 * Find a user by their paypalPayerId.
 */
async function findUserByPayerId(payerId: string): Promise<string | null> {
  try {
    const userResults = await db
      .select({ id: userSchema.id })
      .from(userSchema)
      .where(eq(userSchema.paypalPayerId, payerId))
      .limit(1);
    return userResults[0]?.id || null;
  } catch (error) {
    console.error(`[PayPal Webhook] Failed to find user by payerId ${payerId}:`, error);
    return null;
  }
}

/**
 * Revoke benefits (credits) for a refunded order, mirroring the Stripe/Creem
 * refund flow: subscription orders use revokeSubscriptionCredits, one-time
 * orders use revokeOneTimeCredits.
 */
async function revokeBenefitsForRefund(
  originalOrder: Order,
  refundOrderId: string,
  refundAmountCents: number
) {
  const originalAmountCents = toCents(originalOrder.amountTotal);
  try {
    if (originalOrder.subscriptionId) {
      await revokeSubscriptionCredits(originalOrder, refundAmountCents, originalAmountCents);
    } else {
      await revokeOneTimeCredits(refundAmountCents, originalOrder, refundOrderId, originalAmountCents);
    }
  } catch (error) {
    console.error(
      `[PayPal Webhook] Failed to revoke credits for refund of order ${originalOrder.id}:`,
      error
    );
  }
}

/**
 * Handle PAYMENT.CAPTURE.COMPLETED.
 *
 * For one-time payments the capture-order API already handles this synchronously;
 * this is an idempotent backup so the business logic still completes even if
 * capture-order failed.
 */
export async function handlePayPalCaptureCompleted(
  event: PayPalPaymentCaptureCompleted
) {
  const capture = event.resource;

  // 1. Decode the metadata from custom_id
  const data = decodePayPalCustomId(capture.custom_id);

  let userId: string | null = null;
  let planId: string | null = null;

  if (data) {
    userId = data.userId;
    planId = data.planId;
  } else {
    // 2. If decoding fails, look up the order by order_id to get payer_id, then find the user
    const orderId = capture.supplementary_data?.related_ids?.order_id;
    if (orderId) {
      try {
        const order = await getPayPalOrder(orderId);
        const payerId = order.payer?.payer_id;
        if (payerId) {
          userId = await findUserByPayerId(payerId);
        }
      } catch (lookupError) {
        console.error(
          `[PayPal Webhook] Failed to fetch order ${orderId} for payer lookup:`,
          lookupError
        );
      }
    }

    // Without a decodable custom_id we cannot determine the plan, so we cannot
    // grant credits. Skip (the synchronous capture-order path is the source of truth).
    console.warn(
      `[PayPal Webhook] Custom ID decode failed for capture ${capture.id}. Skipping credit grant.`
    );
    return;
  }
  const unlockSongContext = parseUnlockSongMetadata(data);

  // 3. Idempotency check
  const existingOrder = await db
    .select({ id: ordersSchema.id, status: ordersSchema.status })
    .from(ordersSchema)
    .where(
      and(
        eq(ordersSchema.provider, "paypal"),
        eq(ordersSchema.providerOrderId, capture.id)
      )
    )
    .limit(1);

  if (existingOrder.length > 0) {
    const orderRecord = existingOrder[0];
    console.log(
      `[PayPal Webhook] Order for capture ${capture.id} already exists: ${orderRecord.id} (status: ${orderRecord.status})`
    );

    // If it was previously pending and is now COMPLETED, update the status and grant credits
    if (
      orderRecord.status === ORDER_STATUSES.PENDING &&
      capture.status === "COMPLETED"
    ) {
      await db
        .update(ordersSchema)
        .set({ status: ORDER_STATUSES.SUCCEEDED })
        .where(eq(ordersSchema.id, orderRecord.id));

      console.log(
        `[PayPal Webhook] Updated order ${orderRecord.id} from pending to succeeded`
      );

      let creditsGranted = false;
      if (userId && planId) {
        try {
          await upgradeOneTimeCredits(userId, planId, orderRecord.id);
          creditsGranted = true;
        } catch (error) {
          console.error(
            `[PayPal Webhook] Failed to upgrade one-time credits for order ${orderRecord.id}:`,
            error
          );
        }
      }

      try {
        const unlockResult = creditsGranted
          ? await finalizeAndRecordOrderUnlockSong({
              userId: userId!,
              context: unlockSongContext,
              orderId: orderRecord.id,
            })
          : buildPendingUnlockSongResult(unlockSongContext);
        await recordOrderUnlockSongResult(orderRecord.id, unlockResult);
      } catch (error) {
        console.error(
          `[PayPal Webhook] Failed to finalize unlock song for existing order ${orderRecord.id}:`,
          error
        );
      }
    }
    return;
  }

  // 4. Create the order record
  const orderStatus =
    capture.status === "COMPLETED"
      ? ORDER_STATUSES.SUCCEEDED
      : capture.status.toLowerCase();

  const [insertedOrder] = await db
    .insert(ordersSchema)
    .values({
      userId,
      provider: "paypal",
      providerOrderId: capture.id,
      status: orderStatus,
      orderType: ORDER_TYPES.ONE_TIME_PURCHASE,
      planId: planId ?? null,
      priceId: null,
      productId: null,
      amountSubtotal: capture.amount?.value || "0",
      amountDiscount: "0",
      amountTax: "0",
      amountTotal: capture.amount?.value || "0",
      currency: capture.amount?.currency_code || "USD",
      metadata: {
        paypalCaptureId: capture.id,
        customId: capture.custom_id,
        planId,
        ...(data?.paypalUnlock && { paypalUnlock: data.paypalUnlock }),
      },
    })
    .returning({ id: ordersSchema.id });

  if (!insertedOrder) {
    console.error(`[PayPal Webhook] Failed to create order for capture ${capture.id}`);
    return;
  }

  console.log(
    `[PayPal Webhook] Order ${insertedOrder.id} created for capture ${capture.id}`
  );

  // 5. Grant credits only when COMPLETED
  if (capture.status === "COMPLETED" && userId && planId) {
    let creditsGranted = false;
    try {
      await upgradeOneTimeCredits(userId, planId, insertedOrder.id);
      creditsGranted = true;
    } catch (error) {
      console.error(
        `[PayPal Webhook] Failed to upgrade one-time credits for order ${insertedOrder.id}:`,
        error
      );
    }

    try {
      const unlockResult = creditsGranted
        ? await finalizeAndRecordOrderUnlockSong({
            userId,
            context: unlockSongContext,
            orderId: insertedOrder.id,
          })
        : buildPendingUnlockSongResult(unlockSongContext);
      await recordOrderUnlockSongResult(insertedOrder.id, unlockResult);
    } catch (error) {
      console.error(
        `[PayPal Webhook] Failed to finalize unlock song for order ${insertedOrder.id}:`,
        error
      );
    }
  }
}

/**
 * Handle PAYMENT.CAPTURE.REFUNDED (one-time payment refund).
 */
export async function handlePayPalCaptureRefunded(
  event: PayPalPaymentCaptureRefunded
) {
  const refund = event.resource;
  const refundId = refund.id;

  // 1. Check whether the refund has already been processed
  const exists = await refundOrderExists("paypal", refundId);
  if (exists) {
    console.log(`[PayPal Webhook] Refund ${refundId} already processed.`);
    return;
  }

  // 2. Find the associated capture ID from the refund's links
  const captureLink = refund.links?.find(
    (link: { rel: string }) => link.rel === "up"
  );
  const captureId = captureLink?.href?.split("/").pop();

  if (!captureId) {
    console.error(`[PayPal Webhook] Cannot find capture ID for refund ${refundId}`);
    return;
  }

  // 3. Find the original order
  const originalOrder = await findOriginalOrderForRefund("paypal", captureId);

  if (!originalOrder) {
    console.error(
      `[PayPal Webhook] Refund received for unknown capture ${captureId}`
    );
    return;
  }

  // 4. Update the original order status
  const refundAmount = toCents(refund.amount?.value); // cents
  const originalAmount = toCents(originalOrder.amountTotal);
  await updateOrderStatusAfterRefund(originalOrder.id, refundAmount, originalAmount);

  // 5. Create the refund order record
  const [refundOrder] = await db
    .insert(ordersSchema)
    .values({
      userId: originalOrder.userId,
      provider: "paypal",
      providerOrderId: refundId,
      status: refund.status.toLowerCase(),
      orderType: ORDER_TYPES.REFUND,
      planId: originalOrder.planId,
      priceId: originalOrder.priceId,
      productId: originalOrder.productId,
      subscriptionId: originalOrder.subscriptionId,
      amountSubtotal: `-${refund.amount?.value || "0"}`,
      amountDiscount: "0",
      amountTax: "0",
      amountTotal: `-${refund.amount?.value || "0"}`,
      currency: refund.amount?.currency_code || originalOrder.currency,
      metadata: {
        paypalRefundId: refundId,
        paypalCaptureId: captureId,
        originalOrderId: originalOrder.id,
        originalProviderOrderId: originalOrder.providerOrderId,
      },
    })
    .returning({ id: ordersSchema.id });

  console.log(
    `[PayPal Webhook] Refund ${refundId} processed for order ${originalOrder.id}`
  );

  // 6. Revoke the granted credits
  if (refundOrder) {
    await revokeBenefitsForRefund(originalOrder, refundOrder.id, refundAmount);
  }
}

/**
 * Handle BILLING.SUBSCRIPTION.ACTIVATED / UPDATED.
 *
 * Syncs subscription state and saves the payer id. Credit granting for the
 * initial charge happens on PAYMENT.SALE.COMPLETED (mirrors how Creem grants on
 * subscription.paid / invoice.paid).
 */
export async function handlePayPalSubscriptionActivated(
  event: PayPalBillingSubscriptionActivated
) {
  const subscription = event.resource;
  const decoded = decodePayPalCustomId(subscription.custom_id);

  try {
    // Sync the subscription data into the subscriptions table
    await syncPayPalSubscriptionData(subscription.id, {
      ...decoded,
      paypalPlanId: subscription.plan_id,
    });

    console.log(
      `[PayPal Webhook] Subscription ${subscription.id} synced successfully.`
    );

    // Save the payer ID
    if (subscription.subscriber?.payer_id && decoded?.userId) {
      await savePayPalPayerId(decoded.userId, subscription.subscriber.payer_id);
    }
  } catch (error) {
    console.error(
      `[PayPal Webhook] Failed to sync subscription ${subscription.id}:`
    );
    throw error;
  }
}

/**
 * Resolve the userId for a subscription end event from custom_id or the DB.
 */
async function resolveSubscriptionUserId(
  subscriptionId: string,
  customId: string | null | undefined
): Promise<string | null> {
  const decoded = decodePayPalCustomId(customId);
  if (decoded?.userId) {
    return decoded.userId;
  }
  const rows = await db
    .select({ userId: subscriptionsSchema.userId })
    .from(subscriptionsSchema)
    .where(eq(subscriptionsSchema.subscriptionId, subscriptionId))
    .limit(1);
  return rows[0]?.userId ?? null;
}

/**
 * Handle BILLING.SUBSCRIPTION.CANCELLED.
 */
export async function handlePayPalSubscriptionCancelled(
  event: PayPalBillingSubscriptionCancelled
) {
  const subscription = event.resource;

  try {
    await syncPayPalSubscriptionData(subscription.id, {
      ...decodePayPalCustomId(subscription.custom_id),
      paypalPlanId: subscription.plan_id,
    });

    console.log(
      `[PayPal Webhook] Subscription ${subscription.id} cancellation synced.`
    );

    // Revoke remaining subscription credits
    const userId = await resolveSubscriptionUserId(subscription.id, subscription.custom_id);
    if (userId) {
      await revokeRemainingSubscriptionCreditsOnEnd(
        "paypal",
        subscription.id,
        userId,
        subscription.custom_id
      );
    }
  } catch (error) {
    console.error(
      `[PayPal Webhook] Failed to sync subscription cancellation ${subscription.id}:`
    );
    throw error;
  }
}

/**
 * Handle BILLING.SUBSCRIPTION.EXPIRED.
 */
export async function handlePayPalSubscriptionExpired(
  event: PayPalBillingSubscriptionExpired
) {
  const subscription = event.resource;

  try {
    await syncPayPalSubscriptionData(subscription.id, {
      ...decodePayPalCustomId(subscription.custom_id),
      paypalPlanId: subscription.plan_id,
    });

    console.log(
      `[PayPal Webhook] Subscription ${subscription.id} expiration synced.`
    );

    // Revoke remaining subscription credits
    const userId = await resolveSubscriptionUserId(subscription.id, subscription.custom_id);
    if (userId) {
      await revokeRemainingSubscriptionCreditsOnEnd(
        "paypal",
        subscription.id,
        userId,
        subscription.custom_id
      );
    }
  } catch (error) {
    console.error(
      `[PayPal Webhook] Failed to sync subscription expiration ${subscription.id}:`
    );
    throw error;
  }
}

/**
 * Handle BILLING.SUBSCRIPTION.SUSPENDED.
 */
export async function handlePayPalSubscriptionSuspended(
  event: PayPalBillingSubscriptionSuspended
) {
  const subscription = event.resource;

  try {
    await syncPayPalSubscriptionData(subscription.id, {
      ...decodePayPalCustomId(subscription.custom_id),
      paypalPlanId: subscription.plan_id,
    });

    console.log(
      `[PayPal Webhook] Subscription ${subscription.id} suspension synced.`
    );

    // TODO: notify the user about the failed payment
  } catch (error) {
    console.error(
      `[PayPal Webhook] Failed to sync subscription suspension ${subscription.id}:`
    );
    throw error;
  }
}

/**
 * Handle PAYMENT.SALE.COMPLETED (subscription initial charge / renewal).
 *
 * When this event is triggered by the PayPal Subscriptions API it uses the
 * legacy v1 Payments "sale" structure: the subscription ID field is
 * `billing_agreement_id`, the custom field was historically `custom`, and some
 * scenarios also pass `custom_id` — so both must be read with a fallback.
 */
export async function handlePayPalSaleCompleted(
  event: PayPalPaymentSaleCompleted
) {
  const sale = event.resource;
  const subscriptionProviderId = sale.billing_agreement_id;
  const customField = sale.custom_id ?? sale.custom;

  if (!subscriptionProviderId) {
    // Common case: the PayPal Webhook Simulator's PAYMENT.SALE.COMPLETED sample is a
    // non-subscription sale and has no billing_agreement_id. A real subscription renewal always includes it.
    console.error(
      `[PayPal Webhook] Sale ${sale.id} has no billing_agreement_id, skipping. ` +
        `If this came from PayPal Simulator, edit the payload to inject billing_agreement_id. ` +
        `Resource keys: ${Object.keys(sale).join(",")}`
    );
    return;
  }

  try {
    // 1. Find the matching subscription
    const subscriptionResults = await db
      .select({
        id: subscriptionsSchema.id,
        userId: subscriptionsSchema.userId,
        planId: subscriptionsSchema.planId,
        metadata: subscriptionsSchema.metadata,
      })
      .from(subscriptionsSchema)
      .where(eq(subscriptionsSchema.subscriptionId, subscriptionProviderId))
      .limit(1);

    const subscription = subscriptionResults[0];

    if (!subscription) {
      console.error(
        `[PayPal Webhook] Cannot find subscription for sale ${sale.id}, billing_agreement_id ${subscriptionProviderId}`
      );
      return;
    }

    // 2. Resolve metadata (first from sale.custom_id/custom, falling back to the subscription metadata)
    const decoded = decodePayPalCustomId(customField);
    const unlockSongContext =
      parseUnlockSongMetadata(decoded) ||
      parseUnlockSongMetadata(subscription.metadata);

    // 3. Idempotency check
    const existingOrder = await db
      .select({ id: ordersSchema.id })
      .from(ordersSchema)
      .where(
        and(
          eq(ordersSchema.provider, "paypal"),
          eq(ordersSchema.providerOrderId, sale.id)
        )
      )
      .limit(1);

    if (existingOrder.length > 0) {
      console.log(`[PayPal Webhook] Sale ${sale.id} already processed.`);
      return;
    }

    // 4. Decide initial charge vs renewal: check whether this subscription already has a sale-type order
    const priorSaleResults = await db
      .select({ id: ordersSchema.id })
      .from(ordersSchema)
      .where(
        and(
          eq(ordersSchema.provider, "paypal"),
          eq(ordersSchema.subscriptionId, subscriptionProviderId),
          inArray(ordersSchema.orderType, [
            ORDER_TYPES.SUBSCRIPTION_INITIAL,
            ORDER_TYPES.SUBSCRIPTION_RENEWAL,
          ])
        )
      )
      .limit(1);

    const orderType =
      priorSaleResults.length === 0
        ? ORDER_TYPES.SUBSCRIPTION_INITIAL
        : ORDER_TYPES.SUBSCRIPTION_RENEWAL;

    // 5. Create the order record
    const [insertedOrder] = await db
      .insert(ordersSchema)
      .values({
        userId: subscription.userId,
        provider: "paypal",
        providerOrderId: sale.id,
        status: ORDER_STATUSES.SUCCEEDED,
        orderType,
        planId: subscription.planId,
        subscriptionId: subscriptionProviderId,
        amountSubtotal: sale.amount?.total || "0",
        amountDiscount: "0",
        amountTax: "0",
        amountTotal: sale.amount?.total || "0",
        currency: sale.amount?.currency || "USD",
        metadata: {
          paypalSaleId: sale.id,
          paypalSubscriptionId: subscriptionProviderId,
          paypalParentPayment: sale.parent_payment,
          customField,
          ...(decoded || {}),
        },
      })
      .returning({ id: ordersSchema.id });

    if (!insertedOrder) {
      console.error(`[PayPal Webhook] Failed to create order for sale ${sale.id}`);
      return;
    }

    console.log(
      `[PayPal Webhook] ${orderType} order created for sale ${sale.id}, subscription ${subscriptionProviderId}`
    );

    // 6. Grant subscription credits (mirrors Stripe/Creem subscription payment flow)
    if (subscription.userId && subscription.planId) {
      let creditsGranted = false;
      try {
        const currentPeriodStart = sale.create_time
          ? new Date(sale.create_time).getTime()
          : Date.now();
        await upgradeSubscriptionCredits(
          subscription.userId,
          subscription.planId,
          insertedOrder.id,
          currentPeriodStart
        );
        creditsGranted = true;
      } catch (creditError) {
        console.error(
          `[PayPal Webhook] Failed to upgrade subscription credits for order ${insertedOrder.id}:`,
          creditError
        );
      }

      try {
        const unlockResult = creditsGranted
          ? await finalizeAndRecordOrderUnlockSong({
              userId: subscription.userId,
              context: unlockSongContext,
              orderId: insertedOrder.id,
            })
          : buildPendingUnlockSongResult(unlockSongContext);
        await recordUnlockSongResultForOrderAndSubscription({
          orderId: insertedOrder.id,
          subscriptionId: subscriptionProviderId,
          result: unlockResult,
        });
      } catch (error) {
        console.error(
          `[PayPal Webhook] Failed to finalize unlock song for sale ${sale.id}:`,
          error
        );
      }
    }

    // 7. Refresh the subscription period: PayPal does not proactively send
    //    BILLING.SUBSCRIPTION.UPDATED, so we must pull once to advance
    //    currentPeriodEnd / currentPeriodStart.
    try {
      await syncPayPalSubscriptionData(subscriptionProviderId);
    } catch (syncError) {
      console.error(
        `[PayPal Webhook] Failed to refresh subscription ${subscriptionProviderId} after sale ${sale.id}:`,
        syncError
      );
    }
  } catch (error) {
    console.error(`[PayPal Webhook] Failed to process sale ${sale.id}:`);
    throw error;
  }
}

/**
 * Handle PAYMENT.SALE.REFUNDED / PAYMENT.SALE.REVERSED (refund / reversal of a
 * subscription renewal).
 */
export async function handlePayPalSaleRefunded(
  event: PayPalPaymentSaleRefunded | PayPalPaymentSaleReversed
) {
  const refund = event.resource;
  const refundId = refund.id;

  // 1. Idempotency check
  const exists = await refundOrderExists("paypal", refundId);
  if (exists) {
    console.log(`[PayPal Webhook] Sale refund ${refundId} already processed.`);
    return;
  }

  // 2. Find the original sale ID
  let saleId: string | undefined = refund.sale_id;
  if (!saleId) {
    const saleLink = refund.links?.find(
      (link: { rel: string }) => link.rel === "up"
    );
    saleId = saleLink?.href?.split("/").pop();
  }

  if (!saleId) {
    console.error(
      `[PayPal Webhook] Cannot find original sale ID for refund ${refundId}`
    );
    return;
  }

  // 3. Find the original order (subscription_initial / subscription_renewal)
  const originalOrder = await findOriginalOrderForRefund("paypal", saleId);

  if (!originalOrder) {
    console.error(
      `[PayPal Webhook] Sale refund received for unknown sale ${saleId}`
    );
    return;
  }

  // 4. Update the original order status (amount unit matches capture refund: cents)
  const refundAmount = toCents(refund.amount?.total);
  const originalAmount = toCents(originalOrder.amountTotal);
  await updateOrderStatusAfterRefund(originalOrder.id, refundAmount, originalAmount);

  // 5. Create the refund order record
  const [refundOrder] = await db
    .insert(ordersSchema)
    .values({
      userId: originalOrder.userId,
      provider: "paypal",
      providerOrderId: refundId,
      status: refund.state?.toLowerCase() || ORDER_STATUSES.SUCCEEDED,
      orderType: ORDER_TYPES.REFUND,
      planId: originalOrder.planId,
      priceId: originalOrder.priceId,
      productId: originalOrder.productId,
      subscriptionId: originalOrder.subscriptionId,
      amountSubtotal: `-${refund.amount?.total || "0"}`,
      amountDiscount: "0",
      amountTax: "0",
      amountTotal: `-${refund.amount?.total || "0"}`,
      currency: refund.amount?.currency || originalOrder.currency,
      metadata: {
        paypalRefundId: refundId,
        paypalSaleId: saleId,
        paypalParentPayment: refund.parent_payment,
        originalOrderId: originalOrder.id,
        originalProviderOrderId: originalOrder.providerOrderId,
        reversalEvent: event.event_type === "PAYMENT.SALE.REVERSED",
      },
    })
    .returning({ id: ordersSchema.id });

  console.log(
    `[PayPal Webhook] Sale refund ${refundId} (${event.event_type}) processed for order ${originalOrder.id}`
  );

  // 6. Revoke the granted subscription credits
  if (refundOrder) {
    await revokeBenefitsForRefund(originalOrder, refundOrder.id, refundAmount);
  }
}

/**
 * Handle PAYMENT.CAPTURE.REVERSED (dispute / chargeback).
 *
 * PayPal forcibly reverses a captured payment due to a dispute or chargeback.
 */
export async function handlePayPalCaptureReversed(
  event: PayPalWebhookEvent & {
    event_type: "PAYMENT.CAPTURE.REVERSED";
    resource: PayPalCapture;
  }
) {
  const capture = event.resource;
  const captureId = capture.id;

  // 1. Find the original order
  const originalOrder = await findOriginalOrderForRefund("paypal", captureId);
  if (!originalOrder) {
    console.error(
      `[PayPal Webhook] Reversal received for unknown capture ${captureId}`
    );
    return;
  }

  // 2. Mark the original order as failed and record the reversal info in metadata
  await db
    .update(ordersSchema)
    .set({
      status: ORDER_STATUSES.FAILED,
      metadata: {
        ...(originalOrder.metadata as Record<string, any>),
        reversalReason:
          "PayPal reversed the payment capture (dispute/chargeback)",
        reversedAt: new Date().toISOString(),
        captureStatus: capture.status,
      },
    })
    .where(eq(ordersSchema.id, originalOrder.id));

  console.warn(
    `[PayPal Webhook] Capture ${captureId} reversed. Order ${originalOrder.id} marked as failed.`
  );

  // 3. Revoke the granted credits (treat as a full refund)
  await revokeBenefitsForRefund(
    originalOrder,
    originalOrder.id,
    toCents(originalOrder.amountTotal)
  );
}

/**
 * Handle PAYMENT.CAPTURE.DENIED / PAYMENT.CAPTURE.DECLINED.
 */
export async function handlePayPalCaptureDeniedOrDeclined(
  event:
    | PayPalPaymentCaptureDeclined
    | (PayPalWebhookEvent & {
        event_type: "PAYMENT.CAPTURE.DENIED";
        resource: PayPalCapture;
      })
) {
  const capture = event.resource;
  const captureId = capture.id;

  const originalOrder = await findOriginalOrderForRefund("paypal", captureId);
  if (!originalOrder) {
    console.error(
      `[PayPal Webhook] ${event.event_type} for unknown capture ${captureId}`
    );
    return;
  }

  const newStatus =
    event.event_type === "PAYMENT.CAPTURE.DECLINED"
      ? ORDER_STATUSES.DECLINED
      : ORDER_STATUSES.FAILED;

  await db
    .update(ordersSchema)
    .set({ status: newStatus })
    .where(eq(ordersSchema.id, originalOrder.id));

  console.warn(
    `[PayPal Webhook] Capture ${captureId} ${event.event_type}. Order ${originalOrder.id} marked as ${newStatus}.`
  );
}

/**
 * Handle PAYMENT.CAPTURE.PENDING.
 */
export async function handlePayPalCapturePending(
  event: PayPalPaymentCapturePending
) {
  const capture = event.resource;
  const captureId = capture.id;

  const originalOrder = await findOriginalOrderForRefund("paypal", captureId);
  if (!originalOrder) {
    console.error(
      `[PayPal Webhook] PENDING for unknown capture ${captureId}`
    );
    return;
  }

  await db
    .update(ordersSchema)
    .set({ status: ORDER_STATUSES.PENDING })
    .where(eq(ordersSchema.id, originalOrder.id));

  console.log(
    `[PayPal Webhook] Capture ${captureId} pending. Order ${originalOrder.id} updated.`
  );
}

/**
 * Handle PAYMENT.SALE.DENIED / PAYMENT.SALE.PENDING.
 */
export async function handlePayPalSaleDeniedOrPending(
  event: PayPalPaymentSaleDenied | PayPalPaymentSalePending
) {
  const sale = event.resource;
  const saleId = sale.id;

  const originalOrder = await findOriginalOrderForRefund("paypal", saleId);
  if (!originalOrder) {
    console.error(
      `[PayPal Webhook] ${event.event_type} for unknown sale ${saleId}`
    );
    return;
  }

  const newStatus =
    event.event_type === "PAYMENT.SALE.DENIED"
      ? ORDER_STATUSES.FAILED
      : ORDER_STATUSES.PENDING;

  await db
    .update(ordersSchema)
    .set({ status: newStatus })
    .where(eq(ordersSchema.id, originalOrder.id));

  console.warn(
    `[PayPal Webhook] Sale ${saleId} ${event.event_type}. Order ${originalOrder.id} marked as ${newStatus}.`
  );
}
