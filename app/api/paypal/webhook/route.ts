import { apiResponse } from "@/lib/api-response";
import { getErrorMessage } from "@/lib/error-utils";
import { isPayPalEnabled, PayPalWebhookEvent } from "@/lib/paypal";
import { verifyPayPalWebhookSignature } from "@/lib/paypal/webhook-verify";
import { headers } from "next/headers";
import {
  handlePayPalCaptureCompleted,
  handlePayPalCaptureDeniedOrDeclined,
  handlePayPalCapturePending,
  handlePayPalCaptureRefunded,
  handlePayPalCaptureReversed,
  handlePayPalSaleCompleted,
  handlePayPalSaleDeniedOrPending,
  handlePayPalSaleRefunded,
  handlePayPalSubscriptionActivated,
  handlePayPalSubscriptionCancelled,
  handlePayPalSubscriptionExpired,
  handlePayPalSubscriptionSuspended,
} from "./handlers";

export async function POST(req: Request) {
  // 1. Make sure PayPal is enabled
  if (!isPayPalEnabled) {
    return apiResponse.serverError("PayPal is not configured.");
  }

  // 2. Read the raw body and headers
  const rawBody = await req.text();
  const headerPayload = await headers();

  // Signature verification with exponential backoff retry.
  // Skip verification during local development.
  const skipWebhookVerify = process.env.NODE_ENV === "development";
  if (!skipWebhookVerify) {
    // Extract the PayPal-specific webhook headers
    const webhookHeaders = {
      authAlgo: headerPayload.get("paypal-auth-algo") || "",
      certUrl: headerPayload.get("paypal-cert-url") || "",
      transmissionId: headerPayload.get("paypal-transmission-id") || "",
      transmissionSig: headerPayload.get("paypal-transmission-sig") || "",
      transmissionTime: headerPayload.get("paypal-transmission-time") || "",
    };

    // Ensure the required headers are present
    if (!webhookHeaders.transmissionId || !webhookHeaders.transmissionSig) {
      console.error("[PayPal Webhook] Missing required headers:", {
        transmissionId: webhookHeaders.transmissionId,
        transmissionSig: webhookHeaders.transmissionSig,
      });
      return apiResponse.badRequest("Missing PayPal webhook signature headers.");
    }

    const isValid = await verifyPayPalWebhookSignature(webhookHeaders, rawBody);

    if (!isValid) {
      console.error("[PayPal Webhook] Signature verification failed.");
      return apiResponse.badRequest("Webhook signature verification failed.");
    }
  } else {
    console.warn(
      "[PayPal Webhook] Skipping webhook signature verification (NODE_ENV=development)"
    );
  }

  // Parse the payload
  let payload: PayPalWebhookEvent;
  try {
    payload = JSON.parse(rawBody);
  } catch (error) {
    console.error("[PayPal Webhook] Invalid JSON payload:", error);
    return apiResponse.badRequest("Invalid JSON payload.");
  }

  // Handle the webhook event
  try {
    await processWebhookEvent(payload);
    return apiResponse.success({ received: true });
  } catch (error) {
    console.error(`[PayPal Webhook] Error handling ${payload?.event_type}:`, error);
    const errorMessage = getErrorMessage(error);
    return apiResponse.serverError(`Webhook handler failed: ${errorMessage}`);
  }
}

async function processWebhookEvent(event: PayPalWebhookEvent) {
  const eventType = event.event_type;
  console.log("[PayPal Webhook] Processing event:", eventType);

  switch (eventType) {
    // One-time payment events
    case "CHECKOUT.ORDER.APPROVED":
      // The user approved the payment in the popup, but it has not been captured yet.
      // The capture-order API performs the actual capture; here we only log it.
      console.log("[PayPal Webhook] Order approved, waiting for capture:", event.resource.id);
      break;

    case "PAYMENT.CAPTURE.COMPLETED":
      // Payment capture completed (one-time payment).
      // Acts as a safety net in addition to the capture-order API.
      await handlePayPalCaptureCompleted(event as any);
      break;

    case "PAYMENT.CAPTURE.REFUNDED":
      // Refund completed
      await handlePayPalCaptureRefunded(event as any);
      break;

    case "PAYMENT.CAPTURE.REVERSED":
      // Payment reversed (dispute / chargeback)
      await handlePayPalCaptureReversed(event as any);
      break;

    case "PAYMENT.CAPTURE.DENIED":
    case "PAYMENT.CAPTURE.DECLINED":
      // Payment capture denied / declined
      await handlePayPalCaptureDeniedOrDeclined(event as any);
      break;

    case "PAYMENT.CAPTURE.PENDING":
      // Payment capture became pending (asynchronous settlement)
      await handlePayPalCapturePending(event as any);
      break;

    case "PAYMENT.SALE.REFUNDED":
    case "PAYMENT.SALE.REVERSED":
      // Refund / reversal of a subscription renewal
      await handlePayPalSaleRefunded(event as any);
      break;

    case "PAYMENT.SALE.DENIED":
    case "PAYMENT.SALE.PENDING":
      // Subscription renewal denied / became pending
      await handlePayPalSaleDeniedOrPending(event as any);
      break;

    // Subscription events
    case "BILLING.SUBSCRIPTION.CREATED":
      // Subscription created (waiting for user approval)
      console.log("[PayPal Webhook] Subscription created:", event.resource.id);
      break;

    case "BILLING.SUBSCRIPTION.ACTIVATED":
      // Subscription activated (user approved and billing has started)
      await handlePayPalSubscriptionActivated(event as any);
      break;

    case "BILLING.SUBSCRIPTION.UPDATED":
      // Subscription updated
      console.log("[PayPal Webhook] Subscription updated:", event.resource.id);
      await handlePayPalSubscriptionActivated(event as any);
      break;

    case "BILLING.SUBSCRIPTION.CANCELLED":
      // Subscription cancelled
      await handlePayPalSubscriptionCancelled(event as any);
      break;

    case "BILLING.SUBSCRIPTION.EXPIRED":
      // Subscription expired
      await handlePayPalSubscriptionExpired(event as any);
      break;

    case "BILLING.SUBSCRIPTION.SUSPENDED":
      // Subscription suspended (usually due to a failed payment)
      await handlePayPalSubscriptionSuspended(event as any);
      break;

    case "BILLING.SUBSCRIPTION.PAYMENT.FAILED":
      // Subscription payment failed
      console.warn("[PayPal Webhook] Subscription payment failed:", event.resource.id);
      await handlePayPalSubscriptionSuspended(event as any);
      break;

    case "PAYMENT.SALE.COMPLETED":
      // Subscription renewal succeeded
      await handlePayPalSaleCompleted(event as any);
      break;

    default:
      console.warn(`[PayPal Webhook] Unhandled event type: ${eventType}`);
  }
}
