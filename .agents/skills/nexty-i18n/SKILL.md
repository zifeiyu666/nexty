---
name: nexty-i18n
description: Handle internationalization in NEXTY.DEV using next-intl. Use when adding translatable text, creating locale-aware pages, or formatting dates/numbers. Covers translation hooks, message files, and routing.
---

# Internationalization in NEXTY.DEV

## Overview

- **Library**: next-intl
- **Routing Config**: `i18n/routing.ts`
- **Request Config**: `i18n/request.ts`
- **Messages**: `i18n/messages/{locale}/`

## Supported Locales

Configured in `i18n/routing.ts`:

```typescript
export const LOCALES = ['en', 'zh', 'ja']
export const DEFAULT_LOCALE = 'en'
export const LOCALE_NAMES: Record<string, string> = {
  'en': "English",
  'zh': "中文",
  'ja': "日本語",
};
```

## Message File Structure

Messages are organized by locale folder, with separate JSON files per page/feature:

```
i18n/messages/
├── en/
│   ├── common.json           # Shared translations (spread at root)
│   ├── Landing.json          # Landing page
│   ├── Pricing.json          # Pricing page
│   ├── NotFound.json         # 404 page
│   ├── Glossary.json         # Glossary page
│   └── Dashboard/
│       ├── Admin/
│       │   ├── Overview.json
│       │   ├── Users.json
│       │   ├── Orders.json
│       │   ├── Prices.json
│       │   ├── Blogs.json
│       │   ├── Glossary.json
│       │   └── R2Files.json
│       └── User/
│           ├── Settings.json
│           └── CreditHistory.json
├── zh/
│   └── (same structure)
└── ja/
    └── (same structure)
```

## Adding New Translations

### 1. Create/Edit Message Files

For a new feature, create JSON files in each locale folder:

```json
// i18n/messages/en/MyFeature.json
{
  "title": "My Feature",
  "description": "This is my new feature",
  "buttons": {
    "save": "Save",
    "cancel": "Cancel"
  },
  "messages": {
    "success": "Operation completed successfully",
    "error": "Something went wrong"
  }
}
```

```json
// i18n/messages/zh/MyFeature.json
{
  "title": "我的功能",
  "description": "这是我的新功能",
  "buttons": {
    "save": "保存",
    "cancel": "取消"
  },
  "messages": {
    "success": "操作成功完成",
    "error": "出了点问题"
  }
}
```

```json
// i18n/messages/ja/MyFeature.json
{
  "title": "マイ機能",
  "description": "これは私の新機能です",
  "buttons": {
    "save": "保存",
    "cancel": "キャンセル"
  },
  "messages": {
    "success": "操作が正常に完了しました",
    "error": "問題が発生しました"
  }
}
```

### 2. Register in request.ts

Add the new message file to `i18n/request.ts`:

```typescript
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  // ...
  return {
    locale,
    messages: {
      // Existing messages...
      Landing: (await import(`./messages/${locale}/Landing.json`)).default,
      
      // Add your new feature
      MyFeature: (await import(`./messages/${locale}/MyFeature.json`)).default,
      
      // common spread at root
      ...common
    }
  };
});
```

### 3. Use in Server Components

```typescript
import { getTranslations } from 'next-intl/server';

export default async function MyPage() {
  const t = await getTranslations('MyFeature');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <button>{t('buttons.save')}</button>
    </div>
  );
}
```

### 4. Use in Client Components

```typescript
'use client';

import { useTranslations } from 'next-intl';

export function MyClientComponent() {
  const t = useTranslations('MyFeature');

  return (
    <div>
      <h1>{t('title')}</h1>
      <button>{t('buttons.save')}</button>
    </div>
  );
}
```

## Common Translations

Translations in `common.json` are spread at the root level, accessed without namespace:

```typescript
// common.json contains Home, Login, Blogs, Header, Footer, etc.
const t = await getTranslations('Home');
const loginT = await getTranslations('Login');
const headerT = await getTranslations('Header');
```

## Dynamic Values (Interpolation)

```json
{
  "greeting": "Hello, {name}!",
  "itemCount": "You have {count} items"
}
```

```typescript
t('greeting', { name: user.name })
t('itemCount', { count: items.length })
```

## Pluralization

```json
{
  "items": "{count, plural, =0 {No items} one {# item} other {# items}}"
}
```

```typescript
t('items', { count: 0 })  // "No items"
t('items', { count: 1 })  // "1 item"
t('items', { count: 5 })  // "5 items"
```

## Date and Number Formatting

### Server Components

```typescript
import { getFormatter } from 'next-intl/server';

export default async function MyPage() {
  const format = await getFormatter();

  return (
    <div>
      <p>{format.dateTime(new Date(), { dateStyle: 'long' })}</p>
      <p>{format.number(1234.56, { style: 'currency', currency: 'USD' })}</p>
      <p>{format.relativeTime(new Date('2024-01-01'))}</p>
    </div>
  );
}
```

### Client Components

```typescript
'use client';

import { useFormatter } from 'next-intl';

export function MyClientComponent() {
  const format = useFormatter();

  return (
    <div>
      <p>{format.dateTime(new Date(), { dateStyle: 'long' })}</p>
      <p>{format.number(1234.56, { style: 'currency', currency: 'USD' })}</p>
    </div>
  );
}
```

## Locale-Aware Navigation

Use navigation utilities from `i18n/routing.ts`:

```typescript
import { Link, redirect, usePathname, useRouter } from '@/i18n/routing';

// Link - automatically handles locale prefix
<Link href="/dashboard">Dashboard</Link>

// With explicit locale
<Link href="/dashboard" locale="zh">Dashboard (Chinese)</Link>

// redirect in server actions
redirect('/dashboard');

// useRouter in client components
const router = useRouter();
router.push('/dashboard');
```

## Get Current Locale

### Server Components

```typescript
import { getLocale } from 'next-intl/server';

export default async function MyPage() {
  const locale = await getLocale();
  // ...
}
```

### Client Components

```typescript
'use client';

import { useLocale } from 'next-intl';

export function MyComponent() {
  const locale = useLocale();
  // ...
}
```

## Page Metadata with i18n

```typescript
import { constructMetadata } from '@/lib/metadata';
import { Metadata } from 'next';
import { Locale } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
  params,
}: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'MyFeature' });

  return constructMetadata({
    page: 'MyFeature',
    title: t('title'),
    description: t('description'),
    locale: locale as Locale,
    path: '/my-feature',
  });
}
```

## Language Switcher

Use the existing `LocaleSwitcher` component:

```typescript
import { LocaleSwitcher } from '@/components/LocaleSwitcher';

<LocaleSwitcher />
```

## Routing Configuration

Key settings in `i18n/routing.ts`:

```typescript
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localeDetection: process.env.NEXT_PUBLIC_LOCALE_DETECTION === 'true',
  localePrefix: 'as-needed', // Only show prefix for non-default locales
});
```

## Checklist

1. Create JSON message files in all locale folders (`en/`, `zh/`, `ja/`)
2. Register new message files in `i18n/request.ts`
3. Use `getTranslations` in Server Components
4. Use `useTranslations` in Client Components
5. Use `Link` from `@/i18n/routing` for navigation
6. Use formatters for dates/numbers/currencies
7. Update metadata with translated title/description
8. Test in all supported locales
