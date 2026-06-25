"use client";

import BrandWordmark from "@/components/header/BrandWordmark";
import { Button } from "@/components/ui/button";
import type { FinalSongPlayerData } from "@/components/song/FinalSongPlayer";
import { siteConfig } from "@/config/site";
import { Link as I18nLink } from "@/i18n/routing";
import {
  buildLyricCuesFromAlignedWords,
  parseTimestampedLyrics,
  type LyricCue,
} from "@/lib/music-video/photo-slideshow";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Music2,
  NotebookPen,
  Pause,
  Play,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

const FALLBACK_DURATION = 180;
const ACTIVE_WINDOW = 2;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getLyricCues(
  data: FinalSongPlayerData,
  playbackDuration: number,
): LyricCue[] {
  const alignedWords = data.timestampedLyrics?.alignedWords ?? [];
  const duration =
    Number.isFinite(playbackDuration) && playbackDuration > 0
      ? playbackDuration
      : data.duration || FALLBACK_DURATION;

  if (alignedWords.length > 0) {
    return buildLyricCuesFromAlignedWords({
      lyrics: data.lyrics,
      alignedWords,
      duration,
    });
  }

  return parseTimestampedLyrics(data.lyrics, duration);
}

function getActiveCueIndex(cues: LyricCue[], currentTime: number) {
  if (!cues.length) return 0;

  const activeIndex = cues.findIndex(
    (cue) => currentTime >= cue.start && currentTime < cue.end,
  );

  if (activeIndex >= 0) return activeIndex;
  if (currentTime < cues[0].start) return 0;

  return cues.length - 1;
}

function getRecipientLabel(names: string[]) {
  const recipients = names.map((name) => name.trim()).filter(Boolean);

  if (!recipients.length) return "someone special";
  if (recipients.length === 1) return recipients[0];
  if (recipients.length === 2) return `${recipients[0]} and ${recipients[1]}`;

  return `${recipients.slice(0, -1).join(", ")}, and ${recipients.at(-1)}`;
}

function CueProgress({
  cue,
  currentTime,
}: {
  cue: LyricCue;
  currentTime: number;
}) {
  const duration = Math.max(cue.end - cue.start, 0.01);
  const progress = Math.min(Math.max((currentTime - cue.start) / duration, 0), 1);

  return (
    <span
      aria-hidden="true"
      className="absolute inset-x-0 bottom-[-0.42rem] mx-auto h-px max-w-36 overflow-hidden rounded-full bg-white/18"
    >
      <span
        className="block h-full rounded-full bg-[#ff7c66] shadow-[0_0_18px_rgba(255,124,102,0.85)]"
        style={{ width: `${progress * 100}%` }}
      />
    </span>
  );
}

function GiftStoryPrompt({
  data,
  isOpen,
  onClose,
  onOpen,
}: {
  data: FinalSongPlayerData;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}) {
  const recipientLabel = getRecipientLabel(data.recipientNames);
  const story = data.story.trim();

  return (
    <>
      <div className="mx-auto inline-flex max-w-full items-center justify-center gap-2 text-white">
        <span className="inline-flex h-7 min-w-0 items-center rounded-full border border-white/12 bg-black/16 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/62 shadow-[0_8px_24px_rgba(0,0,0,0.16)] backdrop-blur-xl sm:h-7 sm:text-[11px]">
          <span className="min-w-0 truncate">Gift for {recipientLabel}</span>
        </span>
        <button
          aria-expanded={isOpen}
          aria-label="Open gift note"
          className="group relative flex size-8 shrink-0 rotate-[-4deg] items-center justify-center rounded-[0.65rem] border border-[#f7d7b5]/70 bg-[#fff4dc] text-[#8b4b34] shadow-[0_8px_18px_rgba(0,0,0,0.18)] transition hover:rotate-0 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          type="button"
          onClick={onOpen}
        >
          <span className="absolute inset-1 rounded-[0.45rem] border border-[#ce8863]/30" />
          <NotebookPen className="relative size-3.5 stroke-[1.7] transition group-hover:-translate-y-0.5" />
        </button>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/42 px-4 py-6 backdrop-blur-sm">
          <button
            aria-label="Close gift note"
            className="absolute inset-0 cursor-default"
            type="button"
            onClick={onClose}
          />
          <section className="relative max-h-[min(78svh,560px)] w-full max-w-md rotate-[-1deg] overflow-hidden rounded-[1.35rem] border border-[#e7cba0] bg-[#fff6df] p-6 text-left text-[#4a3327] shadow-[0_28px_80px_rgba(0,0,0,0.42)]">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(126,82,46,0.08)_1px,transparent_1px),radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.75),transparent_22%),radial-gradient(circle_at_88%_90%,rgba(214,124,93,0.16),transparent_26%)] [background-size:100%_1.75rem,100%_100%,100%_100%]"
            />
            <div
              aria-hidden="true"
              className="absolute left-10 top-0 h-full w-px bg-[#e88b7b]/35"
            />
            <button
              aria-label="Close gift note"
              className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-[#4a3327]/8 text-[#4a3327] transition hover:bg-[#4a3327]/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4b34]/40"
              type="button"
              onClick={onClose}
            >
              <X className="size-4" />
            </button>
            <div className="relative z-10 pl-6">
              <p className="font-science-gothic text-xs font-black uppercase tracking-[0.18em] text-[#b25f4d]">
                Gift note
              </p>
              <h2 className="mt-3 text-2xl font-black leading-tight text-[#3d2a21]">
                For {recipientLabel}
              </h2>
              <div className="mt-5 max-h-[42svh] overflow-y-auto pr-2 text-sm font-semibold leading-7 text-[#5b4032] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {story ? (
                  story.split(/\r?\n/).map((paragraph, index) => (
                    <p className="mb-4 last:mb-0" key={`${paragraph}-${index}`}>
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p>This song was made as a personal gift.</p>
                )}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function LyricsStage({
  cues,
  currentTime,
  activeIndex,
}: {
  cues: LyricCue[];
  currentTime: number;
  activeIndex: number;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    const activeElement = activeRef.current;

    if (!scrollElement || !activeElement) return;

    const nextTop =
      activeElement.offsetTop -
      scrollElement.clientHeight / 2 +
      activeElement.clientHeight / 2;

    scrollElement.scrollTo({
      behavior: "smooth",
      top: Math.max(0, nextTop),
    });
  }, [activeIndex]);

  if (!cues.length) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center text-center">
        <p className="text-base font-semibold text-white/64">
          No lyrics available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto mt-4 flex min-h-0 w-full max-w-6xl flex-1 overflow-hidden sm:mt-6">
      <div
        aria-label="Synced lyrics"
        ref={scrollRef}
        className="h-full w-full overflow-y-auto px-3 py-[14svh] text-center [mask-image:linear-gradient(180deg,transparent,black_10%,black_90%,transparent)] [scrollbar-width:none] sm:py-[16svh] [&::-webkit-scrollbar]:hidden"
      >
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 sm:gap-6">
          {cues.map((cue, index) => {
            const distance = Math.abs(index - activeIndex);
            const isActive = index === activeIndex;
            const isNear = distance <= ACTIVE_WINDOW;

            return (
              <p
                key={cue.id}
                ref={isActive ? activeRef : undefined}
                className={cn(
                  "relative max-w-full text-balance px-2 font-semibold leading-tight text-white/28 transition-all duration-500 ease-out",
                  "text-[clamp(1rem,4.1vw,2rem)] sm:text-[clamp(1.15rem,2.4vw,2.45rem)]",
                  isNear && "text-white/48",
                  distance > 4 && "opacity-20",
                  isActive &&
                    "scale-[1.04] text-[clamp(1.8rem,7vw,4.8rem)] font-black text-white opacity-100 drop-shadow-[0_10px_34px_rgba(0,0,0,0.52)]",
                )}
              >
                {cue.text}
                {isActive ? (
                  <CueProgress cue={cue} currentTime={currentTime} />
                ) : null}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CoverBackdrop({ imageUrl, title }: { imageUrl?: string | null; title: string }) {
  if (!imageUrl) {
    return (
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_18%,rgba(255,124,102,0.42),transparent_28%),radial-gradient(circle_at_78%_28%,rgba(65,186,196,0.28),transparent_32%),linear-gradient(140deg,#140d10,#1e201a_45%,#06080c)]" />
    );
  }

  return (
    <>
      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full scale-110 object-cover blur-3xl"
        src={imageUrl}
      />
      <img
        alt={title}
        className="absolute inset-0 size-full scale-105 object-cover opacity-32 blur-sm"
        src={imageUrl}
      />
    </>
  );
}

function BrandHomeLink() {
  return (
    <I18nLink
      aria-label={`${siteConfig.name} home`}
      className="group inline-flex min-w-0 items-center gap-2 rounded-full border border-white/18 bg-black/24 px-3 py-2 text-white shadow-[0_14px_36px_rgba(0,0,0,0.24)] outline-none backdrop-blur-2xl transition hover:border-white/28 hover:bg-white/12 focus-visible:ring-2 focus-visible:ring-white/70"
      href="/"
    >
      <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_0_26px_rgba(255,255,255,0.2)]">
        <Image
          alt=""
          aria-hidden="true"
          className="object-cover"
          fill
          sizes="32px"
          src="/logo.png"
        />
      </span>
      <BrandWordmark
        title={siteConfig.name}
        className="inline-flex text-sm font-semibold tracking-normal text-white"
        heartClassName="drop-shadow-[0_1px_10px_rgba(255,98,92,0.72)]"
      />
    </I18nLink>
  );
}

function ArtworkPlate({
  imageUrl,
  title,
  isPlaying,
}: {
  imageUrl?: string | null;
  title: string;
  isPlaying: boolean;
}) {
  return (
    <div className="hidden items-center gap-3 md:flex">
      <div
        className={cn(
          "relative size-14 shrink-0 overflow-hidden rounded-full border border-white/22 bg-black/34 shadow-[0_12px_36px_rgba(0,0,0,0.36)]",
          isPlaying && "animate-[spin_18s_linear_infinite]",
        )}
      >
        {imageUrl ? (
          <img alt={title} className="size-full object-cover" src={imageUrl} />
        ) : (
          <div className="flex size-full items-center justify-center bg-[#ff7c66] text-white">
            <Sparkles className="size-5" />
          </div>
        )}
        <span className="absolute inset-[38%] rounded-full bg-white/88 shadow-inner" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-black leading-tight text-white">
          {title}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-white/58">
          <Music2 className="size-3" />
          {isPlaying ? "Now playing" : "Ready to play"}
        </p>
      </div>
    </div>
  );
}

function PlaybackController({
  data,
  currentTime,
  duration,
  isPlaying,
  onSeek,
  onToggle,
  onVolumeChange,
  volume,
}: {
  data: FinalSongPlayerData;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeek: (value: number) => void;
  onToggle: () => void;
  onVolumeChange: (value: number) => void;
  volume: number;
}) {
  const safeDuration =
    Number.isFinite(duration) && duration > 0 ? duration : FALLBACK_DURATION;
  const progress = safeDuration
    ? Math.min((currentTime / safeDuration) * 100, 100)
    : 0;

  return (
    <div className="pointer-events-auto mx-auto w-full max-w-6xl rounded-[1.65rem] border border-white/18 bg-black/34 p-3 text-white shadow-[0_26px_80px_rgba(0,0,0,0.44)] backdrop-blur-2xl sm:p-4">
      <div className="flex items-center gap-3 sm:gap-4">
        <ArtworkPlate
          imageUrl={data.imageUrl}
          isPlaying={isPlaying}
          title={data.title}
        />

        <button
          aria-label={isPlaying ? "Pause song" : "Play song"}
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-zinc-950 shadow-[0_12px_34px_rgba(0,0,0,0.32)] transition hover:scale-[1.03] hover:bg-white/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 active:scale-[0.98] sm:size-14"
          type="button"
          onClick={onToggle}
        >
          {isPlaying ? (
            <Pause className="size-5 fill-current sm:size-6" />
          ) : (
            <Play className="ml-0.5 size-5 fill-current sm:size-6" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="min-w-0 md:hidden">
              <p className="truncate text-sm font-black leading-tight">
                {data.title}
              </p>
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-2 text-xs font-semibold text-white/72">
              <span>{formatTime(currentTime)}</span>
              <span className="text-white/34">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          <div className="relative h-6">
            <input
              aria-label="Song progress"
              className="absolute inset-0 z-10 h-6 w-full cursor-pointer opacity-0"
              max={safeDuration}
              min="0"
              step="0.1"
              type="range"
              value={Math.min(currentTime, safeDuration)}
              onChange={(event) => onSeek(Number(event.currentTarget.value))}
            />
            <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full bg-white/18">
              <div
                className="h-full rounded-full bg-linear-to-r from-[#ff7c66] via-[#ffd0a6] to-white shadow-[0_0_26px_rgba(255,124,102,0.7)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div
              className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-white shadow-[0_0_22px_rgba(255,255,255,0.7)]"
              style={{ left: `${progress}%` }}
            />
          </div>
        </div>

        <div className="hidden items-center gap-2 text-white/72 lg:flex">
          <Volume2 className="size-4" />
          <div className="relative h-5 w-20">
            <input
              aria-label="Volume"
              className="absolute inset-0 z-10 h-5 w-full cursor-pointer opacity-0"
              max="1"
              min="0"
              step="0.01"
              type="range"
              value={volume}
              onChange={(event) =>
                onVolumeChange(Number(event.currentTarget.value))
              }
            />
            <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-white/16">
              <div
                className="h-full rounded-full bg-white/72"
                style={{ width: `${volume * 100}%` }}
              />
            </div>
          </div>
        </div>

        <Button
          asChild
          className="hidden h-11 shrink-0 rounded-full bg-[#ff7c66] px-5 text-sm font-black text-white shadow-[0_12px_34px_rgba(255,124,102,0.32)] hover:bg-[#ff6a52] sm:inline-flex"
        >
          <I18nLink href="/create-song">
            Create my song
            <ChevronRight className="size-4" />
          </I18nLink>
        </Button>
      </div>

      <Button
        asChild
        className="mt-3 h-11 w-full rounded-full bg-[#ff7c66] text-sm font-black text-white shadow-[0_12px_34px_rgba(255,124,102,0.26)] hover:bg-[#ff6a52] sm:hidden"
      >
        <I18nLink href="/create-song">
          Create my song
          <ChevronRight className="size-4" />
        </I18nLink>
      </Button>
    </div>
  );
}

export function SharedSongFullscreenPlayer({
  data,
}: {
  data: FinalSongPlayerData;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(data.duration || FALLBACK_DURATION);
  const [volume, setVolume] = useState(0.72);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const cues = useMemo(() => getLyricCues(data, duration), [data, duration]);
  const activeIndex = getActiveCueIndex(cues, currentTime);

  function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }

  function seekTo(value: number) {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = value;
    setCurrentTime(value);
  }

  function changeVolume(value: number) {
    const nextVolume = Math.min(Math.max(value, 0), 1);
    const audio = audioRef.current;

    if (audio) {
      audio.volume = nextVolume;
    }

    setVolume(nextVolume);
  }

  return (
    <main className="relative h-svh max-h-svh w-full overflow-hidden bg-zinc-950 text-white">
      <audio
        ref={audioRef}
        preload="metadata"
        src={data.audioUrl}
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={(event) => {
          const audioDuration = event.currentTarget.duration;
          const nextDuration =
            Number.isFinite(audioDuration) && audioDuration > 0
              ? audioDuration
              : data.duration || FALLBACK_DURATION;
          setDuration(nextDuration);
        }}
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime);
        }}
      />

      <CoverBackdrop imageUrl={data.imageUrl} title={data.title} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.16),transparent_26%),linear-gradient(180deg,rgba(5,6,10,0.72),rgba(5,6,10,0.42)_42%,rgba(5,6,10,0.82))]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.38),transparent_22%,transparent_78%,rgba(0,0,0,0.32))]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:68px_68px]" />

      <div className="relative z-10 flex h-full max-h-svh flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-6">
          <BrandHomeLink />
        </div>

        <section className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 pb-[12.5rem] pt-3 sm:px-6 sm:pb-[9.5rem] sm:pt-5 md:pb-[9rem]">
          <div className="mx-auto max-w-4xl shrink-0 text-center">
            <GiftStoryPrompt
              data={data}
              isOpen={isStoryOpen}
              onClose={() => setIsStoryOpen(false)}
              onOpen={() => setIsStoryOpen(true)}
            />
            <h1 className="mt-4 line-clamp-2 text-balance text-3xl font-black leading-[0.98] tracking-normal text-white drop-shadow-[0_14px_34px_rgba(0,0,0,0.5)] sm:text-5xl lg:text-6xl">
              {data.title}
            </h1>
          </div>

          <LyricsStage
            activeIndex={activeIndex}
            cues={cues}
            currentTime={currentTime}
          />
        </section>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 px-3 pb-3 sm:px-6 sm:pb-6">
        <div className="absolute inset-x-0 bottom-0 h-44 bg-linear-to-t from-black/76 to-transparent" />
        <PlaybackController
          currentTime={currentTime}
          data={data}
          duration={duration}
          isPlaying={isPlaying}
          onSeek={seekTo}
          onToggle={togglePlayback}
          onVolumeChange={changeVolume}
          volume={volume}
        />
      </div>

      <button
        aria-label="Previous lyric"
        className="fixed left-4 top-1/2 z-20 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/12 bg-black/20 text-white/58 backdrop-blur-xl transition hover:bg-white/10 hover:text-white lg:flex"
        type="button"
        onClick={() => {
          const nextCue = cues[Math.max(activeIndex - 1, 0)];
          if (nextCue) seekTo(nextCue.start);
        }}
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        aria-label="Next lyric"
        className="fixed right-4 top-1/2 z-20 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/12 bg-black/20 text-white/58 backdrop-blur-xl transition hover:bg-white/10 hover:text-white lg:flex"
        type="button"
        onClick={() => {
          const nextCue = cues[Math.min(activeIndex + 1, cues.length - 1)];
          if (nextCue) seekTo(nextCue.start);
        }}
      >
        <ChevronRight className="size-5" />
      </button>
    </main>
  );
}
