"use client";

import {
  occasionCards,
  occasionCardTranslations,
  type OccasionCard,
} from "@/components/home/OccasionShowcase.config";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "@/i18n/routing";
import { useGlobalMusicPlayer } from "@/lib/music-player/global-player-store";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";

type DragState = {
  pointerId: number;
  startX: number;
  startTranslate: number;
  moved: boolean;
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const isMobileCarouselLayout = () => {
  return window.matchMedia("(max-width: 639px)").matches;
};

const applyTrackTranslate = (
  track: HTMLElement,
  x: number,
  animate: boolean,
) => {
  track.style.transition = animate ? "" : "none";
  track.style.transform = `translate3d(${x}px, 0, 0)`;
};

export default function OccasionShowcase() {
  const t = useTranslations("Landing.OccasionShowcase");
  const locale = useLocale();
  const localizedCards = useMemo(() => {
    const translations = occasionCardTranslations[locale as "es" | "ja"];

    if (!translations) return occasionCards;

    return occasionCards.map((card) => ({
      ...card,
      ...(translations[card.id] || {}),
    }));
  }, [locale]);
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef(new Map<number, HTMLElement>());
  const dragStateRef = useRef<DragState | null>(null);
  const maxScrollRef = useRef(0);
  const cardOffsetsRef = useRef<number[]>([]);
  const translateRef = useRef(0);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobileApi, setMobileApi] = useState<CarouselApi>();
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);

  const setCardRef = (index: number) => (node: HTMLElement | null) => {
    if (node) {
      cardRefs.current.set(index, node);
    } else {
      cardRefs.current.delete(index);
    }
  };

  const updateTrackMetrics = () => {
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!viewport || !track) return 0;

    const maxScroll = Math.max(0, track.scrollWidth - viewport.clientWidth);

    maxScrollRef.current = maxScroll;
    cardOffsetsRef.current = localizedCards.map((_, index) => {
      return cardRefs.current.get(index)?.offsetLeft ?? index * 320;
    });

    return maxScroll;
  };

  const getTargetTranslate = (index: number) => {
    const maxScroll = updateTrackMetrics();
    const cardOffset =
      cardOffsetsRef.current[index] ?? cardRefs.current.get(index)?.offsetLeft;
    const leadingInset = 32;

    if (cardOffset === undefined) return -Math.min(index * 320, maxScroll);

    return -Math.min(Math.max(0, cardOffset - leadingInset), maxScroll);
  };

  const moveToIndex = (index: number, animate = true) => {
    const track = trackRef.current;

    if (!track) return;

    const nextIndex = clamp(index, 0, localizedCards.length - 1);
    const targetTranslate = getTargetTranslate(nextIndex);

    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
    translateRef.current = targetTranslate;
    applyTrackTranslate(track, targetTranslate, animate);
  };

  const getClosestIndexForTranslate = (translate: number) => {
    const currentOffset = -translate;
    const cardOffsets = cardOffsetsRef.current;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    cardOffsets.forEach((cardOffset, index) => {
      const distance = Math.abs(cardOffset - currentOffset);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  const updateActiveIndexForTranslate = (translate: number) => {
    const nextIndex = getClosestIndexForTranslate(translate);

    if (nextIndex === activeIndexRef.current) return;

    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
  };

  const settleNearestCard = () => {
    moveToIndex(getClosestIndexForTranslate(translateRef.current));
  };

  useEffect(() => {
    if (isMobileCarouselLayout()) return;

    moveToIndex(activeIndexRef.current, false);

    const handleResize = () => moveToIndex(activeIndexRef.current, false);

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
    // The carousel is driven by refs and CSS transitions; resize should bind once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mobileApi) return;

    const syncMobileIndex = () => {
      setMobileActiveIndex(mobileApi.selectedScrollSnap());
    };

    syncMobileIndex();
    mobileApi.on("select", syncMobileIndex);
    mobileApi.on("reInit", syncMobileIndex);

    return () => {
      mobileApi.off("select", syncMobileIndex);
      mobileApi.off("reInit", syncMobileIndex);
    };
  }, [mobileApi]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const track = trackRef.current;
    // Read the live transform so grabbing mid-transition doesn't jump.
    const startTranslate = track
      ? new DOMMatrixReadOnly(getComputedStyle(track).transform).m41
      : translateRef.current;

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startTranslate,
      moved: false,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    const track = trackRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId || !track) return;

    const deltaX = event.clientX - dragState.startX;

    if (Math.abs(deltaX) > 4) {
      dragState.moved = true;
    }

    const maxScroll = updateTrackMetrics();
    const nextTranslate = clamp(
      dragState.startTranslate + deltaX,
      -maxScroll,
      0,
    );

    translateRef.current = nextTranslate;
    applyTrackTranslate(track, nextTranslate, false);
    updateActiveIndexForTranslate(nextTranslate);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) return;

    dragStateRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (dragState.moved) {
      settleNearestCard();
    }
  };

  return (
    <section
      ref={sectionRef}
      id="occasions"
      className="home-section-deep home-warm-ambient-original relative isolate overflow-hidden py-16 md:py-20"
      aria-labelledby="occasion-showcase-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(18,11,9,0.42)_72%,rgba(18,11,9,0.72)_100%)]"
      />
      <div className="home-container relative">
        <div className="mb-9 flex items-end justify-between gap-6 text-left md:mb-11">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
              {t("eyebrow")}
            </p>
            <h2
              id="occasion-showcase-heading"
              className="mt-3 text-balance font-sans text-3xl font-black leading-[1.05] tracking-tight text-white sm:text-4xl md:text-5xl"
            >
              {t("title")}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/65 md:text-lg">
              {t("description")}
            </p>
          </div>
          <Link
            href="/music/personalized-gift"
            className="hidden shrink-0 items-center gap-2 pb-1 text-sm font-semibold text-white/80 transition hover:text-white md:inline-flex"
          >
            See all occasions <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      <Carousel
        setApi={setMobileApi}
        opts={{ align: "center", containScroll: "trimSnaps" }}
        className="sm:hidden"
        aria-label={t("carouselLabel")}
      >
        <CarouselContent className="-ml-3 px-4 pb-6">
          {localizedCards.map((occasion, index) => (
            <CarouselItem key={occasion.id} className="basis-[88%] pl-3">
              <OccasionPhotoCard
                occasion={occasion}
                isActive={mobileActiveIndex === index}
                mobile
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="mx-auto flex items-center justify-center gap-4 px-4 pt-2 sm:hidden">
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          onClick={() => mobileApi?.scrollPrev()}
          disabled={mobileActiveIndex === 0}
          className="rounded-full border-white/15 bg-white/8 text-white shadow-[0_12px_34px_rgba(0,0,0,0.28)] backdrop-blur hover:border-primary/50 hover:bg-white/12 disabled:opacity-40"
          aria-label={t("previous")}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="min-w-24 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-center text-sm font-semibold text-white shadow-[0_12px_35px_rgba(0,0,0,0.26)] backdrop-blur">
          {localizedCards[mobileActiveIndex]?.index ?? "01"} /{" "}
          {localizedCards.length}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          onClick={() => mobileApi?.scrollNext()}
          disabled={mobileActiveIndex === localizedCards.length - 1}
          className="rounded-full border-white/15 bg-white/8 text-white shadow-[0_12px_34px_rgba(0,0,0,0.28)] backdrop-blur hover:border-primary/50 hover:bg-white/12 disabled:opacity-40"
          aria-label={t("next")}
        >
          <ArrowRight className="size-5" />
        </Button>
      </div>

      <div
        ref={viewportRef}
        className="mx-auto hidden max-w-[1420px] overflow-hidden px-4 pb-3 pt-2 sm:block sm:px-6 lg:px-8"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: "pan-y" }}
      >
        <div
          ref={trackRef}
          className="flex cursor-grab gap-4 pb-8 pl-0 pt-3 transition-transform duration-700 [transition-timing-function:cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none active:cursor-grabbing sm:gap-5 sm:pl-0 lg:gap-6"
        >
          {localizedCards.map((occasion, index) => (
            <OccasionPhotoCard
              key={occasion.id}
              refCallback={setCardRef(index)}
              occasion={occasion}
              isActive={activeIndex === index}
            />
          ))}
        </div>
      </div>

      <div className="mx-auto hidden max-w-7xl items-center justify-center gap-4 px-4 pt-4 sm:flex sm:px-6 lg:px-8">
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          onClick={() => moveToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          className="rounded-full border-white/15 bg-white/8 text-white shadow-[0_12px_34px_rgba(0,0,0,0.28)] backdrop-blur hover:border-primary/50 hover:bg-white/12 disabled:opacity-40"
          aria-label={t("previous")}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="min-w-24 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-center text-sm font-semibold text-white shadow-[0_12px_35px_rgba(0,0,0,0.26)] backdrop-blur">
          {localizedCards[activeIndex]?.index ?? "01"} / {localizedCards.length}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          onClick={() => moveToIndex(activeIndex + 1)}
          disabled={activeIndex === localizedCards.length - 1}
          className="rounded-full border-white/15 bg-white/8 text-white shadow-[0_12px_34px_rgba(0,0,0,0.28)] backdrop-blur hover:border-primary/50 hover:bg-white/12 disabled:opacity-40"
          aria-label={t("next")}
        >
          <ArrowRight className="size-5" />
        </Button>
      </div>
    </section>
  );
}

function OccasionPhotoCard({
  occasion,
  isActive,
  refCallback,
  mobile = false,
}: {
  occasion: OccasionCard;
  isActive: boolean;
  refCallback?: (node: HTMLElement | null) => void;
  mobile?: boolean;
}) {
  return (
    <article
      ref={refCallback}
      className={cn(
        "group relative flex shrink-0 select-none flex-col overflow-hidden rounded-[1.35rem] border border-white/[0.06] bg-[#1c1c1b] text-left shadow-[0_18px_45px_rgba(0,0,0,0.34)]",
        mobile
          ? "h-[20rem] w-full"
          : "h-[20rem] w-[min(62vw,14.5rem)] sm:h-[21rem] sm:w-[15rem] lg:h-[22rem] lg:w-[15.75rem]",
        isActive && "z-10",
      )}
      style={
        mobile
          ? undefined
          : ({
              "--occasion-rotate": `${occasion.rotate}deg`,
              transform: `translateY(${occasion.y}px) rotate(${occasion.rotate}deg)`,
            } as CSSProperties)
      }
    >
      <div className="absolute inset-0 bg-[#e6d2bd]">
        <Image
          src={occasion.image}
          alt={`${occasion.title} custom song occasion`}
          fill
          sizes="(min-width: 1024px) 18rem, (min-width: 640px) 18rem, 88vw"
          className="object-cover saturate-[0.92] transition-transform duration-700 ease-out group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0.1)_0%,transparent_38%,rgba(8,8,8,0.82)_100%)]" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between p-4 sm:p-5">
        {occasion.index <= "04" && (
          <span className="w-fit rounded-md bg-white px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.08em] text-[#171716] shadow-sm">
            Most popular
          </span>
        )}
        <div className="mt-auto">
          <Link
            href={occasion.href}
            className="block max-w-[88%] pr-3 text-lg font-black uppercase leading-[1.02] tracking-tight text-white transition hover:text-white/80 sm:text-xl"
            onClick={(event) => event.stopPropagation()}
          >
            {occasion.title}
          </Link>
        </div>
      </div>

      <OccasionCardPlaybackButton occasion={occasion} />
    </article>
  );
}

function OccasionCardPlaybackButton({ occasion }: { occasion: OccasionCard }) {
  const { isPlaying, playTrack, toggle, track } = useGlobalMusicPlayer();
  const sampleTrack = occasion.sampleTrack;
  const isCurrentTrack =
    track?.id === `${occasion.id}-${sampleTrack.id}` &&
    track.audioUrl === sampleTrack.audioUrl;
  const isCurrentTrackPlaying = isCurrentTrack && isPlaying;
  const actionLabel = isCurrentTrackPlaying
    ? "Pause sample song"
    : "Play sample song";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={`${actionLabel}: ${sampleTrack.title}`}
          className={cn(
            "absolute bottom-20 left-4 z-20 flex size-10 items-center justify-center rounded-full border border-white/15 bg-white text-[#111] shadow-[0_12px_24px_rgba(0,0,0,0.24)] transition hover:scale-105 hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#231713]",
            isCurrentTrackPlaying &&
              "bg-primary shadow-[0_14px_30px_rgba(239,68,68,0.3)]",
          )}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();

            if (isCurrentTrack) {
              toggle();
              return;
            }

            playTrack({
              id: `${occasion.id}-${sampleTrack.id}`,
              title: sampleTrack.title,
              artist: occasion.title,
              artworkUrl: occasion.image,
              audioUrl: sampleTrack.audioUrl,
            });
          }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          {isCurrentTrackPlaying ? (
            <Pause className="size-4 fill-current" />
          ) : (
            <Play className="ml-0.5 size-4 fill-current" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{sampleTrack.title}</TooltipContent>
    </Tooltip>
  );
}
