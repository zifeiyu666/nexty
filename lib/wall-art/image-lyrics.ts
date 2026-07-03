import { cleanWallArtLyrics } from "./spiral";

export type ImageLyricMode = "color" | "grayscale";

export type ImageLyricRowsInput = {
  columns: number;
  rows: number;
};

export type ExtendImageLyricRowToWidthInput = {
  row: string;
  sourceText: string;
  targetWidth: number;
  measureText: (value: string) => number;
};

export type ExtendedImageLyricRow = {
  text: string;
  width: number;
};

export type ImageLyricCellSample = {
  column: number;
  row: number;
  red: number;
  green: number;
  blue: number;
  luminance: number;
  fill: string;
  opacity: number;
};

export type ImageLyricSampleInput = {
  columns: number;
  rows: number;
  mode?: ImageLyricMode;
  contrast?: number;
  baseOpacity?: number;
  invert?: boolean;
  grayscaleColor?: string;
};

export type ImageLyricLayoutInput = Omit<
  ImageLyricSampleInput,
  "columns" | "rows"
> & {
  width: number;
  height: number;
  fontSize: number;
  density?: number;
  maxCells?: number;
  topPadding?: number;
  bottomPadding?: number;
  sidePadding?: number;
};

export type ImageLyricLayoutCell = ImageLyricCellSample & {
  text: string;
  x: number;
  y: number;
  fontSize: number;
};

export type ImageLyricLayout = {
  cells: ImageLyricLayoutCell[];
  rows: string[];
  columnCount: number;
  rowCount: number;
  cellWidth: number;
  lineHeight: number;
};

export type ImageLyricMaskMetricsInput = {
  width: number;
  height: number;
  fontSize: number;
  density?: number;
  maxCells?: number;
  topPadding?: number;
  bottomPadding?: number;
  sidePadding?: number;
};

export type ImageLyricMaskMetrics = {
  columnCount: number;
  rowCount: number;
  cellWidth: number;
  lineHeight: number;
  contentWidth: number;
  contentHeight: number;
  topPadding: number;
  sidePadding: number;
};

export type ScaleImageLyricMaskInput = {
  baseWidth: number;
  baseHeight: number;
  targetWidth: number;
  targetHeight: number;
  fontSize: number;
  topPadding: number;
  bottomPadding: number;
  sidePadding: number;
  maxCells: number;
};

export type ScaledImageLyricMaskInput = {
  width: number;
  height: number;
  fontSize: number;
  topPadding: number;
  bottomPadding: number;
  sidePadding: number;
  maxCells: number;
};

export type ImageCropInput = {
  imageWidth: number;
  imageHeight: number;
  canvasWidth: number;
  canvasHeight: number;
};

export type ImageCropTransform = {
  x: number;
  y: number;
  scale: number;
  renderedWidth: number;
  renderedHeight: number;
  rotate: ImageCropRotation;
  flipX: boolean;
  flipY: boolean;
};

export type ClampImageCropInput = ImageCropInput & {
  minScale?: number;
  maxScale?: number;
  overflowPadding?: number;
};

export type ImageCropRotation = 0 | 90 | 180 | 270;

const fallbackLyrics = "Custom lyrics to any song, or any custom text can go here";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeImageLyrics(text: string): string {
  return (
    cleanWallArtLyrics(text)
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .join(" ") || fallbackLyrics
  );
}

function roundCropValue(value: number): number {
  return Number(value.toFixed(3));
}

function imageCropOrientedSize({
  imageWidth,
  imageHeight,
  rotate = 0,
}: {
  imageWidth: number;
  imageHeight: number;
  rotate?: ImageCropRotation;
}) {
  const safeImageWidth = Math.max(1, imageWidth);
  const safeImageHeight = Math.max(1, imageHeight);
  const isSideways = rotate === 90 || rotate === 270;

  return {
    width: isSideways ? safeImageHeight : safeImageWidth,
    height: isSideways ? safeImageWidth : safeImageHeight,
  };
}

export function scaleImageLyricMaskInput({
  baseWidth,
  baseHeight,
  targetWidth,
  targetHeight,
  fontSize,
  topPadding,
  bottomPadding,
  sidePadding,
  maxCells,
}: ScaleImageLyricMaskInput): ScaledImageLyricMaskInput {
  const safeBaseWidth = Math.max(1, baseWidth);
  const safeBaseHeight = Math.max(1, baseHeight);
  const safeTargetWidth = Math.max(1, targetWidth);
  const safeTargetHeight = Math.max(1, targetHeight);
  const scaleX = safeTargetWidth / safeBaseWidth;
  const scaleY = safeTargetHeight / safeBaseHeight;
  const typographyScale = Math.min(scaleX, scaleY);
  const areaScale = scaleX * scaleY;

  return {
    width: Math.round(safeTargetWidth),
    height: Math.round(safeTargetHeight),
    fontSize: Number((fontSize * typographyScale).toFixed(3)),
    topPadding: Number((topPadding * scaleY).toFixed(3)),
    bottomPadding: Number((bottomPadding * scaleY).toFixed(3)),
    sidePadding: Number((sidePadding * scaleX).toFixed(3)),
    maxCells: Math.max(1, Math.round(maxCells * areaScale)),
  };
}

export function buildInitialImageCrop({
  imageWidth,
  imageHeight,
  canvasWidth,
  canvasHeight,
  rotate = 0,
  flipX = false,
  flipY = false,
}: ImageCropInput & {
  rotate?: ImageCropRotation;
  flipX?: boolean;
  flipY?: boolean;
}): ImageCropTransform {
  const orientedImageSize = imageCropOrientedSize({
    imageWidth,
    imageHeight,
    rotate,
  });
  const safeCanvasWidth = Math.max(1, canvasWidth);
  const safeCanvasHeight = Math.max(1, canvasHeight);
  const scale = Math.max(
    safeCanvasWidth / orientedImageSize.width,
    safeCanvasHeight / orientedImageSize.height,
  );
  const renderedWidth = orientedImageSize.width * scale;
  const renderedHeight = orientedImageSize.height * scale;

  return {
    x: roundCropValue((safeCanvasWidth - renderedWidth) / 2),
    y: roundCropValue((safeCanvasHeight - renderedHeight) / 2),
    scale: roundCropValue(scale),
    renderedWidth: roundCropValue(renderedWidth),
    renderedHeight: roundCropValue(renderedHeight),
    rotate,
    flipX,
    flipY,
  };
}

export function clampImageCrop(
  crop: Pick<ImageCropTransform, "x" | "y" | "scale"> &
    Partial<Pick<ImageCropTransform, "rotate" | "flipX" | "flipY">>,
  {
    imageWidth,
    imageHeight,
    canvasWidth,
    canvasHeight,
    minScale = 0.1,
    maxScale = 6,
    overflowPadding = 0,
  }: ClampImageCropInput,
): ImageCropTransform {
  const rotate = crop.rotate ?? 0;
  const orientedImageSize = imageCropOrientedSize({
    imageWidth,
    imageHeight,
    rotate,
  });
  const safeCanvasWidth = Math.max(1, canvasWidth);
  const safeCanvasHeight = Math.max(1, canvasHeight);
  const coverScale = Math.max(
    safeCanvasWidth / orientedImageSize.width,
    safeCanvasHeight / orientedImageSize.height,
  );
  const safeScale = clamp(
    crop.scale,
    Math.max(minScale, coverScale),
    Math.max(maxScale, coverScale),
  );
  const renderedWidth = orientedImageSize.width * safeScale;
  const renderedHeight = orientedImageSize.height * safeScale;
  const safeOverflowPadding = Math.max(0, overflowPadding);
  const minX = safeCanvasWidth - renderedWidth - safeOverflowPadding;
  const maxX = safeOverflowPadding;
  const minY = safeCanvasHeight - renderedHeight - safeOverflowPadding;
  const maxY = safeOverflowPadding;
  const x = clamp(crop.x, minX, maxX);
  const y = clamp(crop.y, minY, maxY);

  return {
    x: roundCropValue(x),
    y: roundCropValue(y),
    scale: roundCropValue(safeScale),
    renderedWidth: roundCropValue(renderedWidth),
    renderedHeight: roundCropValue(renderedHeight),
    rotate,
    flipX: crop.flipX ?? false,
    flipY: crop.flipY ?? false,
  };
}

function luminanceFromRgb(red: number, green: number, blue: number): number {
  return (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
}

function opacityFromLuminance({
  luminance,
  contrast,
  baseOpacity,
  invert,
}: {
  luminance: number;
  contrast: number;
  baseOpacity: number;
  invert: boolean;
}): number {
  const source = invert ? luminance : 1 - luminance;
  const contrasted = clamp((source - 0.5) * contrast + 0.5, 0, 1);
  const opacity = clamp(contrasted * baseOpacity, 0.05, 1);

  return Number(opacity.toFixed(3));
}

function sampleAverageRgb(
  imageData: ImageData,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): { red: number; green: number; blue: number } {
  const minX = clamp(Math.floor(startX), 0, imageData.width - 1);
  const minY = clamp(Math.floor(startY), 0, imageData.height - 1);
  const maxX = clamp(Math.ceil(endX), minX + 1, imageData.width);
  const maxY = clamp(Math.ceil(endY), minY + 1, imageData.height);
  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;

  for (let y = minY; y < maxY; y += 1) {
    for (let x = minX; x < maxX; x += 1) {
      const offset = (y * imageData.width + x) * 4;
      red += imageData.data[offset] ?? 0;
      green += imageData.data[offset + 1] ?? 0;
      blue += imageData.data[offset + 2] ?? 0;
      count += 1;
    }
  }

  if (count === 0) return { red: 255, green: 255, blue: 255 };

  return {
    red: Math.round(red / count),
    green: Math.round(green / count),
    blue: Math.round(blue / count),
  };
}

export function buildImageLyricRows(
  text: string,
  { columns, rows }: ImageLyricRowsInput,
): string[] {
  const safeColumns = Math.max(1, Math.floor(columns));
  const safeRows = Math.max(1, Math.floor(rows));
  const phrase = `${normalizeImageLyrics(text)} `;
  const characters = Array.from(phrase);
  const output: string[] = [];
  let cursor = 0;

  for (let row = 0; row < safeRows; row += 1) {
    let line = "";

    while (Array.from(line).length < safeColumns) {
      line += characters[cursor % characters.length];
      cursor += 1;
    }

    output.push(Array.from(line).slice(0, safeColumns).join(""));
  }

  return output;
}

export function extendImageLyricRowToWidth({
  row,
  sourceText,
  targetWidth,
  measureText,
}: ExtendImageLyricRowToWidthInput): ExtendedImageLyricRow {
  const phrase = `${normalizeImageLyrics(sourceText)} `;
  const characters = Array.from(phrase);
  let output = row;
  let width = measureText(output);
  let cursor = 0;
  const maxCharacters = Math.max(
    Array.from(output).length + characters.length * 12,
    Array.from(output).length + 256,
  );

  while (width < targetWidth && Array.from(output).length < maxCharacters) {
    output += characters[cursor % characters.length];
    cursor += 1;
    width = measureText(output);
  }

  return { text: output, width };
}

export function sampleImageLyricCells(
  imageData: ImageData,
  {
    columns,
    rows,
    mode = "color",
    contrast = 1.2,
    baseOpacity = 0.95,
    invert = false,
    grayscaleColor = "#111111",
  }: ImageLyricSampleInput,
): ImageLyricCellSample[] {
  const safeColumns = Math.max(1, Math.floor(columns));
  const safeRows = Math.max(1, Math.floor(rows));
  const safeContrast = Math.max(0.2, contrast);
  const safeBaseOpacity = clamp(baseOpacity, 0.05, 1);
  const cells: ImageLyricCellSample[] = [];

  for (let row = 0; row < safeRows; row += 1) {
    for (let column = 0; column < safeColumns; column += 1) {
      const startX = (column / safeColumns) * imageData.width;
      const endX = ((column + 1) / safeColumns) * imageData.width;
      const startY = (row / safeRows) * imageData.height;
      const endY = ((row + 1) / safeRows) * imageData.height;
      const { red, green, blue } = sampleAverageRgb(
        imageData,
        startX,
        startY,
        endX,
        endY,
      );
      const luminance = luminanceFromRgb(red, green, blue);
      const opacity = opacityFromLuminance({
        luminance,
        contrast: safeContrast,
        baseOpacity: safeBaseOpacity,
        invert,
      });

      cells.push({
        column,
        row,
        red,
        green,
        blue,
        luminance: Number(luminance.toFixed(4)),
        fill: mode === "color" ? `rgb(${red}, ${green}, ${blue})` : grayscaleColor,
        opacity,
      });
    }
  }

  return cells;
}

export function buildImageLyricMaskMetrics({
  width,
  height,
  fontSize,
  density = 1.35,
  maxCells = 5200,
  topPadding = 88,
  bottomPadding = 150,
  sidePadding = 42,
}: ImageLyricMaskMetricsInput): ImageLyricMaskMetrics {
  const safeFontSize = Math.max(6, fontSize);
  const safeDensity = Math.max(0.35, density);
  const contentWidth = Math.max(1, width - sidePadding * 2);
  const contentHeight = Math.max(1, height - topPadding - bottomPadding);
  const lineHeight = Math.max(6.2, safeFontSize * (1.32 / safeDensity));
  const cellWidth = Math.max(3.2, safeFontSize * (0.78 / safeDensity));
  const rawColumns = Math.max(1, Math.floor(contentWidth / cellWidth));
  const rawRows = Math.max(1, Math.floor(contentHeight / lineHeight));
  const rawCells = rawColumns * rawRows;
  const capScale = rawCells > maxCells ? Math.sqrt(maxCells / rawCells) : 1;
  const columnCount = Math.max(1, Math.floor(rawColumns * capScale));
  const rowCount = Math.max(1, Math.floor(rawRows * capScale));

  return {
    columnCount,
    rowCount,
    cellWidth: Number((contentWidth / columnCount).toFixed(3)),
    lineHeight: Number((contentHeight / rowCount).toFixed(3)),
    contentWidth: Number(contentWidth.toFixed(3)),
    contentHeight: Number(contentHeight.toFixed(3)),
    topPadding,
    sidePadding,
  };
}

export function buildImageLyricLayout(
  text: string,
  imageData: ImageData,
  {
    width,
    height,
    fontSize,
    density = 1.35,
    maxCells = 5200,
    topPadding = 88,
    bottomPadding = 150,
    sidePadding = 42,
    mode,
    contrast,
    baseOpacity,
    invert,
    grayscaleColor,
  }: ImageLyricLayoutInput,
): ImageLyricLayout {
  const safeFontSize = Math.max(6, fontSize);
  const metrics = buildImageLyricMaskMetrics({
    width,
    height,
    fontSize: safeFontSize,
    density,
    maxCells,
    topPadding,
    bottomPadding,
    sidePadding,
  });
  const rows = buildImageLyricRows(text, {
    columns: metrics.columnCount,
    rows: metrics.rowCount,
  });
  const samples = sampleImageLyricCells(imageData, {
    columns: metrics.columnCount,
    rows: metrics.rowCount,
    mode,
    contrast,
    baseOpacity,
    invert,
    grayscaleColor,
  });
  const cells = samples.map((sample) => ({
    ...sample,
    text: rows[sample.row]?.[sample.column] ?? " ",
    x: Number((metrics.sidePadding + sample.column * metrics.cellWidth).toFixed(2)),
    y: Number((metrics.topPadding + (sample.row + 1) * metrics.lineHeight).toFixed(2)),
    fontSize: safeFontSize,
  }));

  return {
    cells,
    rows,
    columnCount: metrics.columnCount,
    rowCount: metrics.rowCount,
    cellWidth: metrics.cellWidth,
    lineHeight: metrics.lineHeight,
  };
}
