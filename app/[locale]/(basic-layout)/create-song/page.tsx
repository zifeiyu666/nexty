import CustomSongWizard from "@/components/song/CustomSongWizard";
import { Locale } from "@/i18n/routing";
import { constructMetadata } from "@/lib/metadata";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CreateSong" });

  return constructMetadata({
    title: t("title"),
    description: t("description"),
    locale: locale as Locale,
    path: "/create-song",
  });
}

export default async function CreateSongPage() {
  const t = await getTranslations("CreateSong");

  return (
    <div className="w-full min-h-screen bg-background">
      <section className="sr-only" aria-labelledby="create-song-title">
        <h1 id="create-song-title">{t("srTitle")}</h1>
        <p>{t("srDescription")}</p>
      </section>
      <CustomSongWizard />
    </div>
  );
}
