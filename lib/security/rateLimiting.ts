// lib/security/rateLimiting.ts
type RateLimitEntry = {
  count: number;
  resetAt: number;
  blockedUntil?: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter: number;
  blocked: boolean;
};

export type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
  blockDurationMs?: number;
};

const store = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const {
    windowMs,
    maxRequests,
    blockDurationMs = 5 * 60_000,
  } = options;

  const current = store.get(key);

  if (!current) {
    const entry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    };

    store.set(key, entry);

    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - 1),
      resetAt: entry.resetAt,
      retryAfter: 0,
      blocked: false,
    };
  }

  if (current.blockedUntil && now < current.blockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt,
      retryAfter: Math.max(
        1,
        Math.ceil((current.blockedUntil - now) / 1000)
      ),
      blocked: true,
    };
  }

  if (now >= current.resetAt) {
    current.count = 1;
    current.resetAt = now + windowMs;
    current.blockedUntil = undefined;

    store.set(key, current);

    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - 1),
      resetAt: current.resetAt,
      retryAfter: 0,
      blocked: false,
    };
  }

  current.count += 1;

  if (current.count > maxRequests * 3) {
    current.blockedUntil = now + blockDurationMs;
    store.set(key, current);

    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt,
      retryAfter: Math.max(1, Math.ceil(blockDurationMs / 1000)),
      blocked: true,
    };
  }

  if (current.count > maxRequests) {
    store.set(key, current);

    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt,
      retryAfter: Math.max(
        1,
        Math.ceil((current.resetAt - now) / 1000)
      ),
      blocked: false,
    };
  }

  store.set(key, current);

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - current.count),
    resetAt: current.resetAt,
    retryAfter: 0,
    blocked: false,
  };
}

export function cleanupRateLimitStore(): void {
  const now = Date.now();

  for (const [key, value] of store.entries()) {
    const windowExpired = now >= value.resetAt;
    const blockExpired =
      value.blockedUntil === undefined || now >= value.blockedUntil;

    if (windowExpired && blockExpired) {
      store.delete(key);
    }
  }
}