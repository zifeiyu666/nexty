import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

import { occasionCards } from "@/components/home/OccasionShowcase.config";

describe("occasion showcase", () => {
  test("keeps the full occasion set with local occasion imagery", () => {
    assert.equal(occasionCards.length, 23);
    assert.deepEqual(
      occasionCards.map((occasion) => occasion.index),
      Array.from({ length: 23 }, (_, index) =>
        String(index + 1).padStart(2, "0"),
      ),
    );
    assert.ok(
      occasionCards.every((occasion) =>
        occasion.image.startsWith("/occasion/"),
      ),
    );
    assert.ok(occasionCards.every((occasion) => occasion.rotate !== 0));
  });

  test("includes the requested occasion copy", () => {
    const titles = occasionCards.map((occasion) => occasion.title);
    const taglines = occasionCards.map((occasion) => occasion.tagline);

    assert.ok(titles.includes("Just Because"));
    assert.ok(titles.includes("Mother's Day (Wife + Mom)"));
    assert.ok(titles.includes("Memorial / In Loving Memory"));
    assert.ok(taglines.includes("Everyday Magic"));
    assert.ok(taglines.includes("When Sorry Needs a Melody"));
  });

  test("uses GSAP for paper spread entrance, hover flattening, drag controls, and scroll follow", () => {
    const source = readFileSync(
      join(process.cwd(), "components/home/OccasionShowcase.tsx"),
      "utf8",
    );

    assert.match(source, /from "gsap"/);
    assert.match(source, /ScrollTrigger/);
    assert.match(source, /stagger: 0\.075/);
    assert.match(source, /rotate: 0/);
    assert.match(source, /setPointerCapture/);
    assert.match(source, /onPointerMove/);
    assert.match(source, /ArrowLeft/);
    assert.match(source, /ArrowRight/);
    assert.match(source, /window\.addEventListener\("scroll"/);
    assert.match(
      source,
      /const scrollDelta = scrollY - lastScrollYRef\.current/,
    );
    assert.match(source, /targetTranslateRef\.current/);
    assert.match(source, /cardOffsetsRef\.current/);
    assert.match(source, /IntersectionObserver/);
    assert.match(
      source,
      /baseTranslate - scrollDelta \* SCROLL_FOLLOW_MULTIPLIER/,
    );
    assert.match(source, /gsap\.ticker\.add\(tick\)/);
    assert.match(source, /gsap\.quickSetter\(track, "x", "px"\)/);
    assert.match(source, /updateActiveIndexForTranslate\(nextTranslate\)/);
  });

  test("removes card playback controls while zooming images on card hover", () => {
    const source = readFileSync(
      join(process.cwd(), "components/home/OccasionShowcase.tsx"),
      "utf8",
    );

    assert.doesNotMatch(source, /Listen:/);
    assert.doesNotMatch(source, /waveformHeights/);
    assert.doesNotMatch(source, /<Play/);
    assert.match(source, /group-hover:scale-\[/);
  });

  test("renders the new section between how-it-works and feature cards", () => {
    const homeSource = readFileSync(
      join(process.cwd(), "components/home/index.tsx"),
      "utf8",
    );

    const howItWorksIndex = homeSource.indexOf("<HowItWorks />");
    const showcaseIndex = homeSource.indexOf("<OccasionShowcase />");
    const useCasesIndex = homeSource.indexOf("<UseCases />");

    assert.notEqual(howItWorksIndex, -1);
    assert.notEqual(showcaseIndex, -1);
    assert.notEqual(useCasesIndex, -1);
    assert.ok(howItWorksIndex < showcaseIndex);
    assert.ok(showcaseIndex < useCasesIndex);
  });
});
