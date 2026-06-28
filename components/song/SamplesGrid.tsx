"use client";

import { deleteSongSampleAction } from "@/actions/song-samples";
import { MusicLibraryCard } from "@/components/song/MusicLibraryCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { SongSampleView } from "@/lib/ai/song-sample-store";
import { ArrowRight, LockKeyhole, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

type SamplesGridProps = {
  samples: SongSampleView[];
  email?: string;
};

function artworkName(names: string[]): string {
  return names.length ? `for ${names.join(" and ")}` : "for you";
}

function coverImageUrl(sample: SongSampleView): string | undefined {
  return sample.versions.find((version) => version.imageUrl)?.imageUrl;
}

export function SamplesGrid({ samples, email = "" }: SamplesGridProps) {
  const [visibleSamples, setVisibleSamples] = useState(samples);

  useEffect(() => {
    setVisibleSamples(samples);
  }, [samples]);

  if (!visibleSamples.length) return null;

  return (
    <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {visibleSamples.map((sample) => (
        <SampleCard
          key={sample.songId}
          email={email}
          onDeleted={(songId) =>
            setVisibleSamples((current) =>
              current.filter((item) => item.songId !== songId),
            )
          }
          sample={sample}
        />
      ))}
    </div>
  );
}

function SampleCard({
  email,
  onDeleted,
  sample,
}: {
  email: string;
  onDeleted: (songId: string) => void;
  sample: SongSampleView;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const imageUrl = coverImageUrl(sample);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteSongSampleAction({
        songId: sample.songId,
        email,
      });

      if (!result.success) {
        toast.error(result.error || "Unable to delete this sample.");
        return;
      }

      toast.success("Sample deleted.");
      onDeleted(sample.songId);
      router.refresh();
    });
  }

  return (
    <MusicLibraryCard
      coverBadges={
        <>
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-sm backdrop-blur">
            <LockKeyhole className="size-3" />
            Sample
          </span>
          <span className="absolute bottom-3 right-3 rounded-full bg-white/88 px-2.5 py-1 text-[11px] font-semibold text-stone-950 shadow-sm backdrop-blur">
            {sample.previewLimitSeconds ? "1:00 preview" : "Full song"}
          </span>
        </>
      }
      coverFallback={
        <p className="max-w-[72%] rotate-[-4deg] text-center font-[cursive] text-2xl text-primary-foreground">
          {artworkName(sample.recipientNames)}
        </p>
      }
      coverFallbackClassName="bg-gradient-to-br from-primary via-primary/80 to-accent"
      createdFor={`Created for ${sample.recipientNames.join(" and ") || "someone special"}`}
      createdText={`Created ${new Date(sample.createdAt).toLocaleDateString()}`}
      dimmed={sample.isExpired}
      footer={
        <>
          <Button
            asChild
            className="h-10 flex-1 rounded-full bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Link href={`/samples/${sample.songId}`}>
              View details
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                aria-label={`Delete ${sample.title}`}
                className="size-10 rounded-full bg-rose-100 text-rose-700 shadow-sm hover:bg-rose-200 hover:text-rose-800 dark:bg-rose-950/50 dark:text-rose-200 dark:hover:bg-rose-900/70"
                disabled={isPending}
                type="button"
                variant="ghost"
              >
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this sample?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove &quot;{sample.title}&quot; from your sample
                  library. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-300"
                  disabled={isPending}
                  onClick={handleDelete}
                >
                  {isPending ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      }
      imageAlt={`${sample.title} cover`}
      imageUrl={imageUrl}
      notice={
        sample.isExpired ? (
          <p className="rounded-xl bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">
            Expired. Recreate from form data to generate again.
          </p>
        ) : null
      }
      title={sample.title}
    />
  );
}
