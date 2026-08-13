import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";

import { getTransactionalEmailSender } from "../../lib/email-sender";

const originalAdminEmail = process.env.ADMIN_EMAIL;

afterEach(() => {
  process.env.ADMIN_EMAIL = originalAdminEmail;
});

describe("transactional email sender", () => {
  test("always uses the verified support address, not ADMIN_EMAIL", () => {
    process.env.ADMIN_EMAIL = "hello@example.com";

    assert.deepEqual(getTransactionalEmailSender(), {
      email: "support@sendthesong.io",
      from: "SendTheSong.io <support@sendthesong.io>",
    });
  });
});
