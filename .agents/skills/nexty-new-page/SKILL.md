---
name: nexty-new-page
description: Create new pages in NEXTY.DEV template. Use when adding public pages, protected dashboard pages, or admin pages. Handles App Router structure, i18n routing, metadata generation, and layouts.
---

# Creating New Pages in NEXTY.DEV

## Directory Structure

Pages live under `app/[locale]/` with route groups:

```
app/[locale]/
├── (basic-layout)/     # Public pages (blog, pricing, login)
├── (protected)/        # Auth-required pages
│   └── dashboard/
│       ├── (admin)/    # Admin-only pages
│       └── (user)/     # User pages
```

## Page Templates

### Public Page (Server Component)

```typescript
// app/[locale]/(basic-layout)/my-page/page.tsx
import { constructMetadata } from "@/lib/metadata";
import { Metadata } from "next";
import { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
  params,
}: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "MyPage" });

  return constructMetadata({
    page: "MyPage",
    title: t("title"),
    description: t("description"),
    locale: locale as Locale,
    path: `/my-page`,
  });
}

export default async function MyPage() {
  return (
    <div className="container mx-auto py-8">
      <h1>My Page</h1>
    </div>
  );
}
```

### Protected User Page

```typescript
// app/[locale]/(protected)/dashboard/(user)/my-feature/page.tsx
import { getSession } from "@/lib/auth/server";
import { constructMetadata } from "@/lib/metadata";
import { Metadata } from "next";
import { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import MyFeatureClient from "./MyFeatureClient";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
  params,
}: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "MyFeature" });

  return constructMetadata({
    page: "MyFeature",
    title: t("title"),
    description: t("description"),
    locale: locale as Locale,
    path: `/dashboard/my-feature`,
  });
}

export default async function MyFeaturePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return <MyFeatureClient user={session.user} />;
}
```

### Admin Page with Data Table

```typescript
// app/[locale]/(protected)/dashboard/(admin)/my-admin/page.tsx
import { getMyData } from "@/actions/my-feature/admin";
import { constructMetadata } from "@/lib/metadata";
import { Loader2 } from "lucide-react";
import { Metadata } from "next";
import { Locale, useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { columns } from "./Columns";
import { DataTable } from "./DataTable";

const PAGE_SIZE = 20;

async function MyDataTable() {
  const initialData = await getMyData({ pageIndex: 0, pageSize: PAGE_SIZE });
  
  return (
    <DataTable
      columns={columns}
      initialData={initialData.data?.items || []}
      initialPageCount={Math.ceil((initialData.data?.totalCount || 0) / PAGE_SIZE)}
      pageSize={PAGE_SIZE}
    />
  );
}

export default function MyAdminPage() {
  const t = useTranslations("MyAdmin");

  return (
    <div className="space-y-4">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        }
      >
        <MyDataTable />
      </Suspense>
    </div>
  );
}
```

## Key Patterns

### Metadata Generation
- Always use `constructMetadata()` from `@/lib/metadata`
- Add translations to `i18n/messages/{locale}.json`
- Use `getTranslations` for server components

### Authentication
- Use `getSession()` from `@/lib/auth/server`
- Redirect unauthenticated users: `redirect("/login")`
- Admin pages: Use `isAdmin()` check in server actions

### Data Fetching
- Fetch data in Server Components using async/await
- Pass data to Client Components as props
- Use Suspense with loading fallback for async data

### Client Component Pattern
- Create separate `*Client.tsx` files for interactive UI
- Add `"use client"` directive at top
- Receive data from parent Server Component

## Checklist

1. Create page file at correct path
2. Add metadata with `generateMetadata`
3. Add i18n translations for title/description
4. Implement auth guards if protected
5. Use Suspense for async data loading
6. Follow existing layout patterns

