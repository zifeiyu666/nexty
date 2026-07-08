"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Gift,
  PencilLine,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type MouseEvent,
} from "react";

type ReactionVideo = {
  src: string;
  label: string;
  title: string;
};

const trustIcons = [Gift, CheckCircle2, PencilLine];
const reactionCardRotations = ["-4.2deg", "2.8deg", "-2.6deg", "3.8deg", "-3.2deg"];
const reactionCardOffsets = ["6px", "-10px", "12px", "-6px", "8px"];

type CustomerReactionsProps = {
  sectionId?: string;
};

const mobileCarouselQuery = "(max-width: 639px)";

const subscribeToMobileLayout = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};

  const mediaQuery = window.matchMedia(mobileCarouselQuery);

  mediaQuery.addEventListener("change", callback);

  return () => mediaQuery.removeEventListener("change", callback);
};

const getMobileLayoutSnapshot = () => {
  if (typeof window === "undefined") return false;

  return window.matchMedia(mobileCarouselQuery).matches;
};

const getServerMobileLayoutSnapshot = () => false;

export default function CustomerReactions({
  sectionId = "customer-reactions",
}: CustomerReactionsProps) {
  const t = useTranslations("Landing.CustomerReactions");
  const videos = t.raw("videos") as ReactionVideo[];
  const trustItems = t.raw("trustItems") as string[];
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRefs = useRef(new Map<number, HTMLVideoElement>());
  const [shouldLoadVideos, setShouldLoadVideos] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [audibleIndex, setAudibleIndex] = useState<number | null>(null);
  const [mobileApi, setMobileApi] = useState<CarouselApi>();
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const isMobileLayout = useSyncExternalStore(
    subscribeToMobileLayout,
    getMobileLayoutSnapshot,
    getServerMobileLayoutSnapshot,
  );
  const displayActiveIndex = isMobileLayout ? mobileActiveIndex : activeIndex;

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || shouldLoadVideos) return;

    if (!("IntersectionObserver" in window)) {
      const fallbackTimer = globalThis.setTimeout(() => {
        setShouldLoadVideos(true);
      }, 0);

      return () => globalThis.clearTimeout(fallbackTimer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;

        setShouldLoadVideos(true);
        observer.disconnect();
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, [shouldLoadVideos]);

  useEffect(() => {
    if (!shouldLoadVideos) return;

    videoRefs.current.forEach((video, index) => {
      const shouldPlay =
        displayActiveIndex === null ||
        index === displayActiveIndex ||
        Math.abs(index - mobileActiveIndex) <= 1;

      if (audibleIndex !== index) {
        video.muted = true;
        video.volume = 0;
      }

      if (!shouldPlay) {
        video.pause();
        return;
      }

      void video.play().catch(() => {
        // Mobile browsers can still defer autoplay; the poster remains visible.
      });
    });
  }, [audibleIndex, displayActiveIndex, mobileActiveIndex, shouldLoadVideos]);

  useEffect(() => {
    if (!mobileApi) return;

    const syncMobileIndex = () => {
      const nextIndex = mobileApi.selectedScrollSnap();

      setMobileActiveIndex(nextIndex);
      setAudibleIndex((currentAudibleIndex) => {
        if (currentAudibleIndex === null || currentAudibleIndex === nextIndex) {
          return currentAudibleIndex;
        }

        const audibleVideo = videoRefs.current.get(currentAudibleIndex);

        if (audibleVideo) {
          audibleVideo.muted = true;
          audibleVideo.volume = 0;
        }

        return null;
      });
    };

    syncMobileIndex();
    mobileApi.on("select", syncMobileIndex);
    mobileApi.on("reInit", syncMobileIndex);

    return () => {
      mobileApi.off("select", syncMobileIndex);
      mobileApi.off("reInit", syncMobileIndex);
    };
  }, [mobileApi]);

  const setVideoRef = (index: number) => (node: HTMLVideoElement | null) => {
    if (node) {
      const isAudible = audibleIndex === index;

      node.muted = !isAudible;
      node.volume = isAudible ? 0.85 : 0;
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

    void video.play().catch(() => {
      // Keep the poster visible if the browser delays playback.
    });
  };

  const toggleAudio = (index: number) => {
    const nextAudibleIndex = audibleIndex === index ? null : index;

    videoRefs.current.forEach((video, videoIndex) => {
      const isAudible = videoIndex === nextAudibleIndex;

      video.muted = !isAudible;
      video.volume = isAudible ? 0.85 : 0;

      if (isAudible) {
        void video.play().catch(() => {
          // User activation should usually allow this, but keep failures silent.
        });
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

  const renderReactionCard = (video: ReactionVideo, index: number) => {
    const isActive = displayActiveIndex === index;
    const isAudible = audibleIndex === index;
    const videoFileName = video.src.split("/").pop() ?? "";
    const videoName = videoFileName.replace(/\.mp4$/, "");
    const posterSrc = `/images/customer-reactions/${videoName}.jpg`;
    const baseRotate =
      reactionCardRotations[index % reactionCardRotations.length];
    const baseY = reactionCardOffsets[index % reactionCardOffsets.length];
    const shouldAttachVideo =
      shouldLoadVideos &&
      (!isMobileLayout ||
        index === displayActiveIndex ||
        Math.abs(index - mobileActiveIndex) <= 1);

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
        style={
          {
            "--reaction-base-rotate": baseRotate,
            "--reaction-base-y": baseY,
          } as CSSProperties
        }
        className={cn(
          "reaction-card group relative aspect-[9/14] min-h-64 w-full cursor-pointer rounded-2xl bg-[#f8f2ee] text-left shadow-[0_18px_52px_rgba(54,38,27,0.1),inset_0_0_0_1px_rgba(255,255,255,0.48)] outline-none [--reaction-card-rotate:0deg] [--reaction-card-scale:1] [--reaction-card-y:0px] [--reaction-magnet-x:0px] [--reaction-magnet-y:0px] [--reaction-tilt-x:0deg] [--reaction-tilt-y:0deg] [transform:perspective(900px)_translate3d(var(--reaction-magnet-x),calc(var(--reaction-card-y)_+_var(--reaction-magnet-y)),0)_rotate(var(--reaction-card-rotate))_rotateX(var(--reaction-tilt-x))_rotateY(var(--reaction-tilt-y))_scale(var(--reaction-card-scale))] [transform-style:preserve-3d] transition-[transform,box-shadow] duration-300 ease-out focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:[transform:none] sm:min-h-72 lg:min-h-0 lg:[--reaction-card-rotate:var(--reaction-base-rotate)] lg:[--reaction-card-y:var(--reaction-base-y)]",
          "hover:z-20 hover:shadow-[0_38px_110px_rgba(54,38,27,0.36),0_16px_42px_rgba(224,65,50,0.16)] hover:lg:[--reaction-card-rotate:0deg] hover:lg:[--reaction-card-y:-8px] hover:lg:[--reaction-tilt-x:0deg] hover:lg:[--reaction-tilt-y:0deg] focus-visible:lg:[--reaction-card-rotate:0deg] focus-visible:lg:[--reaction-card-y:-8px]",
          isActive &&
            "is-active z-20 lg:[--reaction-card-rotate:0deg] lg:[--reaction-card-scale:1.12] lg:[--reaction-card-y:-12px]",
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
            src={shouldAttachVideo ? video.src : undefined}
            poster={posterSrc}
            className="h-full w-full bg-transparent object-cover object-center"
            preload={shouldAttachVideo ? "metadata" : "none"}
            autoPlay
            muted={!isAudible}
            playsInline
            loop
            onLoadedData={() => playWhenReady(index)}
            onCanPlay={() => playWhenReady(index)}
          />
          <div
            className={cn(
              "absolute inset-0 bg-background/35 backdrop-blur-[1px] transition-opacity duration-500",
              isActive ? "opacity-0" : "opacity-0 md:group-hover:opacity-0",
            )}
          />
        </div>
        <span className="absolute right-3 top-3 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/45 bg-white/25 text-white opacity-100 shadow-[0_12px_30px_rgba(15,23,42,0.28)] backdrop-blur-md transition-all duration-300 ease-out hover:scale-110 hover:border-white/65 hover:bg-white/35 hover:shadow-[0_16px_36px_rgba(15,23,42,0.38)] active:scale-95 sm:translate-x-14 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100 sm:group-focus-visible:translate-x-0 sm:group-focus-visible:opacity-100 dark:border-white/20 dark:bg-black/25 dark:text-white dark:hover:bg-black/35">
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
  };

  return (
    <section
      ref={sectionRef}
      id={sectionId}
      className="home-section"
    >
      <div className="home-container">
        <div className="home-section-header">
          {/* <FeatureBadge
            label={t("badge.label")}
            text={t("badge.text")}
            className="mb-6"
          /> */}
          <p className="home-eyebrow">{t("badge.label")}</p>
          <h2 className="home-title">{t("title")}</h2>
          <div className="home-description [&_p]:m-0 [&_strong]:font-semibold [&_strong]:text-[#2b1710]">
            {t.rich("description", {
              p: (chunks) => <p>{chunks}</p>,
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </div>
        </div>

        {isMobileLayout ? (
          <>
            <Carousel
              setApi={setMobileApi}
              opts={{ align: "center", containScroll: "trimSnaps" }}
              aria-label="Customer reactions carousel"
            >
              <CarouselContent className="-ml-3 px-4 pb-4">
                {videos.map((video, index) => (
                  <CarouselItem
                    key={`${video.src}-${index}`}
                    className="basis-[88%] pl-3"
                  >
                    {renderReactionCard(video, index)}
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            <div className="mx-auto flex items-center justify-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                onClick={() => mobileApi?.scrollPrev()}
                disabled={mobileActiveIndex === 0}
                className="rounded-full border-[#eadbd3] bg-white/80 text-[#2b1710] shadow-[0_12px_34px_rgba(54,38,27,0.12)] backdrop-blur hover:border-primary/40 hover:bg-white disabled:opacity-40"
                aria-label="Previous reaction"
              >
                <ArrowLeft className="size-5" />
              </Button>
              <div className="min-w-20 rounded-full border border-[#eadbd3] bg-white/80 px-4 py-2 text-center text-sm font-semibold text-[#2b1710] shadow-[0_12px_30px_rgba(54,38,27,0.1)] backdrop-blur">
                {mobileActiveIndex + 1} / {videos.length}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                onClick={() => mobileApi?.scrollNext()}
                disabled={mobileActiveIndex === videos.length - 1}
                className="rounded-full border-[#eadbd3] bg-white/80 text-[#2b1710] shadow-[0_12px_34px_rgba(54,38,27,0.12)] backdrop-blur hover:border-primary/40 hover:bg-white disabled:opacity-40"
                aria-label="Next reaction"
              >
                <ArrowRight className="size-5" />
              </Button>
            </div>
          </>
        ) : (
          <div
            className={cn(
              "mx-auto grid max-w-5xl grid-cols-1 gap-4 [perspective:1200px] sm:grid-cols-2 sm:gap-6 lg:grid-cols-5 lg:gap-7",
              activeIndex !== null &&
                "[&_.reaction-card:not(.is-active)]:lg:[--reaction-card-scale:0.97]",
            )}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {videos.map((video, index) => renderReactionCard(video, index))}
          </div>
        )}

        <div className="mx-auto mt-5 flex max-w-full items-center justify-center gap-3 overflow-hidden text-[0.8rem] font-medium leading-none text-[#8a7a72] sm:mt-6 sm:grid sm:max-w-2xl sm:grid-cols-3 sm:gap-4 sm:text-sm sm:leading-normal sm:text-[#6f625c]">
          {trustItems.map((item, index) => {
            const Icon = trustIcons[index] ?? CheckCircle2;

            return (
              <div
                key={item}
                className="flex min-w-0 items-center justify-center whitespace-nowrap sm:gap-2"
              >
                <Icon className="hidden h-4 w-4 text-primary/75 sm:block" />
                <span className="truncate">{item}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
