// Checks the request limits and the staff key, with no network. Run with: npm test
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express from "express";
import { adminOnly, limiter, safeHeaders } from "./guard";

function serve(setup: (app: express.Express) => void) {
  const app = express();
  app.disable("x-powered-by");
  setup(app);
  const server = app.listen(0);
  return { url: `http://127.0.0.1:${(server.address() as AddressInfo).port}`, close: () => server.close() };
}

test("a caller over the limit gets 429 with a wait time, and a new window resets it", async () => {
  delete process.env.RATE_LIMIT;
  const s = serve((app) => app.get("/x", limiter("t", { limit: 3, windowMs: 60_000 }), (_q, r) => void r.json({ ok: true })));
  const codes: number[] = [];
  for (let i = 0; i < 5; i++) codes.push((await fetch(s.url + "/x")).status);
  const last = await fetch(s.url + "/x");
  s.close();
  assert.deepEqual(codes, [200, 200, 200, 429, 429]);
  assert.ok(Number(last.headers.get("retry-after")) > 0);
  assert.equal((await last.json() as { error: string }).error.startsWith("Too many requests"), true);
});

test("callers are counted by X-Real-IP, so one caller can't hide behind several proxy addresses", async () => {
  delete process.env.RATE_LIMIT;
  const s = serve((app) => app.get("/x", limiter("t", { limit: 2, windowMs: 60_000 }), (_q, r) => void r.json({})));
  const as = (ip: string) => fetch(s.url + "/x", { headers: { "x-real-ip": ip } }).then((r) => r.status);
  const codes = [await as("1.1.1.1"), await as("1.1.1.1"), await as("1.1.1.1"), await as("2.2.2.2")];
  s.close();
  assert.deepEqual(codes, [200, 200, 429, 200]);
});

test("RATE_LIMIT=off lets everything through (local tests only)", async () => {
  process.env.RATE_LIMIT = "off";
  const s = serve((app) => app.get("/x", limiter("t", { limit: 1, windowMs: 60_000 }), (_q, r) => void r.json({})));
  const codes = await Promise.all([1, 2, 3].map(async () => (await fetch(s.url + "/x")).status));
  s.close();
  delete process.env.RATE_LIMIT;
  assert.deepEqual(codes, [200, 200, 200]);
});

test("staff routes need the key once ADMIN_KEY is set, and stay open when it is not", async () => {
  const s = serve((app) => app.post("/settle", adminOnly(), (_q, r) => void r.json({ ok: true })));
  delete process.env.ADMIN_KEY;
  assert.equal((await fetch(s.url + "/settle", { method: "POST" })).status, 200);
  process.env.ADMIN_KEY = "correct-horse";
  assert.equal((await fetch(s.url + "/settle", { method: "POST" })).status, 401);
  assert.equal((await fetch(s.url + "/settle", { method: "POST", headers: { "x-admin-key": "wrong" } })).status, 401);
  assert.equal((await fetch(s.url + "/settle", { method: "POST", headers: { "x-admin-key": "correct-horse" } })).status, 200);
  delete process.env.ADMIN_KEY;
  s.close();
});

test("safe headers are set and the server does not announce Express", async () => {
  const s = serve((app) => { app.use(safeHeaders); app.get("/x", (_q, r) => void r.json({})); });
  const res = await fetch(s.url + "/x");
  s.close();
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  assert.equal(res.headers.get("x-powered-by"), null);
  assert.match(res.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);
});
