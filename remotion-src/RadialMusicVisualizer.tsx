import {
  AbsoluteFill,
  Audio,
  Composition,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_MINIMAL_VINYL_BACKGROUND_OVERLAY,
  DEFAULT_LYRICS_STYLE,
  normalizeMinimalVinylBackgroundOverlayConfig,
  normalizeLyricsStyleConfig,
  type LyricsStyleConfig,
  type MinimalVinylBackgroundOverlayConfig,
} from "../lib/music-video/photo-slideshow";

export type RadialVisualizerProps = {
  audioSrc: string;
  backgroundBlur?: number;
  backgroundOverlay?: MinimalVinylBackgroundOverlayConfig;
  backgroundImageSrc?: string | null;
  baseRadius?: number;
  coverImageSrc?: string | null;
  density?: number;
  glowColor?: string;
  lyricCues?: Array<{
    end: number;
    id: string;
    start: number;
    text: string;
  }>;
  lyricsStyle?: LyricsStyleConfig;
  maxBarHeight?: number;
  title?: string;
};

const DEFAULT_BASE_RADIUS = 120;
const DEFAULT_DENSITY = 128;
const DEFAULT_GLOW_COLOR = "#5ee7ff";
const DEFAULT_MAX_BAR_HEIGHT = 80;
const HIGH_FREQUENCY_RENDER_RATIO = 0.65;
const BASS_FREQUENCY_RATIO = 0.15;
const BASS_PULSE_FACTOR = 25;
const RECORD_ROTATION_DEGREES_PER_FRAME = 1.08;
const COVER_LABEL_RADIUS_RATIO = 0.43;
const NEON_BASS_CYAN = "#00f0ff";
const NEON_BASS_VIOLET = "#7000ff";
const NEON_MID_AURORA = "#39ff88";
const NEON_TIP_MAGENTA = "#ff007f";
const NEON_TIP_YELLOW = "#ffee00";

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const parsed = Number.parseInt(normalized, 16);

  return {
    b: parsed & 255,
    g: (parsed >> 8) & 255,
    r: (parsed >> 16) & 255,
  };
}

function rgba(hex: string, alpha: number) {
  const { b, g, r } = hexToRgb(hex);

  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha)})`;
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function isPowerOfTwo(value: number) {
  return Number.isInteger(value) && value > 0 && (value & (value - 1)) === 0;
}

function normalizeDensity(density: number | undefined) {
  if (!density || !isPowerOfTwo(density)) return DEFAULT_DENSITY;

  return Math.min(Math.max(density, 32), 512);
}

function normalizeTitle(title: string | undefined) {
  const words = (title ?? "Beat Core")
    .replace(/[^\w\s'-]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return ["BEAT", "CORE"];
  if (words.length === 1) return [words[0].slice(0, 8).toUpperCase()];

  return words.slice(0, 2).map((word) => word.slice(0, 8).toUpperCase());
}

function findActiveLyricCue({
  currentTime,
  lyricCues,
}: {
  currentTime: number;
  lyricCues: NonNullable<RadialVisualizerProps["lyricCues"]>;
}) {
  return (
    lyricCues.find(
      (cue) => currentTime >= cue.start && currentTime < cue.end,
    ) ?? null
  );
}

function getVisibleLyricLines({
  activeCue,
  lyricCues,
  title,
}: {
  activeCue: ReturnType<typeof findActiveLyricCue>;
  lyricCues: NonNullable<RadialVisualizerProps["lyricCues"]>;
  title?: string;
}) {
  const fallbackTitle = title?.trim();

  if (!activeCue && fallbackTitle) {
    const titleCue = {
      end: Number.POSITIVE_INFINITY,
      id: "song-title",
      start: 0,
      text: fallbackTitle,
    };

    return {
      activeIndex: 0,
      lines: [
        {
          cue: titleCue,
          index: 0,
        },
      ],
      start: 0,
    };
  }

  const activeIndex = activeCue
    ? Math.max(
        0,
        lyricCues.findIndex((cue) => cue.id === activeCue.id),
      )
    : 0;
  const start = Math.max(0, activeIndex - 1);

  return {
    activeIndex,
    lines: lyricCues.slice(start, start + 4).map((cue, index) => ({
      cue,
      index: start + index,
    })),
    start,
  };
}

function drawLabelText({
  context,
  labelLines,
  radius,
}: {
  context: CanvasRenderingContext2D;
  labelLines: string[];
  radius: number;
}) {
  context.fillStyle = "#ffffff";
  context.font = `900 ${Math.max(16, radius * 0.16)}px Arial, sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.shadowBlur = 8;
  context.shadowColor = "rgba(0,0,0,0.5)";
  labelLines.forEach((line, index) => {
    const offset = (index - (labelLines.length - 1) / 2) * radius * 0.16;
    context.fillText(line, 0, offset);
  });
}

function createMirroredFrequencies(frequencies: number[], density: number) {
  const usableCount = Math.max(
    2,
    Math.floor(frequencies.length * HIGH_FREQUENCY_RENDER_RATIO),
  );
  const usableFrequencies = frequencies.slice(0, usableCount);
  const halfDensity = density / 2;

  const half = Array.from({ length: halfDensity }, (_, index) => {
    const sourceIndex = Math.min(
      usableFrequencies.length - 1,
      Math.floor((index / halfDensity) * usableFrequencies.length),
    );

    return clamp(usableFrequencies[sourceIndex] ?? 0);
  });

  return [...half, ...half.slice().reverse()];
}

function fitVisualizerToFrame({
  baseRadius,
  maxBarHeight,
  shortSide,
}: {
  baseRadius: number;
  maxBarHeight: number;
  shortSide: number;
}) {
  const outerLimit = shortSide * 0.46;
  const requestedOuter = baseRadius + maxBarHeight * 1.36;
  const scale = requestedOuter > outerLimit ? outerLimit / requestedOuter : 1;

  return {
    radius: baseRadius * scale,
    barHeight: maxBarHeight * scale,
  };
}

function getCoverFillRect({
  imageHeight,
  imageWidth,
  targetHeight,
  targetWidth,
}: {
  imageHeight: number;
  imageWidth: number;
  targetHeight: number;
  targetWidth: number;
}) {
  const imageRatio = imageWidth / imageHeight;
  const targetRatio = targetWidth / targetHeight;
  const drawHeight =
    imageRatio > targetRatio ? targetHeight : targetWidth / imageRatio;
  const drawWidth =
    imageRatio > targetRatio ? targetHeight * imageRatio : targetWidth;

  return {
    height: drawHeight,
    width: drawWidth,
    x: (targetWidth - drawWidth) / 2,
    y: (targetHeight - drawHeight) / 2,
  };
}

function drawBackground(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  backgroundBlur = 42,
  backgroundOverlay: MinimalVinylBackgroundOverlayConfig = DEFAULT_MINIMAL_VINYL_BACKGROUND_OVERLAY,
  backgroundImage?: HTMLImageElement | null,
) {
  if (backgroundImage?.complete && backgroundImage.naturalWidth > 0) {
    const backgroundRect = getCoverFillRect({
      imageHeight: backgroundImage.naturalHeight,
      imageWidth: backgroundImage.naturalWidth,
      targetHeight: height,
      targetWidth: width,
    });

    context.save();
    context.filter = `blur(${backgroundBlur}px) saturate(1.55) brightness(0.78)`;
    context.drawImage(
      backgroundImage,
      backgroundRect.x - 54,
      backgroundRect.y - 54,
      backgroundRect.width + 108,
      backgroundRect.height + 108,
    );
    context.globalAlpha = 0.46;
    context.filter = `blur(${Math.max(8, backgroundBlur * 0.43)}px) saturate(1.35) brightness(0.82)`;
    context.drawImage(
      backgroundImage,
      backgroundRect.x - 20,
      backgroundRect.y - 20,
      backgroundRect.width + 40,
      backgroundRect.height + 40,
    );
    context.restore();
  } else {
    context.fillStyle = "#070a10";
    context.fillRect(0, 0, width, height);
  }

  const glow = context.createRadialGradient(
    width * 0.48,
    height * 0.48,
    0,
    width * 0.48,
    height * 0.48,
    Math.min(width, height) * 0.7,
  );
  glow.addColorStop(0, "rgba(22, 40, 52, 0.22)");
  glow.addColorStop(0.45, "rgba(8, 14, 22, 0.38)");
  glow.addColorStop(1, "rgba(2, 4, 8, 0.72)");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  const shade = context.createLinearGradient(0, 0, 0, height);
  shade.addColorStop(
    0,
    rgba(backgroundOverlay.color, backgroundOverlay.opacity * 0.41),
  );
  shade.addColorStop(
    0.58,
    rgba(backgroundOverlay.color, backgroundOverlay.opacity * 0.31),
  );
  shade.addColorStop(
    1,
    rgba(backgroundOverlay.color, backgroundOverlay.opacity),
  );
  context.fillStyle = shade;
  context.fillRect(0, 0, width, height);
}

function drawLyricsPanel({
  activeCue,
  activeIndex,
  context,
  currentTime,
  frame,
  fps,
  height,
  lines,
  lyricsStyle,
  start,
  width,
}: {
  activeCue: ReturnType<typeof findActiveLyricCue>;
  activeIndex: number;
  context: CanvasRenderingContext2D;
  currentTime: number;
  frame: number;
  fps: number;
  height: number;
  lines: ReturnType<typeof getVisibleLyricLines>["lines"];
  lyricsStyle: LyricsStyleConfig;
  start: number;
  width: number;
}) {
  const positionY =
    lyricsStyle.position === "top"
      ? height * 0.1
      : lyricsStyle.position === "center"
        ? height * 0.62
        : height * 0.72;
  const panelWidth = width * 0.82;
  const panelHeight = height * 0.23;
  const panelX = (width - panelWidth) / 2;
  const panelY = Math.min(
    height - panelHeight - height * 0.04,
    Math.max(height * 0.04, positionY),
  );

  context.save();
  context.beginPath();
  context.rect(panelX + 30, panelY + 12, panelWidth - 60, panelHeight - 24);
  context.clip();

  const lineHeight = panelHeight * 0.25;
  const activeProgress = activeCue
    ? clamp(
        (currentTime - activeCue.start) /
          Math.max(0.001, activeCue.end - activeCue.start),
      )
    : 0;
  const scrollY =
    panelY +
    panelHeight * 0.48 -
    (activeIndex - start) * lineHeight -
    activeProgress * lineHeight * 0.18;

  lines.forEach(({ cue, index }) => {
    const distance = Math.abs(index - activeIndex);
    const isActive = index === activeIndex;
    const y = scrollY + (index - start) * lineHeight;
    const cueStartFrame = cue.start * fps;
    const cueEndFrame = cue.end * fps;
    const hasFiniteEndFrame = Number.isFinite(cueEndFrame);
    const inProgress = interpolate(
      frame,
      [cueStartFrame, cueStartFrame + fps * 0.34],
      [0, 1],
      {
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    );
    const outProgress = hasFiniteEndFrame
      ? interpolate(frame, [cueEndFrame - fps * 0.28, cueEndFrame], [0, 1], {
          easing: Easing.bezier(0.7, 0, 0.84, 0),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;
    const activeOpacity = clamp(inProgress * (1 - outProgress));
    const entranceOffset =
      lyricsStyle.entrance === "staggered-glow-reveal"
        ? (1 - inProgress) * 8
        : lyricsStyle.entrance === "rolling-flow"
          ? 0
          : (1 - inProgress) * 18 - outProgress * 12;
    const blur =
      lyricsStyle.entrance === "motion-blur-slip" && isActive
        ? (1 - inProgress) * 8 + outProgress * 6
        : 0;
    const baseOpacity = isActive
      ? Math.max(0, activeOpacity)
      : distance > 1
        ? 0.22
        : 0.42;

    context.globalAlpha = baseOpacity;
    context.fillStyle = isActive ? lyricsStyle.color : "rgba(221,241,248,0.78)";
    context.font = `${isActive ? 900 : 800} ${Math.max(
      22,
      Math.min(lyricsStyle.fontSize, panelHeight * (isActive ? 0.2 : 0.14)),
    )}px ${lyricsStyle.fontFamily}`;
    context.shadowBlur = isActive ? 18 : 0;
    context.shadowColor = "rgba(94,231,255,0.44)";
    context.filter = blur ? `blur(${blur}px)` : "none";

    if (isActive && lyricsStyle.strokeWidth > 0) {
      context.lineWidth = lyricsStyle.strokeWidth * 2;
      context.strokeStyle = lyricsStyle.strokeColor;
      context.strokeText(
        cue.text,
        panelX + 34,
        y + entranceOffset,
        panelWidth - 68,
      );
    }

    context.fillText(
      cue.text,
      panelX + 34,
      y + entranceOffset,
      panelWidth - 68,
    );
    context.globalAlpha = 1;
    context.filter = "none";
  });

  context.restore();
}

function drawVisualizerBars({
  bars,
  centerX,
  centerY,
  context,
  glowColor,
  maxBarHeight,
  pulseRadius,
}: {
  bars: number[];
  centerX: number;
  centerY: number;
  context: CanvasRenderingContext2D;
  glowColor: string;
  maxBarHeight: number;
  pulseRadius: number;
}) {
  context.save();
  context.lineCap = "round";
  context.lineWidth = Math.max(5, pulseRadius * 0.035);

  bars.forEach((value, index) => {
    const shapedEnergy = Math.pow(clamp(value * 1.35), 0.72);
    const theta = (index / bars.length) * Math.PI * 2 - Math.PI / 2;
    const barHeight = Math.max(10, shapedEnergy * maxBarHeight);
    const startRadius = pulseRadius + 10;
    const endRadius = pulseRadius + 10 + barHeight;
    const startX = centerX + Math.cos(theta) * startRadius;
    const startY = centerY + Math.sin(theta) * startRadius;
    const endX = centerX + Math.cos(theta) * endRadius;
    const endY = centerY + Math.sin(theta) * endRadius;
    const opacity = 0.3 + shapedEnergy * 0.7;
    const halfLength = Math.max(1, bars.length / 2 - 1);
    const frequencyPosition =
      index < bars.length / 2
        ? index / halfLength
        : (bars.length - 1 - index) / halfLength;
    const lowColor =
      frequencyPosition < 0.42 ? NEON_BASS_CYAN : NEON_BASS_VIOLET;
    const tipColor =
      frequencyPosition > 0.76 ? NEON_TIP_YELLOW : NEON_TIP_MAGENTA;
    const barGradient = context.createLinearGradient(
      startX,
      startY,
      endX,
      endY,
    );

    barGradient.addColorStop(0, rgba(lowColor, opacity * 0.82));
    barGradient.addColorStop(0.52, rgba(NEON_MID_AURORA, opacity * 0.9));
    barGradient.addColorStop(1, rgba(tipColor, opacity));

    context.shadowBlur = Math.max(
      12,
      maxBarHeight * (0.2 + shapedEnergy * 0.42),
    );
    context.shadowColor =
      shapedEnergy > 0.72 ? rgba(tipColor, opacity) : glowColor;

    context.beginPath();
    context.strokeStyle = barGradient;
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();
  });

  context.restore();
}

function drawRecord({
  angle,
  centerX,
  centerY,
  context,
  coverImage,
  radius,
  title,
}: {
  angle: number;
  centerX: number;
  centerY: number;
  context: CanvasRenderingContext2D;
  coverImage?: HTMLImageElement | null;
  radius: number;
  title: string | undefined;
}) {
  const labelLines = normalizeTitle(title);

  context.save();
  context.translate(centerX, centerY);
  context.rotate(angle);

  const recordGradient = context.createRadialGradient(
    0,
    0,
    radius * 0.05,
    0,
    0,
    radius,
  );
  recordGradient.addColorStop(0, "#31363a");
  recordGradient.addColorStop(0.18, "#11161a");
  recordGradient.addColorStop(0.76, "#1a2024");
  recordGradient.addColorStop(1, "#080b0f");

  context.beginPath();
  context.arc(0, 0, radius, 0, Math.PI * 2);
  context.fillStyle = recordGradient;
  context.shadowBlur = radius * 0.16;
  context.shadowColor = "rgba(0,0,0,0.7)";
  context.fill();

  context.shadowBlur = 0;
  context.strokeStyle = "rgba(255,255,255,0.05)";
  context.lineWidth = Math.max(1, radius * 0.008);
  for (let ring = radius * 0.2; ring < radius * 0.92; ring += radius * 0.075) {
    context.beginPath();
    context.arc(0, 0, ring, 0, Math.PI * 2);
    context.stroke();
  }

  if (coverImage?.complete && coverImage.naturalWidth > 0) {
    context.save();
    try {
      context.beginPath();
      context.arc(0, 0, radius * COVER_LABEL_RADIUS_RATIO, 0, Math.PI * 2);
      context.clip();
      context.drawImage(
        coverImage,
        -radius * COVER_LABEL_RADIUS_RATIO,
        -radius * COVER_LABEL_RADIUS_RATIO,
        radius * COVER_LABEL_RADIUS_RATIO * 2,
        radius * COVER_LABEL_RADIUS_RATIO * 2,
      );
    } catch {
      drawDefaultRecordLabel({ context, radius });
      drawLabelText({ context, labelLines, radius });
    } finally {
      context.restore();
    }
  } else {
    drawDefaultRecordLabel({ context, radius });
    drawLabelText({ context, labelLines, radius });
  }

  context.shadowBlur = 0;
  context.beginPath();
  context.arc(0, 0, radius * 0.07, 0, Math.PI * 2);
  context.fillStyle = "#05070a";
  context.fill();

  context.restore();
}

function drawDefaultRecordLabel({
  context,
  radius,
}: {
  context: CanvasRenderingContext2D;
  radius: number;
}) {
  context.beginPath();
  context.arc(0, 0, radius * COVER_LABEL_RADIUS_RATIO, 0, Math.PI * 2);
  const labelGradient = context.createLinearGradient(
    -radius * COVER_LABEL_RADIUS_RATIO,
    -radius * COVER_LABEL_RADIUS_RATIO,
    radius * COVER_LABEL_RADIUS_RATIO,
    radius * COVER_LABEL_RADIUS_RATIO,
  );
  labelGradient.addColorStop(0, "#65e8ce");
  labelGradient.addColorStop(1, "#39a8f2");
  context.fillStyle = labelGradient;
  context.fill();
}

function drawLoadingState({
  backgroundBlur = 42,
  backgroundImage,
  backgroundOverlay,
  centerX,
  centerY,
  context,
  coverImage,
  frame,
  height,
  radius,
  title,
  width,
}: {
  backgroundBlur?: number;
  backgroundImage?: HTMLImageElement | null;
  backgroundOverlay?: MinimalVinylBackgroundOverlayConfig;
  centerX: number;
  centerY: number;
  context: CanvasRenderingContext2D;
  coverImage?: HTMLImageElement | null;
  frame: number;
  height: number;
  radius: number;
  title?: string;
  width: number;
}) {
  drawBackground(
    context,
    width,
    height,
    backgroundBlur,
    backgroundOverlay,
    backgroundImage ?? coverImage,
  );
  drawRecord({
    angle: frame * 0.01,
    centerX,
    centerY,
    context,
    coverImage,
    radius,
    title,
  });

  context.fillStyle = "rgba(230, 246, 255, 0.72)";
  context.font = `700 ${Math.max(18, radius * 0.12)}px Arial, sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("Loading audio...", centerX, centerY + radius * 1.48);
}

export function RadialVisualizer({
  audioSrc,
  backgroundBlur = 42,
  backgroundOverlay = DEFAULT_MINIMAL_VINYL_BACKGROUND_OVERLAY,
  backgroundImageSrc = null,
  baseRadius = DEFAULT_BASE_RADIUS,
  coverImageSrc = null,
  density = DEFAULT_DENSITY,
  glowColor = DEFAULT_GLOW_COLOR,
  lyricCues = [],
  lyricsStyle = DEFAULT_LYRICS_STYLE,
  maxBarHeight = DEFAULT_MAX_BAR_HEIGHT,
  title,
}: RadialVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundImageRef = useRef<HTMLImageElement>(null);
  const coverImageRef = useRef<HTMLImageElement>(null);
  const [loadedImageVersion, setLoadedImageVersion] = useState(0);
  const frame = useCurrentFrame();
  const { fps, height, width } = useVideoConfig();
  const audioData = useAudioData(audioSrc);
  const safeDensity = normalizeDensity(density);
  const normalizedLyricsStyle = normalizeLyricsStyleConfig(lyricsStyle);
  const normalizedBackgroundOverlay =
    normalizeMinimalVinylBackgroundOverlayConfig(backgroundOverlay);
  const shortSide = Math.min(width, height);
  const fitted = fitVisualizerToFrame({
    baseRadius,
    maxBarHeight,
    shortSide,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    canvas.width = width;
    canvas.height = height;

    const centerX = width / 2;
    const centerY = height * 0.39;
    const rotationAngle =
      frame * RECORD_ROTATION_DEGREES_PER_FRAME * (Math.PI / 180);
    const currentTime = frame / fps;
    const activeCue = findActiveLyricCue({ currentTime, lyricCues });
    const visibleLyrics = getVisibleLyricLines({ activeCue, lyricCues, title });

    if (!audioData) {
      drawLoadingState({
        centerX,
        centerY,
        context,
        backgroundBlur,
        backgroundImage: backgroundImageRef.current ?? coverImageRef.current,
        backgroundOverlay: normalizedBackgroundOverlay,
        frame,
        height,
        radius: fitted.radius,
        title,
        width,
      });
      drawLyricsPanel({
        activeCue,
        activeIndex: visibleLyrics.activeIndex,
        context,
        currentTime,
        frame,
        fps,
        height,
        lines: visibleLyrics.lines,
        lyricsStyle: normalizedLyricsStyle,
        start: visibleLyrics.start,
        width,
      });
      return;
    }

    const frequencies = visualizeAudio({
      audioData,
      fps,
      frame,
      numberOfSamples: safeDensity,
      optimizeFor: "speed",
      smoothing: true,
    });
    const bassSampleCount = Math.max(
      1,
      Math.floor(frequencies.length * BASS_FREQUENCY_RATIO),
    );
    const bassEnergy = average(frequencies.slice(0, bassSampleCount));
    const pulseRadius = fitted.radius + clamp(bassEnergy) * BASS_PULSE_FACTOR;
    const mirroredBars = createMirroredFrequencies(frequencies, safeDensity);

    drawBackground(
      context,
      width,
      height,
      backgroundBlur,
      normalizedBackgroundOverlay,
      backgroundImageRef.current ?? coverImageRef.current,
    );
    drawVisualizerBars({
      bars: mirroredBars,
      centerX,
      centerY,
      context,
      glowColor,
      maxBarHeight: fitted.barHeight,
      pulseRadius,
    });
    drawRecord({
      angle: rotationAngle,
      centerX,
      centerY,
      context,
      coverImage: coverImageRef.current,
      radius: pulseRadius,
      title,
    });
    drawLyricsPanel({
      activeCue,
      activeIndex: visibleLyrics.activeIndex,
      context,
      currentTime,
      frame,
      fps,
      height,
      lines: visibleLyrics.lines,
      lyricsStyle: normalizedLyricsStyle,
      start: visibleLyrics.start,
      width,
    });
  }, [
    audioData,
    fitted.barHeight,
    fitted.radius,
    fps,
    frame,
    glowColor,
    height,
    lyricCues,
    normalizedLyricsStyle,
    safeDensity,
    title,
    width,
    backgroundBlur,
    normalizedBackgroundOverlay,
    loadedImageVersion,
  ]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#070a10" }}>
      <Audio src={audioSrc} />
      {backgroundImageSrc ? (
        <img
          ref={backgroundImageRef}
          alt=""
          src={backgroundImageSrc}
          style={{ display: "none" }}
          onLoad={() => setLoadedImageVersion((version) => version + 1)}
        />
      ) : null}
      {coverImageSrc ? (
        <img
          ref={coverImageRef}
          alt=""
          crossOrigin="anonymous"
          src={coverImageSrc}
          style={{ display: "none" }}
          onLoad={() => setLoadedImageVersion((version) => version + 1)}
        />
      ) : null}
      <canvas
        ref={canvasRef}
        height={height}
        width={width}
        style={{
          display: "block",
          height: "100%",
          width: "100%",
        }}
      />
    </AbsoluteFill>
  );
}

export function MainVideo() {
  return (
    <Composition
      component={RadialVisualizer}
      defaultProps={{
        audioSrc: staticFile("audio.mp3"),
        baseRadius: 180,
        density: 128,
        glowColor: DEFAULT_GLOW_COLOR,
        maxBarHeight: 120,
        title: "Beat Core",
      }}
      durationInFrames={30 * 30}
      fps={30}
      height={1080}
      id="RadialMusicVisualizer"
      width={1080}
    />
  );
}
