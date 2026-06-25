import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";

import {
  buildKieSunoCallbackUrl,
  extractLyricsText,
  getMockKieSunoMusicResult,
  getMockKieSunoTaskId,
  normalizeKieLyricsRecord,
  normalizeKieMusicRecord,
  normalizeKieTimestampedLyricsRecord,
  submitTimestampedLyricsTask,
  submitMusicTask,
} from "../../../../lib/ai/adapters/kie-suno";
import { persistKieSongVersionMediaToR2 } from "../../../../lib/ai/kie-suno-media";

describe("KIE Suno adapter normalization", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    delete process.env.KIE_API_KEY;
    delete process.env.WEBHOOK_BASE_URL;
    delete process.env.KIE_SUNO_CALLBACK_URL;
    delete process.env.KIE_SUNO_MOCK_TASK_ID;
    delete process.env.KIE_SUNO_MOCK_RESULT_JSON;
    delete process.env.KIE_SUNO_MOCK_VERSIONS_JSON;
    delete process.env.KIE_SUNO_MOCK_AUDIO_ID_A;
    delete process.env.KIE_SUNO_MOCK_AUDIO_ID_B;
    delete process.env.KIE_SUNO_MOCK_TITLE_A;
    delete process.env.KIE_SUNO_MOCK_TITLE_B;
    delete process.env.KIE_SUNO_MOCK_AUDIO_URL_A;
    delete process.env.KIE_SUNO_MOCK_AUDIO_URL_B;
    delete process.env.KIE_SUNO_MOCK_IMAGE_URL_A;
    delete process.env.KIE_SUNO_MOCK_IMAGE_URL_B;
    delete process.env.KIE_SUNO_MOCK_DURATION_A;
    delete process.env.KIE_SUNO_MOCK_DURATION_B;
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
    process.env.KIE_SUNO_MOCK_TASK_ID = "false";

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

  test("uses the temporary KIE Suno mock task id by default", async () => {
    assert.equal(getMockKieSunoTaskId(), "de2f8263ef5a1238d1b4570b88dcc8fb");

    globalThis.fetch = (async () => {
      throw new Error("submitMusicTask should not call KIE while mock is enabled");
    }) as typeof fetch;

    const taskId = await submitMusicTask({
      title: "A Song",
      lyrics: "[Verse 1]\nA lyric",
      genre: "Pop",
      vocalGender: "Female",
      language: "English",
    });

    assert.equal(taskId, "de2f8263ef5a1238d1b4570b88dcc8fb");
  });

  test("builds offline mock music results without fetching KIE", () => {
    process.env.KIE_SUNO_MOCK_VERSIONS_JSON = JSON.stringify([
      {
        id: "mock-a",
        title: "Mock A",
        audioUrl: "https://cdn.example.com/mock-a.mp3",
        imageUrl: "https://cdn.example.com/mock-a.jpg",
      },
      {
        id: "mock-b",
        title: "Mock B",
        audioUrl: "https://cdn.example.com/mock-b.mp3",
      },
    ]);

    globalThis.fetch = (async () => {
      throw new Error("getMockKieSunoMusicResult should not call KIE");
    }) as typeof fetch;

    const result = getMockKieSunoMusicResult("de2f8263ef5a1238d1b4570b88dcc8fb");

    assert.equal(result?.status, "succeeded");
    assert.deepEqual(
      result?.versions.map((version) => version.id),
      ["mock-a", "mock-b"],
    );
  });

  test("uses simple mock env values before parsing versions JSON", () => {
    process.env.KIE_SUNO_MOCK_AUDIO_ID_A = "track-a";
    process.env.KIE_SUNO_MOCK_TITLE_A = "May, My Sweet Valentine";
    process.env.KIE_SUNO_MOCK_AUDIO_URL_A = "https://cdn.example.com/a.mp3";
    process.env.KIE_SUNO_MOCK_IMAGE_URL_A = "https://cdn.example.com/a.jpg";
    process.env.KIE_SUNO_MOCK_AUDIO_ID_B = "track-b";
    process.env.KIE_SUNO_MOCK_AUDIO_URL_B = "https://cdn.example.com/b.mp3";
    process.env.KIE_SUNO_MOCK_VERSIONS_JSON = "{ this is intentionally invalid json";

    globalThis.fetch = (async () => {
      throw new Error("getMockKieSunoMusicResult should not call KIE");
    }) as typeof fetch;

    const result = getMockKieSunoMusicResult("de2f8263ef5a1238d1b4570b88dcc8fb");

    assert.equal(result?.status, "succeeded");
    assert.deepEqual(
      result?.versions.map((version) => ({
        id: version.id,
        title: version.title,
        audioUrl: version.audioUrl,
        imageUrl: version.imageUrl,
      })),
      [
        {
          id: "track-a",
          title: "May, My Sweet Valentine",
          audioUrl: "https://cdn.example.com/a.mp3",
          imageUrl: "https://cdn.example.com/a.jpg",
        },
        {
          id: "track-b",
          title: "Version B",
          audioUrl: "https://cdn.example.com/b.mp3",
          imageUrl: undefined,
        },
      ],
    );
  });

  test("accepts copied mock versions JSON with raw title newline and a missing property comma", () => {
    process.env.KIE_SUNO_MOCK_VERSIONS_JSON = `[
  { "id":"track-a",
    "title":"May,
    My Sweet Valentine",
    "audioUrl":"https://cdn.customsong.top/a/audio.mp3",
    "imageUrl":"https://musicfile.kie.ai/cover.jpeg"
  },
  { "id":"track-b",
    "title":"May, My Sweet Valentine",
    "audioUrl":"https://cdn.customsong.top/b/audio.mp3"
    "imageUrl":"https://musicfile.kie.ai/cover.jpeg"
  }
]`;

    const result = getMockKieSunoMusicResult("de2f8263ef5a1238d1b4570b88dcc8fb");

    assert.equal(result?.status, "succeeded");
    assert.deepEqual(
      result?.versions.map((version) => ({
        id: version.id,
        title: version.title,
        audioUrl: version.audioUrl,
        imageUrl: version.imageUrl,
      })),
      [
        {
          id: "track-a",
          title: "May,\n    My Sweet Valentine",
          audioUrl: "https://cdn.customsong.top/a/audio.mp3",
          imageUrl: "https://musicfile.kie.ai/cover.jpeg",
        },
        {
          id: "track-b",
          title: "May, My Sweet Valentine",
          audioUrl: "https://cdn.customsong.top/b/audio.mp3",
          imageUrl: "https://musicfile.kie.ai/cover.jpeg",
        },
      ],
    );
  });

  test("fails closed when mock mode has no offline versions", () => {
    const result = getMockKieSunoMusicResult("de2f8263ef5a1238d1b4570b88dcc8fb");

    assert.equal(result?.status, "failed");
    assert.match(result?.error || "", /no offline mock result/i);
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

  test("uploads generated song audio and cover images to R2", async () => {
    const calls: unknown[] = [];
    const versions = await persistKieSongVersionMediaToR2({
      externalId: "kie-task",
      songId: "song-1",
      versions: [
        {
          id: "track-a",
          title: "Track A",
          audioUrl: "https://cdn.kie.ai/a.mp3",
          imageUrl: "https://cdn.kie.ai/a.jpg",
        },
        {
          id: "track-b",
          title: "Track B",
          audioUrl: "https://cdn.kie.ai/b.mp3",
        },
      ],
      uploadExternalUrlToR2: async (url, key) => {
        calls.push({ key, url });
        return { key, url: `https://r2.example.com/${key}` };
      },
    });

    assert.deepEqual(calls, [
      {
        key: "songs/generated/song-1/kie-task/track-a/audio.mp3",
        url: "https://cdn.kie.ai/a.mp3",
      },
      {
        key: "songs/generated/song-1/kie-task/track-a/cover.jpg",
        url: "https://cdn.kie.ai/a.jpg",
      },
      {
        key: "songs/generated/song-1/kie-task/track-b/audio.mp3",
        url: "https://cdn.kie.ai/b.mp3",
      },
    ]);
    assert.equal(
      versions[0]?.audioUrl,
      "https://r2.example.com/songs/generated/song-1/kie-task/track-a/audio.mp3",
    );
    assert.equal(
      versions[0]?.imageUrl,
      "https://r2.example.com/songs/generated/song-1/kie-task/track-a/cover.jpg",
    );
    assert.equal(
      versions[1]?.audioUrl,
      "https://r2.example.com/songs/generated/song-1/kie-task/track-b/audio.mp3",
    );
    assert.equal(versions[1]?.imageUrl, undefined);
  });

  test("normalizes timestamped lyrics records with aligned words", () => {
    const normalized = normalizeKieTimestampedLyricsRecord({
      code: 200,
      msg: "success",
      data: {
        alignedWords: [
          { word: "Hello", startS: 0.42, endS: 0.8 },
          { word: "world", startS: 0.82, endS: 1.2 },
        ],
        waveformData: [0, 1, 0.5],
      },
    });

    assert.equal(normalized.status, "succeeded");
    assert.deepEqual(normalized.alignedWords, [
      { word: "Hello", startS: 0.42, endS: 0.8 },
      { word: "world", startS: 0.82, endS: 1.2 },
    ]);
  });

  test("requests timestamped lyrics with taskId and audioId", async () => {
    process.env.KIE_API_KEY = "test-key";

    let url = "";
    let payload: any;
    globalThis.fetch = (async (input, init) => {
      url = String(input);
      payload = JSON.parse(String(init?.body));
      return new Response(
        JSON.stringify({
          code: 200,
          data: { alignedWords: [{ word: "Hi", startS: 1, endS: 1.4 }] },
        }),
        { status: 200 }
      );
    }) as typeof fetch;

    const result = await submitTimestampedLyricsTask({
      taskId: "kie-task",
      audioId: "audio-a",
    });

    assert.match(url, /\/api\/v1\/generate\/get-timestamped-lyrics$/);
    assert.deepEqual(payload, { taskId: "kie-task", audioId: "audio-a" });
    assert.equal(result.status, "succeeded");
    assert.equal(result.alignedWords[0]?.word, "Hi");
  });
});
