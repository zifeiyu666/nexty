"use client";

import CopyButton from "@/components/shared/CopyButton";
import { TwitterX } from "@/components/social-icons/icons";
import { MusicVideoEditorDrawer } from "@/components/song/MusicVideoEditorDrawer";
import {
  InfoPill,
  OrganicSongCover,
  SongCoverBackdrop,
  type SongResultMetadataPill,
} from "@/components/song/song-result/SongResultView";
import {
  WallArtEditorDrawer,
  type WallArtSongOption,
} from "@/components/song/WallArtEditorDrawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGlobalMusicPlayer } from "@/lib/music-player/global-player-store";
import { buildLrcFileName, buildLrcText } from "@/lib/music-player/lrc-export";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Cake,
  Check,
  Clapperboard,
  Copy,
  Disc3,
  Download,
  ExternalLink,
  FileText,
  Gift,
  Heart,
  Languages,
  Link2,
  Mic2,
  Pause,
  Play,
  QrCode,
  Share2,
  Sparkles,
  Volume2,
  Wand2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useMemo, useRef, useState } from "react";

export type FinalSongPlayerData = {
  id: string;
  title: string;
  lyrics: string;
  timestampedLyrics?: {
    alignedWords: Array<{
      word: string;
      startS: number;
      endS: number;
    }>;
  } | null;
  genre: string;
  occasion: string;
  language: string;
  vocalGender: string;
  recipientNames: string[];
  personalNote?: string;
  story: string;
  audioUrl: string;
  imageUrl?: string | null;
  duration?: number | null;
  shareUrl?: string;
};

function labelize(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function RecordArtwork({
  imageUrl,
  title,
  isPlaying,
}: {
  imageUrl?: string | null;
  title: string;
  isPlaying: boolean;
}) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[330px]">
      {imageUrl ? (
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-[10%] size-4/5 rounded-full object-cover opacity-45 blur-2xl"
          src={imageUrl}
        />
      ) : null}
      <div
        className={cn(
          "absolute inset-0 rounded-full border border-white/20 bg-[radial-gradient(circle_at_center,#fbf7ef_0_8%,#111827_9%_12%,#1d2430_13%_18%,#050711_19%_31%,#12141b_32%_33%,#050711_34%_46%,#171923_47%_48%,#02040c_49%_100%)] shadow-[0_34px_90px_rgba(18,12,8,0.34)]",
          isPlaying && "animate-[spin_18s_linear_infinite]",
        )}
      >
        {imageUrl ? (
          <img
            alt={title}
            className="absolute left-1/2 top-1/2 size-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full object-cover"
            src={imageUrl}
          />
        ) : (
          <div className="absolute left-1/2 top-1/2 flex size-[58%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#f25545] text-white">
            <Sparkles className="size-14" />
          </div>
        )}
      </div>
      <div className="absolute inset-[17%] rounded-full border border-white/20" />
      <div className="absolute inset-[27%] rounded-full border border-white/10" />
      <div className="absolute left-1/2 top-1/2 size-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/10 bg-[#fffaf2] shadow-inner" />
      <div className="absolute inset-x-[17%] bottom-2 h-10 rounded-full bg-black/30 blur-2xl" />
    </div>
  );
}

function PlaybackControls({
  data,
  onPlayingChange,
  onTimeChange,
  variant = "default",
}: {
  data: FinalSongPlayerData;
  onPlayingChange?: (isPlaying: boolean) => void;
  onTimeChange?: (currentTime: number, duration: number) => void;
  variant?: "default" | "poster";
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(data.duration || 0);
  const [volume, setVolume] = useState(0.72);

  function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      onPlayingChange?.(false);
      return;
    }

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        onPlayingChange?.(true);
      })
      .catch(() => {
        setIsPlaying(false);
        onPlayingChange?.(false);
      });
  }

  const effectiveDuration = duration || data.duration || 0;
  const progress = effectiveDuration
    ? Math.min(currentTime / effectiveDuration, 1) * 100
    : 0;
  const isPoster = variant === "poster";

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  return (
    <div>
      <audio
        ref={audioRef}
        preload="metadata"
        src={data.audioUrl}
        onEnded={() => {
          setIsPlaying(false);
          onPlayingChange?.(false);
        }}
        onLoadedMetadata={(event) => {
          const nextDuration =
            event.currentTarget.duration || data.duration || 0;
          setDuration(nextDuration);
          onTimeChange?.(event.currentTarget.currentTime, nextDuration);
        }}
        onTimeUpdate={(event) => {
          const nextTime = event.currentTarget.currentTime;
          setCurrentTime(nextTime);
          onTimeChange?.(nextTime, effectiveDuration);
        }}
        onVolumeChange={(event) => {
          setVolume(event.currentTarget.volume);
        }}
      />
      <div className={cn("flex items-center gap-3", isPoster && "gap-4")}>
        {isPoster ? (
          <div className="w-12 text-xs font-semibold text-white/80">
            {formatTime(currentTime)}
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              "h-2 overflow-hidden rounded-full",
              isPoster ? "bg-white/30" : "bg-muted",
            )}
          >
            <div
              className={cn(
                "h-full rounded-full",
                isPoster ? "bg-white" : "bg-primary",
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          {isPoster ? null : (
            <div className="mt-1.5 flex justify-between text-xs font-medium text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(effectiveDuration)}</span>
            </div>
          )}
        </div>
        {isPoster ? (
          <div className="w-12 text-right text-xs font-semibold text-white/80">
            {formatTime(effectiveDuration)}
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          "mt-3 flex items-center",
          isPoster ? "justify-center gap-5" : "gap-3",
        )}
      >
        <button
          aria-label={isPlaying ? "Pause song" : "Play song"}
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full transition",
            isPoster
              ? "size-14 bg-white text-stone-950 shadow-2xl shadow-black/35 hover:bg-white/90"
              : "size-12 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90",
          )}
          type="button"
          onClick={togglePlayback}
        >
          {isPlaying ? (
            <Pause
              className={cn("fill-current", isPoster ? "size-6" : "size-5")}
            />
          ) : (
            <Play
              className={cn(
                "ml-0.5 fill-current",
                isPoster ? "size-6" : "size-5",
              )}
            />
          )}
        </button>
        {isPoster ? (
          <div className="flex items-center gap-2 text-white/85">
            <Volume2 className="size-4" />
            <input
              aria-label="Volume"
              className="h-1 w-20 accent-white"
              max="1"
              min="0"
              step="0.01"
              type="range"
              value={volume}
              onChange={(event) => {
                const nextVolume = Number(event.currentTarget.value);
                setVolume(nextVolume);
                if (audioRef.current) {
                  audioRef.current.volume = nextVolume;
                }
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function getLyricLines(lyrics: string): string[] {
  return lyrics
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function cleanDisplayLyricLine(line: string): string {
  return line
    .replace(/^title\s*:\s*/i, "")
    .replace(/^\[[^\]]+\]$/, "")
    .trim();
}

function getDisplayLyricLines(lyrics: string): string[] {
  return getLyricLines(lyrics).map(cleanDisplayLyricLine).filter(Boolean);
}

function getLyricLineWeight(line: string): number {
  const words = line.match(/[\p{L}\p{N}'-]+/gu) ?? [];
  if (words.length > 1) return words.length;

  const compactText = line.replace(/[^\p{L}\p{N}]+/gu, "");
  return Math.max(1, Math.ceil(Array.from(compactText).length / 2));
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getTimedLyricSegments(
  lines: string[],
  alignedWords: NonNullable<
    FinalSongPlayerData["timestampedLyrics"]
  >["alignedWords"],
): Array<{ line: string; startS: number; endS: number }> {
  const validWords = alignedWords.filter(
    (word) =>
      Number.isFinite(word.startS) &&
      Number.isFinite(word.endS) &&
      word.endS >= word.startS,
  );

  if (!lines.length || !validWords.length) return [];

  const weights = lines.map(getLyricLineWeight);
  const totalWeight = weights.reduce((total, weight) => total + weight, 0);
  let consumedWeight = 0;

  return lines.map((line, index) => {
    const startRatio = consumedWeight / totalWeight;
    const endRatio = (consumedWeight + weights[index]) / totalWeight;
    const startIndex = clampNumber(
      Math.floor(startRatio * validWords.length),
      0,
      validWords.length - 1,
    );
    const endIndex = clampNumber(
      Math.max(startIndex, Math.ceil(endRatio * validWords.length) - 1),
      startIndex,
      validWords.length - 1,
    );
    const firstWord = validWords[startIndex];
    const lastWord = validWords[endIndex];

    consumedWeight += weights[index];

    return {
      line,
      startS: firstWord.startS,
      endS: Math.max(lastWord.endS, firstWord.endS),
    };
  });
}

function getCurrentLyricIndex({
  currentTime,
  duration,
  lyrics,
  timestampedLyrics,
}: {
  currentTime: number;
  duration: number;
  lyrics: string;
  timestampedLyrics?: FinalSongPlayerData["timestampedLyrics"];
}): number {
  const fallbackLines = getDisplayLyricLines(lyrics);

  if (!fallbackLines.length) return -1;

  if (timestampedLyrics?.alignedWords?.length) {
    const timedSegments = getTimedLyricSegments(
      fallbackLines,
      timestampedLyrics.alignedWords,
    );

    if (timedSegments.length) {
      const activeIndex = timedSegments.findIndex(
        (segment) =>
          currentTime >= segment.startS && currentTime < segment.endS,
      );
      if (activeIndex !== -1) return activeIndex;

      let previousIndex = -1;
      for (let index = timedSegments.length - 1; index >= 0; index -= 1) {
        if (currentTime >= timedSegments[index].endS) {
          previousIndex = index;
          break;
        }
      }

      return previousIndex === -1 ? 0 : previousIndex;
    }
  }

  if (!Number.isFinite(duration) || duration <= 0) return 0;

  return Math.min(
    fallbackLines.length - 1,
    Math.floor((currentTime / duration) * fallbackLines.length),
  );
}

function OwnerHeroLyricTicker({
  activeIndex,
  isPlaying,
  lines,
}: {
  activeIndex: number;
  isPlaying: boolean;
  lines: string[];
}) {
  if (!lines.length || activeIndex < 0) {
    return (
      <p className="line-clamp-1 text-[11px] font-semibold leading-5 text-muted-foreground/45">
        No lyrics available yet.
      </p>
    );
  }

  return (
    <div aria-live="polite" className="h-5 overflow-hidden">
      <div
        className="transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: `translateY(-${activeIndex * 1.25}rem)` }}
      >
        {lines.map((line, index) => (
          <p
            key={`${line}-${index}`}
            className={cn(
              "line-clamp-1 h-5 text-[11px] font-semibold leading-5 transition-opacity duration-500",
              index === activeIndex
                ? "text-muted-foreground/60 opacity-100"
                : "text-muted-foreground/35 opacity-45",
              !isPlaying && index === activeIndex && "text-muted-foreground/45",
            )}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function SyncedLyrics({
  lyrics,
  currentTime,
  duration,
  isPlaying,
  className,
}: {
  lyrics: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lineRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const lines = useMemo(() => getLyricLines(lyrics), [lyrics]);
  const activeIndex =
    duration > 0 && lines.length > 0
      ? Math.min(
          lines.length - 1,
          Math.floor((currentTime / duration) * lines.length),
        )
      : 0;

  useEffect(() => {
    if (!isPlaying) return;
    const line = lineRefs.current[activeIndex];
    if (!line) return;

    line.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activeIndex, isPlaying]);

  if (!lines.length) {
    return (
      <div className={cn("overflow-y-auto", className)}>
        <p className="text-sm text-muted-foreground">
          No lyrics available yet.
        </p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className={cn("overflow-y-auto pr-2", className)}>
      <div className="space-y-3 pb-10">
        {lines.map((line, index) => (
          <p
            key={`${line}-${index}`}
            ref={(element) => {
              lineRefs.current[index] = element;
            }}
            className={cn(
              "text-[15px] leading-8 text-stone-500 transition-colors duration-300",
              index === activeIndex && "font-bold text-stone-950",
            )}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function SongFacts({ data }: { data: FinalSongPlayerData }) {
  const recipientLabel = data.recipientNames.join(" and ") || "someone special";

  return (
    <div className="flex flex-wrap gap-2">
      {[
        `For ${recipientLabel}`,
        labelize(data.occasion),
        data.genre,
        data.vocalGender,
        data.language,
      ]
        .filter(Boolean)
        .map((label) => (
          <Badge
            key={label}
            className="border-[#eadfd2] bg-[#fffaf4]/80 px-3 py-1.5 text-[12px] font-bold text-[#77685c] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
            variant="outline"
          >
            {label}
          </Badge>
        ))}
    </div>
  );
}

function SharePanel({
  audioUrl,
  shareUrl,
  title,
}: {
  audioUrl: string;
  shareUrl: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);
  const tweetUrl = `https://twitter.com/intent/tweet?${new URLSearchParams({
    text: `Listen to "${title}"`,
    url: shareUrl,
  }).toString()}`;
  const glassButtonClassName =
    "rounded-full border-0 bg-white/38 text-foreground shadow-[0_10px_30px_rgba(45,31,24,0.08),inset_0_1px_0_rgba(255,255,255,0.72),inset_0_-1px_0_rgba(255,255,255,0.2)] backdrop-blur-xl hover:bg-white/52 hover:text-foreground";
  const glassDialogButtonClassName =
    "h-11 justify-start rounded-xl border-0 bg-white/48 text-foreground shadow-[0_10px_28px_rgba(45,31,24,0.07),inset_0_1px_0_rgba(255,255,255,0.78),inset_0_-1px_0_rgba(255,255,255,0.2)] backdrop-blur-xl hover:bg-white/62 hover:text-foreground";

  async function copyShareUrl() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-[0_18px_54px_rgba(255,120,150,0.11)]">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Link2 className="size-4" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">
              Share
            </p>
            <h2 className="mt-1 text-xl font-black leading-tight text-foreground">
              Private link, ready to send
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
              A polished listening page for the recipient, with QR and preview
              ready.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button asChild className={glassButtonClassName}>
            <a href={audioUrl} rel="noreferrer" target="_blank">
              <Download className="size-4" />
              Download
            </a>
          </Button>
          <Button asChild className={glassButtonClassName}>
            <a href={shareUrl} rel="noreferrer" target="_blank">
              <ExternalLink className="size-4" />
              Preview
            </a>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className={glassButtonClassName}>
                <QrCode className="size-4" />
                QR
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Song QR code</DialogTitle>
                <DialogDescription>
                  Anyone with this QR code can listen to the shared song page.
                </DialogDescription>
              </DialogHeader>
              <div className="mx-auto rounded-2xl bg-white p-4">
                <QRCodeSVG
                  value={shareUrl}
                  size={220}
                  level="M"
                  includeMargin
                />
              </div>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className={cn(
                  glassButtonClassName,
                  "bg-primary/88 text-primary-foreground shadow-[0_12px_30px_rgba(224,65,50,0.18),inset_0_1px_0_rgba(255,255,255,0.38)] hover:bg-primary hover:text-primary-foreground",
                )}
                type="button"
              >
                <Share2 className="size-4" />
                Share
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[min(720px,calc(100svh-2rem))] overflow-hidden border-black/10 bg-[#fffaf4] p-0 sm:max-w-2xl">
              <div className="border-b border-black/10 bg-white/75 px-6 py-5">
                <DialogHeader>
                  <DialogTitle>Share this song</DialogTitle>
                  <DialogDescription>
                    Copy the private link, post it on X, or preview the shared
                    page.
                  </DialogDescription>
                </DialogHeader>
              </div>
              <div className="min-w-0 space-y-4 overflow-y-auto px-6 pb-6">
                <div className="min-w-0 rounded-2xl border border-black/10 bg-white/80 p-3 shadow-inner">
                  <p className="break-all text-sm font-semibold leading-6 text-stone-700 sm:truncate sm:break-normal">
                    {shareUrl}
                  </p>
                </div>
                <div className="grid gap-2">
                  <Button
                    className="h-11 justify-start rounded-xl border-0 bg-stone-950/88 text-white shadow-[0_12px_30px_rgba(45,31,24,0.16),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-xl hover:bg-stone-950"
                    type="button"
                    onClick={copyShareUrl}
                  >
                    {copied ? (
                      <Check className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                    {copied ? "Copied link" : "Copy link"}
                  </Button>
                  <Button asChild className={glassDialogButtonClassName}>
                    <a href={tweetUrl} rel="noreferrer" target="_blank">
                      <TwitterX className="size-4" />
                      Share to X
                    </a>
                  </Button>
                  <Button asChild className={glassDialogButtonClassName}>
                    <a href={shareUrl} rel="noreferrer" target="_blank">
                      <ExternalLink className="size-4" />
                      Preview share page
                    </a>
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-border/70 bg-muted/55 px-4 py-3 sm:px-5">
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-muted-foreground">
          {shareUrl}
        </p>
        <CopyButton
          className="rounded-full p-2 hover:bg-background"
          text={shareUrl}
        />
      </div>
    </div>
  );
}

function StoryDialogButton({ story }: { story: string }) {
  if (!story.trim()) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="h-9 rounded-full border-black/10 bg-white/70 text-stone-700 hover:bg-white"
          size="sm"
          variant="outline"
        >
          <FileText className="size-4" />
          Story
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl rounded-3xl">
        <DialogHeader>
          <DialogTitle>Story behind the song</DialogTitle>
          <DialogDescription>
            The memory and details that shaped this custom song.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-2 text-sm leading-7 text-muted-foreground">
          {story}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function downloadLrcLyrics(data: FinalSongPlayerData) {
  const blob = new Blob(
    [
      buildLrcText({
        title: data.title,
        lyrics: data.lyrics,
        duration: data.duration,
        timestampedLyrics: data.timestampedLyrics,
      }),
    ],
    { type: "text/plain;charset=utf-8" },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = buildLrcFileName(data.title);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function OwnerLyricsPanel({ data }: { data: FinalSongPlayerData }) {
  const lines = getLyricLines(data.lyrics);
  const lyricActionButtonClassName =
    "rounded-full border-0 bg-white/42 text-foreground shadow-[0_10px_28px_rgba(45,31,24,0.07),inset_0_1px_0_rgba(255,255,255,0.76),inset_0_-1px_0_rgba(255,255,255,0.2)] backdrop-blur-xl hover:bg-white/58 hover:text-foreground";

  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-[0_18px_54px_rgba(255,120,150,0.11)]">
      <div className="flex flex-col gap-4 px-5 pb-2 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <FileText className="size-4" />
          </span>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground">
              Lyrics
            </p>
            <h2 className="text-lg font-black leading-tight text-foreground">
              The finished lyric sheet
            </h2>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            className={lyricActionButtonClassName}
            size="sm"
            type="button"
            onClick={() => downloadLrcLyrics(data)}
          >
            <FileText className="size-4" />
            Export LRC
          </Button>
        </div>
      </div>

      <div className="max-h-[620px] overflow-y-auto px-5 pb-6 pt-4">
        {lines.length ? (
          <div className="mx-auto max-w-3xl space-y-5 text-center">
            {lines.map((line, index) => {
              const isSection = /^\[[^\]]+\]$/.test(line);
              const isTitle = /^title\s*:/i.test(line);

              return (
                <p
                  key={`${line}-${index}`}
                  className={cn(
                    "font-sans text-[15px] font-semibold leading-6 text-foreground",
                    isTitle &&
                      "mx-auto max-w-xl px-3 py-2 text-xl font-bold normal-case tracking-normal text-foreground md:text-xl",
                    isSection &&
                      "pt-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground/55",
                  )}
                >
                  {line}
                </p>
              );
            })}
          </div>
        ) : (
          <p className="text-sm font-semibold text-muted-foreground">
            No lyrics available yet.
          </p>
        )}
      </div>
    </div>
  );
}

function SongCreationTools({
  data,
  songOptions,
}: {
  data: FinalSongPlayerData;
  songOptions?: FinalSongPlayerData[];
}) {
  const initialSong: WallArtSongOption = {
    id: data.id,
    title: data.title,
    lyrics: data.lyrics,
    imageUrl: data.imageUrl,
    shareUrl: data.shareUrl,
  };
  const toolCardClassName =
    "group relative flex min-h-[132px] w-full cursor-pointer flex-col justify-between overflow-hidden rounded-2xl bg-card p-5 text-left shadow-[0_18px_48px_rgba(255,120,150,0.16)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_30px_72px_rgba(255,104,142,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 active:translate-y-0";
  const toolIconClassName =
    "flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground";
  const toolActionClassName =
    "inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-2 text-xs font-black text-primary-foreground shadow-[0_12px_26px_rgba(239,62,53,0.22)] transition duration-200 group-hover:gap-3 group-hover:bg-primary/90";

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <WallArtEditorDrawer
        initialSong={initialSong}
        songOptions={songOptions}
        trigger={
          <button className={toolCardClassName} type="button">
            <div className="flex items-start justify-between gap-4">
              <div className={toolIconClassName}>
                <Wand2 className="size-4" />
              </div>
              <span className={toolActionClassName}>
                Open editor
                <ArrowRight className="size-3.5 transition duration-200 group-hover:translate-x-0.5" />
              </span>
            </div>
            <div className="mt-5 min-w-0">
              <h3 className="text-lg font-black leading-tight text-foreground">
                Generate Wall Art
              </h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                Generate a lyric poster and cover artwork set for this song.
              </p>
            </div>
            <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-primary/10 blur-2xl" />
          </button>
        }
      />

      <MusicVideoEditorDrawer
        initialSong={data}
        songOptions={songOptions}
        trigger={
          <button className={toolCardClassName} type="button">
            <div className="flex items-start justify-between gap-4">
              <div className={toolIconClassName}>
                <Clapperboard className="size-4" />
              </div>
              <span className={toolActionClassName}>
                Open editor
                <ArrowRight className="size-3.5 transition duration-200 group-hover:translate-x-0.5" />
              </span>
            </div>
            <div className="mt-5 min-w-0">
              <h3 className="text-lg font-black leading-tight text-foreground">
                Generate Music Video
              </h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                Turn the song story, lyrics, and artwork into a short video.
              </p>
            </div>
            <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-accent/50 blur-2xl" />
          </button>
        }
      />
    </div>
  );
}

export function FinalSongOwnerPlayer({
  data,
  songOptions,
}: {
  data: FinalSongPlayerData;
  songOptions?: FinalSongPlayerData[];
}) {
  const {
    currentTime: globalCurrentTime,
    duration: globalDuration,
    isPlaying: isGlobalPlaying,
    playTrack,
    toggle,
    track,
  } = useGlobalMusicPlayer();
  const recipientLabel = data.recipientNames.join(" and ") || "someone special";
  const occasionLabel = labelize(data.occasion || "custom song");
  const isCurrentGlobalTrack =
    track?.id === data.id && track.audioUrl === data.audioUrl;
  const isPlaying = isCurrentGlobalTrack && isGlobalPlaying;
  const currentTime = isCurrentGlobalTrack ? globalCurrentTime : 0;
  const duration = isCurrentGlobalTrack
    ? globalDuration || data.duration || 0
    : data.duration || 0;
  const metadataPills: SongResultMetadataPill[] = [
    { icon: <Heart className="size-4" />, label: `For ${recipientLabel}` },
    { icon: <Cake className="size-4" />, label: occasionLabel },
    { icon: <Gift className="size-4" />, label: data.genre },
    { icon: <Mic2 className="size-4" />, label: data.vocalGender },
    { icon: <Languages className="size-4" />, label: data.language },
  ];
  const heroLyricLines = useMemo(
    () => getDisplayLyricLines(data.lyrics),
    [data.lyrics],
  );
  const playbackProgress =
    Number.isFinite(duration) && duration > 0
      ? Math.min(currentTime / duration, 1)
      : 0;
  const activeLyricIndex = getCurrentLyricIndex({
    currentTime,
    duration,
    lyrics: data.lyrics,
    timestampedLyrics: data.timestampedLyrics,
  });

  function toggleOwnerPlayback() {
    if (isCurrentGlobalTrack) {
      toggle();
      return;
    }

    playTrack({
      id: data.id,
      title: data.title,
      artist: `For ${recipientLabel}`,
      artworkUrl: data.imageUrl || undefined,
      audioUrl: data.audioUrl,
      duration: data.duration,
    });
  }

  return (
    <div className="relative w-full pb-8">
      <SongCoverBackdrop imageUrl={data.imageUrl} title={data.title} />

      <section className="relative z-10 px-4 pt-2 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-5xl gap-7 lg:grid-cols-[288px_1fr] lg:items-center">
          <OrganicSongCover
            imageUrl={data.imageUrl}
            isPlaying={isPlaying}
            playbackProgress={playbackProgress}
            showPlaybackControl
            showVisualizer
            title={data.title}
            onPlaybackToggle={toggleOwnerPlayback}
          />

          <div>
            <p className="mb-1 handwritten-subtitle text-2xl font-normal leading-none text-accent-foreground">
              Ta-da! Congratulation!
            </p>
            <h1 className="max-w-4xl text-balance text-5xl font-black leading-tight text-foreground">
              {data.title}
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
            <div className="mt-3 overflow-hidden px-1">
              <OwnerHeroLyricTicker
                activeIndex={activeLyricIndex}
                isPlaying={isPlaying}
                lines={heroLyricLines}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-10 w-full max-w-5xl space-y-5 px-4 sm:px-6 lg:px-8">
        {data.shareUrl && (
          <SharePanel
            audioUrl={data.audioUrl}
            shareUrl={data.shareUrl}
            title={data.title}
          />
        )}

        <div>
          {/* <div className="mb-3 flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <HeartHandshake className="size-4" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground">
                Make it tangible
              </p>
              <h2 className="text-xl font-black leading-tight text-foreground">
                Create matching keepsakes
              </h2>
            </div>
          </div> */}
          <SongCreationTools data={data} songOptions={songOptions} />
        </div>

        <OwnerLyricsPanel data={data} />
      </section>
    </div>
  );
}

export function SharedSongPlayer({ data }: { data: FinalSongPlayerData }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"record" | "lyrics">("record");
  const [playback, setPlayback] = useState({
    currentTime: 0,
    duration: data.duration || 0,
  });

  return (
    <main className="min-h-screen w-full bg-[#f5f1ea] text-[#1c1917]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-5 md:px-8 md:py-8">
        <section className="grid min-h-[calc(100svh-2.5rem)] w-full overflow-hidden rounded-[30px] border border-black/10 bg-white/72 shadow-2xl shadow-black/10 backdrop-blur md:h-[calc(100svh-4rem)] md:min-h-[620px] md:grid-cols-[380px_minmax(0,1fr)]">
          <div
            className={cn(
              "min-h-0 flex-col border-black/10 p-5 md:flex md:border-r md:p-6",
              mobilePanel === "record" ? "flex" : "hidden",
            )}
          >
            <div className="shrink-0">
              <button
                aria-label="Show lyrics"
                className="block w-full rounded-full outline-none focus-visible:ring-4 focus-visible:ring-red-500/25 md:pointer-events-none"
                type="button"
                onClick={() => setMobilePanel("lyrics")}
              >
                <RecordArtwork
                  imageUrl={data.imageUrl}
                  isPlaying={isPlaying}
                  title={data.title}
                />
              </button>
            </div>
            <div className="mt-6 shrink-0">
              <PlaybackControls
                data={data}
                onPlayingChange={setIsPlaying}
                onTimeChange={(currentTime, duration) =>
                  setPlayback({ currentTime, duration })
                }
              />
            </div>
            <div className="mt-5 min-h-0">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">
                  One Custom Song
                </p>
                <StoryDialogButton story={data.story} />
              </div>
              <h1 className="mt-2 text-3xl font-black leading-tight md:text-4xl">
                {data.title}
              </h1>
              <div className="mt-4">
                <SongFacts data={data} />
              </div>
            </div>
          </div>

          <div
            className={cn(
              "min-h-0 flex-col p-5 md:flex md:p-6",
              mobilePanel === "lyrics" ? "flex" : "hidden",
            )}
          >
            <div className="mb-4 flex shrink-0 items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">
                  Now playing
                </p>
                <h2 className="mt-1 text-2xl font-black">Lyrics</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className="h-9 rounded-full border-black/10 bg-white/70 text-stone-700 hover:bg-white md:hidden"
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => setMobilePanel("record")}
                >
                  <Disc3 className="size-4" />
                  Record
                </Button>
                <div className="rounded-full border border-black/10 bg-[#f5f1ea] px-3 py-1 text-xs font-bold text-stone-500">
                  {formatTime(playback.currentTime)}
                </div>
              </div>
            </div>
            <SyncedLyrics
              className="min-h-0 flex-1"
              currentTime={playback.currentTime}
              duration={playback.duration}
              isPlaying={isPlaying}
              lyrics={data.lyrics}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
