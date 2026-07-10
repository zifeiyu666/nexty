import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("GlobalMusicController", () => {
  test("exposes global audio state and controls for integrations", () => {
    const source = readFileSync(
      join(process.cwd(), "lib/music-player/global-player-store.ts"),
      "utf8",
    );

    assert.match(source, /export type GlobalMusicTrack/);
    assert.match(source, /audioUrl: string/);
    assert.match(source, /currentTime: number/);
    assert.match(source, /duration: number/);
    assert.match(source, /volume: number/);
    assert.match(source, /loadTrack: \(track: GlobalMusicTrack\) => void/);
    assert.match(source, /setCurrentTime: \(currentTime: number\) => void/);
    assert.match(source, /setDuration: \(duration: number\) => void/);
    assert.match(source, /setVolume: \(volume: number\) => void/);
    assert.match(source, /let registeredAudio: HTMLAudioElement \| null = null/);
    assert.match(source, /export function registerGlobalMusicAudio/);
    assert.match(source, /syncAudioTrack\(track\)/);
    assert.match(source, /registeredAudio\?\.play\(\)\.catch/);
    assert.match(source, /isVisible: true/);
    assert.match(source, /volume: 0\.72/);
    assert.match(source, /function getTrackDuration/);
    assert.match(source, /playTrack: \(track\) =>/);
    assert.match(source, /isPlaying: true/);
    assert.match(source, /currentTime: 0/);
    assert.match(source, /duration: getTrackDuration\(track\)/);
    assert.match(source, /clear: \(\) =>/);
    assert.match(source, /track: null/);
  });

  test("renders draggable hover-expand controls backed by a global audio element", () => {
    const source = readFileSync(
      join(process.cwd(), "components/music/GlobalMusicController.tsx"),
      "utf8",
    );

    assert.match(source, /const audioRef = useRef<HTMLAudioElement \| null>\(null\)/);
    assert.match(source, /const setAudioElement = useCallback/);
    assert.match(source, /registerGlobalMusicAudio\(audio\)/);
    assert.match(source, /<audio/);
    assert.match(source, /ref=\{setAudioElement\}/);
    assert.match(source, /audio\.src = track\.audioUrl/);
    assert.match(source, /audio\.getAttribute\("src"\) !== track\.audioUrl/);
    assert.match(source, /audio\.play\(\)\.catch\(\(\) => pause\(\)\)/);
    assert.match(source, /onTimeUpdate/);
    assert.match(source, /setCurrentTime\(event\.currentTarget\.currentTime\)/);
    assert.match(source, /onVolumeChange/);
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
    assert.match(source, /data-global-music-click-control/);
    assert.match(source, /data-global-music-toggle-handle/);
    assert.match(source, /togglesOnRelease/);
    assert.match(source, /target\.closest\("\[data-global-music-click-control\]"\)/);
    assert.match(source, /grid h-6 grid-flow-col place-items-center/);
    assert.match(source, /w-\[1\.5px\]/);
    assert.match(source, /animate-\[music-wave_1\.48s_ease-in-out_infinite\]/);
    assert.match(source, /--music-wave-height/);
    assert.match(source, /grid size-12.*place-items-center/);
    assert.match(source, /left-1\/2 top-1\/2/);
    assert.match(source, /touch-none cursor-grab/);
    assert.doesNotMatch(source, /group-hover:px-/);
    assert.match(source, /dockSide === "right" \? "flex-row-reverse pl-1\.5" : "pr-1\.5"/);
    assert.match(source, /--global-music-controller-expanded-width/);
    assert.match(source, /\[data-global-music-controller\]:hover \[role="region"\]/);
    assert.match(source, /music-wave/);
    assert.match(source, /prefers-reduced-motion/);
    assert.match(source, /Drag or click to toggle/);
  });

  test("song detail owner player delegates playback to the global controller", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/FinalSongPlayer.tsx"),
      "utf8",
    );

    const ownerPlayerIndex = source.indexOf("export function FinalSongOwnerPlayer");
    assert.notEqual(ownerPlayerIndex, -1, "FinalSongOwnerPlayer should exist");
    const ownerPlayerSource = source.slice(ownerPlayerIndex);

    assert.match(ownerPlayerSource, /useGlobalMusicPlayer/);
    assert.match(ownerPlayerSource, /isCurrentGlobalTrack/);
    assert.match(ownerPlayerSource, /playTrack\(\{/);
    assert.match(ownerPlayerSource, /audioUrl: data\.audioUrl/);
    assert.match(ownerPlayerSource, /artworkUrl: data\.imageUrl \|\| undefined/);
    assert.match(ownerPlayerSource, /toggle\(\)/);
    assert.doesNotMatch(ownerPlayerSource, /const audioRef = useRef<HTMLAudioElement \| null>/);
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
