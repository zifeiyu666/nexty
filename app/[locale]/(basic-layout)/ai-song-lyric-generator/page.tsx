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
    title: locale === "es" ? "Generador gratuito de letras de canciones con IA" : locale === "ja" ? "無料のAI歌詞作成・編集ツール" : "Free AI Song Lyric Generator & Editor",
    description: locale === "es"
      ? "Crea y edita gratis la letra de una canción a partir de una historia real. Después conviértela en una canción personalizada, un vídeo o una lámina."
      : locale === "ja" ? "大切な物語から歌詞を無料で作成・編集し、オリジナルソング、動画、歌詞アートに仕上げられます。"
      : "Generate and edit personal song lyrics free from a real story, then create a custom song, printable lyric poster, or a shareable lyric music video keepsake.",
    locale: locale as Locale,
    path: "/ai-song-lyric-generator",
    images: ["/images/occasions/custom-song-lyric-gifts-hero.webp"],
  });
}

export default async function AiSongLyricGeneratorPage() {
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
