"use client";

import LoginDialog from "@/components/auth/LoginDialog";
import type { FinalSongPlayerData } from "@/components/song/FinalSongPlayer";
import { MusicVideoEditorDrawer } from "@/components/song/MusicVideoEditorDrawer";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { ArrowRight, Music2 } from "lucide-react";
import { useState } from "react";

type MusicVideoStudioCtaProps = {
  isAuthenticated: boolean;
  songOptions: FinalSongPlayerData[];
  label: string;
  className?: string;
};

function MusicVideoEmptyState() {
  return (
    <div className="flex min-h-full items-center justify-center px-5 py-10 text-center">
      <div className="w-full max-w-md">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-sm">
          <Music2 className="size-8" />
        </div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-rose-500">
          Music Video Studio
        </p>
        <h2 className="mt-2 text-3xl font-black leading-tight text-stone-950">
          Create a song first
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-stone-600">
          Music Video needs a finalized song with audio and lyrics before the
          editor can generate a video.
        </p>
        <Button
          asChild
          className="mt-7 rounded-full bg-rose-500 px-6 font-black text-white shadow-sm shadow-rose-500/20 hover:bg-rose-600"
        >
          <Link href="/create-song">
            Create a song
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function MusicVideoStudioCta({
  isAuthenticated,
  songOptions,
  label,
  className,
}: MusicVideoStudioCtaProps) {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const firstSong = songOptions[0];

  if (!isAuthenticated) {
    return (
      <>
        <button
          className={className}
          type="button"
          onClick={() => setIsLoginDialogOpen(true)}
        >
          {label}
          <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
        </button>
        <LoginDialog
          open={isLoginDialogOpen}
          onOpenChange={setIsLoginDialogOpen}
        />
      </>
    );
  }

  return (
    <MusicVideoEditorDrawer
      emptyState={firstSong ? undefined : <MusicVideoEmptyState />}
      initialSong={firstSong}
      songOptions={songOptions}
      trigger={
        <button className={className} type="button">
          {label}
          <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
        </button>
      }
    />
  );
}
