import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { normalizeSpokenIntroContentType } from "@/lib/audio/spoken-intro-upload";

describe("spoken intro upload content types", () => {
  test("normalizes MediaRecorder MIME types that include codec parameters", () => {
    assert.equal(
      normalizeSpokenIntroContentType("audio/webm;codecs=opus"),
      "audio/webm",
    );
    assert.equal(
      normalizeSpokenIntroContentType(' Audio/MP4; codecs="mp4a.40.2" '),
      "audio/mp4",
    );
  });

  test("rejects unsupported and non-audio content types", () => {
    assert.equal(normalizeSpokenIntroContentType("video/webm"), null);
    assert.equal(normalizeSpokenIntroContentType("audio/flac"), null);
  });
});
