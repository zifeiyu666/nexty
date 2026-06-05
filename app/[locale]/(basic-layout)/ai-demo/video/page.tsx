import VideoPage from "@/components/ai-demo/video/VideoPage";
import { Link } from "@/i18n/routing";
import { Locale } from "@/i18n/routing";
import { constructMetadata } from "@/lib/metadata";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ChevronRight } from "lucide-react";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "AIDemo.video",
  });

  return constructMetadata({
    title: t("title"),
    description: t("metaDescription"),
    locale: locale as Locale,
    path: `/ai-demo/video`,
  });
}

export default async function VideoDemoPage({
  params,
}: {
  params: Params;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "AIDemo",
  });

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/ai-demo" className="hover:text-foreground transition-colors">
          {t("common.backToHub")}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{t("video.title")}</span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("video.title")}</h1>
        <p className="text-muted-foreground">
          {t("video.metaDescription")}
        </p>
      </div>

      <VideoPage />
    </div>
  );
}
