import { fetchExternalUrlToR2 as defaultFetchExternalUrlToR2 } from "@/lib/cloudflare/r2-fetch-upload";
import { getLogger } from "@/lib/logger";
import {
  markMusicVideoFailed,
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

export function getMusicVideoRenderR2Key(video: RenderVideoRef) {
  return `music-videos/renders/${video.userId}/${video.songId}/${video.id}.mp4`;
}

export async function failMusicVideoRender({
  error,
  markFailed = markMusicVideoFailed,
  videoId,
}: {
  error: string;
  markFailed?: MarkFailed;
  videoId: string;
}) {
  logger.warn({ error, videoId }, "Music video render failed");

  return markFailed({
    error,
    videoId,
  });
}

export async function completeMusicVideoRender({
  fetchExternalUrlToR2 = defaultFetchExternalUrlToR2,
  markFailed = markMusicVideoFailed,
  markSucceeded = markMusicVideoSucceeded,
  outputUrl,
  video,
}: {
  fetchExternalUrlToR2?: UploadToR2;
  markFailed?: MarkFailed;
  markSucceeded?: MarkSucceeded;
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

  const key = getMusicVideoRenderR2Key(video);

  try {
    const upload = await fetchExternalUrlToR2(outputUrl, key);
    const completed = await markSucceeded({
      r2Key: upload.key,
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
      videoId: video.id,
    });
  }
}
