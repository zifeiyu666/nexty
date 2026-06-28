import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("customer reactions section", () => {
  test("keeps reaction videos compact and centered", () => {
    const source = readFileSync(
      join(process.cwd(), "components/home/CustomerReactions.tsx"),
      "utf8",
    );

    assert.match(source, /mx-auto grid max-w-6xl/);
    assert.match(source, /gap-3/);
    assert.match(source, /lg:gap-4/);
    assert.match(source, /min-h-64/);
    assert.match(source, /sm:min-h-72/);
    assert.match(source, /\[--reaction-card-scale:1\.035\]/);
    assert.match(source, /\[&_.reaction-card:not\(\.is-active\)\]:lg:\[--reaction-card-scale:0\.97\]/);
    assert.match(source, /\[clip-path:inset\(0_round_1rem\)\]/);
    assert.match(source, /overflow-hidden rounded-\[inherit\]/);
    assert.doesNotMatch(source, /min-h-80/);
    assert.doesNotMatch(source, /\[--reaction-card-scale:1\.08\]/);
    assert.doesNotMatch(source, /\[--reaction-card-scale:0\.94\]/);
  });
});
