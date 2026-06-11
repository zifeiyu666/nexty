"use client";

import FeatureBadge from "@/components/shared/FeatureBadge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Gift, PencilLine, Volume2, VolumeX } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

type ReactionVideo = {
  src: string;
  label: string;
  title: string;
};

const trustIcons = [Gift, CheckCircle2, PencilLine];

export default function CustomerReactions() {
  const t = useTranslations("Landing.CustomerReactions");
  const videos = t.raw("videos") as ReactionVideo[];
  const trustItems = t.raw("trustItems") as string[];
  const videoRefs = useRef(new Map<number, HTMLVideoElement>());
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [audibleIndex, setAudibleIndex] = useState<number | null>(null);

  const setVideoRef = (index: number) => (node: HTMLVideoElement | null) => {
    if (node) {
      videoRefs.current.set(index, node);
    } else {
      videoRefs.current.delete(index);
    }
  };

  const playMuted = (index: number) => {
    const video = videoRefs.current.get(index);

    if (!video) return;

    if (audibleIndex !== index) {
      video.muted = true;
    }

    void video.play();
  };

  const pauseMuted = (index: number) => {
    if (audibleIndex === index) return;

    const video = videoRefs.current.get(index);

    if (!video) return;

    video.pause();
    video.currentTime = 0;
  };

  const toggleAudio = (index: number) => {
    const nextAudibleIndex = audibleIndex === index ? null : index;

    videoRefs.current.forEach((video, videoIndex) => {
      const isAudible = videoIndex === nextAudibleIndex;

      video.muted = !isAudible;
      video.volume = isAudible ? 0.85 : 0;

      if (isAudible) {
        void video.play();
      }
    });

    setAudibleIndex(nextAudibleIndex);
    setActiveIndex(index);
  };

  return (
    <section id="customer-reactions" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center md:mb-12">
          <FeatureBadge
            label={t("badge.label")}
            text={t("badge.text")}
            className="mb-6"
          />
          <h2 className="mx-auto max-w-full whitespace-nowrap text-xl font-semibold leading-tight sm:text-2xl md:text-4xl">
            <span className="title-gradient">{t("title")}</span>
          </h2>
          <div className="mx-auto mt-4 max-w-2xl font-['Bradley_Hand','Comic_Sans_MS',cursive] text-base leading-7 text-muted-foreground md:text-lg [&_p]:m-0 [&_strong]:font-normal [&_strong]:text-inherit">
            {t.rich("description", {
              p: (chunks) => <p>{chunks}</p>,
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </div>
        </div>

        <div
          className={cn(
            "grid grid-cols-1 gap-4 transition-all duration-500 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5",
            activeIndex !== null &&
              "[&_.reaction-card:not(.is-active)]:lg:scale-[0.96] [&_.reaction-card:not(.is-active)]:lg:opacity-75"
          )}
          onMouseLeave={() => setActiveIndex(null)}
        >
          {videos.map((video, index) => {
            const isActive = activeIndex === index;
            const isAudible = audibleIndex === index;
            const posterSrc = video.src.replace(/\.mp4$/, ".jpg");

            return (
              <button
                key={`${video.src}-${index}`}
                type="button"
                onClick={() => toggleAudio(index)}
                onMouseEnter={() => {
                  setActiveIndex(index);
                  playMuted(index);
                }}
                onMouseLeave={() => pauseMuted(index)}
                onFocus={() => {
                  setActiveIndex(index);
                  playMuted(index);
                }}
                onBlur={() => pauseMuted(index)}
                className={cn(
                  "reaction-card group relative aspect-[9/13] min-h-80 overflow-hidden rounded-2xl border border-white/70 bg-muted text-left shadow-sm outline-none transition-all duration-500 ease-out focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:min-h-0",
                  "hover:z-20 hover:shadow-2xl hover:shadow-primary/20",
                  isActive && "is-active z-20 lg:scale-[1.06]"
                )}
                aria-pressed={isAudible}
                aria-label={
                  isAudible
                    ? t("muteLabel", { title: video.title })
                    : t("playLabel", { title: video.title })
                }
              >
                <video
                  ref={setVideoRef(index)}
                  src={video.src}
                  poster={posterSrc}
                  className="h-full w-full object-cover"
                  preload="metadata"
                  muted
                  playsInline
                  loop
                />
                <div
                  className={cn(
                    "absolute inset-0 bg-background/35 backdrop-blur-[1px] transition-opacity duration-500",
                    isActive ? "opacity-0" : "opacity-0 md:group-hover:opacity-0",
                    activeIndex !== null && !isActive && "md:opacity-70"
                  )}
                />
                <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-lg">
                  <Gift className="h-3.5 w-3.5" />
                  {video.label}
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur">
                    {video.title}
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background/85 text-foreground shadow-sm backdrop-blur">
                    {isAudible ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4" />
                    )}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-3 text-sm font-semibold text-foreground sm:grid-cols-3">
          {trustItems.map((item, index) => {
            const Icon = trustIcons[index] ?? CheckCircle2;

            return (
              <div
                key={item}
                className="flex items-center justify-center gap-2 rounded-full border border-border bg-background/70 px-4 py-3 shadow-sm backdrop-blur"
              >
                <Icon className="h-4 w-4 text-primary" />
                {item}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
