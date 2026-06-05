/**
 * Payment provider utilities for handling different payment providers
 * 
 * This module provides utilities to normalize payment-related data across different providers:
 * 
 * **Order Types:**
 * - Stripe uses: 'subscription_initial' and 'subscription_renewal'
 * - Creem uses: 'recurring'
 * 
 * **Recurring Intervals:**
 * - Stripe uses: 'month', 'year'
 * - Creem uses: 'every-month', 'every-year'
 * 
 * These utilities help maintain consistency when querying and displaying payment data.
 */

/**
 * Payment provider constants
 */
export const ORDER_PROVIDERS = ["stripe", "creem", "paypal"] as const;

// ============================================================================
// Order Status Utilities
// ============================================================================

/**
 * Order status constants across all payment providers
 */
export const ORDER_STATUSES = {
  PENDING: "pending",
  SUCCEEDED: "succeeded",
  REFUNDED: "refunded",
  PARTIALLY_REFUNDED: "partially_refunded",
  FAILED: "failed",
  DECLINED: "declined",
} as const;

// ============================================================================
// Payment Type Utilities
// ============================================================================

/**
 * Payment type constants for different providers
 * Note: This is different from orderType - paymentType is set on pricing plans
 */
export const PAYMENT_TYPES = {
  ONE_TIME: 'one_time',     // Stripe one-time payment
  ONETIME: 'onetime',       // Creem one-time payment
  RECURRING: 'recurring',   // Both Stripe and Creem subscription
} as const;

/**
 * All one-time payment types across all providers
 */
export const ONE_TIME_PAYMENT_TYPES = [
  PAYMENT_TYPES.ONE_TIME,
  PAYMENT_TYPES.ONETIME,
] as const;

/**
 * Check if a payment type is one-time (not subscription)
 * @param paymentType - The payment type to check
 * @returns true if the payment type is one-time
 */
export function isOneTimePaymentType(paymentType: string | null | undefined): boolean {
  if (!paymentType) return false;
  return ONE_TIME_PAYMENT_TYPES.includes(paymentType as any);
}

/**
 * Check if a payment type is recurring (subscription)
 * @param paymentType - The payment type to check
 * @returns true if the payment type is recurring
 */
export function isRecurringPaymentType(paymentType: string | null | undefined): boolean {
  return paymentType === PAYMENT_TYPES.RECURRING;
}

// ============================================================================
// Order Type Utilities
// ============================================================================

/**
 * Order type constants for different providers
 * Note: This is different from paymentType - orderType is set on orders table
 */
export const ORDER_TYPES = {
  ONE_TIME_PURCHASE: 'one_time_purchase',
  SUBSCRIPTION_INITIAL: 'subscription_initial', // Stripe's subscription type
  SUBSCRIPTION_RENEWAL: 'subscription_renewal', // Stripe's subscription type
  RECURRING: 'recurring', // Creem's subscription type
  REFUND: 'refund',
} as const;

/**
 * All subscription-related order types across all providers
 */
export const SUBSCRIPTION_ORDER_TYPES = [
  ORDER_TYPES.SUBSCRIPTION_INITIAL,
  ORDER_TYPES.SUBSCRIPTION_RENEWAL,
  ORDER_TYPES.RECURRING,
] as const;

/**
 * All one-time purchase order types across all providers
 */
export const ONE_TIME_ORDER_TYPES = [
  ORDER_TYPES.ONE_TIME_PURCHASE,
] as const;

/**
 * All valid order types
 */
export const ALL_ORDER_TYPES = [
  ORDER_TYPES.ONE_TIME_PURCHASE,
  ORDER_TYPES.SUBSCRIPTION_INITIAL,
  ORDER_TYPES.SUBSCRIPTION_RENEWAL,
  ORDER_TYPES.RECURRING,
  ORDER_TYPES.REFUND,
] as const;

/**
 * Check if an order type represents a subscription
 */
export function isSubscriptionOrder(orderType: string | null | undefined): boolean {
  if (!orderType) return false;
  return SUBSCRIPTION_ORDER_TYPES.includes(orderType as any);
}

/**
 * Check if an order type represents a one-time purchase
 */
export function isOneTimePurchase(orderType: string | null | undefined): boolean {
  if (!orderType) return false;
  return orderType === ORDER_TYPES.ONE_TIME_PURCHASE;
}

/**
 * Get display label for order type
 * @param orderType - The order type
 * @returns Human-readable label
 */
export function getOrderTypeLabel(orderType: string): string {
  switch (orderType) {
    case ORDER_TYPES.ONE_TIME_PURCHASE:
      return 'One-time Purchase';
    case ORDER_TYPES.SUBSCRIPTION_INITIAL:
      return 'Subscription (Initial)';
    case ORDER_TYPES.SUBSCRIPTION_RENEWAL:
      return 'Subscription (Renewal)';
    case ORDER_TYPES.RECURRING:
      return 'Subscription (Recurring)';
    case ORDER_TYPES.REFUND:
      return 'Refund';
    default:
      return orderType;
  }
}

/**
 * Normalize order type for display purposes
 * Maps provider-specific order types to a common display format
 * @param orderType - The order type to normalize
 * @returns Normalized order type for display
 */
export function normalizeOrderTypeForDisplay(orderType: string): string {
  if (orderType === ORDER_TYPES.RECURRING) {
    return 'subscription';
  }
  if (orderType === ORDER_TYPES.SUBSCRIPTION_INITIAL || orderType === ORDER_TYPES.SUBSCRIPTION_RENEWAL) {
    return 'subscription';
  }
  if (orderType === ORDER_TYPES.ONE_TIME_PURCHASE) {
    return 'one_time';
  }
  return orderType;
}

// ============================================================================
// Recurring Interval Utilities (Subscription Only)
// ============================================================================

/**
 * Recurring interval constants for subscription payments
 * Note: 'once' is NOT included here as it represents one-time payment, not subscription
 */
export const RECURRING_INTERVALS = {
  MONTH: 'month',           // Stripe monthly subscription
  YEAR: 'year',             // Stripe yearly subscription
  EVERY_MONTH: 'every-month', // Creem monthly subscription
  EVERY_YEAR: 'every-year',   // Creem yearly subscription
} as const;

/**
 * All monthly recurring intervals across all providers
 */
export const MONTHLY_INTERVALS = [
  RECURRING_INTERVALS.MONTH,
  RECURRING_INTERVALS.EVERY_MONTH,
] as const;

/**
 * All yearly recurring intervals across all providers
 */
export const YEARLY_INTERVALS = [
  RECURRING_INTERVALS.YEAR,
  RECURRING_INTERVALS.EVERY_YEAR,
] as const;

/**
 * All subscription intervals (monthly + yearly)
 */
export const ALL_SUBSCRIPTION_INTERVALS = [
  ...MONTHLY_INTERVALS,
  ...YEARLY_INTERVALS,
] as const;

/**
 * Check if a recurring interval is monthly
 * @param interval - The recurring interval to check
 * @returns true if the interval is monthly
 */
export function isMonthlyInterval(interval: string | null | undefined): boolean {
  if (!interval) return false;
  return MONTHLY_INTERVALS.includes(interval as any);
}

/**
 * Check if a recurring interval is yearly
 * @param interval - The recurring interval to check
 * @returns true if the interval is yearly
 */
export function isYearlyInterval(interval: string | null | undefined): boolean {
  if (!interval) return false;
  return YEARLY_INTERVALS.includes(interval as any);
}

/**
 * Check if a recurring interval is a valid subscription interval
 * @param interval - The recurring interval to check
 * @returns true if the interval represents a subscription (not one-time)
 */
export function isSubscriptionInterval(interval: string | null | undefined): boolean {
  if (!interval) return false;
  return ALL_SUBSCRIPTION_INTERVALS.includes(interval as any);
}

/**
 * Normalize recurring interval to a common format
 * @param interval - The recurring interval to normalize
 * @returns 'monthly', 'yearly', or the original value
 */
export function normalizeRecurringInterval(interval: string | null | undefined): string {
  if (!interval) return 'unknown';

  if (isMonthlyInterval(interval)) return 'monthly';
  if (isYearlyInterval(interval)) return 'yearly';

  return interval;
}

/**
 * Get display label for recurring interval
 * @param interval - The recurring interval
 * @returns Human-readable label
 */
export function getRecurringIntervalLabel(interval: string | null | undefined): string {
  if (!interval) return 'Unknown';

  if (isMonthlyInterval(interval)) return 'Monthly';
  if (isYearlyInterval(interval)) return 'Yearly';

  return interval;
}

