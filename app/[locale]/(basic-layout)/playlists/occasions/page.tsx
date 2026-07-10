import { PlaylistDirectoryPage } from "@/components/playlists/PlaylistDirectoryPage";
import { Locale } from "@/i18n/routing";
import { constructMetadata } from "@/lib/metadata";
import { playlistDimensions } from "@/lib/playlists/catalog";
import { Metadata } from "next";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;

  return constructMetadata({
    title: "Playlist Ideas by Occasion",
    description: playlistDimensions.occasion.description,
    locale: locale as Locale,
    path: "/playlists/occasions",
  });
}

export default function OccasionPlaylistsPage() {
  return <PlaylistDirectoryPage dimension="occasion" />;
}
