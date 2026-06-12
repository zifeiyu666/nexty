import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";

import {
  extractLyricsText,
  normalizeKieLyricsRecord,
  normalizeKieMusicRecord,
} from "../../../../lib/ai/adapters/kie-suno";

describe("KIE Suno adapter normalization", () => {
  afterEach(() => {
    delete process.env.KIE_API_KEY;
  });

  test("extracts lyrics text from common response shapes", () => {
    assert.equal(
      extractLyricsText({
        data: {
          response: {
            lyrics: "[Verse]\nHello from the song",
          },
        },
      }),
      "[Verse]\nHello from the song"
    );

    assert.equal(
      extractLyricsText({
        data: {
          result: JSON.stringify({ text: "Generated lyric text" }),
        },
      }),
      "Generated lyric text"
    );
  });

  test("normalizes successful lyrics records", () => {
    const normalized = normalizeKieLyricsRecord({
      code: 200,
      msg: "success",
      data: {
        status: "SUCCESS",
        response: {
          title: "A Song",
          lyrics: "[Chorus]\nA lyric",
        },
      },
    });

    assert.equal(normalized.status, "succeeded");
    assert.equal(normalized.title, "A Song");
    assert.equal(normalized.lyrics, "[Chorus]\nA lyric");
  });

  test("maps music partial success to processing and extracts generated tracks", () => {
    const firstSuccess = normalizeKieMusicRecord({
      code: 200,
      msg: "success",
      data: {
        status: "FIRST_SUCCESS",
        response: {
          data: [
            {
              id: "one",
              title: "Version One",
              audioUrl: "https://cdn.kie.ai/one.mp3",
              imageUrl: "https://cdn.kie.ai/one.jpg",
            },
          ],
        },
      },
    });

    assert.equal(firstSuccess.status, "processing");
    assert.equal(firstSuccess.versions.length, 1);
    assert.equal(firstSuccess.versions[0]?.audioUrl, "https://cdn.kie.ai/one.mp3");
  });

  test("normalizes completed music records and limits to two versions", () => {
    const normalized = normalizeKieMusicRecord({
      code: 200,
      msg: "success",
      data: {
        status: "SUCCESS",
        response: {
          sunoData: [
            { id: "a", title: "A", sourceAudioUrl: "https://cdn.kie.ai/a.mp3" },
            { id: "b", title: "B", audioUrl: "https://cdn.kie.ai/b.mp3" },
            { id: "c", title: "C", audioUrl: "https://cdn.kie.ai/c.mp3" },
          ],
        },
      },
    });

    assert.equal(normalized.status, "succeeded");
    assert.equal(normalized.versions.length, 2);
    assert.deepEqual(
      normalized.versions.map((version) => version.audioUrl),
      ["https://cdn.kie.ai/a.mp3", "https://cdn.kie.ai/b.mp3"]
    );
  });
});
