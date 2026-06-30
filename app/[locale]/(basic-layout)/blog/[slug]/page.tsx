import { listPublishedPostsAction } from "@/actions/posts/posts";
import { getViewCountAction } from "@/actions/posts/views";
import { BlogWallArtStudioCTA } from "@/components/cms/BlogWallArtStudioCTA";
import { ContentRestrictionMessage } from "@/components/cms/ContentRestrictionMessage";
import { BlogPostCTA } from "@/components/cms/BlogPostCTA";
import { POST_CONFIGS } from "@/components/cms/post-config";
import { PostCard } from "@/components/cms/PostCard";
import { RelatedPosts } from "@/components/cms/RelatedPosts";
import { type WallArtSongOption } from "@/components/song/WallArtEditorDrawer";
import { buildSongShareUrl, getFinalSongsForOwner } from "@/lib/ai/final-song";
import { getSession } from "@/lib/auth/server";
import { ViewCounter } from "@/components/cms/ViewCounter";
import { TableOfContents } from "@/components/tiptap/TableOfContents";
import { Button } from "@/components/ui/button";
import { Link as I18nLink, Locale, LOCALES } from "@/i18n/routing";
import { blogCms } from "@/lib/cms";
import { renderPostMarkdown } from "@/lib/cms/render-markdown";
import { constructMetadata } from "@/lib/metadata";
import { PostBase } from "@/types/cms";
import dayjs from "dayjs";
import { ArrowLeftIcon, CalendarIcon, EyeIcon } from "lucide-react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { notFound } from "next/navigation";

export const dynamicParams = true;

type Params = Promise<{
  locale: string;
  slug: string;
}>;

type MetadataProps = {
  params: Params;
};

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const { metadata: postMetadata } = await blogCms.getPostMetadata(
    slug,
    locale,
  );

  if (!postMetadata) {
    return constructMetadata({
      title: "404",
      description: "Page not found",
      noIndex: true,
      locale: locale as Locale,
      path: `/blog/${slug}`,
    });
  }

  const metadataPath = slug.startsWith("/") ? slug : `/${slug}`;
  const fullPath = `/blog${metadataPath}`;

  // Detect which locales have this blog post available
  const availableLocales: string[] = [];
  for (const checkLocale of LOCALES) {
    const { metadata: localeMetadata } = await blogCms.getPostMetadata(
      slug,
      checkLocale,
    );
    if (localeMetadata) {
      availableLocales.push(checkLocale);
    }
  }

  return constructMetadata({
    title: postMetadata.title,
    description: postMetadata.description || undefined,
    images: postMetadata.featuredImageUrl
      ? [postMetadata.featuredImageUrl]
      : undefined,
    locale: locale as Locale,
    path: fullPath,
    noIndex: postMetadata.visibility !== "public",
    availableLocales:
      availableLocales.length > 0 ? availableLocales : undefined,
    useDefaultOgImage: false, // Use dynamic opengraph-image.tsx when no featured image
  });
}

export default async function BlogPage({ params }: { params: Params }) {
  const { slug, locale } = await params;
  const t = await getTranslations("Blogs");
  const session = await getSession();

  const { post, errorCode } = await blogCms.getBySlug(slug, locale);

  if (!post) {
    notFound();
  }

  const isWallArtStudioPost = slug === "custom-song-lyric-gifts";
  const finalSongs =
    isWallArtStudioPost && session?.user
      ? await getFinalSongsForOwner(session.user.id)
      : [];
  const wallArtSongOptions: WallArtSongOption[] = finalSongs.map((song) => ({
    id: song.id,
    title: song.title,
    lyrics: song.lyrics,
    imageUrl: song.imageUrl,
    shareUrl: buildSongShareUrl(song),
  }));

  // View count tracking
  const viewCountConfig = POST_CONFIGS.blog.viewCount;
  let viewCount = 0;

  if (viewCountConfig.enabled && viewCountConfig.showInUI) {
    // Only get view count for display, incrementing is done in Client Component
    const viewCountResult = await getViewCountAction({
      slug,
      postType: "blog",
      locale,
    });
    viewCount =
      viewCountResult.success && viewCountResult.data?.count
        ? viewCountResult.data.count
        : 0;
  }

  let showRestrictionMessageInsteadOfContent = false;
  let messageTitle = "";
  let messageContent = "";
  let actionText = "";
  let actionLink = "";

  if (errorCode) {
    showRestrictionMessageInsteadOfContent = true;
    const redirectUrl = `/blog/${slug}`;

    if (errorCode === "unauthorized") {
      messageTitle = t("BlogDetail.accessRestricted");
      messageContent = t("BlogDetail.unauthorized");
      actionText = t("BlogDetail.signIn");
      actionLink = `/login?next=${encodeURIComponent(redirectUrl)}`;
    } else if (errorCode === "notSubscriber") {
      messageTitle = t("BlogDetail.premium");
      messageContent = t("BlogDetail.premiumContent");
      actionText = t("BlogDetail.upgrade");
      actionLink = process.env.NEXT_PUBLIC_PRICING_PATH!;
    }
  }

  const tagsArray = post.tags
    ? post.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag)
    : [];

  const getVisibilityInfo = () => {
    switch (post.visibility) {
      case "subscribers":
        return {
          label: "Subscribers Only",
          bgColor: "bg-purple-600",
        };
      case "logged_in":
        return {
          label: "Members Only",
          bgColor: "bg-blue-600",
        };
      default:
        return {
          label: "Public",
          bgColor: "bg-green-600",
        };
    }
  };

  const visibilityInfo = getVisibilityInfo();

  const contentHtml =
    !showRestrictionMessageInsteadOfContent && post.content
      ? await renderPostMarkdown(post.content)
      : "";

  return (
    <div className="w-full">
      <ViewCounter
        slug={slug}
        postType="blog"
        trackView={viewCountConfig.enabled}
        trackMode={viewCountConfig.mode}
      />

      <header className="w-full border-b border-[#eadfd4] bg-[#f8f4f0]">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:px-8 lg:py-14">
          <div className="max-w-3xl">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="group mb-5 -ml-3 rounded-full text-[#4b3456] hover:bg-white/70 hover:text-[#2b1038]"
            >
              <I18nLink
                href="/blog"
                title={t("BlogDetail.backToBlogs")}
                prefetch={false}
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                {t("BlogDetail.backToBlogs")}
              </I18nLink>
            </Button>

            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium text-[#604769] sm:text-sm">
              {post.visibility !== "public" && (
                <span
                  className={`${visibilityInfo.bgColor} inline-flex rounded-full px-3 py-1 text-xs text-white`}
                >
                  {visibilityInfo.label}
                </span>
              )}
              {viewCountConfig.enabled &&
                viewCountConfig.showInUI &&
                viewCount > 0 && (
                  <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 shadow-sm shadow-stone-900/5">
                    <EyeIcon className="mr-2 h-4 w-4" />
                    {t("BlogDetail.viewCount", { count: viewCount })}
                  </span>
                )}
              {post.isPinned && (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-800 shadow-sm shadow-stone-900/5">
                  {t("BlogDetail.featured")}
                </span>
              )}
            </div>

            <h1 className="max-w-4xl text-balance text-3xl font-bold leading-tight tracking-normal text-[#32103f] sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            {post.description && (
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#63536b] sm:text-lg">
                {post.description}
              </p>
            )}
          </div>

          <div className="flex lg:justify-end">
            <div className="inline-flex items-center rounded-full border border-white/80 bg-white px-4 py-2 text-sm font-semibold text-[#2b1038] shadow-[0_12px_30px_rgba(58,37,24,0.08)]">
              <CalendarIcon className="mr-2 h-4 w-4 text-[#7a647f]" />
              {dayjs(post.publishedAt).format("MMMM D, YYYY")}
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        {post.featuredImageUrl && (
          <div className="relative mb-12 aspect-video overflow-hidden rounded-2xl shadow-[0_24px_70px_rgba(50,16,63,0.14)] ring-1 ring-black/5">
            <Image
              src={post.featuredImageUrl}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              priority
              className="object-cover"
            />
          </div>
        )}

        {tagsArray.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-2">
            {tagsArray.map((tag) => (
              <div
                key={tag}
                className="rounded-full bg-secondary/80 px-3 py-1 text-sm font-medium transition-colors hover:bg-secondary"
              >
                {tag}
              </div>
            ))}
          </div>
        )}

        {post.content && (
          <div className="mb-10">
            <TableOfContents content={post.content} mobile />
          </div>
        )}

        {showRestrictionMessageInsteadOfContent ? (
          <ContentRestrictionMessage
            title={messageTitle}
            message={messageContent}
            actionText={actionText}
            actionLink={actionLink}
            backText={t("BlogDetail.backToBlogs")}
            backLink={`/blog`}
          />
        ) : contentHtml ? (
          <>
            <article
              className="prose dark:prose-invert mx-auto max-w-[68ch] prose-p:my-5 prose-p:leading-8 prose-headings:font-semibold prose-headings:tracking-tight prose-h1:text-3xl prose-h2:mt-12 prose-h2:text-3xl prose-h3:text-2xl prose-li:my-1 prose-blockquote:not-italic prose-blockquote:font-normal prose-blockquote:text-muted-foreground prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-table:my-10 prose-table:block prose-table:w-full prose-table:min-w-full prose-table:overflow-x-auto prose-table:border-separate prose-table:border-spacing-0 prose-table:text-sm prose-thead:bg-[#f8f4f0] prose-th:min-w-44 prose-th:border-b prose-th:border-[#d8d2cc] prose-th:px-5 prose-th:py-4 prose-th:text-left prose-th:text-sm prose-th:font-semibold prose-th:leading-6 prose-th:text-[#1f2937] prose-td:min-w-44 prose-td:border-b prose-td:border-[#e6e1dc] prose-td:px-5 prose-td:py-4 prose-td:align-top prose-td:leading-7 prose-td:text-[#374151] [&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none [&_table]:rounded-xl [&_table]:border [&_table]:border-[#e6e1dc] [&_tbody_tr:nth-child(even)]:bg-[#fbfaf8] [&_tbody_tr:last-child_td]:border-b-0 [&_td_p]:my-0 [&_th:first-child]:rounded-tl-xl [&_th:last-child]:rounded-tr-xl [&_th_p]:my-0 [&_thead+tbody_tr:first-child_td]:border-t-0 lg:prose-lg lg:prose-p:leading-9"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
            {isWallArtStudioPost ? (
              <BlogWallArtStudioCTA
                isAuthenticated={Boolean(session?.user)}
                songOptions={wallArtSongOptions}
              />
            ) : null}
            <BlogPostCTA />
          </>
        ) : null}

        {/* Related Posts */}
        {post.id && (
          <RelatedPosts
            postId={post.id}
            postType="blog"
            limit={10}
            title="Related Posts"
            locale={locale}
            CardComponent={BlogPostCard}
          />
        )}
      </section>
    </div>
  );
}

const BlogPostCard = ({ post }: { post: PostBase }) => (
  <PostCard post={post} baseUrl="/blog" />
);

export async function generateStaticParams() {
  const allParams: { locale: string; slug: string }[] = [];

  for (const locale of LOCALES) {
    const { posts: localPosts } = await blogCms.getLocalList(locale);
    localPosts
      .filter((post) => post.slug && post.status !== "draft")
      .forEach((post) => {
        const slugPart = post.slug.replace(/^\//, "").replace(/^blogs\//, "");
        if (slugPart) {
          allParams.push({ locale, slug: slugPart });
        }
      });
  }

  for (const locale of LOCALES) {
    const serverResult = await listPublishedPostsAction({
      locale: locale,
      pageSize: 1000,
      postType: "blog",
    });
    if (serverResult.success && serverResult.data?.posts) {
      serverResult.data.posts.forEach((post) => {
        const slugPart = post.slug?.replace(/^\//, "").replace(/^blogs\//, "");
        if (slugPart) {
          allParams.push({ locale, slug: slugPart });
        }
      });
    }
  }

  const uniqueParams = Array.from(
    new Map(allParams.map((p) => [`${p.locale}-${p.slug}`, p])).values(),
  );
  // console.log("Generated Static Params:", uniqueParams.slice(0, 10), "...");
  return uniqueParams;
}
