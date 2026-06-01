// Shared utilities for API routes — error handling, retry, validation

import { NextResponse } from "next/server";

// ── Error Response Helper ────────────────────────────────

export function apiError(message: string, status = 500, details?: unknown) {
  return NextResponse.json(
    {
      error: message,
      details: details || null,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export function apiSuccess(data: Record<string, unknown> | unknown[]) {
  return NextResponse.json({
    ...(data as Record<string, unknown>),
    timestamp: new Date().toISOString(),
  });
}

// ── Retry Logic ──────────────────────────────────────────

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delayMs?: number;
    backoff?: number;
  } = {}
): Promise<T> {
  const { maxRetries = 2, delayMs = 1000, backoff = 2 } = options;

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(backoff, attempt)));
      }
    }
  }
  throw lastError;
}

// ── Address Validation ───────────────────────────────────

export function isValidSuiAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40,64}$/.test(address);
}

export function sanitizeAddress(address: string): string {
  return address.trim().toLowerCase();
}

// ── Rate Limiting (simple in-memory) ─────────────────────

const rateLimits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimits.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

// ── Timeout Wrapper ──────────────────────────────────────

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ]);
}

// ── Parallel with Error Handling ─────────────────────────

export async function parallelWithErrors<T extends readonly Promise<unknown>[]>(
  promises: T
): Promise<{ results: unknown[]; errors: (Error | null)[] }> {
  const results = await Promise.allSettled(promises);
  return {
    results: results.map((r) => (r.status === "fulfilled" ? r.value : null)),
    errors: results.map((r) => (r.status === "rejected" ? r.reason : null)),
  };
}
