import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

function source(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("payment unlock song flow wiring", () => {
  test("checkout route passes unlock context into provider metadata and PayPal custom id", () => {
    const route = source("app/api/payment/checkout-session/route.ts");

    assert.match(
      route,
      new RegExp("parseUnlockSongContext\\([\\s\\S]*requestData\\.unlockSongContext")
    );
    assert.match(route, /buildUnlockSongMetadata\(unlockSongContext\)/);
    assert.match(
      route,
      new RegExp("createStripeCheckoutSession\\(\\{[\\s\\S]*unlockSongContext,")
    );
    assert.match(route, /\.\.\.unlockMetadata/);
    assert.match(route, /serializeUnlockSongForPayPal\(unlockSongContext\)/);
    assert.match(route, /paypalUnlock,/);
    assert.match(route, /appendUnlockSongParams\(/);
  });

  test("creem success URL lets Creem append checkout_id itself", () => {
    const route = source("app/api/payment/checkout-session/route.ts");

    assert.match(route, /'payment\/success\?provider=creem'/);
    assert.doesNotMatch(route, /checkout_id=\{checkout_id\}/);
  });

  test("webhooks auto-finalize unlocks after entitlement grants", () => {
    const stripeWebhook = source("app/api/stripe/webhook/webhook-handlers.ts");
    const creemWebhook = source("app/api/creem/webhook/handlers.ts");
    const paypalWebhook = source("app/api/paypal/webhook/handlers.ts");

    assert.match(
      stripeWebhook,
      new RegExp(
        "await upgradeOneTimeCredits\\([\\s\\S]*?await finalizeAndRecordOrderUnlockSong"
      )
    );
    assert.match(
      stripeWebhook,
      new RegExp(
        "await upgradeSubscriptionCredits\\([\\s\\S]*?await finalizeAndRecordOrderUnlockSong"
      )
    );
    assert.match(
      creemWebhook,
      new RegExp(
        "await upgradeOneTimeCredits\\([\\s\\S]*?await finalizeAndRecordOrderUnlockSong"
      )
    );
    assert.match(
      creemWebhook,
      new RegExp(
        "await upgradeSubscriptionCredits\\([\\s\\S]*?await finalizeAndRecordOrderUnlockSong"
      )
    );
    assert.match(
      paypalWebhook,
      new RegExp(
        "await upgradeOneTimeCredits\\([\\s\\S]*?creditsGranted = true[\\s\\S]*?finalizeAndRecordOrderUnlockSong"
      )
    );
    assert.match(
      paypalWebhook,
      new RegExp(
        "await upgradeSubscriptionCredits\\([\\s\\S]*?creditsGranted = true[\\s\\S]*?finalizeAndRecordOrderUnlockSong"
      )
    );
  });
});
