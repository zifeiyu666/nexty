"use client";

import { HeartHandshake } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, type MouseEvent } from "react";

export function VoiceCloneHeroVisual() {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reducedMotionRef.current = media.matches;
    };
    update();
    media.addEventListener("change", update);
    return () => {
      media.removeEventListener("change", update);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  function setScene(x: number, y: number, rotateX: number, rotateY: number) {
    const scene = sceneRef.current;
    if (!scene) return;
    scene.style.setProperty("--voice-scene-x", `${x.toFixed(2)}px`);
    scene.style.setProperty("--voice-scene-y", `${y.toFixed(2)}px`);
    scene.style.setProperty("--voice-rotate-x", `${rotateX.toFixed(2)}deg`);
    scene.style.setProperty("--voice-rotate-y", `${rotateY.toFixed(2)}deg`);
  }

  function reset() {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => setScene(0, 0, 0, 0));
  }

  function handleMove(event: MouseEvent<HTMLDivElement>) {
    if (reducedMotionRef.current || !sceneRef.current) return;
    const bounds = sceneRef.current.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const dx = x / bounds.width - 0.5;
    const dy = y / bounds.height - 0.5;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() =>
      setScene(dx * 8, dy * 8, dy * -7, dx * 9),
    );
  }

  return (
    <div className="relative [perspective:1600px]">
      <div
        ref={sceneRef}
        className="relative [--voice-rotate-x:0deg] [--voice-rotate-y:0deg] [--voice-scene-x:0px] [--voice-scene-y:0px]"
        onMouseMove={handleMove}
        onMouseLeave={reset}
      >
        <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_66%_28%,rgba(246,190,50,0.26),transparent_42%)] blur-2xl" />
        <div className="relative transition-transform duration-500 ease-out [transform:translate3d(var(--voice-scene-x),var(--voice-scene-y),0)_rotateX(var(--voice-rotate-x))_rotateY(var(--voice-rotate-y))] [transform-style:preserve-3d] will-change-transform">
          <div className="relative aspect-[1.38] overflow-hidden rounded-2xl bg-[#ebd6ca] shadow-[0_28px_80px_rgba(69,34,20,0.2)] ring-1 ring-white/80 lg:aspect-[1.24]">
            <Image
              src="/images/voice-clone/voice-clone-hero.webp"
              alt="A woman emotionally listening to a song created in her partner's familiar singing voice"
              fill
              priority
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover object-[66%_48%]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.18),transparent_44%,rgba(63,30,18,0.16))]" />
          </div>

          <div className="absolute -bottom-5 left-5 right-5 md:left-auto md:right-6 md:w-[308px] [transform:translateZ(44px)]">
            <div className="rounded-lg border border-white/70 bg-white/90 p-4 shadow-[0_22px_56px_rgba(65,34,20,0.2)] backdrop-blur-md">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#ffe0e7] text-[#bf3f5d]">
                  <HeartHandshake className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-black text-[#261712]">
                    A familiar voice changes everything
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#6f625c]">
                    Turn a gift song into something that feels like it was sung
                    straight from your heart.
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
