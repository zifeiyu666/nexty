"use client";

import CopyButton from "@/components/shared/CopyButton";
import { MusicVideoEditorDrawer } from "@/components/song/MusicVideoEditorDrawer";
import { WallArtEditorDrawer } from "@/components/song/WallArtEditorDrawer";
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
import { cn } from "@/lib/utils";
import {
  Disc3,
  Download,
  FileText,
  ImageIcon,
  Pause,
  Play,
  QrCode,
  Share2,
  Sparkles,
  Video,
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
}: {
  data: FinalSongPlayerData;
  onPlayingChange?: (isPlaying: boolean) => void;
  onTimeChange?: (currentTime: number, duration: number) => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(data.duration || 0);

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
      />
      <div className="flex items-center gap-3">
        <button
          aria-label={isPlaying ? "Pause song" : "Play song"}
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90"
          type="button"
          onClick={togglePlayback}
        >
          {isPlaying ? (
            <Pause className="size-5 fill-current" />
          ) : (
            <Play className="ml-0.5 size-5 fill-current" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-xs font-medium text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(effectiveDuration)}</span>
          </div>
        </div>
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
  async function nativeShare() {
    if (!navigator.share) return;
    await navigator.share({
      title,
      url: shareUrl,
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
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
          <Dialog>
            <DialogTrigger asChild>
              <Button className="rounded-full" variant="outline">
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
          <Button
            className="rounded-full"
            type="button"
            variant="outline"
            onClick={nativeShare}
          >
            <Share2 className="size-4" />
            Share
          </Button>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
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

function SongCreationTools({ data }: { data: FinalSongPlayerData }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <WallArtEditorDrawer
        imageUrl={data.imageUrl}
        lyrics={data.lyrics}
        shareUrl={data.shareUrl}
        songTitle={data.title}
        trigger={
          <button
            className="rounded-2xl border border-primary/25 bg-primary/5 p-4 text-left transition hover:border-primary/45 hover:bg-primary/10"
            type="button"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-background text-primary">
                <ImageIcon className="size-5" />
              </span>
              <Badge variant="secondary">Editor</Badge>
            </div>
            <h3 className="mt-4 text-base font-black text-foreground">
              Wall Art
            </h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Generate a lyric poster and cover artwork set for this song.
            </p>
          </button>
        }
      />

      <MusicVideoEditorDrawer
        audioUrl={data.audioUrl}
        duration={data.duration}
        imageUrl={data.imageUrl}
        lyrics={data.lyrics}
        songTitle={data.title}
        timestampedLyrics={data.timestampedLyrics}
        trigger={
          <button
            className="rounded-2xl border border-primary/25 bg-primary/5 p-4 text-left transition hover:border-primary/45 hover:bg-primary/10"
            type="button"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-background text-primary">
                <Video className="size-5" />
              </span>
              <Badge variant="secondary">Editor</Badge>
            </div>
            <h3 className="mt-4 text-base font-black text-foreground">
              Music Video
            </h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Turn the song story, lyrics, and artwork into a short video.
            </p>
          </button>
        }
      />
    </div>
  );
}

export function FinalSongOwnerPlayer({ data }: { data: FinalSongPlayerData }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[360px_1fr]">
      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <RecordArtwork
          imageUrl={data.imageUrl}
          isPlaying={isPlaying}
          title={data.title}
        />
        <div className="mt-6">
          <PlaybackControls data={data} onPlayingChange={setIsPlaying} />
        </div>
      </section>

      <section className="space-y-5">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <p className="font-[cursive] text-lg text-primary">final song</p>
          <h1 className="mt-1 text-3xl font-black leading-tight text-foreground md:text-5xl">
            {data.title}
          </h1>
          <div className="mt-4">
            <SongFacts data={data} />
          </div>
          <Button asChild className="mt-5 rounded-full" variant="outline">
            <a href={data.audioUrl} rel="noreferrer" target="_blank">
              <Download className="size-4" />
              Open audio
            </a>
          </Button>
        </div>

        {data.shareUrl && (
          <SharePanel shareUrl={data.shareUrl} title={data.title} />
        )}
        <SongCreationTools data={data} />

        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-xl font-black text-foreground">Lyrics</h2>
          <pre className="mt-4 max-h-[520px] overflow-y-auto whitespace-pre-wrap text-sm leading-7 text-foreground">
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
