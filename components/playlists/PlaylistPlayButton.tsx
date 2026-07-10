"use client";

import { Button } from "@/components/ui/button";
import { useGlobalMusicPlayer } from "@/lib/music-player/global-player-store";
import type { DemoTrack } from "@/lib/playlists/catalog";
import { cn } from "@/lib/utils";
import { Pause, Play } from "lucide-react";

type PlaylistPlayButtonProps = {
  className?: string;
  track: DemoTrack;
  variant?: "solid" | "ghost";
};

export function PlaylistPlayButton({
  className,
  track,
  variant = "solid",
}: PlaylistPlayButtonProps) {
  const activeTrack = useGlobalMusicPlayer((state) => state.track);
  const isPlaying = useGlobalMusicPlayer((state) => state.isPlaying);
  const playTrack = useGlobalMusicPlayer((state) => state.playTrack);
  const toggle = useGlobalMusicPlayer((state) => state.toggle);
  const isActive = activeTrack?.id === track.id;

  function handleClick() {
    if (isActive) {
      toggle();
      return;
    }

    playTrack({
      id: track.id,
      title: track.title,
      artist: "One Custom Song",
      audioUrl: track.audioUrl,
    });
  }

  const Icon = isActive && isPlaying ? Pause : Play;

  return (
    <Button
      aria-label={`${isActive && isPlaying ? "Pause" : "Play"} ${track.title}`}
      className={cn(
        "rounded-full",
        variant === "solid"
          ? "bg-stone-950 text-white hover:bg-stone-800"
          : "bg-white/80 text-stone-950 shadow-sm hover:bg-white",
        className,
      )}
      size="sm"
      type="button"
      onClick={handleClick}
    >
      <Icon className="size-3.5" />
      {track.duration}
    </Button>
  );
}
