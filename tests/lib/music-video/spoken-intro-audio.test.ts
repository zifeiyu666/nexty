import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  getSpokenIntroAudioTiming,
  SPOKEN_INTRO_AUDIO_FPS,
} from "@/lib/music-video/spoken-intro-audio";

describe("spoken intro audio composition", () => {
  test("places the song after the intro and transition silence", () => {
    const timing = getSpokenIntroAudioTiming({
      introDurationSeconds: 3,
      songDurationSeconds: 120,
    });

    assert.equal(SPOKEN_INTRO_AUDIO_FPS, 30);
    assert.equal(timing.introDurationInFrames, 90);
    assert.equal(timing.songStartOffsetSeconds, 3.4);
    assert.equal(timing.songStartInFrames, 102);
    assert.equal(timing.durationInFrames, 3702);
    assert.equal(timing.durationSeconds, 123.4);
  });
});
