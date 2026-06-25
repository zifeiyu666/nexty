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
  Loader2,
  LockKeyhole,
  Pause,
  Play,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

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
  accessExpiresAt?: number | null;
  isExpired?: boolean;
  finalizedVersions?: Record<string, { songId: string; songUrl: string }>;
};

function labelize(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function InfoPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#eadfd8] bg-white px-3 py-1.5 text-[12px] font-bold text-[#5a4a62] shadow-sm">
      <span className="text-[#c92d63]">{icon}</span>
      {label}
    </span>
  );
}

export function SampleSongPlayer({
  data,
  regenerateHref,
}: {
  data: SampleSongPlayerData;
  regenerateHref?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeVersion, setActiveVersion] = useState("A");
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const [showLyrics, setShowLyrics] = useState(true);
  const [unlockingVersion, setUnlockingVersion] = useState<string | null>(null);
  const displayDuration =
    data.previewLimitSeconds || data.versions[0]?.duration || 60;
  const hasPermanentAccess = data.accessExpiresAt === null;
  const occasionLabel = labelize(data.occasion || "sample");
  const recipientLabel = data.recipientNames.join(" and ") || "someone special";
  const router = useRouter();
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [selectedVersionForPaywall, setSelectedVersionForPaywall] = useState<"A" | "B">("A");
  const [selectedProviderVersionForPaywall, setSelectedProviderVersionForPaywall] = useState("");

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
    <div className="mx-auto w-full py-4 pb-12">
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

      <div className="mb-5 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-emerald-800">
          <ShieldCheck className="size-4" />
          {data.isExpired ? "Expired" : "Ready · only you can see this preview"}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-amber-700">
          <Clock3 className="size-4" />
          {hasPermanentAccess
            ? "Saved to your account"
            : data.accessExpiresAt
            ? `Preview until ${new Date(data.accessExpiresAt).toLocaleDateString()}`
            : "Preview expires in 3 days"}
        </span>
      </div>

      {data.isExpired && (
        <div className="mb-5 rounded-2xl border border-[#eadfd8] bg-white/75 p-4 text-sm text-muted-foreground shadow-sm">
          <p className="font-black text-foreground">This sample has expired.</p>
          <p className="mt-1 leading-6">
            You can no longer play this song, but the form data is still
            available for recreating a fresh sample.
          </p>
        </div>
      )}

      <section className="grid gap-8 lg:grid-cols-[260px_1fr] lg:items-center">
        <div className="mx-auto size-56 overflow-hidden rounded-full bg-gradient-to-br from-[#4b135d] via-[#b43b85] to-[#df2f67] shadow-2xl shadow-[#c92d63]/20 opacity-95 sm:size-64">
          <div className="relative h-full w-full">
            <div className="absolute -left-10 bottom-0 size-32 rounded-full bg-white/10 sm:size-40" />
            <div className="absolute -right-8 -top-8 size-36 rounded-full bg-white/20 sm:size-44" />
            <p className="absolute inset-x-8 top-1/2 -translate-y-1/2 text-center font-[cursive] text-2xl text-white/90">
              for {recipientLabel}
            </p>
            <div className="absolute bottom-8 left-1/2 flex h-8 -translate-x-1/2 items-end gap-1 opacity-50">
              {Array.from({ length: 13 }).map((_, index) => (
                <span
                  key={index}
                  className="w-1 rounded-full bg-white"
                  style={{ height: `${8 + ((index * 7) % 24)}px` }}
                />
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="mb-1 font-[cursive] text-2xl text-[#ed653a]">
            ta-da!
          </p>
          <h1 className="max-w-4xl font-serif text-4xl font-black leading-[0.95] text-[#351044] md:text-5xl">
            {data.title || "Your Custom Song"}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <InfoPill icon={<Heart className="size-4" />} label={`For ${recipientLabel}`} />
            <InfoPill icon={<Cake className="size-4" />} label={occasionLabel} />
            <InfoPill icon={<Gift className="size-4" />} label={data.genre} />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-3xl text-center">
        <p className="font-[cursive] text-xl text-[#ed653a]">here they are...</p>
        <h2 className="mt-1 font-serif text-3xl font-black leading-tight text-[#351044] md:text-4xl">
          Two takes. Pick the one that feels like {recipientLabel}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#74677b]">
          Same lyrics, two different recordings. Play both previews below and choose the one that fits the moment.
        </p>
      </section>

      <div className="mx-auto mt-7 grid w-full gap-5 md:grid-cols-2">
        {["A", "B"].map((version, index) => {
          const songVersion = data.versions[index];
          const finalizedVersion = songVersion?.id
            ? data.finalizedVersions?.[songVersion.id]
            : undefined;
          const isActiveVersion = activeVersion === version;
          const isThisPlaying = isActiveVersion && isPlaying;
          const isVersionB = version === "B";

          return (
            <div
              key={version}
              className={cn(
                "rounded-3xl border border-[#eadfd8] bg-white p-5 shadow-sm",
                data.isExpired && "opacity-55"
              )}
            >
              <div className="mb-4 flex items-start gap-3">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white",
                    isVersionB ? "bg-[#cf2f63]" : "bg-[#3f0f50]"
                  )}
                >
                  {version}
                </span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#8f8494]">
                    Version {version}
                  </p>
                  <p className="font-serif text-base font-black leading-tight text-[#351044]">
                    {songVersion?.title || data.title || "Sample"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-[#f5f1ec] p-4">
                <button
                  aria-label={`Play version ${version}`}
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-full text-white transition disabled:cursor-not-allowed disabled:opacity-50",
                    isVersionB ? "bg-[#cf2f63] hover:bg-[#b92755]" : "bg-[#3f0f50] hover:bg-[#2f0a3e]"
                  )}
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
                <div className="flex min-h-12 flex-1 items-center justify-center gap-1 overflow-hidden">
                  {Array.from({ length: 30 }).map((_, barIndex) => (
                    <span
                      key={barIndex}
                      className="w-1 shrink-0 rounded-full bg-[#e5dad3]"
                      style={{ height: `${12 + ((barIndex * 11 + index * 5) % 34)}px` }}
                    />
                  ))}
                </div>
                <span className="shrink-0 text-[11px] font-bold text-[#74677b]">
                  {isActiveVersion ? previewTime : "0"}s / {Math.ceil(displayDuration)}s
                </span>
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#f8f5f2] px-3 py-1.5 text-xs font-bold text-[#74677b]">
                <Gift className="size-3.5 text-[#ed653a]" />
                {data.genre}
              </div>
              <div className="mt-4 border-t border-[#eee5df] pt-4">
                <ChooseButton
                  className={cn(
                    "h-11 w-full rounded-full px-3 text-sm font-black text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm",
                    isVersionB
                      ? "bg-[#cf2f63] shadow-[#cf2f63]/20 hover:bg-[#b92755] hover:shadow-[#cf2f63]/35"
                      : "bg-[#3f0f50] shadow-[#3f0f50]/20 hover:bg-[#2f0a3e] hover:shadow-[#3f0f50]/35"
                  )}
                  onChoose={async () => {
                    const v = version === "A" ? "A" : "B";
                    const providerVersionId = songVersion?.id || v;

                    if (finalizedVersion) {
                      router.push(finalizedVersion.songUrl);
                      return;
                    }

                    if (!songVersion?.audioUrl) {
                      toast.error("This song version is not ready yet.");
                      return;
                    }

                    setUnlockingVersion(v);
                    try {
                      const response = await fetch("/api/songs/finalize", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          songId: data.songId,
                          versionId: providerVersionId,
                        }),
                      });
                      const result = await response.json();
                      if (!response.ok || !result.success) {
                        if (result.error === "Insufficient song balance.") {
                          setSelectedVersionForPaywall(v as "A" | "B");
                          setSelectedProviderVersionForPaywall(providerVersionId);
                          setIsPaywallOpen(true);
                        } else {
                          toast.error(result.error || "Unable to save this song.");
                        }
                        return;
                      }
                      router.push(result.data?.songUrl || `/songs/${result.data?.songId}`);
                    } finally {
                      setUnlockingVersion(null);
                    }
                  }}
                >
                  {finalizedVersion
                    ? "Go to this song"
                    : unlockingVersion === version
                    ? "Saving..."
                    : "Choose this one"}
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
              <button
                aria-label="Close paywall"
                className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground disabled:pointer-events-none disabled:opacity-50"
                disabled={isCheckoutLoading}
                type="button"
                onClick={() => setIsPaywallOpen(false)}
              >
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
              <Button
                className="h-10 rounded-full bg-muted px-6 text-sm font-bold text-muted-foreground"
                disabled={isCheckoutLoading}
                type="button"
                variant="ghost"
                onClick={() => setIsPaywallOpen(false)}
              >
                Not yet
              </Button>
              <Button
                className="h-10 flex-1 rounded-full bg-primary text-sm font-bold text-primary-foreground"
                aria-busy={isCheckoutLoading}
                disabled={isCheckoutLoading}
                type="button"
                onClick={() => {
                  if (isCheckoutLoading) return;

                  setIsCheckoutLoading(true);
                  const params = new URLSearchParams({
                    type: "unlock_song",
                    songId: data.songId,
                    versionId:
                      selectedProviderVersionForPaywall ||
                      selectedVersionForPaywall,
                    returnTo: `/samples/${data.songId}`,
                  });
                  router.push(`/pricing?${params.toString()}`);
                }}
              >
                {isCheckoutLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <LockKeyhole className="size-4" />
                )}
                {isCheckoutLoading ? "Opening checkout..." : "Continue to checkout"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto mt-7 w-full overflow-hidden rounded-3xl border border-[#a855f7] bg-white/85 shadow-sm">
        <button
          className="flex w-full items-center justify-between border-b border-[#eadfd8] p-5 text-left"
          type="button"
          onClick={() => setShowLyrics((current) => !current)}
        >
          <span className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-[#ed653a] text-white">
              <Edit3 className="size-4" />
            </span>
            <span>
              <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-[#8f8494]">
                Written for {recipientLabel}
              </span>
              <span className="font-serif text-xl font-black text-[#351044]">The lyrics</span>
            </span>
          </span>
          <ChevronDown
            className={cn("size-5 rounded-full bg-[#f5f1ec] p-1 text-[#74677b] transition", showLyrics && "rotate-180")}
          />
        </button>
        {showLyrics && (
          <div className="max-h-[520px] overflow-y-auto p-6 text-base leading-8 text-[#351044] sm:p-8">
            <pre className="whitespace-pre-wrap font-sans">{data.lyrics}</pre>
          </div>
        )}
      </div>

      {regenerateHref && (
        <Link
          className="mx-auto mt-7 flex w-full items-center justify-between rounded-3xl border border-dashed border-[#eadfd8] bg-white/70 p-5 text-left transition hover:border-[#a855f7]/60 hover:bg-white"
          href={regenerateHref}
        >
          <span className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-[#f3e8ff] text-[#7e22ce]">
              <RefreshCw className="size-4" />
            </span>
            <span>
              <span className="block font-[cursive] text-base text-[#ed653a]">
                not quite right?
              </span>
              <span className="block font-serif text-xl font-black text-[#351044]">
                Change your inputs & recreate
              </span>
              <span className="block text-sm text-[#74677b]">
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
