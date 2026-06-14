import { siteConfig } from '@/config/site';
import { PostType } from '@/lib/db/schema';

export const LOWER_CASE_SITE_NAME = siteConfig.name.trim().toLowerCase().replace(/\s+/g, '-');

/**
 * Redis key generator - centralized key management for consistency
 */
export const REDIS_KEYS_CONFIGS = {
  post: {
    /**
     * Get post view count key
     * @example post:views:my-postType-post:en
     */
    viewCount: (postType: PostType, slug: string, locale: string) => `${LOWER_CASE_SITE_NAME}:blog:views:${postType}:${slug}:${locale}`,

    /**
     * Get post IP tracking key (for deduplication)
     * @example post:views:ip:my-postType-post:en:192.168.1.1
     */
    viewIpTracking: (postType: PostType, slug: string, locale: string, ip: string) =>
      `${LOWER_CASE_SITE_NAME}:post:views:ip:${postType}:${slug}:${locale}:${ip}`,
  },

  videoTask: {
    /** @example wenext:vtask:{taskId} */
    task: (taskId: string) => `${LOWER_CASE_SITE_NAME}:vtask:${taskId}`,
    /** @example wenext:vtask:ext:{externalId} */
    externalId: (externalId: string) => `${LOWER_CASE_SITE_NAME}:vtask:ext:${externalId}`,
  },

  songTask: {
    /** @example wenext:stask:{taskId} */
    task: (taskId: string) => `${LOWER_CASE_SITE_NAME}:stask:${taskId}`,
    /** @example wenext:song:{songId} */
    song: (songId: string) => `${LOWER_CASE_SITE_NAME}:song:${songId}`,
    /** @example wenext:song:ext:{externalId} */
    songExternalId: (externalId: string) => `${LOWER_CASE_SITE_NAME}:song:ext:${externalId}`,
    /** @example wenext:ssample:{songId} */
    sample: (songId: string) => `${LOWER_CASE_SITE_NAME}:ssample:${songId}`,
    /** @example wenext:ssamples:user:{userId} */
    samplesByUser: (userId: string) => `${LOWER_CASE_SITE_NAME}:ssamples:user:${userId}`,
    /** @example wenext:ssamples:email:{email} */
    samplesByEmail: (email: string) => `${LOWER_CASE_SITE_NAME}:ssamples:email:${email.toLowerCase()}`,
  },

  // Add other modules here as needed
  // user: { ... },
  // cache: { ... },
};
