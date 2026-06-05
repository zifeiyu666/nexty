"use client";

import CookieConsent from "@/components/shared/CookieConsent";
import { useCookieConsent } from "@/hooks/useCookieConsent";

type ConsentBannerProps = {
  variant?: "default" | "small" | "mini";
  description?: string;
  learnMoreHref?: string;
};

export default function ConsentBanner({
  variant = "default",
  description,
  learnMoreHref = "/privacy-policy",
}: ConsentBannerProps) {
  const { hasResponded, mounted, acceptConsent } = useCookieConsent();

  // Only show banner if user hasn't responded yet
  if (!mounted || hasResponded) return null;

  return (
    <CookieConsent
      variant={variant}
      description={
        description ||
        "We use cookies to ensure you get the best experience on our website. For more information on how we use cookies, please see our cookie policy."
      }
      learnMoreHref={learnMoreHref}
      onAcceptCallback={acceptConsent}
    />
  );
}
