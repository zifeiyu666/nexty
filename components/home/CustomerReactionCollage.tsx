"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Gift, PencilLine } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

type ReactionVideo = {
  src: string;
  label: string;
  title: string;
};

type CollageSlot = {
  layout: string;
  clipPath: string;
  tilt: string;
};

const trustIcons = [Gift, CheckCircle2, PencilLine];

const collageSlots: CollageSlot[] = [
  {
    layout:
      "col-span-1 row-span-2 md:[grid-column:1/span_5] md:[grid-row:1/span_8]",
    clipPath: "polygon(0 0, 88% 0, 100% 100%, 0 100%)",
    tilt: "-1.6deg",
  },
  {
    layout:
      "md:[grid-column:6/span_3] md:[grid-row:1/span_4]",
    clipPath: "polygon(0 0, 100% 0, 92% 100%, 10% 96%)",
    tilt: "1.2deg",
  },
  {
    layout:
      "md:[grid-column:9/span_3] md:[grid-row:1/span_4]",
    clipPath: "polygon(5% 0, 100% 0, 100% 96%, 0 100%)",
    tilt: "-0.5deg",
  },
  {
    layout:
      "md:[grid-column:12/span_3] md:[grid-row:1/span_4]",
    clipPath: "polygon(8% 0, 100% 0, 100% 100%, 0 96%)",
    tilt: "0.8deg",
  },
  {
    layout:
      "md:[grid-column:6/span_2] md:[grid-row:5/span_4]",
    clipPath: "polygon(8% 0, 100% 4%, 92% 100%, 0 100%)",
    tilt: "1.4deg",
  },
  {
    layout:
      "md:[grid-column:8/span_3] md:[grid-row:5/span_4]",
    clipPath: "polygon(0 4%, 96% 0, 100% 100%, 6% 100%)",
    tilt: "-1deg",
  },
  {
    layout:
      "md:[grid-column:11/span_2] md:[grid-row:5/span_4]",
    clipPath: "polygon(6% 0, 100% 0, 100% 100%, 0 95%)",
    tilt: "0.6deg",
  },
  {
    layout:
      "md:[grid-column:13/span_2] md:[grid-row:5/span_4]",
    clipPath: "polygon(0 0, 100% 3%, 100% 100%, 12% 100%)",
    tilt: "-1.2deg",
  },
];

export default function CustomerReactionCollage() {
  const t = useTranslations("Landing.CustomerReactions");
  const videos = t.raw("videos") as ReactionVideo[];
  const trustItems = t.raw("trustItems") as string[];
  const videoRefs = useRef(new Map<number, HTMLVideoElement>());
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const setVideoRef = (index: number) => (node: HTMLVideoElement | null) => {
    if (node) {
      videoRefs.current.set(index, node);
    } else {
      videoRefs.current.delete(index);
    }
  };

  const playPreview = (index: number) => {
    const video = videoRefs.current.get(index);

    if (!video) return;

    video.muted = true;
    video.volume = 0;
    void video.play();
  };

  const pausePreview = (index: number) => {
    const video = videoRefs.current.get(index);

    if (!video) return;

    video.pause();
    video.currentTime = 0;
  };

  return (
    <section
      id="customer-reactions"
      className="bg-[#f7f2ea] py-12 md:py-18 dark:bg-[#201719]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-9 text-center md:mb-12">
          <h2 className="preset-title">
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
            "relative mx-auto max-w-6xl transition-all duration-500",
            activeIndex !== null &&
              "[&_.collage-piece:not(.is-active)]:md:opacity-70",
          )}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <div className="pointer-events-none absolute -left-2 -top-5 z-20 h-8 w-28 -rotate-12 bg-[#e5dcc7]/95 shadow-md shadow-black/10 dark:bg-[#d8c9ad]/75" />
          <div className="pointer-events-none absolute -bottom-4 -right-3 z-20 h-10 w-24 rotate-12 bg-[#efe4cf]/95 shadow-md shadow-black/10 dark:bg-[#d8c9ad]/75" />

          <div className="relative overflow-hidden rounded-[6px] bg-white p-1.5 shadow-2xl shadow-black/10 ring-1 ring-black/10 md:aspect-[16/9] dark:bg-[#f4ede1] dark:shadow-black/35">
            <div className="grid h-full grid-cols-2 auto-rows-[210px] gap-1 bg-white md:grid-cols-[repeat(14,minmax(0,1fr))] md:grid-rows-[repeat(8,minmax(0,1fr))] md:auto-rows-auto md:gap-0">
              {videos.map((video, index) => {
                const slot = collageSlots[index % collageSlots.length];
                const isActive = activeIndex === index;
                const posterSrc = video.src.replace(/\.mp4$/, ".jpg");

                return (
                  <button
                    key={`${video.src}-${index}`}
                    type="button"
                    onClick={() => {
                      setActiveIndex(index);
                      playPreview(index);
                    }}
                    onMouseEnter={() => {
                      setActiveIndex(index);
                      playPreview(index);
                    }}
                    onMouseLeave={() => pausePreview(index)}
                    onFocus={() => {
                      setActiveIndex(index);
                      playPreview(index);
                    }}
                    onBlur={() => pausePreview(index)}
                    className={cn(
                      "collage-piece group relative min-h-0 overflow-hidden bg-muted text-left outline-none transition-all duration-700 ease-out focus-visible:z-30 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                      "before:pointer-events-none before:absolute before:inset-0 before:z-10 before:shadow-[inset_0_0_0_5px_rgba(255,255,255,0.94)]",
                      "hover:z-20 hover:shadow-2xl hover:shadow-black/25",
                      isActive && "is-active z-20",
                      slot.layout,
                    )}
                    style={{
                      clipPath: slot.clipPath,
                      transform: `rotate(${slot.tilt})`,
                    }}
                    aria-label={video.title}
                  >
                    <video
                      ref={setVideoRef(index)}
                      src={video.src}
                      poster={posterSrc}
                      className="h-full w-full scale-100 object-cover transition-transform duration-[1800ms] ease-out group-hover:scale-[1.1] group-focus-visible:scale-[1.1]"
                      preload="metadata"
                      muted
                      playsInline
                      loop
                    />
                    <div className="absolute inset-0 bg-black/10 opacity-100 transition-opacity duration-500 group-hover:opacity-0 group-focus-visible:opacity-0" />
                    <div className="absolute bottom-3 left-3 right-3 z-20 flex items-end justify-between gap-2 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                      <span className="max-w-full rounded-full bg-white/88 px-3 py-1 text-xs font-medium text-[#2b1712] shadow-sm backdrop-blur">
                        {video.title}
                      </span>
                      <span className="hidden rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm sm:inline-flex">
                        {video.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
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
