import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("features section demo 2 component", () => {
  test("exists in the shadcn ui component directory with the expected content", () => {
    const source = readFileSync(
      join(process.cwd(), "components/ui/features-section-demo-2.tsx"),
      "utf8",
    );

    assert.match(source, /import \{ cn \} from "@\/lib\/utils";/);
    assert.match(source, /from "@tabler\/icons-react";/);
    assert.match(source, /export default function FeaturesSectionDemo\(\)/);
    assert.match(source, /grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4/);

    const expectedTitles = [
      "Built for developers",
      "Ease of use",
      "Pricing like no other",
      "100% Uptime guarantee",
      "Multi-tenant Architecture",
      "24/7 Customer Support",
      "Money back guarantee",
      "And everything else",
    ];

    for (const title of expectedTitles) {
      assert.match(source, new RegExp(title));
    }
  });
});
