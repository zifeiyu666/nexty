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
  email?: string;
  title: string;
  lyrics: string;
  genre: string;
  occasion: string;
  language: string;
  vocalGender: string;
  recipientNames: string[];
  story: string;
  versions: KieSongVersion[];
  previewLimitSeconds: number;
  createdAt: number;
  updatedAt: number;
  accessExpiresAt: number;
  unlockedVersionIds?: string[];
};

export type SongSampleView = SongSample & {
  isExpired: boolean;
};

function sampleToView(sample: SongSample, now = Date.now()): SongSampleView {
  return {
    ...sample,
    isExpired: now > sample.accessExpiresAt,
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
    console.warn("[song-sample-store] Redis value is not valid JSON, returning raw string", {
      key,
      data,
      error: error instanceof Error ? error.message : error,
    });
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

export function createSongSampleFromTask(
  task: SongGenerationTask,
  now = Date.now()
): SongSample {
  return {
    songId: task.songId,
    externalId: task.externalId,
    userId: task.userId,
    email: task.email,
    title: task.title,
    lyrics: task.lyrics,
    genre: task.genre,
    occasion: task.occasion,
    language: task.language,
    vocalGender: task.vocalGender,
    recipientNames: task.recipientNames,
    story: task.story,
    versions: task.versions,
    previewLimitSeconds: 60,
    createdAt: task.createdAt,
    updatedAt: now,
    accessExpiresAt: task.createdAt + ACCESS_WINDOW_MS,
    unlockedVersionIds: task.isSubscriber ? task.versions.map((version) => version.id) : [],
  };
}

export const songSampleStore = {
  async save(sample: SongSample): Promise<void> {
    await setJson(keys.sample(sample.songId), sample);

    if (sample.userId && redis) {
      const indexKey = keys.samplesByUser(sample.userId);
      const ids = unique([sample.songId, ...((await getJson<string[]>(indexKey)) || [])]);
      await setJson(indexKey, ids);
    }

    if (sample.email && redis) {
      const indexKey = keys.samplesByEmail(sample.email);
      const ids = unique([sample.songId, ...((await getJson<string[]>(indexKey)) || [])]);
      await setJson(indexKey, ids);
    }
  },

  async get(songId: string): Promise<SongSampleView | null> {
    const sample = await getJson<SongSample>(keys.sample(songId));
    return sample ? sampleToView(sample) : null;
  },

  async unlockVersion(songId: string, versionId: string): Promise<SongSampleView | null> {
    const sample = await getJson<SongSample>(keys.sample(songId));
    if (!sample) return null;

    const unlockedVersionIds = unique([...(sample.unlockedVersionIds || []), versionId]);
    const updated: SongSample = {
      ...sample,
      unlockedVersionIds,
      previewLimitSeconds: 0,
      updatedAt: Date.now(),
    };
    await this.save(updated);
    return sampleToView(updated);
  },

  async list(input: {
    userId?: string;
    email?: string;
    limit?: number;
  }): Promise<SongSampleView[]> {
    if (!redis) return [];

    const ids = unique([
      ...((input.userId ? await getJson<string[]>(keys.samplesByUser(input.userId)) : null) || []),
      ...((input.email ? await getJson<string[]>(keys.samplesByEmail(input.email)) : null) || []),
    ]);

    const samples = await Promise.all(ids.map((songId) => this.get(songId)));
    return samples
      .filter((sample): sample is SongSampleView => Boolean(sample))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, input.limit || 60);
  },
};
