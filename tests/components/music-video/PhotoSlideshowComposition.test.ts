import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("PhotoSlideshowComposition", () => {
  test("applies timeline lyric style settings during Remotion rendering", () => {
    const source = readFileSync(
      join(process.cwd(), "remotion-src/PhotoSlideshowComposition.tsx"),
      "utf8",
    );

    assert.match(source, /DEFAULT_LYRICS_STYLE/);
    assert.match(source, /normalizeLyricsStyle\(timeline\.lyricsStyle\)/);
    assert.match(source, /getLyricsOverlayStyle\(lyricsStyle\.position\)/);
    assert.match(source, /AnimatedSingleLyric/);
    assert.match(source, /RollingLyrics/);
    assert.match(source, /lyricsStyle\.entrance === "rolling-flow"/);
    assert.match(source, /Easing/);
    assert.match(source, /interpolate/);
    assert.match(source, /MOTION_BLUR_SLIP_DISTANCE_PX = 20/);
    assert.match(source, /translateY\(\$\{slipTranslateY\}px\)/);
    assert.match(source, /translateX/);
    assert.match(source, /rolling-flow-current/);
    assert.match(source, /ROLLING_FLOW_VISIBLE_LINES = 2/);
    assert.match(source, /ROLLING_FLOW_VERTICAL_PADDING_PX/);
    assert.match(source, /overflow: "visible"/);
    assert.match(source, /fontFamily: lyricsStyle\.fontFamily/);
    assert.match(source, /fontSize: lyricsStyle\.fontSize/);
    assert.match(source, /color: lyricsStyle\.color/);
    assert.match(source, /WebkitTextStroke/);
    assert.match(source, /lyricsStyle\.strokeColor/);
    assert.match(source, /wallArtFontFiles/);
    assert.match(source, /staticFile/);
    assert.match(source, /Video/);
    assert.match(source, /getUploadedMediaType/);
    assert.match(source, /muted/);
    assert.match(source, /AtmosphereOverlay/);
    assert.match(
      source,
      /lyricsStyle\.entrance === "rolling-flow"[\s\S]*<AtmosphereOverlay/,
    );
  });

  test("renders atmosphere overlays with Remotion OffthreadVideo", () => {
    const source = readFileSync(
      join(process.cwd(), "remotion-src/AtmosphereOverlay.tsx"),
      "utf8",
    );

    assert.match(source, /OffthreadVideo/);
    assert.match(source, /staticFile/);
    assert.match(source, /ATMOSPHERE_OVERLAY_OPTIONS/);
    assert.match(source, /mixBlendMode: "screen"/);
    assert.match(source, /pointerEvents: "none"/);
    assert.match(source, /muted/);
  });
});
