import {
  ApplicationContextUserAction,
  CheckoutPaymentIntent,
  Client,
  Environment,
  OrderApplicationContextShippingPreference,
  OrdersController,
  PaymentsController,
  SubscriptionsController,
} from "@paypal/paypal-server-sdk";
import {
  encodePayPalCustomId,
  PayPalCustomIdData,
} from "./metadata";
import {
  PayPalAccessTokenResponse,
  PayPalCapture,
  PayPalCaptureResult,
  PayPalOrder,
  PayPalPlan,
  PayPalRefundDetail,
  PayPalSubscription,
} from "./types";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

export function getPayPalApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export const isPayPalEnabled =
  Boolean(PAYPAL_CLIENT_ID) && Boolean(PAYPAL_CLIENT_SECRET);

function createClient(): Client {
  return new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: PAYPAL_CLIENT_ID!,
      oAuthClientSecret: PAYPAL_CLIENT_SECRET!,
    },
    environment:
      process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT === "live"
        ? Environment.Production
        : Environment.Sandbox,
    timeout: 30000,
  });
}

let paypalClient: Client | null = null;

function getClient(): Client {
  if (!paypalClient) {
    paypalClient = createClient();
  }
  return paypalClient;
}

function getOrdersController(): OrdersController {
  if (!isPayPalEnabled) {
    throw new Error("PayPal is not configured.");
  }
  return new OrdersController(getClient());
}

function getPaymentsController(): PaymentsController {
  if (!isPayPalEnabled) {
    throw new Error("PayPal is not configured.");
  }
  return new PaymentsController(getClient());
}

function getSubscriptionsController(): SubscriptionsController {
  if (!isPayPalEnabled) {
    throw new Error("PayPal is not configured.");
  }
  return new SubscriptionsController(getClient());
}

/**
 * Recursively convert the camelCase objects returned by the SDK into snake_case
 * to stay compatible with our existing types.
 */
function camelToSnake(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(camelToSnake);
  }
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = camelToSnake(value);
  }
  return result;
}

/**
 * Get a PayPal access token (used for webhook verification).
 * The SDK manages OAuth internally; this helper is only for the cases that
 * still require a raw fetch.
 */
export async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");

  const response = await fetch(`${getPayPalApiBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayPal OAuth failed with status ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as PayPalAccessTokenResponse;
  return data.access_token;
}

/**
 * Create a PayPal Order (one-time payment).
 */
export async function createPayPalOrder(params: {
  amount: string;
  currency: string;
  description: string;
  customIdData: PayPalCustomIdData;
}): Promise<PayPalOrder> {
  const controller = getOrdersController();
  const customId = encodePayPalCustomId(params.customIdData);

  const response = await controller.createOrder({
    body: {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          amount: {
            currencyCode: params.currency,
            value: params.amount,
          },
          description: params.description,
          customId,
        },
      ],
      applicationContext: {
        shippingPreference: OrderApplicationContextShippingPreference.NoShipping,
      },
    },
    prefer: "return=representation",
  });

  return camelToSnake(response.result) as PayPalOrder;
}

/**
 * Capture the payment for a PayPal Order.
 */
export async function capturePayPalOrder(orderId: string): Promise<PayPalCaptureResult> {
  const controller = getOrdersController();

  const response = await controller.captureOrder({
    id: orderId,
    prefer: "return=representation",
  });

  return camelToSnake(response.result) as PayPalCaptureResult;
}

/**
 * Get the details of a PayPal Order.
 */
export async function getPayPalOrder(orderId: string): Promise<PayPalOrder> {
  const controller = getOrdersController();

  const response = await controller.getOrder({
    id: orderId,
  });

  return camelToSnake(response.result) as PayPalOrder;
}

/**
 * Create a PayPal Subscription.
 */
export async function createPayPalSubscription(params: {
  planId: string;
  subscriberEmail: string;
  customIdData: PayPalCustomIdData;
  returnUrl: string;
  cancelUrl: string;
}): Promise<PayPalSubscription> {
  const controller = getSubscriptionsController();
  const customId = encodePayPalCustomId(params.customIdData);

  const response = await controller.createSubscription({
    body: {
      planId: params.planId,
      subscriber: {
        emailAddress: params.subscriberEmail,
      },
      customId,
      applicationContext: {
        returnUrl: params.returnUrl,
        cancelUrl: params.cancelUrl,
        userAction: ApplicationContextUserAction.SubscribeNow,
      },
    },
  });

  return camelToSnake(response.result) as PayPalSubscription;
}

/**
 * Get the details of a PayPal Subscription.
 *
 * Note: we use a raw fetch instead of the SDK because the subscriptionSchema in
 * @paypal/paypal-server-sdk v2.3.0 is missing the status field, which causes the
 * object returned by the SDK to have an undefined status.
 */
export async function getPayPalSubscription(subscriptionId: string): Promise<PayPalSubscription> {
  if (!isPayPalEnabled) {
    throw new Error("PayPal is not configured.");
  }

  const accessToken = await getAccessToken();
  const response = await fetch(
    `${getPayPalApiBaseUrl()}/v1/billing/subscriptions/${subscriptionId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `PayPal getSubscription failed with status ${response.status}: ${errorText}`
    );
  }

  return (await response.json()) as PayPalSubscription;
}

/**
 * Cancel a PayPal Subscription.
 */
export async function cancelPayPalSubscription(
  subscriptionId: string,
  reason?: string
): Promise<void> {
  const controller = getSubscriptionsController();

  await controller.cancelSubscription({
    id: subscriptionId,
    body: reason ? { reason } : undefined,
  });
}

/**
 * Suspend a PayPal Subscription.
 */
export async function suspendPayPalSubscription(
  subscriptionId: string,
  reason?: string
): Promise<void> {
  const controller = getSubscriptionsController();

  await controller.suspendSubscription({
    id: subscriptionId,
    body: reason ? { reason } : undefined,
  });
}

/**
 * Reactivate a suspended PayPal Subscription.
 */
export async function activatePayPalSubscription(subscriptionId: string): Promise<void> {
  const controller = getSubscriptionsController();

  await controller.activateSubscription({
    id: subscriptionId,
  });
}

/**
 * Refund a PayPal Capture.
 */
export async function refundPayPalCapture(
  captureId: string,
  amount?: { value: string; currency_code: string }
): Promise<PayPalRefundDetail> {
  const controller = getPaymentsController();

  const response = await controller.refundCapturedPayment({
    captureId,
    body: amount
      ? {
          amount: {
            currencyCode: amount.currency_code,
            value: amount.value,
          },
        }
      : undefined,
  });

  return camelToSnake(response.result) as PayPalRefundDetail;
}

/**
 * Get the details of a PayPal Plan (used to validate a Plan ID).
 */
export async function getPayPalPlan(planId: string): Promise<PayPalPlan> {
  const controller = getSubscriptionsController();

  const response = await controller.getBillingPlan(planId);

  return camelToSnake(response.result) as PayPalPlan;
}

/**
 * Get the capture details associated with a capture ID (used to look up the
 * original capture during a refund).
 */
export async function getPayPalCapture(
  captureId: string
): Promise<PayPalCapture & { custom_id?: string }> {
  const controller = getPaymentsController();

  const response = await controller.getCapturedPayment({
    captureId,
  });

  return camelToSnake(response.result) as PayPalCapture & { custom_id?: string };
}

// Re-export the metadata helpers
export { encodePayPalCustomId, decodePayPalCustomId } from "./metadata";
