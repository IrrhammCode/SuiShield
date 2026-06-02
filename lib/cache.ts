// Simple in-memory cache with TTL
// For production, use Redis or similar

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs,
    });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// Singleton cache instance
export const cache = new MemoryCache();

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  BALANCE: 30 * 1000,        // 30 seconds
  TRANSACTIONS: 60 * 1000,   // 1 minute
  OBJECTS: 60 * 1000,        // 1 minute
  PRICE: 5 * 60 * 1000,      // 5 minutes
  NETWORK: 2 * 60 * 1000,    // 2 minutes
  PROTOCOLS: 5 * 60 * 1000,  // 5 minutes
  MALICIOUS: 30 * 60 * 1000, // 30 minutes
  EXCHANGE_RATE: 5 * 60 * 1000, // 5 minutes
  FUND_FLOW: 2 * 60 * 1000,  // 2 minutes
  ANALYSIS: 5 * 60 * 1000,   // 5 minutes
} as const;

// Helper to create cache keys
export function cacheKey(...parts: string[]): string {
  return parts.join(":");
}
