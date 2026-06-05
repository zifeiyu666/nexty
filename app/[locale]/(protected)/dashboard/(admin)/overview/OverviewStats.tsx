import { getOverviewStats } from "@/actions/overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { CombinedStatCard } from "./CombinedStatCard";
import { StatCard } from "./StatCard";

export function OverviewStats() {
  return (
    <Suspense fallback={<OverviewStatsSkeleton />}>
      <OverviewStatsContent />
    </Suspense>
  );
}

async function OverviewStatsContent() {
  const t = await getTranslations("Overview");
  const result = await getOverviewStats();

  if (!result.success) {
    return (
      <div className="flex items-center justify-center h-full min-h-36">
        <p className="text-red-500">
          {result.error || "Failed to load dashboard data."}
        </p>
      </div>
    );
  }

  if (!result.data) {
    return (
      <div className="flex items-center justify-center h-full min-h-36">
        <p className="text-gray-500">No data available.</p>
      </div>
    );
  }

  const stats = result.data;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title={t("newUsers")}
        today={stats.users.today}
        yesterday={stats.users.yesterday}
        growthRate={stats.users.growthRate}
        total={stats.users.total}
        t={t}
      />
      <CombinedStatCard
        title={t("oneTimePayments")}
        count={stats.oneTimePayments.count}
        revenue={stats.oneTimePayments.revenue}
        t={t}
      />
      <CombinedStatCard
        title={t("monthlySubscriptions")}
        count={stats.monthlySubscriptions.count}
        revenue={stats.monthlySubscriptions.revenue}
        t={t}
      />
      <CombinedStatCard
        title={t("yearlySubscriptions")}
        count={stats.yearlySubscriptions.count}
        revenue={stats.yearlySubscriptions.revenue}
        t={t}
      />
    </div>
  );
}

function OverviewStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <Card
          key={i}
          className="bg-linear-to-b from-background to-muted dark:to-muted/50"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              <Skeleton className="h-4 w-28" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>

            <Skeleton className="my-2 h-2 w-full" />

            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
