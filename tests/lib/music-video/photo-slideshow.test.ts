import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  buildPhotoSlideshowTimeline,
  buildLyricCuesFromAlignedWords,
  findActiveCue,
  parseTimestampedLyrics,
  resolveCuePhotos,
} from "@/lib/music-video/photo-slideshow";

const photos = [
  { id: "photo-1", name: "first.jpg", objectUrl: "blob:first" },
  { id: "photo-2", name: "second.jpg", objectUrl: "blob:second" },
  { id: "photo-3", name: "third.jpg", objectUrl: "blob:third" },
];

describe("photo slideshow music video helpers", () => {
  test("parses bracketed timestamp lyrics into cue start and end ranges", () => {
    const cues = parseTimestampedLyrics(
      "[00:00] Romantic prelude\n[00:06] The first time I met you\n[00:12] Sunlight in your eyes",
      30,
    );

    assert.deepEqual(
      cues.map((cue) => ({
        start: cue.start,
        end: cue.end,
        text: cue.text,
      })),
      [
        { start: 0, end: 6, text: "Romantic prelude" },
        { start: 6, end: 12, text: "The first time I met you" },
        { start: 12, end: 30, text: "Sunlight in your eyes" },
      ],
    );
  });

  test("parses plain timestamp lyrics without brackets", () => {
    const cues = parseTimestampedLyrics(
      "00:06 The first time I met you\n00:12 Sunlight in your eyes",
      24,
    );

    assert.equal(cues[0]?.start, 6);
    assert.equal(cues[0]?.end, 12);
    assert.equal(cues[0]?.text, "The first time I met you");
    assert.equal(cues[1]?.start, 12);
    assert.equal(cues[1]?.end, 24);
  });

  test("splits untimed lyrics evenly across the song duration", () => {
    const cues = parseTimestampedLyrics(
      "[Verse]\nline one\n\nline two\nline three",
      30,
    );

    assert.deepEqual(
      cues.map((cue) => ({
        start: cue.start,
        end: cue.end,
        text: cue.text,
      })),
      [
        { start: 0, end: 10, text: "line one" },
        { start: 10, end: 20, text: "line two" },
        { start: 20, end: 30, text: "line three" },
      ],
    );
  });

  test("returns a usable fallback cue for empty lyrics", () => {
    assert.deepEqual(parseTimestampedLyrics("", 18), [
      { id: "cue-1", start: 0, end: 18, text: "Instrumental" },
    ]);
  });

  test("resolves each cue to its explicitly assigned photo", () => {
    const cues = parseTimestampedLyrics("[00:00] A\n[00:04] B\n[00:08] C", 12);

    const resolved = resolveCuePhotos({
      cues,
      photos,
      assignments: [
        { cueId: "cue-1", photoId: "photo-1" },
        { cueId: "cue-2", photoId: "photo-2" },
        { cueId: "cue-3", photoId: "photo-3" },
      ],
      fallbackImageUrl: "cover.jpg",
    });

    assert.deepEqual(
      resolved.map((item) => item.photo?.id),
      ["photo-1", "photo-2", "photo-3"],
    );
  });

  test("unassigned cues inherit the previous assigned photo", () => {
    const cues = parseTimestampedLyrics("[00:00] A\n[00:04] B\n[00:08] C", 12);

    const resolved = resolveCuePhotos({
      cues,
      photos,
      assignments: [
        { cueId: "cue-1", photoId: "photo-1" },
        { cueId: "cue-3", photoId: "photo-2" },
      ],
      fallbackImageUrl: "cover.jpg",
    });

    assert.deepEqual(
      resolved.map((item) => item.photo?.id),
      ["photo-1", "photo-1", "photo-2"],
    );
  });

  test("leading unassigned cues use the first uploaded photo", () => {
    const cues = parseTimestampedLyrics("[00:00] A\n[00:04] B", 8);

    const resolved = resolveCuePhotos({
      cues,
      photos,
      assignments: [{ cueId: "cue-2", photoId: "photo-2" }],
      fallbackImageUrl: "cover.jpg",
    });

    assert.deepEqual(
      resolved.map((item) => item.photo?.id),
      ["photo-1", "photo-2"],
    );
  });

  test("falls back to song artwork when no photos are uploaded", () => {
    const cues = parseTimestampedLyrics("[00:00] A", 6);

    const resolved = resolveCuePhotos({
      cues,
      photos: [],
      assignments: [],
      fallbackImageUrl: "cover.jpg",
    });

    assert.equal(resolved[0]?.photo?.objectUrl, "cover.jpg");
    assert.equal(resolved[0]?.photo?.name, "Song artwork");
  });

  test("finds the active cue for a playback time", () => {
    const cues = parseTimestampedLyrics("[00:00] A\n[00:04] B\n[00:08] C", 12);

    assert.equal(findActiveCue(cues, 0)?.text, "A");
    assert.equal(findActiveCue(cues, 4)?.text, "B");
    assert.equal(findActiveCue(cues, 11.9)?.text, "C");
    assert.equal(findActiveCue(cues, 99)?.text, "C");
  });

  test("builds the render payload for the selected slideshow template", () => {
    const timeline = buildPhotoSlideshowTimeline({
      songTitle: "Our Song",
      audioUrl: "song.mp3",
      duration: 12,
      lyrics: "[00:00] A\n[00:06] B",
      photos,
      assignments: [{ cueId: "cue-2", photoId: "photo-2" }],
    });

    assert.equal(timeline.templateId, "photo-slideshow");
    assert.equal(timeline.songTitle, "Our Song");
    assert.equal(timeline.audioUrl, "song.mp3");
    assert.deepEqual(
      timeline.lyrics.map((cue) => cue.text),
      ["A", "B"],
    );
    assert.deepEqual(timeline.assignments, [
      { cueId: "cue-2", photoId: "photo-2" },
    ]);
  });

  test("builds lyric cues from KIE aligned words using original lyric lines", () => {
    const cues = buildLyricCuesFromAlignedWords({
      lyrics: "[Verse 1]\nHello world\nThis is us",
      alignedWords: [
        { word: "Hello", startS: 1.1, endS: 1.4 },
        { word: "world", startS: 1.45, endS: 1.9 },
        { word: "This", startS: 3, endS: 3.2 },
        { word: "is", startS: 3.25, endS: 3.35 },
        { word: "us", startS: 3.4, endS: 3.7 },
      ],
      duration: 8,
    });

    assert.deepEqual(
      cues.map((cue) => ({
        start: cue.start,
        end: cue.end,
        text: cue.text,
      })),
      [
        { start: 1.1, end: 1.9, text: "Hello world" },
        { start: 3, end: 3.7, text: "This is us" },
      ],
    );
  });
});
