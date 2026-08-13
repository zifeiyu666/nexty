import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";

import {
  addUseSendContact,
  removeUseSendContact,
  sendUseSendEmail,
} from "../../lib/usesend";

const originalFetch = global.fetch;
const originalApiKey = process.env.USESEND_API_KEY;
const originalBaseUrl = process.env.USESEND_BASE_URL;
const originalContactBookId = process.env.USESEND_CONTACT_BOOK_ID;

function mockResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  process.env.USESEND_API_KEY = "us_test_key";
  delete process.env.USESEND_BASE_URL;
  process.env.USESEND_CONTACT_BOOK_ID = "contact_book_123";
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.USESEND_API_KEY = originalApiKey;
  process.env.USESEND_BASE_URL = originalBaseUrl;
  process.env.USESEND_CONTACT_BOOK_ID = originalContactBookId;
});

describe("UseSend adapter", () => {
  test("sends an email with the authenticated native API payload", async () => {
    let request: Request | undefined;
    global.fetch = async (input, init) => {
      request = new Request(input, init);
      return mockResponse({ emailId: "email_123" });
    };

    const result = await sendUseSendEmail({
      to: "recipient@example.com",
      from: "SendTheSong.io <support@sendthesong.io>",
      replyTo: "support@sendthesong.io",
      subject: "Your song is ready",
      html: "<p>Hello</p>",
      idempotencyKey: "song-ready/song_123",
    });

    assert.equal(result.emailId, "email_123");
    assert.equal(request?.url, "https://app.usesend.com/api/v1/emails");
    assert.equal(request?.method, "POST");
    assert.equal(request?.headers.get("Authorization"), "Bearer us_test_key");
    assert.equal(request?.headers.get("Idempotency-Key"), "song-ready/song_123");
    assert.deepEqual(await request?.json(), {
      to: "recipient@example.com",
      from: "SendTheSong.io <support@sendthesong.io>",
      replyTo: "support@sendthesong.io",
      subject: "Your song is ready",
      html: "<p>Hello</p>",
    });
  });

  test("rejects a send when the API key is missing", async () => {
    delete process.env.USESEND_API_KEY;

    await assert.rejects(
      sendUseSendEmail({
        to: "recipient@example.com",
        from: "SendTheSong.io <support@sendthesong.io>",
        replyTo: "support@sendthesong.io",
        subject: "Missing configuration",
        html: "<p>Hello</p>",
      }),
      /USESEND_API_KEY is not configured/,
    );
  });

  test("uses the configured self-hosted base URL", async () => {
    process.env.USESEND_BASE_URL = "https://usesend.example.com/api";
    let request: Request | undefined;
    global.fetch = async (input, init) => {
      request = new Request(input, init);
      return mockResponse({ emailId: "email_123" });
    };

    await sendUseSendEmail({
      to: "recipient@example.com",
      from: "SendTheSong.io <support@sendthesong.io>",
      replyTo: "support@sendthesong.io",
      subject: "Self-hosted",
      html: "<p>Hello</p>",
    });

    assert.equal(request?.url, "https://usesend.example.com/api/v1/emails");
  });

  test("rejects a failed API send with its response details", async () => {
    global.fetch = async () => mockResponse({ message: "Domain is not verified" }, 403);

    await assert.rejects(
      sendUseSendEmail({
        to: "recipient@example.com",
        from: "SendTheSong.io <support@sendthesong.io>",
        replyTo: "support@sendthesong.io",
        subject: "Rejected",
        html: "<p>Hello</p>",
      }),
      /UseSend API request failed \(403\): Domain is not verified/,
    );
  });

  test("serializes structured API error details instead of [object Object]", async () => {
    global.fetch = async () =>
      mockResponse(
        { message: { from: ["Sender address is not verified"] } },
        400,
      );

    await assert.rejects(
      sendUseSendEmail({
        to: "recipient@example.com",
        from: "SendTheSong.io <support@sendthesong.io>",
        replyTo: "support@sendthesong.io",
        subject: "Rejected",
        html: "<p>Hello</p>",
      }),
      /UseSend API request failed \(400\): \{"from":\["Sender address is not verified"\]\}/,
    );
  });

  test("adds a missing contact to the configured contact book", async () => {
    const requests: Request[] = [];
    global.fetch = async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);
      return requests.length === 1 ? mockResponse([]) : mockResponse({ contactId: "contact_123" });
    };

    await addUseSendContact("subscriber@example.com");

    assert.equal(requests.length, 2);
    assert.equal(
      requests[0]?.url,
      "https://app.usesend.com/api/v1/contactBooks/contact_book_123/contacts?emails=subscriber%40example.com",
    );
    assert.equal(requests[1]?.method, "POST");
    assert.deepEqual(await requests[1]?.json(), {
      email: "subscriber@example.com",
      subscribed: true,
    });
  });

  test("removes a matching contact from the configured contact book", async () => {
    const requests: Request[] = [];
    global.fetch = async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);
      return requests.length === 1
        ? mockResponse([{ id: "contact_123", email: "subscriber@example.com" }])
        : mockResponse({ success: true });
    };

    await removeUseSendContact("subscriber@example.com");

    assert.equal(requests.length, 2);
    assert.equal(requests[1]?.method, "DELETE");
    assert.equal(
      requests[1]?.url,
      "https://app.usesend.com/api/v1/contactBooks/contact_book_123/contacts/contact_123",
    );
  });
});
