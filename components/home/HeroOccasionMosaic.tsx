"use client";

import {
  heroOccasionColumns,
  type HeroOccasionColumn,
} from "@/components/home/HeroOccasionMosaic.config";
import Image from "next/image";
import { useEffect, useRef } from "react";

export default function HeroOccasionMosaic() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) return;

    const mobileLayout = window.matchMedia("(max-width: 639px)").matches;

    if (mobileLayout) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) return;

    let context: { revert: () => void } | undefined;
    let cancelled = false;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([gsapModule, scrollTriggerModule]) => {
        if (cancelled) return;

        const gsap = gsapModule.gsap;
        const ScrollTrigger = scrollTriggerModule.ScrollTrigger;

        gsap.registerPlugin(ScrollTrigger);

        context = gsap.context(() => {
          gsap.utils
            .toArray<HTMLElement>("[data-hero-occasion-column]")
            .forEach((column, index) => {
              const direction = column.dataset.direction === "down" ? 1 : -1;
              const idleColumn = column.querySelector<HTMLElement>(
                "[data-hero-occasion-column-idle]",
              );

              if (idleColumn) {
                gsap.fromTo(
                  idleColumn,
                  { yPercent: direction * -4 },
                  {
                    yPercent: direction * 4,
                    duration: 32 + index * 2,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                    delay: index * -2.5,
                  },
                );
              }

              gsap.fromTo(
                column,
                { yPercent: direction * -8 },
                {
                  yPercent: direction * 18,
                  ease: "none",
                  scrollTrigger: {
                    trigger: root,
                    start: "top top",
                    end: "bottom top",
                    scrub: 2.2,
                  },
                },
              );
            });
        }, root);
      },
    );

    return () => {
      cancelled = true;
      context?.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 -z-30 hidden overflow-hidden bg-[#080605] sm:block"
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-1/2 flex h-[190vh] w-[150vw] -translate-x-1/2 -translate-y-1/2 rotate-[-12deg] items-center justify-center gap-2 sm:gap-3 lg:gap-4">
        {heroOccasionColumns.map((column) => (
          <HeroOccasionColumnView key={column.id} column={column} />
        ))}
      </div>
    </div>
  );
}

function HeroOccasionColumnView({
  column,
}: {
  column: HeroOccasionColumn;
}) {
  return (
    <div
      data-hero-occasion-column
      data-direction={column.direction}
      className="flex w-28 shrink-0 flex-col gap-2 will-change-transform sm:w-36 sm:gap-3 lg:w-48 lg:gap-4 2xl:w-56"
    >
      <div
        data-hero-occasion-column-idle
        className="flex flex-col gap-2 will-change-transform sm:gap-3 lg:gap-4"
      >
        {column.tiles.map((tile, index) => (
          <div
            key={`${column.id}-${tile.src}-${index}`}
            className={`relative w-full shrink-0 overflow-hidden rounded-lg bg-black shadow-[0_12px_30px_rgba(71,46,34,0.14)] ${tile.heightClass}`}
          >
            <Image
              src={tile.src}
              alt=""
              aria-hidden="true"
              fill
              sizes="(min-width: 1536px) 14rem, (min-width: 1024px) 12rem, (min-width: 640px) 9rem, 7rem"
              className="object-cover brightness-[0.72] saturate-[0.94]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
