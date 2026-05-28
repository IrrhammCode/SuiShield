import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "@/lib/agent/agent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, walletAddress, mode, prompt } = body;

    if (!address || typeof address !== "string") {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    // Build analysis prompt based on mode
    const modePrompts: Record<string, string> = {
      defi: `Perform a DeFi-focused trust analysis on this Sui address: ${address}

Analyze:
1. Protocol Health: TVL trend (growing/shrinking), age, audit status
2. Sustainability: Is yield from real fees or token emissions?
3. Concentration Risk: Top holder % — if they exit, what happens?
4. Peer Comparison: How does it compare to alternatives (Cetus vs Turbos vs Scallop)?
5. Exit Risk: Liquidity depth, slippage estimation
6. Trust Score (0-100) with clear verdict: SAFE, LOW RISK, MEDIUM RISK, HIGH RISK, or DANGEROUS
7. Recommendation: Deposit or don't, with clear reasoning

Be thorough and specific. Use real data from tools.`,

      nft: `Perform an NFT-focused trust analysis on this Sui address: ${address}

Analyze:
1. Creator Check: Wallet age, past projects, rug history
2. Collection Health: Unique holders %, Gini coefficient, holder growth
3. Wash Trading Detection: Volume vs unique wallets, trading pattern
4. Floor Price Reality: Organic or manipulated?
5. Copycat Detection: Name similarity to known projects
6. Trust Score (0-100) with clear verdict: SAFE, LOW RISK, MEDIUM RISK, HIGH RISK, or DANGEROUS
7. Recommendation: Buy or skip, with evidence

Be thorough and specific. Use real data from tools.`,

      p2p: `Perform a P2P counterparty risk analysis on this Sui address: ${address}

Analyze:
1. Wallet Pedigree: Age, creation pattern, funding source
2. Transaction DNA: Pattern analysis, frequency, counterparties
3. Scam Database: Cross-reference with flagged addresses
4. Money Flow: Source tracing, money mule detection
5. Network Risk: 1-hop check to flagged addresses
6. Trust Score (0-100) with clear verdict: SAFE, LOW RISK, MEDIUM RISK, HIGH RISK, or DANGEROUS
7. Recommendation: Transact or don't, with risk level

Be thorough and specific. Use real data from tools.`,
    };

    const defaultMessage = `Perform a comprehensive trust analysis on this Sui address: ${address}

Analyze and provide:
1. Trust Score (0-100) with clear verdict
2. Wallet age and activity pattern
3. Transaction analysis (frequency, counterparties, amounts)
4. Risk signals (positive, warning, negative)
5. Historical context from Walrus datasets
6. Recommendation: safe to interact or not

Be thorough and specific. Use real data from tools.`;

    const message = (mode && modePrompts[mode]) || prompt || defaultMessage;

    const response = await runAgent(
      message,
      walletAddress || address,
      []
    );

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : String(error)) || "Analysis failed" },
      { status: 500 }
    );
  }
}
