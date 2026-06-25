import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("SharedSongFullscreenPlayer", () => {
  test("share route uses the fullscreen player outside the basic layout group", () => {
    const newRoute = join(
      process.cwd(),
      "app/[locale]/shared/songs/[shareToken]/page.tsx",
    );
    const oldRoute = join(
      process.cwd(),
      "app/[locale]/(basic-layout)/shared/songs/[shareToken]/page.tsx",
    );
    const source = readFileSync(newRoute, "utf8");

    assert.equal(existsSync(oldRoute), false);
    assert.match(source, /SharedSongFullscreenPlayer/);
    assert.doesNotMatch(source, /SharedSongPlayer/);
  });

  test("implements the immersive shared player controls and branding", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/SharedSongFullscreenPlayer.tsx"),
      "utf8",
    );

    assert.match(source, /CoverBackdrop/);
    assert.match(source, /blur-3xl/);
    assert.match(source, /LyricsStage/);
    assert.match(source, /scrollTo/);
    assert.match(source, /h-svh max-h-svh/);
    assert.match(source, /scrollbar-width:none/);
    assert.match(source, /PlaybackController/);
    assert.match(source, /backdrop-blur-2xl/);
    assert.match(source, /Create my song/);
    assert.match(source, /BrandWordmark/);
    assert.match(source, /Gift for/);
    assert.match(source, /GiftStoryPrompt/);
    assert.match(source, /NotebookPen/);
    assert.match(source, /Gift note/);
    assert.match(source, /data\.story/);
    assert.match(source, /href="\/"/);
    assert.match(source, /href="\/create-song"/);
    assert.match(source, /onVolumeChange/);
  });
});
