"use client";

import { useUserBenefits } from "@/hooks/useUserBenefits";
import dayjs from "dayjs";
import { Calendar, Coins } from "lucide-react";
import { BiCoinStack } from "react-icons/bi";

export default function CurrentUserBenefitsDisplay() {
  const { benefits, isLoading } = useUserBenefits();

  // --- TODO: [custom] Render based on the resolved benefits ---
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <BiCoinStack className="w-4 h-4 text-muted-foreground animate-pulse" />
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!benefits) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <BiCoinStack className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground">-- Credits</span>
      </div>
    );
  }

  if (
    benefits.totalAvailableCredits > 0 ||
    benefits.subscriptionStatus === "trialing" ||
    benefits.subscriptionStatus === "active"
  ) {
    return (
      <div className="flex flex-col gap-2 text-sm">
        {benefits.currentPeriodEnd ? (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span>
              Renewal: {dayjs(benefits.currentPeriodEnd).format("YYYY-MM-DD")}
            </span>
          </div>
        ) : (
          <></>
        )}
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-primary" />
          <span>Credits: {benefits.totalAvailableCredits}</span>
        </div>
      </div>
    );
  }
  // --- End: [custom] Render based on the resolved benefits ---

  return null;
}
