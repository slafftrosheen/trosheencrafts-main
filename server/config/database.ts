import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from './env';

const connectionString = env.DATABASE_URL;

// For migrations
export const migrationClient = postgres(connectionString, { max: 1 });

// For queries
const queryClient = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(queryClient);

// Graceful shutdown
process.on('SIGTERM', async () => {
  await queryClient.end();
  await migrationClient.end();
});
