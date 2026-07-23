import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";

import { buildSongPreviewRenderInput } from "@/lib/ai/song-preview-composer";
import {
  SONG_AUDIO_PREVIEW_COMPOSITION_ID,
  SONG_AUDIO_PREVIEW_LIMIT_SECONDS,
} from "@/lib/music-video/song-audio-preview";

describe("song preview Remotion composer", () => {
  const originalEnvironment = {
    REMOTION_AUDIO_BITRATE: process.env.REMOTION_AUDIO_BITRATE,
    REMOTION_AWS_REGION: process.env.REMOTION_AWS_REGION,
    REMOTION_FUNCTION_NAME: process.env.REMOTION_FUNCTION_NAME,
    REMOTION_SERVE_URL: process.env.REMOTION_SERVE_URL,
    REMOTION_WEBHOOK_SECRET: process.env.REMOTION_WEBHOOK_SECRET,
  };

  afterEach(() => Object.assign(process.env, originalEnvironment));

  test("builds a separate 60-second MP3 preview render", () => {
    process.env.REMOTION_AUDIO_BITRATE = "160k";
    process.env.REMOTION_AWS_REGION = "us-east-1";
    process.env.REMOTION_FUNCTION_NAME = "remotion-render";
    process.env.REMOTION_SERVE_URL =
      "https://bucket.s3.us-east-1.amazonaws.com/sites/site/index.html";
    process.env.REMOTION_WEBHOOK_SECRET = "secret";

    const input = buildSongPreviewRenderInput({
      songId: "song-1",
      version: {
        audioUrl: "https://cdn.example.com/full.mp3",
        duration: 143,
        id: "version-a",
        title: "Version A",
      },
    });

    assert.equal(input.codec, "mp3");
    assert.equal(input.composition, SONG_AUDIO_PREVIEW_COMPOSITION_ID);
    assert.equal(input.outName, "songs/generated/song-1/version-a/preview.mp3");
    assert.deepEqual(input.inputProps, {
      audioUrl: "https://cdn.example.com/full.mp3",
      audioDurationSeconds: 143,
      previewLimitSeconds: SONG_AUDIO_PREVIEW_LIMIT_SECONDS,
    });
  });
});
