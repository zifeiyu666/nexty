/**
 * Example: Before and After Drizzle Config
 * 
 * This file demonstrates the changes needed in drizzle.config.ts
 * 
 * Note: This file contains both BEFORE and AFTER examples for demonstration.
 * Do not use this file directly - it's for reference only.
 */


// ============================================
// BEFORE: Default configuration
// ============================================

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});


// ============================================
// AFTER: With schema filter
// ============================================


export default defineConfig({
  dialect: 'postgresql',
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations', // Migration files output directory
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // KEY ADDITION: Filter to only manage the specific schema
  // This prevents Drizzle from touching other schemas in the database
  schemaFilter: ['myproduct'], // Replace 'myproduct' with your schema name
});


// ============================================
// Key Changes Summary:
// ============================================
// 1. Add schemaFilter array with your custom schema name
// 2. Ensure 'out' points to './lib/db/migrations'
// 3. This ensures Drizzle only manages tables in your schema
// 4. Prevents conflicts with other schemas (like 'public')
// 5. Essential when sharing one database with multiple projects
