#!/usr/bin/env node
/**
 * ============================================================
 * PayPal Subscription Renewal Webhook - Local Test Script
 * ============================================================
 *
 * Use this script to simulate a PayPal "PAYMENT.SALE.COMPLETED" webhook
 * event locally. This is useful for testing subscription renewal logic
 * (credit top-ups, period extension, order creation) without waiting
 * for PayPal's real billing cycle.
 *
 * In development mode (NODE_ENV=development), signature verification
 * is automatically skipped, so you can send the payload directly.
 *
 * -----------------------------------------------------------
 * 1. Make sure your local dev server is running:
 *    pnpm dev
 *
 * 2. Fill in the "REQUIRED CONFIG" section below with your test data.
 *
 * 3. Run the script:
 *    node scripts/test-paypal-renewal.mjs
 *
 * 4. (Optional) Override any config via CLI flags:
 *    node scripts/test-paypal-renewal.mjs --saleId=SALE-123 --amount=9.99
 * ============================================================
 */

// -----------------------------------------------------------
// REQUIRED CONFIG - Edit these values for your test case
// -----------------------------------------------------------
const CONFIG = {
  // Your local webhook endpoint
  endpoint: "http://localhost:3000/api/paypal/webhook",

  // The PayPal subscription ID (billing_agreement_id)
  // Find this in your database: subscriptions.subscription_id
  subscriptionId: "I-J3SEDYYTFH1H",

  // The user's UUID from your database
  userId: "c44e7a56-0d6e-4066-8fb8-4dbf98ee44dc",

  // The pricing plan UUID from your database
  planId: "560a6084-92a8-4521-b6cd-2f220ee238f0",

  // (Optional) A submitProductId if your flow uses one; leave empty otherwise
  submitProductId: "",

  // Payment amount and currency (must match your plan)
  amount: "19.99",
  currency: "USD",
};

// -----------------------------------------------------------
// OPTIONAL CONFIG - Usually no need to change
// -----------------------------------------------------------
const ADVANCED = {
  // Explicit sale ID. If empty, a random one is generated automatically.
  // IMPORTANT: PayPal webhooks are idempotent by sale ID. Re-using the same
  // sale ID will cause the server to skip processing ("already processed").
  saleId: "",

  // Simulated event timestamp. If empty, current time is used.
  // Format: ISO 8601, e.g. "2026-06-30T10:00:00Z"
  createTime: "",
};

// ============================================================
// SCRIPT IMPLEMENTATION - No need to edit below
// ============================================================

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  for (const arg of args) {
    if (arg.startsWith("--")) {
      const [key, value] = arg.slice(2).split("=");
      options[key] = value ?? true;
    }
  }
  return options;
}

function randomId(prefix = "RND", len = 10) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "";
  for (let i = 0; i < len; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}-${s}`;
}

function buildPayload(cfg, advanced) {
  const saleId = advanced.saleId || randomId("SALE");
  const now = advanced.createTime || new Date().toISOString();

  // custom_id format: userId|planId|submitProductId
  const customId = [cfg.userId, cfg.planId, cfg.submitProductId || ""].join("|");

  return {
    id: randomId("WH"),
    event_type: "PAYMENT.SALE.COMPLETED",
    resource_type: "sale",
    resource: {
      id: saleId,
      state: "completed",
      amount: {
        total: cfg.amount,
        currency: cfg.currency,
      },
      billing_agreement_id: cfg.subscriptionId,
      parent_payment: randomId("PAY"),
      custom_id: customId,
      create_time: now,
      update_time: now,
      links: [
        {
          href: `https://api.sandbox.paypal.com/v1/payments/sale/${saleId}`,
          rel: "self",
          method: "GET",
        },
        {
          href: `https://api.sandbox.paypal.com/v1/payments/sale/${saleId}/refund`,
          rel: "refund",
          method: "POST",
        },
        {
          href: `https://api.sandbox.paypal.com/v1/payments/billing-agreements/${cfg.subscriptionId}`,
          rel: "parent_payment",
          method: "GET",
        },
      ],
    },
    create_time: now,
    summary: `A $ ${cfg.amount} ${cfg.currency} sale payment was completed for this subscription.`,
    links: [],
  };
}

async function main() {
  const cliOpts = parseArgs();

  // Allow CLI flags to override config values
  const cfg = {
    endpoint: cliOpts.endpoint || CONFIG.endpoint,
    subscriptionId: cliOpts.subscriptionId || CONFIG.subscriptionId,
    userId: cliOpts.userId || CONFIG.userId,
    planId: cliOpts.planId || CONFIG.planId,
    submitProductId: cliOpts.submitProductId ?? CONFIG.submitProductId,
    amount: cliOpts.amount || CONFIG.amount,
    currency: cliOpts.currency || CONFIG.currency,
  };

  const advanced = {
    saleId: cliOpts.saleId || ADVANCED.saleId,
    createTime: cliOpts.createTime || ADVANCED.createTime,
  };

  const payload = buildPayload(cfg, advanced);
  const saleId = payload.resource.id;

  console.log("=".repeat(60));
  console.log("PayPal Subscription Renewal - Local Webhook Test");
  console.log("=".repeat(60));
  console.log(`Endpoint       : ${cfg.endpoint}`);
  console.log(`Event Type     : ${payload.event_type}`);
  console.log(`Sale ID        : ${saleId}`);
  console.log(`Amount         : ${cfg.amount} ${cfg.currency}`);
  console.log(`Subscription   : ${cfg.subscriptionId}`);
  console.log(`User ID        : ${cfg.userId}`);
  console.log(`Plan ID        : ${cfg.planId}`);
  console.log(`Custom ID      : ${payload.resource.custom_id}`);
  console.log(`Event Time     : ${payload.create_time}`);
  console.log("-".repeat(60));

  try {
    const res = await fetch(cfg.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const bodyText = await res.text();

    console.log(`HTTP Status    : ${res.status} ${res.statusText}`);
    console.log(`Response Body  : ${bodyText}`);
    console.log("-".repeat(60));

    if (res.ok) {
      console.log("✅  Webhook delivered successfully.");
      console.log("    Check your server terminal logs for handler output.");
      console.log("    Expected: create 'subscription_renewal' order + top-up credits + sync period.");
    } else {
      console.log("❌  Webhook delivery failed. Check server logs for details.");
      process.exit(1);
    }
  } catch (err) {
    console.error("❌  Network error:", err.message);
    console.error("    Make sure your dev server is running (pnpm dev).");
    process.exit(1);
  }
}

main();
