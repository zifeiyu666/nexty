import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("homepage songfinch comparison", () => {
  test("keeps pain point cards in a mobile horizontal scroller and desktop grid", () => {
    const source = readFileSync(
      join(process.cwd(), "components/home/SongfinchComparison.tsx"),
      "utf8",
    );

    assert.match(source, /snap-x snap-mandatory/);
    assert.match(source, /overflow-x-auto/);
    assert.match(source, /md:grid md:grid-cols-2/);
    assert.match(source, /lg:grid-cols-4/);
    assert.match(source, /min-w-\[82%\]/);
    assert.match(source, /min-\[430px\]:min-w-\[76%\]/);
    assert.match(source, /md:min-w-0/);
    assert.doesNotMatch(source, /"use client"/);
    assert.doesNotMatch(source, /@\/components\/ui\/carousel/);
  });
});
