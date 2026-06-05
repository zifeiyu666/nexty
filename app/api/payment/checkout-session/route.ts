import { createStripeCheckoutSession } from '@/actions/stripe';
import { apiResponse } from '@/lib/api-response';
import { getSession } from '@/lib/auth/server';
import {
  createCreemCheckoutSession
} from '@/lib/creem/client';
import { db } from '@/lib/db';
import { pricingPlans as pricingPlansSchema } from '@/lib/db/schema';
import { getErrorMessage } from '@/lib/error-utils';
import { createPayPalSubscription, isPayPalEnabled } from '@/lib/paypal';
import { getURL } from '@/lib/url';
import { eq } from 'drizzle-orm';

type RequestData = {
  provider?: string;
  stripePriceId?: string;
  creemProductId?: string;
  planId?: string;
  couponCode?: string;
  referral?: string;
};

export async function POST(req: Request) {
  const session = await getSession();
  const user = session?.user;
  if (!user) {
    return apiResponse.unauthorized();
  }

  let requestData: RequestData;
  try {
    requestData = await req.json();
  } catch (error) {
    console.error('Invalid request body:', error);
    return apiResponse.badRequest();
  }

  const provider = requestData.provider;

  try {
    if (provider === 'stripe') {
      const { stripePriceId } = requestData;
      if (!stripePriceId) {
        return apiResponse.badRequest('Missing stripePriceId');
      }
      const result = await createStripeCheckoutSession({
        userId: user.id,
        priceId: stripePriceId,
        couponCode: requestData.couponCode,
        referral: requestData.referral,
      });
      return apiResponse.success(result);
    }

    if (provider === 'creem') {
      const { creemProductId, couponCode } = requestData;
      if (!creemProductId) {
        return apiResponse.badRequest('Missing creemProductId');
      }

      const results = await db
        .select({
          id: pricingPlansSchema.id,
          cardTitle: pricingPlansSchema.cardTitle,
          paymentType: pricingPlansSchema.paymentType,
          trialPeriodDays: pricingPlansSchema.trialPeriodDays,
          creemProductId: pricingPlansSchema.creemProductId,
        })
        .from(pricingPlansSchema)
        .where(eq(pricingPlansSchema.creemProductId, creemProductId))
        .limit(1);

      const plan = results[0];

      if (!plan) {
        return apiResponse.notFound('Plan not found for Creem product ID');
      }

      const sessionParams = {
        product_id: creemProductId,
        units: 1,
        discount_code: couponCode,
        customer: {
          // id: customerId,
          email: user.email,
        },
        success_url: getURL(
          'payment/success?provider=creem'
        ),
        metadata: {
          userId: user.id,
          userEmail: user.email,
          planId: plan.id,
          planName: plan.cardTitle,
          productId: plan.creemProductId,
        },
      }

      const sessionPayload = await createCreemCheckoutSession(sessionParams);

      if (!sessionPayload?.id) {
        throw new Error('Creem session creation failed (missing session ID)');
      }

      return apiResponse.success({
        sessionId: sessionPayload.id,
        url: sessionPayload.checkout_url,
      });
    }

    // PayPal subscription handling (one-time PayPal payments use /api/paypal/create-order)
    if (provider === 'paypal') {
      const { planId } = requestData;

      if (!planId) {
        return apiResponse.badRequest('Missing planId for PayPal subscription.');
      }

      if (!isPayPalEnabled) {
        return apiResponse.serverError('PayPal is not configured.');
      }

      // Look up the pricingPlans row to get the paypalPlanId
      const planResults = await db
        .select({
          id: pricingPlansSchema.id,
          cardTitle: pricingPlansSchema.cardTitle,
          paymentType: pricingPlansSchema.paymentType,
          paypalPlanId: pricingPlansSchema.paypalPlanId,
        })
        .from(pricingPlansSchema)
        .where(eq(pricingPlansSchema.id, planId))
        .limit(1);

      const plan = planResults[0];

      if (!plan) {
        return apiResponse.notFound('Plan not found.');
      }

      if (plan.paymentType !== 'recurring') {
        if (!plan.paymentType) {
          return apiResponse.badRequest('Plan payment type is not configured.');
        }
        return apiResponse.badRequest(
          `Invalid paymentType: ${plan.paymentType}. For PayPal one-time payments, use /api/paypal/create-order.`
        );
      }

      if (!plan.paypalPlanId) {
        return apiResponse.badRequest(
          'PayPal Plan ID is not configured for this plan.'
        );
      }

      // Create the PayPal Subscription
      const subscription = await createPayPalSubscription({
        planId: plan.paypalPlanId,
        subscriberEmail: user.email,
        customIdData: {
          userId: user.id,
          planId: plan.id,
          submitProductId: null,
        },
        returnUrl: getURL('payment/success?provider=paypal'),
        cancelUrl: getURL(process.env.NEXT_PUBLIC_PRICING_PATH || '/pricing'),
      });

      // Get the approval URL
      const approvalLink = subscription.links?.find(
        (link) => link.rel === 'approve'
      );

      if (!approvalLink?.href) {
        return apiResponse.serverError('Failed to get PayPal approval URL.');
      }

      return apiResponse.success({
        subscriptionId: subscription.id,
        url: approvalLink.href,
      });
    }

    return apiResponse.badRequest(
      `Unsupported payment provider: ${provider}`
    );
  } catch (error) {
    console.error(
      `Error creating ${provider} checkout session:`,
      error
    );
    const errorMessage = getErrorMessage(error);
    return apiResponse.serverError(errorMessage);
  }
}

