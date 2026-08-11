import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

function source(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("payment verification race handling", () => {
  test("provider handlers mark webhook-not-ready responses as pending", () => {
    for (const path of [
      "app/api/payment/verify-success/creem-handler.ts",
      "app/api/payment/verify-success/stripe-handler.ts",
      "app/api/payment/verify-success/paypal-handler.ts",
    ]) {
      const code = source(path);
      assert.match(code, /status:\s*["']pending["']/);
    }
  });

  test("success page retries pending verification instead of rendering failure", () => {
    const page = source("app/[locale]/(basic-layout)/payment/success/page.tsx");
    assert.match(page, /result\.data\?\.status\s*===\s*["']pending["']/);
    assert.match(page, /setTimeout\(/);
    assert.doesNotMatch(page, /if \(!result\.success\) \{\n\s*throw new Error/);
  });
});
