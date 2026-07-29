import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const detailRoutes = [
  "occasions",
  "recipients",
  "styles",
] as const;

for (const route of detailRoutes) {
  test(`${route} playlist detail static params include the locale`, () => {
    const source = readFileSync(
      join(
        process.cwd(),
        `app/[locale]/(basic-layout)/playlists/${route}/[slug]/page.tsx`,
      ),
      "utf8",
    );

    assert.match(source, /Locale, LOCALES/);
    assert.match(source, /LOCALES\.flatMap/);
    assert.match(source, /locale,\s+slug: playlist\.slug/);
  });
}
