// app/lib/rateLimit.ts

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

export function rateLimit(options: {
  key: string;
  limit: number;
  windowMs: number;
}): {
  allowed: boolean;
  retryAfter?: number;
} {
  const { key, limit, windowMs } = options;
  const now = Date.now();

  const bucket = buckets.get(key);

  // New bucket or expired window
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true };
  }

  // Limit exceeded
  if (bucket.count >= limit) {
    return {
      allowed: false,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  // Increment count
  bucket.count += 1;
  return { allowed: true };
}