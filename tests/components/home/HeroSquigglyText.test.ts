import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("homepage hero squiggly title", () => {
  test("renders the translated title accent through SquigglyText", () => {
    const source = readFileSync(
      join(process.cwd(), "components/home/Hero.tsx"),
      "utf8",
    );

    assert.match(source, /@\/components\/ui\/squiggly-text/);
    assert.match(source, /<SquigglyText[\s\S]*\{titleAccent\}[\s\S]*<\/SquigglyText>/);
  });
});
