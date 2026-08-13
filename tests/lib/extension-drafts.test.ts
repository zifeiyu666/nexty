import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  EXTENSION_DRAFT_TTL_MS,
  createExtensionDraftExpiry,
  extensionDraftSchema,
} from "@/lib/extension-draft-validation";

describe("extension drafts", () => {
  test("accepts the bounded English popup draft payload", () => {
    const parsed = extensionDraftSchema.parse({
      occasion: "birthday",
      recipientName: "Maya",
      relationship: "Friend",
      story: "We met at college and still sing this song on road trips.",
      genre: "Pop",
      language: "en",
      source: "browser-extension",
      campaign: "extension",
    });

    assert.equal(parsed.language, "en");
    assert.equal(parsed.story.includes("road trips"), true);
  });

  test("rejects drafts that are too short or not English", () => {
    assert.throws(() =>
      extensionDraftSchema.parse({
        occasion: "birthday",
        recipientName: "Maya",
        relationship: "Friend",
        story: "Too short",
        genre: "Pop",
        language: "English",
        source: "browser-extension",
      }),
    );
  });

  test("expires temporary drafts after 24 hours", () => {
    const now = new Date("2026-08-12T00:00:00.000Z");
    assert.equal(
      createExtensionDraftExpiry(now).getTime() - now.getTime(),
      EXTENSION_DRAFT_TTL_MS,
    );
  });
});
