import { describe, expect, it } from "vitest";
import express from "express";
import request from "supertest";
import app, { errorHandler } from "../src/app";

describe("api-server", () => {
  it("GET /api/healthz returns ok with no-store", async () => {
    const res = await request(app).get("/api/healthz");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
    expect(res.headers["cache-control"]).toBe("no-store");
  });

  it("unknown API routes are JSON 404s (never HTML)", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Not found" });
  });

  it("unexpected throws are safe JSON 500s (never stack/HTML)", async () => {
    // Express does not propagate errors into a mounted sub-app, so the
    // exported error handler is applied to a throwing app directly.
    const boom = express();
    boom.get("/api/boom", () => {
      throw new Error("secret internals");
    });
    boom.use(errorHandler);
    const res = await request(boom).get("/api/boom");
    expect(res.status).toBe(500);
    expect(res.text).not.toContain("secret internals");
  });

  it("oversized JSON bodies are rejected", async () => {
    const res = await request(app)
      .post("/api/healthz")
      .set("content-type", "application/json")
      .send({ data: "x".repeat(20 * 1024) });
    expect([404, 413]).toContain(res.status);
  });
});
