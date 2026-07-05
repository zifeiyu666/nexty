import { listPublishedPostsAction } from '@/actions/posts/posts'
import { siteConfig } from '@/config/site'
import { DEFAULT_LOCALE, LOCALES } from '@/i18n/routing'
import { blogCms } from '@/lib/cms'
import { db } from '@/lib/db'
import { posts as postsSchema } from '@/lib/db/schema'
import { eq, max } from 'drizzle-orm'
import { MetadataRoute } from 'next'

const siteUrl = siteConfig.url

const STATIC_PAGE_MTIME = new Date(new Date().getFullYear(), 0, 1)

type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' | undefined

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    '',
    '/pricing',
    '/create-song',
    '/free-custom-song-lyric-gifts',
    '/occasions/custom-happy-birthday-song',
    '/occasions/anniversary',
    '/music/personalized-gift',
    '/privacy-policy',
    '/terms-of-service',
    '/refund-policy',
  ]

  const pages = LOCALES.flatMap(locale => {
    return staticPages.map(page => ({
      url: `${siteUrl}${locale === DEFAULT_LOCALE ? '' : `/${locale}`}${page}`,
      lastModified: STATIC_PAGE_MTIME,
      changeFrequency: 'daily' as ChangeFrequency,
      priority: page === '' ? 1.0 : 0.8,
    }))
  })

  const [latestGlossaryResult] = await db
    .select({ latest: max(postsSchema.updatedAt) })
    .from(postsSchema)
    .where(eq(postsSchema.postType, 'glossary'));
  const glossaryContentMtime = latestGlossaryResult?.latest
    ? new Date(latestGlossaryResult.latest)
    : STATIC_PAGE_MTIME;

  const allBlogSitemapEntries: MetadataRoute.Sitemap = [];

  const [latestBlogResult] = await db
    .select({ latest: max(postsSchema.updatedAt) })
    .from(postsSchema)
    .where(eq(postsSchema.postType, 'blog'));
  const blogContentMtime = latestBlogResult?.latest
    ? new Date(latestBlogResult.latest)
    : STATIC_PAGE_MTIME;

  // Add blog list page
  for (const locale of LOCALES) {
    allBlogSitemapEntries.push({
      url: `${siteUrl}${locale === DEFAULT_LOCALE ? '' : `/${locale}`}/blog`,
      lastModified: blogContentMtime,
      changeFrequency: 'daily' as ChangeFrequency,
      priority: 0.8,
    });
  }

  for (const locale of LOCALES) {
    const { posts: localPosts } = await blogCms.getLocalList(locale);
    localPosts
      .filter((post) => post.slug && post.status !== "draft")
      .forEach((post) => {
        const slugPart = post.slug.replace(/^\//, "").replace(/^blogs\//, "");
        if (slugPart) {
          allBlogSitemapEntries.push({
            url: `${siteUrl}${locale === DEFAULT_LOCALE ? '' : `/${locale}`}/blog/${slugPart}`,
            lastModified: post.metadata?.updatedAt || post.publishedAt || new Date(),
            changeFrequency: 'daily' as ChangeFrequency,
            priority: 0.7,
          });
        }
      });
  }

  for (const locale of LOCALES) {
    const serverResult = await listPublishedPostsAction({
      locale: locale,
      pageSize: 1000,
      visibility: "public",
      postType: "blog",
    });
    if (serverResult.success && serverResult.data?.posts) {
      serverResult.data.posts.forEach((post) => {
        const slugPart = post.slug?.replace(/^\//, "").replace(/^blogs\//, "");
        if (slugPart) {
          allBlogSitemapEntries.push({
            url: `${siteUrl}${locale === DEFAULT_LOCALE ? '' : `/${locale}`}/blog/${slugPart}`,
            lastModified: post.publishedAt || new Date(),
            changeFrequency: 'daily' as ChangeFrequency,
            priority: 0.7,
          });
        }
      });
    }
  }

  const uniqueBlogPostEntries = Array.from(
    new Map(allBlogSitemapEntries.map((entry) => [entry.url, entry])).values()
  );

  const allGlossarySitemapEntries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    allGlossarySitemapEntries.push({
      url: `${siteUrl}${locale === DEFAULT_LOCALE ? '' : `/${locale}`}/glossary`,
      lastModified: glossaryContentMtime,
      changeFrequency: 'daily' as ChangeFrequency,
      priority: 0.8,
    });
  }

  for (const locale of LOCALES) {
    const serverResult = await listPublishedPostsAction({
      locale: locale,
      pageSize: 1000,
      visibility: "public",
      postType: "glossary",
    });
    if (serverResult.success && serverResult.data?.posts) {
      serverResult.data.posts.forEach((post) => {
        const slugPart = post.slug?.replace(/^\//, "").replace(/^glossary\//, "");
        if (slugPart) {
          allGlossarySitemapEntries.push({
            url: `${siteUrl}${locale === DEFAULT_LOCALE ? '' : `/${locale}`}/glossary/${slugPart}`,
            lastModified: post.publishedAt || new Date(),
            changeFrequency: 'daily' as ChangeFrequency,
            priority: 0.7,
          });
        }
      });
    }
  }

  const uniqueGlossaryEntries = Array.from(
    new Map(allGlossarySitemapEntries.map((entry) => [entry.url, entry])).values()
  );

  return [
    ...pages,
    ...uniqueBlogPostEntries,
    ...uniqueGlossaryEntries,
  ]
}
