import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  createSongBriefDraft,
  resolveSongBriefOccasion,
} from "@/components/home/song-brief-templates";

describe("homepage song brief occasion presets", () => {
  test("maps displayed preset labels to the wizard occasion values", () => {
    assert.equal(resolveSongBriefOccasion("Birthday"), "birthday");
    assert.equal(resolveSongBriefOccasion("Wedding"), "wedding");
    assert.equal(resolveSongBriefOccasion("Valentine's Day"), "valentines-day");
    assert.equal(resolveSongBriefOccasion("Mother's Day"), "mothers-day");
    assert.equal(resolveSongBriefOccasion("Father's Day"), "fathers-day");
    assert.equal(resolveSongBriefOccasion("Anniversary"), "anniversary");
    assert.equal(resolveSongBriefOccasion("Just Because"), "just-because");
    assert.equal(resolveSongBriefOccasion("Thank You"), "thank-you");
    assert.equal(resolveSongBriefOccasion("Congratulations"), "congratulations");
  });

  test("preserves a user-entered custom occasion", () => {
    assert.equal(resolveSongBriefOccasion("Our adoption day"), "Our adoption day");
  });

  test("builds the same wizard draft for homepage and landing-page briefs", () => {
    const draft = createSongBriefDraft({
      previousDraft: { personalNote: "Keep this existing note" },
      localeLanguage: "English",
      name: "  Nora  ",
      relationship: " best friend ",
      occasion: "Thank You",
      message: "  You made the hard days lighter.  ",
      story: "  Late-night calls and coffee runs.  ",
    });

    assert.deepEqual(draft.recipients, [
      { name: "Nora", relationship: "best friend" },
    ]);
    assert.deepEqual(draft.recipientNames, ["Nora"]);
    assert.deepEqual(draft.recipientRelationships, ["best friend"]);
    assert.equal(draft.occasion, "thank-you");
    assert.equal(draft.spokenBlessing, "You made the hard days lighter.");
    assert.equal(draft.spokenMode, "text");
    assert.equal(draft.story, "Late-night calls and coffee runs.");
    assert.equal(draft.personalNote, "Keep this existing note");
    assert.equal(draft.generatedLyrics, undefined);
  });

  test("uses recording mode when the message is empty", () => {
    const draft = createSongBriefDraft({
      name: "Mia",
      relationship: "daughter",
      occasion: "Birthday",
      message: "   ",
      story: "Kitchen dance parties",
    });

    assert.equal(draft.spokenBlessing, "");
    assert.equal(draft.spokenMode, "recording");
  });
});
