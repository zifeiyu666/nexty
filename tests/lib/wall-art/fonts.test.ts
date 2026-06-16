import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

import {
  userRequestedWallArtFontLabels,
  wallArtFontFiles,
  wallArtFonts,
} from "@/lib/wall-art/fonts";

describe("wall art fonts", () => {
  test("includes every requested Google font exactly once in the picker", () => {
    const labels = wallArtFonts.map((font) => font.label);

    for (const requestedLabel of userRequestedWallArtFontLabels) {
      assert.equal(
        labels.filter((label) => label === requestedLabel).length,
        1,
        `${requestedLabel} should be registered once`,
      );
    }
  });

  test("keeps downloadable font files on disk for export embedding", () => {
    for (const [, src] of wallArtFontFiles) {
      if (!src.startsWith("/fonts/wallart/")) continue;

      assert.equal(
        existsSync(join(process.cwd(), "public", src)),
        true,
        `${src} should exist`,
      );
    }
  });
});
