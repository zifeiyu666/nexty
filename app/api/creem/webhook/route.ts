import { handleCreemInvoicePaid, handleCreemPaymentRefunded, handleCreemPaymentSucceeded, handleCreemSubscriptionUpdated } from '@/app/api/creem/webhook/handlers';
import { apiResponse } from '@/lib/api-response';
import { CreemCheckoutCompletedEvent, CreemRefundCreatedEvent, CreemSubscriptionActiveEvent, CreemSubscriptionCanceledEvent, CreemSubscriptionExpiredEvent, CreemSubscriptionPaidEvent, CreemSubscriptionUpdateEvent, CreemWebhookEvent } from '@/lib/creem/types';
import { getErrorMessage } from '@/lib/error-utils';
import * as crypto from 'crypto';
import { headers } from 'next/headers';

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return computedSignature === signature;
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const headerPayload = await headers();
  const signature = headerPayload.get('creem-signature');
  const secret = process.env.CREEM_WEBHOOK_SECRET;

  if (!secret) {
    console.error('CREEM_WEBHOOK_SECRET not configured.');
    return apiResponse.serverError('Webhook secret not configured.');
  }

  if (!signature) {
    console.error('Missing Creem webhook signature header.');
    return apiResponse.badRequest('Missing webhook signature.');
  }

  if (!verifySignature(rawBody, signature, secret)) {
    console.error('Creem webhook signature verification failed.');
    return apiResponse.badRequest('Signature verification failed.');
  }

  let payload
  try {
    payload = JSON.parse(rawBody);
  } catch (error) {
    console.error('Error constructing Creem webhook event:', error);
    return apiResponse.badRequest('Error constructing Creem webhook event.');
  }

  try {
    await processWebhookEvent(payload);
    return apiResponse.success({ received: true });
  } catch (error) {
    console.error(
      `Error handling Creem webhook ${payload?.eventType}:`,
      error
    );
    const message = getErrorMessage(error);
    return apiResponse.serverError(
      `Creem webhook handler failed: ${message}`
    );
  }
}

async function processWebhookEvent(payload: CreemWebhookEvent) {
  const eventType = payload.eventType;
  // console.log('debug creem event', eventType);

  switch (eventType) {
    case 'checkout.completed':
      await handleCreemPaymentSucceeded(payload as CreemCheckoutCompletedEvent);
      break;
    case 'subscription.active':
    case 'subscription.update':
    case 'subscription.expired':
      await handleCreemSubscriptionUpdated(payload as CreemSubscriptionUpdateEvent | CreemSubscriptionActiveEvent | CreemSubscriptionExpiredEvent);
      break;
    case 'subscription.canceled':
      await handleCreemSubscriptionUpdated(payload as CreemSubscriptionCanceledEvent, true);
      break;
    case 'subscription.paid':
      await handleCreemInvoicePaid(payload as CreemSubscriptionPaidEvent);
      break;
    case 'refund.created':
      await handleCreemPaymentRefunded(payload as CreemRefundCreatedEvent);
      break;
    default:
      console.warn(`Unhandled Creem event type: ${eventType}`);
      break;
  }
} 