import {
  SharedSongFullscreenPlayer,
} from "@/components/song/SharedSongFullscreenPlayer";
import type { FinalSongPlayerData } from "@/components/song/FinalSongPlayer";
import { Locale } from "@/i18n/routing";
import { getSharedSong } from "@/lib/ai/final-song";
import { constructMetadata } from "@/lib/metadata";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type Params = Promise<{ locale: string; shareToken: string }>;

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

function toPlayerData(
  song: NonNullable<Awaited<ReturnType<typeof getSharedSong>>>,
): FinalSongPlayerData {
  return {
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
  };
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale, shareToken } = await params;
  const song = await getSharedSong(shareToken);

  return constructMetadata({
    title: song?.title || "Shared Custom Song",
    description: "Listen to a shared personalized song.",
    locale: locale as Locale,
    path: `/shared/songs/${shareToken}`,
    noIndex: true,
  });
}

export default async function SharedSongPage({
  params,
}: {
  params: Params;
}) {
  const { shareToken } = await params;
  const song = await getSharedSong(shareToken);

  if (!song) notFound();

  return <SharedSongFullscreenPlayer data={toPlayerData(song)} />;
}
