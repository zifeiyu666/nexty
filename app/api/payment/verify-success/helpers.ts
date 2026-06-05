/**
 * Helper functions for database queries, validation, and response building
 */

import { apiResponse } from '@/lib/api-response';
import { db } from '@/lib/db';
import { orders as ordersSchema, subscriptions as subscriptionsSchema } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import type { OrderData, Provider, SubscriptionData } from './types';

// ============================================================================
// Database Queries
// ============================================================================

/**
 * Retrieves a subscription from the database by subscription ID and user ID
 */
export async function getSubscriptionByIdAndUser(
  subscriptionId: string,
  userId: string
): Promise<SubscriptionData | null> {
  const [subscription] = await db
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
        eq(subscriptionsSchema.userId, userId)
      )
    )
    .limit(1);

  return subscription || null;
}

/**
 * Retrieves an order from the database by provider, order ID, and user ID
 */
export async function getOrderByProviderAndUser(
  provider: Provider,
  providerOrderId: string,
  userId: string
): Promise<OrderData | null> {
  const [order] = await db
    .select({
      id: ordersSchema.id,
      metadata: ordersSchema.metadata,
      status: ordersSchema.status,
    })
    .from(ordersSchema)
    .where(
      and(
        eq(ordersSchema.provider, provider),
        eq(ordersSchema.providerOrderId, providerOrderId),
        eq(ordersSchema.userId, userId),
        eq(ordersSchema.orderType, 'one_time_purchase')
      )
    )
    .limit(1);

  return order || null;
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validates that the user ID in metadata matches the authenticated user
 */
export function validateUserIdMatch(
  metadataUserId: string | undefined,
  authenticatedUserId: string,
  sessionId: string,
  provider: Provider
): NextResponse | null {
  if (metadataUserId && metadataUserId !== authenticatedUserId) {
    console.warn(
      `[Verify API] User ID mismatch for ${provider} session ${sessionId}. ` +
      `Auth User: ${authenticatedUserId}, Meta User: ${metadataUserId}`
    );
    return apiResponse.forbidden('User ID mismatch.');
  }
  return null;
}

// ============================================================================
// Response Builders
// ============================================================================

/**
 * Builds a response based on subscription status
 */
export function buildSubscriptionResponse(subscription: SubscriptionData): NextResponse {
  const metadata = subscription.metadata as any;

  if (subscription.status === 'active' || subscription.status === 'trialing') {
    return apiResponse.success({
      subscriptionId: subscription.id,
      planName: metadata?.planName,
      planId: subscription.planId,
      status: subscription.status,
      message: 'Subscription verified and active.',
    });
  }

  if (subscription.status === 'canceled') {
    return apiResponse.serverError(
      'Subscription was canceled. Maybe your charge was refunded. Please contact support.'
    );
  }

  return apiResponse.success({
    message:
      'Subscription found but not active yet. Please allow a few moments and refresh, or contact support if the problem persists.',
  });
}

/**
 * Builds a response based on order status
 */
export function buildOrderResponse(order: OrderData): NextResponse {
  const metadata = order.metadata as any;

  if (order.status === 'succeeded') {
    return apiResponse.success({
      orderId: order.id,
      planName: metadata?.planName,
      planId: metadata?.planId,
      message: 'Payment verified and order confirmed.',
    });
  }

  if (order.status === 'refunded') {
    return apiResponse.serverError(
      'Payment was refunded. Maybe your charge was refunded. Please contact support.'
    );
  }

  return apiResponse.success({
    message:
      'Payment recorded but not finalized yet. Please refresh in a moment, or contact support if the problem persists.',
  });
}

