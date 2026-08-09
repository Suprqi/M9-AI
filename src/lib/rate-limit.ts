import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { AppError } from "./errors";

export interface RateLimitRule {
  limit: number;
  windowMs: number;
}

export const RATE_LIMITS = {
  auth: { limit: 8, windowMs: 5 * 60_000 },
  ai: { limit: 20, windowMs: 60_000 },
  write: { limit: 60, windowMs: 60_000 },
} satisfies Record<string, RateLimitRule>;

/* ------------------------------------------------------------------ shared */

function reject(resetAt: number): never {
  const seconds = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  throw new AppError(
    "RATE_LIMITED",
    `عدد المحاولات كبير. حاول مرة أخرى بعد ${seconds} ثانية.`
  );
}

/* ------------------------------------------------- in-memory (single node) */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
let lastSweep = 0;

function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

function checkInMemory(identifier: string, rule: RateLimitRule): void {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(identifier);
  if (!existing || existing.resetAt <= now) {
    buckets.set(identifier, { count: 1, resetAt: now + rule.windowMs });
    return;
  }

  if (existing.count >= rule.limit) reject(existing.resetAt);
  existing.count += 1;
}

/* --------------------------------------------------- Upstash Redis (prod) */

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

/**
 * Serverless runtimes give each instance its own memory, so an in-process
 * counter silently multiplies the effective limit by the instance count.
 * When Upstash credentials are present we use a shared sliding window instead;
 * otherwise we fall back to the in-memory limiter, which is correct for a
 * single-process local dev server.
 */
const redis =
  redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

const limiters = new Map<string, Ratelimit>();

function getLimiter(name: string, rule: RateLimitRule): Ratelimit {
  const cached = limiters.get(name);
  if (cached) return cached;

  const limiter = new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(rule.limit, `${rule.windowMs} ms`),
    prefix: `m9:rl:${name}`,
    analytics: false,
  });

  limiters.set(name, limiter);
  return limiter;
}

/** True when a shared, multi-instance-safe limiter is active. */
export function isDistributedRateLimiter(): boolean {
  return redis !== null;
}

/**
 * Consumes one token for `identifier`. Throws AppError("RATE_LIMITED") when the
 * caller is over the limit.
 *
 * `ruleName` selects the shared Redis window, so pass the key from RATE_LIMITS
 * rather than an ad-hoc rule object.
 */
export async function checkRateLimit(
  identifier: string,
  rule: RateLimitRule,
  ruleName: keyof typeof RATE_LIMITS = "write"
): Promise<void> {
  if (!redis) {
    checkInMemory(identifier, rule);
    return;
  }

  try {
    const result = await getLimiter(ruleName, rule).limit(identifier);
    if (!result.success) reject(result.reset);
  } catch (error) {
    // A rate-limit backend outage must not take the product down, but it must
    // not silently disable protection either — fall back to the local limiter.
    if (error instanceof AppError) throw error;
    checkInMemory(identifier, rule);
  }
}
