import { NextRequest, NextResponse } from "next/server";
import { traceFundFlow, analyzeBehavior } from "@/lib/fund-flow";
import { getSuiTransactionBlocks } from "@/lib/tatum-sui";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, depth = 2, maxNodes = 50 } = body;

    if (!address || typeof address !== "string") {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    // Run fund flow analysis and behavioral analysis in parallel
    const [flowGraph, txData] = await Promise.all([
      traceFundFlow(address, depth, maxNodes),
      getSuiTransactionBlocks(address, 20),
    ]);

    // Run behavioral analysis on the transactions
    const behavioral = await analyzeBehavior(address, txData.data || []);

    return NextResponse.json({
      flowGraph,
      behavioral,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("Fund flow API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
