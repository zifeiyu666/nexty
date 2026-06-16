/**
 * Credit Management System
 * 
 * This module handles all credit-related operations for the payment system.
 * It is provider-agnostic and used by all payment providers (Stripe, Creem, etc.)
 * 
 * Key Operations:
 * - Upgrade one-time credits (one-time purchases)
 * - Upgrade subscription credits (monthly/yearly subscriptions)
 * - Revoke one-time credits (refunds)
 * - Revoke subscription credits (subscription refunds)
 * - Revoke remaining credits (subscription cancellation/expiration)
 * 
 * 这个模块处理支付系统的所有积分相关操作。
 * 它是提供商无关的，由所有支付提供商（Stripe、Creem 等）使用。
 * 
 * このモジュールは、支払いシステムのすべてのクレジット関連操作を処理します。
 * プロバイダーに依存せず、すべての支払いプロバイダー（Stripe、Creem など）で使用されます。
 */

import { db } from '@/lib/db';
import {
  creditLogs as creditLogsSchema,
  PaymentProvider,
  pricingPlans as pricingPlansSchema,
  usage as usageSchema,
} from '@/lib/db/schema';
import {
  addEntitlements,
  emptyEntitlements,
  EntitlementBalances,
  EntitlementBucket,
  EntitlementMap,
  getPlanEntitlements,
  hasAnyEntitlements,
  normalizeEntitlementBalances,
  replaceEntitlements,
  revokeEntitlements,
} from '@/lib/payments/entitlements';
import type {
  Order,
} from '@/lib/payments/types';
import { and, eq } from 'drizzle-orm';

// ============================================================================
// One-Time Credit Operations
// ============================================================================

/**
 * Upgrades one-time credits for a user based on their plan purchase.
 * 
 * 根据用户购买的计划为用户升级一次性积分。
 * 
 * ユーザーのプラン購入に基づいて、ユーザーのワンタイムクレジットをアップグレードします。
 * 
 * @param userId - The user's ID
 * @param planId - The plan's ID
 * @param orderId - The order's ID
 */
export async function upgradeOneTimeCredits(userId: string, planId: string, orderId: string) {
  const planDataResults = await db
    .select({ benefitsJsonb: pricingPlansSchema.benefitsJsonb })
    .from(pricingPlansSchema)
    .where(eq(pricingPlansSchema.id, planId))
    .limit(1);
  const planData = planDataResults[0];

  if (!planData) {
    throw new Error(`Could not fetch plan benefits for ${planId}`);
  }

  const entitlementsToGrant = getPlanEntitlements(planData.benefitsJsonb);
  if (!hasAnyEntitlements(entitlementsToGrant)) {
    console.log(`No one-time entitlements defined for plan ${planId}. Skipping grant.`);
    return;
  }

  await applyEntitlementGrant({
    userId,
    bucket: 'oneTime',
    entitlements: entitlementsToGrant,
    mode: 'add',
    logType: 'one_time_purchase',
    notes: 'One-time entitlement purchase',
    relatedOrderId: orderId,
  });
}

/**
 * Revokes one-time credits for a refunded order.
 * 
 * 为退款订单撤销一次性积分。
 * 
 * 返金された注文のワンタイムクレジットを取り消します。
 * 
 * @param refundAmountCents - The refund amount in cents
 * @param originalOrder - The original order being refunded
 * @param refundOrderId - The refund order's ID
 * @param originalAmountCents - The original order amount in cents
 */
export async function revokeOneTimeCredits(
  refundAmountCents: number,
  originalOrder: Order,
  refundOrderId: string,
  originalAmountCents: number
) {
  const planId = originalOrder.planId as string;
  const userId = originalOrder.userId as string;

  const planDataResults = await db
    .select({ benefitsJsonb: pricingPlansSchema.benefitsJsonb })
    .from(pricingPlansSchema)
    .where(eq(pricingPlansSchema.id, planId))
    .limit(1);
  const planData = planDataResults[0];

  if (!planData) {
    console.error(`Error fetching plan benefits for planId ${planId} during refund ${refundOrderId}:`);
    return;
  }

  const totalEntitlements = getPlanEntitlements(planData.benefitsJsonb);
  if (!hasAnyEntitlements(totalEntitlements)) {
    console.log(`No one-time entitlements defined to revoke for plan ${planId} on refund ${refundOrderId}.`);
    return;
  }

  const entitlementsToRevoke = prorateEntitlements(totalEntitlements, refundAmountCents, originalAmountCents);
  const isFullRefund = refundAmountCents >= originalAmountCents;

  try {
    await applyEntitlementRevocation({
      userId,
      bucket: 'oneTime',
      entitlements: entitlementsToRevoke,
      logType: 'refund_revoke',
      notes: isFullRefund
        ? `Full refund for order ${originalOrder.id}.`
        : `Partial refund (${refundAmountCents}/${originalAmountCents}) for order ${originalOrder.id}.`,
      relatedOrderId: originalOrder.id,
    });
    console.log(`Successfully revoked one-time entitlements for user ${userId} related to refund ${refundOrderId}.`);
  } catch (revokeError) {
    console.error(`Error revoking one-time entitlements for user ${userId}, refund ${refundOrderId}:`, revokeError);
  }
}

// ============================================================================
// Subscription Credit Operations
// ============================================================================

/**
 * Upgrades subscription credits for a user based on their subscription plan.
 * Handles both monthly and yearly subscription intervals.
 * 
 * 根据用户的订阅计划为用户升级订阅积分。
 * 处理月度和年度订阅间隔。
 * 
 * ユーザーのサブスクリプションプランに基づいて、ユーザーのサブスクリプションクレジットをアップグレードします。
 * 月次および年次のサブスクリプション間隔を処理します。
 * 
 * @param userId - The user's ID
 * @param planId - The plan's ID
 * @param orderId - The order's ID
 * @param currentPeriodStart - The subscription period start time (13-digit timestamp)
 */
export async function upgradeSubscriptionCredits(userId: string, planId: string, orderId: string, currentPeriodStart: number) {
  try {
    const planDataResults = await db
      .select({
        recurringInterval: pricingPlansSchema.recurringInterval,
        benefitsJsonb: pricingPlansSchema.benefitsJsonb
      })
      .from(pricingPlansSchema)
      .where(eq(pricingPlansSchema.id, planId))
      .limit(1);
    const planData = planDataResults[0];

    if (!planData) {
      console.error(`Error fetching plan benefits for planId ${planId} during order ${orderId} processing`);
      throw new Error(`Could not fetch plan benefits for ${planId}`);
    }

    const entitlementsToGrant = getPlanEntitlements(planData.benefitsJsonb);
    if (!hasAnyEntitlements(entitlementsToGrant)) {
      console.log(`No subscription entitlements defined for plan ${planId}. Skipping grant.`);
      return;
    }

    await applyEntitlementGrant({
      userId,
      bucket: 'subscription',
      entitlements: entitlementsToGrant,
      mode: 'replace',
      logType: 'subscription_grant',
      notes: 'Subscription entitlements granted/reset',
      relatedOrderId: orderId,
      allocationDetails: {
        kind: 'subscription_period',
        recurringInterval: planData.recurringInterval,
        currentPeriodStart,
        relatedOrderId: orderId,
      },
    });
    console.log(`Successfully reset subscription entitlements for user ${userId}.`);
  } catch (creditError) {
    console.error(`Error processing credits for user ${userId} (order ${orderId}):`, creditError);
    throw creditError;
  }
}

/**
 * Revokes subscription credits for a refunded subscription order.
 * 
 * 为退款的订阅订单撤销订阅积分。
 * 
 * 返金されたサブスクリプション注文のサブスクリプションクレジットを取り消します。
 * 
 * @param originalOrder - The original subscription order being refunded
 * @param refundAmountCents - The refund amount in cents
 * @param originalAmountCents - The original order amount in cents
 */
export async function revokeSubscriptionCredits(
  originalOrder: Order,
  refundAmountCents: number,
  originalAmountCents: number
) {
  const planId = originalOrder.planId as string;
  const userId = originalOrder.userId as string;
  const subscriptionId = originalOrder.subscriptionId as string;

  try {
    const planDataResults = await db
      .select({ benefitsJsonb: pricingPlansSchema.benefitsJsonb })
      .from(pricingPlansSchema)
      .where(eq(pricingPlansSchema.id, planId))
      .limit(1);
    const planData = planDataResults[0];
    if (!planData) { return; }

    const entitlementsToRevoke = prorateEntitlements(
      getPlanEntitlements(planData.benefitsJsonb),
      refundAmountCents,
      originalAmountCents
    );
    const isFullRefund = refundAmountCents >= originalAmountCents;

    await applyEntitlementRevocation({
      userId,
      bucket: 'subscription',
      entitlements: entitlementsToRevoke,
      logType: 'refund_revoke',
      notes: isFullRefund
        ? `Full refund for subscription order ${originalOrder.id}.`
        : `Partial refund (${refundAmountCents}/${originalAmountCents}) for subscription order ${originalOrder.id}.`,
      relatedOrderId: originalOrder.id,
      clearAllocationDetails: isFullRefund,
    });
    console.log(`Successfully revoked subscription entitlements for user ${userId} related to subscription ${subscriptionId} refund.`);
  } catch (error) {
    console.error(`Error during revokeSubscriptionCredits for user ${userId}, subscription ${subscriptionId}:`, error);
  }
}

/**
 * Revokes remaining subscription credits when a subscription ends.
 * 
 * 当订阅结束时撤销剩余的订阅积分。
 * 
 * サブスクリプションが終了したときに、残りのサブスクリプションクレジットを取り消します。
 * 
 * @param provider - The payment provider
 * @param subscriptionId - The subscription ID
 * @param userId - The user's ID
 * @param metadata - Additional metadata
 */
export async function revokeRemainingSubscriptionCreditsOnEnd(provider: PaymentProvider, subscriptionId: string, userId: string, metadata: any) {
  try {
    await clearSubscriptionEntitlements({
      userId,
      logType: 'subscription_ended_revoke',
      notes: `${provider} subscription ${subscriptionId} ended; remaining entitlements revoked.`,
      relatedOrderId: null,
    });

    console.log(`Revoked remaining subscription entitlements on end for subscription ${subscriptionId}, user ${userId}`);
  } catch (error) {
    console.error(`Error revoking remaining entitlements for subscription ${subscriptionId}:`, error);
  }
}

// ============================================================================
// Internal Helper Functions
// ============================================================================

/**
 * Gets the context for revoking subscription credits based on plan and usage data.
 * 
 * 根据计划和用量数据获取撤销订阅积分的上下文。
 * 
 * プランと使用量データに基づいて、サブスクリプションクレジットを取り消すためのコンテキストを取得します。
 */
function prorateEntitlements(
  entitlements: EntitlementMap,
  refundAmountCents: number,
  originalAmountCents: number
): EntitlementMap {
  if (originalAmountCents <= 0) {
    return entitlements;
  }

  return {
    song: Math.round((entitlements.song * refundAmountCents) / originalAmountCents),
    mv: Math.round((entitlements.mv * refundAmountCents) / originalAmountCents),
    wallArt: Math.round((entitlements.wallArt * refundAmountCents) / originalAmountCents),
  };
}

function buildDelta(bucket: EntitlementBucket, entitlements: EntitlementMap, sign: 1 | -1): EntitlementBalances {
  return {
    subscription: emptyEntitlements(),
    oneTime: emptyEntitlements(),
    [bucket]: {
      song: entitlements.song * sign,
      mv: entitlements.mv * sign,
      wallArt: entitlements.wallArt * sign,
    },
  };
}

async function getLockedUsage(tx: any, userId: string) {
  const usageResults = await tx
    .select()
    .from(usageSchema)
    .where(eq(usageSchema.userId, userId))
    .for('update');
  return usageResults[0] ?? null;
}

async function applyEntitlementGrant(params: {
  userId: string;
  bucket: EntitlementBucket;
  entitlements: EntitlementMap;
  mode: 'add' | 'replace';
  logType: string;
  notes: string;
  relatedOrderId?: string | null;
  allocationDetails?: Record<string, unknown>;
}) {
  const { userId, bucket, entitlements, mode, logType, notes, relatedOrderId, allocationDetails } = params;

  await db.transaction(async (tx) => {
    if (relatedOrderId) {
      const existingGrantLogs = await tx
        .select({
          entitlementDeltaJsonb: creditLogsSchema.entitlementDeltaJsonb,
        })
        .from(creditLogsSchema)
        .where(and(
          eq(creditLogsSchema.relatedOrderId, relatedOrderId),
          eq(creditLogsSchema.type, logType)
        ));

      const alreadyGranted = existingGrantLogs.some((log: any) =>
        hasAnyEntitlements(
          normalizeEntitlementBalances(log.entitlementDeltaJsonb)[bucket]
        )
      );

      if (alreadyGranted) {
        console.log(`Entitlements for order ${relatedOrderId} were already granted. Skipping duplicate grant.`);
        return;
      }
    }

    const usage = await getLockedUsage(tx, userId);
    const balanceJsonb = (usage?.balanceJsonb ?? {}) as any;
    const currentBalances = normalizeEntitlementBalances(balanceJsonb.entitlements);
    const nextBalances = mode === 'add'
      ? addEntitlements(currentBalances, bucket, entitlements)
      : replaceEntitlements(currentBalances, bucket, entitlements);
    const nextBalanceJsonb = {
      ...balanceJsonb,
      entitlements: nextBalances,
      ...(allocationDetails ? { allocationDetails } : {}),
    };

    if (usage) {
      await tx.update(usageSchema)
        .set({
          subscriptionCreditsBalance: 0,
          oneTimeCreditsBalance: 0,
          balanceJsonb: nextBalanceJsonb,
        })
        .where(eq(usageSchema.userId, userId));
    } else {
      await tx.insert(usageSchema)
        .values({
          userId,
          subscriptionCreditsBalance: 0,
          oneTimeCreditsBalance: 0,
          balanceJsonb: nextBalanceJsonb,
        });
    }

    await tx.insert(creditLogsSchema).values({
      userId,
      amount: 0,
      oneTimeCreditsSnapshot: 0,
      subscriptionCreditsSnapshot: 0,
      entitlementDeltaJsonb: buildDelta(bucket, entitlements, 1),
      entitlementSnapshotJsonb: nextBalances,
      type: logType,
      notes,
      relatedOrderId: relatedOrderId ?? null,
    });
  });
}

async function applyEntitlementRevocation(params: {
  userId: string;
  bucket: EntitlementBucket;
  entitlements: EntitlementMap;
  logType: string;
  notes: string;
  relatedOrderId?: string | null;
  clearAllocationDetails?: boolean;
}) {
  const { userId, bucket, entitlements, logType, notes, relatedOrderId, clearAllocationDetails } = params;

  if (!hasAnyEntitlements(entitlements)) {
    return;
  }

  await db.transaction(async (tx) => {
    const usage = await getLockedUsage(tx, userId);
    if (!usage) { return; }

    const balanceJsonb = (usage.balanceJsonb ?? {}) as any;
    const currentBalances = normalizeEntitlementBalances(balanceJsonb.entitlements);
    const revoked = revokeEntitlements(currentBalances, bucket, entitlements);
    if (!hasAnyEntitlements(revoked.revoked)) {
      return;
    }

    const nextBalanceJsonb = {
      ...balanceJsonb,
      entitlements: revoked.balances,
    };
    if (clearAllocationDetails) {
      delete nextBalanceJsonb.allocationDetails;
    }

    await tx.update(usageSchema)
      .set({
        subscriptionCreditsBalance: 0,
        oneTimeCreditsBalance: 0,
        balanceJsonb: nextBalanceJsonb,
      })
      .where(eq(usageSchema.userId, userId));

    await tx.insert(creditLogsSchema).values({
      userId,
      amount: 0,
      oneTimeCreditsSnapshot: 0,
      subscriptionCreditsSnapshot: 0,
      entitlementDeltaJsonb: buildDelta(bucket, revoked.revoked, -1),
      entitlementSnapshotJsonb: revoked.balances,
      type: logType,
      notes,
      relatedOrderId: relatedOrderId ?? null,
    });
  });
}

async function clearSubscriptionEntitlements(params: {
  userId: string;
  logType: string;
  notes: string;
  relatedOrderId?: string | null;
}) {
  const { userId, logType, notes, relatedOrderId } = params;

  await db.transaction(async (tx) => {
    const usage = await getLockedUsage(tx, userId);
    if (!usage) { return; }

    const balanceJsonb = (usage.balanceJsonb ?? {}) as any;
    const currentBalances = normalizeEntitlementBalances(balanceJsonb.entitlements);
    if (!hasAnyEntitlements(currentBalances.subscription)) {
      return;
    }

    const nextBalances = {
      subscription: emptyEntitlements(),
      oneTime: currentBalances.oneTime,
    };
    const nextBalanceJsonb = {
      ...balanceJsonb,
      entitlements: nextBalances,
    };
    delete nextBalanceJsonb.allocationDetails;

    await tx.update(usageSchema)
      .set({
        subscriptionCreditsBalance: 0,
        oneTimeCreditsBalance: 0,
        balanceJsonb: nextBalanceJsonb,
      })
      .where(eq(usageSchema.userId, userId));

    await tx.insert(creditLogsSchema).values({
      userId,
      amount: 0,
      oneTimeCreditsSnapshot: 0,
      subscriptionCreditsSnapshot: 0,
      entitlementDeltaJsonb: buildDelta('subscription', currentBalances.subscription, -1),
      entitlementSnapshotJsonb: nextBalances,
      type: logType,
      notes,
      relatedOrderId: relatedOrderId ?? null,
    });
  });
}
