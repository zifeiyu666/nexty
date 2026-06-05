"use client";

import Cookies from "js-cookie";
import { useCallback, useEffect, useState } from "react";

/**
 * Cookie consent states:
 * - "true": User explicitly accepted cookies
 * - "false": User explicitly declined cookies
 * - undefined/not set: User hasn't responded yet (treated as implicit consent for tracking)
 */
export function useCookieConsent() {
  const [consented, setConsented] = useState<boolean | null>(null);
  const [hasResponded, setHasResponded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const consent = Cookies.get("cookieConsent");
      if (consent === "true") {
        setConsented(true);
        setHasResponded(true);
      } else if (consent === "false") {
        setConsented(false);
        setHasResponded(true);
      } else {
        setConsented(null);
        setHasResponded(false);
      }
    } catch {
      setConsented(null);
      setHasResponded(false);
    }
  }, []);

  const acceptConsent = useCallback(() => {
    Cookies.set("cookieConsent", "true", {
      expires: 365,
      path: "/",
      sameSite: "lax",
    });
    setConsented(true);
    setHasResponded(true);
  }, []);

  const revokeConsent = useCallback(() => {
    // Set to "false" instead of removing - this explicitly marks as declined
    Cookies.set("cookieConsent", "false", {
      expires: 365,
      path: "/",
      sameSite: "lax",
    });
    setConsented(false);
    setHasResponded(true);
  }, []);

  return { consented, hasResponded, mounted, acceptConsent, revokeConsent };
}


