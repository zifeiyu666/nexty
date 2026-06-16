import { syncCreemSubscriptionData } from '@/actions/creem';
import {
  CreemCheckoutCompletedEvent,
  CreemRefundCreatedEvent,
  CreemSubscriptionActiveEvent,
  CreemSubscriptionCanceledEvent,
  CreemSubscriptionExpiredEvent,
  CreemSubscriptionPaidEvent,
  CreemSubscriptionUpdateEvent,
  CreemTransaction
} from '@/lib/creem/types';
import { db } from '@/lib/db';
import {
  orders as ordersSchema,
  pricingPlans as pricingPlansSchema, subscriptions as subscriptionsSchema
} from '@/lib/db/schema';
import {
  revokeOneTimeCredits,
  revokeRemainingSubscriptionCreditsOnEnd,
  revokeSubscriptionCredits,
  upgradeOneTimeCredits,
  upgradeSubscriptionCredits,
} from '@/lib/payments/credit-manager';
import {
  createOrderWithIdempotency,
  findOriginalOrderForRefund,
  refundOrderExists,
  toCurrencyAmount,
  updateOrderStatusAfterRefund,
} from '@/lib/payments/webhook-helpers';
import { eq, InferInsertModel } from 'drizzle-orm';

export async function handleCreemPaymentSucceeded(
  payload: CreemCheckoutCompletedEvent
) {
  const payment = payload.object;

  const metadata = payment.metadata ?? {};
  const order = payment.order;

  const userId = metadata.userId
  const planId = metadata.planId
  const productId = metadata.productId || payment.product?.id

  if (!userId || !planId) {
    console.error(
      `[Creem webhook] Missing critical metadata on payment.succeeded ${payment.id}`,
      metadata
    );
    return;
  }

  if (order.type !== 'onetime') {
    // subscription payments are handled via invoice.paid
    return;
  }

  const orderData: InferInsertModel<typeof ordersSchema> = {
    userId,
    provider: 'creem',
    providerOrderId: order.id,
    status: payment.status === 'completed' ? 'succeeded' : payment.status,
    orderType: 'one_time_purchase', // onetime order
    planId: planId ?? null,
    priceId: null,
    productId: productId ?? null,
    amountSubtotal: toCurrencyAmount(order.sub_total ?? 0),
    amountDiscount: toCurrencyAmount(order.discount_amount ?? 0),
    amountTax: toCurrencyAmount(order.tax_amount ?? 0),
    amountTotal: toCurrencyAmount(order.amount_paid ?? 0),
    currency: order.currency,
    metadata: {
      creemPaymentId: payment.id,
      creemOrderId: order.id,
      creemCustomerId: order.customer,
      creemProductId: order.product,
      productId: productId,
      ...(metadata || {}),
    },
  };

  const { order: insertedOrder, existed } = await createOrderWithIdempotency(
    'creem',
    orderData,
    order.id
  );

  if (existed) {
    return;
  }

  if (!insertedOrder) {
    throw new Error('Failed to insert Creem payment order');
  }

  try {
    // --- [custom] Upgrade the user's benefits---
    await upgradeOneTimeCredits(userId, planId, insertedOrder.id);
    // --- End: [custom] Upgrade the user's benefits ---
  } catch (error) {
    console.error(
      `[Creem webhook] Failed to upgrade credits for user ${userId}, order ${insertedOrder.id}`,
      error
    );
    throw error;
  }
}

export async function handleCreemInvoicePaid(
  payload: CreemSubscriptionPaidEvent
) {
  const subscription = payload.object;
  const metadata = subscription.metadata ?? {};

  const subscriptionId = subscription.id;
  const customerId = subscription.customer.id;
  const productId = subscription.product.id;
  const lastTransaction = subscription.last_transaction as CreemTransaction;
  const orderId = lastTransaction.order;

  let userId = metadata.userId
  let planId = metadata.planId

  if (!userId) {
    throw new Error("User ID is required for subscription payment");
  }

  if (!planId) {
    const [plan] = await db
      .select({ id: pricingPlansSchema.id })
      .from(pricingPlansSchema)
      .where(eq(pricingPlansSchema.creemProductId, productId))
      .limit(1);
    planId = plan?.id ?? null;
  }

  if (!planId) {
    throw new Error(
      `Unable to determine plan for Creem subscription ${subscription.id}`
    );
  }

  const orderData: InferInsertModel<typeof ordersSchema> = {
    userId,
    provider: 'creem',
    providerOrderId: orderId,
    status: lastTransaction.status === 'paid' ? 'succeeded' : lastTransaction.status,
    orderType: subscription.product.billing_type, // recurring
    planId: planId,
    priceId: productId,
    subscriptionId,
    amountSubtotal: toCurrencyAmount(lastTransaction.amount),
    amountDiscount: toCurrencyAmount(lastTransaction.discount_amount),
    amountTax: toCurrencyAmount(lastTransaction.tax_amount),
    amountTotal: toCurrencyAmount(lastTransaction.amount_paid),
    currency: lastTransaction.currency,
    metadata: {
      creemOrderId: orderId,
      creemSubscriptionId: subscriptionId,
      creemCustomerId: customerId,
      productId: productId,
      ...(metadata || {}),
    },
  };

  const { order: insertedOrder, existed } = await createOrderWithIdempotency(
    'creem',
    orderData,
    orderId
  );

  if (!insertedOrder) {
    console.warn(
      `[Creem webhook] Skipping credit grant for subscription ${subscriptionId}`
    );
    throw new Error(
      `[Creem webhook] Failed to insert order for subscription ${subscriptionId}`
    );
  }


  try {
    // [custom] Upgrade the user's benefits
    await upgradeSubscriptionCredits(
      userId,
      planId,
      insertedOrder.id,
      lastTransaction.period_start
    );
    // --- End: [custom] Upgrade the user's benefits ---
  } catch (error) {
    console.error(
      `[Creem webhook] Failed to ${existed ? 'recover' : 'upgrade'} subscription credits for user ${userId}, order ${insertedOrder.id}`,
      error
    );
    throw error;
  }

  try {
    await syncCreemSubscriptionData(subscriptionId, subscription?.metadata);
  } catch (error) {
    console.error(
      `[Creem webhook] Failed to sync subscription ${subscriptionId}`,
      error
    );
    throw error;
  }
}

export async function handleCreemSubscriptionUpdated(
  payload: CreemSubscriptionUpdateEvent | CreemSubscriptionActiveEvent | CreemSubscriptionExpiredEvent | CreemSubscriptionCanceledEvent,
  isDeleted: boolean = false
) {
  const subscription = payload.object
  const subscriptionId = subscription?.id;
  const customerId = subscription?.customer?.id;

  try {
    await syncCreemSubscriptionData(subscriptionId, subscription?.metadata);
    if (isDeleted) {
      // --- [custom] Revoke the user's benefits---
      let userId = subscription.metadata?.userId as string;
      if (!userId) {
        try {
          const storeSubscription = await db
            .select({ userId: subscriptionsSchema.userId })
            .from(subscriptionsSchema)
            .where(eq(subscriptionsSchema.subscriptionId, subscriptionId))
            .limit(1);
          userId = storeSubscription[0]?.userId;
        } catch (err) {
          console.error(`Error retrieving user for subscription ${subscription.id}:`, err);
        }
      }

      revokeRemainingSubscriptionCreditsOnEnd('creem', subscriptionId, userId, subscription.metadata);
      // --- End: [custom] Revoke the user's benefits ---
    }
  } catch (error) {
    console.error(
      `[Creem webhook] Failed to sync subscription ${subscriptionId}`,
      error
    );
    throw error;
  }
}

export async function handleCreemPaymentRefunded(
  payload: CreemRefundCreatedEvent
) {
  const refund = payload.object;
  const refundId = refund.id;
  const orderId = refund.order.id;

  // Check if refund already processed
  const refundExists = await refundOrderExists('creem', refundId);
  if (refundExists) {
    return;
  }

  const originalOrder = await findOriginalOrderForRefund('creem', orderId);

  if (!originalOrder) {
    console.error(
      `[Creem webhook] Refund received for unknown order ${orderId}`
    );
    return;
  }

  const refundAmountCents = Math.abs(refund.refund_amount);
  const paidAmountCents = refund.transaction.amount_paid;

  // Update original order status
  await updateOrderStatusAfterRefund(
    originalOrder.id,
    refundAmountCents,
    paidAmountCents
  );

  const refundData: InferInsertModel<typeof ordersSchema> = {
    userId: originalOrder.userId,
    provider: 'creem',
    providerOrderId: `${refundId}`,
    status: refund.status,
    orderType: 'refund',
    planId: originalOrder.planId,
    productId: originalOrder.productId,
    amountTotal: (-refundAmountCents / 100).toString(),
    currency: originalOrder.currency,
    metadata: {
      creemRefundId: refund.id,
      creemOrderId: refund.order.id,
      ...(refund.checkout.metadata ?? {}),
    },
  };

  const [refundOrder] = await db
    .insert(ordersSchema)
    .values(refundData)
    .returning({ id: ordersSchema.id });

  if (!refundOrder) {
    throw new Error(
      `[Creem webhook] Failed to insert refund order for payment ${refundId}`
    );
  }

  if (originalOrder.subscriptionId) {
    // [custom] Revoke the user's benefits
    await revokeSubscriptionCredits(
      originalOrder,
      refundAmountCents,
      paidAmountCents
    );
    // --- End: [custom] Revoke the user's benefits ---
  } else {
    // [custom] Revoke the user's benefits
    await revokeOneTimeCredits(
      refundAmountCents,
      originalOrder,
      refundOrder.id,
      paidAmountCents
    );
    // --- End: [custom] Revoke the user's benefits ---
  }
}
