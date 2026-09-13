import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  // No-cache: load-balancer / orchestrator probes must never get a stale 200.
  res.setHeader("Cache-Control", "no-store");
  res.json(data);
});

export default router;
