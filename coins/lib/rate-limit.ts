import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { normalizeEmail } from '@/lib/normalize-email';

/**
 * Rate limiting for abuse-prone endpoints, backed by Upstash Redis.
 *
 * FAILS OPEN. If the Upstash env vars are unset, the store errors or times out
 * (1s), the request is ALLOWED and the problem is logged: a rate limiter must
 * never block a real lead.
 *
 * Store selection, resolved once per server module instance (Next bundles this
 * per route, so the `[rate-limit] store=... prefix=...` line can appear once per route):
 *   - production with UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN -> Upstash
 *   - production without them                                          -> disabled (logged)
 *   - development: disabled unless RATE_LIMIT_ENABLED=true; then
 *     RATE_LIMIT_STORE=memory uses an in-process fake, and
 *     RATE_LIMIT_FAKE_ERROR=true makes that fake throw (to exercise fail-open).
 *     The dev switches are ignored in production.
 *
 * Keys: `shackpck:<context>:rl:<bucket>:<identifier>`. <context> is Netlify's
 * CONTEXT when present at runtime, else NODE_ENV, so deploy previews and dev never
 * share production counters. Email identifiers are a SHA-256 of the normalized
 * email: no address is stored in Upstash.
 */

export type RateLimitBucket = 'contact' | 'register' | 'signin-ip' | 'signin-email' | 'checkout' | 'build-submit';

export const RATE_LIMITS: Record<RateLimitBucket, { limit: number; windowSec: number }> = {
  contact: { limit: 5, windowSec: 10 * 60 },
  register: { limit: 5, windowSec: 60 * 60 },
  'signin-ip': { limit: 10, windowSec: 10 * 60 },
  'signin-email': { limit: 10, windowSec: 10 * 60 },
  checkout: { limit: 10, windowSec: 10 * 60 },
  // Keyed by user id, not IP: submitting emails the team, and one account
  // hammering submit is the case worth bounding.
  'build-submit': { limit: 5, windowSec: 60 * 60 },
};

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number };

type Env = Record<string, string | undefined>;
type HeaderGetter = { get(name: string): string | null };

/**
 * Client IP: Netlify's x-nf-client-connection-ip (set by its edge, not by the
 * client), then the first x-forwarded-for entry, then "unknown".
 */
export function clientIp(headers: HeaderGetter): string {
  const nf = headers.get('x-nf-client-connection-ip')?.trim();
  if (nf) return nf;
  const first = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return first || 'unknown';
}

export function ipIdentifier(ip: string): string {
  return `ip:${ip}`;
}

/** For limits that belong to an account rather than a network. */
export function userIdentifier(userId: string): string {
  return `user:${userId}`;
}

/** Hashed so no email address is ever written to the rate-limit store. */
export function emailIdentifier(email: string): string {
  return `email:${createHash('sha256').update(normalizeEmail(email)).digest('hex').slice(0, 32)}`;
}

export function rateLimitPrefix(env: Env = process.env): string {
  const context = env.CONTEXT?.trim() || env.NODE_ENV?.trim() || 'unknown';
  return `shackpck:${context}:rl`;
}

export function rateLimitKey(bucket: RateLimitBucket, identifier: string, env: Env = process.env): string {
  return `${rateLimitPrefix(env)}:${bucket}:${identifier}`;
}

/** What a store reports: whether this hit is allowed, and when the window frees up (epoch ms). */
export type StoreResult = { success: boolean; reset: number };
export interface RateLimitStore {
  kind: string;
  limit(bucket: RateLimitBucket, identifier: string): Promise<StoreResult>;
}

/** In-process sliding-window fake for development checks and fixtures. Never used in production. */
export function createMemoryStore(opts: { now?: () => number; failWith?: Error } = {}): RateLimitStore {
  const now = opts.now ?? Date.now;
  const hits = new Map<string, number[]>();
  return {
    kind: opts.failWith ? 'memory-failing' : 'memory',
    async limit(bucket, identifier) {
      if (opts.failWith) throw opts.failWith;
      const { limit, windowSec } = RATE_LIMITS[bucket];
      const t = now();
      const key = `${bucket}:${identifier}`;
      const recent = (hits.get(key) ?? []).filter((ts) => ts > t - windowSec * 1000);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return { success: false, reset: recent[0] + windowSec * 1000 };
      }
      recent.push(t);
      hits.set(key, recent);
      return { success: true, reset: t + windowSec * 1000 };
    },
  };
}

function createUpstashStore(prefix: string): RateLimitStore {
  const redis = Redis.fromEnv();
  const limiters = new Map<RateLimitBucket, Ratelimit>();
  const limiterFor = (bucket: RateLimitBucket) => {
    let rl = limiters.get(bucket);
    if (!rl) {
      const { limit, windowSec } = RATE_LIMITS[bucket];
      rl = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
        prefix: `${prefix}:${bucket}`,
        analytics: false,
        timeout: 1000, // on timeout Upstash allows the request: fail open
      });
      limiters.set(bucket, rl);
    }
    return rl;
  };
  return {
    kind: 'upstash',
    async limit(bucket, identifier) {
      const r = await limiterFor(bucket).limit(identifier);
      return { success: r.success, reset: r.reset };
    },
  };
}

let resolved: { store: RateLimitStore | null } | undefined;

function resolveStore(env: Env = process.env): RateLimitStore | null {
  if (resolved) return resolved.store;
  const prefix = rateLimitPrefix(env);
  const production = env.NODE_ENV === 'production';
  let store: RateLimitStore | null = null;
  let note: string;
  if (!production && env.RATE_LIMIT_ENABLED !== 'true') {
    note = 'disabled (development; set RATE_LIMIT_ENABLED=true to enable)';
  } else if (!production && env.RATE_LIMIT_STORE === 'memory') {
    store = createMemoryStore(env.RATE_LIMIT_FAKE_ERROR === 'true' ? { failWith: new Error('fake store error') } : {});
    note = store.kind;
  } else if (!env.UPSTASH_REDIS_REST_URL?.trim() || !env.UPSTASH_REDIS_REST_TOKEN?.trim()) {
    note = 'disabled (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN unset), failing open';
  } else {
    store = createUpstashStore(prefix);
    note = store.kind;
  }
  resolved = { store };
  console.log(`[rate-limit] store=${note} prefix=${prefix}`);
  return store;
}

/** Count one hit against `bucket` for `identifier`. Never throws; fails open. */
export async function rateLimit(bucket: RateLimitBucket, identifier: string): Promise<RateLimitResult> {
  const store = resolveStore();
  if (!store) return { ok: true };
  try {
    const r = await store.limit(bucket, identifier);
    if (r.success) return { ok: true };
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((r.reset - Date.now()) / 1000)) };
  } catch (err) {
    const e = err as { constructor?: { name?: string }; message?: string };
    console.error(`[rate-limit] store error on ${bucket}, failing open: ${e?.constructor?.name ?? 'Error'}${e?.message ? ` (${e.message})` : ''}`);
    return { ok: true };
  }
}

/** Standard 429: the given JSON body plus a Retry-After header. */
export function tooManyRequests(body: Record<string, unknown>, retryAfterSec: number): NextResponse {
  return NextResponse.json(body, { status: 429, headers: { 'Retry-After': String(retryAfterSec) } });
}
