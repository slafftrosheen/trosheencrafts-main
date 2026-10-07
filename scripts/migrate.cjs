#!/usr/bin/env node
/**
 * Minimal SQL migration runner (no external deps).
 *
 * - Applies every .sql file in ./migrations in filename order.
 * - Tracks applied migrations in the `_migrations` table.
 * - Each file runs inside a transaction; failures abort the run.
 * - Safe to re-run: already-applied files are skipped.
 *
 * Usage: node scripts/migrate.cjs
 * Env:   DATABASE_URL (required)
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  const { rows } = await client.query('SELECT name FROM _migrations');
  const applied = new Set(rows.map((r) => r.name));

  let ran = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`= skip  ${file} (already applied)`);
      continue;
    }
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`+ apply ${file}`);
      ran++;
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`! FAILED ${file}: ${err.message}`);
      await client.end();
      process.exit(1);
    }
  }

  console.log(ran === 0 ? 'No pending migrations.' : `Applied ${ran} migration(s).`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
