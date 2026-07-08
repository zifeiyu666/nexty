"use client";

import {
  diagonalCounterflowTracks,
  type DiagonalCounterflowTrack,
} from "@/components/home/DiagonalCounterflowShowcase.config";
import { Button } from "@/components/ui/button";
import { Link as I18nLink } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const copy = {
  eyebrow: "CURRENT OFFERS",
  description:
    "Karaoke, Spotify/YouTube streaming, QR code and printable lyrics: choose the offer that maximizes emotion.",
  price: "ONLY 49.99€",
  cta: "Order music",
};

export default function DiagonalCounterflowShowcase() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) return;

    const context = gsap.context(() => {
      gsap.utils
        .toArray<HTMLElement>("[data-counterflow-track]")
        .forEach((track, index) => {
          const direction = track.dataset.direction === "reverse" ? -1 : 1;
          const distance = index === 1 ? 78 : 64;

          gsap.fromTo(
            track,
            {
              xPercent: direction * -5,
            },
            {
              xPercent: direction * distance,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: 2.4,
              },
            },
          );
        });
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative isolate w-full max-w-full overflow-hidden bg-[#faf3ef] text-[#17120f]"
      aria-labelledby="diagonal-counterflow-heading"
    >
      <div className="w-full max-w-full overflow-hidden bg-white/35">
        <div className="relative min-h-[500px] max-w-full overflow-hidden sm:min-h-[560px] lg:min-h-[620px]">
          <div
            className="absolute left-1/2 top-1/2 -z-10 flex w-[360vw] -translate-x-1/2 -translate-y-1/2 rotate-[-38deg] flex-col gap-14 opacity-100 sm:w-[285vw] sm:gap-16 lg:w-[230vw] lg:gap-20"
            aria-hidden="true"
          >
            {diagonalCounterflowTracks.map((track, index) => (
              <ImageTrack
                key={track.id}
                track={track}
                className={index === 1 ? "translate-x-[6%]" : "-translate-x-[2%]"}
              />
            ))}
          </div>

          <div className="absolute inset-0 bg-[#f7f0ed]/18" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.58)_0%,rgba(255,255,255,0.22)_43%,rgba(255,247,242,0.28)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/42 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/38 to-transparent" />

          <div className="relative z-10 flex min-h-[500px] items-center justify-center px-4 py-12 text-center sm:min-h-[560px] sm:px-8 lg:min-h-[620px]">
            <div className="mx-auto flex max-w-5xl flex-col items-center">
              <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#e9905c] sm:text-sm">
                {copy.eyebrow}
              </p>
              <h2
                id="diagonal-counterflow-heading"
                className="mt-7 max-w-4xl text-4xl font-black leading-[1.02] tracking-normal text-[#0d0d0d] sm:text-5xl md:text-6xl lg:text-7xl"
              >
                Enhance your <em className="font-black italic">custom song</em>
              </h2>
              <p className="mt-7 max-w-4xl text-base font-medium leading-8 text-[#1f1b18] sm:text-xl lg:text-2xl">
                {copy.description}
              </p>
              <p className="mt-10 text-sm font-semibold uppercase tracking-[0.45em] text-[#111] sm:text-lg">
                {copy.price}
              </p>
              <Button
                asChild
                className="mt-7 h-16 rounded-full bg-[#141414] px-10 text-base font-bold text-white shadow-[0_20px_45px_rgba(0,0,0,0.22)] hover:bg-[#252525] sm:h-[70px] sm:px-14 sm:text-lg"
              >
                <I18nLink href="/pricing" className="inline-flex items-center gap-4">
                  {copy.cta}
                  <ArrowRight className="size-6" />
                </I18nLink>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ImageTrack({
  track,
  className,
}: {
  track: DiagonalCounterflowTrack;
  className?: string;
}) {
  return (
    <div
      data-counterflow-track
      data-direction={track.direction}
      className={`flex shrink-0 gap-7 will-change-transform sm:gap-8 lg:gap-10 ${className ?? ""}`}
    >
      {track.images.map((src, index) => (
        <div
          key={`${track.id}-${src}-${index}`}
          className="relative h-44 w-72 shrink-0 overflow-hidden rounded-[24px] bg-[#eadbd1] shadow-[0_18px_48px_rgba(56,36,25,0.16)] sm:h-56 sm:w-[22rem] lg:h-64 lg:w-[31rem]"
        >
          <Image
            src={src}
            alt=""
            aria-hidden="true"
            fill
            sizes="(min-width: 1024px) 31rem, (min-width: 640px) 22rem, 18rem"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/0" />
        </div>
      ))}
    </div>
  );
}
