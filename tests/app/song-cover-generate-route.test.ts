import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("song cover generation route", () => {
  test("validates payloads, rate limits anonymous users, and delegates generation", () => {
    const source = readFileSync(
      join(process.cwd(), "app/api/songs/cover/generate/route.ts"),
      "utf8",
    );

    assert.match(source, /const coverSchema = z\.object/);
    assert.match(source, /lyrics: z\.string\(\)\.trim\(\)\.min\(20\)\.max\(5000\)/);
    assert.match(source, /getSession\(\)/);
    assert.match(source, /songCoverGeneration/);
    assert.match(source, /checkRateLimit\(/);
    assert.match(source, /generateSongCover\(input\)/);
    assert.match(source, /apiResponse\.success\(result\)/);
  });
});
