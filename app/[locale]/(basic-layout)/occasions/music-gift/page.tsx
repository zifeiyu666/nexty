import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

type Params = Promise<{ locale: string }>;

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default async function MusicGiftOccasionRedirectPage({
  params,
}: {
  params: Params;
}) {
  const { locale } = await params;
  const localePrefix = locale === "en" ? "" : `/${locale}`;

  permanentRedirect(`${localePrefix}/music/personalized-gift`);
}
