"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Link } from "@/i18n/routing";
import type { MusicVideoStatus } from "@/lib/db/schema";
import {
  ArrowRight,
  Download,
  Film,
  Loader2,
  Search,
  Video,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

export type MusicVideoListItem = {
  createdAt: string;
  id: string;
  imageUrl: string | null;
  songId: string;
  songTitle: string;
  status: MusicVideoStatus;
  temporaryVideoUrl: string | null;
  title: string;
  videoUrl: string | null;
};

type MusicVideosListProps = {
  createLabel: string;
  emptyDescription: string;
  emptyTitle: string;
  items: MusicVideoListItem[];
  locale: string;
  noMatchesDescription: string;
  noMatchesTitle: string;
  searchPlaceholder: string;
};

export function filterMusicVideosByTitle(
  items: MusicVideoListItem[],
  query: string,
) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) return items;

  return items.filter((item) =>
    item.title.toLowerCase().includes(normalizedQuery),
  );
}

function formatCreatedAt(date: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function statusLabel(status: MusicVideoStatus) {
  if (status === "completed") return "Completed";
  if (status === "failed") return "Failed";
  if (status === "rendering") return "Rendering";
  return "Queued";
}

function statusClassName(status: MusicVideoStatus) {
  if (status === "completed") return "bg-emerald-500 text-white";
  if (status === "failed") return "bg-destructive text-destructive-foreground";
  if (status === "rendering") return "bg-amber-500 text-white";
  return "bg-stone-950 text-white";
}

function MusicVideoCard({
  item,
  locale,
}: {
  item: MusicVideoListItem;
  locale: string;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-video bg-[#171412]">
        {item.videoUrl ? (
          <video
            className="size-full object-cover"
            controls
            preload="metadata"
            src={item.videoUrl}
          />
        ) : item.imageUrl ? (
          <Image
            alt={item.songTitle}
            className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
            fill
            sizes="(min-width: 1536px) 30vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            src={item.imageUrl}
            unoptimized
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-[radial-gradient(circle_at_50%_35%,#f59e0b_0_11%,#fb7185_12%_20%,#171412_21%_100%)]">
            {item.status === "rendering" ? (
              <Loader2 className="size-8 animate-spin text-white/75" />
            ) : (
              <Film className="size-10 text-white/75" />
            )}
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/15" />
        <Badge
          className={`absolute left-3 top-3 border-0 font-black capitalize shadow-sm ${statusClassName(
            item.status,
          )}`}
        >
          {statusLabel(item.status)}
        </Badge>
      </div>

      <div className="p-4 sm:p-5">
        <h2 className="line-clamp-1 text-xl font-black leading-tight text-foreground">
          {item.title}
        </h2>
        <p className="mt-2 line-clamp-1 text-sm font-medium text-muted-foreground">
          {item.songTitle}
        </p>
        <p className="mt-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {formatCreatedAt(item.createdAt, locale)}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {item.videoUrl || item.temporaryVideoUrl ? (
            <Button asChild className="h-10 rounded-full px-4" size="sm">
              <a download href={`/api/musicvideos/${item.id}/download`}>
                <Download className="size-4" />
                Download
              </a>
            </Button>
          ) : null}
          <Button
            asChild
            className="h-10 rounded-full px-4"
            size="sm"
            variant="outline"
          >
            <Link href={`/songs/${item.songId}`}>
              Song
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

export function MusicVideosList({
  createLabel,
  emptyDescription,
  emptyTitle,
  items,
  locale,
  noMatchesDescription,
  noMatchesTitle,
  searchPlaceholder,
}: MusicVideosListProps) {
  const [query, setQuery] = useState("");
  const filteredItems = useMemo(
    () => filterMusicVideosByTitle(items, query),
    [items, query],
  );
  const hasVideos = items.length > 0;

  return (
    <section className="mx-auto w-full max-w-none px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">
            Library
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950">
            All generated videos
          </h2>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            aria-label={searchPlaceholder}
            className="h-12 w-full rounded-full border border-border bg-white pl-11 pr-4 text-base outline-none shadow-sm transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            type="search"
            value={query}
          />
        </div>
      </div>

      {filteredItems.length ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredItems.map((item) => (
            <MusicVideoCard item={item} key={item.id} locale={locale} />
          ))}
        </div>
      ) : (
        <Empty className="mt-8 min-h-[360px] border border-dashed border-border bg-white">
          <EmptyHeader>
            <EmptyMedia
              className="size-14 rounded-full bg-primary/10 text-primary"
              variant="icon"
            >
              {hasVideos ? (
                <Search className="size-6" />
              ) : (
                <Video className="size-6" />
              )}
            </EmptyMedia>
            <EmptyTitle>{hasVideos ? noMatchesTitle : emptyTitle}</EmptyTitle>
            <EmptyDescription>
              {hasVideos ? noMatchesDescription : emptyDescription}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild className="rounded-full">
              <Link href="/songs">{createLabel}</Link>
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </section>
  );
}
