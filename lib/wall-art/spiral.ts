export type SpiralPathInput = {
  center: number;
  innerRadius: number;
  outerRadius: number;
  turns?: number;
  pointsPerTurn?: number;
  direction?: "inward" | "outward";
};

export type SpiralInnerRadiusInput = {
  centerRadius: number;
  lyricFontSize: number;
  gap?: number;
};

export type SpiralTextCapacityInput = {
  innerRadius: number;
  outerRadius: number;
  turns: number;
  fontSize: number;
  characterWidthRatio?: number;
};

export type SpiralTurnsInput = {
  innerRadius: number;
  outerRadius: number;
  fontSize: number;
  lineHeightRatio?: number;
  minTurns?: number;
  maxTurns?: number;
};

export type WallArtColorPreset = {
  name: string;
  posterBackground: string;
  discColor: string;
  lyricColor: string;
  titleColor: string;
};

export type PrintSizePreset = {
  id: string;
  label: string;
  widthCm: number;
  heightCm: number;
  widthIn?: number;
  heightIn?: number;
};

export type PrintPixelSizeInput = {
  widthCm?: number;
  heightCm?: number;
  widthIn?: number;
  heightIn?: number;
  dpi?: number;
};

export type WallArtPrintTransformInput = {
  baseWidth: number;
  baseHeight: number;
  contentScale: number;
  offsetX: number;
  offsetY: number;
};

export type WallArtQrCodePlacementInput = {
  baseWidth: number;
  baseHeight: number;
  frameWidth: number;
  qrCodeSize: number;
  margin?: number;
};

export type WallArtQrCodePlacement = {
  defaultX: number;
  defaultY: number;
  minOffsetX: number;
  maxOffsetX: number;
  minOffsetY: number;
  maxOffsetY: number;
};

export const printSizePresets: PrintSizePreset[] = [
  { id: "a4", label: "A4 21x29.7cm", widthCm: 21, heightCm: 29.7 },
  {
    id: "8x10",
    label: '8"x10" / 20x25cm',
    widthCm: 20,
    heightCm: 25,
    widthIn: 8,
    heightIn: 10,
  },
  {
    id: "11x14",
    label: '11"x14" / 27x35cm',
    widthCm: 27,
    heightCm: 35,
    widthIn: 11,
    heightIn: 14,
  },
  {
    id: "12x16",
    label: '12"x16" / 30x40cm',
    widthCm: 30,
    heightCm: 40,
    widthIn: 12,
    heightIn: 16,
  },
  {
    id: "16x20",
    label: '16"x20" / 40x50cm',
    widthCm: 40,
    heightCm: 50,
    widthIn: 16,
    heightIn: 20,
  },
  {
    id: "18x24",
    label: '18"x24" / 45x60cm',
    widthCm: 45,
    heightCm: 60,
    widthIn: 18,
    heightIn: 24,
  },
  {
    id: "20x28",
    label: '20"x28" / 50x70cm',
    widthCm: 50,
    heightCm: 70,
    widthIn: 20,
    heightIn: 28,
  },
  {
    id: "24x32",
    label: '24"x32" / 60x80cm',
    widthCm: 60,
    heightCm: 80,
    widthIn: 24,
    heightIn: 32,
  },
  {
    id: "24x36",
    label: '24"x36" / 60x90cm',
    widthCm: 60,
    heightCm: 90,
    widthIn: 24,
    heightIn: 36,
  },
  {
    id: "28x40",
    label: '28"x40" / 70x100cm',
    widthCm: 70,
    heightCm: 100,
    widthIn: 28,
    heightIn: 40,
  },
  { id: "a3", label: "A3 29.7x42cm", widthCm: 29.7, heightCm: 42 },
  { id: "a2", label: "A2 42x59.4cm", widthCm: 42, heightCm: 59.4 },
  { id: "a1", label: "A1 59.4x84.1cm", widthCm: 59.4, heightCm: 84.1 },
];

export function calculatePrintPixelSize({
  widthCm,
  heightCm,
  widthIn,
  heightIn,
  dpi = 300,
}: PrintPixelSizeInput): { width: number; height: number } {
  const effectiveWidthIn = widthIn ?? (widthCm ?? 0) / 2.54;
  const effectiveHeightIn = heightIn ?? (heightCm ?? 0) / 2.54;

  return {
    width: Math.round(effectiveWidthIn * dpi),
    height: Math.round(effectiveHeightIn * dpi),
  };
}

export function buildWallArtPrintTransform({
  baseWidth,
  baseHeight,
  contentScale,
  offsetX,
  offsetY,
}: WallArtPrintTransformInput): string {
  const scaledWidth = baseWidth * contentScale;
  const scaledHeight = baseHeight * contentScale;
  const x = (baseWidth - scaledWidth) / 2 + offsetX;
  const y = (baseHeight - scaledHeight) / 2 + offsetY;

  return `translate(${Number(x.toFixed(3))} ${Number(y.toFixed(3))}) scale(${Number(contentScale.toFixed(3))})`;
}

export function calculateWallArtQrCodePlacement({
  baseWidth,
  baseHeight,
  frameWidth,
  qrCodeSize,
  margin = 32,
}: WallArtQrCodePlacementInput): WallArtQrCodePlacement {
  const safeMinX = frameWidth + margin;
  const safeMinY = frameWidth + margin;
  const safeMaxX = baseWidth - frameWidth - margin - qrCodeSize;
  const safeMaxY = baseHeight - frameWidth - margin - qrCodeSize;
  const defaultX = Math.max(safeMinX, safeMaxX);
  const defaultY = Math.max(safeMinY, safeMaxY);

  return {
    defaultX,
    defaultY,
    minOffsetX: safeMinX - defaultX,
    maxOffsetX: safeMaxX - defaultX,
    minOffsetY: safeMinY - defaultY,
    maxOffsetY: safeMaxY - defaultY,
  };
}

export const wallArtColorPresets: WallArtColorPreset[] = [
  {
    name: "Design 1",
    posterBackground: "#f3ead3",
    discColor: "#f04a25",
    lyricColor: "#24211d",
    titleColor: "#24211d",
  },
  {
    name: "Design 2",
    posterBackground: "#f3ead3",
    discColor: "#25357e",
    lyricColor: "#24211d",
    titleColor: "#24211d",
  },
  {
    name: "Design 3",
    posterBackground: "#f3ead3",
    discColor: "#586644",
    lyricColor: "#24211d",
    titleColor: "#24211d",
  },
  {
    name: "Design 4",
    posterBackground: "#f3ead3",
    discColor: "#c91842",
    lyricColor: "#24211d",
    titleColor: "#24211d",
  },
  {
    name: "Design 5",
    posterBackground: "#f3ead3",
    discColor: "#aa5142",
    lyricColor: "#24211d",
    titleColor: "#24211d",
  },
  {
    name: "Design 6",
    posterBackground: "#f3ead3",
    discColor: "#6aa5d7",
    lyricColor: "#24211d",
    titleColor: "#24211d",
  },
  {
    name: "Design 7",
    posterBackground: "#f3ead3",
    discColor: "#2f2d2a",
    lyricColor: "#24211d",
    titleColor: "#24211d",
  },
  {
    name: "Design 8",
    posterBackground: "#2f2d2a",
    discColor: "#f3ead3",
    lyricColor: "#d9d1c2",
    titleColor: "#f3ead3",
  },
  {
    name: "Design 9",
    posterBackground: "#c91842",
    discColor: "#f3ead3",
    lyricColor: "#f1d3d8",
    titleColor: "#f3ead3",
  },
  {
    name: "Design 10",
    posterBackground: "#654158",
    discColor: "#f3ead3",
    lyricColor: "#eadce2",
    titleColor: "#f3ead3",
  },
];

export const wallArtTemplate2ColorPresets: WallArtColorPreset[] = [
  {
    name: "Design 1",
    posterBackground: "#e2dfdb",
    discColor: "#010101",
    lyricColor: "#a8a6a4",
    titleColor: "#fbfaf7",
  },
  {
    name: "Design 2",
    posterBackground: "#7a7677",
    discColor: "#010101",
    lyricColor: "#aaa9a8",
    titleColor: "#fcfcfa",
  },
  {
    name: "Design 3",
    posterBackground: "#9d9894",
    discColor: "#010101",
    lyricColor: "#a7a7a4",
    titleColor: "#fbf9f3",
  },
  {
    name: "Design 4",
    posterBackground: "#bfb7ad",
    discColor: "#020202",
    lyricColor: "#a7a7a2",
    titleColor: "#fefcf5",
  },
  {
    name: "Design 5",
    posterBackground: "#b6ada2",
    discColor: "#020202",
    lyricColor: "#a7a7a2",
    titleColor: "#ede7df",
  },
  {
    name: "Design 6",
    posterBackground: "#282722",
    discColor: "#020202",
    lyricColor: "#a8a8a8",
    titleColor: "#f8f7f4",
  },
  {
    name: "Design 7",
    posterBackground: "#66708a",
    discColor: "#000000",
    lyricColor: "#a7a7a7",
    titleColor: "#f5ffff",
  },
  {
    name: "Design 8",
    posterBackground: "#a1b3c5",
    discColor: "#010101",
    lyricColor: "#a7a6a7",
    titleColor: "#fbfbff",
  },
  {
    name: "Design 9",
    posterBackground: "#97afd0",
    discColor: "#010101",
    lyricColor: "#a7a6a7",
    titleColor: "#f6fefe",
  },
  {
    name: "Design 10",
    posterBackground: "#d5dadd",
    discColor: "#010101",
    lyricColor: "#a5a7a7",
    titleColor: "#f4f7f9",
  },
  {
    name: "Design 11",
    posterBackground: "#899a9a",
    discColor: "#010101",
    lyricColor: "#a5aaa5",
    titleColor: "#eef9fa",
  },
  {
    name: "Design 12",
    posterBackground: "#69b3af",
    discColor: "#010101",
    lyricColor: "#a3a8a6",
    titleColor: "#edfdfe",
  },
  {
    name: "Design 13",
    posterBackground: "#78867f",
    discColor: "#010101",
    lyricColor: "#a7a7a7",
    titleColor: "#f7fcf8",
  },
  {
    name: "Design 14",
    posterBackground: "#85877a",
    discColor: "#010101",
    lyricColor: "#a7a7a8",
    titleColor: "#f5f6f2",
  },
  {
    name: "Design 15",
    posterBackground: "#bdc1bd",
    discColor: "#010101",
    lyricColor: "#a6a6a7",
    titleColor: "#fafcf8",
  },
];

export function calculateSpiralInnerRadius({
  centerRadius,
  lyricFontSize,
  gap = 10,
}: SpiralInnerRadiusInput): number {
  return Math.round(centerRadius + lyricFontSize / 2 + gap);
}

export function buildSpiralPath({
  center,
  innerRadius,
  outerRadius,
  turns = 8,
  pointsPerTurn = 36,
  direction = "inward",
}: SpiralPathInput): string {
  const safeTurns = Math.max(1, turns);
  const totalPoints = Math.max(8, Math.round(safeTurns * pointsPerTurn));
  const points: string[] = [];

  for (let index = 0; index <= totalPoints; index += 1) {
    const progress = index / totalPoints;
    const angle = progress * safeTurns * Math.PI * 2;
    const radius =
      direction === "outward"
        ? innerRadius + (outerRadius - innerRadius) * progress
        : outerRadius - (outerRadius - innerRadius) * progress;
    const x = center + Math.cos(angle) * radius;
    const y = center + Math.sin(angle) * radius;
    points.push(`${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  return points.join(" ");
}

export function cleanWallArtLyrics(lyrics: string): string {
  return lyrics
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => !/^\[[^\]]+\]$/.test(line))
    .filter((line) => !/^title\s*:/i.test(line))
    .filter(Boolean)
    .join("\n");
}

function normalizeLyricPhrase(lyrics: string): string {
  return cleanWallArtLyrics(lyrics).split(/\r?\n/).join(" ~ ");
}

export function calculateSpiralTurns({
  innerRadius,
  outerRadius,
  fontSize,
  lineHeightRatio = 1.8,
  minTurns = 3,
  maxTurns = 12,
}: SpiralTurnsInput): number {
  const radialSpan = Math.max(1, outerRadius - innerRadius);
  const rowPitch = Math.max(1, fontSize * lineHeightRatio);
  const turns = radialSpan / rowPitch;

  return Math.min(maxTurns, Math.max(minTurns, turns));
}

export function calculateSpiralTextCapacity({
  innerRadius,
  outerRadius,
  turns,
  fontSize,
  characterWidthRatio = 0.58,
}: SpiralTextCapacityInput): number {
  const safeFontSize = Math.max(1, fontSize);
  const safeTurns = Math.max(1, turns);
  const averageRadius = (innerRadius + outerRadius) / 2;
  const pathLength = Math.PI * 2 * averageRadius * safeTurns;
  const characterWidth = safeFontSize * characterWidthRatio;

  return Math.max(1, Math.floor(pathLength / characterWidth));
}

export function fitSpiralLyrics(lyrics: string, capacity: number): string {
  const safeCapacity = Math.max(1, Math.floor(capacity));
  const fallback = "Custom lyrics to any song, or any custom text can go here";
  const phrase = normalizeLyricPhrase(lyrics) || fallback;

  if (phrase.length === safeCapacity) return phrase;

  if (phrase.length > safeCapacity) {
    const sliced = phrase.slice(0, safeCapacity);
    const lastSeparator = sliced.lastIndexOf(" ~ ");
    const lastSpace = sliced.lastIndexOf(" ");
    const cutAt =
      lastSeparator > safeCapacity * 0.68
        ? lastSeparator
        : lastSpace > safeCapacity * 0.68
          ? lastSpace
          : sliced.length;

    return sliced.slice(0, cutAt);
  }

  let text = phrase;
  while (text.length < safeCapacity) {
    text = `${text} ~ ${phrase}`;
  }

  return text.slice(0, safeCapacity);
}

export type Template2LyricLinesInput = {
  targetWidth?: number;
  fontSize?: number;
  minLines?: number;
};

export type ShapeInterval = {
  x1: number;
  x2: number;
};

export type ShapeIntervalProvider = (y: number) => ShapeInterval[];

export type ShapeTextLayoutLine = {
  text: string;
  x: number;
  y: number;
  width: number;
  measuredWidth: number;
  fontSize: number;
  letterSpacing: number;
  textAnchor: "start" | "middle" | "end";
};

export type ShapeTextLayoutInput = {
  text: string;
  startY: number;
  endY: number;
  fontSize: number;
  intervalProvider: ShapeIntervalProvider;
  lineHeightRatio?: number;
  maxLetterSpacing?: number;
  textAnchor?: "start" | "middle" | "end";
};

export type HeartIntervalProviderInput = {
  centerX?: number;
  topY?: number;
  bottomY?: number;
  width?: number;
  heartSize?: number;
};

export type HeartPathInput = HeartIntervalProviderInput & {
  points?: number;
};

export function splitTemplate2TitleLines(title: string): [string, string] {
  const trimmed = title.trim();
  if (!trimmed) return ["Song", "Title"];

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    const midpoint = Math.ceil(words.length / 2);
    return [
      words.slice(0, midpoint).join(" "),
      words.slice(midpoint).join(" "),
    ];
  }

  const chars = Array.from(trimmed);
  if (chars.length <= 4) return [trimmed, ""];

  const midpoint = Math.ceil(chars.length / 2);
  return [chars.slice(0, midpoint).join(""), chars.slice(midpoint).join("")];
}

export function buildTemplate2LyricLines(
  lyrics: string,
  { targetWidth = 360, fontSize = 16, minLines = 15 }: Template2LyricLinesInput,
): string[] {
  const cleaned = cleanWallArtLyrics(lyrics)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const phrase =
    cleaned.join(" ") ||
    "Custom lyrics to any song, or any custom text can go here";
  const lines: string[] = [];
  const characters = Array.from(`${phrase} `);
  let cursor = 0;

  function measure(text: string): number {
    return Array.from(text).reduce((width, char) => {
      if (/\s/.test(char)) return width + fontSize * 0.34;
      if (/[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/.test(char)) {
        return width + fontSize;
      }
      if (/[A-Z0-9]/.test(char)) return width + fontSize * 0.66;
      if (/[a-z]/.test(char)) return width + fontSize * 0.56;
      return width + fontSize * 0.62;
    }, 0);
  }

  while (lines.length < minLines) {
    let current = "";

    while (characters.length > 0) {
      const char = characters[cursor % characters.length];
      const next = `${current}${char}`;

      if (measure(next) > targetWidth && current.trim()) {
        break;
      }

      current = next;
      cursor += 1;
    }

    if (!current.trim()) current = phrase.slice(0, 1);
    lines.push(current.trim());
  }

  return lines.slice(0, minLines);
}

function measureShapeText(text: string, fontSize: number): number {
  return Array.from(text).reduce((width, char) => {
    if (/\s/.test(char)) return width + fontSize * 0.34;
    if (/[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/.test(char)) {
      return width + fontSize;
    }
    if (/[A-Z0-9]/.test(char)) return width + fontSize * 0.66;
    if (/[a-z]/.test(char)) return width + fontSize * 0.56;
    return width + fontSize * 0.62;
  }, 0);
}

function normalizeShapeText(text: string): string {
  const cleaned = cleanWallArtLyrics(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ");

  return cleaned || "Custom lyrics to any song, or any custom text can go here";
}

export function buildShapeTextLayout({
  text,
  startY,
  endY,
  fontSize,
  intervalProvider,
  lineHeightRatio = 1.25,
  maxLetterSpacing = 2.4,
  textAnchor = "start",
}: ShapeTextLayoutInput): ShapeTextLayoutLine[] {
  const phrase = normalizeShapeText(text);
  const characters = Array.from(`${phrase} `);
  const safeFontSize = Math.max(1, fontSize);
  const rowPitch = Math.max(1, safeFontSize * lineHeightRatio);
  const layout: ShapeTextLayoutLine[] = [];
  let cursor = 0;

  for (let y = startY; y <= endY; y += rowPitch) {
    const intervals = intervalProvider(Math.round(y))
      .map((interval) => ({
        x1: Math.min(interval.x1, interval.x2),
        x2: Math.max(interval.x1, interval.x2),
      }))
      .filter((interval) => interval.x2 - interval.x1 >= safeFontSize * 0.8)
      .sort((left, right) => left.x1 - right.x1);

    for (const interval of intervals) {
      const intervalWidth = interval.x2 - interval.x1;
      let current = "";
      let measuredWidth = 0;
      let guard = 0;

      while (characters.length > 0 && guard < characters.length * 2) {
        const char = characters[cursor % characters.length];
        const next = `${current}${char}`;
        const nextWidth = measureShapeText(next.trimEnd(), safeFontSize);

        if (nextWidth > intervalWidth && current.trim()) {
          break;
        }

        current = next;
        measuredWidth = nextWidth;
        cursor += 1;
        guard += 1;

        if (nextWidth > intervalWidth) break;
      }

      const trimmed = current.trim();
      if (!trimmed) continue;

      measuredWidth = Math.min(
        measureShapeText(trimmed, safeFontSize),
        intervalWidth,
      );
      const stretchableGaps = Math.max(0, Array.from(trimmed).length - 1);
      const remaining = Math.max(0, intervalWidth - measuredWidth);
      const letterSpacing =
        stretchableGaps > 0
          ? Math.min(maxLetterSpacing, remaining / stretchableGaps)
          : 0;

      layout.push({
        text: trimmed,
        x:
          textAnchor === "middle"
            ? (interval.x1 + interval.x2) / 2
            : textAnchor === "end"
              ? interval.x2
              : interval.x1,
        y: Math.round(y),
        width: intervalWidth,
        measuredWidth,
        fontSize: safeFontSize,
        letterSpacing,
        textAnchor,
      });
    }
  }

  return layout;
}

export function createHeartIntervalProvider({
  centerX = 500,
  topY = 200,
  bottomY = 720,
  width = 600,
  heartSize = 1,
}: HeartIntervalProviderInput = {}): ShapeIntervalProvider {
  const safeScale = Math.max(0.2, heartSize);
  const safeWidth = Math.max(1, width) * safeScale;
  const height = Math.max(1, bottomY - topY) * safeScale;
  const scaledTopY = topY + (bottomY - topY - height) / 2;
  const normalizedTop = 1.32;
  const normalizedBottom = -1.32;
  const sampleCount = 720;
  const xMin = -1.45;
  const xMax = 1.45;
  const normalizeWidth = 2.41;

  return (y: number): ShapeInterval[] => {
    const progress = (y - scaledTopY) / height;
    if (progress < 0 || progress > 1) return [];
    const normalizedY =
      normalizedTop - (normalizedTop - normalizedBottom) * progress;
    const intervals: ShapeInterval[] = [];
    let runStart: number | null = null;

    function isInsideHeart(x: number): boolean {
      return (
        (x * x + normalizedY * normalizedY - 1) ** 3 -
          x * x * normalizedY ** 3 <=
        0
      );
    }

    function toCanvasX(normalizedX: number): number {
      return centerX + (normalizedX / normalizeWidth) * safeWidth;
    }

    for (let index = 0; index <= sampleCount; index += 1) {
      const x = xMin + ((xMax - xMin) * index) / sampleCount;
      const inside = isInsideHeart(x);

      if (inside && runStart === null) {
        runStart = x;
      }

      if ((!inside || index === sampleCount) && runStart !== null) {
        const runEnd =
          inside && index === sampleCount
            ? x
            : xMin + ((xMax - xMin) * (index - 1)) / sampleCount;
        intervals.push({
          x1: toCanvasX(runStart),
          x2: toCanvasX(runEnd),
        });
        runStart = null;
      }
    }

    function smoothstep(edge0: number, edge1: number, value: number): number {
      const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));

      return t * t * (3 - 2 * t);
    }

    function smoothBell(start: number, peak: number, end: number): number {
      return (
        smoothstep(start, peak, progress) *
        (1 - smoothstep(peak, end, progress))
      );
    }

    const topSharpen = 1 - smoothBell(0, 0.08, 0.22) * 0.07;
    const upperShoulder = 1 - smoothBell(0.2, 0.34, 0.52) * 0.018;
    const lowerPinch = 1 - smoothBell(0.54, 0.72, 0.92) * 0.12;
    const tipKeep = 1 + smoothstep(0.82, 0.98, progress) * 0.1;
    const handDrawnTaper = topSharpen * upperShoulder * lowerPinch * tipKeep;

    return intervals
      .map((interval) => {
        const mid = (interval.x1 + interval.x2) / 2;
        const halfWidth = ((interval.x2 - interval.x1) / 2) * handDrawnTaper;

        return {
          x1: mid - halfWidth,
          x2: mid + halfWidth,
        };
      })
      .filter((interval) => interval.x2 > interval.x1);
  };
}

export function buildHeartShapePath({
  centerX = 500,
  topY = 200,
  bottomY = 720,
  width = 600,
  heartSize = 1,
  points = 120,
}: HeartPathInput = {}): string {
  const safeScale = Math.max(0.2, heartSize);
  const safeWidth = Math.max(1, width) * safeScale;
  const height = Math.max(1, bottomY - topY) * safeScale;
  const scaledTopY = topY + (bottomY - topY - height) / 2;
  const centerY = scaledTopY + height / 2;
  const xScale = safeWidth / 32;
  const yScale = height / 34;
  const totalPoints = Math.max(32, Math.round(points));
  const pathPoints: string[] = [];

  for (let index = 0; index <= totalPoints; index += 1) {
    const t = Math.PI - (index / totalPoints) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);
    const progress = index / totalPoints;
    const topSharpen = progress < 0.18 || progress > 0.82 ? 0.98 : 1;
    const lowerPinch = y < -1 ? 0.96 + Math.min(0.04, Math.abs(x) / 320) : 1;
    const handDrawnLean = Math.sin(progress * Math.PI * 4) * 0.008;
    const canvasX =
      centerX +
      x * xScale * topSharpen * lowerPinch +
      safeWidth * handDrawnLean;
    const canvasY = centerY - y * yScale;

    pathPoints.push(
      `${index === 0 ? "M" : "L"} ${canvasX.toFixed(2)} ${canvasY.toFixed(2)}`,
    );
  }

  return `${pathPoints.join(" ")} Z`;
}

export function buildHeartLyricLines(
  lyrics: string,
  { targetWidth = 560, fontSize = 18, minLines = 11 }: Template2LyricLinesInput,
): string[] {
  return buildTemplate2LyricLines(lyrics, {
    targetWidth,
    fontSize,
    minLines,
  });
}

export function normalizeSpiralLyrics(lyrics: string, minLength = 720): string {
  const base = normalizeLyricPhrase(lyrics);
  const fallback = "Custom lyrics to any song, or any custom text can go here";
  const phrase = base || fallback;
  let text = phrase;

  while (text.length < minLength) {
    text = `${text} ~ ${phrase}`;
  }

  return text;
}
