import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, test } from "node:test";
import matter from "gray-matter";
import {
  getLocaleFallbackChain,
  mergePostsWithLocaleFallback,
} from "@/lib/cms/locale-fallback";

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

  test("ships complete Spanish and Japanese coverage for every published blog", async () => {
    const englishDirectory = resolve(process.cwd(), "blogs", "en");
    const filenames = await readdir(englishDirectory);
    const publishedPosts = (
      await Promise.all(
        filenames
          .filter((filename) => filename.endsWith(".mdx"))
          .map(async (filename) => {
            const source = await readFile(
              resolve(englishDirectory, filename),
              "utf8",
            );
            return { filename, ...matter(source) };
          }),
      )
    ).filter((post) => post.data.status === "published");

    assert.equal(publishedPosts.length, 8);

    for (const englishPost of publishedPosts) {
      for (const locale of ["es", "ja"]) {
        const localizedSource = await readFile(
          resolve(process.cwd(), "blogs", locale, englishPost.filename),
          "utf8",
        );
        const localizedPost = matter(localizedSource);

        assert.equal(localizedPost.data.slug, englishPost.data.slug);
        assert.equal(localizedPost.data.status, "published");
        assert.equal(
          localizedPost.data.featuredImageUrl,
          englishPost.data.featuredImageUrl,
        );
        assert.notEqual(localizedPost.data.title, englishPost.data.title);
        assert.notEqual(
          localizedPost.content.trim(),
          englishPost.content.trim(),
        );
        const minimumLengthRatio = locale === "es" ? 0.28 : 0.12;
        assert.ok(
          localizedPost.content.length >=
            englishPost.content.length * minimumLengthRatio,
          `${locale}/${englishPost.filename} is unexpectedly short`,
        );

        if (locale === "es") {
          assert.match(
            `${localizedPost.data.title}\n${localizedPost.content}`,
            /[áéíóúñ¿¡]/i,
          );
        } else {
          assert.match(
            `${localizedPost.data.title}\n${localizedPost.content}`,
            /[\u3040-\u30ff\u3400-\u9fff]/,
          );
        }
      }
    }
  });

  test("prefers translated posts over English fallback posts in locale lists", () => {
    const merged = mergePostsWithLocaleFallback([
      { slug: "birthday", locale: "es", title: "Cumpleaños" },
      { slug: "birthday", locale: "en", title: "Birthday" },
      { slug: "fallback-only", locale: "en", title: "English fallback" },
    ]);

    assert.deepEqual(merged, [
      { slug: "birthday", locale: "es", title: "Cumpleaños" },
      { slug: "fallback-only", locale: "en", title: "English fallback" },
    ]);
  });
});
