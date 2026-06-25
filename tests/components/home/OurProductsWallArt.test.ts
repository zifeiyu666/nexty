import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("homepage wall art studio CTA", () => {
  test("passes authenticated song options into the products section", () => {
    const source = readFileSync(
      join(process.cwd(), "components/home/index.tsx"),
      "utf8",
    );

    assert.match(source, /getSession/);
    assert.match(source, /getFinalSongsForOwner/);
    assert.match(source, /buildSongShareUrl/);
    assert.match(source, /musicVideoSongOptions/);
    assert.match(source, /wallArtSongOptions/);
    assert.match(source, /audioUrl: song\.audioUrl/);
    assert.match(source, /duration: song\.duration/);
    assert.match(source, /timestampedLyrics: getTimestampedLyrics/);
    assert.match(source, /musicVideoSongOptions=\{musicVideoSongOptions\}/);
    assert.match(source, /isAuthenticated=\{isAuthenticated\}/);
    assert.match(source, /wallArtSongOptions=\{wallArtSongOptions\}/);
  });

  test("opens Wall Art Studio from only the wall art product card", () => {
    const source = readFileSync(
      join(process.cwd(), "components/home/OurProducts.tsx"),
      "utf8",
    );
    const ctaSource = readFileSync(
      join(process.cwd(), "components/song/WallArtStudioCta.tsx"),
      "utf8",
    );

    assert.match(source, /WallArtStudioCta/);
    assert.match(source, /productKey === "wallArt"/);
    assert.match(source, /href=\{productHrefs\[productKey\]\}/);
    assert.match(source, /isAuthenticated=\{isAuthenticated\}/);
    assert.match(source, /songOptions=\{wallArtSongOptions\}/);
    assert.match(ctaSource, /LoginDialog/);
    assert.match(ctaSource, /!isAuthenticated/);
    assert.match(ctaSource, /setIsLoginDialogOpen\(true\)/);
    assert.match(ctaSource, /WallArtEditorDrawer/);
    assert.match(ctaSource, /initialSong=\{songOptions\[0\]\}/);
  });

  test("opens Music Video Studio from only the music video product card", () => {
    const source = readFileSync(
      join(process.cwd(), "components/home/OurProducts.tsx"),
      "utf8",
    );
    const ctaSource = readFileSync(
      join(process.cwd(), "components/song/MusicVideoStudioCta.tsx"),
      "utf8",
    );

    assert.match(source, /MusicVideoStudioCta/);
    assert.match(source, /productKey === "videoGift"/);
    assert.match(source, /songOptions=\{musicVideoSongOptions\}/);
    assert.match(ctaSource, /LoginDialog/);
    assert.match(ctaSource, /!isAuthenticated/);
    assert.match(ctaSource, /setIsLoginDialogOpen\(true\)/);
    assert.match(ctaSource, /MusicVideoEditorDrawer/);
    assert.match(ctaSource, /songId=\{firstSong\?\.id/);
    assert.match(ctaSource, /audioUrl=\{firstSong\?\.audioUrl/);
    assert.match(ctaSource, /timestampedLyrics=\{firstSong\?\.timestampedLyrics/);
    assert.match(ctaSource, /emptyState=\{firstSong \? undefined : <MusicVideoEmptyState \/>/);
    assert.match(ctaSource, /href="\/create-song"/);
  });
});
