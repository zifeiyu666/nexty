import "server-only";

import { blogCms } from "@/lib/cms";
import type { FooterLink, HeaderLink } from "@/types/common";
import type { PostBase, PublicPost } from "@/types/cms";
import { getTranslations } from "next-intl/server";
import { cache } from "react";

const ARTICLE_LINK_LIMIT = 6;
const ALL_ARTICLES_LINK: HeaderLink = {
  id: "all-articles",
  name: "all articles >",
  href: "/blog",
};

type NavigationPost = Pick<
  PostBase,
  "title" | "slug" | "status" | "isPinned" | "publishedAt"
> &
  Partial<Pick<PublicPost, "createdAt">>;

function normalizeBlogSlug(slug: string) {
  return slug
    .replace(/^\//, "")
    .replace(/^blogs\//, "")
    .replace(/^blog\//, "")
    .replace(/\/$/, "");
}

function toTime(value: Date | string | null | undefined) {
  if (!value) return 0;

  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function postTime(post: NavigationPost) {
  return toTime(post.publishedAt) || toTime(post.createdAt);
}

function isArticlesHeaderLink(link: HeaderLink) {
  return link.id === "articles" || link.name === "Articles";
}

function isArticlesFooterGroup(group: FooterLink) {
  return group.title === "Articles";
}

function withPricingPath<T extends { id?: string; href: string; items?: T[] }>(
  links: T[]
): T[] {
  const pricingPath = process.env.NEXT_PUBLIC_PRICING_PATH;

  return links.map((link) => {
    const nextLink = {
      ...link,
      href: link.id === "pricing" && pricingPath ? pricingPath : link.href,
    };

    if (!link.items) {
      return nextLink;
    }

    return {
      ...nextLink,
      items: withPricingPath(link.items),
    };
  });
}

export function withArticleHeaderLinks(
  headerLinks: HeaderLink[],
  articleLinks: HeaderLink[]
): HeaderLink[] {
  const links = withPricingPath(headerLinks);

  return links.map((link) => {
    if (!isArticlesHeaderLink(link)) {
      return link;
    }

    return {
      ...link,
      href: "/blog",
      items: articleLinks,
    };
  });
}

export function withArticleFooterLinks(
  footerLinks: FooterLink[],
  articleLinks: HeaderLink[]
): FooterLink[] {
  return footerLinks.map((group) => {
    const links = withPricingPath(group.links);

    if (!isArticlesFooterGroup(group)) {
      return {
        ...group,
        links,
      };
    }

    return {
      ...group,
      links: articleLinks,
    };
  });
}

export const getArticleNavigationLinks = cache(
  async (
    locale: string,
    limit: number = ARTICLE_LINK_LIMIT
  ): Promise<HeaderLink[]> => {
    try {
      const [{ posts: localPosts }, { posts: serverPosts }] =
        await Promise.all([
          blogCms.getLocalList(locale),
          blogCms.getPublishedList(locale, {
            pageIndex: 0,
            pageSize: limit,
          }),
        ]);

      const seenSlugs = new Set<string>();
      const articleLinks = [...localPosts, ...serverPosts]
        .filter((post) => !post.status || post.status === "published")
        .map((post) => ({
          post,
          slug: normalizeBlogSlug(post.slug),
        }))
        .filter(({ post, slug }) => {
          if (!post.title || !slug || seenSlugs.has(slug)) {
            return false;
          }

          seenSlugs.add(slug);
          return true;
        })
        .sort((a, b) => {
          if (a.post.isPinned !== b.post.isPinned) {
            return (
              Number(Boolean(b.post.isPinned)) -
              Number(Boolean(a.post.isPinned))
            );
          }

          return postTime(b.post) - postTime(a.post);
        })
        .slice(0, limit)
        .map(({ post, slug }) => ({
          name: post.title,
          href: `/blog/${slug}`,
        }));

      return [...articleLinks, ALL_ARTICLES_LINK];
    } catch (error) {
      console.error("Failed to build article navigation links:", error);
      return [ALL_ARTICLES_LINK];
    }
  }
);

export const getHeaderNavigationLinks = cache(async (locale: string) => {
  const tHeader = await getTranslations({ locale, namespace: "Header" });
  const headerLinks = tHeader.raw("links") as HeaderLink[];

  if (!headerLinks.some(isArticlesHeaderLink)) {
    return withPricingPath(headerLinks);
  }

  const articleLinks = await getArticleNavigationLinks(locale);

  return withArticleHeaderLinks(headerLinks, articleLinks);
});
