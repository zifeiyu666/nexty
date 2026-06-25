import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("CustomSongWizard lyric version comparison", () => {
  test("shows a comparison dialog before applying a generated lyrics version", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/CustomSongWizard.tsx"),
      "utf8",
    );

    assert.match(source, /type LyricsVersionComparison/);
    assert.match(source, /Compare lyrics versions/);
    assert.match(source, /LyricsVersionPanel/);
    assert.match(source, /Use original/);
    assert.match(source, /Use new version/);
    assert.match(source, /setLyricsVersionComparison/);
    assert.match(source, /setGeneratedLyrics\(lyricsVersionComparison\.newLyrics\)/);
  });

  test("finalizes the selected song version before opening the paywall", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/CustomSongWizard.tsx"),
      "utf8",
    );

    assert.match(source, /async function chooseSongVersion/);
    assert.match(source, /fetch\("\/api\/songs\/finalize"/);
    assert.match(source, /const providerVersionId = songVersion\?\.id \|\| version/);
    assert.match(source, /setSelectedProviderVersion\(providerVersionId\)/);
    assert.match(source, /result\.error === "Insufficient song balance\."/);
    assert.match(source, /versionId: selectedProviderVersion \|\| selectedVersion/);
    assert.match(source, /router\.push\(`\/pricing\?\$\{params\.toString\(\)\}`\)/);
    assert.doesNotMatch(
      source,
      /function chooseSongVersion\(version: string\) \{\s*setSelectedVersion\(version\);\s*setIsPaywallOpen\(true\);/,
    );
  });

  test("sample player pricing redirect carries the provider version id", () => {
    const source = readFileSync(
      join(process.cwd(), "components/song/SampleSongPlayer.tsx"),
      "utf8",
    );

    assert.match(source, /const providerVersionId = songVersion\?\.id \|\| v/);
    assert.match(source, /setSelectedProviderVersionForPaywall\(providerVersionId\)/);
    assert.match(source, /selectedProviderVersionForPaywall \|\|\s*selectedVersionForPaywall/);
    assert.match(source, /returnTo: `\/samples\/\$\{data\.songId\}`/);
  });
});
