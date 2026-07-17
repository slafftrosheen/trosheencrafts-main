import express from 'express';
import session from 'express-session';
import ConnectPgSimple from 'connect-pg-simple';
import csurf from 'csurf';
import passport from './config/passport';
import { pool, testConnection, closeConnection } from './db';
import { createApiRouter } from './routes';
import uploadRouter from './routes/upload';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { globalRateLimiter } from './middleware/rateLimiter';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV === undefined ? 'production' : process.env.NODE_ENV;

// Enforce secure session secret - no default fallback
const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET || SESSION_SECRET === 'change-this-secret-key-in-production') {
  console.error('❌ SESSION_SECRET environment variable must be set to a secure random value');
  console.error('ℹ️  Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  process.exit(1);
}

app.set('trust proxy', 1);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Session configuration
const PgSession = ConnectPgSimple(session);
app.use(
  session({
    store: new (PgSession as any)({
      pool,
      tableName: 'session',
      createTableIfMissing: true,
    }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true, // Required for secure cookies behind reverse proxy
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'lax' : 'lax',
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// CSRF Protection
const csrfProtection = csurf({
  cookie: false, // Use session
  value: (req) => {
    return (
      req.body?._csrf ||
      req.query?._csrf ||
      req.headers['csrf-token'] ||
      req.headers['xsrf-token'] ||
      req.headers['x-csrf-token'] ||
      req.headers['x-xsrf-token']
    );
  },
});

app.use((req, res, next) => {
  // Skip CSRF for upload and admin gallery routes - they are protected by adminAuthMiddleware
  if (
    req.path.startsWith('/api/upload') || 
    req.path.startsWith('/api/uploads') ||
    req.path.startsWith('/api/gallery/admin')
  ) {
    return next();
  }
  csrfProtection(req, res, next);
});

// Expose CSRF token to client
app.get('/api/csrf-token', (req, res) => {
  const token = req.csrfToken();
  if (req.session) {
    req.session.save(() => {
      res.json({ csrfToken: token });
    });
  } else {
    res.json({ csrfToken: token });
  }
});

app.use('/api', globalRateLimiter);
app.use('/api/upload', uploadRouter);
app.use('/api', createApiRouter());

// Serve static files in production
if (NODE_ENV === 'production') {
  const distPath = path.join(process.cwd(), 'dist', 'public');
  app.use(express.static(distPath));

  // Catch-all route for SPA - version agnostic
  app.use((req, res, next) => {
    // Only serve index.html for GET/HEAD requests that don't look like static files or API/uploads
    if (
      (req.method === 'GET' || req.method === 'HEAD') && 
      !req.path.startsWith('/api') && 
      !req.path.startsWith('/uploads') &&
      !req.path.includes('.') // Crude check for file extensions
    ) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      next();
    }
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  try {
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Failed to connect to database');
    }

    httpServer.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT} in ${NODE_ENV} mode`);
      console.log(`📍 API: http://localhost:${PORT}/api`);
      if (NODE_ENV === 'development') {
        console.log(`🎨 Frontend: http://localhost:5173`);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(async () => {
    await closeConnection();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  httpServer.close(async () => {
    await closeConnection();
    process.exit(0);
  });
});

startServer();

export { app, httpServer };