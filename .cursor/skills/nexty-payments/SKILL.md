---
name: nexty-payments
description: Implement payments in NEXTY.DEV with Stripe or Creem. Use when creating checkout sessions, handling webhooks, managing subscriptions, or working with credits. Covers provider-agnostic patterns and webhook handlers.
---

# Payments in NEXTY.DEV

## Overview

- **Providers**: Stripe, Creem
- **Credit Manager**: `lib/payments/credit-manager.ts`
- **Webhook Helpers**: `lib/payments/webhook-helpers.ts`
- **Provider Utils**: `lib/payments/provider-utils.ts`

## Creating Checkout Sessions

### Stripe Checkout

```typescript
// In a Server Action or API route
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { getOrCreateStripeCustomer } from '@/actions/stripe';

export async function createStripeCheckout(planId: string, userId: string) {
  const customerId = await getOrCreateStripeCustomer(userId);
  
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription', // or 'payment' for one-time
    line_items: [{ price: 'price_xxx', quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
    metadata: {
      userId,
      planId,
    },
  });

  return session.url;
}
```

### Creem Checkout

```typescript
import { createCreemCheckoutSession } from '@/lib/creem/client';

export async function createCreemCheckout(planId: string, userId: string, email: string) {
  const checkout = await createCreemCheckoutSession({
    product_id: 'prod_xxx',
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`,
    request_id: `${userId}-${Date.now()}`,
    metadata: {
      userId,
      planId,
    },
    customer: { email },
  });

  return checkout.checkout_url;
}
```

## Handling Webhooks

### Stripe Webhook Pattern

```typescript
// app/api/stripe/webhook/route.ts
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { handleCheckoutSessionCompleted, handleInvoicePaid } from './webhook-handlers';

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response('Webhook Error', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;
      // ... other events
    }
  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response('Webhook handler failed', { status: 500 });
  }

  return new Response('OK', { status: 200 });
}
```

### Creem Webhook Pattern

```typescript
// app/api/creem/webhook/route.ts
import { headers } from 'next/headers';
import { handleCreemPaymentSucceeded, handleCreemInvoicePaid } from './handlers';

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('creem-signature');

  // Verify signature with CREEM_WEBHOOK_SECRET
  // ... verification logic

  const payload = JSON.parse(body);

  switch (payload.eventType) {
    case 'checkout.completed':
      await handleCreemPaymentSucceeded(payload);
      break;
    case 'subscription.paid':
      await handleCreemInvoicePaid(payload);
      break;
    // ... other events
  }

  return new Response('OK', { status: 200 });
}
```

## Credit Management

### Grant Credits (One-Time Purchase)

```typescript
import { upgradeOneTimeCredits } from '@/lib/payments/credit-manager';

// After successful payment
await upgradeOneTimeCredits(userId, planId, orderId);
```

### Grant Subscription Credits

```typescript
import { upgradeSubscriptionCredits } from '@/lib/payments/credit-manager';

// After subscription payment
await upgradeSubscriptionCredits(
  userId,
  planId,
  orderId,
  currentPeriodStart // Date
);
```

### Revoke Credits (Refund)

```typescript
import { revokeOneTimeCredits, revokeSubscriptionCredits } from '@/lib/payments/credit-manager';

// For one-time refund
await revokeOneTimeCredits(refundAmountCents, originalOrder, refundOrderId);

// For subscription refund
await revokeSubscriptionCredits(originalOrder);
```

### Deduct Credits (Usage)

```typescript
import { deductCredits } from '@/actions/usage/deduct';

// When user uses a feature
const result = await deductCredits(10, 'AI generation - 10 credits');

if (!result.success) {
  // Handle insufficient credits
  toast.error(result.error);
}
```

### Get User Benefits

```typescript
import { getUserBenefits } from '@/actions/usage/benefits';
import { getClientUserBenefits } from '@/actions/usage/deduct';

// Server-side
const benefits = await getUserBenefits(userId);

// Client-side (through action)
const result = await getClientUserBenefits();
if (result.success) {
  const { oneTimeCredits, subscriptionCredits, totalCredits } = result.data;
}
```

## Order Management

### Create Order with Idempotency

```typescript
import { createOrderWithIdempotency } from '@/lib/payments/webhook-helpers';

const result = await createOrderWithIdempotency('stripe', {
  userId,
  providerOrderId: paymentIntentId,
  orderType: 'one_time',
  status: 'completed',
  planId,
  amountTotal: amount,
  currency: 'usd',
  metadata: { ... },
}, `stripe-${paymentIntentId}`);

if (result.alreadyExists) {
  // Order was already processed
  return;
}
```

### Query Orders

```typescript
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// Get user orders
const userOrders = await db.select()
  .from(orders)
  .where(eq(orders.userId, userId))
  .orderBy(desc(orders.createdAt));
```

## Subscription Management

### Create Customer Portal Session

```typescript
// Stripe Portal
import { createStripePortalSession } from '@/actions/stripe';
const portalUrl = await createStripePortalSession();

// Creem Portal
import { createCreemPortalSession } from '@/actions/creem/portal';
const portalUrl = await createCreemPortalSession();
```

### Query Subscriptions

```typescript
import { db } from '@/lib/db';
import { subscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const [subscription] = await db.select()
  .from(subscriptions)
  .where(eq(subscriptions.userId, userId))
  .limit(1);

if (subscription?.status === 'active') {
  // User has active subscription
}
```

## Pricing Plans

### Query Plans

```typescript
import { db } from '@/lib/db';
import { pricingPlans } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const plans = await db.select()
  .from(pricingPlans)
  .where(
    and(
      eq(pricingPlans.isActive, true),
      eq(pricingPlans.environment, 'live')
    )
  )
  .orderBy(pricingPlans.displayOrder);
```

### Plan Benefits Structure

```typescript
// In pricingPlans.benefitsJsonb
{
  "oneTimeCredits": 100,      // For one-time purchases
  "monthlyCredits": 50,        // For monthly subscriptions
  "totalMonths": 12,           // For yearly subscriptions
  "customFeature": true        // Custom benefits
}
```

## Payment Type Helpers

```typescript
import {
  isSubscriptionOrder,
  isOneTimePurchase,
  isMonthlyInterval,
  isYearlyInterval,
  normalizeRecurringInterval,
} from '@/lib/payments/provider-utils';

// Check order type
if (isSubscriptionOrder(order.orderType)) {
  // Handle subscription
}

if (isOneTimePurchase(order.orderType)) {
  // Handle one-time
}

// Check interval
if (isMonthlyInterval(subscription.interval)) {
  // Monthly subscription
}
```

## Environment Variables

```
# Stripe
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_CUSTOMER_PORTAL_URL

# Creem
CREEM_API_KEY
CREEM_WEBHOOK_SECRET
CREEM_API_BASE_URL
```

## Money Calculation

⚠️ **Use integers (cents) for all calculations** - JS floats lose precision (`19.99 * 3 = 59.97000000000001`)

```typescript
import { toCurrencyAmount, toCents } from '@/lib/payments/webhook-helpers';
toCurrencyAmount(1999); // "19.99"
toCents("19.99");       // 1999
```

> See `./money-calculation.md` for details

## Checklist

1. Store `userId` and `planId` in checkout metadata
2. Use `createOrderWithIdempotency` to prevent duplicates
3. Handle all relevant webhook events
4. Use credit manager for consistent credit operations
5. Log errors with context (userId, orderId)
6. Test webhooks locally with CLI tools
7. Verify webhook signatures before processing
8. Use integers (cents) for money calculations

