// Simple in-memory rate limiter
// For production, use Redis-based rate limiting

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
  }

  /**
   * Check if a request is allowed
   * @param key - Unique identifier (IP, user ID, etc.)
   * @param maxRequests - Maximum requests allowed in the window
   * @param windowMs - Time window in milliseconds
   * @returns Object with allowed status and remaining count
   */
  check(key: string, maxRequests: number, windowMs: number): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetTime) {
      // New window
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs,
      };
    }

    if (entry.count >= maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    // Increment count
    entry.count++;
    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.limits.clear();
  }
}

// Singleton rate limiter instance
export const rateLimiter = new RateLimiter();

// Rate limit presets
export const RATE_LIMITS = {
  // General API: 60 requests per minute
  API: { maxRequests: 60, windowMs: 60 * 1000 },
  // Chat: 20 requests per minute (AI calls are expensive)
  CHAT: { maxRequests: 20, windowMs: 60 * 1000 },
  // Analysis: 10 requests per minute (heavy computation)
  ANALYSIS: { maxRequests: 10, windowMs: 60 * 1000 },
  // Fund flow: 5 requests per minute (very heavy)
  FUND_FLOW: { maxRequests: 5, windowMs: 60 * 1000 },
} as const;

/**
 * Get client identifier from request
 */
export function getClientId(request: Request): string {
  // Try to get from x-forwarded-for header (behind proxy)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  // Try to get from x-real-ip header
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback to a generic identifier
  return "anonymous";
}
