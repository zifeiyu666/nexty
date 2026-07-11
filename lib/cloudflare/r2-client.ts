import { S3Client } from "@aws-sdk/client-s3";

export const getR2Endpoint = () => {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();

  if (!accountId) {
    throw new Error("R2_ACCOUNT_ID environment variable is not set.");
  }

  if (accountId.includes("://") || accountId.includes("/") || accountId.includes(".")) {
    throw new Error(
      "R2_ACCOUNT_ID must be the Cloudflare account ID only, not an R2 endpoint URL or bucket path."
    );
  }

  return `https://${accountId}.r2.cloudflarestorage.com`;
};

export const createR2Client = () => new S3Client({
  region: "auto",
  endpoint: getR2Endpoint(),
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
