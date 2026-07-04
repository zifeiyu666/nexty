import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { handleKieSunoCallback } from "../../app/api/webhooks/kie/suno/route";
import type { MusicTaskResult } from "../../lib/ai/adapters/kie-suno";
import type { SongGenerationTask } from "../../lib/ai/song-task-store";

function createTask(
  overrides: Partial<SongGenerationTask> = {}
): SongGenerationTask {
  const now = Date.now();
  return {
    songId: "song-1",
    externalId: "kie-task",
    status: "processing",
    userId: "user-1",
    isSubscriber: true,
    title: "Webhook Song",
    lyrics: "[Verse]\nHello",
    genre: "Pop",
    occasion: "birthday",
    recipientNames: ["Maya"],
    story: "A birthday story",
    vocalGender: "Female",
    language: "English",
    versions: [],
    createdAt: now,
    updatedAt: now,
    expiresAt: now + 1000,
    ...overrides,
  };
}

function createSucceededBody() {
  return {
    code: 200,
    data: {
      taskId: "kie-task",
      callbackType: "complete",
      data: [
        {
          id: "track-a",
          title: "Webhook Song A",
          audio_url: "https://cdn.example.com/a.mp3",
          image_url: "https://cdn.example.com/a.jpg",
        },
      ],
    },
  };
}

describe("KIE Suno webhook route", () => {
  test("completes a processing song task from a succeeded callback", async () => {
    const task = createTask();
    let completed:
      | { result: MusicTaskResult; task: SongGenerationTask }
      | null = null;

    const response = await handleKieSunoCallback(createSucceededBody(), {
      getSongByExternalId: async () => task,
      completeTask: async ({ result, task }) => {
        completed = { result, task };
        return {
          ...task,
          status: "succeeded",
          versions: result.versions,
        };
      },
    });

    assert.deepEqual(response, { ok: true });
    assert.ok(completed);
    const completedTask = completed as {
      result: MusicTaskResult;
      task: SongGenerationTask;
    };
    assert.equal(completedTask.task.songId, "song-1");
    assert.equal(completedTask.result.status, "succeeded");
    assert.deepEqual(
      completedTask.result.versions.map((version) => version.id),
      ["track-a"]
    );
  });

  test("skips terminal tasks without completing them again", async () => {
    let completeCalls = 0;

    const response = await handleKieSunoCallback(createSucceededBody(), {
      getSongByExternalId: async () => createTask({ status: "succeeded" }),
      completeTask: async ({ task }) => {
        completeCalls += 1;
        return task;
      },
    });

    assert.deepEqual(response, { ok: true });
    assert.equal(completeCalls, 0);
  });

  test("keeps webhook response ok and records an error when completion fails", async () => {
    const updates: Array<Partial<SongGenerationTask>> = [];
    const response = await handleKieSunoCallback(createSucceededBody(), {
      getSongByExternalId: async () => createTask(),
      completeTask: async () => {
        throw new Error("R2 media copy failed");
      },
      updateSong: async (_songId, patch) => {
        updates.push(patch);
        return createTask(patch);
      },
    });

    assert.deepEqual(response, { ok: true });
    assert.equal(updates.length, 1);
    assert.equal(updates[0]?.status, "processing");
    assert.equal(updates[0]?.error, "R2 media copy failed");
  });
});
