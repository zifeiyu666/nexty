import BirthdaySongsPage from "@/components/occasions/BirthdaySongsPage";
import { Locale } from "@/i18n/routing";
import { constructMetadata } from "@/lib/metadata";
import { Metadata } from "next";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;

  return constructMetadata({
    title: "Custom Personalized Birthday Songs",
    description:
      "Create custom personalized birthday songs with names, memories, studio-quality vocals, free previews, music videos, and printable lyric wall art.",
    locale: locale as Locale,
    path: "/occasions/birthday",
    images: ["/images/occasions/birthday-custom-song-hero.png"],
  });
}

export default function BirthdayOccasionPage() {
  return <BirthdaySongsPage />;
}
