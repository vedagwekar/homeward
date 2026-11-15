// Protection for a public demo server: request limits, safe headers, and a key for admin-only routes.
// Everything is in memory and per process, which is enough for one small host. Nothing here is user sign-in:
// the demo still lets anyone play any role. These limits only stop floods and the most destructive calls.
import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, RequestHandler, Response } from "express";

type Rule = { limit: number; windowMs: number };

/** Set RATE_LIMIT=off for local tests, where one machine makes every request. */
const off = () => process.env.RATE_LIMIT === "off";

/** A fixed-window counter per caller. Old entries are swept so memory can't grow without bound. */
export function limiter(name: string, rule: Rule): RequestHandler {
  const hits = new Map<string, { count: number; resetAt: number }>();
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
  }, 60_000).unref();

  return (req: Request, res: Response, next: NextFunction) => {
    if (off()) return next();
    const now = Date.now();
    const key = req.ip ?? "unknown";
    let hit = hits.get(key);
    if (!hit || hit.resetAt <= now) {
      hit = { count: 0, resetAt: now + rule.windowMs };
      hits.set(key, hit);
    }
    hit.count++;
    res.setHeader("RateLimit-Limit", String(rule.limit));
    res.setHeader("RateLimit-Remaining", String(Math.max(0, rule.limit - hit.count)));
    if (hit.count > rule.limit) {
      const wait = Math.ceil((hit.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(wait));
      console.warn(`rate limit: ${name} from ${key}`);
      return void res.status(429).json({ error: `Too many requests. Try again in ${wait} seconds.` });
    }
    next();
  };
}

export const limits = {
  read: limiter("read", { limit: 300, windowMs: 60_000 }),
  write: limiter("write", { limit: 40, windowMs: 60_000 }),
  upload: limiter("upload", { limit: 10, windowMs: 10 * 60_000 }),
  /** Starting a build over wipes the demo, and each one is about ten transactions. */
  reset: limiter("reset", { limit: 12, windowMs: 60 * 60_000 }),
};

/** Plain headers that make a JSON API harder to misuse. Express also stops announcing itself. */
export const safeHeaders: RequestHandler = (_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"); // the web app, on another domain, plays the videos
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
  res.setHeader("Strict-Transport-Security", "max-age=15552000");
  next();
};

/**
 * Routes only Homeward staff should call (settling a disputed report). When ADMIN_KEY is set, the
 * x-admin-key header must match it. When it is not set (local work), the routes stay open, and a
 * warning is printed once at start so nobody leaves it that way by accident.
 */
export function adminOnly(): RequestHandler {
  return (req, res, next) => {
    const key = process.env.ADMIN_KEY;
    if (!key) return next();
    const given = Buffer.from(String(req.get("x-admin-key") ?? ""));
    const want = Buffer.from(key);
    if (given.length !== want.length || !timingSafeEqual(given, want)) {
      return void res.status(401).json({ error: "Only Homeward staff can do this." });
    }
    next();
  };
}

export function warnIfOpen() {
  if (!process.env.ADMIN_KEY && process.env.NODE_ENV === "production") {
    console.warn("ADMIN_KEY is not set: staff-only routes (settling a disputed report) are open to anyone.");
  }
}
