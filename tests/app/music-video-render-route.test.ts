import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("music video render route", () => {
  test("accepts lyric style settings in the submitted timeline schema", () => {
    const source = readFileSync(
      join(process.cwd(), "app/api/songs/[songId]/mv/render/route.ts"),
      "utf8",
    );

    assert.match(source, /const lyricsStyleSchema = z\.object/);
    assert.match(source, /mediaType: z\.enum\(\["image", "video"\]\)\.optional\(\)/);
    assert.match(source, /const lyricsEntranceSchema = z\.union/);
    assert.match(source, /"motion-blur-slip"/);
    assert.match(source, /"staggered-glow-reveal"/);
    assert.match(source, /"rolling-flow"/);
    assert.match(source, /z\.literal\(""\)/);
    assert.match(source, /fontFamily: z\.string\(\)/);
    assert.match(source, /fontSize: z\.number\(\)\.positive\(\)/);
    assert.match(source, /position: z\.enum\(\["top", "center", "bottom"\]\)/);
    assert.match(source, /strokeWidth: z\.number\(\)\.min\(0\)/);
    assert.match(source, /lyricsStyle: lyricsStyleSchema\.optional\(\)/);
    assert.match(source, /const atmosphereOverlaySchema = z\.object/);
    assert.match(source, /overlayId: z\.string\(\)\.nullable\(\)/);
    assert.match(source, /opacity: z\.number\(\)\.min\(0\)\.max\(1\)/);
    assert.match(source, /atmosphereOverlay: atmosphereOverlaySchema\.optional\(\)/);
    assert.match(source, /height: z\.number\(\)\.int\(\)\.positive\(\)/);
    assert.match(source, /width: z\.number\(\)\.int\(\)\.positive\(\)/);
  });

  test("accepts wave radio timelines with a bundled background id", () => {
    const source = readFileSync(
      join(process.cwd(), "app/api/songs/[songId]/mv/render/route.ts"),
      "utf8",
    );

    assert.match(source, /const waveRadioTimelineSchema = z\.object/);
    assert.match(source, /templateId: z\.literal\("wave-radio"\)/);
    assert.match(source, /waveRadioBackgroundId: z\.string\(\)/);
    assert.match(source, /waveRadioTimelineSchema/);
  });
});
