# Nexty Database Schema Migration Skill

An AI skill that automates database schema isolation and migration for Next.js + Drizzle ORM projects.

## Purpose

This skill helps you migrate your project to use PostgreSQL Schema isolation, enabling multiple products to share a single Supabase database instance while keeping data completely separate.

## Use Cases

✅ **Perfect for:**
- Multiple low-traffic side projects
- Migrating from Neon to Supabase  
- Cost optimization (share one Supabase instance)
- Development/staging/production isolation
- Multi-tenant SaaS applications

❌ **Not suitable for:**
- High-traffic production apps (needs dedicated resources)
- Projects requiring independent scaling
- Compliance mandating physical data separation

## How It Works

### Technical Background

PostgreSQL schemas work like folders - one database can have multiple schemas, each with its own isolated tables. Think of it as:

```
Database (Supabase Instance)
├── public schema (default)
├── product1 schema (your first product)
│   ├── users table
│   ├── posts table
│   └── orders table
└── product2 schema (your second product)
    ├── users table
    ├── products table
    └── analytics table
```

Each schema is completely isolated - no naming conflicts, no data leakage.

## Usage

### Quick Start

In your conversation with Gemini:

```
Use the nexty-db-schema-migration skill to migrate my database
```

Or more specifically:

```
I want to migrate from Neon to Supabase using schema isolation. 
Help me set it up.
```

### The AI Will Ask You

1. **What should the new schema be named?**
   - Suggestion: Use your product name
   - Example: `dofollow`, `bitlap`, `myapp`
   - Use lowercase, can include hyphens

2. **Have you configured OLD_DB_URL and NEW_DB_URL in .env?**
   - Must be configured before proceeding
   - See setup instructions below

3. **Have you backed up your database?**
   - Always backup before migration!

### Environment Setup

Create or update your `.env` file:

```bash
# Old database (source) - your existing database
OLD_DB_URL=postgresql://user:password@old-host:5432/database

# New database (destination) - your new Supabase database
NEW_DB_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

**Examples:**

```bash
# Migrating from Neon to Supabase
OLD_DB_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb
NEW_DB_URL=postgresql://postgres:pass@db.projectref.supabase.co:5432/postgres

# Migrating between Supabase projects
OLD_DB_URL=postgresql://postgres:pass@db.old-proj.supabase.co:5432/postgres
NEW_DB_URL=postgresql://postgres:pass@db.new-proj.supabase.co:5432/postgres
```

## What Gets Automated

The skill automatically performs these operations:

### ✅ File Modifications

1. **Updates `drizzle.config.ts`**
   - Adds `schemaFilter: ['your-schema']`
   - Ensures `out: './lib/db/migrations'`

2. **Converts `lib/db/schema.ts`**
   - Imports `pgSchema` from drizzle-orm
   - Creates schema constant
   - Converts all `pgTable()` → `schema.table()`
   - Converts all `pgEnum()` → `schema.enum()`

3. **Updates `package.json`**
   - Ensures migration scripts exist:
     - `db:generate` - Generate migrations
     - `db:migrate` - Apply migrations
     - `db:migrate-data` - Run data migration

4. **Cleans Migration Directory**
   - Removes old migration files from `lib/db/migrations/`
   - Prepares for fresh schema generation

5. **Creates Migration Script**
   - Generates `scripts/migrate-to-schema.ts`
   - Detects all tables and dependencies
   - Handles column name mapping (snake_case ↔ camelCase)
   - Includes batch processing and error handling

### ❌ What You Must Do Manually

For safety, these database operations require your explicit action:

1. **Generate new migrations**
   ```bash
   pnpm db:generate
   ```

2. **Apply schema to new database**
   ```bash
   pnpm db:migrate
   ```

3. **Run data migration**
   ```bash
   pnpm db:migrate-data
   ```

4. **Verify data integrity**
   - Check table structure in Supabase dashboard
   - Verify row counts match
   - Test queries

5. **Update production environment**
   - Change `DATABASE_URL` in Vercel/Railway/etc.
   - Redeploy application

6. **Test thoroughly**
   - Local testing
   - Production smoke tests

## Directory Structure

```
your-project/
├── .env                               # OLD_DB_URL and NEW_DB_URL configured here
├── drizzle.config.ts                  # ← Modified: adds schemaFilter
├── package.json                       # ← Modified: adds db:migrate-data script
├── lib/
│   └── db/
│       ├── schema.ts                  # ← Modified: converts to schema-based tables
│       └── migrations/                # ← Cleaned and regenerated
└── scripts/
    └── migrate-to-schema.ts           # ← Created: data migration script
```

## Cost Savings

Reality check on how much you can save:

**Scenario: 5 small side projects**

| Approach | Cost | Details |
|----------|------|---------|
| Separate databases | $50/mo | 5 × $10 Supabase instances |
| Schema isolation | $0-25/mo | 1 free or Pro instance |
| **Savings** | **$25-50/mo** | **$300-600/year!** |

## Success Criteria

Your migration is successful when:

- ✅ New schema exists in database
- ✅ All tables created in new schema
- ✅ Data row counts match old database
- ✅ Application runs without errors
- ✅ All features work as expected
- ✅ Production environment stable

## Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| "relation does not exist" | Schema not in search path - check drizzle config |
| Column name mismatch | Review column mapping in migration script |
| Foreign key errors | Adjust table order in migration script |
| Drizzle touching public schema | Verify `schemaFilter` is set correctly |

### Getting Help

1. Check the generated files for issues
2. Review `CHECKLIST.md` for step-by-step guide
3. See `RESOURCES.md` for documentation links
4. Look at `examples/` for reference implementations

## Files in This Skill

- **`SKILL.md`** - Detailed instructions for AI agent
- **`README.md`** (this file) - User documentation
- **`SUMMARY.md`** - Quick overview and reference
- **`CHECKLIST.md`** - Step-by-step migration guide
- **`RESOURCES.md`** - Links, commands, troubleshooting
- **`examples/`** - Before/after code examples
- **`scripts/`** - Helper scripts for generation

## Requirements

- Next.js project
- Drizzle ORM for database management
- PostgreSQL databases (source and target)
- Node.js with tsx or ts-node
- pnpm (or npm/yarn)

## Version

**v1.0.0** - Initial release (2026-02-01)

Changes from original:
- Full English documentation
- Project-specific paths (`lib/db/migrations/`)
- Simplified environment variables (OLD_DB_URL/NEW_DB_URL)
- Package.json modification included
- Enhanced error handling and logging

## License

This skill is part of the NEXTY.DEV template ecosystem.

---

**Ready to save money and consolidate your databases?**  
Just ask your AI assistant to use this skill!

