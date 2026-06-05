---
name: nexty-server-action
description: Create Server Actions and API Route Handlers in NEXTY.DEV. Use when implementing data mutations, form handling, or REST API endpoints. Covers action response patterns, validation, and auth guards.
---

# Server Actions & API Routes in NEXTY.DEV

## Server Actions (Preferred for Mutations)

Server Actions are the preferred way to handle data mutations. Place them in `actions/` directory.

### Basic Server Action

```typescript
// actions/my-feature/index.ts
'use server';

import { actionResponse, ActionResult } from '@/lib/action-response';
import { getSession } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { myTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const createItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export async function createItem(
  input: z.infer<typeof createItemSchema>
): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  if (!session) return actionResponse.unauthorized();

  const parsed = createItemSchema.safeParse(input);
  if (!parsed.success) {
    return actionResponse.badRequest(parsed.error.errors[0].message);
  }

  try {
    const [item] = await db.insert(myTable)
      .values({
        name: parsed.data.name,
        description: parsed.data.description,
        userId: session.user.id,
      })
      .returning({ id: myTable.id });

    return actionResponse.success({ id: item.id });
  } catch (error: any) {
    console.error('Error creating item:', error);
    return actionResponse.error(error.message || 'Failed to create item');
  }
}
```

### Admin-Only Action

```typescript
// actions/my-feature/admin.ts
'use server';

import { actionResponse, ActionResult } from '@/lib/action-response';
import { isAdmin } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { myTable } from '@/lib/db/schema';
import { getErrorMessage } from '@/lib/error-utils';
import { count, desc, ilike, or } from 'drizzle-orm';

export interface GetItemsResult {
  success: boolean;
  data?: { items: any[]; totalCount: number };
  error?: string;
}

export async function getItems({
  pageIndex = 0,
  pageSize = 20,
  filter = "",
}: {
  pageIndex?: number;
  pageSize?: number;
  filter?: string;
}): Promise<GetItemsResult> {
  if (!(await isAdmin())) {
    return actionResponse.forbidden('Admin privileges required.');
  }

  try {
    const conditions = filter
      ? [ilike(myTable.name, `%${filter}%`)]
      : [];

    const [items, totalCountResult] = await Promise.all([
      db.select()
        .from(myTable)
        .where(conditions.length > 0 ? or(...conditions) : undefined)
        .orderBy(desc(myTable.createdAt))
        .offset(pageIndex * pageSize)
        .limit(pageSize),
      db.select({ value: count() })
        .from(myTable)
        .where(conditions.length > 0 ? or(...conditions) : undefined),
    ]);

    return actionResponse.success({
      items,
      totalCount: totalCountResult[0].value,
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    return actionResponse.error(getErrorMessage(error));
  }
}
```

## API Route Handlers (For External APIs)

Use Route Handlers for REST APIs, webhooks, or when you need HTTP-specific features.

### GET Endpoint

```typescript
// app/api/my-feature/route.ts
import { apiResponse } from '@/lib/api-response';
import { getSession } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { myTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return apiResponse.unauthorized();
  }

  try {
    const items = await db.select()
      .from(myTable)
      .where(eq(myTable.userId, session.user.id));

    return apiResponse.success(items);
  } catch (error: any) {
    console.error('Error fetching items:', error);
    return apiResponse.serverError(error.message);
  }
}
```

### POST Endpoint with Validation

```typescript
// app/api/my-feature/route.ts
import { apiResponse } from '@/lib/api-response';
import { getSession } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { myTable } from '@/lib/db/schema';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1),
  data: z.record(z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return apiResponse.unauthorized();
  }

  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    
    if (!parsed.success) {
      return apiResponse.badRequest(parsed.error.errors[0].message);
    }

    const [item] = await db.insert(myTable)
      .values({
        name: parsed.data.name,
        userId: session.user.id,
      })
      .returning();

    return apiResponse.success(item, 201);
  } catch (error: any) {
    console.error('Error creating item:', error);
    return apiResponse.serverError(error.message);
  }
}
```

## Response Helpers

### Action Response (`lib/action-response.ts`)

```typescript
actionResponse.success(data?)           // Success with optional data
actionResponse.error(message)           // Generic error
actionResponse.unauthorized(message?)   // 401 equivalent
actionResponse.badRequest(message?)     // 400 equivalent
actionResponse.forbidden(message?)      // 403 equivalent
actionResponse.notFound(message?)       // 404 equivalent
actionResponse.conflict(message?)       // 409 equivalent
```

### API Response (`lib/api-response.ts`)

```typescript
apiResponse.success(data, status?)      // JSON success response
apiResponse.error(message, status?)     // JSON error response
apiResponse.serverError(message?)       // 500 response
apiResponse.unauthorized(message?)      // 401 response
apiResponse.badRequest(message?)        // 400 response
apiResponse.forbidden(message?)         // 403 response
apiResponse.notFound(message?)          // 404 response
apiResponse.conflict(message?)          // 409 response
```

## Client Usage

### Calling Server Actions

```typescript
'use client';

import { createItem } from '@/actions/my-feature';
import { toast } from 'sonner';

async function handleSubmit(data: FormData) {
  const result = await createItem({
    name: data.get('name') as string,
  });

  if (result.success) {
    toast.success('Item created!');
  } else {
    toast.error(result.error);
  }
}
```

### Calling API Routes

```typescript
'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

function MyComponent() {
  const { data, error, isLoading } = useSWR('/api/my-feature', fetcher);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  
  return <div>{JSON.stringify(data)}</div>;
}
```

## Checklist

1. Use `'use server'` directive for Server Actions
2. Always validate input with zod
3. Use appropriate auth guard (`getSession()` or `isAdmin()`)
4. Return consistent response format using helpers
5. Handle errors with try/catch and log to console
6. Use transactions for multi-step operations

