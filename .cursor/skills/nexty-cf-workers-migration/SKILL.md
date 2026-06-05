---
name: nexty-cf-workers-migration
description: Migrate a NEXTY.DEV project to Cloudflare Workers deployment using @opennextjs/cloudflare. Covers infrastructure setup, database adapter changes (Neon HTTP / Hyperdrive), auth refactoring, blog pre-build, and deploy commands. Use when moving an existing NEXTY project from Vercel/Node to Cloudflare Workers.
---

# NEXTY.DEV → Cloudflare Workers Migration Guide

This skill covers every change needed to move a NEXTY.DEV project from a Node.js-based host (Vercel, Netlify, self-hosted) to **Cloudflare Workers** via `@opennextjs/cloudflare`.

---

## Overview of Changes

| Area | What changes |
|------|-------------|
| Dependencies | Add `@opennextjs/cloudflare`, `wrangler` |
| Config files | Add `open-next.config.ts`, `wrangler.jsonc`, update `next.config.mjs` |
| DB layer | `db` export → `getDb()` factory (Neon HTTP or Hyperdrive) |
| Auth layer | `auth` singleton → `getAuth()` factory |
| Auth route | `toNextJsHandler(auth)` → manual per-method handlers |
| Blog/CMS | Pre-build MDX into `lib/cms/blog-data.ts` at build time |
| Email rendering | `react:` prop → render to HTML via dynamic `react-dom/server` import |
| Scripts | Add `cf:build`, `cf:deploy`, `cf:preview`, `cf:sync-env`, `blog:build-data` |
| Middleware | Rename `proxy.ts` → `middleware.ts` |
| Static assets | Add `public/_headers` for immutable cache headers |

---

## AI Constraints

- **Never run `cf:*` commands automatically** (`pnpm cf:build`, `pnpm cf:preview`, `pnpm cf:deploy`, `pnpm cf:sync-env`, `pnpm blog:build-data`, etc.). Deployment is done by pushing code to Git — Cloudflare Workers auto-builds from the repository. Do not suggest local build/deploy steps.

---

## Step 1 — Install Dependencies

```bash
pnpm add @opennextjs/cloudflare
pnpm add -D wrangler
```

Also upgrade `better-auth` to `^1.4.18`+ (required for edge compatibility):

```bash
pnpm add better-auth@latest
```

---

## Step 2 — Add npm Scripts to `package.json`

```json
{
  "scripts": {
    "blog:build-data": "tsx scripts/build-blog-data.ts",
    "cf:sync-env": "node scripts/sync-env-to-cloudflare.mjs",
    "cf:build": "pnpm blog:build-data && opennextjs-cloudflare build",
    "cf:preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
    "cf:deploy": "pnpm cf:build && opennextjs-cloudflare deploy && npx opennextjs-cloudflare populateCache remote",
    "cf:typegen": "wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts"
  }
}
```

---

## Step 3 — Create `open-next.config.ts`

```typescript
// open-next.config.ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  queue: doQueue,
  // Required for revalidatePath / revalidateTag
  tagCache: d1NextTagCache,
  enableCacheInterception: true,
});
```

---

## Step 4 — Update `next.config.mjs`

Add the dev initializer so local `next dev` can access Cloudflare bindings:

```javascript
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// ... existing config ...

// Initialize Cloudflare bindings for local development (next dev)
// This is a no-op in production and in the Cloudflare build
initOpenNextCloudflareForDev();

export default withBundleAnalyzerWrapper(withNextIntl(nextConfig));
```

---

## Step 5 — Create `wrangler.jsonc`

Copy `wrangler.example.jsonc` to `wrangler.jsonc`. The template already has the correct structure — just fill in the placeholder values (`<YOUR_WORKER_APP_NAME>`, `<YOUR_ACCOUNT_ID>`, bucket names, etc.).

Tell the user: **For full configuration details, Cloudflare resource setup (R2, D1, Hyperdrive), and deploy steps, refer to the official deployment guide: https://nexty.dev/docs/start-project/cf-workers**

---

## Step 6 — Update `.gitignore`

```gitignore
.env.cf
.dev.vars

# Cloudflare / OpenNext build output
.open-next
cloudflare-env.d.ts
.wrangler

# Generated blog data (build-time generated)
lib/cms/blog-data.ts
lib/cms/blog-data.json
```

---

## Step 7 — Add `public/_headers`

Create `public/_headers`:

```
/_next/static/*
  Cache-Control: public,max-age=31536000,immutable
```

---

## Step 8 — Update Database Layer (`lib/db/index.ts`)

The old module-level `db` singleton cannot access Cloudflare bindings (Hyperdrive) outside a request context. Replace it with a `getDb()` factory.

### Key rules:
- **New code**: always use `getDb()` called at the top of the function
- **Existing code (backward compat)**: the `db` proxy export still works but will fall back to `DATABASE_URL`
- **Static routes (ISR/SSG)**: use `getDbAsync()` instead of `getDb()`

### Database connection strategy (in `lib/db/config.ts`):

```typescript
// lib/db/config.ts — added Cloudflare platform detection
function detectPlatform() {
  if (process.env.DEPLOYMENT_PLATFORM === 'cloudflare') return 'cloudflare';
  // ... existing checks
}

// Neon on CF Workers: use HTTP driver (no TCP)
export function createDatabase(config: DBConfig): DB {
  const platform = detectPlatform();
  if (platform === 'cloudflare' && detectDatabase(config.connectionString) === 'neon') {
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(config.connectionString);
    return drizzleNeon(sql, { schema });
  }
  // Node.js: use postgres TCP driver as before
  const connectionConfig = createDatabaseConfig(config);
  const client = postgres(config.connectionString, connectionConfig);
  return drizzle(client, { schema });
}

// Hyperdrive / Supabase Pooler: use postgres with fetch_types: false
export function createPoolerDatabase(connectionString: string, ssl: boolean | 'require' = false, max = 1): DB {
  const client = postgres(connectionString, {
    max,
    prepare: false,
    ssl,
    fetch_types: false, // CRITICAL for CF Workers
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    connect_timeout: 15,
    transform: { undefined: null },
  });
  return drizzle(client, { schema });
}
```

### `getDb()` usage in server actions / API routes / services:

```typescript
// Before (module-level, breaks in CF Workers with Hyperdrive)
import { db } from '@/lib/db';

async function myFunction() {
  await db.select()...
}

// After (request-scoped, works everywhere)
import { getDb } from '@/lib/db';

async function myFunction() {
  const db = getDb();
  await db.select()...
}
```

After completing the replacements, tell the user: **Do a global search for `"import { db }"` to verify no files were missed — this is easy to overlook and causes silent failures when Hyperdrive is configured. Known locations: `actions/**/*.ts`, `lib/payments/credit-manager.ts`, `lib/payments/webhook-helpers.ts`, `lib/tracking/server.ts`, `app/api/**/route.ts`.**

---

## Step 9 — Update Auth Layer (`lib/auth/index.ts`)

The `auth` singleton must also be request-scoped to pick up `getDb()`:

```typescript
// lib/auth/index.ts

import { getDb } from '@/lib/db';
import { betterAuth, BetterAuthOptions } from "better-auth";
import { cache } from "react";

function createAuthConfig(databaseInstance: ReturnType<typeof getDb>): BetterAuthOptions {
  return {
    // ... all your existing config ...
    advanced: {
      database: {
        // Use string 'uuid' — better edge runtime compatibility than a function
        generateId: 'uuid',
      },
      ipAddress: {
        ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for", "x-real-ip"],
      },
    },
    database: drizzleAdapter(databaseInstance, {
      provider: "pg",
      schema: { user, session, account, verification },
    }),
    // ... rest of config ...
  };
}

// Request-scoped auth instance (React cache deduplicates per request)
export const getAuth = cache(() => betterAuth(createAuthConfig(getDb())));
```

---

## Step 10 — Update Auth Route Handler

```typescript
// app/api/auth/[...all]/route.ts
// Before:
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
export const { POST, GET } = toNextJsHandler(auth);

// After:
import { getAuth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return getAuth().handler(req);
}
export async function POST(req: NextRequest) {
  return getAuth().handler(req);
}
export async function PUT(req: NextRequest) {
  return getAuth().handler(req);
}
export async function DELETE(req: NextRequest) {
  return getAuth().handler(req);
}
export async function PATCH(req: NextRequest) {
  return getAuth().handler(req);
}
```

---

## Step 11 — Rename `proxy.ts` → `middleware.ts`

Cloudflare Workers expects Next.js middleware at `middleware.ts` (not `proxy.ts`):

```typescript
// middleware.ts
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);
export default intlMiddleware;

export const config = {
  matcher: [
    '/',
    '/(en|zh|ja)/:path*',
    '/((?!api|_next|_vercel|auth|privacy-policy|terms-of-service|refund-policy|.*\\.|favicon.ico).*)'
  ]
};
```

Delete the old `proxy.ts`.

---

## Step 12 — Blog Pre-Build for Cloudflare Workers

CF Workers has no filesystem access at runtime. Local MDX blog files must be pre-compiled into a TypeScript module at build time.

### Create `scripts/build-blog-data.ts`

This script reads all `blogs/<locale>/*.mdx` files and writes `lib/cms/blog-data.ts`:

```typescript
// scripts/build-blog-data.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOGS_DIR = path.join(process.cwd(), 'blogs');
const OUTPUT_FILE = path.join(process.cwd(), 'lib', 'cms', 'blog-data.ts');

// Read all MDX files → serialize to TypeScript
function generateBlogData() { /* ... reads locales/files ... */ }
function generateTypeScriptFile(data) { /* ... stringifies to TS ... */ }

// Run: pnpm blog:build-data
generateBlogData(); // writes OUTPUT_FILE
```

### Create `lib/cms/blog-data-loader.ts`

Runtime wrapper that lazy-loads the generated data (graceful fallback if not generated yet):

```typescript
// lib/cms/blog-data-loader.ts
let blogDataModule = null;
try {
  blogDataModule = require('./blog-data');
} catch {
  console.warn('[blog-data-loader] Run `pnpm blog:build-data` to generate.');
}

export function getBlogData(locale: string) {
  return blogDataModule?.blogData[locale] || [];
}

export function getBlogPostBySlug(slug: string, locale: string) {
  const posts = getBlogData(locale);
  const normalized = slug.replace(/^\//, '').replace(/\/$/, '');
  return posts.find(p => p.slug.replace(/^\//, '').replace(/\/$/, '') === normalized);
}
```

### Update `lib/cms/index.ts`

In `getBySlug()`, detect Cloudflare and use the pre-built loader instead of `fs`:

```typescript
const isCloudflareWorkers = () =>
  process.env.DEPLOYMENT_PLATFORM === 'cloudflare' ||
  typeof (globalThis as any).WebSocketPair !== 'undefined';

// In getBySlug():
if (localDirectory) {
  if (isCloudflareWorkers()) {
    const { getBlogPostBySlug } = await import('./blog-data-loader');
    const post = getBlogPostBySlug(slug, locale);
    if (post && post.status !== 'draft') {
      return { post: mapLocalFileToPostBase(post, post.content, locale), ... };
    }
  } else if (fs) {
    // existing Node.js filesystem logic
  }
}
```

Also make `fs` dynamically required (not a top-level import) to avoid edge runtime errors:

```typescript
let fs: typeof import('fs') | null = null;
if (typeof window === 'undefined') {
  try { fs = require('fs'); } catch { /* edge env */ }
}
```

---

## Step 13 — Fix Email Rendering for Cloudflare Workers

Cloudflare Workers does not support passing React elements directly to Resend's `react:` prop at runtime. Instead, render the React email component to an HTML string using a dynamic import of `react-dom/server`.

### Update `actions/resend/index.ts`

```typescript
// Add a helper that dynamically imports react-dom/server
// Dynamic import avoids static bundling issues in the CF Workers edge runtime
async function renderEmailToHtml(element: React.ReactElement): Promise<string> {
  const { renderToStaticMarkup } = await import('react-dom/server');
  const htmlBody = renderToStaticMarkup(element);
  const doctype =
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';
  return `${doctype}${htmlBody.replace(/<!DOCTYPE.*?>/i, '')}`;
}

// Inside sendEmail(), replace the react: field with a pre-rendered html: string:
// Before:
const emailContent = reactProps
  ? React.createElement(react as React.ComponentType<any>, reactProps)
  : (react as React.ReactElement);
await resend.emails.send({ from, to, subject, react: emailContent, ... });

// After:
const emailElement = reactProps
  ? React.createElement(react as React.ComponentType<any>, reactProps)
  : (react as React.ReactElement);
const html = await renderEmailToHtml(emailElement as React.ReactElement);
await resend.emails.send({ from, to, subject, html, ... });
```

**Why:** Cloudflare Workers may fail to resolve `react-dom/server` at the module level. A dynamic `import()` defers resolution to request time, where the edge runtime can handle it correctly.

---

## Migration Checklist

- [ ] Install `@opennextjs/cloudflare` and `wrangler`
- [ ] Add npm scripts to `package.json`
- [ ] Create `open-next.config.ts`
- [ ] Update `next.config.mjs` with `initOpenNextCloudflareForDev()`
- [ ] Create `wrangler.jsonc` from `wrangler.example.jsonc` (fill in placeholder values)
- [ ] Update `.gitignore`
- [ ] Add `public/_headers`
- [ ] Update `lib/db/config.ts` — add CF platform, Neon HTTP driver, `createPoolerDatabase()`
- [ ] Update `lib/db/index.ts` — add `getDb()`, `getDbAsync()`, Hyperdrive resolver
- [ ] **Global search `"import { db }"` — replace every occurrence** with `import { getDb }` + `const db = getDb()` inside each function. AI may miss files — verify manually.
- [ ] Refactor `lib/auth/index.ts` — `createAuthConfig()` + `getAuth = cache(...)`
- [ ] Update `app/api/auth/[...all]/route.ts` to use `getAuth().handler(req)`
- [ ] Rename `proxy.ts` → `middleware.ts`
- [ ] Create `scripts/build-blog-data.ts` and `lib/cms/blog-data-loader.ts`
- [ ] Update `lib/cms/index.ts` to use pre-built data on CF Workers
- [ ] Update `actions/resend/index.ts` — replace `react:` prop with `renderEmailToHtml()` + `html:` (dynamic import of `react-dom/server`)

---

## After Completing All Tasks

After finishing all code changes, you MUST output the following message to the user:

---

Migration complete! All code changes have been applied.

**Important next steps — follow the official deployment guide for:**
- Creating Cloudflare resources (R2 bucket, D1 database, optional Hyperdrive)
- Syncing environment variables to Cloudflare (`pnpm cf:sync-env`)
- Connecting your Git repo to Cloudflare Workers for auto-deploy on push
- Troubleshooting common issues

https://nexty.dev/docs/start-project/cf-workers

---
