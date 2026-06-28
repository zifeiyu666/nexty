import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  DEFAULT_REPLICATE_GPT5_MODEL,
  getReplicateGpt5LyricsModel,
  normalizeReplicateTextOutput,
} from "../../../lib/ai/adapters/replicate-gpt5";
import {
  applyLyricsLineRewrite,
  buildLyricsLineRewritePrompt,
  composeLyricsText,
  createLyricsLineRewriteSuggestions,
  SONG_LYRICS_SAFETY_AND_FORMATTING_GUIDELINES,
  parseLyricsText,
} from "../../../lib/ai/song-lyrics";
import { buildLyricsPrompt, buildStoryPrompt } from "../../../lib/ai/song";
import {
  createSongSampleFromTask,
  getSampleAccessExpiresAt,
} from "../../../lib/ai/song-sample-store";

describe("song lyrics prompt", () => {
  test("builds an English lyric prompt with user customization", () => {
    const prompt = buildLyricsPrompt({
      occasion: "mothers-day",
      genre: "Acoustic Folk",
      language: "English",
      recipientNames: ["Mom"],
      story: "She always sang while cooking dinner and told me to be brave.",
      vocalGender: "Female",
    });

    assert.match(prompt, /internationally experienced music producer/i);
    assert.match(prompt, /Lyrics language: English/);
    assert.match(prompt, /Core Safety & Compliance Guidelines/i);
    assert.match(prompt, /politically sensitive/i);
    assert.match(prompt, /Do not directly copy, splice, paraphrase, or rewrite/i);
    assert.match(prompt, /recognizable public figure/i);
    assert.match(prompt, /抱歉，您输入的内容包含敏感信息或可能引发版权争议，请调整提示词后重试。/);
    assert.match(prompt, /Rhyme/i);
    assert.match(prompt, /Singability/i);
    assert.match(prompt, /Music style \/ genre: Acoustic Folk/);
    assert.match(prompt, /Occasion \/ specific holiday: Mothers Day/);
    assert.match(prompt, /\[Verse 1\]/);
    assert.match(prompt, /\[Chorus\]/);
    assert.match(prompt, /She always sang while cooking dinner/);
  });

  test("adds optional new-version direction to the lyric prompt", () => {
    const prompt = buildLyricsPrompt({
      occasion: "birthday",
      genre: "Romantic Ballad",
      language: "English",
      recipientNames: ["Maya"],
      story: "Maya lights up every room and loves late-night piano songs.",
      vocalGender: "Female",
      userRevisionInstruction:
        "Add Maya's name to the title and make the whole song more romantic.",
    });

    assert.match(prompt, /Additional New Version Direction/i);
    assert.match(prompt, /Add Maya's name to the title/);
    assert.match(prompt, /more romantic/);
  });
});

describe("song story prompt", () => {
  test("builds a lyric-ready story prompt from helper answers", () => {
    const prompt = buildStoryPrompt({
      occasion: "mothers-day",
      genre: "Acoustic Folk",
      language: "English",
      recipients: [{ name: "Maya", relationship: "Mom" }],
      recipientNames: ["Maya"],
      recipientRelationships: ["Mom"],
      vocalGender: "Female",
      answers: [
        {
          question: "What do you admire most about them?",
          answer: "Kind and caring",
        },
        {
          question: "Share one short example.",
          answer: "She sang while cooking Sunday dinner.",
        },
      ],
    });

    assert.match(prompt, /careful story editor/i);
    assert.match(prompt, /Recipient\(s\): Maya \(Mom\)/);
    assert.match(prompt, /Occasion: Mothers Day/);
    assert.match(prompt, /Target lyrics language: English/);
    assert.match(prompt, /entirely in English/);
    assert.match(prompt, /Music style \/ genre: Acoustic Folk/);
    assert.match(prompt, /Vocal direction: Female/);
    assert.match(prompt, /What do you admire most about them\?/);
    assert.match(prompt, /Kind and caring/);
    assert.match(prompt, /She sang while cooking Sunday dinner/);
    assert.match(prompt, /Do not invent new facts/i);
    assert.match(prompt, /Do not write lyrics/i);
    assert.match(prompt, /Do not pad the story to reach a target word count/i);
    assert.match(prompt, /shorter faithful story/i);
  });

  test("builds a story polish prompt from existing story text", () => {
    const prompt = buildStoryPrompt({
      occasion: "anniversary",
      genre: "Romantic Ballad",
      language: "Chinese",
      recipientNames: ["Lina"],
      recipientRelationships: ["Wife"],
      vocalGender: "Female",
      sourceStory:
        "Lina and I met at a bookstore. We still dance in the kitchen after midnight.",
      answers: [],
    });

    assert.match(prompt, /Source Story To Polish/i);
    assert.match(prompt, /Lina and I met at a bookstore/);
    assert.match(prompt, /Template Marker Meanings/i);
    assert.match(prompt, /\[Nickname: \]/);
    assert.match(prompt, /\[Remember when we: \]/);
    assert.match(prompt, /\[Their funny habit\/quirk: \]/);
    assert.match(prompt, /\[Something they are proud of: \]/);
    assert.match(prompt, /Do not output the bracketed template labels/i);
    assert.match(prompt, /entirely in Chinese/);
    assert.match(prompt, /Do not invent new facts/i);
    assert.match(prompt, /If the user provides only simple details/i);
    assert.match(prompt, /do not add imagined scenes/i);
    assert.match(prompt, /preserve the user's facts/i);
  });
});

describe("Replicate GPT-5 lyrics adapter", () => {
  test("defaults create-song lyrics to openai/gpt-5", () => {
    const previousModel = process.env.REPLICATE_LYRICS_MODEL;
    delete process.env.REPLICATE_LYRICS_MODEL;

    try {
      assert.equal(getReplicateGpt5LyricsModel(), DEFAULT_REPLICATE_GPT5_MODEL);
    } finally {
      if (previousModel === undefined) {
        delete process.env.REPLICATE_LYRICS_MODEL;
      } else {
        process.env.REPLICATE_LYRICS_MODEL = previousModel;
      }
    }
  });

  test("normalizes Replicate text outputs from strings and arrays", () => {
    assert.equal(normalizeReplicateTextOutput("Title: One"), "Title: One");
    assert.equal(
      normalizeReplicateTextOutput(["Title: ", "One", "\n[Verse 1]"]),
      "Title: One\n[Verse 1]"
    );
    assert.equal(
      normalizeReplicateTextOutput({ output: ["Line ", "one"] }),
      "Line one"
    );
  });
});

describe("song lyrics line editing", () => {
  test("keeps shared safety and formatting rules in English", () => {
    assert.match(
      SONG_LYRICS_SAFETY_AND_FORMATTING_GUIDELINES,
      /Core Safety & Compliance Guidelines/i
    );
    assert.match(
      SONG_LYRICS_SAFETY_AND_FORMATTING_GUIDELINES,
      /Do not directly copy, splice, paraphrase, or rewrite/i
    );
    assert.match(
      SONG_LYRICS_SAFETY_AND_FORMATTING_GUIDELINES,
      /recognizable public figure/i
    );
    assert.match(
      SONG_LYRICS_SAFETY_AND_FORMATTING_GUIDELINES,
      /standard English bracketed section tags/i
    );
    assert.match(
      SONG_LYRICS_SAFETY_AND_FORMATTING_GUIDELINES,
      /抱歉，您输入的内容包含敏感信息或可能引发版权争议，请调整提示词后重试。/
    );
  });

  test("parses title, section labels, blank lines, and lyric lines", () => {
    const lines = parseLyricsText(`Title: Kitchen Light

[Verse 1]
She sang above the Sunday steam
Brave little hands, brave little dream`);

    assert.deepEqual(lines, [
      { id: "line-0", kind: "title", text: "Title: Kitchen Light" },
      { id: "line-1", kind: "blank", text: "" },
      { id: "line-2", kind: "section", text: "[Verse 1]" },
      { id: "line-3", kind: "lyric", text: "She sang above the Sunday steam" },
      { id: "line-4", kind: "lyric", text: "Brave little hands, brave little dream" },
    ]);
  });

  test("composes edited lyric lines back into song text", () => {
    const text = composeLyricsText([
      { id: "line-0", kind: "section", text: "[Chorus]" },
      { id: "line-1", kind: "lyric", text: "Keep the porch light burning" },
      { id: "line-2", kind: "blank", text: "" },
      { id: "line-3", kind: "lyric", text: "I am finding my way home" },
    ]);

    assert.equal(
      text,
      "[Chorus]\nKeep the porch light burning\n\nI am finding my way home"
    );
  });

  test("replaces only selected lines with rewritten lyric lines", () => {
    const lines = parseLyricsText(`[Verse 1]
Original first line
Original second line
Original third line`);

    const updated = applyLyricsLineRewrite(lines, ["line-1", "line-2"], [
      "Rewritten first line",
      "Rewritten second line",
    ]);

    assert.equal(
      composeLyricsText(updated),
      "[Verse 1]\nRewritten first line\nRewritten second line\nOriginal third line"
    );
  });

  test("creates pending rewrite suggestions without changing lyric text", () => {
    const lines = parseLyricsText(`[Verse 1]
Original first line
Original second line`);

    const suggestions = createLyricsLineRewriteSuggestions(
      lines,
      ["line-1", "line-2"],
      ["New first line", "New second line"]
    );

    assert.deepEqual(suggestions, [
      {
        lineId: "line-1",
        originalText: "Original first line",
        rewrittenText: "New first line",
      },
      {
        lineId: "line-2",
        originalText: "Original second line",
        rewrittenText: "New second line",
      },
    ]);
    assert.equal(
      composeLyricsText(lines),
      "[Verse 1]\nOriginal first line\nOriginal second line"
    );
  });

  test("builds a prompt for selected line rewrites", () => {
    const prompt = buildLyricsLineRewritePrompt({
      fullLyrics: "[Verse 1]\nOld line\nA line that can repeat later",
      selectedLines: ["Old line"],
      instruction: "Make it more tender.",
      language: "English",
      genre: "Acoustic Folk",
      occasion: "mothers-day",
      recipientNames: ["Mom"],
    });

    assert.match(prompt, /rewrite only the selected lyric lines/i);
    assert.match(prompt, /Core Safety & Compliance Guidelines/i);
    assert.match(prompt, /copyright/i);
    assert.match(prompt, /抱歉，您输入的内容包含敏感信息或可能引发版权争议，请调整提示词后重试。/);
    assert.match(prompt, /Keep exactly 1 non-empty line/i);
    assert.match(prompt, /Make it more tender/);
    assert.match(prompt, /Occasion: Mothers Day/);
    assert.match(prompt, /Old line/);
    assert.match(prompt, /read the entire song first/i);
    assert.match(prompt, /global continuity/i);
    assert.match(prompt, /repetition can be valid songwriting/i);
    assert.match(prompt, /Do not return two adjacent lyric lines that are identical/i);
    assert.doesNotMatch(prompt, /Do not copy or repeat any unchanged line/i);
    assert.match(prompt, /A line that can repeat later/);
  });
});

describe("song samples", () => {
  test("creates a three-day sample record from a non-subscriber song task", () => {
    const createdAt = new Date("2026-06-10T00:00:00Z").getTime();
    const sample = createSongSampleFromTask(
      {
        songId: "song-1",
        externalId: "kie-1",
        status: "succeeded",
        email: "guest@example.com",
        isSubscriber: false,
        title: "Birthday Melody",
        lyrics: "[Verse 1]\nHello",
        genre: "Pop",
        occasion: "birthday",
        recipientNames: ["Sdf"],
        story: "A birthday story",
        vocalGender: "Female",
        language: "English",
        versions: [{ id: "a", title: "A", audioUrl: "https://cdn.test/a.mp3" }],
        createdAt,
        updatedAt: createdAt,
        expiresAt: createdAt + 1000,
      },
      createdAt
    );

    assert.equal(sample.songId, "song-1");
    assert.equal(sample.externalId, "kie-1");
    assert.equal(sample.previewLimitSeconds, 60);
    assert.equal(
      sample.accessExpiresAt,
      createdAt + 3 * 24 * 60 * 60 * 1000
    );
    assert.deepEqual(sample.recipientNames, ["Sdf"]);
  });

  test("keeps timestamped lyrics on the sample record", () => {
    const createdAt = new Date("2026-06-10T00:00:00Z").getTime();
    const sample = createSongSampleFromTask(
      {
        songId: "song-1",
        externalId: "kie-1",
        status: "succeeded",
        email: "guest@example.com",
        isSubscriber: false,
        title: "Birthday Melody",
        lyrics: "[Verse 1]\nHello",
        genre: "Pop",
        occasion: "birthday",
        recipientNames: ["Sdf"],
        story: "A birthday story",
        vocalGender: "Female",
        language: "English",
        versions: [
          {
            id: "a",
            title: "A",
            audioUrl: "https://cdn.test/a.mp3",
            timestampedLyrics: {
              alignedWords: [{ word: "Hello", startS: 1, endS: 1.5 }],
            },
          },
        ],
        createdAt,
        updatedAt: createdAt,
        expiresAt: createdAt + 1000,
      },
      createdAt
    );

    assert.deepEqual(sample.versions[0]?.timestampedLyrics?.alignedWords, [
      { word: "Hello", startS: 1, endS: 1.5 },
    ]);
  });

  test("creates full-preview sample records for subscribers without unlocking versions", () => {
    const createdAt = new Date("2026-06-10T00:00:00Z").getTime();
    const sample = createSongSampleFromTask(
      {
        songId: "song-1",
        externalId: "kie-1",
        status: "succeeded",
        userId: "user-1",
        email: "subscriber@example.com",
        isSubscriber: true,
        title: "Birthday Melody",
        lyrics: "[Verse 1]\nHello",
        genre: "Pop",
        occasion: "birthday",
        recipientNames: ["Sdf"],
        story: "A birthday story",
        vocalGender: "Female",
        language: "English",
        versions: [
          { id: "a", title: "A", audioUrl: "https://cdn.test/a.mp3" },
          { id: "b", title: "B", audioUrl: "https://cdn.test/b.mp3" },
        ],
        createdAt,
        updatedAt: createdAt,
        expiresAt: createdAt + 1000,
      },
      createdAt
    );

    assert.equal(sample.previewLimitSeconds, null);
    assert.equal(
      sample.accessExpiresAt,
      createdAt + 3 * 24 * 60 * 60 * 1000
    );
    assert.equal("unlockedVersionIds" in sample, false);
  });

  test("derives an access expiry for historical permanent samples", () => {
    const createdAt = new Date("2026-06-10T00:00:00Z").getTime();

    assert.equal(
      getSampleAccessExpiresAt({
        accessExpiresAt: null,
        createdAt,
      }),
      createdAt + 3 * 24 * 60 * 60 * 1000
    );
  });
});
