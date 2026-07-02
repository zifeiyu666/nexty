import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  buildRemotionWebhook,
  getRemotionLambdaConfig,
} from "@/lib/music-video/remotion-lambda";

describe("remotion lambda config", () => {
  test("builds a signed music video webhook with custom video data", () => {
    const webhook = buildRemotionWebhook({
      env: {
        WEBHOOK_BASE_URL: "https://customsong.top/",
        REMOTION_WEBHOOK_SECRET: "secret-value",
      },
      videoId: "mv-123",
    });

    assert.deepEqual(webhook, {
      customData: { videoId: "mv-123" },
      secret: "secret-value",
      url: "https://customsong.top/api/webhooks/remotion/music-video",
    });
  });

  test("requires a webhook secret for music video renders", () => {
    assert.throws(
      () =>
        getRemotionLambdaConfig({
          env: {
            WEBHOOK_BASE_URL: "https://customsong.top",
            REMOTION_AWS_REGION: "us-east-1",
            REMOTION_FUNCTION_NAME: "remotion-render",
            REMOTION_SERVE_URL: "https://bucket.s3.us-east-1.amazonaws.com/index.html",
          },
        }),
      /REMOTION_WEBHOOK_SECRET is required/,
    );
  });

  test("uses configured remotion concurrency when provided", () => {
    const config = getRemotionLambdaConfig({
      env: {
        REMOTION_AWS_REGION: "us-east-1",
        REMOTION_CONCURRENCY: "180",
        REMOTION_FUNCTION_NAME: "remotion-render",
        REMOTION_SERVE_URL: "https://bucket.s3.us-east-1.amazonaws.com/index.html",
        REMOTION_WEBHOOK_SECRET: "secret-value",
      },
    });

    assert.equal(config.concurrency, 180);
  });

  test("uses a conservative default remotion concurrency when not configured", () => {
    const config = getRemotionLambdaConfig({
      env: {
        REMOTION_AWS_REGION: "us-east-1",
        REMOTION_FUNCTION_NAME: "remotion-render",
        REMOTION_SERVE_URL: "https://bucket.s3.us-east-1.amazonaws.com/index.html",
        REMOTION_WEBHOOK_SECRET: "secret-value",
      },
    });

    assert.equal(config.concurrency, 100);
  });

  test("caps configured remotion concurrency to the application safety limit", () => {
    const config = getRemotionLambdaConfig({
      env: {
        REMOTION_AWS_REGION: "us-east-1",
        REMOTION_CONCURRENCY: "999",
        REMOTION_FUNCTION_NAME: "remotion-render",
        REMOTION_SERVE_URL: "https://bucket.s3.us-east-1.amazonaws.com/index.html",
        REMOTION_WEBHOOK_SECRET: "secret-value",
      },
    });

    assert.equal(config.concurrency, 300);
  });

  test("requires WEBHOOK_BASE_URL for music video webhooks", () => {
    assert.throws(
      () =>
        buildRemotionWebhook({
          env: {
            NEXT_PUBLIC_SITE_URL: "https://customsong.top",
            REMOTION_WEBHOOK_SECRET: "secret-value",
          },
          videoId: "mv-123",
        }),
      /WEBHOOK_BASE_URL is required/,
    );
  });
});
