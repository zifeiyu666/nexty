"use client";

import { MagneticSongCard } from "@/components/song/MagneticSongCard";
import { cn } from "@/lib/utils";
import { Calendar, Disc3 } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

type MusicLibraryCardProps = {
  coverBadges?: ReactNode;
  coverFallback?: ReactNode;
  coverFallbackClassName?: string;
  createdFor?: string | null;
  createdText: string;
  dimmed?: boolean;
  footer?: ReactNode;
  imageAlt: string;
  imageUrl?: string | null;
  notice?: ReactNode;
  title: string;
};

export function MusicLibraryCard({
  coverBadges,
  coverFallback,
  coverFallbackClassName,
  createdFor,
  createdText,
  dimmed = false,
  footer,
  imageAlt,
  imageUrl,
  notice,
  title,
}: MusicLibraryCardProps) {
  return (
    <MagneticSongCard>
      <div
        className={cn(
          "relative aspect-square overflow-hidden bg-[#111827]",
          dimmed && "opacity-55",
        )}
      >
        {imageUrl ? (
          <Image
            alt={imageAlt}
            className="size-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
            fill
            sizes="(min-width: 1280px) 260px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            src={imageUrl}
            unoptimized
          />
        ) : (
          <div
            className={cn(
              "flex size-full items-center justify-center bg-[radial-gradient(circle_at_50%_38%,#fb7185_0_12%,#f97316_13%_22%,#111827_23%_100%)]",
              coverFallbackClassName,
            )}
          >
            {coverFallback ?? <Disc3 className="size-24 text-white/80" />}
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.20),transparent_32%,rgba(28,25,23,0.08)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]" />
        {coverBadges ? (
          <div className="pointer-events-none absolute inset-0 z-10">
            {coverBadges}
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-3 px-3.5 py-4",
          dimmed && "opacity-55",
        )}
      >
        <h2 className="line-clamp-2 text-lg font-medium leading-tight text-foreground transition group-hover:text-primary">
          {title}
        </h2>
        {createdFor ? (
          <p className="line-clamp-1 text-sm font-light text-muted-foreground/90">
            {createdFor}
          </p>
        ) : null}
        <p className="mt-auto flex items-center gap-1.5 text-xs font-light text-muted-foreground/80">
          <Calendar className="size-3.5" />
          {createdText}
        </p>
        {notice}
      </div>

      {footer ? (
        <div className="relative flex items-center gap-2 px-3.5 pb-4">
          {footer}
        </div>
      ) : null}
    </MagneticSongCard>
  );
}
