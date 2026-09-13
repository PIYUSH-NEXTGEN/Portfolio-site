import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Never send Express's default fingerprint header.
app.disable("x-powered-by");

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
// Reflect only safe origins: same-origin / no Origin (curl, health checks) is
// allowed, cross-site requests keep the browser default-deny behaviour.
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      try {
        if (new URL(origin).protocol === "https:") callback(null, true);
        else callback(new Error("Origin not allowed by CORS"));
      } catch {
        callback(new Error("Origin not allowed by CORS"));
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
  const parsed = err as { status?: unknown; statusCode?: unknown };
  const clientStatus = [parsed.status, parsed.statusCode].find(
    (s): s is number => typeof s === "number" && s >= 400 && s < 500,
  );
  res.status(clientStatus ?? 500).json({ error: "Internal server error" });
};
app.use(errorHandler);

export default app;
