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
    title: "Song Lyrics Poster Maker | Create Printable Lyric Posters",
    description:
      "Make a song lyrics poster online. Customize lyrics, typography, colors, layouts, and artwork, then download an aesthetic printable music poster.",
    images: ["https://cdn.sendthesong.io/products/wall-art-07.webp"],
    locale: locale as Locale,
    path: "/lyric-poster-maker",
  });
}

export default async function LyricPosterMakerPage() {
  const session = await getSession();
  const finalSongs = session?.user
    ? await getFinalSongsForOwner(session.user.id)
    : [];

  return (
    <LyricArtLandingPage
      isAuthenticated={Boolean(session?.user)}
      songOptions={toWallArtSongOptions(finalSongs)}
      variant="poster-maker"
    />
  );
}
