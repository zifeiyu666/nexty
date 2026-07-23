import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  getSongAudioPreviewDurationInFrames,
  getSongAudioPreviewDurationSeconds,
  SONG_AUDIO_PREVIEW_FPS,
  SONG_AUDIO_PREVIEW_LIMIT_SECONDS,
} from "@/lib/music-video/song-audio-preview";

describe("song audio preview", () => {
  test("caps a full song at exactly one minute", () => {
    const props = {
      audioDurationSeconds: 143,
      previewLimitSeconds: SONG_AUDIO_PREVIEW_LIMIT_SECONDS,
    };

    assert.equal(getSongAudioPreviewDurationSeconds(props), 60);
    assert.equal(
      getSongAudioPreviewDurationInFrames(props),
      60 * SONG_AUDIO_PREVIEW_FPS,
    );
  });

  test("does not pad songs shorter than the preview limit", () => {
    const props = {
      audioDurationSeconds: 42.5,
      previewLimitSeconds: SONG_AUDIO_PREVIEW_LIMIT_SECONDS,
    };

    assert.equal(getSongAudioPreviewDurationSeconds(props), 42.5);
  });
});
