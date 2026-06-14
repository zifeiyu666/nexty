import {
  SampleSongPlayer,
  type SampleSongPlayerData,
} from "@/components/song/SampleSongPlayer";
import { Button } from "@/components/ui/button";
import { Locale } from "@/i18n/routing";
import { hasActiveSubscription } from "@/lib/ai/song";
import { songSampleStore } from "@/lib/ai/song-sample-store";
import { getSession } from "@/lib/auth/server";
import { constructMetadata } from "@/lib/metadata";
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
  const sample = await songSampleStore.get(songId);

  if (!sample) notFound();

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

  const session = await getSession();
  const isSubscriber = session?.user ? await hasActiveSubscription(session.user.id) : false;

  return (
    <main className="min-h-screen bg-muted px-4 py-6 text-foreground sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Button
          asChild
          className="mb-4 h-10 rounded-full bg-background text-sm font-bold text-muted-foreground shadow-sm hover:text-foreground"
          variant="ghost"
        >
          <Link href="/samples">
            <ArrowLeft className="size-4" />
            Back to samples
          </Link>
        </Button>

        <section className="rounded-3xl border border-border bg-background p-4 shadow-sm sm:p-6">
          <SampleSongPlayer
            data={playerData}
            regenerateHref={`/create-song?${regenerateParams.toString()}`}
            isSubscriber={isSubscriber}
          />
        </section>
      </div>
    </main>
  );
}
