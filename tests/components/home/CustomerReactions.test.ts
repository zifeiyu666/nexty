import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("customer reactions section", () => {
  test("loads videos only near the viewport with reliable local posters", () => {
    const source = readFileSync(
      join(process.cwd(), "components/home/CustomerReactions.tsx"),
      "utf8",
    );

    assert.match(source, /new IntersectionObserver/);
    assert.match(source, /rootMargin: "600px 0px"/);
    assert.match(source, /shouldAttachVideo \? video\.src : undefined/);
    assert.match(source, /preload=\{shouldAttachVideo \? "metadata" : "none"\}/);
    assert.match(source, /\/images\/customer-reactions\/\$\{videoName\}\.jpg/);
    assert.match(source, /Mobile browsers can still defer autoplay/);
    assert.doesNotMatch(source, /replace\((.*?)\\.jpg/);
  });

  test("uses a single-card mobile carousel and keeps desktop grid separate", () => {
    const source = readFileSync(
      join(process.cwd(), "components/home/CustomerReactions.tsx"),
      "utf8",
    );

    assert.match(source, /from "@\/components\/ui\/carousel"/);
    assert.match(source, /useSyncExternalStore/);
    assert.match(source, /const mobileCarouselQuery = "\(max-width: 639px\)"/);
    assert.match(source, /setApi=\{setMobileApi\}/);
    assert.match(source, /className="basis-\[88%\] pl-3"/);
    assert.match(source, /mobileActiveIndex \+ 1\} \/ \{videos\.length\}/);
    assert.match(source, /Math\.abs\(index - mobileActiveIndex\) <= 1/);
    assert.match(source, /isMobileLayout \? \(/);
    assert.match(source, /mx-auto grid max-w-5xl/);
  });
});
