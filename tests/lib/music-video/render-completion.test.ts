import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  completeMusicVideoRender,
  completeMusicVideoRenderWithTemporaryUrl,
  failMusicVideoRender,
  markMusicVideoTemporaryRenderOutput,
} from "@/lib/music-video/render-completion";

const video = {
  id: "mv-1",
  songId: "song-1",
  userId: "user-1",
};

describe("music video render completion", () => {
  test("uploads Remotion output to R2 and marks the video completed", async () => {
    const calls: unknown[] = [];
    const completed = await completeMusicVideoRender({
      fetchExternalUrlToR2: async (url, key) => {
        calls.push({ key, url });
        return {
          key,
          url: "https://r2.example.com/final.mp4",
        };
      },
      markSucceeded: async (input) => {
        calls.push(input);
        return { id: input.videoId, status: "completed", videoUrl: input.videoUrl };
      },
      markTemporaryReady: async (input) => {
        calls.push(input);
        return {
          id: input.videoId,
          status: "rendering",
          temporaryVideoUrl: input.temporaryVideoUrl,
        };
      },
      outputUrl: "https://remotion.example.com/out.mp4",
      video,
    });

    assert.deepEqual(calls, [
      {
        temporaryVideoUrl: "https://remotion.example.com/out.mp4",
        videoId: "mv-1",
      },
      {
        key: "music-videos/renders/user-1/song-1/mv-1.mp4",
        url: "https://remotion.example.com/out.mp4",
      },
      {
        r2Key: "music-videos/renders/user-1/song-1/mv-1.mp4",
        temporaryVideoUrl: null,
        videoId: "mv-1",
        videoUrl: "https://r2.example.com/final.mp4",
      },
    ]);
    assert.equal(completed?.status, "completed");
  });

  test("can complete with the temporary Remotion output without uploading to R2", async () => {
    const calls: unknown[] = [];
    const completed = await completeMusicVideoRenderWithTemporaryUrl({
      markSucceeded: async (input) => {
        calls.push(input);
        return {
          id: input.videoId,
          status: "completed",
          temporaryVideoUrl: input.temporaryVideoUrl,
          videoUrl: input.videoUrl,
        };
      },
      outputUrl: "https://remotion.example.com/out.mp4",
      video,
    });

    assert.deepEqual(calls, [
      {
        r2Key: null,
        temporaryVideoUrl: "https://remotion.example.com/out.mp4",
        videoId: "mv-1",
        videoUrl: null,
      },
    ]);
    assert.equal(completed?.status, "completed");
    assert.equal(completed?.temporaryVideoUrl, "https://remotion.example.com/out.mp4");
    assert.equal(completed?.videoUrl, null);
  });

  test("fails the video when Remotion success payload has no output URL", async () => {
    const failed = await completeMusicVideoRender({
      fetchExternalUrlToR2: async () => {
        throw new Error("should not upload");
      },
      markFailed: async (input) => ({ id: input.videoId, status: "failed", error: input.error }),
      outputUrl: undefined,
      video,
    });

    assert.equal(failed?.status, "failed");
    assert.match(failed?.error ?? "", /missing an output URL/);
  });

  test("stores the temporary Remotion output before the permanent copy exists", async () => {
    const temporary = await markMusicVideoTemporaryRenderOutput({
      markTemporaryReady: async (input) => ({
        id: input.videoId,
        status: "rendering",
        temporaryVideoUrl: input.temporaryVideoUrl,
      }),
      outputUrl: "https://remotion.example.com/out.mp4",
      video,
    });

    assert.deepEqual(temporary, {
      id: "mv-1",
      status: "rendering",
      temporaryVideoUrl: "https://remotion.example.com/out.mp4",
    });
  });

  test("keeps the temporary URL available when R2 persistence fails", async () => {
    const failed = await completeMusicVideoRender({
      fetchExternalUrlToR2: async () => {
        throw new Error("upload failed");
      },
      markTemporaryReady: async () => ({ id: video.id, status: "rendering" }),
      outputUrl: "https://remotion.example.com/out.mp4",
      video,
    });

    assert.equal(failed?.status, "rendering");
    assert.equal(failed?.temporaryVideoUrl, "https://remotion.example.com/out.mp4");
  });

  test("uses shared failure helper for render failures", async () => {
    const failed = await failMusicVideoRender({
      error: "render exploded",
      markFailed: async (input) => ({ id: input.videoId, status: "failed", error: input.error }),
      videoId: "mv-1",
    });

    assert.deepEqual(failed, {
      error: "render exploded",
      id: "mv-1",
      status: "failed",
    });
  });
});
