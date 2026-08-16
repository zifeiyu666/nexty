import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { resolveSongBriefOccasion } from "@/components/home/song-brief-templates";

describe("homepage song brief occasion presets", () => {
  test("maps displayed preset labels to the wizard occasion values", () => {
    assert.equal(resolveSongBriefOccasion("Birthday"), "birthday");
    assert.equal(resolveSongBriefOccasion("Wedding"), "wedding");
    assert.equal(resolveSongBriefOccasion("Valentine's Day"), "valentines-day");
    assert.equal(resolveSongBriefOccasion("Mother's Day"), "mothers-day");
    assert.equal(resolveSongBriefOccasion("Father's Day"), "fathers-day");
  });

  test("preserves a user-entered custom occasion", () => {
    assert.equal(resolveSongBriefOccasion("Our adoption day"), "Our adoption day");
  });
});
