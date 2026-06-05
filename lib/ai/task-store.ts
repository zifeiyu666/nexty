import { redis } from "@/lib/upstash";
import { REDIS_KEYS_CONFIGS } from "@/lib/upstash/redis-keys";
import type { VideoGenerationTask } from "./video";

// TODO [Persistent Storage]: Redis is used as a short-lived cache (TTL = 1 hour).
//   For production, add a database layer so task history persists beyond the TTL.
//   Pattern:
//     - Write to DB first (single source of truth)
//     - Write to Redis as a hot cache for polling
//     - On cache miss in `get()`, fall back to DB query
//   See the `ai_video_tasks` table suggestion in app/api/ai-demo/video/route.ts.

// TODO [Task List API]: To support a task history dashboard page, add a `list` method:
//   async list(userId: string, limit = 20): Promise<VideoGenerationTask[]>
//   This should query the database (not Redis) for the user's tasks sorted by createdAt DESC.
//   Redis is not suitable for listing by user — tasks are keyed by taskId, not userId.

const TTL = 60 * 60; // 1 hour in seconds
const keys = REDIS_KEYS_CONFIGS.videoTask;

/**
 * Video generation task store backed by Upstash Redis.
 * All keys auto-expire after 1 hour.
 */
export const taskStore = {
  async set(taskId: string, task: VideoGenerationTask): Promise<void> {
    if (!redis) return;
    await redis.set(keys.task(taskId), JSON.stringify(task), { ex: TTL });
  },

  async get(taskId: string): Promise<VideoGenerationTask | null> {
    if (!redis) return null;
    const data = await redis.get<string>(keys.task(taskId));
    if (!data) return null;
    return typeof data === "string" ? JSON.parse(data) : data;
  },

  async getByExternalId(externalId: string): Promise<VideoGenerationTask | null> {
    if (!redis) return null;
    const internalId = await redis.get<string>(keys.externalId(externalId));
    if (!internalId) return null;
    return this.get(internalId);
  },

  async setExternalId(externalId: string, internalId: string): Promise<void> {
    if (!redis) return;
    await redis.set(keys.externalId(externalId), internalId, { ex: TTL });
  },

  async update(taskId: string, updates: Partial<VideoGenerationTask>): Promise<void> {
    if (!redis) return;
    const task = await this.get(taskId);
    if (!task) return;
    const updated = { ...task, ...updates, updatedAt: Date.now() };
    await redis.set(keys.task(taskId), JSON.stringify(updated), { ex: TTL });
  },
};
