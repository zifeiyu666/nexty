"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Gift, PencilLine, Volume2, VolumeX } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState, type MouseEvent } from "react";

type ReactionVideo = {
  src: string;
  label: string;
  title: string;
};

const trustIcons = [Gift, CheckCircle2, PencilLine];

type CustomerReactionsProps = {
  sectionId?: string;
};

export default function CustomerReactions({
  sectionId = "customer-reactions",
}: CustomerReactionsProps) {
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

  const playWhenReady = (index: number) => {
    const video = videoRefs.current.get(index);

    if (!video) return;

    if (audibleIndex !== index) {
      video.muted = true;
      video.volume = 0;
    }

    void video.play();
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

  const resetCardMagnet = (card: HTMLElement) => {
    card.style.setProperty("--reaction-magnet-x", "0px");
    card.style.setProperty("--reaction-magnet-y", "0px");
    card.style.setProperty("--reaction-tilt-x", "0deg");
    card.style.setProperty("--reaction-tilt-y", "0deg");
  };

  const handleCardPointerMove = (event: MouseEvent<HTMLButtonElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    card.style.setProperty("--reaction-magnet-x", `${x * 16}px`);
    card.style.setProperty("--reaction-magnet-y", `${y * 12}px`);
    card.style.setProperty("--reaction-tilt-x", `${y * -7}deg`);
    card.style.setProperty("--reaction-tilt-y", `${x * 8}deg`);
  };

  return (
    <section
      id={sectionId}
      className="bg-white py-12 md:py-18 dark:border-[#4a2a32] dark:bg-[#24171b]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center md:mb-12">
          {/* <FeatureBadge
            label={t("badge.label")}
            text={t("badge.text")}
            className="mb-6"
          /> */}
          <h2 className="preset-title">
            <span className="title-gradient">{t("title")}</span>
          </h2>
          <div className="handwritten-subtitle relative mx-auto mt-4 max-w-2xl">
            {t.rich("description", {
              p: (chunks) => <p>{chunks}</p>,
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
            <svg
              className="pointer-events-none absolute -right-12 top-1/2 h-10 w-10 -translate-y-[36%] rotate-[-8deg] text-muted-foreground sm:-right-16 sm:h-12 sm:w-12 md:-right-20 md:h-14 md:w-14"
              viewBox="0 0 72 72"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M19 7C29 24 27 44 14 61"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M23 8C33 27 29 45 16 61"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.45"
              />
              <path
                d="M15 61C23 56 30 51 37 44"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 61C16 51 17 43 20 35"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div
          className={cn(
            "mx-auto grid max-w-6xl grid-cols-1 gap-3 [perspective:1200px] sm:grid-cols-2 sm:gap-4 lg:grid-cols-5 lg:gap-4",
            activeIndex !== null &&
              "[&_.reaction-card:not(.is-active)]:lg:[--reaction-card-scale:0.97]",
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
                }}
                onMouseMove={handleCardPointerMove}
                onMouseLeave={(event) => {
                  resetCardMagnet(event.currentTarget);
                  setActiveIndex(null);
                }}
                onFocus={() => {
                  setActiveIndex(index);
                }}
                onBlur={(event) => {
                  resetCardMagnet(event.currentTarget);
                  setActiveIndex(null);
                }}
                className={cn(
                  "reaction-card group relative aspect-[9/14] min-h-64 cursor-pointer overflow-hidden rounded-2xl border border-white/70 bg-muted text-left shadow-sm outline-none [--reaction-card-scale:1] [--reaction-magnet-x:0px] [--reaction-magnet-y:0px] [--reaction-tilt-x:0deg] [--reaction-tilt-y:0deg] [clip-path:inset(0_round_1rem)] [transform:perspective(900px)_translate3d(var(--reaction-magnet-x),var(--reaction-magnet-y),0)_rotateX(var(--reaction-tilt-x))_rotateY(var(--reaction-tilt-y))_scale(var(--reaction-card-scale))] [transform-style:preserve-3d] transition-[transform,box-shadow,border-color] duration-300 ease-out focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:[transform:none] sm:min-h-72 lg:min-h-0",
                  "hover:z-20 hover:shadow-[0_26px_70px_rgba(15,23,42,0.28)] hover:shadow-primary/25",
                  isActive && "is-active z-20 lg:[--reaction-card-scale:1.035]",
                )}
                aria-pressed={isAudible}
                aria-label={
                  isAudible
                    ? t("muteLabel", { title: video.title })
                    : t("playLabel", { title: video.title })
                }
              >
                <div className="absolute inset-0 overflow-hidden rounded-[inherit] [transform:translateZ(0)]">
                  <video
                    ref={setVideoRef(index)}
                    src={video.src}
                    poster={posterSrc}
                    className="h-full w-full bg-transparent object-cover object-center"
                    preload="metadata"
                    autoPlay
                    muted
                    playsInline
                    loop
                    onLoadedData={() => playWhenReady(index)}
                    onCanPlay={() => playWhenReady(index)}
                  />
                  <div
                    className={cn(
                      "absolute inset-0 bg-background/35 backdrop-blur-[1px] transition-opacity duration-500",
                      isActive
                        ? "opacity-0"
                        : "opacity-0 md:group-hover:opacity-0",
                    )}
                  />
                </div>
                {/* <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-lg">
                  <Gift className="h-3.5 w-3.5" />
                  {video.label}
                </div> */}
                <span className="absolute right-3 top-3 flex h-10 w-10 shrink-0 translate-x-14 cursor-pointer items-center justify-center rounded-full border border-white/45 bg-white/25 text-white opacity-0 shadow-[0_12px_30px_rgba(15,23,42,0.28)] backdrop-blur-md transition-all duration-300 ease-out hover:scale-110 hover:border-white/65 hover:bg-white/35 hover:shadow-[0_16px_36px_rgba(15,23,42,0.38)] active:scale-95 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 dark:border-white/20 dark:bg-black/25 dark:text-white dark:hover:bg-black/35">
                  {isAudible ? (
                    <Volume2 className="h-[18px] w-[18px]" />
                  ) : (
                    <VolumeX className="h-[18px] w-[18px]" />
                  )}
                </span>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-start">
                  <span className="rounded-full border border-white/45 bg-white/25 px-3 py-1 text-xs font-medium text-white shadow-[0_8px_24px_rgba(15,23,42,0.22)] backdrop-blur-md transition-colors duration-300 dark:border-white/20 dark:bg-black/25 dark:text-white">
                    {video.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mx-auto mt-5 grid max-w-2xl grid-cols-1 gap-2 text-sm font-medium text-muted-foreground sm:grid-cols-3 sm:gap-4">
          {trustItems.map((item, index) => {
            const Icon = trustIcons[index] ?? CheckCircle2;

            return (
              <div
                key={item}
                className="flex items-center justify-center gap-2"
              >
                <Icon className="h-4 w-4 text-primary/75" />
                {item}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
