"use client";

import { MusicVideoEditorDrawer } from "@/components/song/MusicVideoEditorDrawer";
import type { FinalSongPlayerData } from "@/components/song/FinalSongPlayer";
import { Button } from "@/components/ui/button";
import type { MusicVideoRender } from "@/lib/music-video/renders";
import { ArrowRight, Download, Film, Loader2, Video } from "lucide-react";
import Link from "next/link";

type GeneratedContentTabsProps = {
  locale: string;
  song: FinalSongPlayerData;
  videos: MusicVideoRender[];
};

export function GeneratedContentTabs({
  locale,
  song,
  videos,
}: GeneratedContentTabsProps) {
  return (
    <section className="relative z-10 mx-auto mt-6 w-full max-w-5xl px-4 sm:px-6 lg:px-8">
      <div className="w-full overflow-hidden rounded-2xl bg-card shadow-[0_18px_54px_rgba(255,120,150,0.11)]">
        <div className="border-b border-border/70 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground">
                Music Video Exports
              </p>
              <h2 className="mt-1 text-2xl font-black text-foreground">
                Music Video History
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Keep every rendered version close to the song so the final gift
                can keep evolving.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              {videos.length ? (
                <GenerateMusicVideoButton placement="header" song={song} />
              ) : null}
              <Button
                asChild
                className="rounded-full bg-white/70"
                variant="outline"
              >
                <Link href="/musicvideos">View all</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {videos.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {videos.map((video) => (
                <article
                  key={video.id}
                  className="grid gap-4 rounded-2xl bg-muted p-3 sm:grid-cols-[112px_1fr]"
                >
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#171412] sm:aspect-[9/12]">
                    {video.videoUrl ? (
                      <video
                        className="size-full object-cover"
                        controls
                        src={video.videoUrl}
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        {video.status === "rendering" ? (
                          <Loader2 className="size-7 animate-spin text-white/70" />
                        ) : (
                          <Film className="size-8 text-white/70" />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="line-clamp-1 text-base font-black text-foreground">
                      {video.title}
                    </p>
                    <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-primary">
                      {video.status}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-muted-foreground">
                      {new Intl.DateTimeFormat(locale, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(video.createdAt)}
                    </p>
                    {video.videoUrl ? (
                      <Button
                        asChild
                        className="mt-3 rounded-full"
                        size="sm"
                      >
                        <a download href={video.videoUrl}>
                          <Download className="size-4" />
                          Download MP4
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-muted p-8 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Video className="size-6" />
              </div>
              <h3 className="mt-4 text-lg font-black text-foreground">
                No music videos yet
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Turn this song into a vertical lyric video with the music video
                editor.
              </p>
              <GenerateMusicVideoButton placement="empty" song={song} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function GenerateMusicVideoButton({
  placement,
  song,
}: {
  placement: "empty" | "header";
  song: FinalSongPlayerData;
}) {
  const buttonClassName =
    placement === "header"
      ? "inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-black text-primary-foreground shadow-[0_12px_26px_rgba(239,62,53,0.22)] transition hover:gap-3 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"
      : "mx-auto mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-black text-primary-foreground shadow-[0_12px_26px_rgba(239,62,53,0.22)] transition hover:gap-3 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2";

  return (
    <MusicVideoEditorDrawer
      initialSong={song}
      trigger={
        <button className={buttonClassName} type="button">
          Generate Music Video
          <ArrowRight className="size-4" />
        </button>
      }
    />
  );
}
