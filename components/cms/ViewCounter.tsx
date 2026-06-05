"use client";

import {
  incrementUniqueViewCountAction,
  incrementViewCountAction,
} from "@/actions/posts/views";
import { PostType } from "@/lib/db/schema";
import { useLocale } from "next-intl";
import { useEffect } from "react";

interface ViewCounterProps {
  slug: string;
  postType: PostType;
  trackView: boolean;
  trackMode: "all" | "unique";
}

export function ViewCounter({
  slug,
  postType,
  trackView,
  trackMode,
}: ViewCounterProps) {
  const locale = useLocale();

  useEffect(() => {
    if (!trackView) return;

    const track = async () => {
      if (trackMode === "unique") {
        await incrementUniqueViewCountAction({
          slug,
          postType,
          locale,
        });
      } else {
        await incrementViewCountAction({ slug, postType, locale });
      }
    };

    track();
  }, [slug, postType, trackView, trackMode, locale]);

  return null;
}
