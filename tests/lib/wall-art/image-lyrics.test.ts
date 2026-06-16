import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  buildImageLyricMaskMetrics,
  buildImageLyricLayout,
  buildImageLyricRows,
  buildInitialImageCrop,
  clampImageCrop,
  sampleImageLyricCells,
  scaleImageLyricMaskInput,
  extendImageLyricRowToWidth,
} from "@/lib/wall-art/image-lyrics";

function imageDataFromPixels(
  width: number,
  height: number,
  pixels: Array<[number, number, number, number?]>,
): ImageData {
  return {
    width,
    height,
    data: Uint8ClampedArray.from(
      pixels.flatMap(([red, green, blue, alpha = 255]) => [
        red,
        green,
        blue,
        alpha,
      ]),
    ),
    colorSpace: "srgb",
  } as ImageData;
}

describe("image lyric wall art helpers", () => {
  test("buildImageLyricRows repeats short lyrics to fill the requested grid", () => {
    const rows = buildImageLyricRows("love", {
      columns: 8,
      rows: 3,
    });

    assert.equal(rows.length, 3);
    assert.equal(rows.every((row) => row.length === 8), true);
    assert.match(rows.join(""), /love\s+love/);
  });

  test("sampleImageLyricCells maps dark pixels to stronger grayscale opacity", () => {
    const imageData = imageDataFromPixels(2, 1, [
      [0, 0, 0],
      [255, 255, 255],
    ]);
    const cells = sampleImageLyricCells(imageData, {
      columns: 2,
      rows: 1,
      mode: "grayscale",
      contrast: 1,
      baseOpacity: 1,
      grayscaleColor: "#111111",
    });

    assert.equal(cells.length, 2);
    assert.equal(cells[0]?.fill, "#111111");
    assert.ok((cells[0]?.opacity ?? 0) > (cells[1]?.opacity ?? 0));
  });

  test("sampleImageLyricCells preserves source hue in color mode", () => {
    const imageData = imageDataFromPixels(2, 1, [
      [220, 20, 40],
      [20, 90, 220],
    ]);
    const cells = sampleImageLyricCells(imageData, {
      columns: 2,
      rows: 1,
      mode: "color",
      contrast: 1,
      baseOpacity: 1,
    });

    assert.equal(cells[0]?.fill, "rgb(220, 20, 40)");
    assert.equal(cells[1]?.fill, "rgb(20, 90, 220)");
  });

  test("buildImageLyricLayout increases detail with density while honoring max cells", () => {
    const imageData = imageDataFromPixels(
      4,
      4,
      Array.from({ length: 16 }, (_, index) => [
        index * 8,
        index * 8,
        index * 8,
      ]),
    );
    const sparse = buildImageLyricLayout("alpha beta", imageData, {
      width: 400,
      height: 300,
      fontSize: 16,
      density: 0.8,
      maxCells: 180,
    });
    const dense = buildImageLyricLayout("alpha beta", imageData, {
      width: 400,
      height: 300,
      fontSize: 16,
      density: 1.6,
      maxCells: 180,
    });

    assert.ok(dense.cells.length > sparse.cells.length);
    assert.ok(dense.cells.length <= 180);
    assert.equal(dense.rows.length, dense.rowCount);
  });

  test("buildImageLyricLayout uses tighter line height when the lyric font gets smaller", () => {
    const imageData = imageDataFromPixels(
      8,
      8,
      Array.from({ length: 64 }, () => [60, 60, 60]),
    );
    const large = buildImageLyricLayout("alpha beta gamma", imageData, {
      width: 600,
      height: 600,
      fontSize: 20,
      density: 1.35,
      maxCells: 5600,
    });
    const small = buildImageLyricLayout("alpha beta gamma", imageData, {
      width: 600,
      height: 600,
      fontSize: 10,
      density: 1.35,
      maxCells: 5600,
    });

    assert.ok(small.lineHeight < large.lineHeight * 0.7);
    assert.ok(large.lineHeight < 22);
    assert.ok(small.rowCount > large.rowCount);
  });

  test("buildInitialImageCrop cover-fits a wide image into a tall canvas", () => {
    const crop = buildInitialImageCrop({
      imageWidth: 1600,
      imageHeight: 900,
      canvasWidth: 1000,
      canvasHeight: 1400,
    });

    assert.ok(crop.x < 0);
    assert.equal(crop.y, 0);
    assert.ok(crop.scale > 1.55);
    assert.ok(crop.renderedWidth >= 1000);
    assert.ok(crop.renderedHeight >= 1400);
  });

  test("clampImageCrop keeps the crop covering the canvas while allowing movement", () => {
    const crop = clampImageCrop(
      {
        x: 600,
        y: -999,
        scale: 0.2,
      },
      {
        imageWidth: 800,
        imageHeight: 1200,
        canvasWidth: 1000,
        canvasHeight: 1000,
        minScale: 0.1,
        maxScale: 4,
      },
    );

    assert.ok(crop.scale >= 1.25);
    assert.ok(crop.x <= 0);
    assert.ok(crop.y <= 0);
    assert.ok(crop.x + crop.renderedWidth >= 1000);
    assert.ok(crop.y + crop.renderedHeight >= 1000);
  });

  test("clampImageCrop uses rotated image dimensions for cover-fit bounds", () => {
    const crop = clampImageCrop(
      {
        x: -999,
        y: 999,
        scale: 0.2,
        rotate: 90,
        flipX: true,
      },
      {
        imageWidth: 1600,
        imageHeight: 900,
        canvasWidth: 1000,
        canvasHeight: 1400,
        minScale: 0.1,
        maxScale: 4,
      },
    );

    assert.equal(crop.rotate, 90);
    assert.equal(crop.flipX, true);
    assert.equal(crop.flipY, false);
    assert.ok(crop.renderedWidth >= 1000);
    assert.ok(crop.renderedHeight >= 1400);
    assert.equal(crop.x, 0);
    assert.ok(crop.y <= 0);
  });

  test("buildImageLyricMaskMetrics increases mask detail with density", () => {
    const loose = buildImageLyricMaskMetrics({
      width: 1000,
      height: 1400,
      fontSize: 14,
      density: 0.8,
      maxCells: 24000,
    });
    const dense = buildImageLyricMaskMetrics({
      width: 1000,
      height: 1400,
      fontSize: 14,
      density: 1.6,
      maxCells: 24000,
    });

    assert.ok(dense.rowCount > loose.rowCount);
    assert.ok(dense.columnCount > loose.columnCount);
    assert.ok(dense.lineHeight < loose.lineHeight);
  });

  test("buildImageLyricMaskMetrics tightens line height with smaller fonts", () => {
    const large = buildImageLyricMaskMetrics({
      width: 1000,
      height: 1400,
      fontSize: 20,
      density: 1.35,
      maxCells: 24000,
    });
    const small = buildImageLyricMaskMetrics({
      width: 1000,
      height: 1400,
      fontSize: 10,
      density: 1.35,
      maxCells: 24000,
    });

    assert.ok(small.lineHeight < large.lineHeight * 0.7);
    assert.ok(small.rowCount > large.rowCount);
  });

  test("buildImageLyricMaskMetrics keeps lyric portrait spacing from becoming a solid mask", () => {
    const metrics = buildImageLyricMaskMetrics({
      width: 1000,
      height: 1400,
      fontSize: 12,
      density: 1.38,
      topPadding: 72,
      bottomPadding: 34,
      sidePadding: 34,
      maxCells: 24000,
    });

    assert.ok(metrics.cellWidth >= 6);
    assert.ok(metrics.lineHeight >= 10.5);
    assert.ok(metrics.columnCount < 170);
  });

  test("scaleImageLyricMaskInput scales preview typography for high resolution export", () => {
    const scaled = scaleImageLyricMaskInput({
      baseWidth: 1000,
      baseHeight: 1400,
      targetWidth: 2500,
      targetHeight: 3500,
      fontSize: 12,
      topPadding: 72,
      bottomPadding: 238,
      sidePadding: 34,
      maxCells: 24000,
    });

    assert.equal(scaled.width, 2500);
    assert.equal(scaled.height, 3500);
    assert.equal(scaled.fontSize, 30);
    assert.equal(scaled.topPadding, 180);
    assert.equal(scaled.bottomPadding, 595);
    assert.equal(scaled.sidePadding, 85);
    assert.equal(scaled.maxCells, 150000);
  });

  test("extendImageLyricRowToWidth keeps proportional-font rows covering the mask width", () => {
    const measured = extendImageLyricRowToWidth({
      row: "iiiiiiii",
      sourceText: "wide words ",
      targetWidth: 160,
      measureText: (value) => value.length * (value.includes("w") ? 8 : 4),
    });

    assert.ok(measured.text.length > "iiiiiiii".length);
    assert.ok(measured.width >= 160);
  });
});
