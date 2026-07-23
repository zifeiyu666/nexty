import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { resolvePublishedAt } from "../../../lib/cms/post-publishing";

describe("CMS post publishing timestamps", () => {
  const originalPublishedAt = new Date("2026-07-01T08:00:00.000Z");
  const now = new Date("2026-07-15T08:00:00.000Z");

  test("uses the first-publication time when a draft is published", () => {
    assert.equal(
      resolvePublishedAt({
        currentStatus: "draft",
        nextStatus: "published",
        currentPublishedAt: originalPublishedAt,
        now,
      }),
      now,
    );
  });

  test("uses a new publication time when an archived post is republished", () => {
    assert.equal(
      resolvePublishedAt({
        currentStatus: "archived",
        nextStatus: "published",
        currentPublishedAt: originalPublishedAt,
        now,
      }),
      now,
    );
  });

  test("preserves the original publication time when editing a published post", () => {
    assert.equal(
      resolvePublishedAt({
        currentStatus: "published",
        nextStatus: "published",
        currentPublishedAt: originalPublishedAt,
        now,
      }),
      originalPublishedAt,
    );
  });

  test("preserves the stored time while a post remains unpublished", () => {
    assert.equal(
      resolvePublishedAt({
        currentStatus: "draft",
        nextStatus: "draft",
        currentPublishedAt: originalPublishedAt,
        now,
      }),
      originalPublishedAt,
    );
  });
});
