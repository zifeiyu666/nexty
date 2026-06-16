"use client";

import { useUserBenefits } from "@/hooks/useUserBenefits";
import dayjs from "dayjs";
import { Calendar, Film, ImageIcon, Music2 } from "lucide-react";
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

  const totalEntitlements = benefits.totalEntitlements;
  const hasEntitlements =
    totalEntitlements.song > 0 ||
    totalEntitlements.mv > 0 ||
    totalEntitlements.wallArt > 0;

  if (hasEntitlements || benefits.subscriptionStatus === "trialing" || benefits.subscriptionStatus === "active") {
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
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="flex items-center gap-2">
            <Music2 className="w-4 h-4 text-primary" />
            Songs: {totalEntitlements.song}
          </span>
          <span className="flex items-center gap-2">
            <Film className="w-4 h-4 text-primary" />
            MV: {totalEntitlements.mv}
          </span>
          <span className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" />
            Wall art: {totalEntitlements.wallArt}
          </span>
        </div>
      </div>
    );
  }
  // --- End: [custom] Render based on the resolved benefits ---

  return null;
}
