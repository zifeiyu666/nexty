import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("FinalSongPlayer share dialog", () => {
  test("opens a share dialog with copy, X sharing, and preview actions", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/FinalSongPlayer.tsx"),
      "utf8",
    );

    assert.match(source, /<DialogTitle>Share this song<\/DialogTitle>/);
    assert.match(source, /navigator\.clipboard\.writeText\(shareUrl\)/);
    assert.match(source, /Copy link/);
    assert.match(source, /https:\/\/twitter\.com\/intent\/tweet/);
    assert.match(source, /Share to X/);
    assert.match(source, />\s*Preview\s*</);
    assert.match(source, /Preview share page/);
    assert.match(source, /href=\{shareUrl\}/);
  });

  test("keeps the dialog wide and lets long share links wrap", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/FinalSongPlayer.tsx"),
      "utf8",
    );

    assert.match(source, /sm:max-w-2xl/);
    assert.match(source, /min-w-0 space-y-4 overflow-y-auto/);
    assert.match(source, /break-all text-sm font-semibold/);
    assert.match(source, /sm:truncate sm:break-normal/);
  });

  test("song detail page passes a short share URL into the player", () => {
    const source = readFileSync(
      join(
        process.cwd(),
        "app/[locale]/(basic-layout)/songs/[songId]/page.tsx",
      ),
      "utf8",
    );

    assert.match(source, /buildSongShareUrl/);
    assert.match(source, /shareUrl: buildSongShareUrl\(song\)/);
  });

  test("short share route resolves the short code and redirects to the shared song page", () => {
    const source = readFileSync(
      join(process.cwd(), "app/[locale]/(basic-layout)/s/[shortCode]/page.tsx"),
      "utf8",
    );

    assert.match(source, /getSharedSongByShortCode/);
    assert.match(
      source,
      /redirect\(`\/shared\/songs\/\$\{song\.shareToken\}`\)/,
    );
  });
});
