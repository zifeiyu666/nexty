import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  buildHeartShapePath,
  buildShapeTextLayout,
  buildSpiralPath,
  buildWallArtPrintTransform,
  calculateWallArtQrCodePlacement,
  createHeartIntervalProvider,
  buildHeartLyricLines,
  splitTemplate2TitleLines,
  buildTemplate2LyricLines,
  calculatePrintPixelSize,
  calculateSpiralInnerRadius,
  calculateSpiralTextCapacity,
  calculateSpiralTurns,
  cleanWallArtLyrics,
  fitSpiralLyrics,
  normalizeSpiralLyrics,
  printSizePresets,
  wallArtColorPresets,
  wallArtTemplate2ColorPresets,
} from "@/lib/wall-art/spiral";

describe("wall art spiral helpers", () => {
  test("splitTemplate2TitleLines defaults a title into one or two editable lines", () => {
    assert.deepEqual(splitTemplate2TitleLines("Moonlight Sonata"), [
      "Moonlight",
      "Sonata",
    ]);
    assert.deepEqual(splitTemplate2TitleLines("熙宝的星光3"), [
      "熙宝的",
      "星光3",
    ]);
    assert.deepEqual(splitTemplate2TitleLines("Halo"), ["Halo", ""]);
  });

  test("buildSpiralPath creates an inward svg path with many points", () => {
    const path = buildSpiralPath({
      center: 500,
      innerRadius: 150,
      outerRadius: 410,
      turns: 6,
      pointsPerTurn: 18,
    });

    assert.match(path, /^M\s/);
    assert.match(path, /L\s/);

    const first = path.match(/^M\s([\d.-]+)\s([\d.-]+)/);
    const last = path.match(/L\s([\d.-]+)\s([\d.-]+)$/);

    assert.ok(first);
    assert.ok(last);
    assert.ok(Number(first[1]) > Number(last[1]));
    assert.ok(path.split(" L ").length > 90);
  });

  test("buildSpiralPath creates an outward spiral with even row pitch", () => {
    const path = buildSpiralPath({
      center: 500,
      innerRadius: 187,
      outerRadius: 470,
      turns: 7.6,
      pointsPerTurn: 40,
      direction: "outward",
    });

    const points = Array.from(path.matchAll(/[ML]\s([\d.-]+)\s([\d.-]+)/g)).map(
      (match) => ({
        x: Number(match[1]),
        y: Number(match[2]),
      }),
    );

    const radii = points.map((point) =>
      Math.hypot(point.x - 500, point.y - 500),
    );
    const samplesPerTurn = 40;
    const firstRowPitch = radii[samplesPerTurn] - radii[0];
    const secondRowPitch = radii[samplesPerTurn * 2] - radii[samplesPerTurn];
    const outerRowPitch = radii[samplesPerTurn * 6] - radii[samplesPerTurn * 5];

    assert.ok(Math.abs(radii[0] - 187) <= 1);
    assert.ok(firstRowPitch > 30);
    assert.ok(Math.abs(firstRowPitch - secondRowPitch) <= 3);
    assert.ok(Math.abs(firstRowPitch - outerRowPitch) <= 3);
  });

  test("normalizeSpiralLyrics removes blank lines and repeats short lyrics", () => {
    const text = normalizeSpiralLyrics(
      "Title: My Song\n [Verse 1]\nFirst line\n\n[Bridge]\nSecond line ",
      70,
    );

    assert.equal(text.includes("\n"), false);
    assert.equal(text.includes("Title:"), false);
    assert.equal(text.includes("[Verse 1]"), false);
    assert.equal(text.includes("[Bridge]"), false);
    assert.match(text, /First line ~ Second line/);
    assert.ok(text.length >= 70);
  });

  test("cleanWallArtLyrics removes bracketed section labels for editing", () => {
    assert.equal(
      cleanWallArtLyrics(
        "Title: My Song\n[Verse 1]\nFirst line\n[Bridge]\nSecond line",
      ),
      "First line\nSecond line",
    );
  });

  test("wall art color presets provide quick poster and disc choices", () => {
    assert.equal(wallArtColorPresets.length, 10);
    assert.equal(wallArtColorPresets[0]?.name, "Design 1");

    for (const preset of wallArtColorPresets) {
      assert.match(preset.posterBackground, /^#[0-9a-f]{6}$/i);
      assert.match(preset.discColor, /^#[0-9a-f]{6}$/i);
      assert.match(preset.lyricColor, /^#[0-9a-f]{6}$/i);
      assert.match(preset.titleColor, /^#[0-9a-f]{6}$/i);
    }
  });

  test("wall art template 2 presets provide fifteen default record poster choices", () => {
    assert.equal(wallArtTemplate2ColorPresets.length, 15);
    assert.equal(wallArtTemplate2ColorPresets[0]?.name, "Design 1");
    assert.equal(wallArtTemplate2ColorPresets[0]?.posterBackground, "#e2dfdb");

    for (const preset of wallArtTemplate2ColorPresets) {
      assert.match(preset.posterBackground, /^#[0-9a-f]{6}$/i);
      assert.match(preset.discColor, /^#[0-9a-f]{6}$/i);
      assert.match(preset.lyricColor, /^#[0-9a-f]{6}$/i);
      assert.match(preset.titleColor, /^#[0-9a-f]{6}$/i);
    }
  });

  test("calculateSpiralInnerRadius keeps lyrics close to the center disc", () => {
    assert.equal(
      calculateSpiralInnerRadius({
        centerRadius: 168,
        lyricFontSize: 18,
      }),
      187,
    );
  });

  test("calculateSpiralTextCapacity grows with text radius and shrinks with font size", () => {
    const base = calculateSpiralTextCapacity({
      innerRadius: 187,
      outerRadius: 470,
      turns: 7.6,
      fontSize: 18,
    });
    const largerFont = calculateSpiralTextCapacity({
      innerRadius: 187,
      outerRadius: 470,
      turns: 7.6,
      fontSize: 30,
    });
    const widerTextRadius = calculateSpiralTextCapacity({
      innerRadius: 187,
      outerRadius: 520,
      turns: 7.6,
      fontSize: 18,
    });

    assert.ok(base > largerFont);
    assert.ok(widerTextRadius > base);
  });

  test("calculateSpiralTurns adapts row pitch to font size", () => {
    const small = calculateSpiralTurns({
      innerRadius: 187,
      outerRadius: 470,
      fontSize: 14,
    });
    const large = calculateSpiralTurns({
      innerRadius: 187,
      outerRadius: 470,
      fontSize: 28,
    });

    assert.ok(small > large);
    assert.ok(small <= 12);
    assert.ok(large >= 3);
  });

  test("fitSpiralLyrics repeats short lyrics and trims long lyrics to capacity", () => {
    const repeated = fitSpiralLyrics("[Verse 1]\none two", 24);
    const trimmed = fitSpiralLyrics(
      "[Bridge]\nalpha beta gamma delta epsilon zeta",
      18,
    );

    assert.ok(repeated.length >= 24);
    assert.equal(repeated.includes("[Verse 1]"), false);
    assert.match(repeated, /^one two/);
    assert.ok(trimmed.length <= 18);
    assert.equal(trimmed.endsWith(" "), false);
    assert.equal(trimmed.includes("[Bridge]"), false);
    assert.match(trimmed, /^alpha beta/);
  });

  test("buildTemplate2LyricLines repeats short lyrics to at least fifteen lines", () => {
    const lines = buildTemplate2LyricLines("first line\nsecond line", {
      targetWidth: 80,
      fontSize: 12,
      minLines: 15,
    });

    assert.equal(lines.length, 15);
    assert.match(
      lines.join("").replace(/\s+/g, ""),
      /firstlinesecondlinefirstline/,
    );
    assert.notEqual(lines[0], "");
  });

  test("buildTemplate2LyricLines fills wider lines from continuous lyrics", () => {
    const lines = buildTemplate2LyricLines("alpha beta gamma delta", {
      targetWidth: 300,
      fontSize: 12,
      minLines: 15,
    });

    assert.equal(lines.length, 15);
    assert.ok(lines[0].includes("alpha"));
    assert.match(lines.join(" "), /alpha beta gamma delta alpha/);
  });

  test("buildTemplate2LyricLines keeps CJK lyric lines within target width", () => {
    const fontSize = 16;
    const targetWidth = 120;
    const lines = buildTemplate2LyricLines(
      "画纸上小兔子戴上了皇冠厨房的窗台摆满彩色糖罐",
      {
        targetWidth,
        fontSize,
        minLines: 15,
      },
    );

    assert.equal(lines.length, 15);
    for (const line of lines) {
      const width = Array.from(line).reduce((total, char) => {
        if (/\s/.test(char)) return total + fontSize * 0.34;
        return total + fontSize;
      }, 0);
      assert.ok(width <= targetWidth);
    }
  });

  test("buildHeartLyricLines repeats lyrics to fill a heart layout", () => {
    const lines = buildHeartLyricLines("love is kind", {
      targetWidth: 240,
      fontSize: 18,
      minLines: 11,
    });

    assert.equal(lines.length, 11);
    assert.ok(lines[0].length > 0);
  });

  test("createHeartIntervalProvider returns split, wide, and narrow heart rows", () => {
    const provider = createHeartIntervalProvider({
      centerX: 500,
      topY: 200,
      bottomY: 720,
      width: 600,
      heartSize: 1,
    });

    const top = provider(250);
    const middle = provider(430);
    const bottom = provider(630);

    assert.equal(top.length, 2);
    assert.equal(middle.length, 1);
    assert.equal(bottom.length, 1);
    assert.ok(middle[0].x2 - middle[0].x1 > 430);
    assert.ok(bottom[0].x2 - bottom[0].x1 < middle[0].x2 - middle[0].x1);
  });

  test("createHeartIntervalProvider keeps top lobes wide while preserving center gap", () => {
    const provider = createHeartIntervalProvider({
      centerX: 500,
      topY: 210,
      bottomY: 690,
      width: 620,
      heartSize: 1,
    });

    const top = provider(250);

    assert.equal(top.length, 2);
    assert.ok(top[0].x2 - top[0].x1 > 150);
    assert.ok(top[0].x2 < 500);
    assert.ok(top[1].x1 > 500);
  });

  test("createHeartIntervalProvider follows a natural heart silhouette", () => {
    const provider = createHeartIntervalProvider({
      centerX: 500,
      topY: 210,
      bottomY: 690,
      width: 620,
      heartSize: 1,
    });
    const totalWidth = (intervals: { x1: number; x2: number }[]) =>
      intervals.reduce((sum, interval) => sum + interval.x2 - interval.x1, 0);

    const upperLobes = provider(250);
    const widest = provider(360);
    const waist = provider(470);
    const lower = provider(590);
    const tip = provider(630);

    assert.equal(upperLobes.length, 2);
    assert.ok(totalWidth(widest) > totalWidth(upperLobes));
    assert.ok(totalWidth(widest) > totalWidth(waist));
    assert.ok(totalWidth(waist) > totalWidth(lower));
    assert.ok(totalWidth(lower) > totalWidth(tip));
    assert.ok(totalWidth(tip) < 140);
  });

  test("createHeartIntervalProvider supports a tall narrow heart with a sharp lower tip", () => {
    const provider = createHeartIntervalProvider({
      centerX: 500,
      topY: 210,
      bottomY: 720,
      width: 500,
      heartSize: 1,
    });
    const totalWidth = (intervals: { x1: number; x2: number }[]) =>
      intervals.reduce((sum, interval) => sum + interval.x2 - interval.x1, 0);

    const widest = totalWidth(provider(370));
    const lower = totalWidth(provider(630));
    const tip = totalWidth(provider(650));

    assert.ok(widest < 510);
    assert.ok(lower < widest * 0.24);
    assert.ok(tip > 0);
    assert.ok(tip < 90);
  });

  test("createHeartIntervalProvider scales interval widths with heartSize", () => {
    const small = createHeartIntervalProvider({
      centerX: 500,
      topY: 200,
      bottomY: 720,
      width: 600,
      heartSize: 0.8,
    });
    const large = createHeartIntervalProvider({
      centerX: 500,
      topY: 200,
      bottomY: 720,
      width: 600,
      heartSize: 1.2,
    });

    const smallInterval = small(430)[0];
    const largeInterval = large(430)[0];

    assert.ok(
      largeInterval.x2 - largeInterval.x1 > smallInterval.x2 - smallInterval.x1,
    );
  });

  test("buildHeartShapePath returns a closed scalable heart path", () => {
    const small = buildHeartShapePath({
      centerX: 500,
      topY: 210,
      bottomY: 690,
      width: 620,
      heartSize: 0.8,
    });
    const large = buildHeartShapePath({
      centerX: 500,
      topY: 210,
      bottomY: 690,
      width: 620,
      heartSize: 1.2,
    });

    assert.match(small, /^M\s/);
    assert.match(small, /Z$/);
    assert.ok(large.length > small.length - 20);
  });

  test("buildShapeTextLayout repeats short lyrics and fills split intervals", () => {
    const provider = createHeartIntervalProvider({
      centerX: 500,
      topY: 200,
      bottomY: 720,
      width: 600,
      heartSize: 1,
    });
    const lines = buildShapeTextLayout({
      text: "love",
      startY: 250,
      endY: 330,
      fontSize: 18,
      lineHeightRatio: 1.4,
      intervalProvider: provider,
    });

    assert.ok(lines.length >= 4);
    assert.equal(lines.filter((line) => line.y === lines[0].y).length, 2);
    assert.match(lines.map((line) => line.text).join(" "), /love\s+love/);
  });

  test("buildShapeTextLayout keeps text inside intervals with non-negative letter spacing", () => {
    const intervalsByY = new Map<number, { x1: number; x2: number }[]>();
    const lines = buildShapeTextLayout({
      text: "alpha beta gamma",
      startY: 100,
      endY: 160,
      fontSize: 14,
      lineHeightRatio: 1.5,
      intervalProvider: (y) => {
        const roundedY = Math.round(y);
        const intervals =
          roundedY === 100
            ? [
                { x1: 100, x2: 180 },
                { x1: 220, x2: 310 },
              ]
            : [{ x1: 120, x2: 280 }];
        intervalsByY.set(roundedY, intervals);
        return intervals;
      },
    });

    assert.ok(lines.some((line) => line.y === 100 && line.x < 200));
    assert.ok(lines.some((line) => line.y === 100 && line.x > 200));

    for (const line of lines) {
      const interval = intervalsByY
        .get(Math.round(line.y))
        ?.find((candidate) => line.x >= candidate.x1 && line.x <= candidate.x2);

      assert.ok(interval);
      assert.ok(line.width <= interval.x2 - interval.x1);
      assert.ok(line.measuredWidth <= line.width);
      assert.ok(line.letterSpacing >= 0);
      assert.ok(line.letterSpacing <= 2.4);
    }
  });

  test("buildShapeTextLayout exposes full interval width for justified rendering", () => {
    const lines = buildShapeTextLayout({
      text: "short words",
      startY: 100,
      endY: 100,
      fontSize: 14,
      intervalProvider: () => [{ x1: 100, x2: 360 }],
      textAnchor: "middle",
    });

    assert.equal(lines.length, 1);
    assert.equal(lines[0].width, 260);
  });

  test("print size presets default to A4 and convert to 300dpi pixels", () => {
    assert.equal(printSizePresets[0]?.id, "a4");

    const a4 = calculatePrintPixelSize({
      widthCm: 21,
      heightCm: 29.7,
      dpi: 300,
    });
    const eightByTen = calculatePrintPixelSize({
      widthIn: 8,
      heightIn: 10,
      dpi: 300,
    });

    assert.deepEqual(a4, { width: 2480, height: 3508 });
    assert.deepEqual(eightByTen, { width: 2400, height: 3000 });
  });

  test("buildWallArtPrintTransform centers scaled content with user offsets", () => {
    assert.equal(
      buildWallArtPrintTransform({
        baseWidth: 1000,
        baseHeight: 1400,
        contentScale: 1.2,
        offsetX: -40,
        offsetY: 65,
      }),
      "translate(-140 -75) scale(1.2)",
    );
  });

  test("calculateWallArtQrCodePlacement lets a bottom-right QR move across the safe print area", () => {
    const placement = calculateWallArtQrCodePlacement({
      baseWidth: 1000,
      baseHeight: 1414,
      frameWidth: 34,
      qrCodeSize: 112,
      margin: 32,
    });

    assert.equal(placement.defaultX, 822);
    assert.equal(placement.defaultY, 1236);
    assert.equal(placement.minOffsetX, -756);
    assert.equal(placement.maxOffsetX, 0);
    assert.equal(placement.minOffsetY, -1170);
    assert.equal(placement.maxOffsetY, 0);
  });

  test("calculateWallArtQrCodePlacement accounts for QR size when keeping it in bounds", () => {
    const small = calculateWallArtQrCodePlacement({
      baseWidth: 1000,
      baseHeight: 1414,
      frameWidth: 34,
      qrCodeSize: 96,
    });
    const large = calculateWallArtQrCodePlacement({
      baseWidth: 1000,
      baseHeight: 1414,
      frameWidth: 34,
      qrCodeSize: 180,
    });

    assert.equal(large.defaultX, small.defaultX - 84);
    assert.equal(large.defaultY, small.defaultY - 84);
    assert.equal(large.minOffsetX, small.minOffsetX + 84);
    assert.equal(large.minOffsetY, small.minOffsetY + 84);
  });
});
