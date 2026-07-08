import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("homepage hero mobile layout", () => {
  test("uses a fixed mobile height and keeps viewport height for sm and above", () => {
    const source = readFileSync(
      join(process.cwd(), "components/home/Hero.tsx"),
      "utf8",
    );

    assert.match(source, /min-h-\[760px\]/);
    assert.match(source, /sm:min-h-\[max\(640px,calc\(100dvh_\+_53px\)\)\]/);
    assert.match(source, /sm:h-dvh/);
    assert.doesNotMatch(source, /flex h-dvh min-h-\[600px\]/);
    assert.match(source, /gap-4 pb-10 pt-20/);
  });

  test("uses a static optimized image for the mobile hero background", () => {
    const source = readFileSync(
      join(process.cwd(), "components/home/Hero.tsx"),
      "utf8",
    );

    assert.match(source, /import Image from "next\/image"/);
    assert.match(source, /src="\/images\/hero\/giftsong-hero-mobile-mosaic\.jpg"/);
    assert.match(source, /priority/);
    assert.match(source, /sizes="100vw"/);
    assert.match(source, /className="-z-30 object-cover object-center sm:hidden"/);
    assert.match(source, /<HeroOccasionMosaic \/>/);
  });
});
