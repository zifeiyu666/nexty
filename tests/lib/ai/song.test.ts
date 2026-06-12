import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { buildLyricsPrompt } from "../../../lib/ai/song";

describe("song lyrics prompt", () => {
  test("builds an English DeepSeek lyric prompt with user customization", () => {
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
    assert.match(prompt, /Music style \/ genre: Acoustic Folk/);
    assert.match(prompt, /Occasion \/ specific holiday: Mothers Day/);
    assert.match(prompt, /\[Verse 1\]/);
    assert.match(prompt, /\[Chorus\]/);
    assert.match(prompt, /She always sang while cooking dinner/);
  });
});
