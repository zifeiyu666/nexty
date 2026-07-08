import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";

import {
  buildKieSunoMusicPrompt,
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
    process.env.WEBHOOK_BASE_URL = "https://onecustomsong.com/";

    assert.equal(
      buildKieSunoCallbackUrl(),
      "https://onecustomsong.com/api/webhooks/kie/suno"
    );
  });

  test("submits music tasks with callBackUrl required by KIE", async () => {
    process.env.KIE_API_KEY = "test-key";
    process.env.WEBHOOK_BASE_URL = "https://onecustomsong.com";
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
    assert.equal(payload.callBackUrl, "https://onecustomsong.com/api/webhooks/kie/suno");
  });

  test("prepares Suno music prompts with an instrumental intro before vocal sections", () => {
    assert.equal(
      buildKieSunoMusicPrompt(
        "Title: Safe Haven, Elena\n\n[Verse 1]\nIn the blue light\n[Chorus]\nSafe haven",
      ),
      "[Instrumental Intro]\n\n[Verse 1]\nIn the blue light\n[Chorus]\nSafe haven",
    );
  });

  test("does not duplicate an existing Suno intro tag", () => {
    assert.equal(
      buildKieSunoMusicPrompt(
        "Title: Safe Haven, Elena\n\n[Instrumental Intro]\n\n[Verse 1]\nIn the blue light",
      ),
      "[Instrumental Intro]\n\n[Verse 1]\nIn the blue light",
    );
  });

  test("submits sanitized music prompts to KIE without changing local lyrics", async () => {
    process.env.KIE_API_KEY = "test-key";
    process.env.WEBHOOK_BASE_URL = "https://onecustomsong.com";
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

    await submitMusicTask({
      title: "Safe Haven, Elena",
      lyrics: "Title: Safe Haven, Elena\n\n[Verse 1]\nIn the blue light",
      genre: "Romantic Ballad",
      vocalGender: "Male",
      language: "English",
    });

    assert.equal(
      payload.prompt,
      "[Instrumental Intro]\n\n[Verse 1]\nIn the blue light",
    );
  });

  test("does not enable KIE Suno mock mode by default", async () => {
    assert.equal(getMockKieSunoTaskId(), null);

    process.env.KIE_SUNO_MOCK_TASK_ID = "mock-task-id";

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

    assert.equal(taskId, "mock-task-id");
  });

  test("builds offline mock music results without fetching KIE", () => {
    process.env.KIE_SUNO_MOCK_TASK_ID = "mock-task-id";
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

    const result = getMockKieSunoMusicResult("mock-task-id");

    assert.equal(result?.status, "succeeded");
    assert.deepEqual(
      result?.versions.map((version) => version.id),
      ["mock-a", "mock-b"],
    );
  });

  test("uses simple mock env values before parsing versions JSON", () => {
    process.env.KIE_SUNO_MOCK_TASK_ID = "mock-task-id";
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

    const result = getMockKieSunoMusicResult("mock-task-id");

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
    process.env.KIE_SUNO_MOCK_TASK_ID = "mock-task-id";
    process.env.KIE_SUNO_MOCK_VERSIONS_JSON = `[
  { "id":"track-a",
    "title":"May,
    My Sweet Valentine",
    "audioUrl":"https://cdn.onecustomsong.com/a/audio.mp3",
    "imageUrl":"https://musicfile.kie.ai/cover.jpeg"
  },
  { "id":"track-b",
    "title":"May, My Sweet Valentine",
    "audioUrl":"https://cdn.onecustomsong.com/b/audio.mp3"
    "imageUrl":"https://musicfile.kie.ai/cover.jpeg"
  }
]`;

    const result = getMockKieSunoMusicResult("mock-task-id");

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
          audioUrl: "https://cdn.onecustomsong.com/a/audio.mp3",
          imageUrl: "https://musicfile.kie.ai/cover.jpeg",
        },
        {
          id: "track-b",
          title: "May, My Sweet Valentine",
          audioUrl: "https://cdn.onecustomsong.com/b/audio.mp3",
          imageUrl: "https://musicfile.kie.ai/cover.jpeg",
        },
      ],
    );
  });

  test("fails closed when mock mode has no offline versions", () => {
    process.env.KIE_SUNO_MOCK_TASK_ID = "mock-task-id";

    const result = getMockKieSunoMusicResult("mock-task-id");

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
            {
              id: "a",
              audioId: "audio-a",
              title: "A",
              sourceAudioUrl: "https://cdn.kie.ai/a.mp3",
            },
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
    assert.equal(normalized.versions[0]?.audioId, "audio-a");
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

    assert.deepEqual(new Set(calls.map((call) => JSON.stringify(call))), new Set([
      JSON.stringify({
        key: "songs/generated/song-1/kie-task/track-a/audio.mp3",
        url: "https://cdn.kie.ai/a.mp3",
      }),
      JSON.stringify({
        key: "songs/generated/song-1/kie-task/track-a/cover.jpg",
        url: "https://cdn.kie.ai/a.jpg",
      }),
      JSON.stringify({
        key: "songs/generated/song-1/kie-task/track-b/audio.mp3",
        url: "https://cdn.kie.ai/b.mp3",
      }),
    ]));
    assert.equal(calls.length, 3);
    assert.deepEqual(calls.slice(0, 2), [
      {
        key: "songs/generated/song-1/kie-task/track-a/audio.mp3",
        url: "https://cdn.kie.ai/a.mp3",
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

  test("starts media uploads for generated versions concurrently", async () => {
    const started: string[] = [];
    const releaseUploads: Array<() => void> = [];

    const uploadPromise = persistKieSongVersionMediaToR2({
      externalId: "kie-task",
      songId: "song-1",
      versions: [
        {
          id: "track-a",
          title: "Track A",
          audioUrl: "https://cdn.kie.ai/a.mp3",
        },
        {
          id: "track-b",
          title: "Track B",
          audioUrl: "https://cdn.kie.ai/b.mp3",
        },
      ],
      uploadExternalUrlToR2: async (url, key) => {
        started.push(url);
        await new Promise<void>((resolve) => releaseUploads.push(resolve));
        return { key, url: `https://r2.example.com/${key}` };
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    assert.deepEqual(started, [
      "https://cdn.kie.ai/a.mp3",
      "https://cdn.kie.ai/b.mp3",
    ]);

    releaseUploads.splice(0).forEach((release) => release());
    const versions = await uploadPromise;

    assert.equal(versions.length, 2);
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
