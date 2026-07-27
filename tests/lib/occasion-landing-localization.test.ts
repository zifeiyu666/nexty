import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  getAllOccasionLandingConfigs,
  OCCASION_LANDING_SLUGS,
} from "@/lib/occasion-landing-pages";

function contentStrings(config: ReturnType<typeof getAllOccasionLandingConfigs>[number]) {
  return [
    config.shortName,
    config.primaryKeyword,
    config.metadata.title,
    config.metadata.description,
    config.hero.badge,
    config.hero.title,
    config.hero.description,
    config.hero.imageAlt,
    config.hero.cardTitle,
    config.hero.cardDescription,
    config.hero.cta,
    config.why.title,
    config.why.description,
    ...config.why.benefits.flatMap((item) => [item.title, item.description]),
    config.how.title,
    config.how.description,
    ...config.how.steps.flatMap((item) => [item.title, item.description]),
    config.moments.title,
    config.moments.description,
    ...config.moments.items.flatMap((item) => [item.title, item.description]),
    config.topics.title,
    config.topics.description,
    ...config.topics.items.flatMap((item) => [
      item.title,
      item.description,
      item.prompt,
      ...item.keywords,
    ]),
    config.examples.title,
    config.examples.description,
    ...config.examples.items.flatMap((item) => [
      item.label,
      item.title,
      item.text,
    ]),
    config.testimonials.title,
    config.testimonials.description,
    ...config.testimonials.items.flatMap((item) => [
      item.quote,
      item.author,
      item.badge,
    ]),
    config.faq.title,
    config.faq.description,
    config.faq.ctaTitle,
    config.faq.ctaDescription,
    ...config.faq.items.flatMap((item) => [item.question, item.answer]),
    ...Object.values(config.ui),
  ];
}

describe("occasion landing localization", () => {
  test("localizes every dynamic occasion into Spanish and Japanese", () => {
    assert.ok(OCCASION_LANDING_SLUGS.includes("anniversary"));
    assert.ok(OCCASION_LANDING_SLUGS.includes("birthday"));

    const english = getAllOccasionLandingConfigs("en");
    for (const locale of ["es", "ja"]) {
      const localized = getAllOccasionLandingConfigs(locale);
      assert.equal(localized.length, english.length);

      for (const [index, config] of localized.entries()) {
        assert.equal(config.slug, english[index].slug);
        assert.equal(config.locale, locale);

        const localizedText = contentStrings(config).join("\n");
        const englishText = contentStrings(english[index]).join("\n");
        assert.notEqual(localizedText, englishText);
        assert.doesNotMatch(
          localizedText,
          /Why it works|How it works|See examples|More occasions|Create this custom song/,
        );

        if (locale === "es") {
          assert.match(localizedText, /[áéíóúñ¿¡]/i);
        } else {
          assert.match(localizedText, /[\u3040-\u30ff\u3400-\u9fff]/);
        }
      }
    }
  });
});
