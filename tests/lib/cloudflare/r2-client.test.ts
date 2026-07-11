import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { createPresignedUploadUrl } from "@/lib/cloudflare/r2";

describe("R2 presigned uploads", () => {
  test("uses the account endpoint with the bucket in the URL path", async () => {
    const previousEnvironment = {
      R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
      R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
      R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
      R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
      R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    };

    process.env.R2_ACCOUNT_ID = "account-id";
    process.env.R2_ACCESS_KEY_ID = "test-access-key";
    process.env.R2_SECRET_ACCESS_KEY = "test-secret-key";
    process.env.R2_BUCKET_NAME = "customsong";
    process.env.R2_PUBLIC_URL = "https://cdn.example.com";

    try {
      const { presignedUrl } = await createPresignedUploadUrl({
        contentType: "image/jpeg",
        key: "music-videos/assets/photo.jpg",
      });
      const url = new URL(presignedUrl);

      assert.equal(url.hostname, "account-id.r2.cloudflarestorage.com");
      assert.equal(url.pathname, "/customsong/music-videos/assets/photo.jpg");
    } finally {
      Object.assign(process.env, previousEnvironment);
    }
  });
});
