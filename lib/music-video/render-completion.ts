import { fetchExternalUrlToR2 as defaultFetchExternalUrlToR2 } from "@/lib/cloudflare/r2-fetch-upload";
import { getLogger } from "@/lib/logger";
import {
  markMusicVideoFailed,
  markMusicVideoTemporaryOutputReady,
  markMusicVideoSucceeded,
  type MusicVideoRender,
} from "@/lib/music-video/renders";

const logger = getLogger("music-video-render");

type RenderVideoRef = Pick<MusicVideoRender, "id" | "songId" | "userId">;

type UploadToR2 = (
  outputUrl: string,
  key: string,
) => Promise<{ key: string; url: string }>;

type MarkSucceeded = typeof markMusicVideoSucceeded;
type MarkFailed = typeof markMusicVideoFailed;
type MarkTemporaryReady = typeof markMusicVideoTemporaryOutputReady;

export function getMusicVideoRenderR2Key(video: RenderVideoRef) {
  return `music-videos/renders/${video.userId}/${video.songId}/${video.id}.mp4`;
}

export async function failMusicVideoRender({
  error,
  markFailed = markMusicVideoFailed,
  temporaryVideoUrl,
  videoId,
}: {
  error: string;
  markFailed?: MarkFailed;
  temporaryVideoUrl?: string | null;
  videoId: string;
}) {
  logger.warn({ error, temporaryVideoUrl, videoId }, "Music video render failed");

  if (temporaryVideoUrl) {
    return {
      error,
      id: videoId,
      status: "rendering" as const,
      temporaryVideoUrl,
      videoUrl: null,
    };
  }

  return markFailed({
    error,
    videoId,
  });
}

export async function markMusicVideoTemporaryRenderOutput({
  markTemporaryReady = markMusicVideoTemporaryOutputReady,
  outputUrl,
  video,
}: {
  markTemporaryReady?: MarkTemporaryReady;
  outputUrl?: string | null;
  video: RenderVideoRef;
}) {
  if (!outputUrl) {
    throw new Error("Remotion render completed but is missing an output URL.");
  }

  return markTemporaryReady({
    temporaryVideoUrl: outputUrl,
    videoId: video.id,
  });
}

export async function completeMusicVideoRenderWithTemporaryUrl({
  markSucceeded = markMusicVideoSucceeded,
  outputUrl,
  video,
}: {
  markSucceeded?: MarkSucceeded;
  outputUrl?: string | null;
  video: RenderVideoRef;
}) {
  if (!outputUrl) {
    throw new Error("Remotion render completed but is missing an output URL.");
  }

  const completed = await markSucceeded({
    r2Key: null,
    temporaryVideoUrl: outputUrl,
    videoId: video.id,
    videoUrl: null,
  });

  logger.info(
    { videoId: video.id },
    "Music video render completed with temporary output URL",
  );

  return completed;
}

export async function completeMusicVideoRender({
  fetchExternalUrlToR2 = defaultFetchExternalUrlToR2,
  markFailed = markMusicVideoFailed,
  markSucceeded = markMusicVideoSucceeded,
  markTemporaryReady = markMusicVideoTemporaryOutputReady,
  outputUrl,
  video,
}: {
  fetchExternalUrlToR2?: UploadToR2;
  markFailed?: MarkFailed;
  markSucceeded?: MarkSucceeded;
  markTemporaryReady?: MarkTemporaryReady;
  outputUrl?: string | null;
  video: RenderVideoRef;
}) {
  if (!outputUrl) {
    return failMusicVideoRender({
      error: "Remotion render completed but is missing an output URL.",
      markFailed,
      videoId: video.id,
    });
  }

  await markMusicVideoTemporaryRenderOutput({
    markTemporaryReady,
    outputUrl,
    video,
  });

  const key = getMusicVideoRenderR2Key(video);

  try {
    const upload = await fetchExternalUrlToR2(outputUrl, key);
    const completed = await markSucceeded({
      r2Key: upload.key,
      temporaryVideoUrl: null,
      videoId: video.id,
      videoUrl: upload.url,
    });

    logger.info(
      { r2Key: upload.key, videoId: video.id },
      "Music video render completed",
    );

    return completed;
  } catch (error) {
    logger.error(
      {
        err: error,
        outputUrl,
        videoId: video.id,
      },
      "Failed to persist Remotion output",
    );

    return failMusicVideoRender({
      error:
        error instanceof Error
          ? error.message
          : "Failed to persist Remotion output.",
      markFailed,
      temporaryVideoUrl: outputUrl,
      videoId: video.id,
    });
  }
}
