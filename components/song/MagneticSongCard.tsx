"use client";

import { cn } from "@/lib/utils";
import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { useRef } from "react";

type MagneticSongCardProps = {
  children: ReactNode;
  className?: string;
};

type MagneticCardStyle = CSSProperties & {
  "--song-card-glow-opacity": string;
  "--song-card-glow-x": string;
  "--song-card-glow-y": string;
  "--song-card-lift": string;
  "--song-card-rotate-x": string;
  "--song-card-rotate-y": string;
  "--song-card-scale": string;
};

const MAX_ROTATE_X = 6;
const MAX_ROTATE_Y = 8;

function clamp(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

export function MagneticSongCard({
  children,
  className,
}: MagneticSongCardProps) {
  const cardRef = useRef<HTMLElement>(null);

  function updateTilt(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch") return;

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = clamp((event.clientX - rect.left) / rect.width);
    const y = clamp((event.clientY - rect.top) / rect.height);
    const rotateX = (0.5 - y) * MAX_ROTATE_X;
    const rotateY = (x - 0.5) * MAX_ROTATE_Y;

    card.style.setProperty("--song-card-rotate-x", `${rotateX.toFixed(2)}deg`);
    card.style.setProperty("--song-card-rotate-y", `${rotateY.toFixed(2)}deg`);
    card.style.setProperty("--song-card-glow-x", `${(x * 100).toFixed(1)}%`);
    card.style.setProperty("--song-card-glow-y", `${(y * 100).toFixed(1)}%`);
    card.style.setProperty("--song-card-glow-opacity", "1");
    card.style.setProperty("--song-card-lift", "-5px");
    card.style.setProperty("--song-card-scale", "1.01");
  }

  function resetTilt() {
    const card = cardRef.current;
    if (!card) return;

    card.style.setProperty("--song-card-rotate-x", "0deg");
    card.style.setProperty("--song-card-rotate-y", "0deg");
    card.style.setProperty("--song-card-glow-opacity", "0");
    card.style.setProperty("--song-card-lift", "0px");
    card.style.setProperty("--song-card-scale", "1");
  }

  return (
    <article
      ref={cardRef}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg bg-card shadow-[0_10px_28px_rgba(28,25,23,0.09),0_2px_8px_rgba(28,25,23,0.05)] transition-[box-shadow,transform] duration-200 ease-out [transform:perspective(900px)_rotateX(var(--song-card-rotate-x))_rotateY(var(--song-card-rotate-y))_translateY(var(--song-card-lift))_scale(var(--song-card-scale))] [transform-style:preserve-3d] hover:shadow-[0_16px_36px_rgba(28,25,23,0.12),0_4px_12px_rgba(28,25,23,0.07)]",
        className,
      )}
      onPointerLeave={resetTilt}
      onPointerMove={updateTilt}
      style={
        {
          "--song-card-glow-opacity": "0",
          "--song-card-glow-x": "50%",
          "--song-card-glow-y": "50%",
          "--song-card-lift": "0px",
          "--song-card-rotate-x": "0deg",
          "--song-card-rotate-y": "0deg",
          "--song-card-scale": "1",
        } as MagneticCardStyle
      }
    >
      <span className="pointer-events-none absolute inset-0 z-20 opacity-[var(--song-card-glow-opacity)] mix-blend-soft-light transition-opacity duration-200 [background:radial-gradient(circle_at_var(--song-card-glow-x)_var(--song-card-glow-y),rgba(255,255,255,0.7),rgba(255,255,255,0.14)_22%,transparent_48%)]" />
      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </article>
  );
}
