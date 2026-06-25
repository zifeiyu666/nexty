import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("GeneratedContentTabs", () => {
  test("renders music video history without wall art tabs", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/GeneratedContentTabs.tsx"),
      "utf8",
    );

    assert.doesNotMatch(source, /useState<GeneratedContentTab>/);
    assert.doesNotMatch(source, /WallArtEditorDrawer/);
    assert.doesNotMatch(source, /Wall Art/);
    assert.match(source, /Music Video Exports/);
    assert.match(source, /Music Video History/);
    assert.match(source, /MusicVideoEditorDrawer/);
    assert.match(source, /videos\.map/);
  });

  test("opens the music video editor from the empty music videos state", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/GeneratedContentTabs.tsx"),
      "utf8",
    );

    assert.match(source, /No music videos yet/);
    assert.match(source, /Generate Music Video/);
    assert.match(source, /songId=\{song\.id\}/);
    assert.match(source, /audioUrl=\{song\.audioUrl\}/);
    assert.match(source, /timestampedLyrics=\{song\.timestampedLyrics\}/);
  });

  test("song detail page renders generated content tabs with song and videos", () => {
    const source = readFileSync(
      join(
        process.cwd(),
        "app/[locale]/(basic-layout)/songs/[songId]/page.tsx",
      ),
      "utf8",
    );

    assert.match(source, /GeneratedContentTabs/);
    assert.match(source, /song=\{playerData\}/);
    assert.match(source, /videos=\{musicVideos\}/);
  });
});
