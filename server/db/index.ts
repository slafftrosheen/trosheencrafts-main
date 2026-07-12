import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased from 2s to 10s
});

// Enhanced error handling for connection pool
pool.on('error', (err, client) => {
  console.error('❌ Unexpected database error on idle client:', err);
  console.error('Error details:', {
    message: err.message,
    code: err.code,
    stack: err.stack,
  });
  
  // Don't exit immediately - let the application handle it gracefully
  // process.exit(-1);
});

/*
pool.on('connect', (client) => {
  console.log('✅ New database client connected');
});

pool.on('remove', (client) => {
  console.log('ℹ️  Database client removed from pool');
});
*/

export const db = drizzle(pool, { schema });

export async function testConnection() {
  let retries = 3;
  let lastError: Error | null = null;
  
  while (retries > 0) {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW()');
      console.log('✅ Database connected:', result.rows[0].now);
      console.log(`ℹ️  Connection pool: ${pool.totalCount} total, ${pool.idleCount} idle, ${pool.waitingCount} waiting`);
      client.release();
      return true;
    } catch (error: any) {
      lastError = error;
      retries--;
      console.error(`❌ Database connection attempt failed (${3 - retries}/3):`, error.message);
      
      if (retries > 0) {
        console.log(`⏳ Retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  console.error('❌ Database connection failed after 3 attempts:', lastError);
  return false;
}

export async function closeConnection() {
  try {
    console.log('🔌 Closing database connection pool...');
    await pool.end();
    console.log('✅ Database connection pool closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    throw error;
  }
}
