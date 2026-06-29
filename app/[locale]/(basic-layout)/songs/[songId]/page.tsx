import {
  FinalSongOwnerPlayer,
  type FinalSongPlayerData,
} from "@/components/song/FinalSongPlayer";
import { GeneratedContentTabs } from "@/components/song/GeneratedContentTabs";
import { Button } from "@/components/ui/button";
import { Locale } from "@/i18n/routing";
import {
  buildSongShareUrl,
  getFinalSongsForOwner,
  getSongForOwner,
} from "@/lib/ai/final-song";
import { getSession } from "@/lib/auth/server";
import { constructMetadata } from "@/lib/metadata";
import { listMusicVideosForSong } from "@/lib/music-video/renders";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type Params = Promise<{ locale: string; songId: string }>;

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
  song: NonNullable<Awaited<ReturnType<typeof getSongForOwner>>>,
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
    shareUrl: buildSongShareUrl(song),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale, songId } = await params;

  return constructMetadata({
    title: "Your Final Song",
    description: "Listen to and share your finalized custom song.",
    locale: locale as Locale,
    path: `/songs/${songId}`,
    noIndex: true,
  });
}

export default async function SongDetailPage({ params }: { params: Params }) {
  const { locale, songId } = await params;
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const song = await getSongForOwner(songId, session.user.id);
  if (!song) notFound();
  const musicVideos = await listMusicVideosForSong({
    songId,
    userId: session.user.id,
  });
  const playerData = toPlayerData(song);
  const songOptions = (await getFinalSongsForOwner(session.user.id)).map(
    toPlayerData,
  );

  return (
    <main className="min-h-screen w-full bg-background px-4 py-6 text-foreground sm:px-6">
      <div className="relative mx-auto max-w-6xl">
        <Button
          asChild
          className="mb-4 h-10 rounded-full bg-card text-sm font-bold text-muted-foreground shadow-[0_10px_30px_rgba(255,120,150,0.09)] hover:text-foreground"
          variant="ghost"
        >
          <Link href="/samples">
            <ArrowLeft className="size-4" />
            Back to samples
          </Link>
        </Button>

        <FinalSongOwnerPlayer data={playerData} songOptions={songOptions} />
        <GeneratedContentTabs
          locale={locale}
          song={playerData}
          videos={musicVideos}
        />
      </div>
    </main>
  );
}
