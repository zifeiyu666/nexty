'use server';
import {
  retrieveCreemSubscription
} from '@/lib/creem/client';
import { db } from '@/lib/db';
import {
  pricingPlans as pricingPlansSchema,
  subscriptions as subscriptionsSchema
} from '@/lib/db/schema';
import { eq, InferInsertModel } from 'drizzle-orm';

function toDate(value?: string | null) {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function syncCreemSubscriptionData(
  subscriptionId: string,
  initialMetadata?: Record<string, any>
): Promise<void> {

  const subscription = await retrieveCreemSubscription(subscriptionId);

  const metadata = {
    ...(subscription.metadata ?? {}),
    ...(initialMetadata ?? {}),
  };

  let userId = subscription.metadata?.userId;
  let planId = subscription.metadata?.planId;
  let productId = subscription.product.id;

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

  if (!planId) {
    const [planRow] = await db
      .select({ id: pricingPlansSchema.id })
      .from(pricingPlansSchema)
      .where(eq(pricingPlansSchema.creemProductId, productId))
      .limit(1);
    if (planRow) {
      planId = planRow.id;
    }
  }

  const subscriptionData: InferInsertModel<typeof subscriptionsSchema> = {
    userId,
    planId: planId ?? null,
    provider: 'creem',
    subscriptionId: subscription.id,
    customerId: subscription.customer.id,
    priceId: subscription.items?.[0]?.price_id ?? '',
    productId: productId,
    status: subscription.status,
    currentPeriodStart: toDate(subscription.current_period_start_date),
    currentPeriodEnd: toDate(subscription.current_period_end_date),
    cancelAtPeriodEnd: subscription.status === 'scheduled_cancel',
    canceledAt: toDate(subscription.canceled_at),
    endedAt: subscription.status === 'canceled' ? toDate(subscription.current_period_end_date) : null,
    trialStart: null,
    trialEnd: null,
    metadata: {
      ...metadata,
      creemSubscriptionId: subscription.id,
      creemCustomerId: subscription.customer.id,
      creemProductId: productId,
    },
  };

  const { ...updateData } = subscriptionData;

  await db
    .insert(subscriptionsSchema)
    .values(subscriptionData)
    .onConflictDoUpdate({
      target: subscriptionsSchema.subscriptionId,
      set: updateData,
    });
}

