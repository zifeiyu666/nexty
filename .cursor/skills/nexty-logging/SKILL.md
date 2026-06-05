---
name: nexty-logging
description: Add structured logging and error monitoring in NEXTY.DEV using Pino + Sentry. Use when adding logs to server actions, route handlers, or any server-side module. Covers logger usage, log levels, Sentry error capture, and what NOT to do.
---

# Logging & Error Monitoring in NEXTY.DEV

## Overview

- **Logger**: `lib/logger/index.ts`
- **Structured logging**: Pino (async, non-blocking, JSON output)
- **Error reporting**: Sentry (auto-captured on `error` / `fatal`)
- **Runtime**: Server-side only (Server Components, Server Actions, Route Handlers, middleware)

## Quick Start

```typescript
import { getLogger } from "@/lib/logger";

const logger = getLogger("my-module");
```

`getLogger` is cached — calling it multiple times with the same name returns the same instance.

## Log Levels

| Method | When to use | Sentry |
|---|---|---|
| `logger.trace` | SQL queries, detailed execution path | — |
| `logger.debug` | Request params, intermediate state | — |
| `logger.info` | Normal business events (login, order, subscribe) | — |
| `logger.warn` | Recoverable issues (retry, rate limit, degraded) | Breadcrumb |
| `logger.error` | Failures (API error, DB failure, payment failed) | captureException |
| `logger.fatal` | Service unavailable, init failure | captureException (fatal) |

Default production level is `info` — `trace` and `debug` are silent unless `LOG_LEVEL=debug`.

## Signatures

```typescript
// All methods: first arg is a context object, second is the message string
logger.info({ userId, planId }, "User subscribed");
logger.warn({ retryCount: 3 }, "Retrying webhook");

// error / fatal accept an Error object directly
logger.error(new Error("Stripe timeout"), "Payment failed");

// or a plain object (if it has an `err` or `error` key, Sentry extracts it)
logger.error({ err: error, orderId }, "Order processing failed");

// manual capture with extra context
logger.captureError(error, { userId, action: "checkout" });

// access underlying pino for child loggers
const child = logger.pino.child({ requestId });
```

## Usage Patterns

### Server Action

```typescript
"use server";
import { getLogger } from "@/lib/logger";

const logger = getLogger("payment-action");

export async function createCheckout(planId: string) {
  try {
    const session = await stripe.checkout.sessions.create({ ... });
    logger.info({ planId, sessionId: session.id }, "Checkout session created");
    return { url: session.url };
  } catch (error) {
    logger.error(
      error instanceof Error ? error : new Error(String(error)),
      "Checkout failed"
    );
    throw error;
  }
}
```

### Route Handler

```typescript
import { getLogger } from "@/lib/logger";

const logger = getLogger("stripe-webhook");

export async function POST(request: Request) {
  try {
    // ...process webhook...
    logger.info({ event: event.type }, "Webhook processed");
    return Response.json({ ok: true });
  } catch (error) {
    logger.error(
      error instanceof Error ? error : new Error(String(error)),
      "Webhook error"
    );
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
```

### Warn with context (adds Sentry breadcrumb)

```typescript
logger.warn({ retryCount, url, statusCode: res.status }, "Request failed, retrying");
```

## Naming Convention

Use kebab-case names that match the module's responsibility:

```typescript
getLogger("stripe-webhook")    // payments
getLogger("ai-chat")           // AI features
getLogger("auth")              // authentication
getLogger("r2-upload")         // file storage
getLogger("cron-cleanup")      // background jobs
```

## Rules

**Always structure fields — never interpolate strings:**
```typescript
// ✅
logger.info({ userId, amount }, "Payment completed");

// ❌
logger.info({}, `Payment completed for user ${userId}, amount ${amount}`);
```

**Never log sensitive data:**
```typescript
// ❌
logger.info({ password, token, cardNumber }, "User data");

// ✅
logger.info({ userId, last4: card.last4 }, "Payment method added");
```

**Client components cannot use logger** — Pino requires Node.js/Edge runtime.
Client-side errors are captured automatically by `sentry.client.config.ts`.

**Always pass an actual Error to `error()` / `fatal()` when available** — Sentry needs a real Error object for a proper stack trace. If you only have a string, wrap it: `new Error(message)`.

## Environment Variables

```bash
NEXT_PUBLIC_SENTRY_DSN=      # Required for Sentry error reporting
LOG_LEVEL=info               # trace|debug|info|warn|error|fatal (default: info)
LOG_DIR=                     # File rotation path (VPS only; leave empty for cloud)
SENTRY_DEBUG=false           # Set to "true" to send events in development
```

All variables are optional. Without `NEXT_PUBLIC_SENTRY_DSN`, Sentry calls are silent no-ops.
