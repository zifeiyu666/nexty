import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  ATMOSPHERE_OVERLAY_OPTIONS,
  buildEvenPhotoAssignments,
  buildMinimalVinylTimeline,
  buildPhotoSlideshowTimeline,
  buildWaveRadioTimeline,
  buildRandomTransitionAssignments,
  buildLyricCuesFromAlignedWords,
  DEFAULT_TRANSITION_TYPE,
  DEFAULT_LYRICS_STYLE,
  DEFAULT_WAVE_RADIO_BACKGROUND,
  normalizeLyricsStyleConfig,
  normalizeWaveRadioBackgroundId,
  WAVE_RADIO_BACKGROUND_OPTIONS,
  getUploadedMediaType,
  findActiveCue,
  parseTimestampedLyrics,
  resolveCuePhotos,
  shouldShowPhotoTransition,
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

  test("tracks uploaded video assets as media that can be assigned to cues", () => {
    const cues = parseTimestampedLyrics("[00:00] A\n[00:04] B", 8);
    const media = [
      photos[0],
      {
        id: "video-1",
        mediaType: "video" as const,
        name: "clip.mp4",
        objectUrl: "blob:clip",
      },
    ];

    const resolved = resolveCuePhotos({
      cues,
      photos: media,
      assignments: [{ cueId: "cue-2", photoId: "video-1" }],
      fallbackImageUrl: "cover.jpg",
    });

    assert.equal(getUploadedMediaType(resolved[0]?.photo), "image");
    assert.equal(getUploadedMediaType(resolved[1]?.photo), "video");
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

  test("builds a cover photo into the timeline when no photos are uploaded", () => {
    const timeline = buildPhotoSlideshowTimeline({
      songTitle: "Our Song",
      audioUrl: "song.mp3",
      duration: 12,
      lyrics: "[00:00] A\n[00:06] B",
      photos: [],
      assignments: [],
      fallbackImageUrl: "https://cdn.example.com/cover.jpg",
    });

    assert.equal(timeline.coverPhoto?.id, "song-artwork");
    assert.equal(timeline.coverPhoto?.objectUrl, "https://cdn.example.com/cover.jpg");
    assert.equal(timeline.coverPhoto?.url, "https://cdn.example.com/cover.jpg");
    assert.equal(timeline.coverPhoto?.isCover, true);
  });

  test("creates cross dissolve transitions between adjacent lyric cues by default", () => {
    const timeline = buildPhotoSlideshowTimeline({
      songTitle: "Our Song",
      audioUrl: "song.mp3",
      duration: 18,
      lyrics: "[00:00] A\n[00:06] B\n[00:12] C",
      photos,
      assignments: [],
    });

    assert.deepEqual(timeline.transitions, [
      { fromCueId: "cue-1", toCueId: "cue-2", type: DEFAULT_TRANSITION_TYPE },
      { fromCueId: "cue-2", toCueId: "cue-3", type: DEFAULT_TRANSITION_TYPE },
    ]);
  });

  test("keeps custom transition choices when building the timeline", () => {
    const timeline = buildPhotoSlideshowTimeline({
      songTitle: "Our Song",
      audioUrl: "song.mp3",
      duration: 12,
      lyrics: "[00:00] A\n[00:06] B",
      photos,
      assignments: [],
      transitions: [
        { fromCueId: "cue-1", toCueId: "cue-2", type: "light-leak" },
      ],
    });

    assert.deepEqual(timeline.transitions, [
      { fromCueId: "cue-1", toCueId: "cue-2", type: "light-leak" },
    ]);
  });

  test("sets photos only at evenly spaced change points for one-click movies", () => {
    const cues = parseTimestampedLyrics(
      "[00:00] A\n[00:04] B\n[00:08] C\n[00:12] D\n[00:16] E\n[00:20] F",
      24,
    );

    const assignments = buildEvenPhotoAssignments({ cues, photos });

    assert.deepEqual(assignments, [
      { cueId: "cue-3", photoId: "photo-2" },
      { cueId: "cue-5", photoId: "photo-3" },
    ]);
  });

  test("randomizes one-click movie transitions with an injectable random source", () => {
    const cues = parseTimestampedLyrics(
      "[00:00] A\n[00:04] B\n[00:08] C\n[00:12] D",
      16,
    );
    const randomValues = [0, 0.3, 0.99];
    let randomIndex = 0;

    const transitions = buildRandomTransitionAssignments({
      cues,
      random: () => randomValues[randomIndex++] ?? 0,
    });

    assert.deepEqual(transitions, [
      { fromCueId: "cue-1", toCueId: "cue-2", type: "cross-dissolve" },
      { fromCueId: "cue-2", toCueId: "cue-3", type: "motion-blur" },
      { fromCueId: "cue-3", toCueId: "cue-4", type: "zoom-push" },
    ]);
  });

  test("shows transition controls only when adjacent cues use different photos", () => {
    assert.equal(
      shouldShowPhotoTransition({ fromPhotoId: "photo-1", toPhotoId: "photo-1" }),
      false,
    );
    assert.equal(
      shouldShowPhotoTransition({ fromPhotoId: "photo-1", toPhotoId: "photo-2" }),
      true,
    );
    assert.equal(
      shouldShowPhotoTransition({ fromPhotoId: null, toPhotoId: "photo-2" }),
      false,
    );
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

  test("carries lyric style settings in the slideshow render payload", () => {
    const timeline = buildPhotoSlideshowTimeline({
      songTitle: "Our Song",
      audioUrl: "song.mp3",
      duration: 12,
      lyrics: "[00:00] A\n[00:06] B",
      photos,
      assignments: [],
      lyricsStyle: {
        ...DEFAULT_LYRICS_STYLE,
        color: "#fdf2f8",
        fontFamily: "Caveat, cursive",
        entrance: "staggered-glow-reveal",
        fontSize: 72,
        position: "top",
        strokeColor: "#111827",
        strokeWidth: 4,
      },
    });

    assert.deepEqual(timeline.lyricsStyle, {
      ...DEFAULT_LYRICS_STYLE,
      color: "#fdf2f8",
      fontFamily: "Caveat, cursive",
      entrance: "staggered-glow-reveal",
      fontSize: 72,
      position: "top",
      strokeColor: "#111827",
      strokeWidth: 4,
    });
  });

  test("carries atmosphere overlay settings in the slideshow render payload", () => {
    const timeline = buildPhotoSlideshowTimeline({
      songTitle: "Our Song",
      audioUrl: "song.mp3",
      duration: 12,
      lyrics: "[00:00] A\n[00:06] B",
      photos,
      assignments: [],
      atmosphereOverlay: {
        opacity: 0.42,
        overlayId: ATMOSPHERE_OVERLAY_OPTIONS[0].id,
      },
    });

    assert.deepEqual(timeline.atmosphereOverlay, {
      opacity: 0.42,
      overlayId: ATMOSPHERE_OVERLAY_OPTIONS[0].id,
    });
  });

  test("normalizes legacy empty lyric entrance to motion blur slip", () => {
    assert.deepEqual(
      normalizeLyricsStyleConfig({
        ...DEFAULT_LYRICS_STYLE,
        entrance: "",
      }),
      DEFAULT_LYRICS_STYLE,
    );
  });

  test("preserves all supported lyric entrance modes", () => {
    assert.equal(
      normalizeLyricsStyleConfig({
        ...DEFAULT_LYRICS_STYLE,
        entrance: "motion-blur-slip",
      }).entrance,
      "motion-blur-slip",
    );
    assert.equal(
      normalizeLyricsStyleConfig({
        ...DEFAULT_LYRICS_STYLE,
        entrance: "staggered-glow-reveal",
      }).entrance,
      "staggered-glow-reveal",
    );
    assert.equal(
      normalizeLyricsStyleConfig({
        ...DEFAULT_LYRICS_STYLE,
        entrance: "rolling-flow",
      }).entrance,
      "rolling-flow",
    );
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

  test("builds a minimal vinyl timeline without requiring photos", () => {
    const timeline = buildMinimalVinylTimeline({
      songTitle: "Our Song",
      audioUrl: "https://cdn.example.com/song.mp3",
      duration: 16,
      lyrics: "[00:00] Verse line\n[00:08] Chorus line",
      fallbackImageUrl: "https://cdn.example.com/cover.jpg",
      lyricsStyle: {
        ...DEFAULT_LYRICS_STYLE,
        color: "#fef3c7",
        fontFamily: "Georgia, serif",
        fontSize: 54,
        position: "bottom",
        strokeColor: "#111111",
        strokeWidth: 0,
      },
    });

    assert.equal(timeline.templateId, "minimal-vinyl");
    assert.equal(timeline.audioUrl, "https://cdn.example.com/song.mp3");
    assert.equal(timeline.duration, 16);
    assert.deepEqual(timeline.photos, []);
    assert.deepEqual(timeline.assignments, []);
    assert.deepEqual(timeline.transitions, []);
    assert.equal(timeline.coverPhoto?.url, "https://cdn.example.com/cover.jpg");
    assert.equal(timeline.lyricsStyle?.fontFamily, "Georgia, serif");
    assert.equal(timeline.lyricsStyle?.fontSize, 54);
    assert.equal(timeline.lyricsStyle?.position, "bottom");
    assert.deepEqual(
      timeline.lyrics.map((cue) => cue.text),
      ["Verse line", "Chorus line"],
    );
  });

  test("normalizes wave radio background choices to a CDN video", () => {
    assert.equal(
      normalizeWaveRadioBackgroundId(WAVE_RADIO_BACKGROUND_OPTIONS[1].id),
      WAVE_RADIO_BACKGROUND_OPTIONS[1].id,
    );
    assert.equal(
      normalizeWaveRadioBackgroundId("missing-background"),
      DEFAULT_WAVE_RADIO_BACKGROUND.id,
    );
  });

  test("serves overlay presets from the CDN instead of local public assets", () => {
    const overlayOptions = [
      ...ATMOSPHERE_OVERLAY_OPTIONS,
      ...WAVE_RADIO_BACKGROUND_OPTIONS,
    ];

    assert.equal(overlayOptions.length > 0, true);

    for (const option of overlayOptions) {
      assert.match(option.src, /^https:\/\/cdn\.customsong\.top\/overlay\//);
      assert.doesNotMatch(option.src, /^\/overlay\//);
    }

    assert.match(
      WAVE_RADIO_BACKGROUND_OPTIONS.find(
        (option) => option.id === "blue-current-277316",
      )?.src ?? "",
      /\/overlay\/bg-video\/720p\/277316\.mp4$/,
    );
  });

  test("builds a wave radio timeline with centered single-line lyrics", () => {
    const timeline = buildWaveRadioTimeline({
      songTitle: "Our Song",
      audioUrl: "https://cdn.example.com/song.mp3",
      duration: 16,
      lyrics: "[00:00] Verse line\n[00:08] Chorus line",
      waveRadioBackgroundId: WAVE_RADIO_BACKGROUND_OPTIONS[2].id,
      lyricsStyle: {
        ...DEFAULT_LYRICS_STYLE,
        color: "#f8fafc",
        fontSize: 64,
        position: "bottom",
      },
    });

    assert.equal(timeline.templateId, "wave-radio");
    assert.equal(timeline.waveRadioBackgroundId, WAVE_RADIO_BACKGROUND_OPTIONS[2].id);
    assert.deepEqual(timeline.photos, []);
    assert.deepEqual(timeline.assignments, []);
    assert.deepEqual(timeline.transitions, []);
    assert.equal(timeline.lyricsStyle?.position, "center");
    assert.deepEqual(
      timeline.lyrics.map((cue) => cue.text),
      ["Verse line", "Chorus line"],
    );
  });
});
