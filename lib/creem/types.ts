export type CreemCheckoutMode = 'onetime' | 'subscription';

export interface CreemPayment {
  id: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded';
  amount: number;
  currency: string;
  mode: CreemCheckoutMode;
  productId?: string;
  requestId?: string;
  customerId?: string;
  subscriptionId?: string | null;
  checkoutSessionId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Base event type
interface BaseEvent<T> {
  id: string;
  eventType: string;
  created_at: number;
  object: T;
}

// Base Object
interface BaseObject {
  id: string;
  object: string;
  created_at: string;
  updated_at: string;
  mode: 'test' | 'prod' | 'sandbox';
}

// Discount type
export interface CreemDiscount {
  id: string;
  mode: 'test' | 'prod' | 'sandbox';
  object: 'discount';
  status: 'active' | 'draft' | 'expired' | 'scheduled';
  name: string;
  code: string;
  type: 'percentage' | 'fixed';
  amount?: number;
  currency?: string;
  percentage?: number;
  expiry_date?: string;
  max_redemptions?: number;
  duration?: 'forever' | 'once' | 'repeating';
  duration_in_months?: number;
  applies_to_products?: string[];
  redeem_count?: number;
}

interface Metadata {
  custom_data?: string;
  internal_customer_id?: string;
  [key: string]: any;
}

export interface CreemInvoice {
  id: string;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void' | 'refunded';
  subscriptionId?: string;
  customerId: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  billingReason?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  dueDate?: string | null;
  nextPaymentAttempt?: string | null;
}

export interface CreemCheckoutSessionCreateParams {
  product_id: string;
  units?: number;
  discount_code?: string;
  customer?: {
    id?: string;
    email?: string;
  },
  success_url: string;
  request_id?: string;
  metadata?: Record<string, any>;
}

// Product type
export interface CreemProduct extends BaseObject {
  object: 'product';
  name: string;
  description: string;
  price: number;
  currency: string;
  billing_type: 'recurring' | 'onetime';
  billing_period: 'once' | 'every-month' | 'every-year' | string;
  status: 'active' | 'inactive' | string;
  tax_mode: 'exclusive' | 'inclusive' | string;
  tax_category: string;
  default_success_url: string;
}

// Checkout type
export interface CreemCheckout extends BaseObject {
  object: 'checkout';
  request_id?: string;
  order: CreemOrder;
  product: CreemProduct;
  customer: CreemCustomer;
  subscription?: CreemFullSubscription;
  custom_fields: any[];
  status: 'pending' | 'processing' | 'completed' | 'expired';
  units: number;
  success_url?: string;
  checkout_url?: string;
  metadata?: Metadata;
}

// Order type
export interface CreemOrder extends BaseObject {
  object: 'order';
  customer: string;
  product: string;
  amount: number;
  currency: string;
  status: string;
  type: 'recurring' | 'onetime';
  sub_total?: number;
  discount_amount?: number;
  tax_amount?: number;
  amount_due?: number;
  amount_paid?: number;
  transaction?: string;
}

// Refund type
export interface CreemRefund extends BaseObject {
  object: 'refund';
  status: string;
  refund_amount: number;
  refund_currency: string;
  reason: string;
  transaction: CreemTransaction;
  subscription?: CreemFullSubscription;
  checkout: CreemCheckout;
  order: CreemOrder;
  customer: CreemCustomer;
}

// Customer type
export interface CreemCustomer extends BaseObject {
  object: 'customer';
  email: string;
  name: string;
  country: string;
}

// Subscription item type
export interface CreemSubscriptionItem extends BaseObject {
  object: 'subscription_item';
  product_id: string;
  price_id: string;
  units: number;
}

// Transaction type
export interface CreemTransaction extends BaseObject {
  object: 'transaction';
  amount: number;
  amount_paid: number;
  discount_amount: number;
  currency: string;
  type: 'invoice';
  tax_country: string;
  tax_amount: number;
  status: string;
  refunded_amount: number;
  order: string;
  subscription?: string;
  customer?: string;
  description: string;
  period_start: number;
  period_end: number;
}

// Base subscription type
interface BaseSubscription extends BaseObject {
  object: 'subscription';
  product: CreemProduct;
  customer: CreemCustomer;
  collection_method: 'charge_automatically' | 'send_invoice';
  status: 'active' | 'canceled' | 'unpaid' | 'trialing' | 'paused' | 'scheduled_cancel';
  canceled_at: string | null;
  metadata?: Metadata;
}

// Full subscription type (includes transaction date information)
export interface CreemFullSubscription extends BaseSubscription {
  last_transaction?: CreemTransaction;
  last_transaction_id?: string;
  last_transaction_date?: string;
  next_transaction_date?: string;
  current_period_start_date: string;
  current_period_end_date: string;
  items?: CreemSubscriptionItem[];
}

// Specific event type
export interface CreemCheckoutCompletedEvent extends BaseEvent<CreemCheckout> {
  eventType: 'checkout.completed';
}

export interface CreemSubscriptionActiveEvent extends BaseEvent<CreemFullSubscription> {
  eventType: 'subscription.active';
}

export interface CreemSubscriptionPaidEvent extends BaseEvent<CreemFullSubscription> {
  eventType: 'subscription.paid';
}

export interface CreemSubscriptionCanceledEvent extends BaseEvent<CreemFullSubscription> {
  eventType: 'subscription.canceled';
}

export interface CreemSubscriptionExpiredEvent extends BaseEvent<CreemFullSubscription> {
  eventType: 'subscription.expired';
}

export interface CreemSubscriptionUpdateEvent extends BaseEvent<CreemFullSubscription> {
  eventType: 'subscription.update';
}

export interface CreemSubscriptionTrialingEvent extends BaseEvent<CreemFullSubscription> {
  eventType: 'subscription.trialing';
}

export interface CreemSubscriptionPausedEvent extends BaseEvent<CreemFullSubscription> {
  eventType: 'subscription.paused';
}

export interface CreemRefundCreatedEvent extends BaseEvent<CreemRefund> {
  eventType: 'refund.created';
}

// Union event type
export type CreemWebhookEvent =
  | CreemCheckoutCompletedEvent
  | CreemSubscriptionActiveEvent
  | CreemSubscriptionPaidEvent
  | CreemSubscriptionCanceledEvent
  | CreemSubscriptionExpiredEvent
  | CreemSubscriptionUpdateEvent
  | CreemSubscriptionTrialingEvent
  | CreemSubscriptionPausedEvent
  | CreemRefundCreatedEvent;

