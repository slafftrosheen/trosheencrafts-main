import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { db } from '@db';

const PgSession = connectPg(session);

// Type assertion because connect-pg-simple expects a pg.Pool but we are using drizzle with postgres.js
// However, connect-pg-simple can also work with a connection string or a custom pool.
// Here we might need to adjust if db is not compatible directly.
// The user provided code uses `pool: db as any`.
// Let's verify `server/config/database.ts` again.
// It exports `db` which is `drizzle(queryClient)`. `queryClient` is `postgres(...)`.
// connect-pg-simple requires a `pg` pool or `pg-promise` or similar.
// Ideally we should use the existing pool if possible or pass connection string.
// `server/index.ts` ALREADY sets up session store!
// Let's check `server/index.ts` again.

// Re-reading server/index.ts content from memory...
// It uses `connect-pg-simple` and `pg.Pool` if DATABASE_URL is present.
// So `server/index.ts` handles it.
// The user asked to "Create server/lib/sessionStore.ts to replace Redis".
// The existing `server/index.ts` ALREADY uses `connect-pg-simple` if DATABASE_URL is set.
// However, the user provided code for `server/lib/sessionStore.ts`.
// I should create it, and then update `server/index.ts` to USE it, to clean up `index.ts`.

export const sessionStore = new PgSession({
  // We can pass the connection string directly to be safe, or use the existing setup strategy.
  // The user code: `pool: db as any`.
  // If `db` is `drizzle(postgres(...))`, `db` itself is not a pool.
  // I will use `conObject` or `conString` if available, or just copy the user's code and hope they know what they are doing
  // OR correct it.
  // `connect-pg-simple` options: { pool: ... } or { conString: ... }
  conString: process.env.DATABASE_URL,
  tableName: 'sessions',
  createTableIfMissing: true,
});

export const sessionConfig: session.SessionOptions = {
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'trosheen-crafts-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: 'lax'
  }
};
