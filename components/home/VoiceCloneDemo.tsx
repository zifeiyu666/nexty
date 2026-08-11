"use client";

import { Pause, Play, Sparkles, Waves } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { r2PublicUrl } from "@/lib/cloudflare/public-url";

const SOURCE_AUDIO_URL =
  r2PublicUrl("/voices/source/4c36d75a-d3d6-416a-b8e3-685ee746830e/f88eed99-a7fe-453a-a653-3f81ff82807d.wav");
const GENERATED_SONG_URL =
  "https://s3.us-east-1.amazonaws.com/remotionlambda-useast1-7lw6m83kvk/renders/kp4dawr87v/songs/generated/060a6db2-89e6-49b1-91ca-4e236c374ace/fe246607-fb10-45de-9f25-5f8fb356b969/with-intro.mp3";
const GENERATED_SONG_START_SECONDS = 4;

type TrackId = "source" | "song";

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

export default function VoiceCloneDemo() {
  const t = useTranslations("Landing.VoicePersonalization");
  const sourceAudioRef = useRef<HTMLAudioElement>(null);
  const songAudioRef = useRef<HTMLAudioElement>(null);
  const [activeTrack, setActiveTrack] = useState<TrackId | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<Record<TrackId, number>>({
    source: 0,
    song: 0,
  });

  const audioFor = (track: TrackId) =>
    track === "source" ? sourceAudioRef.current : songAudioRef.current;

  function stopTrack(track: TrackId) {
    const audio = audioFor(track);
    if (!audio) return;

    audio.pause();
    audio.currentTime = track === "song" ? GENERATED_SONG_START_SECONDS : 0;
  }

  async function toggleTrack(track: TrackId) {
    const audio = audioFor(track);
    if (!audio) return;

    if (activeTrack === track && !audio.paused) {
      audio.pause();
      return;
    }

    const otherTrack: TrackId = track === "source" ? "song" : "source";
    stopTrack(otherTrack);

    if (audio.ended) {
      audio.currentTime = track === "song" ? GENERATED_SONG_START_SECONDS : 0;
    } else if (track === "song" && audio.currentTime < GENERATED_SONG_START_SECONDS) {
      audio.currentTime = GENERATED_SONG_START_SECONDS;
    }

    try {
      await audio.play();
      setActiveTrack(track);
    } catch {
      setActiveTrack(null);
    }
  }

  function handleSongLoaded(audio: HTMLAudioElement) {
    if (audio.currentTime < GENERATED_SONG_START_SECONDS) {
      audio.currentTime = GENERATED_SONG_START_SECONDS;
    }
  }

  function handleTimeUpdate(track: TrackId, audio: HTMLAudioElement) {
    const playbackStart = track === "song" ? GENERATED_SONG_START_SECONDS : 0;
    if (track === "song" && audio.currentTime < playbackStart) {
      audio.currentTime = playbackStart;
      return;
    }

    setElapsedSeconds((current) => ({
      ...current,
      [track]: Math.max(0, audio.currentTime - playbackStart),
    }));
  }

  const tracks: Array<{
    icon: typeof Waves;
    id: TrackId;
    subtitle: string;
    title: string;
  }> = [
    {
      id: "source",
      icon: Waves,
      title: t("items.voiceClone.demo.source.title"),
      subtitle: t("items.voiceClone.demo.source.subtitle"),
    },
    {
      id: "song",
      icon: Sparkles,
      title: t("items.voiceClone.demo.song.title"),
      subtitle: t("items.voiceClone.demo.song.subtitle"),
    },
  ];

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-[#eadbd3] bg-[#fffaf7] shadow-[0_12px_28px_rgba(74,45,32,0.08)]">
      <audio
        ref={sourceAudioRef}
        preload="metadata"
        src={SOURCE_AUDIO_URL}
        onEnded={() => setActiveTrack(null)}
        onPause={() => setActiveTrack((current) => (current === "source" ? null : current))}
        onTimeUpdate={(event) => handleTimeUpdate("source", event.currentTarget)}
      />
      <audio
        ref={songAudioRef}
        preload="metadata"
        src={GENERATED_SONG_URL}
        onLoadedMetadata={(event) => handleSongLoaded(event.currentTarget)}
        onEnded={() => setActiveTrack(null)}
        onPause={() => setActiveTrack((current) => (current === "song" ? null : current))}
        onPlay={(event) => {
          if (event.currentTarget.currentTime < GENERATED_SONG_START_SECONDS) {
            event.currentTarget.currentTime = GENERATED_SONG_START_SECONDS;
          }
        }}
        onTimeUpdate={(event) => handleTimeUpdate("song", event.currentTarget)}
      />

      <div className="border-b border-[#eadbd3] bg-[#2a1711] px-4 py-3 text-white sm:px-5">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ffad9d]">
          {t("items.voiceClone.demo.eyebrow")}
        </p>
        <p className="mt-1 text-sm font-bold">
          {t("items.voiceClone.demo.title")}
        </p>
      </div>

      <div className="divide-y divide-[#eadbd3]">
        {tracks.map(({ icon: Icon, id, subtitle, title }) => {
          const isPlaying = activeTrack === id;

          return (
            <div key={id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#3d241b]">{title}</p>
                <p className="mt-0.5 text-xs leading-5 text-[#80685e]">{subtitle}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="hidden text-xs font-semibold tabular-nums text-[#80685e] sm:inline">
                  {formatTime(elapsedSeconds[id])}
                </span>
                <button
                  type="button"
                  aria-label={
                    isPlaying
                      ? t("items.voiceClone.demo.pause", { title })
                      : t("items.voiceClone.demo.play", { title })
                  }
                  title={
                    isPlaying
                      ? t("items.voiceClone.demo.pause", { title })
                      : t("items.voiceClone.demo.play", { title })
                  }
                  onClick={() => void toggleTrack(id)}
                  className="inline-flex size-10 items-center justify-center rounded-full bg-primary text-white shadow-[0_7px_16px_rgba(224,65,50,0.25)] transition hover:scale-105 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {isPlaying ? (
                    <Pause className="size-4 fill-current" aria-hidden="true" />
                  ) : (
                    <Play className="ml-0.5 size-4 fill-current" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* <p className="flex items-center gap-2 border-t border-[#eadbd3] px-4 py-2.5 text-xs text-[#80685e] sm:px-5">
        <Volume2 className="size-3.5 text-primary" aria-hidden="true" />
        {t("items.voiceClone.demo.song.startsAt")}
      </p> */}
    </div>
  );
}
