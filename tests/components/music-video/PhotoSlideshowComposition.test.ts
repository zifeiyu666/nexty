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

  test("renders photo slideshow lyrics as centered plain text without timestamps or punctuation", () => {
    const source = readFileSync(
      join(process.cwd(), "remotion-src/PhotoSlideshowComposition.tsx"),
      "utf8",
    );

    assert.match(source, /function stripLyricsPunctuation\(text: string\)/);
    assert.match(source, /replace\(\/\[!"#\$%&'\(\)\*\+,\\-\.\/:;<=>\?@\[\\\\\]\^_`\{\|\}~\]\/g, ""\)/);
    assert.match(source, /replace\(\/\[，。！？；：、（）【】《》〈〉「」『』“”‘’…—～·\]\/g, ""\)/);
    assert.match(source, /textAlign: "center"/);
    assert.match(source, /justifyContent: "center"/);
    assert.match(source, /position: "center"/);
    assert.doesNotMatch(source, /function formatTime\(seconds: number\)/);
    assert.doesNotMatch(source, /backdropFilter: "blur\(18px\)"/);
    assert.doesNotMatch(source, /background: "rgba\(255,255,255,.14\)"/);
  });

  test("renders atmosphere overlays with Remotion OffthreadVideo", () => {
    const source = readFileSync(
      join(process.cwd(), "remotion-src/AtmosphereOverlay.tsx"),
      "utf8",
    );

    assert.match(source, /OffthreadVideo/);
    assert.match(source, /resolveRemotionMediaSrc/);
    assert.match(source, /ATMOSPHERE_OVERLAY_OPTIONS/);
    assert.match(source, /mixBlendMode: "screen"/);
    assert.match(source, /pointerEvents: "none"/);
    assert.match(source, /muted/);
  });

  test("renders minimal vinyl through the radial visualizer", () => {
    const source = readFileSync(
      join(process.cwd(), "remotion-src/MinimalVinylComposition.tsx"),
      "utf8",
    );

    assert.match(source, /RadialVisualizer/);
    assert.match(source, /audioSrc=\{audioSrc\}/);
    assert.match(source, /baseRadius=\{shortSide \* 0\.22\}/);
    assert.match(source, /lyricCues=\{timeline\.lyrics\}/);
    assert.match(source, /lyricsStyle=\{lyricsStyle\}/);
    assert.match(source, /normalizeLyricsStyleConfig\(timeline\.lyricsStyle\)/);
    assert.match(source, /maxBarHeight=\{shortSide \* 0\.16\}/);
    assert.match(source, /title=\{timeline\.songTitle\}/);
  });

  test("dispatches wave radio timelines to the wave radio composition", () => {
    const source = readFileSync(
      join(process.cwd(), "remotion-src/MusicVideoComposition.tsx"),
      "utf8",
    );

    assert.match(source, /WaveRadioComposition/);
    assert.match(source, /timeline\.templateId === "wave-radio"/);
    assert.match(source, /<WaveRadioComposition timeline=\{timeline\} \/>/);
  });

  test("renders wave radio with a looped remote-capable video and one active lyric line", () => {
    const source = readFileSync(
      join(process.cwd(), "remotion-src/WaveRadioComposition.tsx"),
      "utf8",
    );

    assert.match(source, /WAVE_RADIO_BACKGROUND_OPTIONS/);
    assert.match(source, /Video/);
    assert.match(source, /resolveRemotionMediaSrc/);
    assert.match(source, /findActiveCue/);
    assert.match(source, /SingleLineLyric/);
    assert.match(source, /interpolate/);
    assert.match(source, /Easing/);
    assert.doesNotMatch(source, /OffthreadVideo/);
    assert.doesNotMatch(source, /pauseWhenBuffering/);
    assert.doesNotMatch(source, /RadioWaveform/);
    assert.doesNotMatch(source, /useWindowedAudioData/);
    assert.doesNotMatch(source, /visualizeAudio/);
    assert.doesNotMatch(source, /background: "rgba\(2,6,23/);
    assert.doesNotMatch(source, /transition:/);
  });

  test("ships a deterministic canvas radial audio visualizer", () => {
    const source = readFileSync(
      join(process.cwd(), "remotion-src/RadialMusicVisualizer.tsx"),
      "utf8",
    );

    assert.match(source, /export type RadialVisualizerProps/);
    assert.match(source, /export function RadialVisualizer/);
    assert.match(source, /export function MainVideo/);
    assert.match(source, /useAudioData\(audioSrc\)/);
    assert.match(source, /visualizeAudio\(\{/);
    assert.match(source, /<Audio src=\{audioSrc\}/);
    assert.match(source, /canvasRef/);
    assert.match(source, /getContext\("2d"\)/);
    assert.match(source, /context\.lineCap = "round"/);
    assert.match(source, /context\.shadowBlur/);
    assert.match(source, /HIGH_FREQUENCY_RENDER_RATIO = 0\.65/);
    assert.match(source, /BASS_FREQUENCY_RATIO = 0\.15/);
    assert.match(source, /BASS_PULSE_FACTOR = 25/);
    assert.match(source, /COVER_LABEL_RADIUS_RATIO = 0\.43/);
    assert.match(source, /NEON_BASS_CYAN = "#00f0ff"/);
    assert.match(source, /NEON_BASS_VIOLET = "#7000ff"/);
    assert.match(source, /NEON_MID_AURORA = "#39ff88"/);
    assert.match(source, /NEON_TIP_MAGENTA = "#ff007f"/);
    assert.match(source, /NEON_TIP_YELLOW = "#ffee00"/);
    assert.match(source, /createMirroredFrequencies/);
    assert.match(
      source,
      /context\.createLinearGradient\(\s*startX,\s*startY,\s*endX,\s*endY,\s*\)/,
    );
    assert.match(source, /const opacity = 0\.3 \+ shapedEnergy \* 0\.7/);
    assert.match(
      source,
      /fitted\.radius \+ clamp\(bassEnergy\) \* BASS_PULSE_FACTOR/,
    );
    assert.match(source, /drawLyricsPanel/);
    assert.match(source, /findActiveLyricCue/);
    assert.match(source, /context\.rect\(panelX \+ 30, panelY \+ 12/);
    assert.doesNotMatch(source, /context\.roundRect\(panelX, panelY/);
    assert.doesNotMatch(source, /panelGradient\.addColorStop/);
    assert.doesNotMatch(source, /rgba\(173,235,255,0\.24\)/);
    assert.match(source, /centerY = height \* 0\.39/);
    assert.match(source, /getCoverFillRect/);
    assert.match(
      source,
      /filter = "blur\(42px\) saturate\(1\.55\) brightness\(0\.78\)"/,
    );
    assert.match(source, /else \{\s*context\.fillStyle = "#070a10"/);
    assert.match(source, /\.\.\.half\.slice\(\)\.reverse\(\)/);
    assert.match(source, /isPowerOfTwo/);
    assert.match(source, /DEFAULT_DENSITY/);
    assert.doesNotMatch(source, /AudioContext/);
    assert.doesNotMatch(source, /AnalyserNode/);
    assert.doesNotMatch(source, /requestAnimationFrame/);
  });
});
