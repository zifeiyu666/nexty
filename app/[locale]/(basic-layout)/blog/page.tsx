import { listPublishedPostsAction } from "@/actions/posts/posts";
import { POST_CONFIGS } from "@/components/cms/post-config";
import { PostList } from "@/components/cms/PostList";
import { PageHero } from "@/components/shared/PageHero";
import { Locale } from "@/i18n/routing";
import { blogCms } from "@/lib/cms";
import { constructMetadata } from "@/lib/metadata";
import { BookOpenText, TextSearch } from "lucide-react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const revalidate = 60;

type Params = Promise<{ locale: string }>;

type MetadataProps = {
  params: Params;
};

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blogs" });

  return constructMetadata({
    title: t("title"),
    description: t("description"),
    locale: locale as Locale,
    path: `/blog`,
    availableLocales: ["en"],
    noIndex: locale !== "en",
  });
}

const SERVER_POST_PAGE_SIZE = 48;

export default async function Page({ params }: { params: Params }) {
  const { locale } = await params;
  const t = await getTranslations("Blogs");

  const { posts: localPosts } = await blogCms.getLocalList(locale);

  const initialServerPostsResult = await listPublishedPostsAction({
    pageIndex: 0,
    pageSize: SERVER_POST_PAGE_SIZE,
    postType: "blog",
    locale: locale,
  });

  const initialServerPosts =
    initialServerPostsResult.success && initialServerPostsResult.data?.posts
      ? initialServerPostsResult.data.posts
      : [];
  const totalServerPosts =
    initialServerPostsResult.success && initialServerPostsResult.data?.count
      ? initialServerPostsResult.data.count
      : 0;

  if (!initialServerPostsResult.success) {
    console.error(
      "Failed to fetch initial server posts:",
      initialServerPostsResult.error
    );
  }

  const noPostsFound =
    localPosts.length === 0 && initialServerPosts.length === 0;

  return (
    <main className="min-h-screen w-full bg-[#fbfaf7] text-foreground">
      <PageHero
        badge={{
          icon: <BookOpenText className="size-4" />,
          label: t("heroBadge"),
        }}
        backgroundClassName="bg-[#f3eadf]"
        description={t("description")}
        titleLines={[t("heroTitleLine1"), t("heroTitleLine2")]}
      />

      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        {noPostsFound ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <TextSearch className="mb-4 h-16 w-16 text-gray-400" />
            <h2 className="mb-2 text-2xl font-semibold">
              {t("emptyState.title") || "No blog posts"}
            </h2>
            <p className="max-w-md text-gray-500">
              {t("emptyState.description") ||
                "We are creating exciting content, please stay tuned!"}
            </p>
          </div>
        ) : (
          <PostList
            postType="blog"
            baseUrl="/blog"
            localPosts={localPosts}
            initialPosts={initialServerPosts}
            initialTotal={totalServerPosts}
            locale={locale}
            pageSize={SERVER_POST_PAGE_SIZE}
            showTagSelector={false}
            showCover={POST_CONFIGS.blog.showCoverInList}
            gridClassName="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
            cardClassName="max-w-none"
            coverClassName="aspect-[16/9] max-h-56"
            contentClassName="p-4 sm:p-4"
            titleClassName="text-base sm:text-lg leading-snug"
            showPublicVisibilityBadge={false}
            emptyMessage={t("emptyMessage")}
          />
        )}
      </section>
    </main>
  );
}
