import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("homepage hero title", () => {
  test("renders rotating occasion text and the aurora brand without a squiggle", () => {
    const source = readFileSync(
      join(process.cwd(), "components/home/Hero.tsx"),
      "utf8",
    );

    assert.match(source, /@\/components\/ui\/word-rotate/);
    assert.match(source, /@\/components\/ui\/aurora-text/);
    assert.match(source, /Personalized Song Gifts/);
    assert.match(source, /For Love/);
    assert.match(source, /For Mom/);
    assert.match(source, /For Friends/);
    assert.match(source, /SendTheSong AI/);
    assert.doesNotMatch(source, /<svg/);
  });
});
