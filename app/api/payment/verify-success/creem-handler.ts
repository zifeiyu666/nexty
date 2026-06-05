/**
 * Creem payment verification handlers
 */

import { syncCreemSubscriptionData } from '@/actions/creem';
import { apiResponse } from '@/lib/api-response';
import { retrieveCreemCheckoutSession } from '@/lib/creem/client';
import { NextRequest, NextResponse } from 'next/server';
import {
  buildSubscriptionResponse,
  getOrderByProviderAndUser,
  getSubscriptionByIdAndUser,
  validateUserIdMatch,
} from './helpers';

/**
 * Handles Creem subscription verification
 */
async function handleCreemSubscription(
  session: any,
  userId: string,
  checkoutId: string
): Promise<NextResponse> {
  const subscriptionId = session.subscription?.id;
  const customerId = session.customer.id;

  if (!subscriptionId || !customerId) {
    console.error(
      `[Verify API] Missing subscription or customer ID for Creem session ${checkoutId}`
    );
    return apiResponse.serverError('Could not verify subscription details.');
  }

  // Sync subscription data (fallback if webhook hasn't processed yet)
  try {
    await syncCreemSubscriptionData(subscriptionId, {
      ...session.metadata,
    });
  } catch (syncError) {
    console.error(
      `[Verify API] Error during Creem subscription sync for session ${checkoutId}:`,
      syncError
    );
  }

  // Retrieve subscription from database
  const subscription = await getSubscriptionByIdAndUser(subscriptionId, userId);

  if (!subscription) {
    console.warn(
      `[Verify API] Creem subscription ${subscriptionId} not found in DB for user ${userId}.`
    );
    return apiResponse.success({
      message:
        'Payment successful! Subscription activation may take a moment. Please refresh shortly.',
    });
  }

  return buildSubscriptionResponse(subscription);
}

/**
 * Handles Creem one-time payment verification
 */
async function handleCreemPayment(
  session: any,
  userId: string
): Promise<NextResponse> {
  const orderId = session.order.id;

  const order = await getOrderByProviderAndUser('creem', orderId, userId);

  if (!order) {
    console.warn(
      `[Verify API] Creem order ${orderId} not found via webhook.`
    );
    return apiResponse.success({
      message:
        'Payment successful! Order confirmation may take a moment. Please refresh shortly, or contact support if the problem persists.',
    });
  }

  // Special handling for Creem order statuses
  if (order.status === 'succeeded') {
    const metadata = order.metadata as any;
    return apiResponse.success({
      orderId: order.id,
      planName: metadata?.planName,
      planId: metadata?.planId,
      message: 'Payment verified and order confirmed.',
    });
  }

  if (!['pending', 'processing', 'completed'].includes(order.status)) {
    return apiResponse.serverError(
      'Payment status is not pending, processing, or completed. Please contact support if the problem persists.'
    );
  }

  return apiResponse.success({
    message:
      'Payment recorded but not finalized yet. Please refresh in a moment.',
  });
}

/**
 * Main handler for Creem payment verification
 */
export async function verifyCreemPayment(
  req: NextRequest,
  userId: string
): Promise<NextResponse> {
  const checkoutId = req.nextUrl.searchParams.get('checkout_id');
  if (!checkoutId) {
    return apiResponse.badRequest('Missing checkout_id parameter');
  }

  // Retrieve Creem checkout session
  const session = await retrieveCreemCheckoutSession(checkoutId);

  // Validate user ID
  const userIdError = validateUserIdMatch(
    session.metadata?.userId,
    userId,
    checkoutId,
    'creem'
  );
  if (userIdError) return userIdError;

  // Validate session status
  if (session.status !== 'completed') {
    return apiResponse.badRequest(
      `Checkout session status is not completed (${session.status})`
    );
  }

  // Handle based on order type
  if (session.order.type === 'recurring') {
    return handleCreemSubscription(session, userId, checkoutId);
  }

  if (session.order.type === 'onetime') {
    return handleCreemPayment(session, userId);
  }

  return apiResponse.badRequest(
    `Unsupported Creem checkout session mode: ${session.mode}`
  );
}

