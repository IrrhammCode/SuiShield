import { NextResponse } from "next/server";
import { getCurrentRate } from "@/lib/tatum";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol") || "ETH";
    const base = searchParams.get("base") || "USD";

    const rate = await getCurrentRate(symbol, base);

    return NextResponse.json({
      symbol,
      base,
      rate,
    });
  } catch (error: unknown) {
    console.error("Price API error:", error);
    return NextResponse.json({ error: (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
