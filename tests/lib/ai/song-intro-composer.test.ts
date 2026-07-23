import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";

import { buildSpokenIntroRenderInput } from "@/lib/ai/song-intro-composer";
import { SPOKEN_INTRO_AUDIO_COMPOSITION_ID } from "@/lib/music-video/spoken-intro-audio";

describe("song intro Remotion composer", () => {
  const originalEnvironment = {
    REMOTION_AUDIO_BITRATE: process.env.REMOTION_AUDIO_BITRATE,
    REMOTION_AWS_REGION: process.env.REMOTION_AWS_REGION,
    REMOTION_FUNCTION_NAME: process.env.REMOTION_FUNCTION_NAME,
    REMOTION_SERVE_URL: process.env.REMOTION_SERVE_URL,
    REMOTION_WEBHOOK_SECRET: process.env.REMOTION_WEBHOOK_SECRET,
  };

  afterEach(() => Object.assign(process.env, originalEnvironment));

  test("builds an audio-only MP3 render using the existing Lambda", () => {
    process.env.REMOTION_AUDIO_BITRATE = "160k";
    process.env.REMOTION_AWS_REGION = "us-east-1";
    process.env.REMOTION_FUNCTION_NAME = "remotion-render";
    process.env.REMOTION_SERVE_URL =
      "https://bucket.s3.us-east-1.amazonaws.com/sites/site/index.html";
    process.env.REMOTION_WEBHOOK_SECRET = "secret";

    const input = buildSpokenIntroRenderInput({
      intro: {
        alignedWords: [{ word: "Hello", startS: 0, endS: 3 }],
        audioKey: "songs/spoken-intros/user-1/intro.webm",
        audioUrl: "https://cdn.example.com/intro.webm",
        durationSeconds: 3,
        transcript: "Hello",
      },
      songId: "song-1",
      version: {
        audioUrl: "https://cdn.example.com/song.mp3",
        duration: 120,
        id: "version-a",
        title: "Version A",
      },
    });

    assert.equal(input.codec, "mp3");
    assert.equal(input.composition, SPOKEN_INTRO_AUDIO_COMPOSITION_ID);
    assert.equal(input.concurrency, 1);
    assert.equal(input.audioBitrate, "160k");
    assert.equal(
      input.outName,
      "songs/generated/song-1/version-a/with-intro.mp3",
    );
    assert.deepEqual(input.inputProps, {
      introAudioUrl: "https://cdn.example.com/intro.webm",
      introDurationSeconds: 3,
      songAudioUrl: "https://cdn.example.com/song.mp3",
      songDurationSeconds: 120,
    });
  });
});
