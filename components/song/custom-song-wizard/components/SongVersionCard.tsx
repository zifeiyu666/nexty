"use client";

import type { CSSProperties, ReactNode } from "react";
import { useCallback, useRef } from "react";

import { cn } from "@/lib/utils";

type SongVersionCardProps = {
  children: ReactNode;
  className?: string;
};

export function SongVersionCard({ children, className }: SongVersionCardProps) {
  const frameRef = useRef<number | null>(null);

  const resetTilt = useCallback((element: HTMLElement) => {
    element.style.setProperty("--song-card-rotate-x", "0deg");
    element.style.setProperty("--song-card-rotate-y", "0deg");
    element.style.setProperty("--song-card-lift", "0px");
    element.style.setProperty("--song-card-scale", "1");
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const { left, top, width, height } = element.getBoundingClientRect();
    const x = (event.clientX - left) / width - 0.5;
    const y = (event.clientY - top) / height - 0.5;
    const rotateX = y * -7;
    const rotateY = x * 8;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      element.style.setProperty("--song-card-rotate-x", `${rotateX.toFixed(2)}deg`);
      element.style.setProperty("--song-card-rotate-y", `${rotateY.toFixed(2)}deg`);
      element.style.setProperty("--song-card-lift", "-5px");
      element.style.setProperty("--song-card-scale", "1.012");
    });
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    resetTilt(event.currentTarget);
  };

  return (
    <div
      className={cn(
        "group cursor-pointer rounded-2xl bg-card p-4 shadow-[0_18px_48px_rgba(255,120,150,0.16)] transition-[transform,box-shadow] duration-300 ease-out [transform:perspective(900px)_translateY(var(--song-card-lift,0px))_rotateX(var(--song-card-rotate-x,0deg))_rotateY(var(--song-card-rotate-y,0deg))_scale(var(--song-card-scale,1))] [transform-style:preserve-3d] hover:shadow-[0_30px_72px_rgba(255,104,142,0.25)] motion-reduce:transform-none",
        className
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={
        {
          "--song-card-rotate-x": "0deg",
          "--song-card-rotate-y": "0deg",
          "--song-card-lift": "0px",
          "--song-card-scale": "1",
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
