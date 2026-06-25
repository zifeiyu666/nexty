import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("music video assets presign route", () => {
  test("accepts common image and video media upload formats", () => {
    const source = readFileSync(
      join(process.cwd(), "app/api/songs/[songId]/mv/assets/presign/route.ts"),
      "utf8",
    );

    assert.match(source, /image\\\/\(jpeg\|png\|webp\|gif\)/);
    assert.match(source, /video\\\/\(mp4\|quicktime\|webm\|x-m4v\)/);
    assert.match(source, /Only common image and video formats are supported/);
  });
});
