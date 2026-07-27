import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, test } from "node:test";
import matter from "gray-matter";
import { getLocaleFallbackChain } from "@/lib/cms/locale-fallback";

describe("CMS locale fallback", () => {
  test("checks the requested locale before English", () => {
    assert.deepEqual(getLocaleFallbackChain("es"), ["es", "en"]);
    assert.deepEqual(getLocaleFallbackChain("ja"), ["ja", "en"]);
  });

  test("does not query English twice", () => {
    assert.deepEqual(getLocaleFallbackChain("en"), ["en"]);
  });

  test("ships Spanish and Japanese translations for the reported blog", async () => {
    const translations = await Promise.all(
      ["es", "ja"].map(async (locale) => {
        const source = await readFile(
          resolve(
            process.cwd(),
            "blogs",
            locale,
            "custom-song-lyric-gifts.mdx",
          ),
          "utf8",
        );
        return matter(source);
      }),
    );

    assert.match(translations[0].data.title, /Ideas de arte mural/);
    assert.match(translations[0].content, /Cuatro ideas imprimibles/);
    assert.match(translations[1].data.title, /歌詞ウォールアート/);
    assert.match(translations[1].content, /4つの印刷用アイデア/);
  });
});
