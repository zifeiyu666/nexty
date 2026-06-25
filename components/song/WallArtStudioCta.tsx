"use client";

import LoginDialog from "@/components/auth/LoginDialog";
import {
  WallArtEditorDrawer,
  type WallArtSongOption,
} from "@/components/song/WallArtEditorDrawer";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

type WallArtStudioCtaProps = {
  isAuthenticated: boolean;
  songOptions: WallArtSongOption[];
  label: string;
  className?: string;
};

export function WallArtStudioCta({
  isAuthenticated,
  songOptions,
  label,
  className,
}: WallArtStudioCtaProps) {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

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
    <WallArtEditorDrawer
      initialSong={songOptions[0]}
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
