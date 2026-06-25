import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("FinalSongPlayer music video entry", () => {
  test("wires Music Video to the editor instead of the coming soon card", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/FinalSongPlayer.tsx"),
      "utf8",
    );

    const musicVideoIndex = source.indexOf("Music Video");
    assert.notEqual(musicVideoIndex, -1, "Music Video card should exist");
    assert.match(source, /MusicVideoEditorDrawer/);
    assert.match(source, /songId=\{data\.id\}/);
    assert.equal(
      source.includes("Coming soon"),
      false,
      "Music Video should no longer be marked as coming soon",
    );
  });
});
