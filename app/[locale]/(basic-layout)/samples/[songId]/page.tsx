import {
  SampleSongPlayer,
  type SampleSongPlayerData,
} from "@/components/song/SampleSongPlayer";
import { Button } from "@/components/ui/button";
import { Locale } from "@/i18n/routing";
import { getFinalSongsForSampleOwner } from "@/lib/ai/final-song";
import { songSampleStore } from "@/lib/ai/song-sample-store";
import { getSession } from "@/lib/auth/server";
import { constructMetadata } from "@/lib/metadata";
import { getUserBenefits } from "@/actions/usage/benefits";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Params = Promise<{ locale: string; songId: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale, songId } = await params;
  const sample = await songSampleStore.get(songId);

  return constructMetadata({
    title: sample?.title || "Song Sample",
    description:
      "Preview your generated custom song sample and recreate it when access expires.",
    locale: locale as Locale,
    path: `/samples/${songId}`,
  });
}

export default async function SampleDetailPage({
  params,
}: {
  params: Params;
}) {
  const { songId } = await params;
  const session = await getSession();
  const benefits = session?.user?.id ? await getUserBenefits(session.user.id) : null;
  const hasActiveSubscription =
    benefits?.subscriptionStatus === "active" || benefits?.subscriptionStatus === "trialing";
  const sample = await songSampleStore.get(songId, {
    hasActiveSubscription,
  });

  if (!sample) notFound();

  const finalizedSongs = session?.user?.id
    ? await getFinalSongsForSampleOwner(session.user.id, sample.songId)
    : [];
  const finalizedVersions = Object.fromEntries(
    finalizedSongs.map((song) => [
      song.selectedVersionId,
      {
        songId: song.id,
        songUrl: `/songs/${song.id}`,
      },
    ])
  );

  const playerData: SampleSongPlayerData = {
    songId: sample.songId,
    title: sample.title,
    lyrics: sample.lyrics,
    genre: sample.genre,
    occasion: sample.occasion,
    language: sample.language,
    vocalGender: sample.vocalGender,
    recipientNames: sample.recipientNames,
    story: sample.story,
    versions: sample.versions,
    previewLimitSeconds: sample.previewLimitSeconds,
    accessExpiresAt: sample.accessExpiresAt,
    isExpired: sample.isExpired,
    finalizedVersions,
  };
  const regenerateParams = new URLSearchParams({
    step: "style",
    occasion: sample.occasion,
    genre: sample.genre,
    language: sample.language,
    vocalGender: sample.vocalGender,
    recipients: sample.recipientNames.join(", "),
    story: sample.story,
    title: sample.title,
    lyrics: sample.lyrics,
  });

  return (
    <main className="min-h-screen w-full bg-[#fbf8f5] px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <Button
          asChild
          className="mb-4 h-10 rounded-full bg-background/80 text-sm font-bold text-muted-foreground shadow-sm hover:text-foreground"
          variant="ghost"
        >
          <Link href="/samples">
            <ArrowLeft className="size-4" />
            Back to samples
          </Link>
        </Button>

        <SampleSongPlayer
          data={playerData}
          regenerateHref={`/create-song?${regenerateParams.toString()}`}
        />
      </div>
    </main>
  );
}
