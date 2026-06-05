import { apiResponse } from '@/lib/api-response';
import { isAdmin } from '@/lib/auth/server';
import {
  retrieveCreemDiscount
} from '@/lib/creem/client';
import { getErrorMessage } from '@/lib/error-utils';
import { NextRequest } from 'next/server';

interface VerifyCreemDiscountPayload {
  discountCode: string;
  environment?: 'test' | 'live';
}

function normalizeCreemMode(mode: string | undefined | null) {
  if (!mode) return undefined;
  const normalized = mode === 'prod' ? 'live' : 'test';

  return normalized as 'test' | 'live';
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return apiResponse.forbidden('Admin privileges required.');
  }

  let payload: VerifyCreemDiscountPayload;
  try {
    payload = await request.json();
  } catch {
    return apiResponse.badRequest("Invalid JSON body");
  }

  if (!payload?.discountCode || typeof payload.discountCode !== 'string') {
    return apiResponse.badRequest("Invalid payload");
  }

  try {
    const discount = await retrieveCreemDiscount({ discountCode: payload.discountCode });
    if (!discount) {
      return apiResponse.notFound(
        "Creem discount code not found: " + payload.discountCode
      );
    }

    if (payload.environment) {
      const expected = payload.environment === 'live' ? 'live' : 'test';
      const discountMode = normalizeCreemMode(discount.mode);
      if (discountMode && discountMode !== expected) {
        return apiResponse.badRequest(
          "Creem discount code environment mismatch. Discount code: " + payload.discountCode + " is in " + discountMode + " mode, but expected " + expected + " mode."
        );
      }
    }

    // Check if discount is active
    if (discount.status !== 'active') {
      return apiResponse.badRequest(
        "Creem discount code is not active. Status: " + discount.status
      );
    }

    // Check if discount has reached max redemptions
    if (discount.max_redemptions && discount.redeem_count) {
      if (discount.redeem_count >= discount.max_redemptions) {
        return apiResponse.badRequest(
          "Creem discount code has reached maximum redemptions"
        );
      }
    }

    return apiResponse.success({
      id: discount.id,
      code: discount.code,
      name: discount.name,
      type: discount.type,
      amount: discount.amount,
      currency: discount.currency,
      percentage: discount.percentage,
      status: discount.status,
      expiryDate: discount.expiry_date,
      maxRedemptions: discount.max_redemptions,
      redeemCount: discount.redeem_count,
    });
  } catch (error: any) {
    const message = getErrorMessage(error);

    // Handle Creem API specific error responses
    // Creem returns 404 with message array like: ["Could not find discount"]
    if (message.includes('Could not find discount') ||
      message.includes('404') ||
      message.includes('not found')) {
      return apiResponse.notFound(
        `Discount code "${payload.discountCode}" not found or invalid`
      );
    }

    // Handle other bad request errors
    if (message.includes('400') || message.includes('Bad Request')) {
      return apiResponse.badRequest(message);
    }

    return apiResponse.serverError(
      "Failed to verify discount code: " + message
    );
  }
}

