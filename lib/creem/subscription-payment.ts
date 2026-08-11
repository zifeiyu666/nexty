import type { CreemFullSubscription, CreemTransaction } from "./types";

export type CreemSubscriptionPaymentDetails = {
  orderId: string;
  status: string;
  amount: number;
  amountPaid: number;
  discountAmount: number;
  taxAmount: number;
  currency: string;
  periodStart: number;
  periodEnd: number;
};

function parsePeriod(value: string | undefined, field: string): number {
  const parsed = value ? Date.parse(value) : Number.NaN;
  if (!Number.isFinite(parsed)) {
    throw new Error(`Creem subscription payment is missing ${field}.`);
  }
  return parsed;
}

/**
 * Normalizes Creem's subscription.paid payload.
 *
 * Creem may omit the expanded last_transaction object and only provide
 * last_transaction_id plus the subscription period dates. In that case we
 * use the product's price/currency as the paid amount and the transaction ID
 * as the stable order idempotency key.
 */
export function getCreemSubscriptionPaymentDetails(
  subscription: CreemFullSubscription,
  transaction = subscription.last_transaction,
): CreemSubscriptionPaymentDetails {
  const normalizedTransaction = transaction as CreemTransaction | undefined;
  const orderId = normalizedTransaction?.order || subscription.last_transaction_id;

  if (!orderId) {
    throw new Error("Creem subscription payment is missing a transaction id.");
  }

  const periodStart = normalizedTransaction?.period_start ?? parsePeriod(
    subscription.current_period_start_date,
    "current period start",
  );
  const periodEnd = normalizedTransaction?.period_end ?? parsePeriod(
    subscription.current_period_end_date,
    "current period end",
  );
  const amount = normalizedTransaction?.amount ?? subscription.product.price;
  const amountPaid = normalizedTransaction?.amount_paid ?? amount;

  if (!Number.isFinite(amount) || !Number.isFinite(amountPaid)) {
    throw new Error("Creem subscription payment is missing a valid amount.");
  }

  return {
    orderId,
    status: normalizedTransaction?.status || "paid",
    amount,
    amountPaid,
    discountAmount: normalizedTransaction?.discount_amount ?? 0,
    taxAmount: normalizedTransaction?.tax_amount ?? 0,
    currency: normalizedTransaction?.currency || subscription.product.currency,
    periodStart,
    periodEnd,
  };
}
