import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { exec } from "child_process";
import { promisify } from "util";
import { seedAdmins } from "./seed-admins";
import http from "http";

const execAsync = promisify(exec);
const app = express();

async function runMigrations() {
  try {
    log("Running database migrations...");
    const { stdout } = await execAsync("npm run db:push -- --force");
    log("Database migrations completed");
  } catch (error: any) {
    log(`Migration warning: ${error.message}`);
  }
}

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await runMigrations();
  await seedAdmins();

  await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    // Vite setup must happen before server creation
    const tempServer = http.createServer(app);
    await setupVite(app, tempServer);
  } else {
    serveStatic(app);
  }

  // ✅ Create server AFTER all middleware and routes are set
  const server = http.createServer(app);

  const port = parseInt(process.env.PORT, 10);
  server.listen(port, "0.0.0.0", () => {
    console.log(`✅ Server is listening on port ${port}`);
  });
})();
