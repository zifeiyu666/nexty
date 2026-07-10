import { listPublishedPostsAction } from '@/actions/posts/posts'
import { siteConfig } from '@/config/site'
import { DEFAULT_LOCALE, LOCALES } from '@/i18n/routing'
import { blogCms } from '@/lib/cms'
import { db } from '@/lib/db'
import { posts as postsSchema } from '@/lib/db/schema'
import { getAllPlaylistPaths } from '@/lib/playlists/catalog'
import { eq, max } from 'drizzle-orm'
import { MetadataRoute } from 'next'

const siteUrl = siteConfig.url

type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' | undefined

const staticPages: {
  path: string
  lastModified: string
  changeFrequency: ChangeFrequency
  priority: number
}[] = [
  {
    path: '',
    lastModified: '2026-07-08',
    changeFrequency: 'weekly',
    priority: 1.0,
  },
  {
    path: '/pricing',
    lastModified: '2026-07-08',
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    path: '/create-song',
    lastModified: '2026-07-08',
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    path: '/free-custom-song-lyric-gifts',
    lastModified: '2026-07-08',
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    path: '/occasions/custom-happy-birthday-song',
    lastModified: '2026-07-08',
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    path: '/occasions/anniversary',
    lastModified: '2026-07-08',
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    path: '/music/personalized-gift',
    lastModified: '2026-07-08',
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  ...getAllPlaylistPaths().map((path) => ({
    path,
    lastModified: '2026-07-09',
    changeFrequency: 'weekly' as ChangeFrequency,
    priority: path === '/playlists' ? 0.85 : 0.75,
  })),
  {
    path: '/privacy-policy',
    lastModified: '2026-07-08',
    changeFrequency: 'yearly',
    priority: 0.8,
  },
  {
    path: '/terms-of-service',
    lastModified: '2026-07-08',
    changeFrequency: 'yearly',
    priority: 0.8,
  },
  {
    path: '/refund-policy',
    lastModified: '2026-07-08',
    changeFrequency: 'yearly',
    priority: 0.8,
  },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = LOCALES.flatMap(locale => {
    return staticPages.map(page => ({
      url: `${siteUrl}${locale === DEFAULT_LOCALE ? '' : `/${locale}`}${page.path}`,
      lastModified: new Date(page.lastModified),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }))
  })

  const [latestGlossaryResult] = await db
    .select({ latest: max(postsSchema.updatedAt) })
    .from(postsSchema)
    .where(eq(postsSchema.postType, 'glossary'));
  const glossaryContentMtime = latestGlossaryResult?.latest
    ? new Date(latestGlossaryResult.latest)
    : new Date(staticPages[0].lastModified);

  const allBlogSitemapEntries: MetadataRoute.Sitemap = [];

  const [latestBlogResult] = await db
    .select({ latest: max(postsSchema.updatedAt) })
    .from(postsSchema)
    .where(eq(postsSchema.postType, 'blog'));
  const blogContentMtime = latestBlogResult?.latest
    ? new Date(latestBlogResult.latest)
    : new Date(staticPages[0].lastModified);

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
