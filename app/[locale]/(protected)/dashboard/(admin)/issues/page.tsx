import { getIssues } from "@/actions/activity/admin";
import { Badge } from "@/components/ui/badge";
import { Locale } from "@/i18n/routing";
import { constructMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import dayjs from "dayjs";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Issues" });
  return constructMetadata({ title: t("title"), description: t("description"), locale: locale as Locale, path: "/dashboard/issues" });
}

export default async function IssuesPage() {
  const result = await getIssues();
  if (!result.success) return <p className="text-destructive">{result.error}</p>;
  const items = result.data?.items ?? [];
  return <div className="space-y-4"><div className="rounded-md border"><div className="grid grid-cols-[1.2fr_1fr_100px_100px_180px] gap-3 border-b px-4 py-3 text-sm font-medium text-muted-foreground"><span>Issue</span><span>Fingerprint</span><span>Events</span><span>Users</span><span>Last seen</span></div>{items.length ? items.map((item) => <div key={item.fingerprint} className="grid grid-cols-[1.2fr_1fr_100px_100px_180px] gap-3 border-b px-4 py-3 text-sm last:border-0"><span><Badge variant="destructive">{item.feature}</Badge><span className="ml-2">{item.action}</span></span><span className="truncate font-mono text-xs" title={item.fingerprint}>{item.fingerprint}</span><span>{item.occurrences}</span><span>{item.affectedUsers}</span><span>{dayjs(item.lastOccurredAt).format("YYYY-MM-DD HH:mm:ss")}</span></div>) : <p className="px-4 py-12 text-center text-muted-foreground">No problem signals recorded.</p>}</div></div>;
}
