import LyricArtLandingPage from "@/components/landing/LyricArtLandingPage";
import { Locale } from "@/i18n/routing";
import { getFinalSongsForOwner } from "@/lib/ai/final-song";
import { toWallArtSongOptions } from "@/lib/ai/final-song-editor-options";
import { getSession } from "@/lib/auth/server";
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
    title: "Custom Song Lyrics Wall Art | Personalized Music Decor",
    description:
      "Create custom song lyrics wall art with personalized lyrics, names, dates, colors, and layouts. Export print-ready lyric decor for your favorite frame.",
    images: ["https://cdn.sendthesong.io/products/wall-art-01.webp"],
    locale: locale as Locale,
    path: "/custom-song-lyrics-wall-art",
  });
}

export default async function CustomSongLyricsWallArtPage() {
  const session = await getSession();
  const finalSongs = session?.user
    ? await getFinalSongsForOwner(session.user.id)
    : [];

  return (
    <LyricArtLandingPage
      isAuthenticated={Boolean(session?.user)}
      songOptions={toWallArtSongOptions(finalSongs)}
      variant="wall-art"
    />
  );
}
