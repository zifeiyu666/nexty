import { redis } from "@/lib/upstash";
import { REDIS_KEYS_CONFIGS } from "@/lib/upstash/redis-keys";
import type { KieSongVersion, SongTaskStatus } from "./adapters/kie-suno";

const TTL = 3 * 24 * 60 * 60;
const keys = REDIS_KEYS_CONFIGS.songTask;

export type SongLyricsTask = {
  taskId: string;
  externalId: string;
  status: SongTaskStatus;
  title?: string;
  lyrics?: string;
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
  email?: string;
  isSubscriber: boolean;
  title: string;
  lyrics: string;
  genre: string;
  vocalGender: string;
  language: string;
  versions: KieSongVersion[];
  error?: string;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
};

async function setJson(key: string, value: unknown): Promise<void> {
  if (!redis) {
    throw new Error("Redis is not configured for temporary song generation storage.");
  }
  await redis.set(key, JSON.stringify(value), { ex: TTL });
}

async function getJson<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  const data = await redis.get<string>(key);
  if (!data) return null;
  return typeof data === "string" ? JSON.parse(data) : (data as T);
}

export function createExpiresAt(createdAt = Date.now()): number {
  return createdAt + TTL * 1000;
}

export function assertSongTaskStoreConfigured(): void {
  if (!redis) {
    throw new Error("Redis is not configured for temporary song generation storage.");
  }
}

export const songTaskStore = {
  async setLyrics(task: SongLyricsTask): Promise<void> {
    await setJson(keys.task(task.taskId), task);
  },

  async getLyrics(taskId: string): Promise<SongLyricsTask | null> {
    return getJson<SongLyricsTask>(keys.task(taskId));
  },

  async updateLyrics(taskId: string, updates: Partial<SongLyricsTask>): Promise<SongLyricsTask | null> {
    const task = await this.getLyrics(taskId);
    if (!task) return null;
    const updated = { ...task, ...updates, updatedAt: Date.now() };
    await this.setLyrics(updated);
    return updated;
  },

  async setSong(task: SongGenerationTask): Promise<void> {
    await setJson(keys.song(task.songId), task);
  },

  async getSong(songId: string): Promise<SongGenerationTask | null> {
    return getJson<SongGenerationTask>(keys.song(songId));
  },

  async updateSong(songId: string, updates: Partial<SongGenerationTask>): Promise<SongGenerationTask | null> {
    const task = await this.getSong(songId);
    if (!task) return null;
    const updated = { ...task, ...updates, updatedAt: Date.now() };
    await this.setSong(updated);
    return updated;
  },
};
