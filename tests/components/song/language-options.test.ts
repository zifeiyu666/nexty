import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  featuredLanguages,
  moreLanguages,
} from "@/components/song/custom-song-wizard/constants";

describe("song language options", () => {
  test("uses each language's native name while preserving stable values", () => {
    assert.deepEqual(featuredLanguages[0], {
      code: "EN",
      value: "English",
      label: "English",
    });
    assert.ok(
      featuredLanguages.some(
        (language) =>
          language.value === "German" && language.label === "Deutsch",
      ),
    );
    assert.ok(
      moreLanguages.some(
        (language) =>
          language.value === "Chinese" && language.label === "中文",
      ),
    );
  });

  test("includes Japanese in the featured language row", () => {
    const japanese = featuredLanguages.find(
      (language) => language.value === "Japanese",
    );

    assert.deepEqual(japanese, {
      code: "JA",
      value: "Japanese",
      label: "日本語",
    });
    assert.equal(
      moreLanguages.some((language) => language.value === "Japanese"),
      false,
    );
  });
});
