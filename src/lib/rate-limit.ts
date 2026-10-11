/**
 * Small fixed-window rate limiter for abuse-prone endpoints (uploads, orders,
 * admin login). In-memory: it protects a single running instance. For several
 * instances, move the counters to a shared store (e.g. Redis or the database).
 */
const buckets = new Map<string, { n: number; resetAt: number }>();

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || req.headers.get("x-real-ip") || "local";
}

/** Returns true when the key has exceeded `limit` hits in `windowMs`. */
export function rateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const rec = buckets.get(key);
  if (!rec || now >= rec.resetAt) {
    buckets.set(key, { n: 1, resetAt: now + windowMs });
    // keep the map from growing without bound
    if (buckets.size > 10_000) {
      for (const [k, v] of buckets) if (now >= v.resetAt) buckets.delete(k);
    }
    return false;
  }
  rec.n += 1;
  return rec.n > limit;
}
