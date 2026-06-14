import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";

import {
  buildKieSunoCallbackUrl,
  extractLyricsText,
  normalizeKieLyricsRecord,
  normalizeKieMusicRecord,
  submitMusicTask,
} from "../../../../lib/ai/adapters/kie-suno";

describe("KIE Suno adapter normalization", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    delete process.env.KIE_API_KEY;
    delete process.env.WEBHOOK_BASE_URL;
    delete process.env.KIE_SUNO_CALLBACK_URL;
    globalThis.fetch = originalFetch;
  });

  test("builds a KIE Suno callback URL from WEBHOOK_BASE_URL", () => {
    process.env.WEBHOOK_BASE_URL = "https://customsong.top/";

    assert.equal(
      buildKieSunoCallbackUrl(),
      "https://customsong.top/api/webhooks/kie/suno"
    );
  });

  test("submits music tasks with callBackUrl required by KIE", async () => {
    process.env.KIE_API_KEY = "test-key";
    process.env.WEBHOOK_BASE_URL = "https://customsong.top";

    let payload: any;
    globalThis.fetch = (async (_url, init) => {
      payload = JSON.parse(String(init?.body));
      return new Response(
        JSON.stringify({
          code: 200,
          data: { taskId: "kie-music-task" },
        }),
        { status: 200 }
      );
    }) as typeof fetch;

    const taskId = await submitMusicTask({
      title: "A Song",
      lyrics: "[Verse 1]\nA lyric",
      genre: "Pop",
      vocalGender: "Female",
      language: "English",
    });

    assert.equal(taskId, "kie-music-task");
    assert.equal(payload.callBackUrl, "https://customsong.top/api/webhooks/kie/suno");
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

  test("normalizes KIE callback complete payload with snake_case audio fields", () => {
    const normalized = normalizeKieMusicRecord({
      code: 200,
      msg: "All generated successfully.",
      data: {
        callbackType: "complete",
        task_id: "kie-task",
        data: [
          {
            id: "track-a",
            title: "Track A",
            audio_url: "https://cdn.kie.ai/a.mp3",
            stream_audio_url: "https://cdn.kie.ai/a-stream.mp3",
            image_url: "https://cdn.kie.ai/a.jpg",
            duration: 60,
          },
        ],
      },
    });

    assert.equal(normalized.status, "succeeded");
    assert.equal(normalized.versions.length, 1);
    assert.equal(normalized.versions[0]?.audioUrl, "https://cdn.kie.ai/a.mp3");
    assert.equal(normalized.versions[0]?.imageUrl, "https://cdn.kie.ai/a.jpg");
  });
});
