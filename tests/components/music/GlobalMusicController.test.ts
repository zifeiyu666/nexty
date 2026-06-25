import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("GlobalMusicController", () => {
  test("exposes a deferred global music player store for future integrations", () => {
    const source = readFileSync(
      join(process.cwd(), "lib/music-player/global-player-store.ts"),
      "utf8",
    );

    assert.match(source, /export type GlobalMusicTrack/);
    assert.match(source, /loadTrack: \(track: GlobalMusicTrack\) => void/);
    assert.match(source, /isVisible: true/);
    assert.match(source, /playTrack: \(track\) => set\(\{ track, isVisible: true, isPlaying: true \}\)/);
    assert.match(source, /clear: \(\) => set\(\{ isVisible: true, isPlaying: false, track: null \}\)/);
  });

  test("renders draggable hover-expand controls with playing wave state", () => {
    const source = readFileSync(
      join(process.cwd(), "components/music/GlobalMusicController.tsx"),
      "utf8",
    );

    assert.match(source, /data-global-music-controller/);
    assert.match(source, /No music playing/);
    assert.match(source, /Ready for the next song/);
    assert.match(source, /disabled=\{!track\}/);
    assert.match(source, /const CONTROL_SIZE = 48/);
    assert.match(source, /const EDGE_GAP = 16/);
    assert.match(source, /type DockSide = "left" \| "right"/);
    assert.match(source, /function getDockedPosition/);
    assert.match(source, /centerX < window\.innerWidth \/ 2 \? EDGE_GAP : maxX/);
    assert.match(source, /setDockSide\(getDockSide\(next\)\)/);
    assert.match(source, /dockSide === "right" \? "right-0 flex-row-reverse" : "left-0"/);
    assert.match(source, /onPointerDown/);
    assert.match(source, /onPointerMove/);
    assert.match(source, /event\.clientX - CONTROL_SIZE \/ 2/);
    assert.match(source, /Math\.hypot/);
    assert.match(source, /touch-none cursor-grab/);
    assert.doesNotMatch(source, /group-hover:px-/);
    assert.match(source, /dockSide === "right" \? "flex-row-reverse pl-1\.5" : "pr-1\.5"/);
    assert.match(source, /--global-music-controller-expanded-width/);
    assert.match(source, /\[data-global-music-controller\]:hover \[role="region"\]/);
    assert.match(source, /music-wave/);
    assert.match(source, /prefers-reduced-motion/);
    assert.match(source, /Drag or click to toggle/);
  });

  test("is mounted globally in the locale layout", () => {
    const source = readFileSync(
      join(process.cwd(), "app/[locale]/layout.tsx"),
      "utf8",
    );

    assert.match(source, /GlobalMusicController/);
    assert.match(source, /<GlobalMusicController \/>/);
  });

  test("is mounted in the non-locale site layout", () => {
    const source = readFileSync(
      join(process.cwd(), "app/(site)/layout.tsx"),
      "utf8",
    );

    assert.match(source, /GlobalMusicController/);
    assert.match(source, /<GlobalMusicController \/>/);
  });
});
