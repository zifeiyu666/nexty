import withBundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";
import { fileURLToPath } from "node:url";

const withNextIntl = createNextIntlPlugin();
const root = fileURLToPath(new URL(".", import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: async () => [
    {
      source: "/dashboard",
      destination: "/dashboard/settings",
      permanent: true,
    },
    {
      source: "/blog/personalized-happy-birthday-song",
      destination: "/blog/custom-happy-birthday-song",
      permanent: true,
    },
    {
      source: "/:locale/blog/personalized-happy-birthday-song",
      destination: "/:locale/blog/custom-happy-birthday-song",
      permanent: true,
    },
  ],
  images: {
    unoptimized:
      process.env.NEXT_PUBLIC_OPTIMIZED_IMAGES &&
      process.env.NEXT_PUBLIC_OPTIMIZED_IMAGES === "false",
    remotePatterns: [
      ...(process.env.R2_PUBLIC_URL
        ? [
            {
              hostname: process.env.R2_PUBLIC_URL.replace("https://", ""),
            },
          ]
        : []),
    ],
  },
  turbopack: {
    root,
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error"],
          }
        : false,
  },
  // Pino uses worker threads for transports — must be treated as external in Next.js
  serverExternalPackages: ["pino", "pino-pretty", "pino-roll", "thread-stream"],
};

const withBundleAnalyzerWrapper = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

if (process.env.NODE_ENV === "development" && !process.env.CUSTOMSONG_WELCOME_SHOWN) {
  console.log("\nWelcome to CustomSong.");
  console.log("Local app: http://localhost:3000\n");
  process.env.CUSTOMSONG_WELCOME_SHOWN = "true";
}

const sentryConfig = {
  // Suppress noisy Sentry CLI output during build
  silent: !process.env.CI,
  // Upload source maps only when SENTRY_AUTH_TOKEN is set
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
};

export default withSentryConfig(
  withBundleAnalyzerWrapper(withNextIntl(nextConfig)),
  sentryConfig
);
