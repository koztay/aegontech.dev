type RateLimitResult = {
  ok: boolean;
  retryAfter?: number;
};

type RateLimitOptions = {
  key: string;
  limit?: number;
  windowMs?: number;
  correlationId?: string;
};

// Simple in-memory per-key rate limiter; replace with redis/kv in production.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(options: RateLimitOptions): RateLimitResult {
  const limit = options.limit ?? 30;
  const windowMs = options.windowMs ?? 60_000;
  const now = Date.now();

  const bucket = buckets.get(options.key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(options.key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (bucket.count >= limit) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return { ok: false, retryAfter };
  }

  bucket.count += 1;
  return { ok: true };
}
