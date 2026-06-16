import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  createSongShareToken,
  findSampleVersion,
  getVersionTimestampedLyrics,
  normalizeSongDuration,
} from "../../../lib/ai/final-song";

describe("final song helpers", () => {
  const versions = [
    {
      id: "provider-a",
      title: "Version A",
      audioUrl: "https://cdn.example.com/a.mp3",
    },
    {
      id: "provider-b",
      title: "Version B",
      audioUrl: "https://cdn.example.com/b.mp3",
    },
  ];

  test("finds a sample version by provider id", () => {
    assert.equal(findSampleVersion(versions, "provider-b")?.audioUrl, versions[1].audioUrl);
  });

  test("finds a sample version by A/B alias", () => {
    assert.equal(findSampleVersion(versions, "A")?.id, "provider-a");
    assert.equal(findSampleVersion(versions, "B")?.id, "provider-b");
  });

  test("creates non-guessable share tokens", () => {
    const first = createSongShareToken();
    const second = createSongShareToken();

    assert.match(first, /^song_[A-Za-z0-9_-]{32,}$/);
    assert.notEqual(first, second);
  });

  test("normalizes provider duration values for integer storage", () => {
    assert.equal(normalizeSongDuration("133.36"), 133);
    assert.equal(normalizeSongDuration(60.9), 60);
    assert.equal(normalizeSongDuration("bad"), null);
  });

  test("extracts timestamped lyrics from a selected provider version", () => {
    assert.deepEqual(
      getVersionTimestampedLyrics({
        id: "provider-a",
        title: "Version A",
        audioUrl: "https://cdn.example.com/a.mp3",
        timestampedLyrics: {
          alignedWords: [{ word: "Hello", startS: 1, endS: 1.4 }],
        },
      }),
      {
        alignedWords: [{ word: "Hello", startS: 1, endS: 1.4 }],
      },
    );
    assert.equal(getVersionTimestampedLyrics(versions[0]), null);
  });
});
