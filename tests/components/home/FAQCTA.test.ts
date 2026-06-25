import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("homepage CTA plus FAQ section", () => {
  test("renders FAQ and CTA as one two-column section", () => {
    const homeSource = readFileSync(
      join(process.cwd(), "components/home/index.tsx"),
      "utf8",
    );
    const faqSource = readFileSync(
      join(process.cwd(), "components/home/FAQ.tsx"),
      "utf8",
    );

    assert.doesNotMatch(homeSource, /<CTA \/>/);
    assert.match(faqSource, /^"use client";/);
    assert.match(faqSource, /ChevronDown/);
    assert.match(faqSource, /ChevronUp/);
    assert.match(
      faqSource,
      /grid w-full max-w-6xl grid-cols-\[1fr_1\.15fr\] items-stretch gap-6/,
    );
    assert.match(faqSource, /bg-background py-16 text-foreground/);
    assert.match(faqSource, /max-w-6xl/);
    assert.match(faqSource, /px-4/);
    assert.match(faqSource, /sm:px-6/);
    assert.match(faqSource, /lg:px-8/);
    assert.doesNotMatch(faqSource, /bg-white/);
    assert.doesNotMatch(faqSource, /max-w-\[1100px\]/);
    assert.match(
      faqSource,
      /c5-animated-gradient flex flex-col items-center justify-center rounded-\[20px\] px-8 py-14 text-center text-white/,
    );
    assert.match(faqSource, /fontFamily: "'Inter', sans-serif"/);
    assert.match(faqSource, /const cta = useTranslations\("Landing\.CTA"\)/);
    assert.match(faqSource, /\{cta\("title"\)\}/);
    assert.match(faqSource, /cta\.rich\("description"/);
    assert.match(faqSource, /\{cta\("button"\)\}/);
    assert.doesNotMatch(faqSource, /Ready to Transfer/);
    assert.doesNotMatch(faqSource, /Without Borders\?/);
    assert.doesNotMatch(faqSource, /Send Money Worldwide/);
    assert.doesNotMatch(faqSource, /Get Started Today/);
  });

  test("places the FAQ title in a full-width heading above the columns", () => {
    const faqSource = readFileSync(
      join(process.cwd(), "components/home/FAQ.tsx"),
      "utf8",
    );

    const headingIndex = faqSource.indexOf('data-testid="faq-section-heading"');
    const gridIndex = faqSource.indexOf("grid w-full max-w-6xl");

    assert.notEqual(headingIndex, -1);
    assert.notEqual(gridIndex, -1);
    assert.ok(headingIndex < gridIndex);
    assert.match(faqSource, /<h2 className="preset-title">/);
    assert.match(
      faqSource,
      /<span className="title-gradient">\{t\("title"\)\}<\/span>/,
    );
    assert.match(
      faqSource,
      /mx-auto mt-3 max-w-2xl text-base text-gray-600 dark:text-gray-400 md:text-lg/,
    );
    assert.doesNotMatch(
      faqSource,
      /<div className="mb-8">[\s\S]*?t\("title"\)/,
    );
  });

  test("registers the animated gradient CSS custom properties", () => {
    const cssSource = readFileSync(
      join(process.cwd(), "styles/globals.css"),
      "utf8",
    );

    assert.match(cssSource, /@property --c5-x1/);
    assert.match(cssSource, /\.c5-animated-gradient/);
    assert.match(cssSource, /background-color: var\(--primary\)/);
    assert.match(cssSource, /var\(--accent\) 0px/);
    assert.match(cssSource, /var\(--chart-1\) 0px/);
    assert.match(cssSource, /var\(--muted\) 0px/);
    assert.doesNotMatch(cssSource, /#ff8e53/);
    assert.doesNotMatch(cssSource, /#ff4b2b/);
    assert.doesNotMatch(cssSource, /#8aff8a/);
    assert.doesNotMatch(cssSource, /#ffd000/);
    assert.doesNotMatch(cssSource, /#ff1493/);
    assert.match(cssSource, /c5-blob1 5s ease-in-out infinite/);
    assert.match(cssSource, /@keyframes c5-size5/);
    assert.match(cssSource, /prefers-reduced-motion: reduce/);
  });
});
