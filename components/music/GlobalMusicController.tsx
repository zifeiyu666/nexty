"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  registerGlobalMusicAudio,
  useGlobalMusicPlayer,
} from "@/lib/music-player/global-player-store";
import { cn } from "@/lib/utils";
import { Music2, Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const bars = [
    { height: "0.86rem", delay: "0ms" },
    { height: "1.12rem", delay: "150ms" },
    { height: "1.36rem", delay: "300ms" },
    { height: "1rem", delay: "450ms" },
    { height: "1.26rem", delay: "600ms" },
    { height: "0.92rem", delay: "750ms" },
  ];

  return (
    <span
      aria-hidden="true"
      className="grid h-6 grid-flow-col place-items-center justify-center gap-[3px]"
    >
      {bars.map((bar, index) => (
        <span
          className={cn(
            "h-[0.58rem] w-[1.5px] rounded-full bg-current opacity-90 transition-all duration-500",
            isPlaying && "animate-[music-wave_1.48s_ease-in-out_infinite]",
          )}
          key={index}
          style={{
            ["--music-wave-height" as string]: bar.height,
            animationDelay: bar.delay,
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
  const t = useTranslations("MusicPlayer");
  const {
    duration,
    isVisible,
    isPlaying,
    pause,
    setCurrentTime,
    setDuration,
    setVolume,
    track,
    toggle,
    volume,
  } = useGlobalMusicPlayer();
  const pathname = usePathname();
  const [position, setPosition] = useState<Position | null>(null);
  const [dockSide, setDockSide] = useState<DockSide>("right");
  const [isDragging, setIsDragging] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const setAudioElement = useCallback((audio: HTMLAudioElement | null) => {
    audioRef.current = audio;
    registerGlobalMusicAudio(audio);
  }, []);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    moved: boolean;
    togglesOnRelease: boolean;
  } | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const initialPosition = getDefaultPosition();
      setPosition(initialPosition);
      setDockSide(getDockSide(initialPosition));
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!track) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      return;
    }

    if (audio.getAttribute("src") !== track.audioUrl) {
      audio.src = track.audioUrl;
      audio.load();
    }
  }, [track]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;

    if (!isPlaying) {
      audio.pause();
      return;
    }

    audio.play().catch(() => pause());
  }, [isPlaying, pause, track]);

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

  const playbackLabel = isPlaying ? t("pause") : t("play");
  const title = track?.title || t("noMusicPlaying");
  const artist = track?.artist || t("ready");

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
      <audio
        ref={setAudioElement}
        preload="metadata"
        onDurationChange={(event) => {
          setDuration(event.currentTarget.duration || track?.duration || 0);
        }}
        onEnded={() => {
          setCurrentTime(duration || track?.duration || 0);
          pause();
        }}
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration || track?.duration || 0);
        }}
        onPause={() => {
          if (isPlaying) {
            pause();
          }
        }}
        onTimeUpdate={(event) => {
          const nextDuration =
            event.currentTarget.duration || track?.duration || 0;
          setCurrentTime(event.currentTarget.currentTime);
          setDuration(nextDuration);
        }}
        onVolumeChange={(event) => {
          setVolume(event.currentTarget.volume);
        }}
      />
      <div
        aria-label={t("controller", { title })}
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
          const target = event.target;

          if (
            target instanceof Element &&
            target.closest("[data-global-music-click-control]")
          ) {
            return;
          }

          event.currentTarget.setPointerCapture(event.pointerId);
          dragRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            moved: false,
            togglesOnRelease:
              target instanceof Element &&
              Boolean(target.closest("[data-global-music-toggle-handle]")),
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
          const drag = dragRef.current;
          const didDrag = drag?.moved;
          const shouldToggle = Boolean(
            drag?.togglesOnRelease && !didDrag && track,
          );

          if (drag?.pointerId === event.pointerId) {
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
          if (shouldToggle) {
            toggle();
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
              aria-label={t("dragController")}
              className="grid size-12 shrink-0 touch-none place-items-center rounded-full text-white outline-none transition focus-visible:ring-2 focus-visible:ring-white/80"
              data-global-music-toggle-handle=""
              type="button"
              onClick={(event) => {
                if (event.detail === 0 && track) {
                  toggle();
                }
              }}
            >
              <span
                className={cn(
                  "absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#fb7185_0%,#f59e0b_46%,transparent_68%)] opacity-70 blur-md transition",
                  isPlaying ? "scale-100" : "scale-75 opacity-40",
                )}
              />
              <span className="relative grid size-9 place-items-center rounded-full bg-white/9">
                {isPlaying ? (
                  <WaveBars isPlaying={isPlaying} />
                ) : (
                  <Music2 className="size-[18px]" />
                )}
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {track ? t("dragOrToggle") : t("dragController")}
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
            data-global-music-click-control=""
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
            height: 0.58rem;
          }
          50% {
            height: var(--music-wave-height);
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
