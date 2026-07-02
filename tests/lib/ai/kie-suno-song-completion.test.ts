import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";

import {
  completeSongTaskFromKieResult,
} from "../../../lib/ai/kie-suno-song-completion";
import { songTaskStore } from "../../../lib/ai/song-task-store";

describe("KIE Suno song completion", () => {
  const originalFetch = globalThis.fetch;
  const originalRedis = (songTaskStore as any).getSong;
  const originalUpdateSong = (songTaskStore as any).updateSong;

  afterEach(() => {
    delete process.env.KIE_SUNO_MOCK_TASK_ID;
    delete process.env.KIE_SUNO_MOCK_VERSIONS_JSON;
    delete process.env.KIE_SUNO_MOCK_RESULT_JSON;
    globalThis.fetch = originalFetch;
    (songTaskStore as any).getSong = originalRedis;
    (songTaskStore as any).updateSong = originalUpdateSong;
  });

  test("does not fetch external media or timestamped lyrics for mock task results", async () => {
    process.env.KIE_SUNO_MOCK_TASK_ID = "mock-task";
    let fetchCalls = 0;
    globalThis.fetch = (async () => {
      fetchCalls += 1;
      throw new Error("Mock completion should not perform external fetches");
    }) as typeof fetch;

    const updated = await completeSongTaskFromKieResult({
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
        email: "user@example.com",
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

});
