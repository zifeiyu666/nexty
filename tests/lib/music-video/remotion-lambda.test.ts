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

  test("uses web-friendly default remotion encoding settings", () => {
    const config = getRemotionLambdaConfig({
      env: {
        REMOTION_AWS_REGION: "us-east-1",
        REMOTION_FUNCTION_NAME: "remotion-render",
        REMOTION_SERVE_URL: "https://bucket.s3.us-east-1.amazonaws.com/index.html",
        REMOTION_WEBHOOK_SECRET: "secret-value",
      },
    });

    assert.equal(config.audioBitrate, "192k");
    assert.equal(config.crf, 24);
    assert.equal(config.videoBitrate, undefined);
    assert.equal(config.x264Preset, "medium");
  });

  test("allows remotion encoding settings to be configured", () => {
    const config = getRemotionLambdaConfig({
      env: {
        REMOTION_AUDIO_BITRATE: "160k",
        REMOTION_AWS_REGION: "us-east-1",
        REMOTION_FUNCTION_NAME: "remotion-render",
        REMOTION_SERVE_URL: "https://bucket.s3.us-east-1.amazonaws.com/index.html",
        REMOTION_VIDEO_CRF: "27",
        REMOTION_WEBHOOK_SECRET: "secret-value",
        REMOTION_X264_PRESET: "slow",
      },
    });

    assert.equal(config.audioBitrate, "160k");
    assert.equal(config.crf, 27);
    assert.equal(config.videoBitrate, undefined);
    assert.equal(config.x264Preset, "slow");
  });

  test("uses fixed video bitrate instead of crf when configured", () => {
    const config = getRemotionLambdaConfig({
      env: {
        REMOTION_AWS_REGION: "us-east-1",
        REMOTION_FUNCTION_NAME: "remotion-render",
        REMOTION_SERVE_URL: "https://bucket.s3.us-east-1.amazonaws.com/index.html",
        REMOTION_VIDEO_BITRATE: "3500k",
        REMOTION_VIDEO_CRF: "27",
        REMOTION_WEBHOOK_SECRET: "secret-value",
      },
    });

    assert.equal(config.crf, undefined);
    assert.equal(config.videoBitrate, "3500k");
  });

  test("falls back to safe defaults for invalid remotion encoding settings", () => {
    const config = getRemotionLambdaConfig({
      env: {
        REMOTION_AWS_REGION: "us-east-1",
        REMOTION_FUNCTION_NAME: "remotion-render",
        REMOTION_SERVE_URL: "https://bucket.s3.us-east-1.amazonaws.com/index.html",
        REMOTION_VIDEO_CRF: "99",
        REMOTION_WEBHOOK_SECRET: "secret-value",
        REMOTION_X264_PRESET: "turbo",
      },
    });

    assert.equal(config.crf, 24);
    assert.equal(config.x264Preset, "medium");
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
