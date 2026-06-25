/**
 * PayPal custom_id encode/decode utilities.
 *
 * PayPal does not offer a flexible metadata object like Stripe does, and
 * custom_id is limited to 127 characters. v2 compresses UUIDs so checkout can
 * still carry unlock context without a side-channel.
 */

export interface PayPalCustomIdData {
  userId: string;
  planId: string;
  submitProductId: string | null;
  paypalUnlock?: string | null;
}

const CUSTOM_ID_MAX_LENGTH = 127;
const CUSTOM_ID_V2_PREFIX = "v2";
const UUID_SEGMENT_PREFIX = "u:";
const STRING_SEGMENT_PREFIX = "s:";
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function uuidToBase64Url(uuid: string): string | null {
  if (!UUID_REGEX.test(uuid)) return null;
  return Buffer.from(uuid.replace(/-/g, ""), "hex").toString("base64url");
}

function base64UrlToUuid(value: string): string | null {
  try {
    const hex = Buffer.from(value, "base64url").toString("hex");
    if (hex.length !== 32) return null;
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
      12,
      16
    )}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  } catch {
    return null;
  }
}

function encodeSegment(value: string | null | undefined): string {
  if (!value) return "";

  const encodedUuid = uuidToBase64Url(value);
  if (encodedUuid) return `${UUID_SEGMENT_PREFIX}${encodedUuid}`;

  return `${STRING_SEGMENT_PREFIX}${Buffer.from(value, "utf8").toString(
    "base64url"
  )}`;
}

function decodeSegment(value: string | undefined): string | null {
  if (!value) return null;

  if (value.startsWith(UUID_SEGMENT_PREFIX)) {
    return base64UrlToUuid(value.slice(UUID_SEGMENT_PREFIX.length));
  }

  if (value.startsWith(STRING_SEGMENT_PREFIX)) {
    try {
      return Buffer.from(
        value.slice(STRING_SEGMENT_PREFIX.length),
        "base64url"
      ).toString("utf8");
    } catch {
      return null;
    }
  }

  return value;
}

/**
 * Encode: pack the key IDs into a custom_id string.
 */
export function encodePayPalCustomId(data: PayPalCustomIdData): string {
  const encoded = [
    CUSTOM_ID_V2_PREFIX,
    encodeSegment(data.userId),
    encodeSegment(data.planId),
    encodeSegment(data.submitProductId),
    data.paypalUnlock || "",
  ].join("|");

  if (encoded.length <= CUSTOM_ID_MAX_LENGTH) return encoded;

  const fallback = [
    data.userId,
    data.planId,
    data.submitProductId || "",
    data.paypalUnlock || "",
  ].join("|");

  if (fallback.length > CUSTOM_ID_MAX_LENGTH) {
    console.warn("[PayPal] custom_id exceeds 127 characters", {
      userIdLength: data.userId.length,
      planIdLength: data.planId.length,
      submitProductIdLength: data.submitProductId?.length ?? 0,
      paypalUnlockLength: data.paypalUnlock?.length ?? 0,
    });
  }

  return fallback;
}

/**
 * Decode: restore the key IDs from a custom_id.
 *
 * @param customId The custom_id returned by PayPal
 * @returns The parsed data, or null if the format is invalid
 */
export function decodePayPalCustomId(customId: string | undefined | null): PayPalCustomIdData | null {
  if (!customId) return null;

  const parts = customId.split("|");
  if (parts[0] === CUSTOM_ID_V2_PREFIX) {
    const userId = decodeSegment(parts[1]);
    const planId = decodeSegment(parts[2]);
    if (!userId || !planId) {
      console.error(`[PayPal] Invalid v2 custom_id format: ${customId}`);
      return null;
    }

    return {
      userId,
      planId,
      submitProductId: decodeSegment(parts[3]) || null,
      paypalUnlock: parts[4] || null,
    };
  }

  if (parts.length < 2) {
    console.error(`[PayPal] Invalid custom_id format: ${customId}`);
    return null;
  }

  return {
    userId: parts[0],
    planId: parts[1],
    submitProductId: parts[2] || null,
    paypalUnlock: parts[3] || null,
  };
}
