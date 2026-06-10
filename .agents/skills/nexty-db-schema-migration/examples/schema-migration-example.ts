/**
 * Example: Before and After Schema Migration
 * 
 * This file demonstrates the changes needed in lib/db/schema.ts
 */

// ============================================
// BEFORE: Using default public schema
// ============================================

import { pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['admin', 'user', 'creator']);

export const user = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  role: roleEnum('role').default('user'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => user.id),
  productName: varchar('product_name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});


// ============================================
// AFTER: Using custom schema (e.g., 'myproduct')
// ============================================

import { pgSchema } from 'drizzle-orm/pg-core';

// 1. Define your custom schema
export const myproductSchema = pgSchema('myproduct'); // Schema name in database

// 2. Convert pgEnum to schema.enum
export const roleEnum = myproductSchema.enum('role', ['admin', 'user', 'creator']);

// 3. Convert pgTable to schema.table
export const user = myproductSchema.table('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  role: roleEnum('role').default('user'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = myproductSchema.table('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => user.id),
  productName: varchar('product_name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================
// Key Changes Summary:
// ============================================
// 1. Import pgSchema from drizzle-orm/pg-core
// 2. Create schema constant: const xxxSchema = pgSchema('xxx')
// 3. Replace pgTable(...) with xxxSchema.table(...)
// 4. Replace pgEnum(...) with xxxSchema.enum(...)
// 5. All other column types and configurations remain the same
// 6. Foreign key references still work the same way
