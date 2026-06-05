import { getErrorMessage } from '@/lib/error-utils';
import {
  CreemCheckout,
  CreemCheckoutSessionCreateParams,
  CreemCustomer,
  CreemDiscount,
  CreemFullSubscription,
  CreemProduct
} from './types';

const CREEM_API_BASE_URL =
  process.env.CREEM_API_BASE_URL ?? 'https://api.creem.io/v1';

const CREEM_API_KEY = process.env.CREEM_API_KEY;
const CREEM_WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET;

export const isCreemEnabled = Boolean(CREEM_API_KEY) && Boolean(CREEM_WEBHOOK_SECRET);

type CreemRequestInit = Omit<RequestInit, 'headers' | 'body'> & {
  headers?: Record<string, string>;
  body?: any;
};

async function creemRequest<T>(
  path: string,
  init: CreemRequestInit = {}
): Promise<T> {
  if (!CREEM_API_KEY) {
    throw new Error(
      'Creem API key is not configured. Set CREEM_API_KEY to enable Creem integration.'
    );
  }

  // const url = new URL(path, CREEM_API_BASE_URL);
  const url = CREEM_API_BASE_URL + path;
  console.log('creemRequest', url.toString());

  const headers: Record<string, string> = {
    'x-api-key': CREEM_API_KEY,
    'Content-Type': 'application/json',
    // Accept: 'application/json',
    ...init.headers,
  };

  const response = await fetch(url.toString(), {
    ...init,
    headers,
    body:
      init.body === undefined || init.body === null
        ? undefined
        : typeof init.body === 'string'
          ? init.body
          : JSON.stringify(init.body),
  });

  if (!response.ok) {
    let errorMessage = `Creem API responded with status ${response.status}`;
    try {
      const errorBody = await response.clone().json();
      if (errorBody?.error?.message) {
        errorMessage = errorBody.error.message;
      } else if (errorBody?.message) {
        // Handle both string and array messages
        if (Array.isArray(errorBody.message)) {
          errorMessage = errorBody.message.join(', ');
        } else {
          errorMessage = errorBody.message;
        }
      }
    } catch {
      const text = await response.text();
      if (text) {
        errorMessage = text;
      }
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function retrieveCreemCustomer({
  email,
  customerId,
}: {
  email?: string;
  customerId?: string;
}): Promise<CreemCustomer> {
  const searchParams = new URLSearchParams();
  if (email) {
    searchParams.set('email', email);
  }
  if (customerId) {
    searchParams.set('customer_id', customerId);
  }
  try {
    return await creemRequest<CreemCustomer>(`/customers?${searchParams.toString()}`, {
      method: 'GET',
    });
  } catch (error) {
    const message = getErrorMessage(error);
    throw new Error(
      `Failed to retrieve Creem customer ${email} ${customerId}: ${message}`
    );
  }
}

export async function createCreemCheckoutSession(params: CreemCheckoutSessionCreateParams): Promise<CreemCheckout> {
  try {
    return await creemRequest<CreemCheckout>('/checkouts', {
      method: 'POST',
      body: params,
    });
  } catch (error) {
    const message = getErrorMessage(error);
    throw new Error(`Failed to create Creem checkout session: ${message}`);
  }
}

export async function retrieveCreemCheckoutSession(
  checkoutId: string
): Promise<CreemCheckout> {
  try {
    return await creemRequest<CreemCheckout>(`/checkouts?checkout_id=${checkoutId}`, {
      method: 'GET',
    });
  } catch (error) {
    const message = getErrorMessage(error);
    throw new Error(
      `Failed to retrieve Creem checkout ${checkoutId}: ${message}`
    );
  }
}

export async function retrieveCreemProduct(
  productId: string
): Promise<CreemProduct> {
  try {
    const result = await creemRequest<any>(
      `/products?product_id=${productId}`,
      { method: 'GET' }
    );

    const product: CreemProduct | undefined = Array.isArray(result)
      ? result[0]
      : Array.isArray(result?.data)
        ? result.data[0]
        : result;

    if (!product || !product.id) {
      throw new Error(`Creem product ${productId} not found.`);
    }

    return product;
  } catch (error) {
    const message = getErrorMessage(error);
    throw new Error(`Failed to retrieve Creem product ${productId}: ${message}`);
  }
}

export async function retrieveCreemSubscription(
  subscriptionId: string
): Promise<CreemFullSubscription> {
  try {
    return await creemRequest<CreemFullSubscription>(
      `/subscriptions?subscription_id=${subscriptionId}`,
      { method: 'GET' }
    );
  } catch (error) {
    const message = getErrorMessage(error);
    throw new Error(
      `Failed to retrieve Creem subscription ${subscriptionId}: ${message}`
    );
  }
}

export async function createCreemCustomerPortalLink(
  customerId: string
): Promise<string> {
  try {
    const response = await creemRequest<{ customer_portal_link: string }>(
      '/customers/billing',
      {
        method: 'POST',
        body: {
          customer_id: customerId,
        },
      }
    );

    if (!response.customer_portal_link) {
      throw new Error('Portal link not returned from Creem API');
    }

    return response.customer_portal_link;
  } catch (error) {
    const message = getErrorMessage(error);
    throw new Error(
      `Failed to create Creem customer portal link for ${customerId}: ${message}`
    );
  }
}

export async function retrieveCreemDiscount({
  discountId,
  discountCode,
}: {
  discountId?: string;
  discountCode?: string;
}): Promise<CreemDiscount> {
  const searchParams = new URLSearchParams();
  if (discountId) {
    searchParams.set('discount_id', discountId);
  }
  if (discountCode) {
    searchParams.set('discount_code', discountCode);
  }

  if (!discountId && !discountCode) {
    throw new Error('Either discountId or discountCode must be provided');
  }

  try {
    return await creemRequest<CreemDiscount>(`/discounts?${searchParams.toString()}`, {
      method: 'GET',
    });
  } catch (error) {
    const message = getErrorMessage(error);
    throw new Error(
      `Failed to retrieve Creem discount ${discountId || discountCode}: ${message}`
    );
  }
}
