import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";

import { getTransactionalEmailSender } from "../../lib/email-sender";

const originalAdminEmail = process.env.ADMIN_EMAIL;
const originalFromAddress = process.env.EMAIL_FROM_ADDRESS;
const originalFromName = process.env.EMAIL_FROM_NAME;

afterEach(() => {
  process.env.ADMIN_EMAIL = originalAdminEmail;
  process.env.EMAIL_FROM_ADDRESS = originalFromAddress;
  process.env.EMAIL_FROM_NAME = originalFromName;
});

describe("transactional email sender", () => {
  test("uses the default sender when no sender environment variables are set", () => {
    process.env.ADMIN_EMAIL = "hello@example.com";
    delete process.env.EMAIL_FROM_ADDRESS;
    delete process.env.EMAIL_FROM_NAME;

    assert.deepEqual(getTransactionalEmailSender(), {
      email: "support@sendthesong.io",
      from: "SendTheSong.io <support@sendthesong.io>",
    });
  });

  test("uses the configured sender environment variables", () => {
    process.env.EMAIL_FROM_ADDRESS = "notifications@example.com";
    process.env.EMAIL_FROM_NAME = "Example Notifications";

    assert.deepEqual(getTransactionalEmailSender(), {
      email: "notifications@example.com",
      from: "Example Notifications <notifications@example.com>",
    });
  });
});
