import { redis } from "@/lib/upstash";
import { REDIS_KEYS_CONFIGS } from "@/lib/upstash/redis-keys";
import type { SongCoverArtDirection } from "@/types/song-cover";
import type { KieSongVersion, SongTaskStatus } from "./adapters/kie-suno";
import type { SpokenIntro } from "./spoken-intro";
import type { SpokenIntroRender } from "./song-intro-composer";
import type { SongPreviewRender } from "./song-preview-composer";

const TTL = 3 * 24 * 60 * 60;
const keys = REDIS_KEYS_CONFIGS.songTask;

export type SongLyricsTask = {
  taskId: string;
  externalId: string;
  status: SongTaskStatus;
  title?: string;
  lyrics?: string;
  coverArt?: SongCoverArtDirection;
  error?: string;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
};

export type SongGenerationTask = {
  songId: string;
  externalId: string;
  status: SongTaskStatus;
  userId?: string;
  isSubscriber: boolean;
  title: string;
  lyrics: string;
  genre: string;
  occasion: string;
  recipientNames: string[];
  story: string;
  vocalGender: string;
  language: string;
  spokenIntro?: SpokenIntro;
  spokenIntroRenders?: SpokenIntroRender[];
  songPreviewRenders?: SongPreviewRender[];
  fullVersions?: KieSongVersion[];
  mockMode?: boolean;
  mockReadyAt?: number;
  versions: KieSongVersion[];
  error?: string;
  lastKiePollAt?: number;
  nextKiePollAt?: number;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
};

async function setJson(key: string, value: unknown): Promise<void> {
  if (!redis) {
    throw new Error(
      "Redis is not configured for temporary song generation storage.",
    );
  }
  await redis.set(key, JSON.stringify(value), { ex: TTL });
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
      "[song-task-store] Redis value is not valid JSON, returning raw string",
      {
        key,
        data,
        error: error instanceof Error ? error.message : error,
      },
    );
    return data as unknown as T;
  }
}

export function createExpiresAt(createdAt = Date.now()): number {
  return createdAt + TTL * 1000;
}

export function assertSongTaskStoreConfigured(): void {
  if (!redis) {
    throw new Error(
      "Redis is not configured for temporary song generation storage.",
    );
  }
}

export const songTaskStore = {
  async setLyrics(task: SongLyricsTask): Promise<void> {
    await setJson(keys.task(task.taskId), task);
  },

  async getLyrics(taskId: string): Promise<SongLyricsTask | null> {
    return getJson<SongLyricsTask>(keys.task(taskId));
  },

  async updateLyrics(
    taskId: string,
    updates: Partial<SongLyricsTask>,
  ): Promise<SongLyricsTask | null> {
    const task = await this.getLyrics(taskId);
    if (!task) return null;
    const updated = { ...task, ...updates, updatedAt: Date.now() };
    await this.setLyrics(updated);
    return updated;
  },

  async setSong(task: SongGenerationTask): Promise<void> {
    await setJson(keys.song(task.songId), task);
    if (task.externalId) {
      await setJson(keys.songExternalId(task.externalId), task.songId);
    }
  },

  async getSong(songId: string): Promise<SongGenerationTask | null> {
    return getJson<SongGenerationTask>(keys.song(songId));
  },

  async getSongByExternalId(
    externalId: string,
  ): Promise<SongGenerationTask | null> {
    const rawSongId = await getJson<string>(keys.songExternalId(externalId));
    console.log("[song-task-store] External ID lookup", {
      externalId,
      rawSongId,
      rawSongIdType: typeof rawSongId,
    });

    if (!rawSongId) {
      return null;
    }

    return this.getSong(rawSongId);
  },

  async updateSong(
    songId: string,
    updates: Partial<SongGenerationTask>,
  ): Promise<SongGenerationTask | null> {
    const task = await this.getSong(songId);
    if (!task) return null;
    const updated = { ...task, ...updates, updatedAt: Date.now() };
    await this.setSong(updated);
    return updated;
  },

  async claimSongSampleReadyEmail(songId: string): Promise<boolean> {
    if (!redis) {
      throw new Error(
        "Redis is not configured for temporary song generation storage.",
      );
    }

    const result = await redis.set(keys.sampleReadyEmailSent(songId), "1", {
      ex: TTL,
      nx: true,
    });

    return result === "OK";
  },
};
