import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  buildSongCoverPromptRequest,
  generateSongCover,
  normalizeSongCoverPrompt,
} from "@/lib/ai/song-cover";

describe("song cover generation helpers", () => {
  test("builds a GPT prompt request from lyrics and song context", () => {
    const prompt = buildSongCoverPromptRequest({
      title: "Mia's Birthday Song",
      lyrics: "[Verse]\nMia dances under kitchen lights\n[Chorus]\nYou are our sunrise",
      occasion: "Birthday",
      genre: "Pop",
      language: "English",
      recipientNames: ["Mia"],
      story: "Mia loves warm family dinners and red balloons.",
      vocalGender: "Female",
    });

    assert.match(prompt, /Mia's Birthday Song/);
    assert.match(prompt, /Mia dances under kitchen lights/);
    assert.match(prompt, /Birthday/);
    assert.match(prompt, /Pop/);
    assert.match(prompt, /Mia/);
    assert.match(prompt, /no readable text/i);
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
