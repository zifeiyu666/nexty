"use client";

import { PlaylistPlayButton } from "@/components/playlists/PlaylistPlayButton";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { useGlobalMusicPlayer } from "@/lib/music-player/global-player-store";
import type { DemoTrack } from "@/lib/playlists/catalog";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Check,
  FilePenLine,
  Gift,
  MessageSquareQuote,
  Music2,
  PencilLine,
  Share2,
  Sparkles,
  Video,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type StageId = "memory" | "lyrics" | "revision" | "preview" | "gift";

type Stage = {
  id: StageId;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
};

const stages: Stage[] = [
  {
    id: "memory",
    label: "The memory",
    shortLabel: "Memory",
    description: "A few details only they would recognize.",
    icon: MessageSquareQuote,
  },
  {
    id: "lyrics",
    label: "First lyrics",
    shortLabel: "Lyrics",
    description: "The story takes shape as a verse and chorus.",
    icon: FilePenLine,
  },
  {
    id: "revision",
    label: "Your revision",
    shortLabel: "Revision",
    description: "One generic line becomes a private detail.",
    icon: PencilLine,
  },
  {
    id: "preview",
    label: "Song preview",
    shortLabel: "Preview",
    description: "Hear the words in a real musical direction.",
    icon: Music2,
  },
  {
    id: "gift",
    label: "The finished gift",
    shortLabel: "Gift",
    description: "Share the same story as audio, video, or art.",
    icon: Gift,
  },
];

const demoTrack: DemoTrack = {
  id: "memory-proof-anniversary-demo",
  title: "Ten Years, Ava",
  audioUrl:
    "https://cdn.onecustomsong.com/audio/occasion-demos/anniversary-ten-years-ava.mp3",
  duration: "2:05",
  style: "Romantic Ballad",
};

const waveformBars = [
  22, 42, 34, 58, 48, 76, 44, 66, 86, 54, 38, 72, 92, 64, 48, 78, 58, 36, 68,
  84, 52, 72, 42, 62, 88, 56, 34, 74, 48, 64, 80, 46,
];

function EvidenceLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-primary">
      <span className="size-1.5 rounded-full bg-primary" />
      {children}
    </span>
  );
}

function MemoryPanel() {
  return (
    <div className="grid min-h-[450px] bg-[#f6f0e9] lg:h-[450px] lg:grid-cols-[0.86fr_1.14fr]">
      <div className="relative min-h-[290px] overflow-hidden bg-[#2b1710]">
        <Image
          alt="Anniversary couple representing the memory behind the custom song"
          className="object-cover"
          fill
          sizes="(max-width: 1024px) 100vw, 43vw"
          src="/images/create-song/occasion-cards/v2-webp-roomy/anniversary.webp"
        />
        <div className="absolute inset-0 bg-[#1c1714]/38" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
          <p className="text-xs font-semibold uppercase text-white/68">
            The source material
          </p>
          <p className="mt-2 text-lg font-semibold">Ava · 10th anniversary</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Coffee order", "First train trip", "Saved ticket"].map(
              (detail) => (
                <span
                  className="rounded-full border border-white/25 bg-black/25 px-3 py-1.5 text-xs font-medium text-white backdrop-blur"
                  key={detail}
                >
                  {detail}
                </span>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
        <EvidenceLabel>Original story note</EvidenceLabel>
        <blockquote className="mt-6 max-w-2xl text-balance font-serif text-3xl leading-[1.24] text-[#2b1710] sm:text-[2.15rem] lg:text-[2.35rem]">
          “She orders my coffee before I remember I’m tired, and still keeps the
          train ticket from our first trip in her wallet.”
        </blockquote>
        <p className="mt-6 max-w-xl border-l-2 border-[#e9553f] pl-4 text-sm leading-6 text-[#6f625c] sm:text-base">
          No polished prompt. No songwriting language. Just the details that
          already belong to them.
        </p>
      </div>
    </div>
  );
}

function LyricsPanel() {
  return (
    <div className="grid min-h-[450px] bg-[#191513] lg:h-[450px] lg:grid-cols-[minmax(300px,0.7fr)_minmax(0,1.3fr)]">
      <div className="flex flex-col justify-center border-b border-white/10 p-6 text-white sm:p-8 lg:border-b-0 lg:border-r lg:p-9">
        <EvidenceLabel>Generated from the note</EvidenceLabel>
        <p className="mt-8 text-xs font-semibold uppercase text-white/48">
          Verse 1
        </p>
        <p className="mt-4 font-serif text-xl leading-8 text-[#fff8f0] sm:text-[1.35rem] sm:leading-8">
          Blue morning light and a paper cup,
          <br />
          You know I’m tired before I look up.
          <br />
          Ten years on, that ticket stays,
          <br />
          Folded close through all our days.
        </p>
        <div className="mt-7 border-t border-white/12 pt-4">
          <p className="flex items-center gap-2 text-sm font-medium text-[#f2b29f]">
            <Check className="size-4" /> 3 story details carried into the lyrics
          </p>
          <p className="mt-2 text-xs leading-5 text-white/48">
            Names, objects, and chronology remain editable.
          </p>
        </div>
      </div>

      <div className="relative flex min-h-[350px] flex-col overflow-hidden p-4 sm:p-6 lg:min-h-0 lg:p-7">
        <div className="absolute inset-x-6 top-5 flex items-center justify-between text-xs font-semibold text-white/52 lg:inset-x-9 lg:top-6">
          <span>Live product view</span>
          <span>Lyrics editor · Step 4 of 5</span>
        </div>
        <div className="relative mt-9 min-h-[290px] flex-1 overflow-hidden rounded-lg border border-white/12 bg-[#f7eee8] shadow-[0_24px_64px_rgba(0,0,0,0.32)] lg:min-h-0">
          <Image
            alt="Editable custom song lyrics in the One Custom Song editor"
            className="object-cover object-center"
            fill
            sizes="(max-width: 1024px) 100vw, 64vw"
            src="/steps/step-4-generate-lyrics.webp"
          />
        </div>
      </div>
    </div>
  );
}

function RevisionPanel() {
  return (
    <div className="grid min-h-[450px] content-center gap-7 bg-[#f6f0e9] p-6 text-[#2b1710] sm:p-8 lg:h-[450px] lg:grid-cols-[0.8fr_1.2fr] lg:p-9">
      <div>
        <EvidenceLabel>One line, made specific</EvidenceLabel>
        <h3 className="mt-5 text-2xl font-bold leading-tight text-[#2b1710] sm:text-3xl">
          Keep the rhyme. Replace the greeting-card line.
        </h3>
        <p className="mt-4 max-w-md text-base leading-7 text-[#6f625c]">
          Select only the line that feels generic. The rest of the verse stays
          exactly where it is.
        </p>
      </div>

      <div className="divide-y divide-[#d8c8be] border-y border-[#d8c8be]">
        <div className="grid gap-3 py-5 sm:grid-cols-[100px_1fr] sm:items-start">
          <span className="text-xs font-semibold uppercase text-[#756158]">
            Before
          </span>
          <p className="text-xl leading-8 text-[#5f504a] line-through decoration-[#c95e4c] decoration-2">
            You are my light, my dream come true.
          </p>
        </div>
        <div className="grid gap-3 py-5 sm:grid-cols-[100px_1fr] sm:items-start">
          <span className="text-xs font-semibold uppercase text-[#9b3d2f]">
            After
          </span>
          <p className="font-serif text-2xl leading-9 text-[#7f3027]">
            You order my coffee before I know I’m tired.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 py-5 text-sm">
          <span className="flex items-center gap-2 font-medium text-[#493b35]">
            <Sparkles className="size-4 text-primary" /> Rewrite direction: “Use
            the coffee memory”
          </span>
          <span className="rounded-full bg-[#f4e1d8] px-3 py-1.5 font-semibold text-[#8f3d31]">
            Meaning preserved
          </span>
        </div>
      </div>
    </div>
  );
}

function PreviewPanel() {
  const activeTrackId = useGlobalMusicPlayer((state) => state.track?.id);
  const isPlaying = useGlobalMusicPlayer((state) => state.isPlaying);
  const isDemoPlaying = activeTrackId === demoTrack.id && isPlaying;

  return (
    <>
      <div className="grid min-h-[450px] overflow-hidden lg:h-[450px] lg:grid-cols-[0.82fr_1.18fr]">
        <div className="relative min-h-[260px] bg-[#ebd9cc]">
          <Image
            alt="Anniversary couple used as temporary artwork for a custom song demo"
            className="object-cover"
            fill
            sizes="(max-width: 1024px) 100vw, 36vw"
            src="/images/create-song/occasion-cards/v2-webp-roomy/anniversary.webp"
          />
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#2b1710] shadow-sm backdrop-blur">
            Temporary cover artwork
          </span>
        </div>

        <div className="flex flex-col justify-center bg-[#2b1710] p-6 text-white sm:p-8 lg:p-9">
          <EvidenceLabel>Playable demo</EvidenceLabel>
          <p className="mt-6 text-sm font-medium text-white/60">
            Romantic ballad · Anniversary
          </p>
          <h3 className="mt-2 text-3xl font-bold sm:text-4xl">
            Ten Years, Ava
          </h3>
          <div
            aria-hidden="true"
            className="mt-7 flex h-16 items-center gap-1.5 overflow-hidden"
            data-memory-proof-wave
          >
            {waveformBars.map((height, index) => (
              <span
                className={cn(
                  "w-0.5 shrink-0 origin-center rounded-full bg-[#f6a08e] opacity-80 transition-[transform,opacity] duration-300",
                  isDemoPlaying &&
                    "animate-[memory-proof-wave_1s_ease-in-out_infinite]",
                )}
                key={`${height}-${index}`}
                style={{
                  height: `${height}%`,
                  animationDelay: `${index * 42}ms`,
                  animationDuration: `${880 + (index % 5) * 90}ms`,
                }}
              />
            ))}
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <PlaylistPlayButton
              className="h-11 bg-[#f25a43] px-5 text-white hover:bg-[#df4935]"
              track={demoTrack}
            />
            <span className="text-sm text-white/62">
              Existing demo audio · replace when the final case is ready
            </span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes memory-proof-wave {
          0%,
          100% {
            transform: scaleY(0.42);
            opacity: 0.55;
          }
          45% {
            transform: scaleY(1);
            opacity: 1;
          }
          72% {
            transform: scaleY(0.68);
            opacity: 0.78;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          [data-memory-proof-wave] span {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </>
  );
}

const giftOutputs = [
  {
    label: "Private share page",
    icon: Share2,
    image: "/steps/song-generation-result.webp",
    alt: "Private custom song sharing page",
  },
  {
    label: "Music video",
    icon: Video,
    image: "/steps/music-video.webp",
    alt: "Custom song music video editor",
  },
  {
    label: "Printable lyric art",
    icon: Gift,
    image: "/steps/lyric-wall-art.webp",
    alt: "Printable custom song lyric wall art editor",
  },
];

function GiftPanel() {
  return (
    <div className="grid min-h-[450px] overflow-hidden bg-[#efe6dc] lg:h-[450px] lg:grid-cols-[0.36fr_0.64fr]">
      <div className="flex flex-col justify-center bg-[#2b1710] p-6 text-white sm:p-8 lg:p-9">
        <EvidenceLabel>One song, three finished formats</EvidenceLabel>
        <h3 className="mt-5 text-3xl font-bold leading-tight sm:text-[2.15rem]">
          Ready to send, show, or print.
        </h3>
        <p className="mt-5 text-base leading-7 text-white/68">
          The same story can become a private listening page, a video, or a
          print-ready keepsake.
        </p>
        <p className="mt-6 text-xs leading-5 text-white/46">
          Current product screens shown as temporary case-study assets.
        </p>
      </div>

      <div className="mx-auto grid w-full max-w-5xl gap-3 p-6 sm:p-8 md:grid-cols-3 lg:content-center lg:px-9 lg:py-8">
        {giftOutputs.map((output) => {
          const Icon = output.icon;
          return (
            <figure className="group min-w-0" key={output.label}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-[#cdbdb2] bg-[#f7eee8] shadow-[0_18px_48px_rgba(54,38,27,0.13)] transition-[transform,box-shadow] duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_28px_64px_rgba(54,38,27,0.19)] md:aspect-[4/5]">
                <Image
                  alt={output.alt}
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.025]"
                  fill
                  sizes="(max-width: 768px) 100vw, 29vw"
                  src={output.image}
                />
              </div>
              <figcaption className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#2b1710]">
                <Icon className="size-4 text-[#e9553f]" />
                {output.label}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}

function StagePanel({ stage }: { stage: StageId }) {
  switch (stage) {
    case "memory":
      return <MemoryPanel />;
    case "lyrics":
      return <LyricsPanel />;
    case "revision":
      return <RevisionPanel />;
    case "preview":
      return <PreviewPanel />;
    case "gift":
      return <GiftPanel />;
  }
}

export default function MemoryToSongProof() {
  const [activeStage, setActiveStage] = useState<StageId>("memory");
  const activeStageIndex = stages.findIndex(
    (stage) => stage.id === activeStage,
  );

  return (
    <section
      aria-labelledby="memory-proof-title"
      className="home-section-deep home-warm-ambient relative isolate overflow-hidden py-16 md:py-20"
      id="memory-to-song"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(18,11,9,0.42)_72%,rgba(18,11,9,0.72)_100%)]"
      />
      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-7 border-b border-white/12 pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.48fr)] lg:items-end">
          <div>
            <p className="home-eyebrow">Case study 01 · Ava</p>
            <h2
              className="home-title hero-title-warm max-w-4xl"
              id="memory-proof-title"
            >
              See what one memory can become.
            </h2>
          </div>
          <div className="lg:pb-1">
            <p className="max-w-lg text-base leading-7 text-white/70 md:text-lg">
              Follow one ordinary anniversary note through the exact moments
              where it becomes editable lyrics, a playable song, and a finished
              gift.
            </p>
            <div className="mt-5 flex items-center gap-3 text-xs font-semibold text-white/50">
              <span>5 stages</span>
              <span className="h-px w-8 bg-white/20" />
              <span>1 visible transformation</span>
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-lg border border-white/14 bg-[#120b09]/72 shadow-[0_32px_84px_rgba(0,0,0,0.34)] backdrop-blur-sm">
          <div
            aria-label="Example stages"
            className="flex snap-x overflow-x-auto border-b border-white/12 bg-[#231713]/92 px-2 sm:px-4 lg:grid lg:grid-cols-5 lg:overflow-visible"
            role="tablist"
          >
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const isActive = stage.id === activeStage;
              const isComplete = index < activeStageIndex;

              return (
                <button
                  aria-controls={`memory-proof-panel-${stage.id}`}
                  aria-selected={isActive}
                  className={cn(
                    "group relative flex min-h-16 min-w-32 cursor-pointer snap-start items-center gap-2.5 border-b-2 px-3 py-2.5 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary lg:min-w-0 lg:px-3",
                    isActive
                      ? "border-primary bg-white/[0.055] text-white"
                      : "border-transparent text-white/52 hover:bg-white/[0.035] hover:text-white/82",
                  )}
                  id={`memory-proof-tab-${stage.id}`}
                  key={stage.id}
                  onClick={() => setActiveStage(stage.id)}
                  role="tab"
                  type="button"
                >
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : isComplete
                          ? "border-primary/55 bg-primary/10 text-[#f2b29f]"
                          : "border-white/18 bg-transparent text-white/48",
                    )}
                  >
                    {isComplete ? (
                      <Check className="size-4" />
                    ) : (
                      <Icon className="size-3.5" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-bold sm:text-sm">
                      <span className="lg:hidden">{stage.shortLabel}</span>
                      <span className="hidden lg:inline">{stage.label}</span>
                    </span>
                    <span className="sr-only">{stage.description}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div
            aria-labelledby={`memory-proof-tab-${activeStage}`}
            className="animate-in fade-in overflow-hidden duration-300"
            id={`memory-proof-panel-${activeStage}`}
            key={activeStage}
            role="tabpanel"
          >
            <StagePanel stage={activeStage} />
          </div>
        </div>

        <div className="mt-7 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm leading-6 text-white/48">
            Your details stay editable at every step before you unlock the full
            song.
          </p>
          <Button
            asChild
            className="h-11 rounded-full bg-primary px-6 font-bold text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/create-song">
              Turn your memory into a song <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
