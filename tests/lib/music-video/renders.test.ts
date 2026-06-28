import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  assertTimelineIsRenderable,
  createMusicVideoRender,
  listMusicVideosForSong,
  listMusicVideosForUser,
  markMusicVideoFailed,
  markMusicVideoRendering,
  markMusicVideoSucceeded,
} from "@/lib/music-video/renders";

const timeline = {
  templateId: "photo-slideshow" as const,
  songTitle: "Our Song",
  audioUrl: "https://cdn.example.com/song.mp3",
  duration: 30,
  lyrics: [{ id: "cue-1", start: 0, end: 30, text: "Hello" }],
  photos: [
    {
      id: "photo-1",
      name: "photo.jpg",
      objectUrl: "blob:photo",
      url: "https://r2.example.com/photo.jpg",
      r2Key: "music-videos/assets/photo.jpg",
    },
  ],
  assignments: [{ cueId: "cue-1", photoId: "photo-1" }],
  transitions: [],
};

const minimalVinylTimeline = {
  ...timeline,
  templateId: "minimal-vinyl" as const,
  photos: [],
  assignments: [],
  transitions: [],
};

const waveRadioTimeline = {
  ...timeline,
  templateId: "wave-radio" as const,
  photos: [],
  assignments: [],
  transitions: [],
  waveRadioBackgroundId: "aurora-119885",
};

describe("music video renders", () => {
  test("rejects timelines that only contain browser object URLs", () => {
    assert.throws(
      () =>
        assertTimelineIsRenderable({
          ...timeline,
          photos: [
            {
              id: "photo-1",
              name: "photo.jpg",
              objectUrl: "blob:photo",
            },
          ],
        }),
      /cloud URL/,
    );
  });

  test("allows rendering with only a cloud cover photo", () => {
    assert.doesNotThrow(() =>
      assertTimelineIsRenderable({
        ...timeline,
        photos: [],
        assignments: [],
        coverPhoto: {
          id: "song-artwork",
          name: "Song artwork",
          objectUrl: "https://cdn.example.com/cover.jpg",
          url: "https://cdn.example.com/cover.jpg",
          isCover: true,
        },
      }),
    );
  });

  test("rejects timelines without uploaded photos or a renderable cover", () => {
    assert.throws(
      () =>
        assertTimelineIsRenderable({
          ...timeline,
          photos: [],
          assignments: [],
          coverPhoto: undefined,
        }),
      /media asset or cover image/,
    );
  });

  test("allows minimal vinyl rendering without photos or a cover image", () => {
    assert.doesNotThrow(() => assertTimelineIsRenderable(minimalVinylTimeline));
  });

  test("rejects minimal vinyl timelines without renderable audio", () => {
    assert.throws(
      () =>
        assertTimelineIsRenderable({
          ...minimalVinylTimeline,
          audioUrl: "",
        }),
      /audio URL/,
    );
  });

  test("allows wave radio rendering without uploaded photos or a cover image", () => {
    assert.doesNotThrow(() => assertTimelineIsRenderable(waveRadioTimeline));
  });

  test("rejects wave radio timelines without renderable audio", () => {
    assert.throws(
      () =>
        assertTimelineIsRenderable({
          ...waveRadioTimeline,
          audioUrl: "",
        }),
      /audio URL/,
    );
  });

  test("creates a new music video render each time", async () => {
    const inserted: unknown[] = [];
    const fakeDb = {
      insert() {
        return {
          values(value: unknown) {
            inserted.push(value);
            return {
              returning() {
                return Promise.resolve([
                  { id: `mv-${inserted.length}`, ...(value as object) },
                ]);
              },
            };
          },
        };
      },
    };

    const first = await createMusicVideoRender({
      dbClient: fakeDb,
      song: { id: "song-1", userId: "user-1", title: "Our Song" },
      timeline,
    });
    const second = await createMusicVideoRender({
      dbClient: fakeDb,
      song: { id: "song-1", userId: "user-1", title: "Our Song" },
      timeline,
    });

    assert.equal(first.id, "mv-1");
    assert.equal(second.id, "mv-2");
    assert.equal(inserted.length, 2);
  });

  test("lists renders newest first for a song and for a user", async () => {
    const calls: string[] = [];
    const rows = [{ id: "mv-new" }, { id: "mv-old" }];
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
        return Promise.resolve(rows);
      },
    };

    assert.deepEqual(
      await listMusicVideosForSong({
        dbClient: fakeDb,
        songId: "song-1",
        userId: "user-1",
        limit: 2,
      }),
      rows,
    );
    assert.deepEqual(
      await listMusicVideosForUser({
        dbClient: fakeDb,
        userId: "user-1",
        limit: 2,
      }),
      rows,
    );
    assert.deepEqual(calls, [
      "select",
      "from",
      "where",
      "orderBy",
      "limit:2",
      "select",
      "from",
      "where",
      "orderBy",
      "limit:2",
    ]);
  });

  test("builds status updates for rendering, success, and failure", async () => {
    const updates: unknown[] = [];
    const fakeDb = {
      update() {
        return {
          set(value: unknown) {
            updates.push(value);
            return {
              where() {
                return {
                  returning() {
                    return Promise.resolve([{ id: "mv-1", ...(value as object) }]);
                  },
                };
              },
            };
          },
        };
      },
    };

    await markMusicVideoRendering({
      dbClient: fakeDb,
      videoId: "mv-1",
      renderId: "render-1",
      lambdaBucketName: "bucket",
      lambdaOutputKey: "renders/out.mp4",
    });
    await markMusicVideoSucceeded({
      dbClient: fakeDb,
      videoId: "mv-1",
      r2Key: "music-videos/out.mp4",
      videoUrl: "https://r2.example.com/out.mp4",
      thumbnailUrl: "https://r2.example.com/thumb.jpg",
    });
    await markMusicVideoFailed({
      dbClient: fakeDb,
      videoId: "mv-1",
      error: "boom",
    });

    assert.deepEqual(
      updates.map((update) => (update as { status: string }).status),
      ["rendering", "completed", "failed"],
    );
  });
});
