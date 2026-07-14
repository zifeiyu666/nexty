import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("MemoryToSongProof homepage section", () => {
  test("is temporarily hidden from the homepage", async () => {
    const homeSource = await readFile(
      join(process.cwd(), "components/home/index.tsx"),
      "utf8",
    );

    assert.doesNotMatch(homeSource, /import MemoryToSongProof/);
    assert.doesNotMatch(homeSource, /<MemoryToSongProof \/>/);
  });

  test("includes every evidence stage and a playable existing demo", async () => {
    const componentSource = await readFile(
      join(process.cwd(), "components/home/MemoryToSongProof.tsx"),
      "utf8",
    );

    for (const stage of [
      "The memory",
      "First lyrics",
      "Your revision",
      "Song preview",
      "The finished gift",
    ]) {
      assert.match(componentSource, new RegExp(stage));
    }

    assert.match(componentSource, /PlaylistPlayButton/);
    assert.match(componentSource, /useGlobalMusicPlayer/);
    assert.match(componentSource, /memory-proof-wave/);
    assert.match(componentSource, /w-0\.5/);
    assert.match(componentSource, /anniversary-ten-years-ava\.mp3/);
    assert.match(componentSource, /See what one memory can become\./);
    assert.match(componentSource, /min-h-\[450px\][^\n]*lg:h-\[450px\]/);
    assert.equal(componentSource.match(/lg:h-\[450px\]/g)?.length, 5);
    assert.match(componentSource, /min-h-\[290px\] flex-1[^\n]*lg:min-h-0/);
    assert.doesNotMatch(componentSource, /h-\[calc\(100%-2\.25rem\)\]/);
  });
});
