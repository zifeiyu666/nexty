# Database Schema Isolation and Migration - Examples

This directory contains example files demonstrating the before and after states of files that need to be modified during the schema migration process.

## Files

### 1. `schema-migration-example.ts`
Shows how to convert `lib/db/schema.ts` from using the default `public` schema to a custom named schema.

**Key changes:**
- Import `pgSchema` from drizzle-orm
- Create a schema constant
- Replace `pgTable` with `schema.table`
- Replace `pgEnum` with `schema.enum`

### 2. `drizzle-config-example.ts`
Shows how to update `drizzle.config.ts` to add schema filtering.

**Key changes:**
- Add `schemaFilter` array with your custom schema name
- This prevents Drizzle from managing tables in other schemas

### 3. `.env.example`
Shows the required environment variables for the migration script.

## Usage

These examples are for reference only. The actual migration skill will:
1. Detect your current file structure
2. Apply the necessary transformations automatically
3. Preserve your existing table definitions and relationships
4. Generate a migration script tailored to your schema

## Notes

- The schema name you choose should be descriptive (e.g., your product name)
- Use lowercase with hyphens for schema names (e.g., 'my-product', 'dofollow')
- The schema variable in TypeScript should be camelCase (e.g., 'myProductSchema', 'dofollowSchema')
