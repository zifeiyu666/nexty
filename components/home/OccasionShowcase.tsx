"use client";

import {
  occasionCards,
  type OccasionCard,
} from "@/components/home/OccasionShowcase.config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";

gsap.registerPlugin(ScrollTrigger);

const copy = {
  eyebrow: "Occasions",
  title: "For Every Precious Moment, A Personal Melody",
  description:
    "Custom-craft a unique song to honor life's special stories and emotions.",
  previous: "Previous occasion",
  next: "Next occasion",
};

type DragState = {
  pointerId: number;
  startX: number;
  startTranslate: number;
  moved: boolean;
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export default function OccasionShowcase() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef(new Map<number, HTMLElement>());
  const dragStateRef = useRef<DragState | null>(null);
  const maxScrollRef = useRef(0);
  const cardOffsetsRef = useRef<number[]>([]);
  const translateRef = useRef(0);
  const activeIndexRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);

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
    cardOffsetsRef.current = occasionCards.map((_, index) => {
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

    const nextIndex = clamp(index, 0, occasionCards.length - 1);
    const targetTranslate = getTargetTranslate(nextIndex);

    gsap.killTweensOf(track);
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);

    if (!animate || reducedMotionRef.current) {
      translateRef.current = targetTranslate;
      gsap.set(track, { x: targetTranslate });
      return;
    }

    gsap.to(track, {
      x: targetTranslate,
      duration: 0.72,
      ease: "power3.out",
      onUpdate: () => {
        translateRef.current = Number(gsap.getProperty(track, "x"));
      },
      onComplete: () => {
        translateRef.current = targetTranslate;
      },
    });
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
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const section = sectionRef.current;

    if (!section || reducedMotionRef.current) return;

    const context = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-occasion-card]");

      gsap.set(cards, {
        opacity: 0,
        rotate: 0,
        scale: 0.96,
        y: (index, target) =>
          Number((target as HTMLElement).dataset.y ?? 0) + 96,
      });

      gsap.to(cards, {
        opacity: 1,
        rotate: (index, target) =>
          Number((target as HTMLElement).dataset.rotate ?? 0),
        scale: 1,
        y: (index, target) => Number((target as HTMLElement).dataset.y ?? 0),
        duration: 1.25,
        ease: "power3.out",
        stagger: 0.075,
        scrollTrigger: {
          trigger: section,
          start: "top 72%",
          once: true,
        },
      });
    }, section);

    return () => context.revert();
  }, []);

  useEffect(() => {
    moveToIndex(activeIndexRef.current, false);

    const handleResize = () => moveToIndex(activeIndexRef.current, false);

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
    // The carousel is driven by refs and GSAP listeners; resize should bind once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;

    if (!section || !track) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) return;

    updateTrackMetrics();

    const setX = gsap.quickSetter(track, "x", "px");
    const scrollTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top 72%",
      end: "bottom 20%",
      invalidateOnRefresh: true,
      onRefresh: (self) => {
        const maxScroll = updateTrackMetrics();
        const nextTranslate = -maxScroll * self.progress;

        translateRef.current = nextTranslate;
        setX(nextTranslate);
        updateActiveIndexForTranslate(nextTranslate);
      },
      onUpdate: (self) => {
        if (dragStateRef.current) return;

        const nextTranslate = -maxScrollRef.current * self.progress;

        translateRef.current = nextTranslate;
        setX(nextTranslate);
        updateActiveIndexForTranslate(nextTranslate);
      },
    });

    return () => scrollTrigger.kill();
    // ScrollTrigger owns the card-track transform; the heading remains outside it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const track = trackRef.current;

    if (track) {
      gsap.killTweensOf(track);
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startTranslate: translateRef.current,
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
    gsap.killTweensOf(track);
    gsap.set(track, { x: nextTranslate });
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

  const handleCardPointerEnter = (event: PointerEvent<HTMLElement>) => {
    if (reducedMotionRef.current) return;

    const card = event.currentTarget;

    gsap.to(card, {
      transformPerspective: 900,
      x: 0,
      rotate: 0,
      rotationX: 0,
      rotationY: 0,
      y: Number(card.dataset.y ?? 0) - 18,
      scale: 1.035,
      boxShadow:
        "0 30px 70px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(255, 126, 165, 0.18)",
      duration: 0.42,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  const handleCardPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reducedMotionRef.current || dragStateRef.current) return;

    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const baseY = Number(card.dataset.y ?? 0) - 18;

    gsap.to(card, {
      transformPerspective: 900,
      x: x * 18,
      y: baseY + y * 14,
      rotationX: y * -6,
      rotationY: x * 7,
      duration: 0.28,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  const handleCardPointerLeave = (event: PointerEvent<HTMLElement>) => {
    if (reducedMotionRef.current) return;

    const card = event.currentTarget;

    gsap.to(card, {
      x: 0,
      rotate: Number(card.dataset.rotate ?? 0),
      rotationX: 0,
      rotationY: 0,
      y: Number(card.dataset.y ?? 0),
      scale: 1,
      boxShadow: "0 18px 45px rgba(0, 0, 0, 0.32)",
      duration: 0.5,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  return (
    <section
      ref={sectionRef}
      id="occasions"
      className="home-section-deep home-warm-ambient relative isolate overflow-hidden py-16 md:py-20"
      aria-labelledby="occasion-showcase-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(18,11,9,0.42)_72%,rgba(18,11,9,0.72)_100%)]"
      />
      <div className="home-container relative">
        <div className="home-section-header">
          <p className="home-eyebrow">{copy.eyebrow}</p>
          <h2
            id="occasion-showcase-heading"
            className="home-title hero-title-warm"
          >
            {copy.title}
          </h2>
          <p className="home-description text-white/70">
            {copy.description}
          </p>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="mx-auto max-w-[1420px] overflow-hidden px-4 pb-3 pt-2 sm:px-6 lg:px-8"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: "pan-y" }}
      >
        <div
          ref={trackRef}
          className="flex cursor-grab gap-4 pb-8 pl-8 pt-3 will-change-transform active:cursor-grabbing sm:gap-5 sm:pl-10 lg:gap-5"
        >
          {occasionCards.map((occasion, index) => (
            <OccasionPhotoCard
              key={occasion.id}
              refCallback={setCardRef(index)}
              occasion={occasion}
              isActive={activeIndex === index}
              onPointerEnter={handleCardPointerEnter}
              onPointerMove={handleCardPointerMove}
              onPointerLeave={handleCardPointerLeave}
            />
          ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-center gap-4 px-4 sm:px-6 lg:px-8">
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          onClick={() => moveToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          className="rounded-full border-white/15 bg-white/8 text-white shadow-[0_12px_34px_rgba(0,0,0,0.28)] backdrop-blur hover:border-primary/50 hover:bg-white/12 disabled:opacity-40"
          aria-label={copy.previous}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="min-w-24 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-center text-sm font-semibold text-white shadow-[0_12px_35px_rgba(0,0,0,0.26)] backdrop-blur">
          {occasionCards[activeIndex]?.index ?? "01"} / {occasionCards.length}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          onClick={() => moveToIndex(activeIndex + 1)}
          disabled={activeIndex === occasionCards.length - 1}
          className="rounded-full border-white/15 bg-white/8 text-white shadow-[0_12px_34px_rgba(0,0,0,0.28)] backdrop-blur hover:border-primary/50 hover:bg-white/12 disabled:opacity-40"
          aria-label={copy.next}
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
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
}: {
  occasion: OccasionCard;
  isActive: boolean;
  refCallback: (node: HTMLElement | null) => void;
  onPointerEnter: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerLeave: (event: PointerEvent<HTMLElement>) => void;
}) {
  return (
    <article
      ref={refCallback}
      data-occasion-card
      data-rotate={occasion.rotate}
      data-y={occasion.y}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn(
        "group relative flex h-[22rem] w-[min(68vw,16rem)] shrink-0 select-none flex-col rounded-2xl border border-[#efe3d3] bg-white p-3 text-left shadow-[0_18px_45px_rgba(0,0,0,0.32)] will-change-transform sm:h-[22.75rem] sm:w-[16.75rem] lg:w-[17.25rem]",
        isActive && "z-10",
      )}
      style={
        {
          "--occasion-rotate": `${occasion.rotate}deg`,
          transform: `translateY(${occasion.y}px) rotate(${occasion.rotate}deg)`,
        } as CSSProperties
      }
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(115deg,rgba(255,255,255,0.55),transparent_36%,rgba(92,55,27,0.06))]" />
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#e6d2bd]">
        <Image
          src={occasion.image}
          alt={`${occasion.title} custom song occasion`}
          fill
          sizes="(min-width: 1024px) 18rem, (min-width: 640px) 18rem, 72vw"
          className="object-cover saturate-[0.96] transition-transform duration-700 ease-out group-hover:scale-[1.07] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/46 to-transparent" />
        {/* <span className="absolute left-3 top-3 rounded-full bg-[#232321]/82 px-3 py-1 text-xs font-bold text-[#ffd8e4] shadow-sm backdrop-blur">
          {occasion.index}
        </span> */}
      </div>

      <div className="relative flex flex-1 flex-col px-1 pb-1 pt-4">
        <p className="text-xs font-bold uppercase text-primary">
          {occasion.title}
        </p>
        <h3 className="mt-2 text-[1.22rem] font-semibold leading-[1.05] text-[#251913]">
          {occasion.tagline}
        </h3>
        <p className="mt-3 min-h-12 text-[12px] leading-5 text-[#655245]">
          {occasion.description}
        </p>
      </div>
    </article>
  );
}
