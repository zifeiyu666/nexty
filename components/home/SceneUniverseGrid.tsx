"use client";

import { sceneUniverseImages } from "@/components/home/SceneUniverseGrid.config";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

const copy = {
  eyebrow: "Scene library",
  title: "An infinite universe of moments unfolding",
  description:
    "Browse the emotional worlds behind every custom song, from quiet love stories to milestone celebrations.",
};

export default function SceneUniverseGrid() {
  const rootRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const reducedMotionRef = useRef(false);
  const [imagesReady, setImagesReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    preloadSceneImages(sceneUniverseImages.map((image) => image.src)).then(
      () => {
        if (isMounted) {
          setImagesReady(true);
        }
      },
    );

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!imagesReady) return;

    const root = rootRef.current;
    const grid = gridRef.current;
    const wrap = wrapRef.current;

    if (!root || !grid || !wrap) return;

    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const items = gsap.utils.toArray<HTMLElement>("[data-scene-card]", grid);
    const inners = gsap.utils.toArray<HTMLElement>(
      "[data-scene-card-inner]",
      grid,
    );

    const context = gsap.context(() => {
      gsap.set(grid, {
        perspective: 1500,
      });
      gsap.fromTo(
        grid,
        { opacity: 0 },
        { opacity: 1, duration: 0.45, ease: "power2.out" },
      );
      gsap.set(wrap, {
        transformStyle: "preserve-3d",
        rotateX: 50,
      });
      gsap.set(items, {
        xPercent: 0,
        yPercent: 0,
        force3D: true,
      });
      gsap.set(inners, { scale: 1.04, force3D: true });

      if (reducedMotionRef.current) return;

      const rows = getGridRows(items);
      const evenRows = rows.filter((_, index) => index % 2 === 0).flat();
      const oddRows = rows.filter((_, index) => index % 2 === 1).flat();

      gsap
        .timeline({
          defaults: { ease: "none", overwrite: "auto" },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .to(wrap, { rotateX: 30 }, 0)
        .to(evenRows, { xPercent: -100, ease: "power1" }, 0)
        .to(oddRows, { xPercent: 100, ease: "power1" }, 0)
        .addLabel("rowsEnd", ">-=0.15")
        .to(
          items,
          {
            ease: "power1",
            yPercent: (index) => verticalDrift[index % verticalDrift.length],
          },
          "rowsEnd",
        );
    }, root);

    return () => context.revert();
  }, [imagesReady]);

  return (
    <section
      ref={rootRef}
      id="scene-universe"
      aria-labelledby="scene-universe-heading"
      className="dark relative isolate h-[240vh] min-h-[1500px] bg-black text-white sm:h-[260vh] lg:h-[280vh]"
    >
      <div className="sticky top-0 h-screen min-h-[720px] overflow-hidden">
        <div
          ref={gridRef}
          className="absolute inset-0 -z-10 grid place-items-center px-4 py-10 opacity-0"
          aria-hidden="true"
        >
          <div
            ref={wrapRef}
            className="grid w-[210vw] grid-cols-8 gap-0 will-change-transform [transform-style:preserve-3d] sm:w-[172vw] lg:w-[132vw]"
          >
            {sceneUniverseImages.map((image, index) => (
              <SceneTile
                key={image.src}
                src={image.src}
                alt={image.alt}
              />
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(circle_at_50%_48%,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.2)_38%,rgba(0,0,0,0.58)_88%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />

        <div className="container relative z-10 mx-auto flex h-full items-center justify-center px-4 pb-16 pt-24 text-center sm:pb-20 lg:pb-24">
          <div className="max-w-6xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.32em] text-white/60">
              {copy.eyebrow}
            </p>
            <h2
              id="scene-universe-heading"
              className="mx-auto max-w-[12ch] font-serif text-[3rem] font-semibold leading-[0.94] tracking-normal text-white drop-shadow-[0_16px_48px_rgba(0,0,0,0.82)] sm:text-[5rem] md:max-w-[18ch] md:text-[5.8rem] lg:max-w-none lg:text-[6.5rem] xl:text-[7.4rem] 2xl:text-[8rem]"
            >
              <span className="block md:whitespace-nowrap">
                An infinite universe
              </span>
              <span className="block md:whitespace-nowrap">
                of moments unfolding
              </span>
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-balance text-sm leading-7 text-white/70 sm:text-base lg:text-lg">
              {copy.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SceneTile({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <figure
      data-scene-card
      className="relative aspect-[1.5] min-h-0 overflow-hidden rounded-md bg-[#111] shadow-[0_18px_52px_rgba(0,0,0,0.42)] ring-1 ring-white/8 will-change-transform"
    >
      <div
        data-scene-card-inner
        className="absolute inset-[-4%] will-change-transform"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1280px) 18vw, (min-width: 768px) 26vw, 46vw"
          className="object-cover"
          loading="eager"
          unoptimized
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.12),transparent_28%,rgba(0,0,0,0.12)_78%)]" />
    </figure>
  );
}

const verticalDrift = [
  -72, 44, 118, -36, 82, 148, -96, 28, 126, -58, 66, 172,
] as const;

function getGridRows(items: HTMLElement[]) {
  const rows = new Map<number, HTMLElement[]>();

  items.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const rowKey = Math.round(rect.top + rect.height / 2);
    const row = rows.get(rowKey) ?? [];

    row.push(item);
    rows.set(rowKey, row);
  });

  return [...rows.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, row]) => row);
}

function preloadSceneImages(srcs: string[]) {
  return Promise.allSettled(
    srcs.map(
      (src) =>
        new Promise<void>((resolve) => {
          const image = new window.Image();

          image.onload = () => resolve();
          image.onerror = () => resolve();
          image.src = src;
        }),
    ),
  );
}
