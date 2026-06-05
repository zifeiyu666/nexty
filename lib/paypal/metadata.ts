/**
 * PayPal custom_id encode/decode utilities.
 *
 * PayPal does not offer a flexible metadata object like Stripe does — only a
 * custom_id field (max 127 characters). Our approach: join the key IDs with a
 * pipe separator. No extra Redis or database storage is required, which keeps it
 * simple and reliable.
 */

export interface PayPalCustomIdData {
  userId: string;
  planId: string;
  submitProductId: string | null;
}

/**
 * Encode: pack the key IDs into a custom_id string.
 */
export function encodePayPalCustomId(data: PayPalCustomIdData): string {
  return [data.userId, data.planId, data.submitProductId || ""].join("|");
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
  if (parts.length < 2) {
    console.error(`[PayPal] Invalid custom_id format: ${customId}`);
    return null;
  }

  return {
    userId: parts[0],
    planId: parts[1],
    submitProductId: parts[2] || null,
  };
}
