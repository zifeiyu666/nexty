"use client";

import { Button } from "@/components/ui/button";
import { useCookieConsent } from "@/hooks/useCookieConsent";

export default function CookieManagementSection() {
  const { consented, hasResponded, mounted, acceptConsent, revokeConsent } =
    useCookieConsent();
  const COOKIE_CONSENT_ENABLED =
    process.env.NEXT_PUBLIC_COOKIE_CONSENT_ENABLED === "true";

  if (!COOKIE_CONSENT_ENABLED || !mounted) return null;

  // Determine display status
  const getStatusText = () => {
    if (!hasResponded) return "Not Set";
    return consented ? "Cookies Accepted" : "Cookies Declined";
  };

  const getStatusColor = () => {
    if (!hasResponded) return "text-blue-600";
    return consented ? "text-green-600" : "text-orange-600";
  };

  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">Cookie Preferences</h2>
      <div className="mb-4 p-4 bg-secondary/20 rounded-lg border">
        <p className="mb-3">
          <strong>Current Status:</strong>{" "}
          <span className={getStatusColor()}>{getStatusText()}</span>
        </p>
        <p className="mb-3 text-sm text-muted-foreground">
          You can change your cookie preferences at any time by using the
          buttons below.
        </p>
        <div className="flex gap-2">
          <Button
            onClick={acceptConsent}
            variant={consented === true ? "secondary" : "default"}
            size="sm"
          >
            Accept Cookies
          </Button>
          <Button
            onClick={revokeConsent}
            variant={consented === false ? "secondary" : "outline"}
            size="sm"
          >
            Decline Cookies
          </Button>
        </div>
      </div>
    </section>
  );
}
