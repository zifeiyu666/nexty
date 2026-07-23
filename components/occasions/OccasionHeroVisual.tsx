"use client";

import { Music2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, type CSSProperties, type MouseEvent } from "react";

type OccasionHeroVisualProps = {
  image: string;
  imageAlt: string;
  cardTitle: string;
  cardDescription: string;
  accent: string;
};

export default function OccasionHeroVisual({
  image,
  imageAlt,
  cardTitle,
  cardDescription,
  accent,
}: OccasionHeroVisualProps) {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      reducedMotionRef.current = mediaQuery.matches;
    };

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => {
      mediaQuery.removeEventListener("change", updatePreference);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const applySceneState = (x: number, y: number) => {
    const scene = sceneRef.current;
    if (!scene) return;

    scene.style.setProperty("--hero-rotate-x", `${(y * -8).toFixed(2)}deg`);
    scene.style.setProperty("--hero-rotate-y", `${(x * 11).toFixed(2)}deg`);
    scene.style.setProperty("--hero-image-x", `${(x * -14).toFixed(2)}px`);
    scene.style.setProperty("--hero-image-y", `${(y * -10).toFixed(2)}px`);
    scene.style.setProperty("--hero-card-x", `${(x * 18).toFixed(2)}px`);
    scene.style.setProperty("--hero-card-y", `${(y * 14).toFixed(2)}px`);
    scene.style.setProperty(
      "--hero-glow-x",
      `${((x + 0.5) * 100).toFixed(2)}%`,
    );
    scene.style.setProperty(
      "--hero-glow-y",
      `${((y + 0.5) * 100).toFixed(2)}%`,
    );
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reducedMotionRef.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => applySceneState(x, y));
  };

  const resetScene = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => applySceneState(0, 0));
  };

  return (
    <div className="relative pb-7 [perspective:1600px]">
      <div
        ref={sceneRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetScene}
        className="group relative [--hero-card-x:0px] [--hero-card-y:0px] [--hero-glow-x:50%] [--hero-glow-y:50%] [--hero-image-x:0px] [--hero-image-y:0px] [--hero-rotate-x:0deg] [--hero-rotate-y:0deg]"
        style={{ "--hero-accent": accent } as CSSProperties}
      >
        <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_var(--hero-glow-x)_var(--hero-glow-y),color-mix(in_srgb,var(--hero-accent)_28%,white),transparent_44%)] opacity-70 blur-2xl" />
        <div className="relative transition-transform duration-500 ease-out [transform:rotateX(var(--hero-rotate-x))_rotateY(var(--hero-rotate-y))] [transform-style:preserve-3d] will-change-transform">
          <div className="relative aspect-[1.6] overflow-hidden rounded-2xl bg-[#e9ddd5] shadow-[0_28px_80px_rgba(43,25,20,0.22)] ring-1 ring-white/80 lg:aspect-[1.42]">
            <div className="absolute inset-0 transition-transform duration-500 ease-out [transform:translate3d(var(--hero-image-x),var(--hero-image-y),0)_scale(1.05)] will-change-transform">
              <Image
                src={image}
                alt={imageAlt}
                fill
                priority
                sizes="(min-width: 1024px) 48vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.12),transparent_42%,rgba(31,20,16,0.15))]" />
          </div>

          <div className="absolute -bottom-5 left-5 right-5 transition-transform duration-500 ease-out md:left-auto md:w-[310px] [transform:translate3d(var(--hero-card-x),var(--hero-card-y),44px)] will-change-transform">
            <div className="rounded-lg border border-white/70 bg-white/90 p-4 shadow-[0_22px_56px_rgba(43,25,20,0.2)] backdrop-blur-md">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--hero-accent)] text-white">
                  <Music2 className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-black text-[#261712]">
                    {cardTitle}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#6f625c]">
                    {cardDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
