import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/routing";
import type { GiftPlaylist } from "@/lib/playlists/catalog";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Music2 } from "lucide-react";
import Image from "next/image";

import { PlaylistPlayButton } from "./PlaylistPlayButton";

export function PlaylistCard({
  className,
  playlist,
}: {
  className?: string;
  playlist: GiftPlaylist;
}) {
  const primaryDemo = playlist.demos[0];

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-[0_16px_44px_rgba(41,37,36,0.08)] ring-1 ring-stone-200/70 transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(41,37,36,0.12)]",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        <Image
          alt={playlist.shortTitle}
          className="object-cover transition duration-500 group-hover:scale-105"
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          src={playlist.image}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-stone-950/38 via-stone-950/8 to-transparent" />
        <Badge className="absolute bottom-4 left-4 border-0 bg-white/92 text-stone-900 shadow-sm backdrop-blur-sm">
          <Music2 className="size-3" />
          {playlist.songCountLabel}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">
          {playlist.eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-black leading-tight text-stone-950">
          <Link href={playlist.canonicalPath}>{playlist.shortTitle}</Link>
        </h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">
          {playlist.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {playlist.secondaryKeywords.slice(0, 2).map((keyword) => (
            <span
              className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700"
              key={keyword}
            >
              {keyword}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          {primaryDemo ? (
            <PlaylistPlayButton track={primaryDemo} variant="ghost" />
          ) : (
            <span />
          )}
          <Link
            className="inline-flex items-center gap-1 text-sm font-black text-stone-950 transition hover:text-primary"
            href={playlist.canonicalPath}
          >
            Build this playlist
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
