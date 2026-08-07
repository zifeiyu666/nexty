const DEFAULT_USESEND_BASE_URL = "https://app.usesend.com";

type UseSendErrorResponse = {
  error?: unknown;
  message?: unknown;
};

type UseSendContact = {
  id: string;
  email: string;
};

export type SendUseSendEmailInput = {
  to: string | string[];
  from: string;
  replyTo: string | string[];
  subject: string;
  html: string;
  text?: string;
  headers?: Record<string, string>;
  idempotencyKey?: string;
};

type UseSendEmailResponse = {
  emailId: string;
};

function formatErrorDetail(value: unknown): string | undefined {
  if (value == null) {
    return undefined;
  }

  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function getApiKey(): string {
  const apiKey = process.env.USESEND_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("USESEND_API_KEY is not configured.");
  }

  return apiKey;
}

function getApiUrl(): string {
  const baseUrl = (process.env.USESEND_BASE_URL?.trim() || DEFAULT_USESEND_BASE_URL)
    .replace(/\/+$/, "")
    .replace(/\/api(?:\/v1)?$/, "");

  return `${baseUrl}/api/v1`;
}

function getContactBookId(): string {
  const contactBookId = process.env.USESEND_CONTACT_BOOK_ID?.trim();

  if (!contactBookId) {
    throw new Error("USESEND_CONTACT_BOOK_ID is not configured.");
  }

  return contactBookId;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  const body = await response.text();
  let data: T | UseSendErrorResponse | undefined;

  if (body) {
    try {
      data = JSON.parse(body) as T | UseSendErrorResponse;
    } catch {
      data = undefined;
    }
  }

  if (!response.ok) {
    const message = formatErrorDetail(
      data && typeof data === "object" && "message" in data
        ? data.message
        : data && typeof data === "object" && "error" in data
          ? data.error
          : body || response.statusText,
    );

    throw new Error(`UseSend API request failed (${response.status}): ${message}`);
  }

  return data as T;
}

export async function sendUseSendEmail(
  input: SendUseSendEmailInput,
): Promise<UseSendEmailResponse> {
  const { idempotencyKey, ...email } = input;

  return request<UseSendEmailResponse>("/emails", {
    method: "POST",
    headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
    body: JSON.stringify(email),
  });
}

async function findContactByEmail(email: string): Promise<UseSendContact | undefined> {
  const contactBookId = getContactBookId();
  const contacts = await request<UseSendContact[]>(
    `/contactBooks/${encodeURIComponent(contactBookId)}/contacts?emails=${encodeURIComponent(email)}`,
  );

  return contacts.find((contact) => contact.email.toLowerCase() === email.toLowerCase());
}

export async function addUseSendContact(email: string): Promise<void> {
  const contact = await findContactByEmail(email);

  if (contact) {
    return;
  }

  const contactBookId = getContactBookId();

  await request(`/contactBooks/${encodeURIComponent(contactBookId)}/contacts`, {
    method: "POST",
    body: JSON.stringify({ email, subscribed: true }),
  });
}

export async function removeUseSendContact(email: string): Promise<void> {
  const contactBookId = getContactBookId();
  const contact = await findContactByEmail(email);

  if (!contact) {
    return;
  }

  await request(
    `/contactBooks/${encodeURIComponent(contactBookId)}/contacts/${encodeURIComponent(contact.id)}`,
    { method: "DELETE" },
  );
}
