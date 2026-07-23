import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  addSpokenIntroToLyrics,
  mergeSpokenIntroTimeline,
} from "../../../lib/ai/spoken-intro";
import {
  DEFAULT_REPLICATE_WHISPER_MODEL,
  getReplicateWhisperModel,
  normalizeReplicateWhisperOutput,
} from "../../../lib/ai/spoken-intro-transcription";

describe("spoken intro timeline", () => {
  test("prefixes a text blessing once for Suno narration", () => {
    const lyrics = addSpokenIntroToLyrics("[Verse 1]\nHello", "Happy birthday");
    assert.match(lyrics, /^\[Spoken Intro \/ Narration\]\nHappy birthday/);
    assert.equal(addSpokenIntroToLyrics(lyrics, "Another blessing"), lyrics);
  });

  test("keeps recorded words at zero and offsets song words", () => {
    const timeline = mergeSpokenIntroTimeline({
      intro: { alignedWords: [{ word: "Hello", startS: 0.1, endS: 0.5 }] },
      songStartOffsetSeconds: 12.4,
      songTimeline: { alignedWords: [{ word: "Song", startS: 1, endS: 1.5 }] },
    });
    assert.deepEqual(timeline.alignedWords, [
      { word: "Hello", startS: 0.1, endS: 0.5 },
      { word: "Song", startS: 13.4, endS: 13.9 },
    ]);
  });

  test("maps Replicate Whisper segments into an internal timeline", () => {
    const result = normalizeReplicateWhisperOutput({
      transcription: "Hello and welcome",
      segments: [{ id: 0, start: 0, end: 3, text: " Hello and welcome" }],
    });
    assert.equal(result.transcript, "Hello and welcome");
    assert.equal(result.durationSeconds, 3);
    assert.deepEqual(result.alignedWords, [
      { word: "Hello", startS: 0, endS: 1 },
      { word: "and", startS: 1, endS: 2 },
      { word: "welcome", startS: 2, endS: 3 },
    ]);
  });

  test("maps incredibly-fast-whisper chunks into an internal timeline", () => {
    const result = normalizeReplicateWhisperOutput({
      text: "Hello and welcome",
      chunks: [
        { text: " Hello and", timestamp: [0, 2] },
        { text: " welcome", timestamp: [2, 3] },
      ],
    });

    assert.equal(result.transcript, "Hello and welcome");
    assert.equal(result.durationSeconds, 3);
    assert.deepEqual(result.alignedWords, [
      { word: "Hello", startS: 0, endS: 1 },
      { word: "and", startS: 1, endS: 2 },
      { word: "welcome", startS: 2, endS: 3 },
    ]);
  });

  test("migrates the retired openai/whisper model override", () => {
    assert.match(
      DEFAULT_REPLICATE_WHISPER_MODEL,
      /^vaibhavs10\/incredibly-fast-whisper:[a-f0-9]{64}$/,
    );
    assert.equal(
      getReplicateWhisperModel("openai/whisper"),
      DEFAULT_REPLICATE_WHISPER_MODEL,
    );
    assert.equal(
      getReplicateWhisperModel("vaibhavs10/incredibly-fast-whisper"),
      DEFAULT_REPLICATE_WHISPER_MODEL,
    );
    assert.equal(
      getReplicateWhisperModel("another-owner/whisper-model"),
      "another-owner/whisper-model",
    );
  });
});
