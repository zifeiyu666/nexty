import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("homepage how it works section", () => {
  test("is registered on the homepage with simple background step cards", () => {
    const homeSource = readFileSync(
      join(process.cwd(), "components/home/index.tsx"),
      "utf8",
    );
    const componentPath = join(process.cwd(), "components/home/HowItWorks.tsx");

    assert.match(homeSource, /import HowItWorks/);
    assert.match(homeSource, /<HowItWorks \/>/);
    assert.ok(existsSync(componentPath));

    const componentSource = readFileSync(componentPath, "utf8");

    assert.match(componentSource, /{t\("eyebrow"\)}\?/);
    assert.match(componentSource, /grid grid-cols-1 gap-6 lg:grid-cols-3/);
    assert.match(componentSource, /bg-muted/);
    assert.match(componentSource, /data-how-it-works-geometry/);
    assert.match(componentSource, /rounded-lg bg-white/);
    assert.match(componentSource, /rounded-full bg-white\/70/);
    assert.match(componentSource, /rotate-45 rounded-md bg-muted/);
    assert.match(
      componentSource,
      /mx-auto max-w-full whitespace-nowrap text-xl font-semibold leading-tight sm:text-2xl md:text-4xl/,
    );
    assert.match(
      componentSource,
      /mx-auto mt-4 max-w-2xl text-base leading-7 text-\[#3A3734\] md:text-lg/,
    );
    assert.match(
      componentSource,
      /text-xl font-semibold leading-tight text-\[#24211F\] sm:text-2xl/,
    );
    assert.match(componentSource, /mt-4 max-w-xl text-base leading-7 text-\[#2F2B28\]/);
    assert.doesNotMatch(componentSource, /Cormorant_Garamond/);
    assert.doesNotMatch(componentSource, /lucide-react/);
    assert.doesNotMatch(componentSource, /title-gradient/);
    assert.doesNotMatch(componentSource, /border/);
    assert.doesNotMatch(componentSource, /shadow/);
    assert.doesNotMatch(componentSource, /hover:/);
    assert.doesNotMatch(componentSource, /StepVisual|StoryPromptPreview|PreviewDashboard|GiftBundlePreview/);
    assert.doesNotMatch(componentSource, /#C5A880/);
    assert.doesNotMatch(componentSource, /#9E4747/);
    assert.doesNotMatch(componentSource, /bg-\[#0b0f19\]/);
    assert.doesNotMatch(componentSource, /8b5cf6|a855f7|6d5dfc/);
    assert.doesNotMatch(componentSource, /how-it-works-typing/);
    assert.doesNotMatch(componentSource, /how-it-works-wave/);
    assert.doesNotMatch(componentSource, /how-it-works-grooves/);
    assert.match(componentSource, /data-how-it-works-strong/);
  });

  test("keeps required SEO terms as strong tags in every locale", () => {
    for (const locale of ["en", "zh", "ja"]) {
      const messages = readFileSync(
        join(process.cwd(), `i18n/messages/${locale}/Landing.json`),
        "utf8",
      );

      assert.match(messages, /"HowItWorks"/);
      assert.match(messages, /<strong>custom song<\/strong>/);
      assert.match(messages, /<strong>music video<\/strong>/);
      assert.match(messages, /<strong>wall art<\/strong>/);
    }
  });
});
