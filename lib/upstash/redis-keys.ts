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

  // Add other modules here as needed
  // user: { ... },
  // cache: { ... },
};