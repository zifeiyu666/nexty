"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!posthogKey || !posthogHost) {
    return <>{children}</>;
  }

  useEffect(() => {
    if (posthogKey && posthogHost) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        person_profiles: "identified_only",
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: true,
      });
    }
  }, [posthogKey, posthogHost]);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
