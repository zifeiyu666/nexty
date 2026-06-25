import { apiResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth/server";
import {
  getMusicVideoForOwner,
} from "@/lib/music-video/renders";
import {
  completeMusicVideoRender,
  failMusicVideoRender,
} from "@/lib/music-video/render-completion";
import { getLambdaRenderProgress } from "@/lib/music-video/remotion-lambda";

type Params = Promise<{ videoId: string }>;

export async function POST(_request: Request, { params }: { params: Params }) {
  const session = await getSession();
  const user = session?.user;
  if (!user) return apiResponse.unauthorized();

  const { videoId } = await params;
  const video = await getMusicVideoForOwner({
    userId: user.id,
    videoId,
  });
  if (!video) return apiResponse.notFound("Music video not found.");

  if (video.status === "completed" || video.status === "failed") {
    return apiResponse.success({ progress: video.status === "completed" ? 1 : 0, video });
  }
  if (!video.renderId || !video.lambdaBucketName) {
    return apiResponse.success({ progress: 0, video });
  }

  try {
    const progress = await getLambdaRenderProgress({
      bucketName: video.lambdaBucketName,
      renderId: video.renderId,
    });

    if (progress.errorMessage) {
      const failed = await failMusicVideoRender({
        error: progress.errorMessage,
        videoId: video.id,
      });
      return apiResponse.success({ progress: progress.progress, video: failed });
    }

    if (!progress.done || !progress.outputFile) {
      return apiResponse.success({ progress: progress.progress, video });
    }

    const completed = await completeMusicVideoRender({
      outputUrl: progress.outputFile,
      video,
    });

    return apiResponse.success({ progress: 1, video: completed });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to refresh MV render.";
    const failed = await failMusicVideoRender({
      error: message,
      videoId: video.id,
    });
    return apiResponse.success({ progress: 0, video: failed });
  }
}
