import { PlaylistsHubPage } from "@/components/playlists/PlaylistsHubPage";
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
    title: "Gift Playlist Ideas for Custom Song Gifts",
    description:
      "Browse song playlists for gifts by occasion, recipient, and music style, then add a custom song made from your story.",
    locale: locale as Locale,
    path: "/playlists",
  });
}

export default function PlaylistsPage() {
  return <PlaylistsHubPage />;
}
