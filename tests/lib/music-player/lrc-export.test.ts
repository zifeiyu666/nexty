import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { buildLrcFileName, buildLrcText } from "@/lib/music-player/lrc-export";

describe("LRC lyrics export", () => {
  test("builds a safe .lrc file name from the song title", () => {
    assert.equal(buildLrcFileName("A/B: Song?"), "A B Song.lrc");
    assert.equal(buildLrcFileName("  "), "lyrics.lrc");
  });

  test("exports timestamped lyric lines from aligned word data", () => {
    const lrc = buildLrcText({
      title: "Our Song",
      duration: 125.43,
      lyrics: "Title: Our Song\n\n[Verse 1]\nHello world\nThis is us",
      timestampedLyrics: {
        alignedWords: [
          { word: "Hello", startS: 1.1, endS: 1.4 },
          { word: "world", startS: 1.45, endS: 1.9 },
          { word: "This", startS: 3, endS: 3.2 },
          { word: "is", startS: 3.25, endS: 3.35 },
          { word: "us", startS: 3.4, endS: 3.7 },
        ],
      },
    });

    assert.equal(
      lrc,
      [
        "[ti:Our Song]",
        "[length:02:05]",
        "[by:CustomSong]",
        "[offset:0]",
        "",
        "[00:01.10]Hello world",
        "[00:03.00]This is us",
        "",
      ].join("\n"),
    );
  });

  test("falls back to evenly timed lyric lines when aligned words are unavailable", () => {
    const lrc = buildLrcText({
      title: "Untimed",
      duration: 10,
      lyrics: "[Verse]\nLine one\nLine two",
    });

    assert.match(lrc, /\[00:00\.00\]Line one/);
    assert.match(lrc, /\[00:05\.00\]Line two/);
  });
});
