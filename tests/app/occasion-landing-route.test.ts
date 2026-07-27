import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

test("occasion landing pages remain available for every configured slug", () => {
  const source = readFileSync(
    join(
      process.cwd(),
      "app/[locale]/(basic-layout)/occasions/[slug]/page.tsx",
    ),
    "utf8",
  );

  assert.doesNotMatch(source, /dynamicParams\s*=\s*false/);
  assert.doesNotMatch(source, /generateStaticParams/);
});
