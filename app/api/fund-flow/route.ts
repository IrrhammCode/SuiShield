import { NextRequest } from "next/server";
import { traceFundFlow, analyzeBehavior } from "@/lib/fund-flow";
import { getSuiTransactionBlocks } from "@/lib/tatum-sui";
import { apiError, apiSuccess, isValidSuiAddress, withTimeout } from "@/lib/api-utils";
import { rateLimiter, RATE_LIMITS, getClientId } from "@/lib/rate-limit";
import { cache, CACHE_TTL, cacheKey } from "@/lib/cache";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientId(req);
    const rateLimit = rateLimiter.check(
      `fund-flow:${clientId}`,
      RATE_LIMITS.FUND_FLOW.maxRequests,
      RATE_LIMITS.FUND_FLOW.windowMs
    );

    if (!rateLimit.allowed) {
      return apiError(
        "Rate limit exceeded. Please try again later.",
        429,
        { retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000) }
      );
    }

    const body = await req.json();
    const { address, depth = 2, maxNodes = 50 } = body;

    if (!address || typeof address !== "string") {
      return apiError("Address is required", 400);
    }

    if (!isValidSuiAddress(address)) {
      return apiError("Invalid Sui address format", 400);
    }

    // Check cache
    const cacheKeyStr = cacheKey("fund-flow", address, String(depth), String(maxNodes));
    const cached = cache.get<Record<string, unknown>>(cacheKeyStr);
    if (cached) {
      return apiSuccess(cached);
    }

    // Run fund flow analysis and behavioral analysis in parallel with timeout
    const [flowGraph, txData] = await Promise.all([
      withTimeout(traceFundFlow(address, Math.min(depth, 3), Math.min(maxNodes, 50)), 45000),
      withTimeout(getSuiTransactionBlocks(address, 30), 15000),
    ]);

    // Run behavioral analysis on the transactions
    const behavioral = await analyzeBehavior(address, (txData.data || []) as Array<{
      digest?: string;
      timestampMs?: string;
      balanceChanges?: Array<{ owner?: { AddressOwner?: string }; amount?: string }>;
    }>);

    const result = {
      flowGraph,
      behavioral,
      analyzedAt: new Date().toISOString(),
    };

    // Cache the result
    cache.set(cacheKeyStr, result as unknown as Record<string, unknown>, CACHE_TTL.FUND_FLOW);

    return apiSuccess(result);
  } catch (error: unknown) {
    console.error("Fund flow API error:", error);

    if (error instanceof Error && error.message.includes("Timeout")) {
      return apiError("Fund flow analysis timed out. The address may have too many transactions. Try with depth=1.", 504);
    }

    return apiError(
      error instanceof Error ? error.message : "Fund flow analysis failed",
      500
    );
  }
}
