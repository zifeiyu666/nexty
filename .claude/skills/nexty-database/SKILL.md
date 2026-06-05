---
name: nexty-database
description: Work with PostgreSQL database using Drizzle ORM in NEXTY.DEV. Use when creating tables, writing queries, running migrations, or managing schema. Covers schema definition, CRUD operations, and transactions.
---

# Database Operations in NEXTY.DEV

## Overview

- **ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **Schema**: `lib/db/schema.ts`
- **Migrations**: `lib/db/migrations/`
- **DB Client**: `lib/db/index.ts`

## Defining Schema

### Add New Table

Edit `lib/db/schema.ts`:

```typescript
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { user } from './schema'; // Import existing user table

// Optional: Define enum
export const myStatusEnum = pgEnum('my_status', ['draft', 'active', 'archived']);
export type MyStatus = (typeof myStatusEnum.enumValues)[number];

// Define table
export const myItems = pgTable(
  'my_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => user.id, { onDelete: 'cascade' })
      .notNull(),
    name: text('name').notNull(),
    description: text('description'),
    status: myStatusEnum('status').default('draft').notNull(),
    metadata: jsonb('metadata').default('{}'),
    isActive: boolean('is_active').default(true).notNull(),
    viewCount: integer('view_count').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdIdx: index('idx_my_items_user_id').on(table.userId),
    statusIdx: index('idx_my_items_status').on(table.status),
    createdAtIdx: index('idx_my_items_created_at').on(table.createdAt),
  })
);

// Infer types
export type MyItem = typeof myItems.$inferSelect;
export type NewMyItem = typeof myItems.$inferInsert;
```

### Common Column Types

```typescript
// Primary key
id: uuid('id').primaryKey().defaultRandom(),

// Foreign key
userId: uuid('user_id')
  .references(() => user.id, { onDelete: 'cascade' })
  .notNull(),

// Strings
name: text('name').notNull(),
code: varchar('code', { length: 50 }).unique(),

// Numbers
count: integer('count').default(0).notNull(),
price: numeric('price', { precision: 10, scale: 2 }),

// Boolean
isActive: boolean('is_active').default(true).notNull(),

// JSON
metadata: jsonb('metadata').default('{}'),
features: jsonb('features').default('[]').notNull(),

// Timestamps
createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
updatedAt: timestamp('updated_at', { withTimezone: true })
  .defaultNow()
  .notNull()
  .$onUpdate(() => new Date()),
```

## Running Migrations

```bash
# Generate migration from schema changes
pnpm db:generate

# Apply migrations（Do not perform automatic migration; developers should confirm and execute it manually, as it may affect the production environment.）
pnpm db:migrate

# Open Drizzle Studio
pnpm db:studio
```

## CRUD Operations

### Import Database Client

```typescript
import { db } from '@/lib/db';
import { myItems } from '@/lib/db/schema';
import { eq, and, or, desc, asc, ilike, count, sql } from 'drizzle-orm';
```

### Create (Insert)

```typescript
// Insert single record
const [item] = await db.insert(myItems)
  .values({
    userId: user.id,
    name: 'My Item',
    description: 'Description here',
  })
  .returning();

// Insert multiple records
await db.insert(myItems)
  .values([
    { userId: user.id, name: 'Item 1' },
    { userId: user.id, name: 'Item 2' },
  ]);

// Upsert (insert or update)
await db.insert(myItems)
  .values({ id: existingId, userId: user.id, name: 'Updated' })
  .onConflictDoUpdate({
    target: myItems.id,
    set: { name: 'Updated', updatedAt: new Date() },
  });
```

### Read (Select)

```typescript
// Get all items
const items = await db.select().from(myItems);

// Get with conditions
const activeItems = await db.select()
  .from(myItems)
  .where(eq(myItems.status, 'active'));

// Get specific columns
const names = await db.select({ name: myItems.name })
  .from(myItems);

// With multiple conditions
const filtered = await db.select()
  .from(myItems)
  .where(
    and(
      eq(myItems.userId, userId),
      eq(myItems.status, 'active'),
      ilike(myItems.name, `%${search}%`)
    )
  );

// Ordering
const sorted = await db.select()
  .from(myItems)
  .orderBy(desc(myItems.createdAt));

// Pagination
const paginated = await db.select()
  .from(myItems)
  .orderBy(desc(myItems.createdAt))
  .offset(page * pageSize)
  .limit(pageSize);

// Count
const [result] = await db.select({ count: count() })
  .from(myItems)
  .where(eq(myItems.status, 'active'));
const totalCount = result.count;

// Join tables
const itemsWithUser = await db.select({
  item: myItems,
  userName: user.name,
})
  .from(myItems)
  .leftJoin(user, eq(myItems.userId, user.id));
```

### Update

```typescript
// Update by ID
await db.update(myItems)
  .set({ name: 'New Name', status: 'active' })
  .where(eq(myItems.id, itemId));

// Update with returning
const [updated] = await db.update(myItems)
  .set({ viewCount: sql`${myItems.viewCount} + 1` })
  .where(eq(myItems.id, itemId))
  .returning();
```

### Delete

```typescript
// Delete by ID
await db.delete(myItems)
  .where(eq(myItems.id, itemId));

// Delete with condition
await db.delete(myItems)
  .where(
    and(
      eq(myItems.userId, userId),
      eq(myItems.status, 'draft')
    )
  );
```

## Transactions

```typescript
await db.transaction(async (tx) => {
  // All operations use tx instead of db
  const [item] = await tx.insert(myItems)
    .values({ userId, name: 'New Item' })
    .returning();

  await tx.update(usage)
    .set({ itemCount: sql`${usage.itemCount} + 1` })
    .where(eq(usage.userId, userId));

  // If any operation fails, all changes are rolled back
});

// With row locking
await db.transaction(async (tx) => {
  const [row] = await tx.select()
    .from(myItems)
    .where(eq(myItems.id, itemId))
    .for('update'); // Lock row

  if (row.count > 0) {
    await tx.update(myItems)
      .set({ count: row.count - 1 })
      .where(eq(myItems.id, itemId));
  }
});
```

## Query Operators

```typescript
import { eq, ne, gt, gte, lt, lte, and, or, not, isNull, isNotNull, inArray, notInArray, ilike, sql } from 'drizzle-orm';

eq(column, value)           // =
ne(column, value)           // !=
gt(column, value)           // >
gte(column, value)          // >=
lt(column, value)           // <
lte(column, value)          // <=
and(...conditions)          // AND
or(...conditions)           // OR
not(condition)              // NOT
isNull(column)              // IS NULL
isNotNull(column)           // IS NOT NULL
inArray(column, [...])      // IN (...)
notInArray(column, [...])   // NOT IN (...)
ilike(column, pattern)      // ILIKE (case-insensitive)
sql`...`                    // Raw SQL
```

## Checklist

1. Define table in `lib/db/schema.ts`
2. **Index assessment**: Evaluate indexes for foreign keys, WHERE/ORDER BY columns to prevent full table scans
3. Run `pnpm db:generate` to create migration
4. Run `pnpm db:migrate` to apply migration (**manual execution required, may affect production**)
5. Use typed imports from schema
6. Use transactions for multi-step operations
7. Handle errors and log appropriately

