"use client";

import ChooseButton from "@/components/song/ChooseButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Cake,
  ChevronDown,
  Clock3,
  Edit3,
  Gift,
  Heart,
  Languages,
  LockKeyhole,
  Mic2,
  Pause,
  Play,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type SampleVersion = {
  id: string;
  title: string;
  audioUrl: string;
  imageUrl?: string;
  duration?: number;
};

export type SampleSongPlayerData = {
  songId: string;
  title: string;
  lyrics: string;
  genre: string;
  occasion: string;
  language: string;
  vocalGender: string;
  recipientNames: string[];
  story: string;
  versions: SampleVersion[];
  previewLimitSeconds?: number | null;
  accessExpiresAt?: number;
  isExpired?: boolean;
};

function labelize(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function InfoPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1.5 text-[11px] font-bold text-muted-foreground">
      <span className="text-primary">{icon}</span>
      {label}
    </span>
  );
}

export function SampleSongPlayer({
  data,
  regenerateHref,
  isSubscriber = false,
}: {
  data: SampleSongPlayerData;
  regenerateHref?: string;
  isSubscriber?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeVersion, setActiveVersion] = useState("A");
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const [showLyrics, setShowLyrics] = useState(true);
  const displayDuration =
    data.previewLimitSeconds || data.versions[0]?.duration || 60;
  const occasionLabel = labelize(data.occasion || "sample");
  const recipientLabel = data.recipientNames.join(" and ") || "someone special";
  const router = useRouter();
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [selectedVersionForPaywall, setSelectedVersionForPaywall] = useState<"A" | "B">("A");

  function togglePlayback(version: string, audioUrl: string) {
    if (data.isExpired || !audioUrl) return;
    const audio = audioRef.current;
    if (!audio) return;

    if (activeVersion === version && isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    setActiveVersion(version);
    audio.src = audioUrl;
    audio.currentTime = 0;
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }

  return (
    <div className="mx-auto max-w-4xl py-5">
      <audio
        ref={audioRef}
        preload="metadata"
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={(event) => {
          const audio = event.currentTarget;
          const limit = data.previewLimitSeconds;
          if (limit && audio.currentTime >= limit) {
            audio.pause();
            audio.currentTime = limit;
            setIsPlaying(false);
          }
          setPreviewTime(Number(audio.currentTime.toFixed(0)));
        }}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-accent-foreground">
          <ShieldCheck className="size-4" />
          {data.isExpired ? "Sample expired" : "Sample ready"}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground">
          <Clock3 className="size-4" />
          {data.accessExpiresAt
            ? `Access until ${new Date(data.accessExpiresAt).toLocaleDateString()}`
            : "3-day access"}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground">
          <LockKeyhole className="size-4" />
          1 minute sample
        </span>
      </div>

      {data.isExpired && (
        <div className="mb-5 rounded-2xl border border-border bg-muted p-4 text-sm text-muted-foreground">
          <p className="font-black text-foreground">This sample has expired.</p>
          <p className="mt-1 leading-6">
            You can no longer play this song, but the form data is still
            available for recreating a fresh sample.
          </p>
        </div>
      )}

      <section className="grid gap-5 lg:grid-cols-[180px_1fr] lg:items-center">
        <div className="mx-auto size-40 overflow-hidden rounded-full bg-gradient-to-br from-accent via-primary/20 to-foreground shadow-xl shadow-primary/15 opacity-95">
          <div className="relative h-full w-full">
            <div className="absolute left-8 top-12 h-16 w-7 rounded-full bg-foreground/55" />
            <div className="absolute left-7 top-8 size-8 rounded-full bg-foreground/60" />
            <div className="absolute right-11 top-12 h-20 w-8 rounded-full bg-foreground/45" />
            <div className="absolute right-11 top-8 size-9 rounded-full bg-foreground/50" />
            <div className="absolute bottom-7 left-1/2 h-20 w-10 -translate-x-1/2 rounded-full bg-foreground/70" />
            <div className="absolute bottom-24 left-1/2 size-9 -translate-x-1/2 rounded-full bg-foreground/75" />
          </div>
        </div>

        <div>
          <p className="mb-1 font-[cursive] text-lg text-accent-foreground">
            sample take
          </p>
          <h1 className="max-w-2xl text-2xl font-black leading-tight text-foreground md:text-4xl">
            {data.title || "Your Custom Song"}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <InfoPill icon={<Heart className="size-4" />} label={`For ${recipientLabel}`} />
            <InfoPill icon={<Cake className="size-4" />} label={occasionLabel} />
            <InfoPill icon={<Gift className="size-4" />} label={data.genre} />
            <InfoPill icon={<Mic2 className="size-4" />} label={data.vocalGender} />
            <InfoPill icon={<Languages className="size-4" />} label={data.language} />
          </div>
        </div>
      </section>

      <div className="mx-auto mt-6 grid max-w-3xl gap-3 md:grid-cols-2">
        {["A", "B"].map((version, index) => {
          const songVersion = data.versions[index];
          const isActiveVersion = activeVersion === version;
          const isThisPlaying = isActiveVersion && isPlaying;

          return (
            <div
              key={version}
              className={cn(
                "rounded-2xl border border-border bg-card p-3 shadow-sm",
                data.isExpired && "opacity-55"
              )}
            >
              <div className="mb-2 flex items-start gap-2.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-black text-primary-foreground">
                  {version}
                </span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">
                    Version {version}
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {songVersion?.title || data.title || "Sample"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-muted p-2.5">
                <button
                  aria-label={`Play version ${version}`}
                  className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={data.isExpired || !songVersion?.audioUrl}
                  type="button"
                  onClick={() => togglePlayback(version, songVersion?.audioUrl || "")}
                >
                  {isThisPlaying ? (
                    <Pause className="size-4 fill-current" />
                  ) : (
                    <Play className="ml-0.5 size-4 fill-current" />
                  )}
                </button>
                <div className="flex flex-1 items-center gap-1 overflow-hidden">
                  {Array.from({ length: 22 }).map((_, barIndex) => (
                    <span
                      key={barIndex}
                      className="w-full rounded-full bg-border"
                      style={{ height: `${7 + ((barIndex * 9 + index * 4) % 20)}px` }}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-bold text-muted-foreground">
                  {isActiveVersion ? previewTime : "0"}s / {Math.ceil(displayDuration)}s
                </span>
              </div>
            <div className="mt-3">
              <ChooseButton
                className="w-full rounded-full bg-primary px-3 py-2 text-sm font-black text-primary-foreground hover:bg-primary/90"
                onChoose={() => {
                  const v = version === "A" ? "A" : "B";
                  if (isSubscriber) {
                    router.push(`/create-song?fromSample=${encodeURIComponent(data.songId)}&version=${v}`);
                    return;
                  }
                  setSelectedVersionForPaywall(v as "A" | "B");
                  setIsPaywallOpen(true);
                }}
              >
                Choose this one
              </ChooseButton>
            </div>
            </div>
          );
        })}
      </div>

      {isPaywallOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 px-4 py-8 backdrop-blur-xl">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-2xl shadow-foreground/20">
            <div className="flex items-center justify-between gap-4 border-b border-border p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-black text-primary-foreground">{selectedVersionForPaywall}</div>
                <div>
                  <h2 className="text-lg font-black leading-tight">{data.title}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Version · {selectedVersionForPaywall} · for {recipientLabel}</p>
                </div>
              </div>
              <button aria-label="Close paywall" className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground" type="button" onClick={() => setIsPaywallOpen(false)}>
                <X className="size-5" />
              </button>
            </div>

            <div className="p-5 text-center sm:p-6">
              <p className="font-[cursive] text-base text-primary">one more step...</p>
              <h3 className="mt-1.5 text-xl font-black text-foreground">Choose how to unlock</h3>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">Pick a one-off unlock, a bundle, or a subscription plan on the next screen.</p>

              <div className="mx-auto mt-5 flex max-w-lg gap-3 rounded-xl border border-border bg-muted p-3.5 text-left text-sm leading-6 text-muted-foreground">
                <Gift className="mt-1 size-4 shrink-0 text-primary" />
                <p>You don't have a subscription or song credits yet. We'll take you to secure checkout to pick the right option for you.</p>
              </div>

              <p className="mt-5 inline-flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-4 text-primary"/> Secure checkout</p>
            </div>

            <div className="flex items-center gap-3 border-t border-border bg-background/95 p-4">
              <Button className="h-10 rounded-full bg-muted px-6 text-sm font-bold text-muted-foreground" type="button" variant="ghost" onClick={() => setIsPaywallOpen(false)}>Not yet</Button>
              <Button
                className="h-10 flex-1 rounded-full bg-primary text-sm font-bold text-primary-foreground"
                type="button"
                onClick={() => {
                  const params = new URLSearchParams({
                    type: "unlock_song",
                    songId: data.songId,
                    returnTo: `/samples/${data.songId}`,
                  });
                  router.push(`/pricing?${params.toString()}`);
                }}
              >
                <LockKeyhole className="size-4" /> Continue to checkout
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto mt-5 max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <button
          className="flex w-full items-center justify-between border-b border-border p-3 text-left"
          type="button"
          onClick={() => setShowLyrics((current) => !current)}
        >
          <span className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Edit3 className="size-4" />
            </span>
            <span>
              <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">
                Written for {recipientLabel}
              </span>
              <span className="text-base font-black text-foreground">The lyrics</span>
            </span>
          </span>
          <ChevronDown
            className={cn("size-4 text-muted-foreground transition", showLyrics && "rotate-180")}
          />
        </button>
        {showLyrics && (
          <div className="max-h-[300px] overflow-y-auto p-4 text-sm leading-7 text-foreground">
            <pre className="whitespace-pre-wrap font-sans">{data.lyrics}</pre>
          </div>
        )}
      </div>

      {regenerateHref && (
        <Link
          className="mx-auto mt-5 flex w-full max-w-3xl items-center justify-between rounded-2xl border border-dashed border-border bg-card p-4 text-left transition hover:border-primary/40 hover:bg-primary/5"
          href={regenerateHref}
        >
          <span className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <RefreshCw className="size-4" />
            </span>
            <span>
              <span className="block font-[cursive] text-base text-accent-foreground">
                need another take?
              </span>
              <span className="block text-base font-black text-foreground">
                Recreate from the same form data
              </span>
              <span className="block text-sm text-muted-foreground">
                Use the original occasion, story, genre and lyrics to generate a fresh sample.
              </span>
            </span>
          </span>
          <ChevronDown className="-rotate-90 size-5 text-muted-foreground" />
        </Link>
      )}
    </div>
  );
}
