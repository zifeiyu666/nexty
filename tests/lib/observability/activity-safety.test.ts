import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  createIssueFingerprint,
  sanitizeActivityMetadata,
} from "@/lib/observability/activity-safety";

describe("activity event safety", () => {
  test("removes sensitive fields and external URLs from activity metadata", () => {
    assert.deepEqual(
      sanitizeActivityMetadata({
        step: "cover-generation",
        durationMs: 812,
        lyrics: "A private song lyric",
        story: "A private story",
        audioUrl: "https://private.example/song.mp3",
        accessToken: "secret",
        providerStatus: "failed",
      }),
      {
        step: "cover-generation",
        durationMs: 812,
        providerStatus: "failed",
      },
    );
  });

  test("keeps issue fingerprints stable without retaining the original error message", () => {
    const first = createIssueFingerprint({
      feature: "song",
      action: "generate",
      error: new Error("KIE returned 503 for task abc-123"),
    });
    const second = createIssueFingerprint({
      feature: "song",
      action: "generate",
      error: new Error("KIE returned 503 for task xyz-999"),
    });

    assert.equal(first, second);
    assert.doesNotMatch(first, /abc|xyz|503/i);
  });
});
