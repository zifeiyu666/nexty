import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("subscription upgrade entry", () => {
  test("shows the pricing upgrade link to active subscribers", () => {
    const page = readFileSync(
      join(
        process.cwd(),
        "app/[locale]/(protected)/dashboard/(user)/subscription/page.tsx"
      ),
      "utf8"
    );

    assert.match(
      page,
      /<CurrentUserBenefitsDisplay\s*\/>[\s\S]*?href=\{process\.env\.NEXT_PUBLIC_PRICING_PATH!\}[\s\S]*?\{t\("upgradePlan"\)\}[\s\S]*?<PortalButton/
    );
  });
});
