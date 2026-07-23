import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  buildSongCoverPromptRequest,
  generateSongCover,
  getSongCoverImageModel,
  normalizeSongCoverPrompt,
} from "@/lib/ai/song-cover";

describe("song cover generation helpers", () => {
  test("builds an image prompt request from lyrics and song context", () => {
    const prompt = buildSongCoverPromptRequest({
      title: "Mia's Birthday Song",
      lyrics:
        "[Verse]\nMia dances under kitchen lights\n[Chorus]\nMia's Birthday Song, you are our sunrise",
      occasion: "Birthday",
      genre: "Pop",
      language: "English",
      recipientNames: ["Mia"],
      story: "Mia loves warm family dinners and red balloons.",
      vocalGender: "Female",
      coverArt: {
        style: "hand-painted-gouache",
        styleDescription:
          "intimate hand-painted gouache with visible brush texture",
        subject: "a warmly lit family kitchen with one red balloon",
        mood: "tender, nostalgic and quietly joyful",
        palette: "warm coral, soft green, muted gold and ivory",
        lighting: "gentle evening window light",
        composition: "a central symbolic scene with space in the lower-right",
        giftFeeling: "a treasured handmade keepsake, personal and premium",
      },
    });

    assert.doesNotMatch(prompt, /Mia's Birthday Song/);
    assert.doesNotMatch(prompt, /Mia dances under kitchen lights/);
    assert.match(prompt, /hand-painted gouache/i);
    assert.match(prompt, /treasured handmade keepsake/i);
    assert.match(prompt, /"For Mia"/);
    assert.match(prompt, /no other readable text/i);
    assert.match(prompt, /square album cover/i);
  });

  test("normalizes plain prompt text and rejects empty output", () => {
    assert.equal(
      normalizeSongCoverPrompt('  "warm cinematic album cover"  '),
      "warm cinematic album cover",
    );

    assert.throws(
      () => normalizeSongCoverPrompt("   "),
      /empty album-cover prompt/i,
    );
  });

  test("uses the balanced Replicate image model by default", () => {
    const previousModel = process.env.SONG_COVER_IMAGE_MODEL;
    delete process.env.SONG_COVER_IMAGE_MODEL;

    try {
      assert.equal(getSongCoverImageModel(), "black-forest-labs/flux-dev");
    } finally {
      if (previousModel === undefined) {
        delete process.env.SONG_COVER_IMAGE_MODEL;
      } else {
        process.env.SONG_COVER_IMAGE_MODEL = previousModel;
      }
    }
  });

  test("does not require OpenAI when image generation and upload are available", async () => {
    const previousOpenAiKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    try {
      const result = await generateSongCover(
        {
          title: "Mia's Birthday Song",
          lyrics: "[Verse]\nMia dances under kitchen lights",
          occasion: "Birthday",
          genre: "Pop",
          language: "English",
          recipientNames: ["Mia"],
          story: "Mia loves warm family dinners and red balloons.",
          vocalGender: "Female",
          songId: "song-123",
        },
        {
          async generateImage(prompt) {
            assert.match(prompt, /red balloons/i);
            assert.match(prompt, /no other readable text/i);
            return "https://replicate.delivery/generated.webp";
          },
          async uploadImage(_externalUrl, key) {
            return { key, url: "https://r2.example.com/cover.webp" };
          },
        },
      );

      assert.equal(result.imageUrl, "https://r2.example.com/cover.webp");
    } finally {
      if (previousOpenAiKey === undefined) {
        delete process.env.OPENAI_API_KEY;
      } else {
        process.env.OPENAI_API_KEY = previousOpenAiKey;
      }
    }
  });

  test("generates a cover and returns the persisted R2 URL", async () => {
    const calls: string[] = [];
    const result = await generateSongCover(
      {
        title: "Mia's Birthday Song",
        lyrics: "[Verse]\nMia dances under kitchen lights",
        occasion: "Birthday",
        genre: "Pop",
        language: "English",
        recipientNames: ["Mia"],
        story: "Mia loves warm family dinners and red balloons.",
        vocalGender: "Female",
        songId: "song-123",
      },
      {
        async generatePrompt({ prompt, system }) {
          calls.push(
            `prompt:${system.includes("album-cover art director")}:${prompt.includes("Mia")}`,
          );
          return "warm cinematic square album cover, red balloons, kitchen light, no readable text";
        },
        async generateImage(prompt) {
          calls.push(`image:${prompt.includes("no readable text")}`);
          return "https://replicate.delivery/generated.webp";
        },
        async uploadImage(externalUrl, key) {
          calls.push(
            `upload:${externalUrl}:${key.startsWith("song-covers/song-123/")}`,
          );
          return {
            key,
            url: "https://r2.example.com/song-covers/song-123/generated.webp",
          };
        },
      },
    );

    assert.equal(
      result.imageUrl,
      "https://r2.example.com/song-covers/song-123/generated.webp",
    );
    assert.match(result.prompt, /warm cinematic square album cover/);
    assert.deepEqual(calls, [
      "prompt:true:true",
      "image:true",
      "upload:https://replicate.delivery/generated.webp:true",
    ]);
  });
});
