#!/usr/bin/env node

/**
 * Helper script to generate the migration script template
 * This script is called by the AI agent to create a customized migration script
 */

const fs = require('fs');
const path = require('path');

function generateMigrationScript(schemaName, tables, projectRoot) {
  const template = `
import * as dotenv from 'dotenv';
import { getTableConfig } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../lib/db/schema';

// Load environment variables
dotenv.config();

const { OLD_DB_URL, NEW_DB_URL } = process.env;

if (!OLD_DB_URL || !NEW_DB_URL) {
  console.error('❌ Error: Please ensure both OLD_DB_URL and NEW_DB_URL are configured in your .env file');
  console.error('   - OLD_DB_URL: Connection string for the old database');
  console.error('   - NEW_DB_URL: Connection string for the new database');
  process.exit(1);
}

// Define tables to migrate (in dependency order)
// Note: Base tables first, then tables with foreign keys
const tables = [
${tables.map(t => `  { name: '${t.name}', table: schema.${t.exportName} },`).join('\n')}
];

async function main() {
  console.log('🚀 Starting data migration...');
  console.log('📦 Source database:', OLD_DB_URL?.split('@')[1]);
  console.log('📦 Target database:', NEW_DB_URL?.split('@')[1]);
  console.log('📝 Target schema: ${schemaName}');

  const sourceClient = postgres(OLD_DB_URL!, { max: 1 });
  const destClient = postgres(NEW_DB_URL!, { max: 1 });
  const destDb = drizzle(destClient, { schema });

  try {
    // Clear old data from target database (in reverse order to handle foreign keys)
    console.log('\\n🧹 Clearing old data from target database...');
    for (let i = tables.length - 1; i >= 0; i--) {
      const t = tables[i];
      try {
        await destClient\`TRUNCATE TABLE ${schemaName}.\${destClient(t.name)} CASCADE\`;
        console.log(\`   ✓ Cleared table: \${t.name}\`);
      } catch (e) {
        console.warn(\`   ⚠️ Could not clear table \${t.name}:\`, e.message);
      }
    }
    console.log('✅ Target database cleared');

    // Start migration
    for (const t of tables) {
      console.log(\`\\n⏳ Migrating table: \${t.name}...\`);

      // Build column mapping: database column name (snake_case) -> Schema property name (camelCase)
      const columnMapping = {};
      const tableColumns = t.table;
      
      for (const key in tableColumns) {
        const col = tableColumns[key];
        if (col && typeof col === 'object' && 'name' in col) {
          // key is the Schema property name (camelCase: 'cardTitle')
          // col.name is the database column name (snake_case: 'card_title')
          columnMapping[col.name] = key;
        }
      }

      // Query data from old database (assuming old database uses public schema)
      const rows = await sourceClient\`SELECT * FROM public.\${sourceClient(t.name)}\`;

      if (rows.length === 0) {
        console.log(\`   ⚪ Table \${t.name} is empty, skipping\`);
        continue;
      }

      console.log(\`   📊 Found \${rows.length} records\`);

      // Transform data format
      const transformRow = (row) => {
        const newRow = {};
        for (const dbColName in row) {
          const schemaKey = columnMapping[dbColName];
          if (schemaKey) {
            newRow[schemaKey] = row[dbColName];
          } else {
            // If no mapping found, keep as is (column name might already match)
            newRow[dbColName] = row[dbColName];
          }
        }
        return newRow;
      };

      // Batch insert
      const batchSize = 100;
      for (let i = 0; i < rows.length; i += batchSize) {
        const rawBatch = rows.slice(i, i + batchSize);
        const batch = rawBatch.map(transformRow);

        try {
          await destDb.insert(t.table).values(batch).onConflictDoNothing();
          console.log(\`   ✓ Migrated \${Math.min(i + batchSize, rows.length)}/\${rows.length} records\`);
        } catch (e) {
          console.error(\`   ❌ Batch insert failed (table \${t.name}):\`, e.message);
          console.error('      Data sample:', batch[0]);
          throw e;
        }
      }

      console.log(\`   ✅ Table \${t.name} migration complete\`);
    }

    console.log('\\n🎉 All data migrated successfully!');
    console.log('\\n📋 Next steps:');
    console.log('  1. Verify data integrity in the new database');
    console.log('  2. Test application functionality locally');
    console.log('  3. Update production DATABASE_URL environment variable');
    console.log('  4. Deploy to production');

  } catch (error) {
    console.error('\\n❌ Error during migration:', error);
    process.exit(1);
  } finally {
    await sourceClient.end();
    await destClient.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
`;

  return template.trim();
}

module.exports = { generateMigrationScript };

// If run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node generate-migration-script.js <schemaName> [outputPath]');
    process.exit(1);
  }

  const schemaName = args[0];
  const outputPath = args[1] || './scripts/migrate-to-schema.ts';

  // This would need actual table detection - simplified example
  const tables = [
    { name: 'user', exportName: 'user' },
    { name: 'products', exportName: 'products' },
  ];

  const script = generateMigrationScript(schemaName, tables);
  fs.writeFileSync(outputPath, script);
  console.log(`✅ Migration script generated at: ${outputPath}`);
}
