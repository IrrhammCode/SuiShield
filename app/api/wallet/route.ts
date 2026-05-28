import { NextResponse } from "next/server";
import { getAddressBalance, getAddressTransactions } from "@/lib/tatum";

export async function POST(request: Request) {
  try {
    const { address, chain = "ethereum" } = await request.json();

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const [balance, txs] = await Promise.all([
      getAddressBalance(chain, address),
      getAddressTransactions(chain, address, { pageSize: 20 }),
    ]);

    // Basic risk analysis
    const txCount = Array.isArray(txs) ? txs.length : 0;
    const riskScore = Math.min(100, Math.max(0, txCount > 100 ? 20 : txCount > 10 ? 40 : 60));

    return NextResponse.json({
      address,
      chain,
      balance,
      transactions: txs,
      riskScore,
      riskLevel: riskScore < 25 ? "safe" : riskScore < 50 ? "low" : riskScore < 75 ? "medium" : "high",
    });
  } catch (error: unknown) {
    console.error("Wallet API error:", error);
    return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
