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
    assert.match(ctaSource, /const firstSong = songOptions\[0\]/);
    assert.match(ctaSource, /initialSong=\{firstSong\}/);
    assert.match(ctaSource, /songOptions=\{songOptions\}/);
    assert.match(ctaSource, /emptyState=\{firstSong \? undefined : <MusicVideoEmptyState \/>/);
    assert.match(ctaSource, /href="\/create-song"/);
  });

  test("uses the existing carousel for mobile products and keeps desktop grid", () => {
    const source = readFileSync(
      join(process.cwd(), "components/home/OurProducts.tsx"),
      "utf8",
    );

    assert.match(source, /from "@\/components\/ui\/carousel"/);
    assert.match(source, /aria-label="Our products carousel"/);
    assert.match(source, /className="mt-10 md:hidden"/);
    assert.match(source, /basis-\[86%\] pl-3 min-\[430px\]:basis-\[82%\]/);
    assert.match(source, /mt-12 hidden grid-cols-1 gap-6 md:grid md:grid-cols-3/);
    assert.match(source, /min-h-\[460px\]/);
    assert.match(source, /md:min-h-\[510px\]/);
  });
});
