import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV ?? "development",

    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Capture console.error calls as breadcrumbs
    integrations: [
      Sentry.consoleLoggingIntegration({ levels: ["error"] }),
    ],

    ignoreErrors: [
      // Next.js internal navigation/not-found throws — not real errors
      "NEXT_NOT_FOUND",
      "NEXT_REDIRECT",
      "ResizeObserver loop limit exceeded",
    ],

    // Skip sending to Sentry in development unless SENTRY_DEBUG=true
    beforeSend(event) {
      if (process.env.NODE_ENV === "development" && process.env.SENTRY_DEBUG !== "true") {
        return null;
      }
      return event;
    },
  });
}
