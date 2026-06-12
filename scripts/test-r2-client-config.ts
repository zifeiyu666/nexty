import assert from "node:assert/strict";
import { getR2Endpoint } from "@/lib/cloudflare/r2-client";

const originalAccountId = process.env.R2_ACCOUNT_ID;

try {
  process.env.R2_ACCOUNT_ID =
    "https://6a8c9d4a24a0d54bff8c17f73758adff.r2.cloudflarestorage.com/customsong";

  assert.throws(
    () => getR2Endpoint(),
    /R2_ACCOUNT_ID must be the Cloudflare account ID only/
  );

  process.env.R2_ACCOUNT_ID = "6a8c9d4a24a0d54bff8c17f73758adff";

  assert.equal(
    getR2Endpoint(),
    "https://6a8c9d4a24a0d54bff8c17f73758adff.r2.cloudflarestorage.com"
  );
} finally {
  if (originalAccountId === undefined) {
    delete process.env.R2_ACCOUNT_ID;
  } else {
    process.env.R2_ACCOUNT_ID = originalAccountId;
  }
}
