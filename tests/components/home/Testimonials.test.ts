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
    assert.doesNotMatch(source, /from "gsap"/);
    assert.match(source, /import\("gsap"\)/);
    assert.match(source, /const mobileLayout = window\.matchMedia\("\(max-width: 639px\)"\)\.matches/);
    assert.match(source, /if \(mobileLayout\) return/);
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
    assert.match(source, /className="relative hidden sm:block"/);
    assert.match(source, /snap-x snap-mandatory/);
    assert.match(source, /overflow-x-auto/);
    assert.match(source, /sectionTestimonials\.map/);
    assert.match(source, /from "next\/image"/);
    assert.match(source, /sizes="40px"/);
    assert.doesNotMatch(source, /testimonials-marquee/);
    assert.doesNotMatch(source, /SCROLL_MARQUEE_DURATION/);
  });
});
