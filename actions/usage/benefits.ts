'use server';

import { actionResponse, ActionResult } from '@/lib/action-response';
import { getSession } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { creditLogs as creditLogsSchema, subscriptions as subscriptionsSchema, usage as usageSchema } from '@/lib/db/schema';
import {
  emptyEntitlements,
  EntitlementBalances,
  EntitlementMap,
  normalizeEntitlementBalances,
  sumEntitlements,
} from '@/lib/payments/entitlements';
import { desc, eq } from 'drizzle-orm';

export interface UserBenefits {
  activePlanId: string | null;
  subscriptionStatus: string | null; // e.g., 'active', 'trialing', 'past_due', 'canceled', null
  currentPeriodEnd: string | null;
  nextCreditDate: string | null;
  totalAvailableCredits: number;
  subscriptionCreditsBalance: number;
  oneTimeCreditsBalance: number;
  entitlementBalances: EntitlementBalances;
  totalEntitlements: EntitlementMap;
  // Add other plan-specific benefits if needed, fetched via planId
}

interface UsageData {
  subscriptionCreditsBalance: number | null;
  oneTimeCreditsBalance: number | null;
  balanceJsonb: any;
}

interface SubscriptionData {
  planId: string;
  status: string;
  currentPeriodEnd: string | null;
}

const defaultUserBenefits: UserBenefits = {
  activePlanId: null,
  subscriptionStatus: null,
  currentPeriodEnd: null,
  nextCreditDate: null,
  totalAvailableCredits: 0,
  subscriptionCreditsBalance: 0,
  oneTimeCreditsBalance: 0,
  entitlementBalances: {
    subscription: emptyEntitlements(),
    oneTime: emptyEntitlements(),
  },
  totalEntitlements: emptyEntitlements(),
};

function createUserBenefitsFromData(
  usageData: UsageData | null,
  subscription: SubscriptionData | null,
  currentYearlyDetails: any | null = null
): UserBenefits {
  const subCredits = (usageData?.subscriptionCreditsBalance ?? 0) as number;
  const oneTimeCredits = (usageData?.oneTimeCreditsBalance ?? 0) as number;
  const totalCredits = subCredits + oneTimeCredits;
  const entitlementBalances = normalizeEntitlementBalances((usageData?.balanceJsonb as any)?.entitlements);
  const totalEntitlements = sumEntitlements(entitlementBalances);

  const currentPeriodEnd = subscription?.currentPeriodEnd ?? null;
  const nextCreditDate = currentYearlyDetails?.nextCreditDate ?? null;

  let finalStatus = subscription?.status ?? null;
  if (finalStatus && subscription?.currentPeriodEnd && new Date(subscription.currentPeriodEnd) < new Date()) {
    finalStatus = 'inactive_period_ended';
  }

  return {
    activePlanId: (finalStatus === 'active' || finalStatus === 'trialing') ? subscription?.planId ?? null : null,
    subscriptionStatus: finalStatus,
    currentPeriodEnd,
    nextCreditDate,
    totalAvailableCredits: totalCredits,
    subscriptionCreditsBalance: subCredits,
    oneTimeCreditsBalance: oneTimeCredits,
    entitlementBalances,
    totalEntitlements,
  };
}

async function fetchSubscriptionData(
  userId: string
): Promise<SubscriptionData | null> {
  try {
    const result = await db
      .select({
        planId: subscriptionsSchema.planId,
        status: subscriptionsSchema.status,
        currentPeriodEnd: subscriptionsSchema.currentPeriodEnd,
      })
      .from(subscriptionsSchema)
      .where(eq(subscriptionsSchema.userId, userId))
      .orderBy(desc(subscriptionsSchema.createdAt))
      .limit(1);

    if (result.length > 0) {
      const sub = result[0];
      return {
        ...sub,
        currentPeriodEnd: sub.currentPeriodEnd
          ? new Date(sub.currentPeriodEnd).toISOString()
          : null,
      };
    }

    return null;
  } catch (error) {
    console.error(
      `Unexpected error in fetchSubscriptionData for user ${userId}:`,
      error
    );
    return null;
  }
}

/**
 * Retrieves the user's current benefits
 * Server-side action.
 */
export async function getUserBenefits(userId: string): Promise<UserBenefits> {
  if (!userId) {
    return defaultUserBenefits;
  }

  try {
    const result = await db
      .select({
        subscriptionCreditsBalance: usageSchema.subscriptionCreditsBalance,
        oneTimeCreditsBalance: usageSchema.oneTimeCreditsBalance,
        balanceJsonb: usageSchema.balanceJsonb,
      })
      .from(usageSchema)
      .where(eq(usageSchema.userId, userId));

    const usageData = result.length > 0 ? result[0] : null;

    let finalUsageData: UsageData | null = usageData as UsageData | null;

    // ------------------------------------------
    // User with no usage data, it means he/she is a new user
    // ------------------------------------------
    // if (!usageData) {
    //   console.log(`New user(${userId}) with no usage data - may grant benefits if needed.`);
    //   finalUsageData = someFunctionToGrantBenefits(userId);
    // }

    // ------------------------------------------
    // Handle user subscription data (subscriptions table) and benefits data (usage table)
    // ------------------------------------------
    if (finalUsageData) {
      // Process yearly subscription catch-up logic
      finalUsageData = await processYearlySubscriptionCatchUp(userId) ?? finalUsageData;

      const subscription = await fetchSubscriptionData(userId);
      const currentYearlyDetails = (finalUsageData.balanceJsonb as any)?.yearlyAllocationDetails;

      return createUserBenefitsFromData(
        finalUsageData,
        subscription,
        currentYearlyDetails
      );
    } else {
      const subscription = await fetchSubscriptionData(userId);

      return createUserBenefitsFromData(null, subscription);
    }
  } catch (error) {
    console.error(`Unexpected error in getUserBenefits for user ${userId}:`, error);
    return defaultUserBenefits;
  }
}

/**
 * Retrieves the user's current benefits
 * Client-side action.
 */
export async function getClientUserBenefits(): Promise<ActionResult<UserBenefits>> {
  const session = await getSession()
  const user = session?.user;
  if (!user) return actionResponse.unauthorized();

  try {
    const benefits = await getUserBenefits(user.id);
    return actionResponse.success(benefits);
  } catch (error: any) {
    console.error("Error fetching user benefits for client:", error);
    return actionResponse.error(
      error.message || "Failed to fetch user benefits."
    );
  }
}

/**
 * Processes yearly subscription catch-up logic to allocate monthly credits
 * that may have been missed. This function handles the allocation of credits
 * for past months in a yearly subscription plan.
 *
 * @param userId The UUID of the user.
 * @returns A promise resolving to the updated UsageData or null if no usage data exists.
 */
async function processYearlySubscriptionCatchUp(
  userId: string
): Promise<UsageData | null> {
  let finalUsageData: UsageData | null = null;
  let shouldContinue = true;

  while (shouldContinue) {
    shouldContinue = await db.transaction(async (tx) => {
      const usageResults = await tx
        .select()
        .from(usageSchema)
        .where(eq(usageSchema.userId, userId))
        .for('update');
      const usage = usageResults[0];

      if (!usage) {
        return false;
      }

      finalUsageData = usage as UsageData;
      const yearlyDetails = (usage.balanceJsonb as any)?.yearlyAllocationDetails;
      if (!yearlyDetails?.monthlyCredits) {
        return false;
      }

      if (
        !yearlyDetails ||
        (yearlyDetails.remainingMonths || 0) <= 0 ||
        !yearlyDetails.nextCreditDate ||
        new Date() < new Date(yearlyDetails.nextCreditDate)
      ) {
        return false;
      }

      const yearMonthToAllocate = new Date(yearlyDetails.nextCreditDate)
        .toISOString()
        .slice(0, 7);

      if (yearlyDetails.lastAllocatedMonth === yearMonthToAllocate) {
        return false;
      }

      const allocationDate = new Date(yearlyDetails.nextCreditDate);
      const creditsToAllocate = yearlyDetails.monthlyCredits;

      const newRemainingMonths = yearlyDetails.remainingMonths - 1;
      const nextCreditDate = new Date(yearlyDetails.nextCreditDate);
      nextCreditDate.setMonth(nextCreditDate.getMonth() + 1);

      const newYearlyDetails = {
        ...yearlyDetails,
        remainingMonths: newRemainingMonths,
        nextCreditDate: nextCreditDate.toISOString(),
        lastAllocatedMonth: yearMonthToAllocate,
      };

      const newBalanceJsonb = {
        ...(usage.balanceJsonb as any),
        yearlyAllocationDetails: newYearlyDetails,
      };

      const newSubscriptionBalance = creditsToAllocate;

      const updatedUsage = await tx
        .update(usageSchema)
        .set({
          subscriptionCreditsBalance: newSubscriptionBalance,
          balanceJsonb: newBalanceJsonb,
        })
        .where(eq(usageSchema.userId, userId))
        .returning({
          oneTimeCreditsSnapshot: usageSchema.oneTimeCreditsBalance,
          subscriptionCreditsSnapshot: usageSchema.subscriptionCreditsBalance,
        });

      const balances = updatedUsage[0];
      if (balances) {
        const relatedOrderId: string | null =
          yearlyDetails.relatedOrderId || null;

        await tx.insert(creditLogsSchema).values({
          userId: userId,
          amount: creditsToAllocate,
          oneTimeCreditsSnapshot: balances.oneTimeCreditsSnapshot,
          subscriptionCreditsSnapshot: balances.subscriptionCreditsSnapshot,
          type: 'subscription_grant',
          notes: `Yearly subscription monthly credits allocated`,
          relatedOrderId: relatedOrderId,
          createdAt: allocationDate, // use the date of the month to allocate the credits
        });
      }

      return newRemainingMonths > 0;
    });
  }

  return finalUsageData;
}
