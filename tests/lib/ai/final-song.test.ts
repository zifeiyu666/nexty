import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  buildSongShareUrl,
  createSongShareToken,
  decodeSongShortShareCode,
  encodeSongShortShareCode,
  findSampleVersion,
  finalizeSongFromSample,
  getFinalSongsForOwner,
  getFinalSongsForSampleOwner,
  getVersionTimestampedLyrics,
  normalizeSongDuration,
} from "../../../lib/ai/final-song";
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
      {
        id: "provider-b",
        title: "Version B",
        audioUrl: "https://cdn.example.com/b.mp3",
      },
    ],
    previewLimitSeconds: 60,
    createdAt: new Date("2026-06-10T00:00:00Z").getTime(),
    updatedAt: new Date("2026-06-10T00:00:00Z").getTime(),
    accessExpiresAt: new Date("2026-06-13T00:00:00Z").getTime(),
    isExpired: false,
    ...overrides,
  };
}

function createFinalSong(overrides: Record<string, unknown> = {}) {
  return {
    id: "song-1",
    userId: "user-1",
    sourceSampleId: "sample-1",
    selectedVersionId: "provider-a",
    title: "Version A",
    lyrics: "[Verse 1]\nHello",
    genre: "Pop",
    occasion: "birthday",
    language: "English",
    vocalGender: "Female",
    recipientNamesJsonb: ["Maya"],
    story: "A story",
    audioUrl: "https://cdn.example.com/a.mp3",
    imageUrl: null,
    duration: null,
    status: "ready",
    shareToken: "song_token",
    shareEnabled: true,
    sharedAt: new Date("2026-06-10T00:00:00Z"),
    wallArtJsonb: {},
    mvJsonb: {},
    metadataJsonb: {},
    createdAt: new Date("2026-06-10T00:00:00Z"),
    updatedAt: new Date("2026-06-10T00:00:00Z"),
    ...overrides,
  };
}

function createFinalizeFakeDb({
  existingSong = null,
  usageBalanceJsonb = {
    entitlements: {
      subscription: { song: 1, mv: 0, wallArt: 0 },
      oneTime: { song: 0, mv: 0, wallArt: 0 },
    },
  },
}: {
  existingSong?: Record<string, unknown> | null;
  usageBalanceJsonb?: Record<string, unknown> | null;
} = {}) {
  const calls: string[] = [];
  let selectCount = 0;
  const state = {
    insertedSong: null as Record<string, unknown> | null,
    updatedUsage: null as Record<string, unknown> | null,
    creditLog: null as Record<string, unknown> | null,
  };

  function createSelectBuilder() {
    const resultIndex = selectCount;
    selectCount += 1;

    return {
      from() {
        calls.push(`select:${resultIndex}:from`);
        return this;
      },
      where() {
        calls.push(`select:${resultIndex}:where`);
        return this;
      },
      for(value: string) {
        calls.push(`select:${resultIndex}:for:${value}`);
        return Promise.resolve(
          usageBalanceJsonb ? [{ balanceJsonb: usageBalanceJsonb }] : [],
        );
      },
      limit(value: number) {
        calls.push(`select:${resultIndex}:limit:${value}`);
        return Promise.resolve(existingSong ? [existingSong] : []);
      },
    };
  }

  const tx = {
    select() {
      calls.push("select");
      return createSelectBuilder();
    },
    update() {
      calls.push("update");
      return {
        set(value: Record<string, unknown>) {
          state.updatedUsage = value;
          calls.push("update:set");
          return this;
        },
        where() {
          calls.push("update:where");
          return Promise.resolve();
        },
      };
    },
    insert() {
      calls.push("insert");
      return {
        values(value: Record<string, unknown>) {
          if ("shareToken" in value) {
            state.insertedSong = createFinalSong(value);
          } else {
            state.creditLog = value;
          }
          calls.push("insert:values");
          return this;
        },
        returning() {
          calls.push("insert:returning");
          return Promise.resolve([state.insertedSong]);
        },
        then(resolve: () => void) {
          resolve();
        },
      };
    },
  };

  return {
    calls,
    state,
    dbClient: {
      async transaction<T>(callback: (txClient: typeof tx) => Promise<T>) {
        return callback(tx);
      },
    },
  };
}

describe("final song helpers", () => {
  const versions = [
    {
      id: "provider-a",
      title: "Version A",
      audioUrl: "https://cdn.example.com/a.mp3",
    },
    {
      id: "provider-b",
      title: "Version B",
      audioUrl: "https://cdn.example.com/b.mp3",
    },
  ];

  test("finds a sample version by provider id", () => {
    assert.equal(
      findSampleVersion(versions, "provider-b")?.audioUrl,
      versions[1].audioUrl,
    );
  });

  test("finds a sample version by A/B alias", () => {
    assert.equal(findSampleVersion(versions, "A")?.id, "provider-a");
    assert.equal(findSampleVersion(versions, "B")?.id, "provider-b");
  });

  test("creates non-guessable share tokens", () => {
    const first = createSongShareToken();
    const second = createSongShareToken();

    assert.match(first, /^song_[A-Za-z0-9_-]{32,}$/);
    assert.notEqual(first, second);
  });

  test("builds short share links from song UUIDs", () => {
    const songId = "123e4567-e89b-42d3-a456-426614174000";
    const shortCode = encodeSongShortShareCode(songId);

    assert.equal(shortCode, "Ej5FZ-ibQtOkVkJmFBdAAA");
    assert.equal(decodeSongShortShareCode(shortCode), songId);
    assert.equal(decodeSongShortShareCode("not-a-code"), null);
    assert.equal(
      buildSongShareUrl({ id: songId, shareToken: "song_long_token" }),
      "http://localhost:3000/s/Ej5FZ-ibQtOkVkJmFBdAAA",
    );
  });

  test("normalizes provider duration values for integer storage", () => {
    assert.equal(normalizeSongDuration("133.36"), 133);
    assert.equal(normalizeSongDuration(60.9), 60);
    assert.equal(normalizeSongDuration("bad"), null);
  });

  test("extracts timestamped lyrics from a selected provider version", () => {
    assert.deepEqual(
      getVersionTimestampedLyrics({
        id: "provider-a",
        title: "Version A",
        audioUrl: "https://cdn.example.com/a.mp3",
        timestampedLyrics: {
          alignedWords: [{ word: "Hello", startS: 1, endS: 1.4 }],
        },
      }),
      {
        alignedWords: [{ word: "Hello", startS: 1, endS: 1.4 }],
      },
    );
    assert.equal(getVersionTimestampedLyrics(versions[0]), null);
  });

  test("lists only ready final songs for an owner newest first", async () => {
    const selectedRows = [
      {
        id: "song-new",
        userId: "user-1",
        title: "Newest Song",
        status: "ready",
        createdAt: new Date("2026-06-12T00:00:00Z"),
      },
      {
        id: "song-old",
        userId: "user-1",
        title: "Older Song",
        status: "ready",
        createdAt: new Date("2026-06-10T00:00:00Z"),
      },
    ];
    const calls: string[] = [];
    const fakeDb = {
      select() {
        calls.push("select");
        return this;
      },
      from() {
        calls.push("from");
        return this;
      },
      where() {
        calls.push("where");
        return this;
      },
      orderBy() {
        calls.push("orderBy");
        return this;
      },
      limit(value: number) {
        calls.push(`limit:${value}`);
        return Promise.resolve(selectedRows);
      },
    };

    const songs = await getFinalSongsForOwner("user-1", {
      dbClient: fakeDb,
      limit: 2,
    });

    assert.deepEqual(
      songs.map((song) => song.id),
      ["song-new", "song-old"],
    );
    assert.deepEqual(calls, ["select", "from", "where", "orderBy", "limit:2"]);
  });

  test("lists finalized songs for one sample owner", async () => {
    const selectedRows = [
      createFinalSong({ id: "song-a", selectedVersionId: "provider-a" }),
      createFinalSong({ id: "song-b", selectedVersionId: "provider-b" }),
    ];
    const calls: string[] = [];
    const fakeDb = {
      select() {
        calls.push("select");
        return this;
      },
      from() {
        calls.push("from");
        return this;
      },
      where() {
        calls.push("where");
        return Promise.resolve(selectedRows);
      },
    };

    const songs = await getFinalSongsForSampleOwner("user-1", "sample-1", {
      dbClient: fakeDb,
    });

    assert.deepEqual(
      songs.map((song) => song.id),
      ["song-a", "song-b"],
    );
    assert.deepEqual(calls, ["select", "from", "where"]);
  });

  test("deducts song entitlement and creates a song even for expired samples", async () => {
    const fakeDb = createFinalizeFakeDb();

    const result = await finalizeSongFromSample({
      dbClient: fakeDb.dbClient,
      sample: createSample({ isExpired: true }),
      userId: "user-1",
      versionId: "provider-a",
    });

    assert.equal(result.success, true);
    assert.equal(result.success && result.alreadyFinalized, false);
    assert.equal(fakeDb.state.insertedSong?.sourceSampleId, "sample-1");
    assert.equal(fakeDb.state.insertedSong?.selectedVersionId, "provider-a");
    assert.deepEqual(
      (fakeDb.state.updatedUsage?.balanceJsonb as any).entitlements,
      {
        subscription: { song: 0, mv: 0, wallArt: 0 },
        oneTime: { song: 0, mv: 0, wallArt: 0 },
      },
    );
    assert.deepEqual(fakeDb.state.creditLog?.entitlementDeltaJsonb, {
      subscription: { song: -1, mv: 0, wallArt: 0 },
      oneTime: { song: 0, mv: 0, wallArt: 0 },
    });
  });

  test("uses a generated cover image override when finalizing a sample", async () => {
    const fakeDb = createFinalizeFakeDb();

    const result = await finalizeSongFromSample({
      coverImageUrl: "https://r2.example.com/song-covers/generated.webp",
      dbClient: fakeDb.dbClient,
      sample: createSample({
        versions: [
          {
            id: "provider-a",
            title: "Version A",
            audioUrl: "https://cdn.example.com/a.mp3",
            imageUrl: "https://cdn.example.com/original.webp",
          },
        ],
      }),
      userId: "user-1",
      versionId: "provider-a",
    });

    assert.equal(result.success, true);
    assert.equal(
      fakeDb.state.insertedSong?.imageUrl,
      "https://r2.example.com/song-covers/generated.webp",
    );
  });

  test("stores the personal gift note in song metadata", async () => {
    const fakeDb = createFinalizeFakeDb();

    const result = await finalizeSongFromSample({
      dbClient: fakeDb.dbClient,
      personalNote: "You make every ordinary day feel like home.",
      sample: createSample(),
      userId: "user-1",
      versionId: "provider-a",
    });

    assert.equal(result.success, true);
    assert.equal(
      (fakeDb.state.insertedSong?.metadataJsonb as Record<string, unknown>)
        .personalNote,
      "You make every ordinary day feel like home.",
    );
  });

  test("uses the private full version instead of the public preview when finalizing", async () => {
    const fakeDb = createFinalizeFakeDb();
    const sample = {
      ...createSample({
        versions: [
          {
            id: "provider-a",
            title: "Version A",
            audioUrl: "https://cdn.example.com/a-preview.mp3",
            duration: 60,
          },
        ],
      }),
      fullVersions: [
        {
          id: "provider-a",
          title: "Version A",
          audioUrl: "https://cdn.example.com/a-full.mp3",
          duration: 143,
        },
      ],
    } as SongSampleView;

    const result = await finalizeSongFromSample({
      dbClient: fakeDb.dbClient,
      sample,
      userId: "user-1",
      versionId: "provider-a",
    });

    assert.equal(result.success, true);
    assert.equal(
      fakeDb.state.insertedSong?.audioUrl,
      "https://cdn.example.com/a-full.mp3",
    );
    assert.equal(fakeDb.state.insertedSong?.duration, 143);
  });

  test("does not skip deduction for historical unlockedVersionIds data", async () => {
    const fakeDb = createFinalizeFakeDb({
      usageBalanceJsonb: {
        entitlements: {
          subscription: { song: 0, mv: 0, wallArt: 0 },
          oneTime: { song: 1, mv: 0, wallArt: 0 },
        },
      },
    });

    const result = await finalizeSongFromSample({
      dbClient: fakeDb.dbClient,
      sample: {
        ...createSample(),
        unlockedVersionIds: ["provider-a"],
      } as SongSampleView,
      userId: "user-1",
      versionId: "provider-a",
    });

    assert.equal(result.success, true);
    assert.equal(fakeDb.state.insertedSong?.selectedVersionId, "provider-a");
    assert.deepEqual(
      (fakeDb.state.updatedUsage?.balanceJsonb as any).entitlements,
      {
        subscription: { song: 0, mv: 0, wallArt: 0 },
        oneTime: { song: 0, mv: 0, wallArt: 0 },
      },
    );
    assert.deepEqual(fakeDb.state.creditLog?.entitlementDeltaJsonb, {
      subscription: { song: 0, mv: 0, wallArt: 0 },
      oneTime: { song: -1, mv: 0, wallArt: 0 },
    });
  });

  test("returns an existing finalized song without deducting again", async () => {
    const existingSong = createFinalSong({ id: "existing-song" });
    const fakeDb = createFinalizeFakeDb({ existingSong });

    const result = await finalizeSongFromSample({
      dbClient: fakeDb.dbClient,
      sample: createSample(),
      userId: "user-1",
      versionId: "provider-a",
    });

    assert.equal(result.success, true);
    assert.equal(result.success && result.alreadyFinalized, true);
    assert.equal(result.success && result.song.id, "existing-song");
    assert.equal(fakeDb.state.updatedUsage, null);
    assert.equal(fakeDb.state.insertedSong, null);
    assert.equal(fakeDb.state.creditLog, null);
  });

  test("returns insufficient balance without inserting a song", async () => {
    const fakeDb = createFinalizeFakeDb({
      usageBalanceJsonb: {
        entitlements: {
          subscription: { song: 0, mv: 0, wallArt: 0 },
          oneTime: { song: 0, mv: 0, wallArt: 0 },
        },
      },
    });

    const result = await finalizeSongFromSample({
      dbClient: fakeDb.dbClient,
      sample: createSample(),
      userId: "user-1",
      versionId: "provider-a",
    });

    assert.deepEqual(result, {
      success: false,
      status: 400,
      error: "Insufficient song balance.",
    });
    assert.equal(fakeDb.state.updatedUsage, null);
    assert.equal(fakeDb.state.insertedSong, null);
    assert.equal(fakeDb.state.creditLog, null);
  });
});
