/**
 * Payment verification API route
 * 
 * This endpoint verifies payment success for multiple providers.
 * It handles both subscription and one-time payment verification.
 * 
 * Query Parameters:
 * - provider: 'stripe' | 'creem' (required)
 * - session_id: Stripe checkout session ID (required for Stripe)
 * - checkout_id: Creem checkout session ID (required for Creem)
 */

import { apiResponse } from '@/lib/api-response';
import { getSession } from '@/lib/auth/server';
import { NextRequest } from 'next/server';
import { verifyCreemPayment } from './creem-handler';
import { verifyPayPalPayment } from './paypal-handler';
import { verifyStripePayment } from './stripe-handler';
import type { Provider } from './types';

export async function GET(req: NextRequest) {
  // Authenticate user
  const session = await getSession();
  const user = session?.user;
  if (!user) return apiResponse.unauthorized();

  // Validate provider parameter
  const provider = req.nextUrl.searchParams.get('provider') as Provider | null;
  if (!provider) {
    return apiResponse.badRequest('Missing provider parameter');
  }

  try {
    // Route to appropriate provider handler
    if (provider === 'stripe') {
      return await verifyStripePayment(req, user.id);
    }

    if (provider === 'creem') {
      return await verifyCreemPayment(req, user.id);
    }

    if (provider === 'paypal') {
      return await verifyPayPalPayment(req, user.id);
    }

    return apiResponse.badRequest(`Unsupported payment provider: ${provider}`);
  } catch (error: any) {
    console.error(
      `[Verify API] Error retrieving/verifying ${provider} checkout session:`,
      error
    );
    const clientMessage = error?.message?.includes('No such checkout.session')
      ? 'Invalid session ID.'
      : 'Failed to verify payment.';
    return apiResponse.serverError(clientMessage);
  }
} 