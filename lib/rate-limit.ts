type Attempt = {
  timestamps: number[];
};

const attempts = new Map<string, Attempt>();

export const LOGIN_RATE_LIMIT = 5;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export function loginRateLimitKey(ip: string, email: string) {
  return `${ip}:${email.trim().toLowerCase()}`;
}

export function checkLoginRateLimit(
  key: string,
  now = Date.now(),
  limit = LOGIN_RATE_LIMIT,
  windowMs = LOGIN_WINDOW_MS,
) {
  const current = attempts.get(key);
  const timestamps = (current?.timestamps ?? []).filter(
    (timestamp) => now - timestamp < windowMs,
  );

  if (timestamps.length >= limit) {
    attempts.set(key, { timestamps });
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((timestamps[0] + windowMs - now) / 1000),
    };
  }

  timestamps.push(now);
  attempts.set(key, { timestamps });
  return { allowed: true, retryAfterSeconds: 0 };
}

export function resetLoginRateLimit(key?: string) {
  if (key) attempts.delete(key);
  else attempts.clear();
}
