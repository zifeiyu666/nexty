import { redis } from "@/lib/upstash";
import { REDIS_KEYS_CONFIGS } from "@/lib/upstash/redis-keys";
import type { KieSongVersion } from "./adapters/kie-suno";
import type { SongGenerationTask } from "./song-task-store";

const ACCESS_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;
const keys = REDIS_KEYS_CONFIGS.songTask;

export type SongSample = {
  songId: string;
  externalId: string;
  userId?: string;
  title: string;
  lyrics: string;
  genre: string;
  occasion: string;
  personalNote?: string;
  language: string;
  vocalGender: string;
  recipientNames: string[];
  story: string;
  versions: KieSongVersion[];
  fullVersions?: KieSongVersion[];
  previewLimitSeconds: number | null;
  createdAt: number;
  updatedAt: number;
  accessExpiresAt: number | null;
};

export type SongSampleView = Omit<SongSample, "fullVersions"> & {
  fullVersions?: KieSongVersion[];
  isExpired: boolean;
};

type SampleAccessOptions = {
  hasActiveSubscription?: boolean;
  includeFullVersions?: boolean;
};

export function getSampleAccessExpiresAt(
  sample: Pick<SongSample, "accessExpiresAt" | "createdAt">,
): number {
  return sample.accessExpiresAt ?? sample.createdAt + ACCESS_WINDOW_MS;
}

export function createSongSampleView(
  sample: SongSample,
  now = Date.now(),
  options: SampleAccessOptions = {},
): SongSampleView {
  const accessExpiresAt = getSampleAccessExpiresAt(sample);
  const { fullVersions, ...publicSample } = sample;

  return {
    ...publicSample,
    ...(options.includeFullVersions && fullVersions ? { fullVersions } : {}),
    accessExpiresAt,
    isExpired: options.hasActiveSubscription ? false : now > accessExpiresAt,
  };
}

async function getJson<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  const data = await redis.get<string>(key);
  if (!data) return null;

  if (typeof data !== "string") {
    return data as T;
  }

  try {
    return JSON.parse(data);
  } catch (error) {
    console.warn(
      "[song-sample-store] Redis value is not valid JSON, returning raw string",
      {
        key,
        data,
        error: error instanceof Error ? error.message : error,
      },
    );
    return data as unknown as T;
  }
}

async function setJson(key: string, value: unknown): Promise<void> {
  if (!redis) {
    throw new Error("Redis is not configured for song samples.");
  }
  await redis.set(key, JSON.stringify(value));
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function removeValue(values: string[] | null, value: string): string[] {
  return unique((values || []).filter((item) => item !== value));
}

export function createSongSampleFromTask(
  task: SongGenerationTask,
  now = Date.now(),
): SongSample {
  return {
    songId: task.songId,
    externalId: task.externalId,
    userId: task.userId,
    title: task.title,
    lyrics: task.lyrics,
    genre: task.genre,
    occasion: task.occasion,
    language: task.language,
    vocalGender: task.vocalGender,
    recipientNames: task.recipientNames,
    story: task.story,
    versions: task.versions,
    fullVersions: task.fullVersions,
    previewLimitSeconds: 60,
    createdAt: task.createdAt,
    updatedAt: now,
    accessExpiresAt: task.createdAt + ACCESS_WINDOW_MS,
  };
}

export const songSampleStore = {
  async save(sample: SongSample): Promise<void> {
    await setJson(keys.sample(sample.songId), sample);

    if (sample.userId && redis) {
      const indexKey = keys.samplesByUser(sample.userId);
      const ids = unique([
        sample.songId,
        ...((await getJson<string[]>(indexKey)) || []),
      ]);
      await setJson(indexKey, ids);
    }
  },

  async get(
    songId: string,
    options: SampleAccessOptions = {},
  ): Promise<SongSampleView | null> {
    const sample = await getJson<SongSample>(keys.sample(songId));
    return sample ? createSongSampleView(sample, Date.now(), options) : null;
  },

  async updatePersonalNote({
    personalNote,
    songId,
    userId,
  }: {
    personalNote: string;
    songId: string;
    userId: string;
  }): Promise<boolean> {
    const sample = await getJson<SongSample>(keys.sample(songId));
    if (!sample || (sample.userId && sample.userId !== userId)) return false;

    await setJson(keys.sample(songId), {
      ...sample,
      personalNote,
      updatedAt: Date.now(),
    });
    return true;
  },

  async list(input: {
    userId?: string;
    limit?: number;
    hasActiveSubscription?: boolean;
  }): Promise<SongSampleView[]> {
    if (!redis) return [];

    const ids = unique(
      (input.userId
        ? await getJson<string[]>(keys.samplesByUser(input.userId))
        : null) || [],
    );

    const samples = await Promise.all(
      ids.map((songId) =>
        this.get(songId, {
          hasActiveSubscription: input.hasActiveSubscription,
        }),
      ),
    );
    return samples
      .filter((sample): sample is SongSampleView => Boolean(sample))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, input.limit || 60);
  },

  async delete(songId: string): Promise<SongSample | null> {
    if (!redis) {
      throw new Error("Redis is not configured for song samples.");
    }

    const sample = await getJson<SongSample>(keys.sample(songId));
    if (!sample) return null;

    const operations: Promise<unknown>[] = [redis.del(keys.sample(songId))];

    if (sample.userId) {
      const indexKey = keys.samplesByUser(sample.userId);
      operations.push(
        getJson<string[]>(indexKey).then((ids) =>
          setJson(indexKey, removeValue(ids, songId)),
        ),
      );
    }
    await Promise.all(operations);
    return sample;
  },
};
