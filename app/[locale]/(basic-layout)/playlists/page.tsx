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
    title: locale === "es" ? "Ideas de playlists para regalar" : locale === "ja" ? "プレゼントにおすすめのプレイリストアイデア" : "Gift Playlist Ideas for Custom Song Gifts",
    description: locale === "es"
      ? "Descubre ideas de playlists por ocasión, destinatario y estilo musical, y añade una canción personalizada creada con vuestra historia."
      : locale === "ja" ? "用途、贈る相手、音楽スタイル別のプレイリストに、思い出から作ったオリジナルソングを加えられます。"
      : "Browse song playlists for gifts by occasion, recipient, and music style, then add a custom song made from your story.",
    locale: locale as Locale,
    path: "/playlists",
  });
}

export default function PlaylistsPage() {
  return <PlaylistsHubPage />;
}
