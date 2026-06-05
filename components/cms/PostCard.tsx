import { Link as I18nLink } from "@/i18n/routing";
import { PostBase } from "@/types/cms";
import dayjs from "dayjs";
import {
  ArrowRightIcon,
  EyeIcon,
  LockIcon,
  PinIcon,
  UserIcon,
} from "lucide-react";
import Image from "next/image";

interface PostCardProps {
  post: PostBase;
  baseUrl: string;
  showDescription?: boolean;
  showCover?: boolean;
}

function getVisibilityInfo(visibility: string) {
  switch (visibility) {
    case "subscribers":
      return {
        label: "Subscribers",
        icon: <LockIcon className="h-3 w-3" />,
        bgColor: "bg-purple-600/90",
        borderColor: "from-purple-500 to-purple-600",
      };
    case "logged_in":
      return {
        label: "Members",
        icon: <UserIcon className="h-3 w-3" />,
        bgColor: "bg-blue-600/90",
        borderColor: "from-blue-500 to-blue-600",
      };
    default:
      return {
        label: "Public",
        icon: <EyeIcon className="h-3 w-3" />,
        bgColor: "bg-green-600/90",
        borderColor: "from-primary to-primary/70",
      };
  }
}

function PostCardCover({
  post,
  baseUrl,
  showDescription,
}: Omit<PostCardProps, "showCover">) {
  const visibilityInfo = getVisibilityInfo(post.visibility || "public");

  return (
    <I18nLink
      href={`${baseUrl}/${post.slug}`}
      title={post.title}
      prefetch={false}
      className="group block h-full focus:outline-none"
    >
      <div className="bg-card border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 h-full flex flex-col">
        <div className="relative w-full overflow-hidden aspect-video shrink-0">
          <Image
            src={post.featuredImageUrl || "/placeholder.svg"}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute top-3 right-3 flex gap-2">
            {post.isPinned && (
              <div
                className="bg-amber-500/90 text-white rounded-full p-1.5"
                title="Pinned Post"
              >
                <PinIcon className="h-3.5 w-3.5" />
              </div>
            )}
            <div
              className={`${visibilityInfo.bgColor} text-white text-xs px-2 py-1 rounded-full flex items-center gap-1`}
              title={visibilityInfo.label}
            >
              {visibilityInfo.icon}
              <span className="text-xs">{visibilityInfo.label}</span>
            </div>
          </div>

          <div className="absolute bottom-3 left-3 bg-slate-900/80 text-white text-xs px-2.5 py-1 rounded-full">
            {dayjs(post.publishedAt).format("MMM D, YYYY")}
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <h2 className="text-lg font-medium line-clamp-2 group-hover:text-primary transition-colors mb-2">
            {post.title}
          </h2>

          {showDescription && post.description && (
            <p className="text-muted-foreground text-sm line-clamp-2 mt-auto">
              {post.description}
            </p>
          )}
        </div>
      </div>
    </I18nLink>
  );
}

function PostCardCompact({
  post,
  baseUrl,
  showDescription,
}: Omit<PostCardProps, "showCover">) {
  const visibilityInfo = getVisibilityInfo(post.visibility || "public");

  return (
    <I18nLink
      href={`${baseUrl}/${post.slug}`}
      title={post.title}
      prefetch={false}
      className="group block w-full focus:outline-none"
    >
      <article className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 p-4 rounded-lg hover:bg-muted/40 border border-transparent hover:border-border/40 transition-all duration-200 group-hover:scale-[1.005]">
        {/* Date & Meta - Fixed width on desktop */}
        <div className="flex items-center gap-3 sm:w-32 sm:shrink-0 text-xs text-muted-foreground/70">
          <time dateTime={post.publishedAt.toISOString()} className="font-mono">
            {dayjs(post.publishedAt).format("MMM D, YYYY")}
          </time>
        </div>

        {/* Content - Flexible */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <h2 className="flex items-center gap-2 text-base sm:text-lg font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {post.title}
            {post.isPinned && (
              <PinIcon className="h-3.5 w-3.5 text-amber-500/80" />
            )}
            {post.visibility !== "public" && (
              <div
                title={visibilityInfo.label}
                className="text-muted-foreground"
              >
                {visibilityInfo.icon}
              </div>
            )}
          </h2>

          {showDescription && post.description && (
            <p className="text-muted-foreground text-sm line-clamp-2 mt-auto">
              {post.description}
            </p>
          )}
        </div>

        {/* Status Icons - Right side */}
        <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <ArrowRightIcon className="h-4 w-4 text-muted-foreground/50 -translate-x-1 group-hover:translate-x-0 transition-transform" />
        </div>
      </article>
    </I18nLink>
  );
}

export function PostCard({
  post,
  baseUrl,
  showDescription = true,
  showCover = true,
}: PostCardProps) {
  if (showCover) {
    return (
      <PostCardCover
        post={post}
        baseUrl={baseUrl}
        showDescription={showDescription}
      />
    );
  }

  return (
    <PostCardCompact
      post={post}
      baseUrl={baseUrl}
      showDescription={showDescription}
    />
  );
}
