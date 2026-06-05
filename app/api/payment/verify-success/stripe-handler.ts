/**
 * Stripe payment verification handlers
 */

import { syncSubscriptionData } from '@/actions/stripe';
import { apiResponse } from '@/lib/api-response';
import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  buildOrderResponse,
  buildSubscriptionResponse,
  getOrderByProviderAndUser,
  getSubscriptionByIdAndUser,
  validateUserIdMatch,
} from './helpers';

/**
 * Handles Stripe subscription verification
 */
async function handleStripeSubscription(
  session: Stripe.Checkout.Session,
  userId: string,
  sessionId: string
): Promise<NextResponse> {
  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id;

  const customerId =
    typeof session.customer === 'string'
      ? session.customer
      : (session.customer as Stripe.Customer)?.id;

  if (!subscriptionId || !customerId) {
    console.error(
      `[Verify API] Missing subscription or customer ID for Stripe session ${sessionId}`
    );
    return apiResponse.serverError('Could not verify subscription details.');
  }

  // Sync subscription data (fallback if webhook hasn't processed yet)
  try {
    await syncSubscriptionData(
      subscriptionId,
      customerId,
      session.metadata || undefined
    );
  } catch (syncError) {
    console.error(
      `[Verify API] Error during Stripe subscription sync for session ${sessionId}:`,
      syncError
    );
  }

  // Retrieve subscription from database
  const subscription = await getSubscriptionByIdAndUser(subscriptionId, userId);

  if (!subscription) {
    console.warn(
      `[Verify API] Stripe subscription ${subscriptionId} not found in DB for user ${userId}. ` +
      'Status might be pending webhook processing.'
    );
    return apiResponse.success({
      message:
        'Payment successful! Subscription activation may take a moment. Please refresh shortly.',
    });
  }

  return buildSubscriptionResponse(subscription);
}

/**
 * Handles Stripe one-time payment verification
 */
async function handleStripePayment(
  session: Stripe.Checkout.Session,
  userId: string
): Promise<NextResponse> {
  if (session.payment_status !== 'paid') {
    return apiResponse.badRequest(
      `Payment status is not paid (${session.payment_status})`
    );
  }

  const paymentIntentId = session.payment_intent
    ? typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent.id
    : session.id;

  const order = await getOrderByProviderAndUser('stripe', paymentIntentId, userId);

  if (!order) {
    console.warn(
      `[Verify API] Stripe order for payment intent ${paymentIntentId} not found via webhook.`
    );
    return apiResponse.success({
      message:
        'Payment successful! Order confirmation may take a moment. Please refresh shortly.',
    });
  }

  return buildOrderResponse(order);
}

/**
 * Main handler for Stripe payment verification
 */
export async function verifyStripePayment(
  req: NextRequest,
  userId: string
): Promise<NextResponse> {
  if (!stripe) {
    return apiResponse.serverError(
      'Stripe is not initialized. Please check your environment variables.'
    );
  }

  const sessionId = req.nextUrl.searchParams.get('session_id');
  if (!sessionId) {
    return apiResponse.badRequest('Missing session_id parameter');
  }

  // Retrieve Stripe checkout session
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'payment_intent', 'subscription'],
  });

  // Validate user ID
  const userIdError = validateUserIdMatch(
    session.metadata?.userId,
    userId,
    sessionId,
    'stripe'
  );
  if (userIdError) return userIdError;

  // Validate session status
  if (session.status !== 'complete') {
    return apiResponse.badRequest(
      `Checkout session status is not complete (${session.status})`
    );
  }

  // Handle based on payment mode
  if (session.mode === 'subscription' && session.subscription) {
    return handleStripeSubscription(session, userId, sessionId);
  }

  if (session.mode === 'payment') {
    return handleStripePayment(session, userId);
  }

  return apiResponse.badRequest('Unsupported Stripe checkout session mode.');
}

