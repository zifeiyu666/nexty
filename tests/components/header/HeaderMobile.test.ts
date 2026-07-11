import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("Header mobile layout", () => {
  test("centers the logo and only keeps the menu action on mobile", () => {
    const source = readFileSync(
      join(process.cwd(), "components/header/Header.tsx"),
      "utf8",
    );
    const mobileActions = source.match(
      /\{\/\* Mobile \*\/\}([\s\S]*?)<\/div>/,
    )?.[1];

    assert.match(source, /relative flex items-center justify-between/);
    assert.match(
      source,
      /absolute left-1\/2 flex -translate-x-1\/2[^"]*lg:static lg:translate-x-0/,
    );
    assert.match(mobileActions ?? "", /<MobileMenu/);
    assert.match(mobileActions ?? "", /user=\{user as User\}/);
    assert.doesNotMatch(mobileActions ?? "", /<Button/);
    assert.doesNotMatch(mobileActions ?? "", /<UserAvatar/);
  });

  test("provides account access through the mobile menu", () => {
    const source = readFileSync(
      join(process.cwd(), "components/header/MobileMenu.tsx"),
      "utf8",
    );

    assert.match(source, /href="\/dashboard"/);
    assert.match(source, /authClient\.signOut/);
    assert.match(source, /loginT\("Button\.signOut"\)/);
    assert.match(source, /href="\/login"/);
  });
});
