import { getAccessToken, getPayPalApiBaseUrl } from "@/lib/paypal/client";

/** Maximum number of retries */
const MAX_RETRIES = 5;

/** Base delay (milliseconds) */
const BASE_DELAY_MS = 200;

/**
 * Verify a PayPal webhook signature with exponential-backoff retry.
 *
 * Retry schedule:
 * - retry 1: wait 200ms  (200 * 2^0)
 * - retry 2: wait 400ms  (200 * 2^1)
 * - retry 3: wait 800ms  (200 * 2^2)
 * - retry 4: wait 1600ms (200 * 2^3)
 * - retry 5: wait 3200ms (200 * 2^4)
 * Maximum total wait ≈ 6.2 seconds
 *
 * Only network errors and 5xx status codes are retried; 4xx errors fail
 * immediately (an invalid signature does not need retrying).
 */
export async function verifyPayPalWebhookSignature(
  webhookHeaders: {
    authAlgo: string;
    certUrl: string;
    transmissionId: string;
    transmissionSig: string;
    transmissionTime: string;
  },
  rawBody: string,
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;

  if (!webhookId) {
    console.error("[PayPal Webhook] PAYPAL_WEBHOOK_ID not configured");
    return false;
  }

  // Important: PayPal signature verification requires the webhook_event to be
  // byte-for-byte identical to the raw body. PayPal's verify-webhook-signature
  // API validates the signature against transmission_id + transmission_time +
  // webhook_id + CRC32(rawBody) from the headers (transmission_sig + cert_url),
  // not against the body we send. The webhook_event we send merely tells PayPal
  // the event content.
  //
  // To be safe, we build the request body by concatenating the raw body
  // directly, avoiding any potential serialization differences:
  const verifyBodyStr = JSON.stringify({
    auth_algo: webhookHeaders.authAlgo,
    cert_url: webhookHeaders.certUrl,
    transmission_id: webhookHeaders.transmissionId,
    transmission_sig: webhookHeaders.transmissionSig,
    transmission_time: webhookHeaders.transmissionTime,
    webhook_id: webhookId,
  });
  // Manual concatenation: use the original rawBody string as the value of
  // webhook_event without parsing/stringifying it.
  const requestBody =
    verifyBodyStr.slice(0, -1) + ',"webhook_event":' + rawBody + "}";

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Not the first attempt: wait for the exponential-backoff delay
      if (attempt > 0) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(
          `[PayPal Webhook] Verification retry ${attempt}/${MAX_RETRIES}, waiting ${delay}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      const accessToken = await getAccessToken();

      const response = await fetch(
        `${getPayPalApiBaseUrl()}/v1/notifications/verify-webhook-signature`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: requestBody, // use the raw body concatenation to stay byte-identical
        }
      );

      // 4xx error: invalid signature or malformed request; do not retry
      if (response.status >= 400 && response.status < 500) {
        const errorBody = await response.text();
        console.error(
          `[PayPal Webhook] Verification failed with ${response.status}: ${errorBody}`
        );
        return false;
      }

      // 5xx error: PayPal server-side issue; keep retrying
      if (response.status >= 500) {
        lastError = new Error(`PayPal API returned ${response.status}`);
        continue;
      }

      // Successful response
      const result = await response.json() as { verification_status: string };
      const isValid = result.verification_status === "SUCCESS";

      if (!isValid) {
        console.warn(
          `[PayPal Webhook] Signature verification status: ${result.verification_status}`
        );
      }

      return isValid;
    } catch (error) {
      // Network error (DNS failure, connection timeout, etc.); keep retrying
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(
        `[PayPal Webhook] Verification attempt ${attempt + 1} failed:`,
        lastError.message
      );
    }
  }

  // All retries failed
  console.error(
    `[PayPal Webhook] Verification failed after ${MAX_RETRIES + 1} attempts. Last error:`,
    lastError?.message
  );
  return false;
}
