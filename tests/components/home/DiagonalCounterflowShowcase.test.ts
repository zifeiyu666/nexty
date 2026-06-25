import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

import {
  diagonalCounterflowTracks,
  occasionImageSources,
} from "@/components/home/DiagonalCounterflowShowcase.config";

describe("diagonal counterflow showcase", () => {
  test("uses local occasion images and alternates scroll direction by track", () => {
    assert.ok(occasionImageSources.length >= 12);
    assert.ok(
      occasionImageSources.every((src) => src.startsWith("/occasion/")),
    );
    assert.equal(diagonalCounterflowTracks.length, 3);

    for (let index = 1; index < diagonalCounterflowTracks.length; index += 1) {
      assert.notEqual(
        diagonalCounterflowTracks[index].direction,
        diagonalCounterflowTracks[index - 1].direction,
      );
    }

    assert.ok(
      diagonalCounterflowTracks.every((track) => track.images.length >= 12),
    );
  });

  test("keeps the full-width section from increasing document width", () => {
    const source = readFileSync(
      join(process.cwd(), "components/home/DiagonalCounterflowShowcase.tsx"),
      "utf8",
    );

    assert.doesNotMatch(source, /w-screen/);
    assert.match(source, /max-w-full/);
    assert.doesNotMatch(source, /overflow-x-hidden/);
    assert.match(source, /overflow-hidden/);
  });

  test("moves tracks along one local axis so diagonal paths stay parallel", () => {
    const source = readFileSync(
      join(process.cwd(), "components/home/DiagonalCounterflowShowcase.tsx"),
      "utf8",
    );

    assert.match(source, /rotate-\[-38deg\]/);
    assert.doesNotMatch(source, /yPercent/);
  });

  test("keeps the showcase compact with clear, taller cards", () => {
    const source = readFileSync(
      join(process.cwd(), "components/home/DiagonalCounterflowShowcase.tsx"),
      "utf8",
    );

    assert.match(source, /min-h-\[500px\]/);
    assert.match(source, /lg:min-h-\[620px\]/);
    assert.match(source, /gap-14/);
    assert.match(source, /lg:gap-20/);
    assert.match(source, /h-44/);
    assert.match(source, /lg:h-64/);
    assert.match(source, /bg-\[#f7f0ed\]\/18/);
    assert.match(source, /bg-black\/0/);
  });
});
