"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Link } from "@/i18n/routing";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Play } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

export type WallArtImage = {
  src: string;
  width: number;
  height: number;
  videoSrc?: string;
};

export const PRODUCT_DIMENSIONS: Record<string, [number, number]> = {
  "wall-art-01.webp": [618, 1110], "wall-art-02.webp": [616, 1100],
  "wall-art-03.webp": [612, 1098], "wall-art-04.webp": [612, 1098],
  "wall-art-05.webp": [612, 1104], "wall-art-06.webp": [616, 1104],
  "wall-art-07.webp": [770, 1108], "wall-art-08.webp": [774, 1110],
  "wall-art-09.webp": [766, 1108], "wall-art-10.webp": [774, 1108],
  "wall-art-11.webp": [766, 1108], "wall-art-12.webp": [766, 1106],
  "wall-art-14.webp": [2782, 1496], "wall-art-15.webp": [2714, 1406],
  "wall-art-16.webp": [2690, 1498], "wall-art-17.webp": [2764, 1488],
  "wall-art-18.webp": [2456, 1500], "wall-art-19.webp": [2454, 1496],
  "wall-art-20.webp": [2462, 1502], "wall-art-21.webp": [2458, 1500],
  "wall-art-22.webp": [2454, 1496], "wall-art-23.webp": [2144, 1442],
  "lyricwallart.webp": [900, 1600],
};

const COLUMN_COUNT = 5;

/**
 * Each column moves upward at a different pace while the page scrolls.
 * `start`/`end` are fractions of the column's available travel distance,
 * and the staggered offsets keep the columns visually interlocked.
 */
const columnMotions = [
  { start: 0, end: 0.82 },
  { start: 0.16, end: 1 },
  { start: 0.05, end: 0.68 },
  { start: 0.2, end: 0.9 },
  { start: 0.1, end: 0.76 },
];

/**
 * Greedily places every image into the currently shortest column so the
 * four columns stay height-balanced while mixing aspect ratios.
 */
function distributeImages(images: WallArtImage[]): WallArtImage[][] {
  const columns: WallArtImage[][] = Array.from(
    { length: COLUMN_COUNT },
    () => [],
  );
  const columnHeights = Array.from({ length: COLUMN_COUNT }, () => 0);
  const sorted = [...images].sort(
    (a, b) => b.height / b.width - a.height / a.width,
  );

  for (const image of sorted) {
    let target = 0;

    for (let index = 1; index < COLUMN_COUNT; index += 1) {
      if (columnHeights[index] < columnHeights[target]) {
        target = index;
      }
    }

    columns[target].push(image);
    columnHeights[target] += image.height / image.width;
  }

  return columns;
}

export default function WallArtGallery({ images }: { images: WallArtImage[] }) {
  const t = useTranslations("Landing.WallArtGallery");
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [activeImage, setActiveImage] = useState<WallArtImage | null>(null);
  const columns = useMemo(() => distributeImages(images), [images]);

  useEffect(() => {
    const root = viewportRef.current;
    const section = sectionRef.current;

    if (!root || !section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      const columnElements = gsap.utils.toArray<HTMLElement>(
        "[data-wall-art-column]",
        root,
      );

      columnElements.forEach((column, index) => {
        const motion = columnMotions[index % columnMotions.length];
        const getTravel = () =>
          Math.max(column.offsetHeight - root.clientHeight, 0);

        gsap.fromTo(
          column,
          { y: () => -getTravel() * motion.start },
          {
            y: () => -getTravel() * motion.end,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });
    }, root);

    return () => context.revert();
  }, [columns]);

  return (
    <section
      ref={sectionRef}
      id="wall-art-gallery"
      className="home-section-deep !bg-[#231713] overflow-hidden"
    >
      <div className="home-container">
        <div className="home-section-header">
          <p className="home-eyebrow">{t("eyebrow")}</p>
          <h2 className="home-title hero-title-warm">{t("title")}</h2>
          <p className="home-description-on-deep">{t("description")}</p>
          {locale === "en" && (
            <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-3">
              <Link
                href="/custom-song-lyrics-wall-art"
                className="group inline-flex items-center gap-2 text-sm font-bold text-[#f6c85f] transition hover:text-white"
              >
                {t("wallArtCta")}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/lyric-poster-maker"
                className="group inline-flex items-center gap-2 text-sm font-bold text-white/72 transition hover:text-white"
              >
                {t("posterCta")}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>
      </div>

      <div
        ref={viewportRef}
        className="relative mx-auto h-[80vh] min-h-[520px] w-full max-w-7xl overflow-hidden px-4 sm:px-6 lg:px-8"
      >
        <div className="grid h-full grid-cols-5 gap-2 md:gap-4">
          {columns.map((columnImages, columnIndex) => (
            <div
              key={columnIndex}
              data-wall-art-column
              className="flex flex-col gap-2 will-change-transform md:gap-4"
            >
              {columnImages.map((image, imageIndex) => (
                <button
                  key={`${image.src}-${imageIndex}`}
                  type="button"
                  onClick={() => setActiveImage(image)}
                  aria-label={t("imageAlt", {
                    index: String(imageIndex + 1),
                  })}
                  className="group relative block w-full shrink-0 cursor-zoom-in overflow-hidden rounded-xl bg-white/[0.06] shadow-[0_14px_38px_rgba(0,0,0,0.42)] ring-1 ring-white/10 transition duration-300 ease-out hover:shadow-[0_20px_48px_rgba(0,0,0,0.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  style={{ aspectRatio: `${image.width} / ${image.height}` }}
                >
                  <Image
                    src={image.src}
                    alt={t("imageAlt", { index: String(imageIndex + 1) })}
                    fill
                    sizes="(max-width: 767px) 19vw, 19vw"
                    className="object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
                  />
                  {image.videoSrc && (
                    <span className="pointer-events-none absolute inset-0 grid place-items-center bg-black/10 opacity-0 transition group-hover:opacity-100">
                      <span className="grid size-11 place-items-center rounded-full bg-white/90 text-[#231713] shadow-xl">
                        <Play className="ml-0.5 size-5 fill-current" aria-hidden="true" />
                      </span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-[#231713] to-transparent md:h-32" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-[#231713] to-transparent md:h-32" />
      </div>

      <Dialog
        open={Boolean(activeImage)}
        onOpenChange={(open) => {
          if (!open) setActiveImage(null);
        }}
      >
        <DialogContent className="max-w-[calc(100vw-2rem)] border-none bg-transparent p-0 shadow-none sm:max-w-5xl">
          <DialogTitle className="sr-only">{t("dialogTitle")}</DialogTitle>
          {activeImage?.videoSrc ? (
            <video
              key={activeImage.videoSrc}
              src={activeImage.videoSrc}
              poster={activeImage.src}
              controls
              autoPlay
              playsInline
              className="mx-auto max-h-[85vh] w-auto max-w-full rounded-xl bg-black object-contain shadow-[0_32px_80px_rgba(0,0,0,0.45)]"
            />
          ) : activeImage ? (
            <Image
              src={activeImage.src}
              alt={t("dialogTitle")}
              width={activeImage.width}
              height={activeImage.height}
              className="mx-auto h-auto max-h-[85vh] w-auto max-w-full rounded-xl object-contain shadow-[0_32px_80px_rgba(0,0,0,0.45)]"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
