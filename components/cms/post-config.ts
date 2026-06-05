import {
  BLOGS_IMAGE_PATH,
  GLOSSARY_IMAGE_PATH
} from "@/config/common";
import { PostType } from "@/lib/db/schema";
import { z } from "zod";

export const tagSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

export const basePostSchema = z.object({
  language: z.string().min(1, { message: "Language is required" }),
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters." }),
  slug: z.string().min(3, { message: "Slug must be at least 3 characters." }),
  content: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(tagSchema).optional(),
  featuredImageUrl: z
    .string()
    .url({ message: "Featured image must be a valid URL if provided." })
    .optional()
    .or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]),
  visibility: z.enum(["public", "logged_in", "subscribers"]),
  isPinned: z.boolean().optional(),
});

export const postActionSchema = basePostSchema.extend({
  id: z.string().uuid().optional(),
});

export interface ViewCountConfig {
  /** Enable view count tracking - default off */
  enabled: boolean;
  /** Counting mode: 'all' = count every page load, 'unique' = same IP counts once per hour */
  mode: 'all' | 'unique';
  /** Whether to display view count in the UI */
  showInUI: boolean;
}

export interface PostConfig {
  postType: PostType;
  schema: z.ZodSchema;
  actionSchema: z.ZodSchema;
  imagePath: string;
  enableTags: boolean;
  /** Local directory for markdown files (relative to project root), undefined if server-only */
  localDirectory?: string;
  /** View count configuration */
  viewCount: ViewCountConfig;
  /** Whether to show cover image in list page - default true */
  showCoverInList: boolean;
  routes: {
    list: string;
    create: string;
    edit: (id: string) => string;
  };
}

export const POST_CONFIGS: Record<PostType, PostConfig> = {
  blog: {
    postType: "blog",
    schema: basePostSchema,
    actionSchema: postActionSchema,
    imagePath: BLOGS_IMAGE_PATH,
    enableTags: true,
    localDirectory: 'blogs',
    viewCount: {
      enabled: false, // Set to true to enable view count tracking
      mode: 'all',
      showInUI: true,
    },
    showCoverInList: true,
    routes: {
      list: "/dashboard/blogs",
      create: "/dashboard/blogs/new",
      edit: (id: string) => `/dashboard/blogs/${id}`,
    },
  },
  glossary: {
    postType: "glossary",
    schema: basePostSchema,
    actionSchema: postActionSchema,
    imagePath: GLOSSARY_IMAGE_PATH,
    enableTags: true,
    viewCount: {
      enabled: false, // Set to true to enable view count tracking
      mode: 'all',
      showInUI: true,
    },
    showCoverInList: false,
    routes: {
      list: "/dashboard/glossary",
      create: "/dashboard/glossary/new",
      edit: (id: string) => `/dashboard/glossary/${id}`,
    },
  },
};

// Helper function to get config by content type
export function getPostConfig(postType: PostType): PostConfig {
  return POST_CONFIGS[postType];
}

