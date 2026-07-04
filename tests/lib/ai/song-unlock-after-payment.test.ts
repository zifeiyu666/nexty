import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  buildPendingUnlockSongResult,
  buildUnlockSongCheckoutParams,
  buildUnlockSongMetadata,
  finalizeSongUnlockAfterPayment,
  mergeUnlockSongMetadata,
  parseUnlockSongContext,
  parseUnlockSongMetadata,
  serializeUnlockSongForPayPal,
  type UnlockSongResult,
} from "../../../lib/ai/song-unlock-after-payment";
import type { SongSampleView } from "../../../lib/ai/song-sample-store";

function createSample(overrides: Partial<SongSampleView> = {}): SongSampleView {
  return {
    songId: "sample-1",
    externalId: "kie-1",
    userId: "user-1",
    title: "Birthday Melody",
    lyrics: "[Verse 1]\nHello",
    genre: "Pop",
    occasion: "birthday",
    language: "English",
    vocalGender: "Female",
    recipientNames: ["Maya"],
    story: "A story",
    versions: [
      {
        id: "provider-a",
        title: "Version A",
        audioUrl: "https://cdn.example.com/a.mp3",
      },
    ],
    previewLimitSeconds: 60,
    createdAt: new Date("2026-06-10T00:00:00Z").getTime(),
    updatedAt: new Date("2026-06-10T00:00:00Z").getTime(),
    accessExpiresAt: null,
    isExpired: false,
    ...overrides,
  };
}

describe("song unlock payment helpers", () => {
  test("parses only complete unlock song contexts", () => {
    assert.deepEqual(
      parseUnlockSongContext({
        type: "unlock_song",
        songId: "sample-1",
        versionId: "provider-a",
        returnTo: "/samples/sample-1",
      }),
      {
        type: "unlock_song",
        songId: "sample-1",
        versionId: "provider-a",
        returnTo: "/samples/sample-1",
      }
    );

    assert.equal(
      parseUnlockSongContext({
        type: "unlock_song",
        songId: "sample-1",
      }),
      null
    );
  });

  test("round-trips unlock song context through metadata and checkout params", () => {
    const context = parseUnlockSongContext({
      type: "unlock_song",
      songId: "sample-1",
      versionId: "provider-a",
      returnTo: "/samples/sample-1",
    });
    assert.ok(context);

    assert.deepEqual(buildUnlockSongMetadata(context), {
      unlockType: "unlock_song",
      unlockSongId: "sample-1",
      unlockVersionId: "provider-a",
      unlockReturnTo: "/samples/sample-1",
    });
    assert.deepEqual(parseUnlockSongMetadata(buildUnlockSongMetadata(context)), context);

    assert.equal(
      buildUnlockSongCheckoutParams(context).toString(),
      "type=unlock_song&songId=sample-1&versionId=provider-a&returnTo=%2Fsamples%2Fsample-1"
    );
  });

  test("serializes PayPal unlock context compactly", () => {
    const context = parseUnlockSongContext({
      type: "unlock_song",
      songId: "550e8400-e29b-41d4-a716-446655440000",
      versionId: "provider-a",
      returnTo: "/samples/sample-1",
    });
    assert.ok(context);

    const paypalUnlock = serializeUnlockSongForPayPal(context);
    assert.ok(paypalUnlock);
    assert.ok(paypalUnlock.length <= 52);
    assert.deepEqual(parseUnlockSongMetadata({ paypalUnlock }), {
      type: "unlock_song",
      songId: "550e8400-e29b-41d4-a716-446655440000",
      versionId: "provider-a",
    });
  });

  test("can represent pending unlock work for successful payments awaiting credit grant", () => {
    assert.deepEqual(
      buildPendingUnlockSongResult({
        type: "unlock_song",
        songId: "sample-1",
        versionId: "provider-a",
        returnTo: "/samples/sample-1",
      }),
      {
        status: "pending",
        sampleSongId: "sample-1",
        versionId: "provider-a",
        returnTo: "/samples/sample-1",
      }
    );
  });

  test("merges completed unlock result without dropping existing metadata", () => {
    const result: UnlockSongResult = {
      status: "completed",
      sampleSongId: "sample-1",
      versionId: "provider-a",
      songId: "song-1",
      songUrl: "/songs/song-1",
      alreadyFinalized: false,
    };

    assert.deepEqual(
      mergeUnlockSongMetadata(
        {
          planName: "Single Song",
        },
        result
      ),
      {
        planName: "Single Song",
        unlockSong: result,
      }
    );
  });

  test("finalizes the selected version after payment using the existing finalize path", async () => {
    const calls: Array<Record<string, unknown>> = [];
    const result = await finalizeSongUnlockAfterPayment({
      userId: "user-1",
      context: {
        type: "unlock_song",
        songId: "sample-1",
        versionId: "provider-a",
        returnTo: "/samples/sample-1",
      },
      sampleStore: {
        async get(songId, options) {
          calls.push({ kind: "get", songId, options });
          return createSample();
        },
      },
      async finalizeSong({ sample, userId, versionId }) {
        calls.push({ kind: "finalize", sampleId: sample.songId, userId, versionId });
        return {
          success: true,
          alreadyFinalized: false,
          song: {
            id: "song-1",
          } as any,
        };
      },
    });

    assert.deepEqual(result, {
      status: "completed",
      sampleSongId: "sample-1",
      versionId: "provider-a",
      returnTo: "/samples/sample-1",
      songId: "song-1",
      songUrl: "/songs/song-1",
      alreadyFinalized: false,
    });
    assert.deepEqual(calls, [
      {
        kind: "get",
        songId: "sample-1",
        options: { hasActiveSubscription: true },
      },
      {
        kind: "finalize",
        sampleId: "sample-1",
        userId: "user-1",
        versionId: "provider-a",
      },
    ]);
  });

  test("preserves finalize idempotency result when the version is already saved", async () => {
    const result = await finalizeSongUnlockAfterPayment({
      userId: "user-1",
      context: {
        type: "unlock_song",
        songId: "sample-1",
        versionId: "provider-a",
      },
      sampleStore: {
        async get() {
          return createSample();
        },
      },
      async finalizeSong() {
        return {
          success: true,
          alreadyFinalized: true,
          song: {
            id: "existing-song",
          } as any,
        };
      },
    });

    assert.equal(result?.status, "completed");
    assert.equal(result?.status === "completed" && result.alreadyFinalized, true);
    assert.equal(result?.status === "completed" && result.songId, "existing-song");
  });
});
