import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("extension draft routes", () => {
  test("creates rate-limited temporary drafts without logging their stories", () => {
    const source = readFileSync(
      join(process.cwd(), "app/api/extension/drafts/route.ts"),
      "utf8",
    );

    assert.match(source, /extensionDraftSchema\.safeParse/);
    assert.match(source, /extensionDraft/);
    assert.match(source, /checkRateLimit\(/);
    assert.match(source, /origin\.startsWith\("moz-extension:\/\/"\)/);
    assert.match(source, /source: "browser-extension", language: "en"/);
    assert.doesNotMatch(source, /metadata:\s*\{[^}]*story/);
  });

  test("consumes a valid draft once before restoring the wizard fields", () => {
    const route = readFileSync(
      join(process.cwd(), "app/api/extension/drafts/[token]/route.ts"),
      "utf8",
    );
    const wizard = readFileSync(
      join(process.cwd(), "components/song/CustomSongWizard.tsx"),
      "utf8",
    );

    assert.match(route, /consumeExtensionDraft\(token\)/);
    assert.match(wizard, /consumeExtensionDraftRequest\(draftToken\)/);
    assert.match(wizard, /setRecipients\(\[/);
    assert.match(wizard, /url\.searchParams\.delete\("draft_token"\)/);
  });
});
