"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGlobalMusicPlayer } from "@/lib/music-player/global-player-store";
import { cn } from "@/lib/utils";
import { Music2, Pause, Play } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const CONTROL_SIZE = 48;
const EXPANDED_WIDTH = 232;
const EDGE_GAP = 16;

type Position = {
  x: number;
  y: number;
};

type DockSide = "left" | "right";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getDefaultPosition() {
  if (typeof window === "undefined") {
    return { x: EDGE_GAP, y: EDGE_GAP };
  }

  return {
    x: Math.max(EDGE_GAP, window.innerWidth - CONTROL_SIZE - 24),
    y: Math.max(EDGE_GAP, window.innerHeight - CONTROL_SIZE - 24),
  };
}

function getDockedPosition(current: Position): Position {
  const maxX = Math.max(EDGE_GAP, window.innerWidth - CONTROL_SIZE - EDGE_GAP);
  const maxY = Math.max(EDGE_GAP, window.innerHeight - CONTROL_SIZE - EDGE_GAP);
  const centerX = current.x + CONTROL_SIZE / 2;

  return {
    x: centerX < window.innerWidth / 2 ? EDGE_GAP : maxX,
    y: clamp(current.y, EDGE_GAP, maxY),
  };
}

function getDockSide(position: Position): DockSide {
  return position.x + CONTROL_SIZE / 2 < window.innerWidth / 2
    ? "left"
    : "right";
}

function WaveBars({ isPlaying }: { isPlaying: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-6 items-center justify-center gap-0.5"
    >
      {[0, 1, 2, 3].map((bar) => (
        <span
          className={cn(
            "h-2 w-1 rounded-full bg-current opacity-90 transition-all duration-300",
            isPlaying && "animate-[music-wave_0.82s_ease-in-out_infinite]",
          )}
          key={bar}
          style={{
            animationDelay: `${bar * 0.11}s`,
          }}
        />
      ))}
    </span>
  );
}

function TrackLabel({
  title,
  artist,
}: {
  title: string;
  artist?: string;
}) {
  return (
    <span className="min-w-0 flex-1 text-left leading-tight">
      <span className="block truncate text-sm font-semibold text-white">
        {title}
      </span>
      {artist ? (
        <span className="block truncate text-xs font-medium text-white/62">
          {artist}
        </span>
      ) : null}
    </span>
  );
}

export function GlobalMusicController() {
  const { isVisible, isPlaying, track, toggle } = useGlobalMusicPlayer();
  const pathname = usePathname();
  const [position, setPosition] = useState<Position | null>(null);
  const [dockSide, setDockSide] = useState<DockSide>("right");
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);

  useEffect(() => {
    const initialPosition = getDefaultPosition();
    setPosition(initialPosition);
    setDockSide(getDockSide(initialPosition));
  }, []);

  const keepInViewport = useCallback((next: Position) => {
    const maxX = Math.max(EDGE_GAP, window.innerWidth - CONTROL_SIZE - EDGE_GAP);
    const maxY = Math.max(EDGE_GAP, window.innerHeight - CONTROL_SIZE - EDGE_GAP);

    return {
      x: clamp(next.x, EDGE_GAP, maxX),
      y: clamp(next.y, EDGE_GAP, maxY),
    };
  }, []);

  useEffect(() => {
    function handleResize() {
      setPosition((current) => {
        const next = current ? getDockedPosition(current) : getDefaultPosition();
        setDockSide(getDockSide(next));
        return keepInViewport(next);
      });
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [keepInViewport]);

  if (pathname?.includes("/shared/songs/") || !isVisible || !position) {
    return null;
  }

  const playbackLabel = isPlaying ? "Pause music" : "Play music";
  const title = track?.title || "No music playing";
  const artist = track?.artist || "Ready for the next song";

  return (
    <div
      className="group fixed z-50 h-12 overflow-visible transition-[filter] duration-300 ease-out"
      data-global-music-controller=""
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: CONTROL_SIZE,
      }}
    >
      <div
        aria-label={`${title} music controller`}
        className={cn(
          "absolute top-0 flex h-12 w-12 touch-none cursor-grab select-none items-center gap-2 overflow-hidden rounded-full border border-white/12 bg-zinc-950/92 p-0 text-white shadow-[0_16px_40px_rgba(10,10,20,0.3)] backdrop-blur-xl transition-[width,border-radius,box-shadow,background-color] duration-300 ease-out active:cursor-grabbing group-hover:rounded-[1.5rem] group-focus-within:rounded-[1.5rem]",
          dockSide === "right" ? "right-0 flex-row-reverse" : "left-0",
          isPlaying && "shadow-[0_18px_54px_rgba(244,114,182,0.34)]",
          isDragging && "cursor-grabbing transition-none",
        )}
        role="region"
        style={{
          width: isDragging ? CONTROL_SIZE : undefined,
          ["--global-music-controller-expanded-width" as string]: `${EXPANDED_WIDTH}px`,
        }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          dragRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            moved: false,
          };
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (!drag || drag.pointerId !== event.pointerId) return;

          const movement = Math.hypot(
            event.clientX - drag.startX,
            event.clientY - drag.startY,
          );
          if (!drag.moved && movement < 3) return;

          drag.moved = true;
          setIsDragging(true);
          setPosition((current) => {
            const next = keepInViewport({
              x: event.clientX - CONTROL_SIZE / 2,
              y: event.clientY - CONTROL_SIZE / 2,
            });
            setDockSide(getDockSide(next));
            return current?.x === next.x && current.y === next.y ? current : next;
          });
        }}
        onPointerUp={(event) => {
          const didDrag = dragRef.current?.moved;
          if (dragRef.current?.pointerId === event.pointerId) {
            window.setTimeout(() => {
              dragRef.current = null;
            }, 0);
          }
          if (didDrag) {
            setPosition((current) => {
              if (!current) return current;
              const next = getDockedPosition(current);
              setDockSide(getDockSide(next));
              return next;
            });
          }
          setIsDragging(false);
        }}
        onPointerCancel={() => {
          dragRef.current = null;
          setIsDragging(false);
        }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              aria-label="Drag music controller"
              className="flex size-12 shrink-0 touch-none items-center justify-center rounded-full text-white outline-none transition focus-visible:ring-2 focus-visible:ring-white/80"
              type="button"
              onClick={() => {
                if (!dragRef.current?.moved && track) {
                  toggle();
                }
              }}
            >
              <span
                className={cn(
                  "absolute size-8 rounded-full bg-[radial-gradient(circle,#fb7185_0%,#f59e0b_46%,transparent_68%)] opacity-70 blur-md transition",
                  isPlaying ? "scale-100" : "scale-75 opacity-40",
                )}
              />
              <span className="relative flex size-9 items-center justify-center rounded-full bg-white/9">
                {isPlaying ? (
                  <WaveBars isPlaying={isPlaying} />
                ) : (
                  <Music2 className="size-[18px]" />
                )}
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {track ? "Drag or click to toggle" : "Drag music controller"}
          </TooltipContent>
        </Tooltip>

        <div
          className={cn(
            "pointer-events-none flex min-w-0 flex-1 items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100",
            dockSide === "right" ? "flex-row-reverse pl-1.5" : "pr-1.5",
          )}
        >
          <TrackLabel artist={artist} title={title} />
          <Button
            aria-label={playbackLabel}
            className="size-9 shrink-0 rounded-full bg-white text-zinc-950 shadow-sm hover:bg-white/88"
            disabled={!track}
            size="icon"
            type="button"
            onClick={() => {
              if (!dragRef.current?.moved) {
                toggle();
              }
            }}
          >
            {isPlaying ? (
              <Pause className="size-4 fill-current" />
            ) : (
              <Play className="ml-0.5 size-4 fill-current" />
            )}
          </Button>
        </div>
      </div>

      <style jsx global>{`
        [data-global-music-controller]:hover [role="region"],
        [data-global-music-controller]:focus-within [role="region"] {
          width: var(--global-music-controller-expanded-width);
        }

        @keyframes music-wave {
          0%,
          100% {
            height: 0.45rem;
          }
          50% {
            height: 1.45rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          [data-global-music-controller] *,
          [data-global-music-controller] {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
