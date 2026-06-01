import { NextRequest, NextResponse } from "next/server";
import { simulateTransfer, simulateContractInteraction } from "@/lib/simulate";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, fromAddress, toAddress, amount, contractAddress, functionName } = body;

    if (type === "contract") {
      if (!fromAddress || !contractAddress) {
        return NextResponse.json({ error: "fromAddress and contractAddress required" }, { status: 400 });
      }
      const result = await simulateContractInteraction(fromAddress, contractAddress, functionName || "unknown");
      return NextResponse.json(result);
    }

    // Default: transfer simulation
    if (!fromAddress || !toAddress || !amount) {
      return NextResponse.json({ error: "fromAddress, toAddress, and amount required" }, { status: 400 });
    }

    const result = await simulateTransfer({ fromAddress, toAddress, amount: parseFloat(amount) });
    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
