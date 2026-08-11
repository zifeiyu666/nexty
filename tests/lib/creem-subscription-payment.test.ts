import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { getCreemSubscriptionPaymentDetails } from "../../lib/creem/subscription-payment";
import type { CreemFullSubscription } from "../../lib/creem/types";

function subscription(
  overrides: Partial<CreemFullSubscription> = {},
): CreemFullSubscription {
  return {
    id: "sub_test",
    object: "subscription",
    created_at: "2026-08-11T00:00:00.000Z",
    updated_at: "2026-08-11T00:00:00.000Z",
    mode: "prod",
    status: "active",
    canceled_at: null,
    collection_method: "charge_automatically",
    customer: {
      id: "cus_test",
      object: "customer",
      created_at: "2026-08-11T00:00:00.000Z",
      updated_at: "2026-08-11T00:00:00.000Z",
      mode: "prod",
      email: "user@example.com",
      name: "User",
      country: "US",
    },
    product: {
      id: "prod_test",
      object: "product",
      created_at: "2026-08-11T00:00:00.000Z",
      updated_at: "2026-08-11T00:00:00.000Z",
      mode: "prod",
      name: "Pro",
      description: "Pro plan",
      price: 1699,
      currency: "USD",
      billing_type: "recurring",
      billing_period: "every-month",
      status: "active",
      tax_mode: "exclusive",
      tax_category: "saas",
      default_success_url: "https://example.com/success",
    },
    current_period_start_date: "2026-08-11T00:00:00.000Z",
    current_period_end_date: "2026-09-11T00:00:00.000Z",
    ...overrides,
  };
}

describe("Creem subscription payment normalization", () => {
  test("uses an independently retrieved transaction when the paid payload is not expanded", () => {
    assert.deepEqual(getCreemSubscriptionPaymentDetails(subscription({
      last_transaction_id: "txn_test",
    }), {
      id: "txn_test",
      object: "transaction",
      created_at: "2026-08-11T00:00:00.000Z",
      updated_at: "2026-08-11T00:00:00.000Z",
      mode: "prod",
      amount: 1500,
      amount_paid: 1400,
      discount_amount: 100,
      currency: "USD",
      type: "invoice",
      tax_country: "US",
      tax_amount: 0,
      status: "paid",
      refunded_amount: 0,
      order: "order_test",
      description: "Pro",
      period_start: 1000,
      period_end: 2000,
    }), {
      orderId: "order_test",
      status: "paid",
      amount: 1500,
      amountPaid: 1400,
      discountAmount: 100,
      taxAmount: 0,
      currency: "USD",
      periodStart: 1000,
      periodEnd: 2000,
    });
  });

  test("prefers expanded transaction values when Creem includes them", () => {
    assert.deepEqual(getCreemSubscriptionPaymentDetails(subscription({
      last_transaction: {
        id: "txn_test",
        object: "transaction",
        created_at: "2026-08-11T00:00:00.000Z",
        updated_at: "2026-08-11T00:00:00.000Z",
        mode: "prod",
        amount: 1500,
        amount_paid: 1400,
        discount_amount: 100,
        currency: "USD",
        type: "invoice",
        tax_country: "US",
        tax_amount: 0,
        status: "paid",
        refunded_amount: 0,
        order: "order_test",
        description: "Pro",
        period_start: 1000,
        period_end: 2000,
      },
    })), {
      orderId: "order_test",
      status: "paid",
      amount: 1500,
      amountPaid: 1400,
      discountAmount: 100,
      taxAmount: 0,
      currency: "USD",
      periodStart: 1000,
      periodEnd: 2000,
    });
  });
});
