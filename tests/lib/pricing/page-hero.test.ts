import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { shouldHidePricingHero } from "../../../lib/pricing/page-hero";

describe("pricing page hero", () => {
  test("shows hero by default", () => {
    assert.equal(shouldHidePricingHero({}), false);
  });

  test("hides hero when unlocking a specific song", () => {
    assert.equal(
      shouldHidePricingHero({
        type: "unlock_song",
        songId: "song_123",
      }),
      true
    );
  });

  test("keeps hero visible when unlock song parameters are incomplete", () => {
    assert.equal(shouldHidePricingHero({ type: "unlock_song" }), false);
    assert.equal(shouldHidePricingHero({ songId: "song_123" }), false);
  });
});
