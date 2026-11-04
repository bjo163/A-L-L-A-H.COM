export interface Principal {
  userId: number;
  ormUserId: number;
  role: 'user' | 'superuser';
  email: string;
  companyId: number;
  sessionId: number | null;
  via: 'jwt' | 'session';
}

export type PublicRouteRule =
  | { method: string; path: string }
  | { method: string; pattern: RegExp };

/**
 * Exact `METHOD path` matching: a prefix rule would silently authorise every
 * future route that happens to share the segment. Pattern rules stay anchored
 * by their own regex, so callers write `^...$`.
 */
export function isPublicRoute(method: string, path: string, rules: PublicRouteRule[]): boolean {
  const normalizedPath = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
  const requestMethod = method.toUpperCase() === 'HEAD' ? 'GET' : method.toUpperCase();
  return rules.some((rule) => {
    if (rule.method.toUpperCase() !== requestMethod) return false;
    if ('path' in rule) return rule.path === normalizedPath;
    return rule.pattern.test(normalizedPath);
  });
}

export interface RateLimitDecision {
  allowed: boolean;
  retryAfterMs: number;
}

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export class FixedWindowRateLimiter {
  private readonly windows = new Map<string, { count: number; windowStart: number }>();

  constructor(private readonly options: RateLimitOptions) {}

  take(key: string, now = Date.now()): RateLimitDecision {
    const current = this.windows.get(key);
    if (!current || now - current.windowStart >= this.options.windowMs) {
      this.windows.set(key, { count: 1, windowStart: now });
      return { allowed: true, retryAfterMs: 0 };
    }

    if (current.count >= this.options.limit) {
      return { allowed: false, retryAfterMs: Math.max(0, this.options.windowMs - (now - current.windowStart)) };
    }

    current.count += 1;
    return { allowed: true, retryAfterMs: 0 };
  }

  /** The map is keyed by caller-controlled values, so it must be reclaimed periodically. */
  prune(now = Date.now()): void {
    for (const [key, window] of this.windows) {
      if (now - window.windowStart >= this.options.windowMs) this.windows.delete(key);
    }
  }

  get size(): number {
    return this.windows.size;
  }
}
