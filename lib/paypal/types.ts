// PayPal Order (one-time payment)
export interface PayPalOrder {
  id: string;
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED' | 'PAYER_ACTION_REQUIRED';
  intent: 'CAPTURE' | 'AUTHORIZE';
  purchase_units: PayPalPurchaseUnit[];
  payer?: PayPalPayer;
  create_time: string;
  update_time: string;
  links: PayPalLink[];
}

export interface PayPalPurchaseUnit {
  reference_id?: string;
  amount: {
    currency_code: string;
    value: string;
    breakdown?: {
      item_total?: { currency_code: string; value: string };
      discount?: { currency_code: string; value: string };
      tax_total?: { currency_code: string; value: string };
    };
  };
  description?: string;
  custom_id?: string;  // Pipe-delimited IDs (format: "userId|planId|submitProductId"), decoded via decodePayPalCustomId()
  payments?: {
    captures?: PayPalCapture[];
    refunds?: PayPalRefundDetail[];
  };
}

export interface PayPalCapture {
  id: string;
  status: 'COMPLETED' | 'DECLINED' | 'PARTIALLY_REFUNDED' | 'PENDING' | 'REFUNDED' | 'FAILED';
  amount: { currency_code: string; value: string };
  custom_id?: string;
  seller_receivable_breakdown?: {
    gross_amount: { currency_code: string; value: string };
    paypal_fee: { currency_code: string; value: string };
    net_amount: { currency_code: string; value: string };
  };
  create_time: string;
}

export interface PayPalPayer {
  email_address: string;
  payer_id: string;
  name?: { given_name: string; surname: string };
}

export interface PayPalLink {
  href: string;
  rel: string;
  method: string;
}

// PayPal Subscription
export interface PayPalSubscription {
  id: string;
  status: 'APPROVAL_PENDING' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';
  plan_id: string;
  subscriber?: {
    email_address: string;
    payer_id: string;
    name?: { given_name: string; surname: string };
  };
  billing_info?: {
    cycle_executions: Array<{
      tenure_type: string;
      sequence: number;
      cycles_completed: number;
      cycles_remaining: number;
      total_cycles: number;
    }>;
    last_payment?: {
      amount: { currency_code: string; value: string };
      time: string;
    };
    next_billing_time?: string;
  };
  custom_id?: string;
  create_time: string;
  update_time: string;
  links: PayPalLink[];
}

// PayPal Capture result (the return value of capturing an order)
export interface PayPalCaptureResult {
  id: string;
  status: 'COMPLETED' | 'DECLINED' | 'PARTIALLY_REFUNDED' | 'PENDING' | 'REFUNDED' | 'FAILED';
  purchase_units: PayPalPurchaseUnit[];
  payer: PayPalPayer;
}

// PayPal Refund
export interface PayPalRefundDetail {
  id: string;
  status: 'CANCELLED' | 'FAILED' | 'PENDING' | 'COMPLETED';
  amount: { currency_code: string; value: string };
  create_time: string;
}

// PayPal Webhook Event
export interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource_type: string;
  resource: any;
  create_time: string;
  summary: string;
}

// Specific webhook event resource types
export type PayPalCheckoutOrderApproved = PayPalWebhookEvent & {
  event_type: 'CHECKOUT.ORDER.APPROVED';
  resource: PayPalOrder;
};

export type PayPalPaymentCaptureCompleted = PayPalWebhookEvent & {
  event_type: 'PAYMENT.CAPTURE.COMPLETED';
  resource: PayPalCapture & {
    custom_id?: string;
    supplementary_data?: {
      related_ids?: {
        order_id?: string;
      };
    };
  };
};

export type PayPalPaymentCaptureRefunded = PayPalWebhookEvent & {
  event_type: 'PAYMENT.CAPTURE.REFUNDED';
  resource: PayPalRefundDetail & {
    custom_id?: string;
    links: PayPalLink[];
  };
};

export type PayPalPaymentCaptureDeclined = PayPalWebhookEvent & {
  event_type: 'PAYMENT.CAPTURE.DECLINED';
  resource: PayPalCapture & {
    custom_id?: string;
    supplementary_data?: {
      related_ids?: {
        order_id?: string;
      };
    };
  };
};

export type PayPalPaymentCapturePending = PayPalWebhookEvent & {
  event_type: 'PAYMENT.CAPTURE.PENDING';
  resource: PayPalCapture & {
    custom_id?: string;
    supplementary_data?: {
      related_ids?: {
        order_id?: string;
      };
    };
  };
};

export type PayPalBillingSubscriptionActivated = PayPalWebhookEvent & {
  event_type: 'BILLING.SUBSCRIPTION.ACTIVATED';
  resource: PayPalSubscription;
};

export type PayPalBillingSubscriptionCancelled = PayPalWebhookEvent & {
  event_type: 'BILLING.SUBSCRIPTION.CANCELLED';
  resource: PayPalSubscription;
};

export type PayPalBillingSubscriptionExpired = PayPalWebhookEvent & {
  event_type: 'BILLING.SUBSCRIPTION.EXPIRED';
  resource: PayPalSubscription;
};

export type PayPalBillingSubscriptionSuspended = PayPalWebhookEvent & {
  event_type: 'BILLING.SUBSCRIPTION.SUSPENDED';
  resource: PayPalSubscription;
};

export type PayPalBillingSubscriptionPaymentFailed = PayPalWebhookEvent & {
  event_type: 'BILLING.SUBSCRIPTION.PAYMENT.FAILED';
  resource: PayPalSubscription;
};

/**
 * The legacy v1 Payments "sale" resource structure used when PAYMENT.SALE.*
 * events are triggered by subscription renewals. It differs from the modern v2
 * Capture resource:
 * - the subscription ID field is `billing_agreement_id` (not `subscription_id`)
 * - the amount fields are `amount.total` + `amount.currency` (not `value` +
 *   `currency_code`)
 * - the custom field was historically `custom`; in recent years PayPal also
 *   passes `custom_id` for subscriptions, so both may appear and need fallback
 *   handling when read
 */
export interface PayPalSaleResource {
  id: string;
  state: 'completed' | 'partially_refunded' | 'refunded' | 'denied' | 'pending';
  amount: { total: string; currency: string };
  billing_agreement_id?: string;
  parent_payment?: string;
  custom?: string;
  custom_id?: string;
  create_time: string;
  update_time?: string;
  links?: PayPalLink[];
}

export type PayPalPaymentSaleCompleted = PayPalWebhookEvent & {
  event_type: 'PAYMENT.SALE.COMPLETED';
  resource: PayPalSaleResource;
};

export type PayPalPaymentSaleRefunded = PayPalWebhookEvent & {
  event_type: 'PAYMENT.SALE.REFUNDED';
  resource: {
    id: string;
    state: 'completed' | 'pending' | 'failed';
    amount: { total: string; currency: string };
    sale_id?: string;
    parent_payment?: string;
    custom?: string;
    custom_id?: string;
    create_time: string;
    links?: PayPalLink[];
  };
};

export type PayPalPaymentSaleReversed = PayPalWebhookEvent & {
  event_type: 'PAYMENT.SALE.REVERSED';
  resource: PayPalPaymentSaleRefunded['resource'];
};

export type PayPalPaymentSaleDenied = PayPalWebhookEvent & {
  event_type: 'PAYMENT.SALE.DENIED';
  resource: PayPalSaleResource;
};

export type PayPalPaymentSalePending = PayPalWebhookEvent & {
  event_type: 'PAYMENT.SALE.PENDING';
  resource: PayPalSaleResource;
};

// PayPal API response types
export interface PayPalAccessTokenResponse {
  access_token: string;
  token_type: string;
  app_id: string;
  expires_in: number;
  nonce: string;
}

// PayPal Plan details (used for validation)
export interface PayPalPlan {
  id: string;
  name: string;
  status: 'CREATED' | 'INACTIVE' | 'ACTIVE';
  description?: string;
  billing_cycles: Array<{
    frequency: {
      interval_unit: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
      interval_count: number;
    };
    tenure_type: 'REGULAR' | 'TRIAL';
    sequence: number;
    total_cycles: number;
    pricing_scheme: {
      fixed_price: {
        currency_code: string;
        value: string;
      };
    };
  }>;
  payment_preferences: {
    auto_bill_outstanding: boolean;
    setup_fee?: {
      currency_code: string;
      value: string;
    };
    setup_fee_failure_action: 'CONTINUE' | 'CANCEL';
    payment_failure_threshold: number;
  };
}
