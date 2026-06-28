"use client";

import ChooseButton from "@/components/song/ChooseButton";
import {
  SongResultView,
  type SongResultMetadataPill,
} from "@/components/song/song-result/SongResultView";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Cake,
  Clock3,
  Gift,
  Heart,
  Languages,
  Loader2,
  LockKeyhole,
  Mic2,
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
  const [unlockingVersion, setUnlockingVersion] = useState<string | null>(null);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [selectedVersionForPaywall, setSelectedVersionForPaywall] =
    useState<"A" | "B">("A");
  const [
    selectedProviderVersionForPaywall,
    setSelectedProviderVersionForPaywall,
  ] = useState("");
  const router = useRouter();
  const displayDuration =
    data.previewLimitSeconds || data.versions[0]?.duration || 60;
  const hasPermanentAccess = data.accessExpiresAt === null;
  const occasionLabel = labelize(data.occasion || "sample");
  const recipientLabel = data.recipientNames.join(" and ") || "someone special";
  const displayTitle = data.title || "Your Custom Song";
  const coverImageUrl = data.versions[0]?.imageUrl;
  const metadataPills: SongResultMetadataPill[] = [
    { icon: <Heart className="size-4" />, label: `For ${recipientLabel}` },
    { icon: <Cake className="size-4" />, label: occasionLabel },
    { icon: <Gift className="size-4" />, label: data.genre },
    { icon: <Mic2 className="size-4" />, label: data.vocalGender },
    { icon: <Languages className="size-4" />, label: data.language },
  ];

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

  const statusBanner = (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
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
        <div className="rounded-2xl bg-card p-4 text-sm text-muted-foreground shadow-[0_14px_44px_rgba(255,120,150,0.09)]">
          <p className="font-black text-foreground">This sample has expired.</p>
          <p className="mt-1 leading-6">
            You can no longer play this song, but the form data is still
            available for recreating a fresh sample.
          </p>
        </div>
      )}
    </div>
  );

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

      <SongResultView
        activeVersion={activeVersion}
        coverImageUrl={coverImageUrl}
        displayDuration={displayDuration}
        heroEyebrow="Ta-da! Congratulation!"
        isPlaying={isPlaying}
        lyrics={data.lyrics}
        lyricsOccasionLabel={recipientLabel}
        metadataPills={metadataPills}
        previewTime={previewTime}
        statusBanner={statusBanner}
        title={displayTitle}
        versions={["A", "B"].map((version, index) => {
          const songVersion = data.versions[index];

          return {
            displayId: version,
            title: songVersion?.title || displayTitle,
            audioUrl: songVersion?.audioUrl || "",
            disabled: Boolean(data.isExpired || !songVersion?.audioUrl),
            providerVersionId: songVersion?.id || version,
          };
        })}
        versionsHeading={`Two takes. Pick the one that feels like ${recipientLabel}`}
        onPlaybackToggle={togglePlayback}
        renderVersionAction={({ index, version }) => {
          const providerVersionId =
            version.providerVersionId || version.displayId;
          const finalizedVersion = providerVersionId
            ? data.finalizedVersions?.[providerVersionId]
            : undefined;

          return (
            <ChooseButton
              className={cn(
                "h-10 w-full cursor-pointer rounded-full text-xs font-black text-primary-foreground shadow-sm transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50",
                index === 0
                  ? "border-foreground bg-foreground hover:border-foreground/90 hover:bg-foreground/90 hover:shadow-[0_14px_28px_rgba(45,31,24,0.22)]"
                  : "border-primary bg-primary hover:border-primary/90 hover:bg-primary/90 hover:shadow-[0_14px_28px_rgba(239,62,53,0.28)]",
              )}
              onChoose={async () => {
                const v = version.displayId === "A" ? "A" : "B";
                const songVersion = data.versions[index];
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
                  router.push(
                    result.data?.songUrl || `/songs/${result.data?.songId}`,
                  );
                } finally {
                  setUnlockingVersion(null);
                }
              }}
            >
              {unlockingVersion === version.displayId && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {finalizedVersion
                ? "Go to this song"
                : unlockingVersion === version.displayId
                  ? "Saving..."
                  : "Choose this one"}
            </ChooseButton>
          );
        }}
        bottomCta={
          regenerateHref ? (
            <Link
              className="group relative z-10 mx-auto mt-6 flex w-full max-w-5xl items-center justify-between gap-4 rounded-2xl bg-card px-5 py-4 text-left shadow-[0_14px_44px_rgba(255,120,150,0.09)] transition-[background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary/5 hover:shadow-[0_20px_56px_rgba(255,104,142,0.16)]"
              href={regenerateHref}
            >
              <span className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <RefreshCw className="size-4" />
                </span>
                <span>
                  <span className="block font-[cursive] text-base text-accent-foreground">
                    not quite right?
                  </span>
                  <span className="block text-base font-black text-foreground">
                    Change your inputs & recreate
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    Use the original occasion, story, genre and lyrics to
                    generate a fresh sample.
                  </span>
                </span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-black text-primary-foreground shadow-[0_12px_28px_rgba(239,62,53,0.24)] transition-[transform,box-shadow,background-color] duration-200 ease-out group-hover:rotate-3 group-hover:scale-105">
                <RefreshCw className="size-4" />
                Recreate
              </span>
            </Link>
          ) : null
        }
      />

      {isPaywallOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 px-4 py-8 backdrop-blur-xl">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-2xl shadow-foreground/20">
            <div className="flex items-center justify-between gap-4 border-b border-border p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-black text-primary-foreground">
                  {selectedVersionForPaywall}
                </div>
                <div>
                  <h2 className="text-lg font-black leading-tight">
                    {data.title}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Version · {selectedVersionForPaywall} · for {recipientLabel}
                  </p>
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
              <p className="font-[cursive] text-base text-primary">
                one more step...
              </p>
              <h3 className="mt-1.5 text-xl font-black text-foreground">
                Choose how to unlock
              </h3>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                Pick a one-off unlock, a bundle, or a subscription plan on the
                next screen.
              </p>

              <div className="mx-auto mt-5 flex max-w-lg gap-3 rounded-xl border border-border bg-muted p-3.5 text-left text-sm leading-6 text-muted-foreground">
                <Gift className="mt-1 size-4 shrink-0 text-primary" />
                <p>
                  You don&apos;t have a subscription or song credits yet.
                  We&apos;ll take you to secure checkout to pick the right
                  option for you.
                </p>
              </div>

              <p className="mt-5 inline-flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-primary" />
                Secure checkout
              </p>
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
                {isCheckoutLoading
                  ? "Opening checkout..."
                  : "Continue to checkout"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
