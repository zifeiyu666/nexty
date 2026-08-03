"use client";

import { Button } from "@/components/ui/button";
import { CircleStop, Radio } from "lucide-react";
import { useEffect, useRef } from "react";

type LiveRecordingPanelProps = {
  analyser: AnalyserNode | null;
  description: string;
  elapsedSeconds: number;
  maxDurationSeconds?: number | null;
  onStop: () => void;
  stopLabel?: string;
  title?: string;
};

export function LiveRecordingPanel({
  analyser,
  description,
  elapsedSeconds,
  maxDurationSeconds,
  onStop,
  stopLabel = "Stop recording",
  title = "Recording live",
}: LiveRecordingPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const elapsedLabel = `${Math.floor(elapsedSeconds / 60)}:${Math.floor(elapsedSeconds % 60)
    .toString()
    .padStart(2, "0")}`;
  const limitLabel = maxDurationSeconds
    ? `${Math.floor(maxDurationSeconds / 60)}:${Math.floor(maxDurationSeconds % 60)
        .toString()
        .padStart(2, "0")}`
    : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const data = new Uint8Array(analyser.frequencyBinCount);
    let frame = 0;

    const draw = () => {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.round(bounds.width * pixelRatio));
      const height = Math.max(1, Math.round(bounds.height * pixelRatio));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, bounds.width, bounds.height);
      analyser.getByteFrequencyData(data);

      const barCount = 42;
      const gap = 3;
      const barWidth = (bounds.width - (barCount - 1) * gap) / barCount;
      const step = Math.max(1, Math.floor(data.length / barCount));

      for (let index = 0; index < barCount; index += 1) {
        const level = data[index * step] / 255;
        const barHeight = Math.max(5, level * (bounds.height - 8));
        const x = index * (barWidth + gap);
        context.fillStyle = `rgba(224, 65, 50, ${0.42 + level * 0.58})`;
        context.fillRect(x, (bounds.height - barHeight) / 2, barWidth, barHeight);
      }

      frame = window.requestAnimationFrame(draw);
    };

    draw();
    return () => window.cancelAnimationFrame(frame);
  }, [analyser]);

  return (
    <section
      aria-live="polite"
      className="mt-4 rounded-2xl border border-primary/25 bg-primary/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]"
      role="status"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <span className="relative grid size-8 place-items-center rounded-full bg-primary/10">
            <span className="absolute size-4 rounded-full border border-primary/30 motion-safe:animate-ping" />
            <Radio className="relative size-4" />
          </span>
          {title}
        </div>
        <span className="rounded-full bg-white/80 px-3 py-1 text-sm font-semibold tabular-nums text-[#3d241b] shadow-sm">
          {elapsedLabel}{limitLabel ? ` / ${limitLabel}` : ""}
        </span>
        <Button
          type="button"
          variant="destructive"
          className="h-10 rounded-full px-4 text-sm font-semibold"
          onClick={onStop}
        >
          <CircleStop className="size-4" /> {stopLabel}
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        className="mt-4 h-16 w-full"
        aria-label="Live recording audio waveform"
      />
      <p className="mt-3 text-sm font-medium text-primary">{description}</p>
      {maxDurationSeconds ? (
        <p className="mt-1 text-xs leading-5 text-[#80685e]">
          Stops automatically at {limitLabel} so the voice intro stays within the song format limit.
        </p>
      ) : null}
    </section>
  );
}
