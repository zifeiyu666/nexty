"use client";

import { Button } from "@/components/ui/button";
import { MAX_VOICE_SAMPLE_SECONDS, MIN_VOICE_SAMPLE_SECONDS } from "@/lib/voice-sample";
import { Pause, Play, Scissors } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

type VoiceSourceEditorProps = {
  duration: number;
  end: number;
  samples: number[];
  start: number;
  url: string;
  onEndChange: (value: number) => void;
  onStartChange: (value: number) => void;
};

function formatTime(value: number) {
  const seconds = Math.max(0, value);
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toFixed(1).padStart(4, "0")}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function roundToTenth(value: number) {
  return Math.round(value * 10) / 10;
}

function drawWaveform(
  canvas: HTMLCanvasElement,
  samples: number[],
  start: number,
  end: number,
  duration: number,
) {
  const bounds = canvas.getBoundingClientRect();
  const pixelRatio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
  canvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));

  const context = canvas.getContext("2d");
  if (!context) return;

  context.scale(pixelRatio, pixelRatio);
  const width = bounds.width;
  const height = bounds.height;
  const center = height / 2;
  const startX = (start / duration) * width;
  const endX = (end / duration) * width;

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#f7e7e1";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#fbe7ed";
  context.fillRect(startX, 0, Math.max(0, endX - startX), height);

  const barWidth = width / Math.max(samples.length, 1);
  samples.forEach((sample, index) => {
    const x = index * barWidth;
    const barHeight = Math.max(3, sample * (height - 18));
    const selected = x >= startX && x <= endX;
    context.fillStyle = selected ? "#e84335" : "#c7a89c";
    context.fillRect(x, center - barHeight / 2, Math.max(1, barWidth - 1.5), barHeight);
  });

  context.strokeStyle = "#e84335";
  context.lineWidth = 2;
  [startX, endX].forEach((x) => {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  });
}

export function VoiceSourceEditor({
  duration,
  end,
  samples,
  start,
  url,
  onEndChange,
  onStartChange,
}: VoiceSourceEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropTrackRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const dragRef = useRef<{
    end: number;
    mode: "move" | "resize-end" | "resize-start";
    pointerX: number;
    start: number;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !duration) return;
    drawWaveform(canvas, samples, start, end, duration);
    const observer = new ResizeObserver(() => drawWaveform(canvas, samples, start, end, duration));
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [duration, end, samples, start]);

  function updateSelection(nextStart: number, nextEnd: number) {
    onStartChange(roundToTenth(nextStart));
    onEndChange(roundToTenth(nextEnd));
  }

  function beginDrag(
    event: ReactPointerEvent<HTMLDivElement>,
    mode: "move" | "resize-end" | "resize-start",
  ) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { end, mode, pointerX: event.clientX, start };
  }

  function moveSelection(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const bounds = cropTrackRef.current?.getBoundingClientRect();
    if (!drag || !bounds || !duration) return;

    const delta = ((event.clientX - drag.pointerX) / bounds.width) * duration;
    const selectedLength = drag.end - drag.start;

    if (drag.mode === "move") {
      const nextStart = clamp(drag.start + delta, 0, duration - selectedLength);
      updateSelection(nextStart, nextStart + selectedLength);
      return;
    }

    if (drag.mode === "resize-start") {
      updateSelection(
        clamp(drag.start + delta, Math.max(0, drag.end - MAX_VOICE_SAMPLE_SECONDS), drag.end - MIN_VOICE_SAMPLE_SECONDS),
        drag.end,
      );
      return;
    }

    updateSelection(
      drag.start,
      clamp(drag.end + delta, drag.start + MIN_VOICE_SAMPLE_SECONDS, Math.min(duration, drag.start + MAX_VOICE_SAMPLE_SECONDS)),
    );
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
  }

  async function togglePreview() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      return;
    }
    audio.currentTime = start;
    await audio.play();
  }

  const startPercent = duration ? (start / duration) * 100 : 0;
  const endPercent = duration ? (end / duration) * 100 : 100;
  const selectionWidth = Math.max(0, endPercent - startPercent);
  const selectionIsValid = end - start >= MIN_VOICE_SAMPLE_SECONDS;

  return (
    <section className="rounded-xl border border-[#33292c] bg-[#1f1d1f] p-4 text-white shadow-[0_16px_34px_rgba(49,27,30,0.22)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Scissors className="size-4 text-[#ff419c]" /> Trim your best take
        </div>
        <span className="rounded-full bg-[#302c30] px-2.5 py-1 text-xs font-bold text-[#ff70b3] shadow-sm">
          {formatTime(end - start)} selected
        </span>
      </div>
      <p className="mt-1 text-xs leading-5 text-white/58">
        Choose a clean {MIN_VOICE_SAMPLE_SECONDS}-{MAX_VOICE_SAMPLE_SECONDS} second section. We will create and upload a new trimmed audio file from this selection.
      </p>

      <div
        ref={cropTrackRef}
        className="relative mt-4 touch-none select-none"
        onPointerMove={moveSelection}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="relative h-7 overflow-hidden rounded-lg bg-[repeating-linear-gradient(-45deg,#2d2b2e_0,#2d2b2e_5px,#242225_5px,#242225_10px)]">
          <span className="absolute left-0 top-0 flex h-full items-center pl-3 text-[11px] font-black tracking-[0.14em] text-white/55">
            REMOVE
          </span>
          <span className="absolute right-0 top-0 flex h-full items-center pr-3 text-[11px] font-black tracking-[0.14em] text-white/55">
            REMOVE
          </span>
          <div
            className="absolute top-0 h-full rounded-md bg-[#ff419c] shadow-[0_5px_14px_rgba(255,65,156,0.35)]"
            style={{ left: `${startPercent}%`, width: `${selectionWidth}%` }}
          >
            <div
              aria-label="Move kept audio selection"
              className="absolute inset-y-0 left-3 right-3 flex cursor-grab items-center justify-center text-[11px] font-black tracking-[0.14em] text-white active:cursor-grabbing"
              onPointerDown={(event) => beginDrag(event, "move")}
            >
              KEEP
            </div>
            <div
              aria-label="Adjust clip start"
              className="absolute inset-y-0 -left-2 w-5 cursor-ew-resize"
              onPointerDown={(event) => beginDrag(event, "resize-start")}
            >
              <span className="absolute left-1/2 top-1/2 h-3 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90" />
            </div>
            <div
              aria-label="Adjust clip end"
              className="absolute inset-y-0 -right-2 w-5 cursor-ew-resize"
              onPointerDown={(event) => beginDrag(event, "resize-end")}
            >
              <span className="absolute left-1/2 top-1/2 h-3 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90" />
            </div>
          </div>
        </div>

        <div className="relative mt-1 overflow-hidden rounded-[22px] border border-white/20 bg-[#242225] p-1">
          <canvas ref={canvasRef} className="h-28 w-full rounded-[18px]" aria-label="Audio waveform with selected clip" />
          <div
            className="pointer-events-none absolute bottom-1 top-1 rounded-[18px] border-2 border-[#ff419c] bg-[#ff419c]/[0.08]"
            style={{ left: `calc(${startPercent}% + 4px)`, width: `calc(${selectionWidth}% - 8px)` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-white/[0.06] px-3 py-2.5 text-sm">
        <span className="text-white/55">Keep</span>
        <span className={selectionIsValid ? "font-bold tabular-nums text-white" : "font-bold tabular-nums text-[#ff879a]"}>
          {formatTime(start)} - {formatTime(end)}
        </span>
        <span className="text-xs font-semibold text-white/45">{formatTime(end - start)}</span>
      </div>

      <audio
        ref={audioRef}
        src={url}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onTimeUpdate={(event) => {
          if (event.currentTarget.currentTime >= end) {
            event.currentTarget.pause();
            event.currentTarget.currentTime = start;
          }
        }}
      />
      <Button className="mt-4 gap-2 border-white/20 bg-white/[0.06] text-white hover:bg-white/[0.12] hover:text-white" size="sm" type="button" variant="outline" onClick={() => void togglePreview()}>
        {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
        {isPlaying ? "Pause selection" : "Preview selection"}
      </Button>
    </section>
  );
}

type RecordingSpectrumProps = { active: boolean; analyser: AnalyserNode | null };

export function RecordingSpectrum({ active, analyser }: RecordingSpectrumProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active || !analyser) return;

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
      analyser.getByteFrequencyData(data);
      context.clearRect(0, 0, bounds.width, bounds.height);
      const count = 36;
      const step = Math.max(1, Math.floor(data.length / count));
      const barWidth = (bounds.width - (count - 1) * 3) / count;
      for (let index = 0; index < count; index += 1) {
        const level = data[index * step] / 255;
        const barHeight = Math.max(5, level * (bounds.height - 8));
        const x = index * (barWidth + 3);
        context.fillStyle = `rgba(232, 67, 53, ${0.45 + level * 0.55})`;
        context.fillRect(x, (bounds.height - barHeight) / 2, barWidth, barHeight);
      }
      frame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frame);
  }, [active, analyser]);

  if (!active) return null;

  return (
    <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-destructive">
        <span className="size-2 animate-pulse rounded-full bg-destructive" /> Recording live
      </div>
      <canvas ref={canvasRef} className="h-12 w-full" aria-label="Live recording audio spectrum" />
    </div>
  );
}
