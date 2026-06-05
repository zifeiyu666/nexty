/**
 * Webhook Helper Utilities
 * 
 * This module provides reusable utilities for webhook handlers across all payment providers.
 * It encapsulates common patterns like order creation, idempotency checks, and currency conversion.
 * 
 * 这个模块为所有支付提供商的 webhook 处理程序提供可重用的实用工具。
 * 它封装了常见模式，如订单创建、幂等性检查和货币转换。
 * 
 * このモジュールは、すべての支払いプロバイダーの webhook ハンドラーに再利用可能なユーティリティを提供します。
 * 注文作成、冪等性チェック、通貨変換などの一般的なパターンをカプセル化します。
 */

import { db } from '@/lib/db';
import { orders as ordersSchema, PaymentProvider } from '@/lib/db/schema';
import { ORDER_TYPES } from '@/lib/payments/provider-utils';
import type {
  CreateOrderResult,
  OrderInsertData,
} from '@/lib/payments/types';
import { and, eq, inArray } from 'drizzle-orm';

// ============================================================================
// Currency Conversion Utilities
// ============================================================================

/**
 * Converts an amount from cents/smallest unit to currency string.
 * Handles null/undefined values gracefully.
 * Uses toFixed(2) to ensure consistent decimal formatting and avoid floating-point display issues.
 * 
 * @param amount - Amount in smallest currency unit (e.g., cents for USD)
 * @returns Currency amount as string (e.g., "10.00" for 1000 cents)
 */
export function toCurrencyAmount(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '0.00';
  return (amount / 100).toFixed(2);
}

/**
 * Converts a currency string to cents/smallest unit.
 * 
 * @param amount - Currency amount as string (e.g., "10.00")
 * @returns Amount in smallest currency unit (e.g., 1000 cents)
 */
export function toCents(amount: string | null | undefined): number {
  if (!amount) return 0;
  return Math.round(parseFloat(amount) * 100);
}

// ============================================================================
// Order Management Utilities
// ============================================================================

/**
 * Creates an order record with idempotency check.
 * If an order with the same provider and providerOrderId already exists,
 * it returns the existing order without creating a duplicate.
 * 
 * 创建具有幂等性检查的订单记录。
 * 如果具有相同提供商和 providerOrderId 的订单已存在，则返回现有订单而不创建重复项。
 * 
 * 冪等性チェック付きで注文レコードを作成します。
 * 同じプロバイダーと providerOrderId の注文が既に存在する場合、重複を作成せずに既存の注文を返します。
 * 
 * @param provider - Payment provider (e.g., 'stripe', 'creem')
 * @param orderData - Order data to insert
 * @param idempotencyKey - Unique key for idempotency (usually providerOrderId)
 * @returns Object with order (if created or found) and existed flag
 */
export async function createOrderWithIdempotency(
  provider: PaymentProvider,
  orderData: OrderInsertData,
  idempotencyKey: string
): Promise<CreateOrderResult> {
  // Idempotency check
  const existingOrder = await db
    .select({ id: ordersSchema.id })
    .from(ordersSchema)
    .where(
      and(
        eq(ordersSchema.provider, provider),
        eq(ordersSchema.providerOrderId, idempotencyKey)
      )
    )
    .limit(1);

  if (existingOrder.length > 0) {
    return {
      order: existingOrder[0],
      existed: true,
    };
  }

  // Create new order
  const [insertedOrder] = await db
    .insert(ordersSchema)
    .values(orderData)
    .returning({ id: ordersSchema.id });

  return {
    order: insertedOrder || null,
    existed: false,
  };
}

/**
 * Finds an original order by payment intent or order ID for refund processing.
 * 
 * @param provider - Payment provider
 * @param paymentIntentId - Payment intent ID (for Stripe) or order ID (for Creem)
 * @returns Original order or null if not found
 */
export async function findOriginalOrderForRefund(
  provider: PaymentProvider,
  paymentIntentId: string
) {
  // For Stripe, we search by stripePaymentIntentId
  // For Creem, we search by providerOrderId
  const originalOrderResults = await db
    .select()
    .from(ordersSchema)
    .where(
      and(
        eq(ordersSchema.provider, provider),
        provider === 'stripe'
          ? eq(ordersSchema.stripePaymentIntentId, paymentIntentId)
          : eq(ordersSchema.providerOrderId, paymentIntentId),
        inArray(ordersSchema.orderType, [
          ORDER_TYPES.ONE_TIME_PURCHASE,
          ORDER_TYPES.SUBSCRIPTION_INITIAL,
          ORDER_TYPES.SUBSCRIPTION_RENEWAL,
          ORDER_TYPES.RECURRING,
        ])
      )
    )
    .limit(1);

  return originalOrderResults[0] || null;
}

/**
 * Updates an original order's status after a refund.
 * 
 * @param orderId - The order ID to update
 * @param refundedAmount - Amount refunded in cents
 * @param originalAmount - Original order amount in cents
 */
export async function updateOrderStatusAfterRefund(
  orderId: string,
  refundedAmount: number,
  originalAmount: number
) {
  const REFUND_TOLERANCE_CENTS = 1; // 1 cent tolerance
  const isFullRefund = Math.abs(Math.abs(refundedAmount) - originalAmount) <= REFUND_TOLERANCE_CENTS;

  await db
    .update(ordersSchema)
    .set({ status: isFullRefund ? 'refunded' : 'partially_refunded' })
    .where(eq(ordersSchema.id, orderId));
}

/**
 * Checks if a refund order already exists.
 * 
 * @param provider - Payment provider
 * @param refundId - Unique refund identifier
 * @returns true if refund order exists, false otherwise
 */
export async function refundOrderExists(
  provider: PaymentProvider,
  refundId: string
): Promise<boolean> {
  const existingRefund = await db
    .select({ id: ordersSchema.id })
    .from(ordersSchema)
    .where(
      and(
        eq(ordersSchema.provider, provider),
        eq(ordersSchema.orderType, ORDER_TYPES.REFUND),
        eq(ordersSchema.providerOrderId, refundId)
      )
    )
    .limit(1);

  return existingRefund.length > 0;
}
