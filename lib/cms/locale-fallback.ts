import { DEFAULT_LOCALE } from "@/i18n/routing";

export function getLocaleFallbackChain(locale: string): string[] {
  return locale === DEFAULT_LOCALE
    ? [DEFAULT_LOCALE]
    : [locale, DEFAULT_LOCALE];
}

export function mergePostsWithLocaleFallback<T extends { slug: string }>(
  posts: T[],
): T[] {
  const postsBySlug = new Map<string, T>();

  for (const post of posts) {
    const normalizedSlug = post.slug.replace(/^\//, "").replace(/\/$/, "");
    if (!postsBySlug.has(normalizedSlug)) {
      postsBySlug.set(normalizedSlug, post);
    }
  }

  return Array.from(postsBySlug.values());
}
