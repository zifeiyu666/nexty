import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

import {
  heroOccasionColumns,
  heroOccasionSources,
} from "@/components/home/HeroOccasionMosaic.config";

describe("hero occasion mosaic background", () => {
  test("builds eight alternating columns from local occasion images", () => {
    assert.ok(heroOccasionSources.length >= 12);
    assert.ok(heroOccasionSources.every((src) => src.startsWith("/occasion/")));
    assert.equal(heroOccasionColumns.length, 8);

    for (let index = 1; index < heroOccasionColumns.length; index += 1) {
      assert.notEqual(
        heroOccasionColumns[index].direction,
        heroOccasionColumns[index - 1].direction,
      );
    }

    assert.ok(heroOccasionColumns.every((column) => column.tiles.length >= 8));
    assert.ok(
      heroOccasionColumns.every(
        (column) => new Set(column.tiles.map((tile) => tile.heightClass)).size >= 3,
      ),
    );
  });

  test("uses a near-vertical tilted mosaic instead of the static hero image", () => {
    const heroSource = readFileSync(
      join(process.cwd(), "components/home/Hero.tsx"),
      "utf8",
    );
    const mosaicSource = readFileSync(
      join(process.cwd(), "components/home/HeroOccasionMosaic.tsx"),
      "utf8",
    );

    assert.match(heroSource, /<HeroOccasionMosaic \/>/);
    assert.doesNotMatch(heroSource, /hero_bg_white\.webp/);
    assert.match(mosaicSource, /rotate-\[-12deg\]/);
    assert.match(mosaicSource, /gap-4/);
    assert.match(mosaicSource, /lg:gap-6/);
    assert.match(mosaicSource, /w-28/);
    assert.match(mosaicSource, /2xl:w-56/);
  });

  test("supports the dark hero treatment with white copy", () => {
    const heroSource = readFileSync(
      join(process.cwd(), "components/home/Hero.tsx"),
      "utf8",
    );
    const mosaicSource = readFileSync(
      join(process.cwd(), "components/home/HeroOccasionMosaic.tsx"),
      "utf8",
    );

    assert.match(heroSource, /bg-\[#080605\]/);
    assert.match(heroSource, /text-white/);
    assert.match(heroSource, /bg-black\/62/);
    assert.match(heroSource, /!text-white/);
    assert.match(heroSource, /\[\&_strong\]:font-\[200\]/);
    assert.match(heroSource, /\[\&_strong\]:text-white/);
    assert.match(mosaicSource, /bg-\[#080605\]/);
    assert.match(mosaicSource, /brightness-\[0\.58\]/);
  });

  test("keeps the image columns drifting while the page is idle", () => {
    const mosaicSource = readFileSync(
      join(process.cwd(), "components/home/HeroOccasionMosaic.tsx"),
      "utf8",
    );

    assert.match(mosaicSource, /data-hero-occasion-column-idle/);
    assert.match(mosaicSource, /repeat:\s*-1/);
    assert.match(mosaicSource, /yoyo:\s*true/);
    assert.match(mosaicSource, /duration:\s*32/);
  });
});
