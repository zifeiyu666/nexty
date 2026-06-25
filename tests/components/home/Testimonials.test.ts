import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("homepage testimonials marquee", () => {
  test("uses GSAP to follow page scroll deltas and idle left drift", () => {
    const source = readFileSync(
      join(process.cwd(), "components/home/Testimonials.tsx"),
      "utf8",
    );

    assert.match(source, /^"use client";/);
    assert.match(source, /from "gsap"/);
    assert.match(source, /gsap\.ticker\.add/);
    assert.match(source, /window\.addEventListener\("scroll"/);
    assert.match(source, /const scrollDelta = scrollY - lastScrollYRef\.current/);
    assert.match(source, /positionRef\.current -= scrollDelta \* SCROLL_FOLLOW_MULTIPLIER/);
    assert.match(source, /isPageScrollingRef\.current = true/);
    assert.match(source, /isPageScrollingRef\.current = false/);
    assert.match(source, /const isMarqueeHoveredRef = useRef\(false\)/);
    assert.match(source, /if \(isMarqueeHoveredRef\.current\) return/);
    assert.match(source, /onMouseEnter=\{handleMarqueeMouseEnter\}/);
    assert.match(source, /onMouseLeave=\{handleMarqueeMouseLeave\}/);
    assert.match(source, /hover:-translate-y-1\.5/);
    assert.match(source, /hover:shadow-xl/);
    assert.doesNotMatch(source, /testimonials-marquee/);
    assert.doesNotMatch(source, /SCROLL_MARQUEE_DURATION/);
  });
});
