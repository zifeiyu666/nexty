import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

const pageSource = readFileSync(
  join(
    process.cwd(),
    "app/[locale]/(basic-layout)/gifts/song-message/page.tsx",
  ),
  "utf8",
);

const landingSource = readFileSync(
  join(process.cwd(), "components/gifts/SongMessageLandingPage.tsx"),
  "utf8",
);

const englishMessagesSource = readFileSync(
  join(process.cwd(), "i18n/messages/en/common.json"),
  "utf8",
);

const spanishMessagesSource = readFileSync(
  join(process.cwd(), "i18n/messages/es/common.json"),
  "utf8",
);

const japaneseMessagesSource = readFileSync(
  join(process.cwd(), "i18n/messages/ja/common.json"),
  "utf8",
);

describe("song message SEO landing page", () => {
  test("uses the intended metadata and English canonical", () => {
    assert.match(pageSource, /Turn a Message Into a Song \| Song Message Gift/);
    assert.match(pageSource, /canonicalUrl: path/);
    assert.match(pageSource, /availableLocales: \["en"\]/);
    assert.match(pageSource, /turn a message into a song/);
  });

  test("redirects non-English locale routes to the English canonical", () => {
    assert.match(pageSource, /if \(locale !== "en"\)/);
    assert.match(pageSource, /permanentRedirect\(path\)/);
  });

  test("renders one keyword-led H1 and both required schemas", () => {
    const h1Count = (landingSource.match(/<h1\b/g) || []).length;
    assert.equal(h1Count, 1);
    assert.match(
      landingSource,
      /Turn Your Message Into a Personalized Song/,
    );
    assert.match(pageSource, /"@type": "FAQPage"/);
    assert.match(pageSource, /"@type": "BreadcrumbList"/);
  });

  test("reuses the configurable song brief and links key conversion pages", () => {
    assert.match(landingSource, /<StructuredSongBrief/);
    assert.match(landingSource, /variant="letter"/);
    assert.match(landingSource, /href="\/create-song"/);
    assert.match(landingSource, /href="\/samples"/);
    assert.match(landingSource, /href="\/pricing"/);
    assert.match(landingSource, /href="\/music\/personalized-gift"/);
  });

  test("is discoverable from both header and footer navigation", () => {
    const linkMatches = englishMessagesSource.match(
      /"href": "\/gifts\/song-message"/g,
    );
    assert.equal(linkMatches?.length, 2);
    assert.match(englishMessagesSource, /"name": "Turn a Message Into a Song"/);
    assert.equal(
      spanishMessagesSource.match(/"href": "\/gifts\/song-message"/g)
        ?.length,
      2,
    );
    assert.equal(
      japaneseMessagesSource.match(/"href": "\/gifts\/song-message"/g)
        ?.length,
      2,
    );
  });
});
