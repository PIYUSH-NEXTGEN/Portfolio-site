import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Never send Express's default fingerprint header.
app.disable("x-powered-by");

// Behind the platform load balancer, so req.ip reflects the real client IP.
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
// Explicit CORS allow-list: same-origin / no Origin (curl, health checks) is
// allowed, plus local dev servers, Replit preview domains (non-production
// only), and the production portfolio domain(s) configured via
// ALLOWED_ORIGINS. Everything else keeps a default-deny behaviour — no
// wildcard reflection.
const PRODUCTION_ORIGINS = (process.env["ALLOWED_ORIGINS"] ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);
const allowedOrigins = new Set(PRODUCTION_ORIGINS);
const isProduction = process.env["NODE_ENV"] === "production";

// Dev/preview convenience: any localhost port plus Replit preview hosts.
// Production stays strictly limited to ALLOWED_ORIGINS.
function isDevOrigin(origin: string): boolean {
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return true;
  if (
    !isProduction &&
    (url.hostname.endsWith(".replit.dev") || url.hostname.endsWith(".repl.co"))
  ) {
    return true;
  }
  return false;
}
const CORS_DENIED_MESSAGE = "Origin not allowed by CORS";
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.has(origin) || isDevOrigin(origin)) {
        callback(null, true);
      } else {
        // Log the rejected origin server-side — the client only ever sees
        // the generic denial below, so this log is how you diagnose a
        // missing ALLOWED_ORIGINS entry.
        logger.warn({ origin }, "Rejected cross-origin API request");
        callback(new Error(CORS_DENIED_MESSAGE));
      }
    },
  }),
);
// Smallest body a health-only JSON API needs; prevents oversized payload DoS.
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

app.use("/api", router);

// Unknown API routes must be JSON 404s (not Express's HTML error page).
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Any unexpected downstream throw must be a safe JSON response (never
// HTML/stack). Body-parser errors (e.g. 413 payload too large) are client
// errors, so their 4xx status is honoured; everything else is a 500.
// The message is never echoed back — it can contain internal details.
export const errorHandler: express.ErrorRequestHandler = (
  err: unknown,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction,
) => {
  logger.error({ err }, "Unhandled API error");
  if (res.headersSent) return;
  // CORS rejections are client/config errors, not 500s. cors has no status
  // on its Error, so match the sentinel message.
  if (err instanceof Error && err.message === CORS_DENIED_MESSAGE) {
    res.status(403).json({ error: "Origin not allowed." });
    return;
  }
  const parsed = err as { status?: unknown; statusCode?: unknown };
  const clientStatus = [parsed.status, parsed.statusCode].find(
    (s): s is number => typeof s === "number" && s >= 400 && s < 500,
  );
  res.status(clientStatus ?? 500).json({ error: "Internal server error" });
};
app.use(errorHandler);

export default app;
