import { NextRequest } from "next/server";
import { traceFundFlow, analyzeBehavior } from "@/lib/fund-flow";
import { getSuiTransactionBlocks } from "@/lib/tatum-sui";
import { apiError, apiSuccess, isValidSuiAddress, withTimeout } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, depth = 2, maxNodes = 30 } = body;

    if (!address || typeof address !== "string") {
      return apiError("Address is required", 400);
    }

    if (!isValidSuiAddress(address)) {
      return apiError("Invalid Sui address format", 400);
    }

    // Run fund flow analysis and behavioral analysis in parallel with timeout
    const [flowGraph, txData] = await Promise.all([
      withTimeout(traceFundFlow(address, Math.min(depth, 3), Math.min(maxNodes, 50)), 45000),
      withTimeout(getSuiTransactionBlocks(address, 20), 15000),
    ]);

    // Run behavioral analysis on the transactions
    const behavioral = await analyzeBehavior(address, (txData.data || []) as Array<{
      digest?: string;
      timestampMs?: string;
      balanceChanges?: Array<{ owner?: { AddressOwner?: string }; amount?: string }>;
    }>);

    return apiSuccess({
      flowGraph,
      behavioral,
      analyzedAt: new Date().toISOString(),
    });
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
