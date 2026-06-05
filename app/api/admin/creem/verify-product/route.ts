import { apiResponse } from '@/lib/api-response';
import { isAdmin } from '@/lib/auth/server';
import {
  isCreemEnabled,
  retrieveCreemProduct,
} from '@/lib/creem/client';
import { getErrorMessage } from '@/lib/error-utils';
import { NextRequest } from 'next/server';

interface VerifyCreemProductPayload {
  productId: string;
  environment?: 'test' | 'live';
}

function normalizeCreemMode(mode: string | undefined | null) {
  if (!mode) return undefined;
  const normalized = mode.toLowerCase();
  if (normalized === 'prod' || normalized === 'live') return 'live';
  if (normalized === 'test' || normalized === 'sandbox') return 'test';
  return normalized as 'test' | 'live';
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return apiResponse.forbidden('Admin privileges required.');
  }

  let payload: VerifyCreemProductPayload;
  try {
    payload = await request.json();
  } catch {
    return apiResponse.badRequest("Invalid JSON body");
  }

  if (!payload?.productId || typeof payload.productId !== 'string') {
    return apiResponse.badRequest("Invalid payload");
  }

  if (!isCreemEnabled) {
    return apiResponse.badRequest("Creem is not enabled. Please check your environment variables.");
  }

  try {
    const product = await retrieveCreemProduct(payload.productId);
    if (!product) {
      return apiResponse.notFound(
        "Creem product not found: " + payload.productId
      );
    }

    if (payload.environment) {
      const expected = payload.environment === 'live' ? 'live' : 'test';
      const productMode = normalizeCreemMode(product.mode);
      if (productMode && productMode !== expected) {
        return apiResponse.badRequest(
          "Creem product environment mismatch. Product: " + payload.productId + " is in " + productMode + " mode, but expected " + expected + " mode."
        );
      }
    }

    return apiResponse.success({
      productId: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency ?? null,
      billingType: product.billing_type ?? null,
      billingPeriod: product.billing_period ?? null,
    });
  } catch (error) {
    const message = getErrorMessage(error);
    return apiResponse.serverError(
      "Failed to verify Creem product: " + message
    );
  }
}

