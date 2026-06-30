"use client";

import { Music2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, type MouseEvent } from "react";

export default function AnniversaryHeroVisual() {
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

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const applySceneState = (values: {
    rotateX: number;
    rotateY: number;
    sceneX: number;
    sceneY: number;
    imageX: number;
    imageY: number;
    cardX: number;
    cardY: number;
    glowX: number;
    glowY: number;
  }) => {
    const scene = sceneRef.current;

    if (!scene) return;

    scene.style.setProperty("--hero-rotate-x", `${values.rotateX.toFixed(2)}deg`);
    scene.style.setProperty("--hero-rotate-y", `${values.rotateY.toFixed(2)}deg`);
    scene.style.setProperty("--hero-scene-x", `${values.sceneX.toFixed(2)}px`);
    scene.style.setProperty("--hero-scene-y", `${values.sceneY.toFixed(2)}px`);
    scene.style.setProperty("--hero-image-x", `${values.imageX.toFixed(2)}px`);
    scene.style.setProperty("--hero-image-y", `${values.imageY.toFixed(2)}px`);
    scene.style.setProperty("--hero-card-x", `${values.cardX.toFixed(2)}px`);
    scene.style.setProperty("--hero-card-y", `${values.cardY.toFixed(2)}px`);
    scene.style.setProperty("--hero-glow-x", `${values.glowX.toFixed(2)}%`);
    scene.style.setProperty("--hero-glow-y", `${values.glowY.toFixed(2)}%`);
  };

  const resetScene = () => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      applySceneState({
        rotateX: 0,
        rotateY: 0,
        sceneX: 0,
        sceneY: 0,
        imageX: 0,
        imageY: 0,
        cardX: 0,
        cardY: 0,
        glowX: 50,
        glowY: 50,
      });
    });
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reducedMotionRef.current) {
      return;
    }

    const scene = sceneRef.current;

    if (!scene) return;

    const bounds = scene.getBoundingClientRect();
    const offsetX = event.clientX - bounds.left;
    const offsetY = event.clientY - bounds.top;
    const percentX = offsetX / bounds.width - 0.5;
    const percentY = offsetY / bounds.height - 0.5;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      applySceneState({
        rotateX: percentY * -10,
        rotateY: percentX * 14,
        sceneX: percentX * 8,
        sceneY: percentY * 8,
        imageX: percentX * -16,
        imageY: percentY * -12,
        cardX: percentX * 22,
        cardY: percentY * 18,
        glowX: (offsetX / bounds.width) * 100,
        glowY: (offsetY / bounds.height) * 100,
      });
    });
  };

  return (
    <div className="relative [perspective:1600px]">
      <div
        ref={sceneRef}
        className="group relative [--hero-card-x:0px] [--hero-card-y:0px] [--hero-glow-x:50%] [--hero-glow-y:50%] [--hero-image-x:0px] [--hero-image-y:0px] [--hero-rotate-x:0deg] [--hero-rotate-y:0deg] [--hero-scene-x:0px] [--hero-scene-y:0px]"
        onMouseMove={handleMouseMove}
        onMouseLeave={resetScene}
      >
        <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_var(--hero-glow-x)_var(--hero-glow-y),rgba(255,255,255,0.5),transparent_42%)] opacity-80 blur-2xl transition-opacity duration-500" />

        <div className="relative transition-transform duration-500 ease-out [transform:translate3d(var(--hero-scene-x),var(--hero-scene-y),0)_rotateX(var(--hero-rotate-x))_rotateY(var(--hero-rotate-y))] [transform-style:preserve-3d] will-change-transform">
          <div className="relative aspect-[1.6] overflow-hidden rounded-2xl bg-[#e8d7cd] shadow-[0_28px_80px_rgba(69,34,20,0.2)] ring-1 ring-white/80 lg:aspect-[1.42] [transform:translateZ(0)]">
            <div className="absolute inset-0 transition-transform duration-500 ease-out [transform:translate3d(var(--hero-image-x),var(--hero-image-y),0)_scale(1.05)] will-change-transform">
              <Image
                src="/images/occasions/anniversary-songs-hero.webp"
                alt="Couple celebrating an anniversary beside candles and a record player"
                fill
                priority
                sizes="(min-width: 1024px) 48vw, 100vw"
                className="object-cover object-[62%_52%]"
              />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.16),transparent_42%,rgba(72,29,14,0.16))]" />
            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--hero-glow-x)_var(--hero-glow-y),rgba(255,255,255,0.24),transparent_24%)]" />
            </div>
          </div>

          <div className="absolute -bottom-5 left-5 right-5 transition-transform duration-500 ease-out md:left-auto md:w-[300px] [transform:translate3d(var(--hero-card-x),var(--hero-card-y),44px)] [transform-style:preserve-3d] will-change-transform">
            <div className="rounded-lg border border-white/70 bg-white/88 p-3.5 shadow-[0_22px_56px_rgba(65,34,20,0.2)] backdrop-blur-md">
              <div className="flex items-start gap-3">
                <span className="bg-accent text-accent-foreground flex size-9 shrink-0 items-center justify-center rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
                  <Music2 className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-black text-[#261712]">
                    Built for anniversary reveals
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#6f625c]">
                    Play it at dinner, a vow renewal, or inside a keepsake
                    video that brings your story back.
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
