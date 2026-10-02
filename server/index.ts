import express from "express";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import csurf from "csurf";
import passport from "./config/passport";
import { pool, testConnection, closeConnection } from "./db";
import { createApiRouter } from "./routes";
import uploadRouter from "./routes/upload";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { globalRateLimiter } from "./middleware/rateLimiter";
import { createServer } from "http";
import path from "path";

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV === undefined ? "production" : process.env.NODE_ENV;

const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET || SESSION_SECRET === "change-this-secret-key-in-production") {
  console.error("SESSION_SECRET environment variable must be set to a secure random value");
  process.exit(1);
}

app.set("trust proxy", 1);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const PgSession = ConnectPgSimple(session);
app.use(
  session({
    store: new (PgSession as any)({
      pool,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const csrfProtection = csurf({
  cookie: false,
  value: (req) =>
    req.body?._csrf ||
    req.query?._csrf ||
    req.headers["csrf-token"] ||
    req.headers["xsrf-token"] ||
    req.headers["x-csrf-token"] ||
    req.headers["x-xsrf-token"],
});

app.use((req, res, next) => {
  const csrfExempt =
    req.path.startsWith("/api/upload") ||
    req.path.startsWith("/api/uploads") ||
    req.path.startsWith("/api/gallery/admin") ||
    req.path === "/api/checkout/webhook";

  if (csrfExempt) {
    return next();
  }

  csrfProtection(req, res, next);
});

app.get("/api/csrf-token", (req, res) => {
  const token = req.csrfToken();

  if (req.session) {
    req.session.save(() => res.json({ csrfToken: token }));
  } else {
    res.json({ csrfToken: token });
  }
});

app.use("/api", globalRateLimiter);
app.use("/api/upload", uploadRouter);
app.use("/api", createApiRouter());

if (NODE_ENV === "production") {
  const distPath = path.join(process.cwd(), "dist", "public");
  app.use(express.static(distPath));

  app.use((req, res, next) => {
    if (
      (req.method === "GET" || req.method === "HEAD") &&
      !req.path.startsWith("/api") &&
      !req.path.startsWith("/uploads") &&
      !req.path.includes(".")
    ) {
      res.sendFile(path.join(distPath, "index.html"));
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
      throw new Error("Failed to connect to database");
    }

    httpServer.listen(PORT, () => {
      console.log("Server running on port " + PORT + " in " + NODE_ENV + " mode");
      console.log("API: http://localhost:" + PORT + "/api");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

process.on("SIGTERM", async () => {
  httpServer.close(async () => {
    await closeConnection();
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  httpServer.close(async () => {
    await closeConnection();
    process.exit(0);
  });
});

startServer();

export { app, httpServer };
