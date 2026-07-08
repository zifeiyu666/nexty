import CustomSongLyricGiftsPage from "@/components/occasions/CustomSongLyricGiftsPage";
import { type FinalSongPlayerData } from "@/components/song/FinalSongPlayer";
import { type WallArtSongOption } from "@/components/song/WallArtEditorDrawer";
import { Locale } from "@/i18n/routing";
import { buildSongShareUrl, getFinalSongsForOwner } from "@/lib/ai/final-song";
import { getSession } from "@/lib/auth/server";
import { constructMetadata } from "@/lib/metadata";
import { Metadata } from "next";

type Params = Promise<{ locale: string }>;

function getTimestampedLyrics(
  metadata: unknown,
): FinalSongPlayerData["timestampedLyrics"] {
  if (!metadata || typeof metadata !== "object") return null;
  const timestampedLyrics = (metadata as Record<string, unknown>)
    .timestampedLyrics;
  if (!timestampedLyrics || typeof timestampedLyrics !== "object") return null;
  const alignedWords = (timestampedLyrics as Record<string, unknown>)
    .alignedWords;
  if (!Array.isArray(alignedWords)) return null;

  return {
    alignedWords: alignedWords
      .map((word) => {
        if (!word || typeof word !== "object") return null;
        const record = word as Record<string, unknown>;
        const text = String(record.word ?? "").trim();
        const startS = Number(record.startS);
        const endS = Number(record.endS);
        if (!text || !Number.isFinite(startS) || !Number.isFinite(endS)) {
          return null;
        }
        return { word: text, startS, endS };
      })
      .filter((word): word is { word: string; startS: number; endS: number } =>
        Boolean(word),
      ),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;

  return constructMetadata({
    title: "Free Custom Song Lyric Gifts",
    description:
      "Create custom song lyric gifts with a free lyric AI generator, editable lyrics, lyric wall art, and lyric music video keepsakes.",
    locale: locale as Locale,
    path: "/free-custom-song-lyric-gifts",
    images: ["/images/occasions/custom-song-lyric-gifts-hero.webp"],
  });
}

export default async function FreeCustomSongLyricGiftsPage() {
  const session = await getSession();
  const isAuthenticated = Boolean(session?.user);
  const finalSongs = session?.user
    ? await getFinalSongsForOwner(session.user.id)
    : [];

  const musicVideoSongOptions: FinalSongPlayerData[] = finalSongs.map(
    (song) => ({
      id: song.id,
      title: song.title,
      lyrics: song.lyrics,
      timestampedLyrics: getTimestampedLyrics(song.metadataJsonb),
      genre: song.genre,
      occasion: song.occasion,
      language: song.language,
      vocalGender: song.vocalGender,
      recipientNames: Array.isArray(song.recipientNamesJsonb)
        ? song.recipientNamesJsonb.filter(
            (value): value is string => typeof value === "string",
          )
        : [],
      story: song.story,
      audioUrl: song.audioUrl,
      imageUrl: song.imageUrl,
      duration: song.duration,
      shareUrl: buildSongShareUrl(song),
    }),
  );

  const wallArtSongOptions: WallArtSongOption[] = musicVideoSongOptions.map(
    (song) => ({
      id: song.id,
      title: song.title,
      lyrics: song.lyrics,
      imageUrl: song.imageUrl,
      shareUrl: song.shareUrl,
    }),
  );

  return (
    <CustomSongLyricGiftsPage
      isAuthenticated={isAuthenticated}
      musicVideoSongOptions={musicVideoSongOptions}
      wallArtSongOptions={wallArtSongOptions}
    />
  );
}
