import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

import { occasionCards } from "@/components/home/OccasionShowcase.config";

describe("occasion showcase", () => {
  test("keeps the full occasion set with local occasion imagery", () => {
    assert.equal(occasionCards.length, 21);
    assert.deepEqual(
      occasionCards.map((occasion) => occasion.index),
      [
        "01",
        "02",
        "03",
        "04",
        "05",
        "06",
        "07",
        "08",
        "09",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "17",
        "18",
        "19",
        "20",
        "21",
        "23",
      ],
    );
    assert.ok(
      occasionCards.every((occasion) =>
        occasion.image.startsWith("/occasion-generated/avif/"),
      ),
    );
    assert.ok(occasionCards.every((occasion) => occasion.rotate !== 0));
  });

  test("assigns one R2 sample song per card with data-only match quality", () => {
    assert.ok(occasionCards.every((occasion) => occasion.sampleTrack));
    assert.ok(
      occasionCards.every((occasion) =>
        occasion.sampleTrack.audioUrl.startsWith(
          "https://cdn.onecustomsong.com/audio/occasion-demos/",
        ),
      ),
    );
    assert.ok(
      occasionCards.every((occasion) =>
        ["exact", "related"].includes(occasion.sampleTrack.matchType),
      ),
    );

    const anniversary = occasionCards.find(
      (occasion) => occasion.id === "anniversary",
    );
    const wedding = occasionCards.find((occasion) => occasion.id === "wedding");

    assert.equal(anniversary?.sampleTrack.title, "Ten Years, Ava");
    assert.equal(anniversary?.sampleTrack.sourcePrefix, "anniversary");
    assert.equal(anniversary?.sampleTrack.matchType, "exact");
    assert.equal(wedding?.sampleTrack.title, "Final Page Forever");
    assert.equal(wedding?.sampleTrack.matchType, "related");
    assert.ok(
      occasionCards.every(
        (occasion) =>
          !occasion.sampleTrack.title
            .toLowerCase()
            .startsWith(`${occasion.sampleTrack.sourcePrefix.toLowerCase()}-`),
      ),
    );
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
    assert.match(source, /cardOffsetsRef\.current/);
    assert.match(source, /gsap\.quickSetter\(track, "x", "px"\)/);
    assert.match(source, /updateActiveIndexForTranslate\(nextTranslate\)/);
  });

  test("uses a compact mobile carousel while keeping desktop scroll animation guarded", () => {
    const source = readFileSync(
      join(process.cwd(), "components/home/OccasionShowcase.tsx"),
      "utf8",
    );

    assert.match(source, /from "@\/components\/ui\/carousel"/);
    assert.match(source, /setApi=\{setMobileApi\}/);
    assert.match(source, /className="sm:hidden"/);
    assert.match(source, /className="basis-\[88%\] pl-3"/);
    assert.match(source, /isMobileCarouselLayout\(\)/);
    assert.match(source, /if \(!section \|\| !track \|\| isMobileCarouselLayout\(\)\) return/);
    assert.match(source, /hidden max-w-\[1420px\].*sm:block/);
    assert.match(source, /hidden max-w-7xl.*sm:flex/);
  });

  test("uses global-player card playback controls while zooming images on card hover", () => {
    const source = readFileSync(
      join(process.cwd(), "components/home/OccasionShowcase.tsx"),
      "utf8",
    );

    assert.doesNotMatch(source, /Listen:/);
    assert.doesNotMatch(source, /waveformHeights/);
    assert.match(source, /OccasionCardPlaybackButton/);
    assert.match(source, /useGlobalMusicPlayer/);
    assert.match(source, /playTrack\(\{/);
    assert.match(source, /title: sampleTrack\.title/);
    assert.match(source, /toggle\(\)/);
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
