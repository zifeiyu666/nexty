import { getPostMetadataAction, getPublishedPostBySlugAction, listPublishedPostsAction } from '@/actions/posts/posts';
import { POST_CONFIGS } from '@/components/cms/post-config';
import { DEFAULT_LOCALE } from '@/i18n/routing';
import { PostType } from '@/lib/db/schema';
import { PostBase, PublicPost, PublicPostWithContent } from '@/types/cms';
import dayjs from 'dayjs';
import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

const POSTS_BATCH_SIZE = 10;

/**
 * Maps a server post to the unified PostBase format
 */
function mapServerPostToPostBase(serverPost: PublicPostWithContent, locale: string): PostBase {
  return {
    locale: locale,
    id: serverPost.id || undefined,
    title: serverPost.title,
    description: serverPost.description ?? '',
    featuredImageUrl: serverPost.featuredImageUrl ?? '',
    slug: serverPost.slug,
    tags: serverPost.tags ?? '',
    publishedAt:
      (serverPost.publishedAt && dayjs(serverPost.publishedAt).toDate()) || new Date(serverPost.createdAt),
    status: serverPost.status ?? 'published',
    visibility: serverPost.visibility ?? 'public',
    isPinned: serverPost.isPinned ?? false,
    content: serverPost.content ?? '',
  };
}

/**
 * Maps local markdown file data to PostBase format
 */
function mapLocalFileToPostBase(data: Record<string, any>, content: string, locale: string): PostBase {
  return {
    locale,
    id: data.id || undefined,
    title: data.title,
    description: data.description || '',
    featuredImageUrl: data.featuredImageUrl || '',
    slug: data.slug,
    tags: data.tags || '',
    publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
    status: data.status || 'published',
    visibility: data.visibility || 'public',
    isPinned: data.isPinned || false,
    content,
    metadata: data,
  };
}

export interface GetBySlugResult {
  post: PostBase | null;
  error?: string;
  errorCode?: string;
}

export interface GetListResult {
  posts: PostBase[];
}

export interface GetPublishedListResult {
  posts: PublicPost[];
  count: number;
}

export interface PostMetadata {
  title: string;
  description: string | null;
  featuredImageUrl: string | null;
  visibility: string;
}

export interface GetMetadataResult {
  metadata: PostMetadata | null;
}

/**
 * Creates a CMS module for a given post type
 * Configuration is read from POST_CONFIGS in post-config.ts
 */
export function createCmsModule(postType: PostType) {
  const config = POST_CONFIGS[postType];
  const localDirectory = config.localDirectory;

  /**
   * Get a single post by slug
   * If localDirectory is configured, checks local files first, then falls back to server
   */
  async function getBySlug(
    slug: string,
    locale: string = DEFAULT_LOCALE
  ): Promise<GetBySlugResult> {
    // Try local filesystem first if localDirectory is configured
    if (localDirectory) {
      const postsDirectory = path.join(process.cwd(), localDirectory, locale);
      if (fs.existsSync(postsDirectory)) {
        const filenames = await fs.promises.readdir(postsDirectory);
        for (const filename of filenames) {
          const fullPath = path.join(postsDirectory, filename);
          try {
            const fileContents = await fs.promises.readFile(fullPath, 'utf8');
            const { data, content } = matter(fileContents);

            const localSlug = (data.slug || '').replace(/^\//, '').replace(/\/$/, '');
            const targetSlug = slug.replace(/^\//, '').replace(/\/$/, '');

            if (localSlug === targetSlug && data.status !== 'draft') {
              return {
                post: mapLocalFileToPostBase(data, content, locale),
                error: undefined,
                errorCode: undefined,
              };
            }
          } catch (error) {
            console.error(`Error processing local file ${filename}:`, error);
          }
        }
      }
    }

    // Fall back to server
    const serverResult = await getPublishedPostBySlugAction({ slug, locale, postType });

    if (serverResult.success && serverResult.data?.post) {
      return {
        post: mapServerPostToPostBase(serverResult.data.post, locale),
        error: undefined,
        errorCode: serverResult.customCode,
      };
    } else if (!serverResult.success) {
      return { post: null, error: serverResult.error, errorCode: serverResult.customCode };
    } else {
      return { post: null, error: `${postType} not found (unexpected server response).`, errorCode: undefined };
    }
  }

  /**
   * Get all posts from local directory (if configured)
   * Returns empty array if no localDirectory is set
   */
  async function getLocalList(locale: string = DEFAULT_LOCALE): Promise<GetListResult> {
    if (!localDirectory) {
      return { posts: [] };
    }

    const postsDirectory = path.join(process.cwd(), localDirectory, locale);

    if (!fs.existsSync(postsDirectory)) {
      return { posts: [] };
    }

    let filenames = await fs.promises.readdir(postsDirectory);
    filenames = filenames.reverse();

    let allPosts: PostBase[] = [];

    // Read files in batches
    for (let i = 0; i < filenames.length; i += POSTS_BATCH_SIZE) {
      const batchFilenames = filenames.slice(i, i + POSTS_BATCH_SIZE);

      const batchPosts: PostBase[] = await Promise.all(
        batchFilenames.map(async (filename) => {
          const fullPath = path.join(postsDirectory, filename);
          const fileContents = await fs.promises.readFile(fullPath, 'utf8');
          const { data, content } = matter(fileContents);
          return mapLocalFileToPostBase(data, content, locale);
        })
      );

      allPosts.push(...batchPosts);
    }

    // Filter out non-published articles
    allPosts = allPosts.filter(post => post.status === 'published');

    // Sort posts by isPinned and publishedAt
    allPosts = allPosts.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
      }
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    return { posts: allPosts };
  }

  /**
   * Get published posts from server with pagination
   */
  async function getPublishedList(
    locale: string = DEFAULT_LOCALE,
    options: {
      pageIndex?: number;
      pageSize?: number;
      tagId?: string | null;
      visibility?: 'public' | 'logged_in' | 'subscribers' | null;
    } = {}
  ): Promise<GetPublishedListResult> {
    const result = await listPublishedPostsAction({
      postType,
      locale,
      pageIndex: options.pageIndex ?? 0,
      pageSize: options.pageSize ?? 60,
      tagId: options.tagId ?? null,
      visibility: options.visibility ?? null,
    });

    if (result.success && result.data) {
      return {
        posts: result.data.posts ?? [],
        count: result.data.count ?? 0,
      };
    }

    return { posts: [], count: 0 };
  }

  /**
   * Get post metadata (title and description) for OpenGraph images
   * No authentication required - lightweight query for OG image generation
   */
  async function getPostMetadata(
    slug: string,
    locale: string = DEFAULT_LOCALE
  ): Promise<GetMetadataResult> {
    // Try local filesystem first if localDirectory is configured
    if (localDirectory) {
      const postsDirectory = path.join(process.cwd(), localDirectory, locale);
      if (fs.existsSync(postsDirectory)) {
        const filenames = await fs.promises.readdir(postsDirectory);
        for (const filename of filenames) {
          const fullPath = path.join(postsDirectory, filename);
          try {
            const fileContents = await fs.promises.readFile(fullPath, 'utf8');
            const { data } = matter(fileContents);

            const localSlug = (data.slug || '').replace(/^\//, '').replace(/\/$/, '');
            const targetSlug = slug.replace(/^\//, '').replace(/\/$/, '');

            if (localSlug === targetSlug && data.status !== 'draft') {
              return {
                metadata: {
                  title: data.title,
                  description: data.description || null,
                  featuredImageUrl: data.featuredImageUrl || null,
                  visibility: data.visibility || 'public',
                },
              };
            }
          } catch (error) {
            console.error(`Error processing local file ${filename}:`, error);
          }
        }
      }
    }

    // Fall back to server
    const serverResult = await getPostMetadataAction({ slug, locale, postType });

    if (serverResult.success && serverResult.data?.metadata) {
      return {
        metadata: serverResult.data.metadata,
      };
    }

    return { metadata: null };
  }

  return {
    getBySlug,
    getLocalList,
    getPublishedList,
    getPostMetadata,
  };
}

// Pre-configured CMS modules for common post types
export const blogCms = createCmsModule('blog');
export const glossaryCms = createCmsModule('glossary');
