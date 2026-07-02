import { db } from "@/lib/db";
import {
  musicVideos as musicVideosSchema,
  songs as songsSchema,
  type MusicVideoStatus,
} from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import {
  getUploadedMediaType,
  normalizeRenderDimensions,
  type MusicVideoTimeline,
  type UploadedPhoto,
} from "./photo-slideshow";

export type MusicVideoRender = typeof musicVideosSchema.$inferSelect;
export type MusicVideoWithSong = {
  musicVideo: MusicVideoRender;
  song: {
    id: string;
    imageUrl: string | null;
    title: string;
  };
};

type DbClient = {
  insert: (...args: any[]) => any;
  select: (...args: any[]) => any;
  update: (...args: any[]) => any;
};

type SongForRender = {
  id: string;
  userId: string;
  title: string;
};

export type MusicVideoInputProps = {
  timeline: MusicVideoTimeline;
  width: number;
  height: number;
  fps: number;
};

export const MUSIC_VIDEO_RENDER_DEFAULTS = {
  fps: 30,
  height: 1920,
  width: 1080,
} as const;

function isRenderableMedia(media: UploadedPhoto) {
  return Boolean(media.url && /^https?:\/\//.test(media.url));
}

function isRenderableUrl(value: string) {
  return /^https?:\/\//.test(value.trim());
}

function assertBaseTimelineIsRenderable(timeline: MusicVideoTimeline) {
  if (!isRenderableUrl(timeline.audioUrl)) {
    throw new Error("A renderable audio URL is required before rendering this MV.");
  }
  if (!Number.isFinite(timeline.duration) || timeline.duration <= 0) {
    throw new Error("A positive duration is required before rendering this MV.");
  }
  if (timeline.lyrics.length === 0) {
    throw new Error("At least one lyric cue is required before rendering this MV.");
  }
}

export function assertTimelineIsRenderable(timeline: MusicVideoTimeline) {
  assertBaseTimelineIsRenderable(timeline);

  if (
    timeline.templateId === "minimal-vinyl" ||
    timeline.templateId === "wave-radio"
  ) {
    return;
  }

  if (timeline.photos.length === 0) {
    if (timeline.coverPhoto && isRenderableMedia(timeline.coverPhoto)) {
      return;
    }

    throw new Error("Upload at least one media asset or cover image before rendering this MV.");
  }

  const missingCloudUrl = timeline.photos.find((media) => !isRenderableMedia(media));
  if (missingCloudUrl) {
    const mediaLabel =
      getUploadedMediaType(missingCloudUrl) === "video" ? "Video" : "Image";
    throw new Error(
      `${mediaLabel} "${missingCloudUrl.name}" needs a cloud URL before rendering.`,
    );
  }
}

export function buildMusicVideoInputProps(
  timeline: MusicVideoTimeline,
): MusicVideoInputProps {
  assertTimelineIsRenderable(timeline);
  const renderDimensions = normalizeRenderDimensions(timeline);

  return {
    fps: MUSIC_VIDEO_RENDER_DEFAULTS.fps,
    height: renderDimensions.height,
    timeline,
    width: renderDimensions.width,
  };
}

export async function createMusicVideoRender({
  dbClient = db,
  song,
  timeline,
}: {
  dbClient?: Pick<DbClient, "insert">;
  song: SongForRender;
  timeline: MusicVideoTimeline;
}) {
  const inputProps = buildMusicVideoInputProps(timeline);
  const [render] = await dbClient
    .insert(musicVideosSchema)
    .values({
      duration: Math.ceil(timeline.duration),
      fps: inputProps.fps,
      height: inputProps.height,
      inputPropsJsonb: inputProps,
      songId: song.id,
      status: "queued" satisfies MusicVideoStatus,
      templateId: timeline.templateId,
      timelineJsonb: timeline,
      title: `${song.title} MV`,
      userId: song.userId,
      width: inputProps.width,
    })
    .returning();

  return render;
}

function normalizeLimit(limit: number) {
  return Math.min(Math.max(Math.floor(limit), 1), 100);
}

export async function listMusicVideosForSong({
  dbClient = db,
  songId,
  userId,
  limit = 20,
}: {
  dbClient?: Pick<DbClient, "select">;
  songId: string;
  userId: string;
  limit?: number;
}) {
  return dbClient
    .select()
    .from(musicVideosSchema)
    .where(
      and(
        eq(musicVideosSchema.songId, songId),
        eq(musicVideosSchema.userId, userId),
      ),
    )
    .orderBy(desc(musicVideosSchema.createdAt))
    .limit(normalizeLimit(limit));
}

export async function listMusicVideosForUser({
  dbClient = db,
  userId,
  limit = 60,
}: {
  dbClient?: Pick<DbClient, "select">;
  userId: string;
  limit?: number;
}) {
  return dbClient
    .select()
    .from(musicVideosSchema)
    .where(eq(musicVideosSchema.userId, userId))
    .orderBy(desc(musicVideosSchema.createdAt))
    .limit(normalizeLimit(limit));
}

export async function listMusicVideosWithSongsForUser({
  dbClient = db,
  userId,
  limit = 60,
}: {
  dbClient?: Pick<DbClient, "select">;
  userId: string;
  limit?: number;
}): Promise<MusicVideoWithSong[]> {
  return dbClient
    .select({
      musicVideo: musicVideosSchema,
      song: {
        id: songsSchema.id,
        imageUrl: songsSchema.imageUrl,
        title: songsSchema.title,
      },
    })
    .from(musicVideosSchema)
    .innerJoin(songsSchema, eq(musicVideosSchema.songId, songsSchema.id))
    .where(eq(musicVideosSchema.userId, userId))
    .orderBy(desc(musicVideosSchema.createdAt))
    .limit(normalizeLimit(limit));
}

export async function getMusicVideoForOwner({
  dbClient = db,
  userId,
  videoId,
}: {
  dbClient?: Pick<DbClient, "select">;
  userId: string;
  videoId: string;
}) {
  const [video] = await dbClient
    .select()
    .from(musicVideosSchema)
    .where(
      and(eq(musicVideosSchema.id, videoId), eq(musicVideosSchema.userId, userId)),
    )
    .limit(1);

  return video ?? null;
}

export async function getMusicVideoById({
  dbClient = db,
  videoId,
}: {
  dbClient?: Pick<DbClient, "select">;
  videoId: string;
}) {
  const [video] = await dbClient
    .select()
    .from(musicVideosSchema)
    .where(eq(musicVideosSchema.id, videoId))
    .limit(1);

  return video ?? null;
}

async function updateMusicVideo({
  dbClient = db,
  values,
  videoId,
}: {
  dbClient?: Pick<DbClient, "update">;
  values: Partial<typeof musicVideosSchema.$inferInsert>;
  videoId: string;
}) {
  const [video] = await dbClient
    .update(musicVideosSchema)
    .set({
      ...values,
      updatedAt: new Date(),
    })
    .where(eq(musicVideosSchema.id, videoId))
    .returning();

  return video ?? null;
}

export async function markMusicVideoRendering({
  dbClient = db,
  lambdaBucketName,
  lambdaOutputKey,
  renderId,
  videoId,
}: {
  dbClient?: Pick<DbClient, "update">;
  lambdaBucketName?: string | null;
  lambdaOutputKey?: string | null;
  renderId: string;
  videoId: string;
}) {
  return updateMusicVideo({
    dbClient,
    values: {
      error: null,
      lambdaBucketName,
      lambdaOutputKey,
      renderId,
      status: "rendering",
    },
    videoId,
  });
}

export async function markMusicVideoSucceeded({
  dbClient = db,
  r2Key,
  temporaryVideoUrl,
  thumbnailUrl,
  videoId,
  videoUrl,
}: {
  dbClient?: Pick<DbClient, "update">;
  r2Key: string;
  temporaryVideoUrl?: string | null;
  thumbnailUrl?: string | null;
  videoId: string;
  videoUrl: string;
}) {
  return updateMusicVideo({
    dbClient,
    values: {
      completedAt: new Date(),
      error: null,
      r2Key,
      status: "completed",
      temporaryVideoUrl: temporaryVideoUrl ?? null,
      thumbnailUrl,
      videoUrl,
    },
    videoId,
  });
}

export async function markMusicVideoTemporaryOutputReady({
  dbClient = db,
  temporaryVideoUrl,
  videoId,
}: {
  dbClient?: Pick<DbClient, "update">;
  temporaryVideoUrl: string;
  videoId: string;
}) {
  return updateMusicVideo({
    dbClient,
    values: {
      error: null,
      temporaryVideoUrl,
    },
    videoId,
  });
}

export async function markMusicVideoFailed({
  dbClient = db,
  error,
  videoId,
}: {
  dbClient?: Pick<DbClient, "update">;
  error: string;
  videoId: string;
}) {
  return updateMusicVideo({
    dbClient,
    values: {
      error,
      status: "failed",
    },
    videoId,
  });
}
