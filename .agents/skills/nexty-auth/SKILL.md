---
name: nexty-auth
description: Implement authentication in NEXTY.DEV using Better Auth. Use when checking sessions, protecting routes, adding social logins, or managing user roles. Covers server/client auth, guards, and admin checks.
---

# Authentication in NEXTY.DEV

## Overview

- **Library**: Better Auth with Drizzle adapter
- **Providers**: Google, GitHub, Magic Link
- **Config**: `lib/auth/index.ts`, `lib/auth/auth-client.ts`
- **Server helpers**: `lib/auth/server.ts`

## Server-Side Auth

### Get Session in Server Components

```typescript
import { getSession } from '@/lib/auth/server';

export default async function MyPage() {
  const session = await getSession();
  
  if (!session) {
    // User not logged in
    redirect('/login');
  }

  const user = session.user;
  // user.id, user.email, user.name, user.image, user.role
  
  return <div>Welcome, {user.name}</div>;
}
```

### Get Session in Server Actions

```typescript
'use server';

import { getSession } from '@/lib/auth/server';
import { actionResponse } from '@/lib/action-response';

export async function myServerAction() {
  const session = await getSession();
  if (!session) {
    return actionResponse.unauthorized();
  }

  const userId = session.user.id;
  // ... do something with userId
}
```

### Admin Check

```typescript
'use server';

import { isAdmin } from '@/lib/auth/server';
import { actionResponse } from '@/lib/action-response';

export async function adminOnlyAction() {
  if (!(await isAdmin())) {
    return actionResponse.forbidden('Admin privileges required.');
  }

  // ... admin-only logic
}
```

### Get Session in API Routes

```typescript
import { getSession } from '@/lib/auth/server';
import { apiResponse } from '@/lib/api-response';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return apiResponse.unauthorized();
  }

  // ... handle authenticated request
}
```

## Client-Side Auth

### Using Auth Client

```typescript
'use client';

import { authClient } from '@/lib/auth/auth-client';

// Get session
const { data: session } = await authClient.getSession();

// Sign out
await authClient.signOut();

// Sign in with Google
await authClient.signIn.social({ provider: 'google' });

// Sign in with GitHub
await authClient.signIn.social({ provider: 'github' });

// Sign in with Magic Link
await authClient.signIn.magicLink({ email: 'user@example.com' });
```

### useSession Hook

```typescript
'use client';

import { authClient } from '@/lib/auth/auth-client';

export function MyComponent() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Not logged in</div>;
  }

  return <div>Hello, {session.user.name}</div>;
}
```

## Protected Route Patterns

### Server Component Page

```typescript
// app/[locale]/(protected)/dashboard/my-page/page.tsx
import { getSession } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export default async function MyProtectedPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  return <div>Protected content for {session.user.email}</div>;
}
```

### Admin-Only Page

```typescript
// app/[locale]/(protected)/dashboard/(admin)/my-admin-page/page.tsx
import { isAdmin } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export default async function MyAdminPage() {
  if (!(await isAdmin())) {
    redirect('/403');
  }

  return <div>Admin only content</div>;
}
```

### Client Component with Auth Guard

```typescript
'use client';

import { authClient } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedComponent({ children }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
```

## User Data Access

### Session User Properties

```typescript
const session = await getSession();
const user = session?.user;

// Available properties
user.id          // UUID
user.email       // Email address
user.name        // Display name
user.image       // Avatar URL
user.role        // 'user' | 'admin'
user.emailVerified
user.createdAt
user.updatedAt
```

### Query User from Database

```typescript
import { db } from '@/lib/db';
import { user as userSchema } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const [user] = await db.select()
  .from(userSchema)
  .where(eq(userSchema.id, userId))
  .limit(1);
```

## Login UI Components

### Using Existing Components

```typescript
import { LoginDialog } from '@/components/auth/LoginDialog';
import { LoginForm } from '@/components/auth/LoginForm';
import { LoginButton } from '@/components/header/LoginButton';
import { GoogleOneTap } from '@/components/auth/GoogleOneTap';

// Dialog with login form
<LoginDialog />

// Standalone login form
<LoginForm />

// Login button for header
<LoginButton />

// Google One Tap (auto-shows for logged out users)
<GoogleOneTap />
```

## Sign Out

### Server-Side (API Route)

```typescript
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  await auth.api.signOut({ headers: request.headers });
  return Response.redirect('/');
}
```

### Client-Side

```typescript
'use client';

import { authClient } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';

function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/');
  };

  return <button onClick={handleSignOut}>Sign Out</button>;
}
```

## Adding Social Providers

To add a new social provider, update `lib/auth/index.ts`:

```typescript
export const auth = betterAuth({
  // ...
  socialProviders: {
    google: {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    // Add new provider here
  },
});
```

Then add corresponding env variables.

## Checklist

1. Use `getSession()` for server-side auth checks
2. Use `isAdmin()` for admin-only operations
3. Use `authClient` for client-side auth
4. Always redirect unauthenticated users appropriately
5. Never trust client-provided user roles
6. Use existing auth components when possible
7. Keep secrets in environment variables

