"use client";

import CopyButton from "@/components/shared/CopyButton";
import { MusicVideoEditorDrawer } from "@/components/song/MusicVideoEditorDrawer";
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
import { buildLrcFileName, buildLrcText } from "@/lib/music-player/lrc-export";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Check,
  Copy,
  Disc3,
  Download,
  ExternalLink,
  FileText,
  Pause,
  Play,
  QrCode,
  Share2,
  Sparkles,
  Volume2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useMemo, useRef, useState } from "react";
import { TwitterX } from "@/components/social-icons/icons";

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
    <div className="relative mx-auto aspect-square w-full max-w-[320px]">
      <div
        className={cn(
          "absolute inset-0 rounded-full border border-white/20 bg-[radial-gradient(circle_at_center,#f8fafc_0_8%,#111827_9%_12%,#1f2937_13%_34%,#020617_35%_100%)] shadow-2xl shadow-black/25",
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
          <div className="absolute left-1/2 top-1/2 flex size-[58%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="size-14" />
          </div>
        )}
      </div>
      <div className="absolute inset-[18%] rounded-full border border-white/25" />
      <div className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background shadow-inner" />
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
            className="border-border bg-background/70 px-3 py-1.5 text-muted-foreground"
            variant="outline"
          >
            {label}
          </Badge>
        ))}
    </div>
  );
}

function SharePanel({ shareUrl, title }: { shareUrl: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const tweetUrl = `https://twitter.com/intent/tweet?${new URLSearchParams({
    text: `Listen to "${title}"`,
    url: shareUrl,
  }).toString()}`;

  async function copyShareUrl() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="rounded-[20px] border border-black/10 bg-white/86 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">
            Share
          </p>
          <h2 className="mt-1 text-lg font-black text-foreground">
            Private link, ready to send
          </h2>
        </div>
        <div className="flex gap-2">
          <Button
            asChild
            className="rounded-full bg-white/70"
            variant="outline"
          >
            <a href={shareUrl} rel="noreferrer" target="_blank">
              <ExternalLink className="size-4" />
              Preview
            </a>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-white/70" variant="outline">
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
                className="rounded-full bg-white/70"
                type="button"
                variant="outline"
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
                <div className="min-w-0 rounded-2xl border border-black/10 bg-white/80 p-3">
                  <p className="break-all text-sm font-semibold leading-6 text-stone-700 sm:truncate sm:break-normal">
                    {shareUrl}
                  </p>
                </div>
                <div className="grid gap-2">
                  <Button
                    className="h-11 justify-start rounded-xl bg-stone-950 text-white hover:bg-stone-800"
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
                  <Button
                    asChild
                    className="h-11 justify-start rounded-xl border-black/10 bg-white/80"
                    variant="outline"
                  >
                    <a href={tweetUrl} rel="noreferrer" target="_blank">
                      <TwitterX className="size-4" />
                      Share to X
                    </a>
                  </Button>
                  <Button
                    asChild
                    className="h-11 justify-start rounded-xl border-black/10 bg-white/80"
                    variant="outline"
                  >
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
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-black/10 bg-white/60 px-3 py-2">
        <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
          {shareUrl}
        </p>
        <CopyButton
          className="rounded-full p-2 hover:bg-muted"
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

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <WallArtEditorDrawer
        initialSong={initialSong}
        songOptions={songOptions}
        trigger={
          <button
            className="group relative flex w-full cursor-pointer items-center justify-between gap-3 overflow-hidden rounded-[16px] border border-primary/35 bg-[#fff1ed]/90 px-4 py-3 text-left shadow-[0_8px_22px_rgba(244,63,94,0.1)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/70 hover:bg-[#ffe7df] hover:shadow-[0_14px_32px_rgba(244,63,94,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 active:translate-y-0"
            type="button"
          >
            <div className="min-w-0">
              <h3 className="text-base font-black text-foreground">
                Generate Wall Art
              </h3>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Generate a lyric poster and cover artwork set for this song.
              </p>
            </div>
            <span className="hidden shrink-0 items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs font-black text-white shadow-sm transition duration-200 group-hover:gap-3 sm:inline-flex">
              Open editor
              <ArrowRight className="size-3.5 transition duration-200 group-hover:translate-x-0.5" />
            </span>
          </button>
        }
      />

      <MusicVideoEditorDrawer
        audioUrl={data.audioUrl}
        duration={data.duration}
        imageUrl={data.imageUrl}
        lyrics={data.lyrics}
        songId={data.id}
        songTitle={data.title}
        timestampedLyrics={data.timestampedLyrics}
        trigger={
          <button
            className="group relative flex w-full cursor-pointer items-center justify-between gap-3 overflow-hidden rounded-[16px] border border-primary/35 bg-[#fff1ed]/90 px-4 py-3 text-left shadow-[0_8px_22px_rgba(244,63,94,0.1)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/70 hover:bg-[#ffe7df] hover:shadow-[0_14px_32px_rgba(244,63,94,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 active:translate-y-0"
            type="button"
          >
            <div className="min-w-0">
              <h3 className="text-base font-black text-foreground">
                Generate Music Video
              </h3>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Turn the song story, lyrics, and artwork into a short video.
              </p>
            </div>
            <span className="hidden shrink-0 items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs font-black text-white shadow-sm transition duration-200 group-hover:gap-3 sm:inline-flex">
              Open editor
              <ArrowRight className="size-3.5 transition duration-200 group-hover:translate-x-0.5" />
            </span>
          </button>
        }
      />
    </div>
  );
}

function ImmersiveSongPlayerCard({
  data,
  isPlaying,
  onPlayingChange,
}: {
  data: FinalSongPlayerData;
  isPlaying: boolean;
  onPlayingChange: (isPlaying: boolean) => void;
}) {
  const lyricLines = getLyricLines(data.lyrics).slice(0, 10);
  const featureLine =
    lyricLines[Math.min(4, Math.max(0, lyricLines.length - 1))];

  return (
    <section className="relative min-h-[680px] overflow-hidden rounded-[28px] border border-white/25 bg-stone-950 text-white shadow-2xl shadow-stone-950/25 lg:sticky lg:top-6 lg:h-[calc(100svh-3rem)] lg:min-h-[720px]">
      {data.imageUrl ? (
        <img
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full scale-110 object-cover blur-2xl"
          src={data.imageUrl}
        />
      ) : null}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.18),transparent_28%),linear-gradient(180deg,rgba(5,8,14,0.72),rgba(5,8,14,0.58)_45%,rgba(5,8,14,0.9))]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-white/10 blur-3xl" />

      <div className="relative flex h-full min-h-[680px] flex-col px-5 py-6 lg:min-h-[720px]">
        <div className="mx-auto mt-2 w-full max-w-[300px]">
          <RecordArtwork
            imageUrl={data.imageUrl}
            isPlaying={isPlaying}
            title={data.title}
          />
        </div>

        <div className="mt-auto flex min-h-0 flex-1 flex-col justify-end pt-8">
          <div className="mx-auto w-full max-w-[290px] text-center">
            <h2 className="mt-2 line-clamp-2 text-balance text-2xl font-bold leading-tight text-white">
              {data.title}
            </h2>
          </div>

          <div className="mt-6 max-h-[260px] overflow-hidden text-center [mask-image:linear-gradient(180deg,transparent,black_18%,black_78%,transparent)]">
            <div className="space-y-3 py-8">
              {lyricLines.map((line, index) => (
                <p
                  key={`${line}-${index}`}
                  className={cn(
                    "text-sm font-semibold leading-7 text-white/58",
                    line === featureLine && "text-xl font-black text-white",
                  )}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <PlaybackControls
              data={data}
              variant="poster"
              onPlayingChange={onPlayingChange}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function FinalSongOwnerPlayer({
  data,
  songOptions,
}: {
  data: FinalSongPlayerData;
  songOptions?: FinalSongPlayerData[];
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
      <ImmersiveSongPlayerCard
        data={data}
        isPlaying={isPlaying}
        onPlayingChange={setIsPlaying}
      />

      <section className="space-y-5">
        <div className="rounded-[24px] border border-black/10 bg-white/86 p-5 shadow-sm backdrop-blur">
          <h1 className="mt-1 text-5xl font-bold  leading-tight text-foreground ">
            {data.title}
          </h1>
          <div className="mt-4">
            <SongFacts data={data} />
          </div>
        </div>

        {data.shareUrl && (
          <SharePanel shareUrl={data.shareUrl} title={data.title} />
        )}
        <SongCreationTools data={data} songOptions={songOptions} />

        <div className="rounded-[24px] border border-black/10 bg-white/86 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-black text-foreground">Lyrics</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                className="rounded-full"
                size="sm"
                type="button"
                variant="outline"
                onClick={() => downloadLrcLyrics(data)}
              >
                <FileText className="size-4" />
                Export LRC
              </Button>
              <Button
                asChild
                className="rounded-full"
                size="sm"
                variant="outline"
              >
                <a href={data.audioUrl} rel="noreferrer" target="_blank">
                  <Download className="size-4" />
                  Open audio
                </a>
              </Button>
            </div>
          </div>
          <pre className="mt-4 max-h-[560px] overflow-y-auto whitespace-pre-wrap rounded-2xl bg-white/45 p-1 text-sm font-semibold leading-8 text-stone-950">
            {data.lyrics}
          </pre>
        </div>
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
                  CustomSong
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
