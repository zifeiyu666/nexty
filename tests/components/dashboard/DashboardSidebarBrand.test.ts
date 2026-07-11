import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("Dashboard sidebar brand", () => {
  test("uses the full logo image when the sidebar is expanded", () => {
    const source = readFileSync(
      join(
        process.cwd(),
        "app/[locale]/(protected)/dashboard/DashboardSidebar.tsx",
      ),
      "utf8",
    );

    assert.match(
      source,
      /src="\/images\/brand\/one-custom-song-wordmark-header\.png"/,
    );
    assert.match(source, /isCollapsed \? \(/);
    assert.doesNotMatch(source, /<h1[^>]*>\{tHome\("title"\)\}<\/h1>/);
  });
});
