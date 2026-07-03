"use client";

import { motion, type Transition, useReducedMotion } from "framer-motion";
import {
  ChevronDown,
  Edit3,
  Pause,
  Play,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type SongResultVersion = {
  displayId: string;
  title: string;
  audioUrl?: string;
  disabled?: boolean;
  providerVersionId?: string;
};

export type SongResultMetadataPill = {
  icon: ReactNode;
  label: string;
};

type LyricBlock = {
  id: string;
  lines: string[];
  weight: number;
};

type SongResultViewProps = {
  activeVersion: string;
  bottomCta?: ReactNode;
  className?: string;
  coverImageUrl?: string | null;
  displayDuration: number;
  heroEyebrow?: string;
  isPlaying: boolean;
  lyrics: string;
  lyricsOccasionLabel: string;
  metadataPills: SongResultMetadataPill[];
  previewTime: number;
  statusBanner?: ReactNode;
  title: string;
  versions: SongResultVersion[];
  versionsDescription?: string;
  versionsEyebrow?: string;
  versionsHeading: string;
  onPlaybackToggle: (version: string, audioUrl: string) => void;
  renderVersionAction: (args: {
    index: number;
    isActiveVersion: boolean;
    isThisPlaying: boolean;
    version: SongResultVersion;
  }) => ReactNode;
};

function splitLyricTitle(lyrics: string, fallbackTitle: string) {
  const lines = lyrics.split(/\r?\n/);
  const titleIndex = lines.findIndex((line) => /^Title:\s*/i.test(line.trim()));

  if (titleIndex === -1) {
    return {
      displayTitle: fallbackTitle,
      lyricBody: lyrics,
    };
  }

  const displayTitle = lines[titleIndex]
    .trim()
    .replace(/^Title:\s*/i, "")
    .trim();
  const lyricBody = lines
    .filter((_, index) => index !== titleIndex)
    .join("\n")
    .trim();

  return {
    displayTitle: displayTitle || fallbackTitle,
    lyricBody,
  };
}

function createLyricBlocks(lyrics: string) {
  const lines = lyrics.split(/\r?\n/);
  const blocks: LyricBlock[] = [];
  let currentLines: string[] = [];

  function pushBlock() {
    if (!currentLines.some((line) => line.trim())) {
      currentLines = [];
      return;
    }

    blocks.push({
      id: `lyric-block-${blocks.length}`,
      lines: currentLines,
      weight: currentLines.filter((line) => line.trim()).length,
    });
    currentLines = [];
  }

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    const isSectionLabel = /^\[[^\]]+\]$/.test(trimmedLine);

    if (!trimmedLine) {
      pushBlock();
      return;
    }

    if (isSectionLabel && currentLines.some((item) => item.trim())) {
      pushBlock();
    }

    currentLines.push(line);
  });

  pushBlock();

  const columns: LyricBlock[][] = [[], []];
  const columnWeights = [0, 0];

  blocks.forEach((block) => {
    const columnIndex = columnWeights[0] <= columnWeights[1] ? 0 : 1;
    columns[columnIndex].push(block);
    columnWeights[columnIndex] += block.weight;
  });

  return columns;
}

function formatPlaybackTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.ceil(seconds));

  if (safeSeconds < 60) {
    return `${safeSeconds}s`;
  }

  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes}m ${remainingSeconds}s`;
}

function LyricBlockView({ block }: { block: LyricBlock }) {
  return (
    <section className="break-inside-avoid text-center">
      {block.lines.map((line, index) => {
        const trimmedLine = line.trim();
        const isSectionLabel = /^\[[^\]]+\]$/.test(trimmedLine);

        if (isSectionLabel) {
          return (
            <p
              key={`${block.id}-${index}`}
              className="mb-2 text-center text-xs font-black uppercase tracking-[0.12em] text-muted-foreground/55"
            >
              {trimmedLine}
            </p>
          );
        }

        return (
          <p
            key={`${block.id}-${index}`}
            className="font-sans font-semibold text-foreground"
          >
            {line}
          </p>
        );
      })}
    </section>
  );
}

export function SongCoverBackdrop({
  imageUrl,
  title,
}: {
  imageUrl?: string | null;
  title: string;
}) {
  if (!imageUrl) {
    return (
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[380px] opacity-70">
        <div className="absolute inset-x-0 top-[-70px] h-[520px] bg-[radial-gradient(circle_at_36%_34%,rgba(255,184,193,0.56),transparent_34%),radial-gradient(circle_at_64%_34%,rgba(44,31,24,0.24),transparent_38%),linear-gradient(135deg,rgba(255,225,229,0.52),rgba(42,29,24,0.18))] blur-sm" />
        {/* <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent via-background/86 to-background" /> */}
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-[-10px] h-[420px]">
      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-x-0 top-[-72px] h-[560px] w-full object-cover opacity-28 blur-lg"
        src={imageUrl}
      />
      {/* <img
        alt={title}
        className="absolute left-1/2 top-[-52px] h-[500px] w-[min(900px,calc(100vw-2rem))] -translate-x-1/2  object-cover opacity-18 blur-sm"
        src={imageUrl}
      /> */}
      {/* <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent via-background/88 to-background" /> */}
    </div>
  );
}

const organicDecoPath =
  "M161 54.69C230.4 4.986 303.7 8.661 414.4 92.19C465.7 130.9 432.3 211.4 460 279.5C481 331.2 449.7 430.4 381.1 427C287.1 422.3 172.4 503.8 99.27 444.6C21.03 381.1 10.32 258.3 55.25 145.6C73.73 99.3 129.3 77.36 161 54.69Z";

const organicCoverPath =
  "M189 80.37C243 66.12 307.3 87.28 350.9 124.1C389.3 156.6 417 211.2 418.1 263.4C419.1 305.7 401.8 355.6 368.5 379.1C298.8 428 179.2 446.4 117.6 386.3C65.4 335.3 78.55 230.3 105.5 160.5C119.7 123.6 152.6 89.85 189 80.37Z";

const organicCoverMorphPath =
  "M207.2 75.8C260.5 45.2 341.6 73.8 381.4 121.6C421.5 169.8 423.3 257.9 395.9 317.4C365.8 382.9 291.8 424.5 221.9 413.9C155.2 403.8 91.25 354.5 77.75 288.3C62.9 215.6 91.92 128.2 151.8 91.26C168.8 80.8 187.2 87.3 207.2 75.8Z";

const organicTransformStyle = {
  transformBox: "fill-box",
  transformOrigin: "center",
} as CSSProperties;

export function OrganicSongCover({
  imageUrl,
  isPlaying = false,
  onPlaybackToggle,
  playbackProgress = 0,
  showPlaybackControl = false,
  showVisualizer = false,
  title,
}: {
  imageUrl?: string | null;
  isPlaying?: boolean;
  onPlaybackToggle?: () => void;
  playbackProgress?: number;
  showPlaybackControl?: boolean;
  showVisualizer?: boolean;
  title: string;
}) {
  const clipPathId = `song-organic-cover-clip-${useId().replace(/:/g, "")}`;
  const prefersReducedMotion = useReducedMotion();
  const [isCoverActive, setIsCoverActive] = useState(false);
  const coverActivationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const shouldMorph = isCoverActive && !prefersReducedMotion;
  const pathAnimationTransition: Transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.8, ease: [0.645, 0.045, 0.355, 1] };
  const imageAnimationTransition: Transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.8, ease: [0.77, 0, 0.175, 1] };
  const decoAnimationTransition: Transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 1.3, ease: [0.25, 0.46, 0.45, 0.94] };

  const clearCoverActivationTimeout = useCallback(() => {
    if (coverActivationTimeoutRef.current !== null) {
      clearTimeout(coverActivationTimeoutRef.current);
      coverActivationTimeoutRef.current = null;
    }
  }, []);

  const queueCoverActivation = useCallback(() => {
    clearCoverActivationTimeout();
    coverActivationTimeoutRef.current = setTimeout(() => {
      setIsCoverActive(true);
      coverActivationTimeoutRef.current = null;
    }, 75);
  }, [clearCoverActivationTimeout]);

  const deactivateCover = useCallback(() => {
    clearCoverActivationTimeout();
    setIsCoverActive(false);
  }, [clearCoverActivationTimeout]);

  useEffect(() => clearCoverActivationTimeout, [clearCoverActivationTimeout]);
  const isInteractive = Boolean(showPlaybackControl && onPlaybackToggle);
  const safePlaybackProgress = Math.min(Math.max(playbackProgress, 0), 1);
  const progressRingRadius = 30;
  const progressRingCircumference = 2 * Math.PI * progressRingRadius;
  const progressRingOffset =
    progressRingCircumference * (1 - safePlaybackProgress);

  return (
    <button
      className={cn(
        "group relative isolate mx-auto h-64 w-72 border-0 bg-transparent p-0 text-left transition-[filter] duration-300 ease-out drop-shadow-[0_24px_52px_rgba(63,63,63,0.20)] hover:drop-shadow-[0_34px_74px_rgba(45,31,24,0.22)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 focus-visible:ring-offset-4 motion-reduce:transition-none sm:h-72 sm:w-80",
        isInteractive ? "cursor-pointer" : "cursor-default",
      )}
      aria-label={`${title} cover`}
      aria-pressed={isInteractive ? isPlaying : undefined}
      type="button"
      disabled={!isInteractive}
      onClick={onPlaybackToggle}
      onPointerEnter={queueCoverActivation}
      onPointerLeave={deactivateCover}
      onPointerDown={queueCoverActivation}
      onPointerUp={deactivateCover}
      onPointerCancel={deactivateCover}
    >
      {showVisualizer ? (
        <svg
          aria-hidden="true"
          className={cn(
            "song-cover-visualizer absolute inset-0 -z-10 h-full w-full overflow-visible transition-[opacity,transform] duration-300",
            isPlaying && "is-playing",
          )}
          focusable="false"
          viewBox="0 0 500 500"
        >
          {Array.from({ length: 168 }).map((_, index) => {
            const angle = (index / 168) * Math.PI * 2 - Math.PI / 2;
            const innerRadius = 218 + ((index * 5) % 9);
            const length = 15 + ((index * 13) % 24);
            const outerRadius = innerRadius + length;
            const x1 = 250 + Math.cos(angle) * innerRadius;
            const y1 = 250 + Math.sin(angle) * innerRadius;
            const x2 = 250 + Math.cos(angle) * outerRadius;
            const y2 = 250 + Math.sin(angle) * outerRadius;

            return (
              <line
                key={index}
                className="song-cover-visualizer-line"
                strokeLinecap="round"
                strokeWidth="1.8"
                style={
                  {
                    "--wave-delay": `${(index % 24) * 28}ms`,
                  } as CSSProperties
                }
                x1={x1}
                x2={x2}
                y1={y1}
                y2={y2}
              />
            );
          })}
        </svg>
      ) : null}
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        focusable="false"
        viewBox="0 0 500 500"
      >
        <defs>
          <clipPath id={clipPathId}>
            <motion.path
              animate={{
                d: shouldMorph ? organicCoverMorphPath : organicCoverPath,
                rotate: shouldMorph ? 3 : 0,
                scaleX: 1,
                scaleY: 1,
                x: shouldMorph ? -4 : 0,
                y: 0,
              }}
              d={organicCoverPath}
              style={organicTransformStyle}
              transition={pathAnimationTransition}
            />
          </clipPath>
          <linearGradient
            id={`${clipPathId}-fallback`}
            x1="70"
            x2="430"
            y1="80"
            y2="420"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="hsl(var(--accent))" />
            <stop offset="0.52" stopColor="hsl(var(--primary) / 0.34)" />
            <stop offset="1" stopColor="hsl(var(--foreground) / 0.72)" />
          </linearGradient>
          <radialGradient
            id={`${clipPathId}-shine`}
            cx="33%"
            cy="20%"
            r="62%"
          >
            <stop offset="0" stopColor="white" stopOpacity="0.58" />
            <stop offset="0.44" stopColor="white" stopOpacity="0.12" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        <motion.g
          animate={{
            rotate: shouldMorph ? 2 : 0,
            scaleX: shouldMorph ? 1.04 : 1,
            scaleY: shouldMorph ? 0.98 : 1,
            x: shouldMorph ? -8 : 0,
            y: 0,
          }}
          className="origin-center"
          style={organicTransformStyle}
          transition={decoAnimationTransition}
        >
          <path d={organicDecoPath} fill="#3f3f3f" opacity="0.96" />
        </motion.g>
        <ellipse
          className="fill-primary/10"
          cx="245"
          cy="430"
          rx="150"
          ry="34"
        />
        <g clipPath={`url(#${clipPathId})`}>
          <rect
            width="500"
            height="500"
            fill={`url(#${clipPathId}-fallback)`}
          />
          {imageUrl ? (
            <motion.image
              animate={{
                rotate: shouldMorph ? -3 : 0,
                scaleX: shouldMorph ? 1.08 : 1,
                scaleY: shouldMorph ? 1.08 : 1,
                x: shouldMorph ? -10 : 0,
                y: 0,
              }}
              className="organic-cover-image"
              href={imageUrl}
              height="500"
              preserveAspectRatio="xMidYMid slice"
              style={organicTransformStyle}
              transition={imageAnimationTransition}
              width="500"
              x="0"
              y="0"
            />
          ) : (
            <motion.g
              animate={{
                rotate: shouldMorph ? -3 : 0,
                scaleX: shouldMorph ? 1.08 : 1,
                scaleY: shouldMorph ? 1.08 : 1,
                x: shouldMorph ? -10 : 0,
                y: 0,
              }}
              style={organicTransformStyle}
              transition={imageAnimationTransition}
            >
              <circle
                cx="215"
                cy="170"
                fill="hsl(var(--primary) / 0.15)"
                r="82"
              />
              <circle
                cx="318"
                cy="255"
                fill="hsl(var(--foreground) / 0.42)"
                r="112"
              />
              <circle
                cx="174"
                cy="322"
                fill="hsl(var(--accent) / 0.46)"
                r="68"
              />
            </motion.g>
          )}
        </g>
        <motion.path
          animate={{
            d: shouldMorph ? organicCoverMorphPath : organicCoverPath,
            rotate: shouldMorph ? 3 : 0,
            scaleX: 1,
            scaleY: 1,
            x: shouldMorph ? -4 : 0,
            y: 0,
          }}
          clipPath={`url(#${clipPathId})`}
          d={organicCoverPath}
          fill={`url(#${clipPathId}-shine)`}
          opacity="0.82"
          style={organicTransformStyle}
          transition={pathAnimationTransition}
        />
      </svg>
      {showPlaybackControl ? (
        <span className="absolute left-1/2 top-1/2 z-10 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/38 text-white opacity-45 shadow-[0_12px_32px_rgba(45,31,24,0.14),inset_0_1px_0_rgba(255,255,255,0.48)] backdrop-blur-[3px] transition-[transform,opacity,background-color,box-shadow] duration-200 group-hover:scale-105 group-hover:bg-white/58 group-hover:opacity-100 group-hover:shadow-[0_18px_48px_rgba(45,31,24,0.22),inset_0_1px_0_rgba(255,255,255,0.66)] group-focus-visible:scale-105 group-focus-visible:bg-white/58 group-focus-visible:opacity-100 group-focus-visible:shadow-[0_18px_48px_rgba(45,31,24,0.22),inset_0_1px_0_rgba(255,255,255,0.66)]">
          <svg
            aria-hidden="true"
            className="absolute inset-0 size-full -rotate-90"
            focusable="false"
            viewBox="0 0 64 64"
          >
            <circle
              className="song-cover-playback-ring-base"
              cx="32"
              cy="32"
              fill="none"
              r={progressRingRadius}
              strokeLinecap="round"
              strokeWidth="1.4"
            />
            <circle
              className="song-cover-playback-ring-progress"
              cx="32"
              cy="32"
              fill="none"
              r={progressRingRadius}
              strokeDasharray={progressRingCircumference}
              strokeDashoffset={progressRingOffset}
              strokeLinecap="round"
              strokeWidth="1.8"
            />
          </svg>
          {isPlaying ? (
            <Pause className="relative z-10 size-7 fill-current drop-shadow" />
          ) : (
            <Play className="relative z-10 ml-1 size-7 fill-current drop-shadow" />
          )}
        </span>
      ) : null}
    </button>
  );
}

export function InfoPill({ icon, label }: SongResultMetadataPill) {
  return (
    <span className="relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white/28 px-3.5 py-2 text-xs font-semibold text-foreground/72 shadow-[0_8px_32px_rgba(45,31,24,0.08),inset_0_1px_0_rgba(255,255,255,0.76),inset_0_-1px_0_rgba(255,255,255,0.2),inset_0_0_18px_6px_rgba(255,255,255,0.28)] backdrop-blur-xl before:pointer-events-none before:absolute before:inset-x-3 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/80 before:to-transparent after:pointer-events-none after:absolute after:bottom-2 after:left-0 after:top-2 after:w-px after:bg-gradient-to-b after:from-white/80 after:via-transparent after:to-white/30 dark:bg-white/12 dark:text-foreground/74 dark:shadow-[0_8px_32px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(255,255,255,0.08),inset_0_0_18px_6px_rgba(255,255,255,0.06)]">
      <span className="relative z-10 text-primary">{icon}</span>
      <span className="relative z-10">{label}</span>
    </span>
  );
}

function SongResultVersionCard({
  children,
  disabled,
}: {
  children: ReactNode;
  disabled?: boolean;
}) {
  const frameRef = useRef<number | null>(null);

  const resetTilt = useCallback((element: HTMLElement) => {
    element.style.setProperty("--song-card-rotate-x", "0deg");
    element.style.setProperty("--song-card-rotate-y", "0deg");
    element.style.setProperty("--song-card-lift", "0px");
    element.style.setProperty("--song-card-scale", "1");
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;

    const element = event.currentTarget;
    const { left, top, width, height } = element.getBoundingClientRect();
    const x = (event.clientX - left) / width - 0.5;
    const y = (event.clientY - top) / height - 0.5;
    const rotateX = y * -7;
    const rotateY = x * 8;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      element.style.setProperty("--song-card-rotate-x", `${rotateX.toFixed(2)}deg`);
      element.style.setProperty("--song-card-rotate-y", `${rotateY.toFixed(2)}deg`);
      element.style.setProperty("--song-card-lift", "-5px");
      element.style.setProperty("--song-card-scale", "1.012");
    });
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    resetTilt(event.currentTarget);
  };

  return (
    <div
      className={cn(
        "group cursor-pointer rounded-2xl bg-card p-4 shadow-[0_18px_48px_rgba(255,120,150,0.16)] transition-[transform,box-shadow,opacity] duration-300 ease-out [transform:perspective(900px)_translateY(var(--song-card-lift,0px))_rotateX(var(--song-card-rotate-x,0deg))_rotateY(var(--song-card-rotate-y,0deg))_scale(var(--song-card-scale,1))] [transform-style:preserve-3d] hover:shadow-[0_30px_72px_rgba(255,104,142,0.25)] motion-reduce:transform-none",
        disabled && "cursor-default opacity-55 hover:shadow-[0_18px_48px_rgba(255,120,150,0.16)]",
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={
        {
          "--song-card-rotate-x": "0deg",
          "--song-card-rotate-y": "0deg",
          "--song-card-lift": "0px",
          "--song-card-scale": "1",
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

export function SongResultView({
  activeVersion,
  bottomCta,
  className,
  coverImageUrl,
  displayDuration,
  heroEyebrow = "Ta-da! Congratulation!",
  isPlaying,
  lyrics,
  lyricsOccasionLabel,
  metadataPills,
  previewTime,
  statusBanner,
  title,
  versions,
  versionsDescription = "Same lyrics, two different recordings. Play both previews below and choose the one that fits the moment.",
  versionsEyebrow = "here they are...",
  versionsHeading,
  onPlaybackToggle,
  renderVersionAction,
}: SongResultViewProps) {
  const [isLyricsExpanded, setIsLyricsExpanded] = useState(true);
  const { displayTitle: lyricTitle, lyricBody } = splitLyricTitle(
    lyrics,
    title || "Your Custom Song",
  );
  const lyricColumns = createLyricBlocks(lyricBody);
  const displayTitle = title || "Your Custom Song";

  return (
    <div className={cn("relative w-full pt-0", className)}>
      <SongCoverBackdrop imageUrl={coverImageUrl} title={displayTitle} />

      {/* {statusBanner && <div className="relative z-10 mb-5">{statusBanner}</div>} */}

      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-5xl gap-7 lg:grid-cols-[288px_1fr] lg:items-center">
          <OrganicSongCover imageUrl={coverImageUrl} title={displayTitle} />

          <div>
            <p className="mb-1 handwritten-subtitle text-2xl font-normal leading-none text-accent-foreground">
              {heroEyebrow}
            </p>
            <h1 className="max-w-4xl text-5xl font-black leading-tight text-foreground">
              {displayTitle}
            </h1>
            <div className="mt-4 flex flex-wrap gap-2">
              {metadataPills.map((pill, index) => (
                <InfoPill
                  key={`${pill.label}-${index}`}
                  icon={pill.icon}
                  label={pill.label}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mt-9 w-full max-w-5xl text-center">
          <p className="handwritten-subtitle text-2xl leading-none text-accent-foreground">
            {versionsEyebrow}
          </p>
          <h2 className="text-xl font-bold text-foreground md:text-2xl">
            {versionsHeading}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {versionsDescription}
          </p>
        </div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mt-6 grid w-full max-w-5xl gap-4 md:grid-cols-2">
          {versions.map((version, index) => {
            const isActiveVersion = activeVersion === version.displayId;
            const isThisPlaying = isActiveVersion && isPlaying;
            const isVersionA = index === 0;
            const versionAction = renderVersionAction({
              index,
              isActiveVersion,
              isThisPlaying,
              version,
            });

            return (
              <SongResultVersionCard
                key={version.displayId}
                disabled={version.disabled}
              >
                <div className="mb-3 flex items-start gap-3">
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-black text-primary-foreground",
                      isVersionA ? "bg-foreground" : "bg-primary",
                    )}
                  >
                    {version.displayId}
                  </span>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground">
                      Version {version.displayId}
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {version.title || displayTitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-muted p-3">
                  <button
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full text-primary-foreground shadow-sm transition-[transform,box-shadow,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:hover:shadow-sm",
                      isVersionA
                        ? "bg-foreground hover:bg-foreground/90 hover:shadow-[0_12px_26px_rgba(45,31,24,0.22)]"
                        : "bg-primary hover:bg-primary/90 hover:shadow-[0_12px_26px_rgba(239,62,53,0.28)]",
                    )}
                    type="button"
                    disabled={version.disabled || !version.audioUrl}
                    onClick={() =>
                      onPlaybackToggle(
                        version.displayId,
                        version.audioUrl || "",
                      )
                    }
                    aria-label={`Play version ${version.displayId}`}
                  >
                    {isThisPlaying ? (
                      <Pause className="size-4 fill-current" />
                    ) : (
                      <Play className="ml-0.5 size-4 fill-current" />
                    )}
                  </button>
                  <div
                    className="flex h-10 flex-1 items-center gap-1 overflow-hidden"
                    aria-hidden="true"
                  >
                    {Array.from({ length: 56 }).map((_, barIndex) => (
                      <span
                        key={barIndex}
                        className={cn(
                          "song-waveform-bar w-0.5 shrink-0 rounded-full",
                          isVersionA
                            ? isThisPlaying
                              ? "bg-foreground/35"
                              : "bg-foreground/15"
                            : isThisPlaying
                              ? "bg-primary/35"
                              : "bg-primary/15",
                        )}
                        style={{
                          height: `${7 + ((barIndex * 11 + index * 5) % 26)}px`,
                          animationDelay: isThisPlaying
                            ? `${(barIndex % 14) * 46}ms`
                            : undefined,
                          animationDuration: isThisPlaying
                            ? `${620 + ((barIndex * 37) % 260)}ms`
                            : undefined,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {formatPlaybackTime(isActiveVersion ? previewTime : 0)} /{" "}
                    {formatPlaybackTime(displayDuration)}
                  </span>
                </div>

                {versionAction && (
                  <div className="mt-3 border-t border-border/70 pt-3">
                    {versionAction}
                  </div>
                )}
              </SongResultVersionCard>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-2xl bg-card shadow-[0_18px_54px_rgba(255,120,150,0.11)]">
          <div className="flex items-center justify-between px-5 pb-2 pt-5">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Edit3 className="size-4" />
              </span>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground">
                  Written for {lyricsOccasionLabel}
                </p>
                <h3 className="text-lg font-black text-foreground">
                  The lyrics
                </h3>
              </div>
            </div>
            <button
              className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground transition-[background-color,color,transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary/10 hover:text-primary hover:shadow-[0_10px_24px_rgba(239,62,53,0.12)] active:translate-y-0"
              type="button"
              aria-expanded={isLyricsExpanded}
              aria-label={
                isLyricsExpanded ? "Collapse lyrics" : "Expand lyrics"
              }
              onClick={() => setIsLyricsExpanded((current) => !current)}
            >
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-200",
                  isLyricsExpanded && "rotate-180",
                )}
              />
            </button>
          </div>
          {isLyricsExpanded && (
            <>
              <div className="px-5 pb-5 pt-4 text-center">
                <p className="mx-auto max-w-3xl text-2xl font-black leading-tight text-foreground md:text-3xl">
                  Title: {lyricTitle}
                </p>
              </div>
              <div className="relative grid gap-x-12 gap-y-7 px-5 pb-6 pt-2 text-center text-[15px] leading-8 text-foreground before:pointer-events-none before:absolute before:bottom-6 before:left-1/2 before:top-2 before:hidden before:w-px before:-translate-x-1/2 before:bg-gradient-to-b before:from-transparent before:via-primary/14 before:to-transparent md:grid-cols-2 md:before:block">
                {lyricColumns.map((column, columnIndex) => (
                  <div
                    key={columnIndex}
                    className="mx-auto w-full max-w-sm space-y-7"
                  >
                    {column.map((block) => (
                      <LyricBlockView key={block.id} block={block} />
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {bottomCta && (
        <div className="relative z-10 px-4 sm:px-6 lg:px-8">{bottomCta}</div>
      )}
    </div>
  );
}
