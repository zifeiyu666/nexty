import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("homepage how it works section", () => {
  test("is registered on the homepage with the shared four-step layout", () => {
    const homeSource = readFileSync(
      join(process.cwd(), "components/home/index.tsx"),
      "utf8",
    );
    const componentPath = join(process.cwd(), "components/home/HowItWorks.tsx");
    const sharedComponentPath = join(
      process.cwd(),
      "components/shared/HowItWorksSection.tsx",
    );
    const birthdayPagePath = join(
      process.cwd(),
      "components/occasions/BirthdaySongsPage.tsx",
    );

    assert.match(homeSource, /import HowItWorks/);
    assert.match(homeSource, /<HowItWorks \/>/);
    assert.ok(existsSync(componentPath));
    assert.ok(existsSync(sharedComponentPath));
    assert.ok(existsSync(birthdayPagePath));

    const componentSource = readFileSync(componentPath, "utf8");
    const sharedComponentSource = readFileSync(sharedComponentPath, "utf8");
    const birthdayPageSource = readFileSync(birthdayPagePath, "utf8");

    assert.match(componentSource, /HowItWorksSection/);
    assert.match(componentSource, /const stepKeys = \["story", "preview", "gift", "deliver"\] as const/);
    assert.match(componentSource, /sectionClassName="home-section-muted isolate"/);
    assert.match(componentSource, /data-how-it-works-geometry/);
    assert.match(componentSource, /data-how-it-works-description/);
    assert.match(componentSource, /rounded-full bg-white\/55/);
    assert.match(componentSource, /rounded-2xl bg-white\/45/);
    assert.match(componentSource, /kicker: String\(index \+ 1\)\.padStart\(2, "0"\)/);
    assert.match(componentSource, /kickerClassName="bg-primary text-primary-foreground"/);
    assert.match(componentSource, /mobileCarousel/);
    assert.doesNotMatch(componentSource, /Cormorant_Garamond/);
    assert.doesNotMatch(componentSource, /lucide-react/);
    assert.doesNotMatch(componentSource, /title-gradient/);
    assert.doesNotMatch(componentSource, /StepVisual|StoryPromptPreview|PreviewDashboard|GiftBundlePreview/);
    assert.doesNotMatch(componentSource, /#C5A880/);
    assert.doesNotMatch(componentSource, /#9E4747/);
    assert.doesNotMatch(componentSource, /bg-\[#0b0f19\]/);
    assert.doesNotMatch(componentSource, /8b5cf6|a855f7|6d5dfc/);
    assert.doesNotMatch(componentSource, /how-it-works-typing/);
    assert.doesNotMatch(componentSource, /how-it-works-wave/);
    assert.doesNotMatch(componentSource, /how-it-works-grooves/);

    assert.match(sharedComponentSource, /text-xs font-bold uppercase tracking-\[0\.24em\] text-\[#c33f32\]/);
    assert.match(sharedComponentSource, /mt-12 grid gap-4 lg:grid-cols-4/);
    assert.match(sharedComponentSource, /from "@\/components\/ui\/carousel"/);
    assert.match(sharedComponentSource, /mobileCarousel = false/);
    assert.match(sharedComponentSource, /className="mt-10 md:hidden"/);
    assert.match(sharedComponentSource, /basis-\[86%\] pl-3 min-\[430px\]:basis-\[82%\]/);
    assert.match(sharedComponentSource, /mobileCarousel && "hidden md:grid"/);
    assert.match(sharedComponentSource, /data-how-it-works-card/);
    assert.match(sharedComponentSource, /home-card home-card-hover p-6/);
    assert.match(sharedComponentSource, /rounded-full bg-\[#25130e\] px-3 py-1 text-xs font-black text-white/);

    assert.match(birthdayPageSource, /<HowItWorksSection/);
    assert.match(birthdayPageSource, /title="From birthday memory to custom happy birthday song"/);
    assert.match(birthdayPageSource, /steps=\{steps\}/);
    assert.doesNotMatch(
      birthdayPageSource,
      /<section\s+id="how-it-works"[\s\S]*?mt-12 grid gap-4 lg:grid-cols-4/,
    );
  });

  test("keeps required SEO terms as strong tags in every locale", () => {
    const locales = readdirSync(join(process.cwd(), "i18n/messages"), {
      withFileTypes: true,
    })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((locale) =>
        existsSync(join(process.cwd(), `i18n/messages/${locale}/Landing.json`)),
      );

    for (const locale of locales) {
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
