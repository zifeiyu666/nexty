import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";

import {
  completeSongTaskFromKieResult,
  refreshSongPreviewComposition,
  refreshSpokenIntroComposition,
} from "../../../lib/ai/kie-suno-song-completion";
import { songSampleStore } from "../../../lib/ai/song-sample-store";
import { songTaskStore } from "../../../lib/ai/song-task-store";

describe("KIE Suno song completion", () => {
  const originalFetch = globalThis.fetch;
  const originalRedis = (songTaskStore as any).getSong;
  const originalUpdateSong = (songTaskStore as any).updateSong;
  const originalClaimReadyEmail = (songTaskStore as any)
    .claimSongSampleReadyEmail;
  const originalSaveSample = (songSampleStore as any).save;

  afterEach(() => {
    delete process.env.KIE_SUNO_MOCK_TASK_ID;
    delete process.env.KIE_SUNO_MOCK_VERSIONS_JSON;
    delete process.env.KIE_SUNO_MOCK_RESULT_JSON;
    globalThis.fetch = originalFetch;
    (songTaskStore as any).getSong = originalRedis;
    (songTaskStore as any).updateSong = originalUpdateSong;
    (songTaskStore as any).claimSongSampleReadyEmail = originalClaimReadyEmail;
    (songSampleStore as any).save = originalSaveSample;
  });

  test("does not fetch external media or timestamped lyrics for mock task results", async () => {
    process.env.KIE_SUNO_MOCK_TASK_ID = "mock-task";
    let fetchCalls = 0;
    globalThis.fetch = (async () => {
      fetchCalls += 1;
      throw new Error("Mock completion should not perform external fetches");
    }) as typeof fetch;

    const updated = await completeSongTaskFromKieResult({
      dependencies: {
        startSongPreviewRender: async () => ({
          bucketName: "remotion-bucket",
          outKey: "songs/generated/song-1/mock-a/preview.mp3",
          renderId: "preview-render-1",
        }),
      },
      result: {
        status: "succeeded",
        versions: [
          {
            id: "mock-a",
            title: "Mock A",
            audioUrl: "https://cdn.example.com/mock-a.mp3",
            imageUrl: "https://cdn.example.com/mock-a.jpg",
          },
        ],
      },
      task: {
        songId: "song-1",
        externalId: "mock-task",
        status: "processing",
        userId: "user-1",
        isSubscriber: true,
        title: "Mock Song",
        lyrics: "[Verse]\nHello",
        genre: "Pop",
        occasion: "birthday",
        recipientNames: ["Maya"],
        story: "A birthday story",
        vocalGender: "Female",
        language: "English",
        versions: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        expiresAt: Date.now() + 1000,
      },
    });

    assert.equal(updated, null);
    assert.equal(fetchCalls, 0);
  });

  test("starts Remotion MP3 renders and keeps spoken-intro tasks processing", async () => {
    process.env.KIE_SUNO_MOCK_TASK_ID = "mock-task";
    const updates: any[] = [];
    (songTaskStore as any).updateSong = async (
      _songId: string,
      update: any,
    ) => {
      updates.push(update);
      return { ...spokenIntroTask, ...update };
    };

    const updated = await completeSongTaskFromKieResult({
      result: {
        status: "succeeded",
        versions: [mockVersion],
      },
      task: spokenIntroTask,
      dependencies: {
        startSpokenIntroRender: async () => ({
          bucketName: "remotion-bucket",
          outKey: "songs/generated/song-1/mock-a/with-intro.mp3",
          renderId: "render-1",
        }),
      },
    });

    assert.equal(updated?.status, "processing");
    assert.deepEqual(updated?.spokenIntroRenders, [
      {
        bucketName: "remotion-bucket",
        outKey: "songs/generated/song-1/mock-a/with-intro.mp3",
        renderId: "render-1",
        versionId: "mock-a",
      },
    ]);
    assert.equal(updates.at(-1)?.status, "processing");
  });

  test("renders a real one-minute preview before exposing non-subscriber versions", async () => {
    process.env.KIE_SUNO_MOCK_TASK_ID = "mock-task";
    const task = { ...spokenIntroTask, spokenIntro: undefined };
    (songTaskStore as any).updateSong = async (
      _songId: string,
      update: any,
    ) => ({
      ...task,
      ...update,
    });

    const updated = await completeSongTaskFromKieResult({
      result: { status: "succeeded", versions: [mockVersion] },
      task,
      dependencies: {
        startSongPreviewRender: async () => ({
          bucketName: "remotion-bucket",
          outKey: "songs/generated/song-1/mock-a/preview.mp3",
          renderId: "preview-render-1",
        }),
      },
    });

    assert.equal(updated?.status, "processing");
    assert.deepEqual(updated?.versions, []);
    assert.equal(updated?.fullVersions?.[0]?.audioUrl, mockVersion.audioUrl);
    assert.deepEqual(updated?.songPreviewRenders, [
      {
        bucketName: "remotion-bucket",
        outKey: "songs/generated/song-1/mock-a/preview.mp3",
        renderId: "preview-render-1",
        versionId: "mock-a",
      },
    ]);
  });

  test("publishes only preview URLs while retaining full versions privately", async () => {
    const task = {
      ...spokenIntroTask,
      isSubscriber: false,
      spokenIntro: undefined,
      versions: [],
      fullVersions: [mockVersion],
      songPreviewRenders: [
        {
          bucketName: "remotion-bucket",
          outKey: "songs/generated/song-1/mock-a/preview.mp3",
          renderId: "preview-render-1",
          versionId: "mock-a",
        },
      ],
    };
    (songTaskStore as any).updateSong = async (
      _songId: string,
      update: any,
    ) => ({
      ...task,
      ...update,
    });
    (songTaskStore as any).claimSongSampleReadyEmail = async () => false;
    (songSampleStore as any).save = async () => undefined;

    const updated = await refreshSongPreviewComposition({
      task,
      dependencies: {
        getSongPreviewRenderProgress: async () => ({
          done: true,
          errorMessage: null,
          outputFile: "https://remotion.example.com/preview.mp3",
          progress: 1,
        }),
      },
    });

    assert.equal(updated?.status, "succeeded");
    assert.equal(
      updated?.versions[0]?.audioUrl,
      "https://remotion.example.com/preview.mp3",
    );
    assert.equal(updated?.versions[0]?.duration, 60);
    assert.equal(updated?.fullVersions?.[0]?.audioUrl, mockVersion.audioUrl);
  });

  test("starts preview rendering after every spoken-intro render completes", async () => {
    const task = {
      ...spokenIntroTask,
      versions: [mockVersion],
      spokenIntroRenders: [
        {
          bucketName: "remotion-bucket",
          outKey: "songs/generated/song-1/mock-a/with-intro.mp3",
          renderId: "render-1",
          versionId: "mock-a",
        },
      ],
    };
    (songTaskStore as any).updateSong = async (
      _songId: string,
      update: any,
    ) => ({
      ...task,
      ...update,
    });
    (songTaskStore as any).claimSongSampleReadyEmail = async () => false;
    (songSampleStore as any).save = async () => undefined;

    const updated = await refreshSpokenIntroComposition({
      task,
      dependencies: {
        getSpokenIntroRenderProgress: async () => ({
          done: true,
          errorMessage: null,
          outputFile: "https://remotion.example.com/with-intro.mp3",
          progress: 1,
        }),
        startSongPreviewRender: async () => ({
          bucketName: "remotion-bucket",
          outKey: "songs/generated/song-1/mock-a/preview.mp3",
          renderId: "preview-render-1",
        }),
      },
    });

    assert.equal(updated?.status, "processing");
    assert.deepEqual(updated?.versions, []);
    assert.equal(
      updated?.fullVersions?.[0]?.audioUrl,
      "https://remotion.example.com/with-intro.mp3",
    );
    assert.equal(
      updated?.fullVersions?.[0]?.spokenIntro?.songStartOffsetSeconds,
      3.4,
    );
    assert.equal(updated?.fullVersions?.[0]?.duration, 123.4);
    assert.equal(
      updated?.songPreviewRenders?.[0]?.renderId,
      "preview-render-1",
    );
  });

  test("does not submit duplicate renders when a KIE callback is repeated", async () => {
    process.env.KIE_SUNO_MOCK_TASK_ID = "mock-task";
    let starts = 0;
    const task = {
      ...spokenIntroTask,
      versions: [mockVersion],
      spokenIntroRenders: [
        {
          bucketName: "remotion-bucket",
          outKey: "songs/generated/song-1/mock-a/with-intro.mp3",
          renderId: "render-1",
          versionId: "mock-a",
        },
      ],
    };

    const updated = await completeSongTaskFromKieResult({
      result: { status: "succeeded", versions: [mockVersion] },
      task,
      dependencies: {
        getSpokenIntroRenderProgress: async () => ({
          done: false,
          errorMessage: null,
          outputFile: null,
          progress: 0.4,
        }),
        startSpokenIntroRender: async () => {
          starts += 1;
          throw new Error("Render must not be submitted twice");
        },
      },
    });

    assert.equal(starts, 0);
    assert.equal(updated, task);
  });

  test("marks the song failed when a Remotion audio render fails", async () => {
    const task = {
      ...spokenIntroTask,
      versions: [mockVersion],
      spokenIntroRenders: [
        {
          bucketName: "remotion-bucket",
          outKey: "songs/generated/song-1/mock-a/with-intro.mp3",
          renderId: "render-1",
          versionId: "mock-a",
        },
      ],
    };
    (songTaskStore as any).updateSong = async (
      _songId: string,
      update: any,
    ) => ({
      ...task,
      ...update,
    });

    const updated = await refreshSpokenIntroComposition({
      task,
      dependencies: {
        getSpokenIntroRenderProgress: async () => ({
          done: true,
          errorMessage: "Lambda ran out of memory.",
          outputFile: null,
          progress: 0.8,
        }),
      },
    });

    assert.equal(updated?.status, "failed");
    assert.equal(updated?.error, "Lambda ran out of memory.");
  });
});

const mockVersion = {
  id: "mock-a",
  title: "Mock A",
  audioUrl: "https://cdn.example.com/mock-a.mp3",
  imageUrl: "https://cdn.example.com/mock-a.jpg",
  duration: 120,
};

const spokenIntroTask = {
  songId: "song-1",
  externalId: "mock-task",
  status: "processing" as const,
  userId: "user-1",
  isSubscriber: true,
  title: "Mock Song",
  lyrics: "[Verse]\nHello",
  genre: "Pop",
  occasion: "birthday",
  recipientNames: ["Maya"],
  story: "A birthday story",
  vocalGender: "Female",
  language: "English",
  spokenIntro: {
    alignedWords: [{ word: "Hello", startS: 0, endS: 3 }],
    audioKey: "songs/spoken-intros/user-1/intro.webm",
    audioUrl: "https://cdn.example.com/intro.webm",
    durationSeconds: 3,
    transcript: "Hello",
  },
  versions: [],
  createdAt: 1,
  updatedAt: 1,
  expiresAt: Date.now() + 1000,
};
