import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link as I18nLink, Locale, routing } from "@/i18n/routing";
import { constructMetadata } from "@/lib/metadata";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Params = Promise<{ locale: string }>;

type MetadataProps = {
  params: Params;
};

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ErrorPage.403" });

  return constructMetadata({
    page: "403",
    title: t("title"),
    description: t("description"),
    locale: locale as Locale,
    path: `/403`,
    canonicalUrl: "/403",
  });
}

export default async function ForbiddenPage({ params }: { params: Params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ErrorPage.403" });

  return (
    <Card className="flex flex-col items-center justify-center m-4 md:m-12 lg:m-24">
      <div className="p-4 md:p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">{t("title")}</h1>
        <p className="mb-6">{t("description")}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="px-4 py-2">
            <I18nLink href={t("button.href")} title={t("button.name")}>
              {t("button.name")}
            </I18nLink>
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
