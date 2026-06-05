"use client";

import { getClientUserBenefits, UserBenefits } from "@/actions/usage/benefits";
import { authClient } from "@/lib/auth/auth-client";
import useSWR from "swr";

const benefitsFetcher = async ([userId]: [string | undefined]) => {
  if (!userId) {
    return null;
  }
  const result = await getClientUserBenefits();
  if (!result.success) {
    throw new Error(result.error || "Failed to fetch benefits.");
  }
  return result.data;
};

export function useUserBenefits() {
  const { data: session, isPending } = authClient.useSession();
  const userId = (session?.user as any | undefined)?.id as string | undefined;

  const { data, error, isLoading, mutate } = useSWR(
    userId && !isPending ? ["user-benefits", userId] : null,
    benefitsFetcher,
    {
      revalidateOnFocus: true,
      shouldRetryOnError: false,
    }
  );

  const optimisticDeduct = (amount: number) => {
    if (!data) return;

    const optimisticData: UserBenefits = JSON.parse(JSON.stringify(data));
    let remainingToDeduct = amount;

    const subDeduction = Math.min(
      optimisticData.subscriptionCreditsBalance,
      remainingToDeduct
    );
    optimisticData.subscriptionCreditsBalance -= subDeduction;
    remainingToDeduct -= subDeduction;

    if (remainingToDeduct > 0) {
      const oneTimeDeduction = Math.min(
        optimisticData.oneTimeCreditsBalance,
        remainingToDeduct
      );
      optimisticData.oneTimeCreditsBalance -= oneTimeDeduction;
    }

    optimisticData.totalAvailableCredits =
      optimisticData.subscriptionCreditsBalance +
      optimisticData.oneTimeCreditsBalance;

    mutate(optimisticData, { revalidate: false });
  };

  return {
    benefits: data,
    isLoading,
    isError: error,
    mutate,
    optimisticDeduct,
  };
} 