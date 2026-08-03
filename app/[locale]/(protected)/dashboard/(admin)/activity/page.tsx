import { getActivity } from "@/actions/activity/admin";
import { Locale } from "@/i18n/routing";
import { constructMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ActivityClient } from "./ActivityClient";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Activity" });
  return constructMetadata({ title: t("title"), description: t("description"), locale: locale as Locale, path: "/dashboard/activity" });
}

export default async function ActivityPage() {
  const result = await getActivity({ pageIndex: 0, pageSize: 20 });
  if (!result.success) return <p className="text-destructive">{result.error}</p>;
  return <div className="space-y-4"><ActivityClient initialData={result.data?.items ?? []} initialTotalCount={result.data?.totalCount ?? 0} /></div>;
}
