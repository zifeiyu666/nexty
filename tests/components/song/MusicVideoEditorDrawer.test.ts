import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("MusicVideoEditorDrawer", () => {
  test("exposes the three-panel music video studio surface", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /Music Video Studio/);
    assert.match(source, /Templates/);
    assert.match(source, /Live Preview/);
    assert.match(source, /Photo Upload/);
    assert.match(source, /Lyrics Storyline/);
    assert.match(source, /Render MV/);
  });

  test("ships only the photo slideshow template as editable in v1", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /Photo Stream Memory Slideshow/);
    assert.match(source, /Minimal Vinyl Record/);
    assert.match(source, /Dynamic Wave Radio/);
    assert.match(source, /Coming soon/);
  });

  test("keeps the right editor panel vertically scrollable", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/MusicVideoEditorDrawer.tsx"),
      "utf8",
    );

    assert.match(source, /data-music-video-editor-scroll/);
    assert.match(source, /overflow-y-auto/);
  });
});
