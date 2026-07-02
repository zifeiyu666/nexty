import { apiResponse } from "@/lib/api-response";
import { getSongForOwner } from "@/lib/ai/final-song";
import { getSession } from "@/lib/auth/server";
import { getLogger } from "@/lib/logger";
import {
  createMusicVideoRender,
  markMusicVideoFailed,
  markMusicVideoRendering,
} from "@/lib/music-video/renders";
import {
  DEFAULT_LYRICS_STYLE,
  type MusicVideoTimeline,
} from "@/lib/music-video/photo-slideshow";
import { startLambdaRender } from "@/lib/music-video/remotion-lambda";
import { z } from "zod";

type Params = Promise<{ songId: string }>;

const logger = getLogger("music-video-render");

const lyricCueSchema = z.object({
  end: z.number(),
  id: z.string(),
  start: z.number(),
  text: z.string(),
});
const photoSchema = z.object({
  id: z.string(),
  isCover: z.boolean().optional(),
  mediaType: z.enum(["image", "video"]).optional(),
  name: z.string(),
  objectUrl: z.string(),
  r2Key: z.string().optional(),
  url: z.string().url(),
});
const assignmentSchema = z.object({
  cueId: z.string(),
  photoId: z.string(),
});
const transitionSchema = z.object({
  fromCueId: z.string(),
  toCueId: z.string(),
  type: z.enum(["cross-dissolve", "motion-blur", "light-leak", "zoom-push"]),
});
const lyricsEntranceSchema = z.union([
  z.enum(["motion-blur-slip", "staggered-glow-reveal", "rolling-flow"]),
  z.literal(""),
]).transform((entrance) =>
  entrance === "" ? DEFAULT_LYRICS_STYLE.entrance : entrance,
);
const lyricsStyleSchema = z.object({
  color: z.string(),
  entrance: lyricsEntranceSchema,
  fontFamily: z.string(),
  fontSize: z.number().positive(),
  position: z.enum(["top", "center", "bottom"]),
  strokeColor: z.string(),
  strokeWidth: z.number().min(0),
});
const atmosphereOverlaySchema = z.object({
  opacity: z.number().min(0).max(1),
  overlayId: z.string().nullable(),
});

const baseTimelineSchema = {
  assignments: z.array(assignmentSchema),
  atmosphereOverlay: atmosphereOverlaySchema.optional(),
  audioUrl: z.string().url(),
  backgroundBlur: z.number().min(0).max(64).optional(),
  backgroundPhoto: photoSchema.optional(),
  coverPhoto: photoSchema.optional(),
  duration: z.number().positive(),
  height: z.number().int().positive(),
  lyrics: z.array(lyricCueSchema),
  lyricsStyle: lyricsStyleSchema.optional(),
  photos: z.array(photoSchema),
  songTitle: z.string(),
  transitions: z.array(transitionSchema).default([]),
  width: z.number().int().positive(),
};

const photoSlideshowTimelineSchema = z.object({
  ...baseTimelineSchema,
  templateId: z.literal("photo-slideshow"),
});

const minimalVinylTimelineSchema = z.object({
  ...baseTimelineSchema,
  assignments: z.array(assignmentSchema).default([]),
  photos: z.array(photoSchema).default([]),
  templateId: z.literal("minimal-vinyl"),
  transitions: z.array(transitionSchema).default([]),
});

const waveRadioTimelineSchema = z.object({
  ...baseTimelineSchema,
  assignments: z.array(assignmentSchema).default([]),
  photos: z.array(photoSchema).default([]),
  templateId: z.literal("wave-radio"),
  transitions: z.array(transitionSchema).default([]),
  waveRadioBackgroundId: z.string(),
});

const timelineSchema = z.discriminatedUnion("templateId", [
  photoSlideshowTimelineSchema,
  minimalVinylTimelineSchema,
  waveRadioTimelineSchema,
]);

function summarizePhoto(
  photo:
    | {
        id: string;
        isCover?: boolean;
        mediaType?: "image" | "video";
        name: string;
        objectUrl: string;
        r2Key?: string;
        url?: string;
      }
    | null
    | undefined,
) {
  if (!photo) return null;

  return {
    id: photo.id,
    isCover: photo.isCover ?? false,
    mediaType: photo.mediaType ?? null,
    name: photo.name,
    objectUrl: photo.objectUrl,
    r2Key: photo.r2Key ?? null,
    url: photo.url ?? null,
  };
}

function summarizeTimelineMedia(
  timeline: MusicVideoTimeline,
) {
  const minimalVinylBackground =
    timeline.templateId === "minimal-vinyl"
      ? {
          backgroundBlur: timeline.backgroundBlur ?? null,
          backgroundPhoto: summarizePhoto(timeline.backgroundPhoto),
        }
      : {
          backgroundBlur: null,
          backgroundPhoto: null,
        };

  return {
    assignments: timeline.assignments.map((assignment) => ({
      cueId: assignment.cueId,
      photoId: assignment.photoId,
    })),
    ...minimalVinylBackground,
    coverPhoto: summarizePhoto(timeline.coverPhoto),
    height: timeline.height,
    photoCount: timeline.photos.length,
    photos: timeline.photos.map((photo) => summarizePhoto(photo)),
    templateId: timeline.templateId,
    width: timeline.width,
  };
}

export async function POST(
  request: Request,
  { params }: { params: Params },
) {
  const session = await getSession();
  const user = session?.user;
  if (!user) return apiResponse.unauthorized();

  const { songId } = await params;
  const song = await getSongForOwner(songId, user.id);
  if (!song) return apiResponse.notFound("Song not found.");

  const parsed = timelineSchema.safeParse(await request.json());
  if (!parsed.success) {
    return apiResponse.badRequest(parsed.error.errors[0]?.message ?? "Invalid MV timeline.");
  }

  logger.info(
    {
      songId,
      userId: user.id,
      ...summarizeTimelineMedia(parsed.data),
    },
    "Received music video render timeline",
  );

  const video = await createMusicVideoRender({
    song,
    timeline: parsed.data,
  });

  try {
    const inputProps = video.inputPropsJsonb as Parameters<
      typeof startLambdaRender
    >[0]["inputProps"];

    logger.info(
      {
        songId,
        userId: user.id,
        videoId: video.id,
        ...summarizeTimelineMedia(inputProps.timeline),
      },
      "Prepared music video render input props",
    );

    const lambda = await startLambdaRender({
      inputProps,
      video,
    });
    const updated = await markMusicVideoRendering({
      lambdaBucketName: lambda.bucketName,
      lambdaOutputKey: lambda.outKey,
      renderId: lambda.renderId,
      videoId: video.id,
    });

    return apiResponse.success(updated ?? video, 202);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to start MV render.";
    logger.error(
      {
        err: error,
        songId,
        videoId: video.id,
      },
      "Failed to start Remotion music video render",
    );
    await markMusicVideoFailed({
      error: message,
      videoId: video.id,
    });

    return apiResponse.error(message, 500);
  }
}
