import { NextRequest } from "next/server";
import { runAgent } from "@/lib/agent/agent";
import { apiError, apiSuccess, isValidSuiAddress, withTimeout } from "@/lib/api-utils";
import { rateLimiter, RATE_LIMITS, getClientId } from "@/lib/rate-limit";
import { cache, CACHE_TTL, cacheKey } from "@/lib/cache";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientId(req);
    const rateLimit = rateLimiter.check(
      `analyze:${clientId}`,
      RATE_LIMITS.ANALYSIS.maxRequests,
      RATE_LIMITS.ANALYSIS.windowMs
    );

    if (!rateLimit.allowed) {
      return apiError(
        "Rate limit exceeded. Please try again later.",
        429,
        { retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000) }
      );
    }

    const body = await req.json();
    const { address, walletAddress, mode, prompt } = body;

    if (!address || typeof address !== "string") {
      return apiError("Address is required", 400);
    }

    // Validate address format
    if (!isValidSuiAddress(address)) {
      return apiError("Invalid Sui address format. Must start with 0x followed by 40-64 hex characters.", 400);
    }

    const normalizedMode = (mode || "general").toLowerCase();

    // Check cache for recent analysis
    const cacheKeyStr = cacheKey("analysis", address, normalizedMode);
    const cachedAnalysis = cache.get<Record<string, unknown>>(cacheKeyStr);
    if (cachedAnalysis) {
      return apiSuccess(cachedAnalysis);
    }

    // Build analysis prompt based on mode
    const modePrompts: Record<string, string> = {
      defi: `Perform a deep DeFi trust analysis on this Sui address: ${address}

Execute these steps:
1. Get balance — check SUI + token holdings
2. Get objects — identify DeFi positions, LP tokens
3. Get transactions — analyze interaction patterns
4. Check protocols — which DeFi protocols has this address used?

Analyze and score:
- **Protocol Health**: Which protocols? Verified (Cetus, Scallop, Turbos, Navi) vs unknown?
- **Yield Sustainability**: Is yield from real fees or token emissions?
- **Concentration Risk**: Top holder % — if they exit, what happens?
- **Exit Risk**: Liquidity depth, slippage estimation
- **Trust Score**: 0-100 with clear verdict

Be thorough. Use real tool data. Provide specific numbers.`,

      nft: `Perform a deep NFT trust analysis on this Sui address: ${address}

Execute these steps:
1. Get objects — identify NFTs owned, collections
2. Get transactions — check minting, trading patterns
3. Check balance — does wallet hold meaningful assets?

Analyze and score:
- **Creator Check**: Wallet age, past projects, rug history
- **Collection Health**: Unique holders, trading volume
- **Wash Trading Detection**: Volume vs unique wallets
- **Floor Price Reality**: Organic or manipulated?
- **Trust Score**: 0-100 with clear verdict

Be thorough. Use real tool data.`,

      p2p: `Perform a deep P2P counterparty risk analysis on this Sui address: ${address}

Execute these steps:
1. Get balance — what does this wallet hold?
2. Get transactions — analyze transaction patterns
3. Get fund flow — trace money movement
4. Check protocols — what has this wallet interacted with?

Analyze and score:
- **Wallet Pedigree**: Age, creation pattern, funding source
- **Transaction DNA**: Pattern analysis, frequency, counterparties
- **Money Flow**: Source tracing, money mule detection
- **Network Risk**: 1-hop check to flagged addresses
- **Trust Score**: 0-100 with clear verdict

Be thorough. Use real tool data. Flag suspicious patterns.`,
    };

    const defaultMessage = `Perform a comprehensive trust analysis on this Sui address: ${address}

Execute ALL available tools:
1. getSuiBalance — all coin balances
2. getSuiObjects — owned objects (NFTs, tokens, contracts)
3. getSuiTransactions — transaction history
4. getSuiFundFlow — money flow analysis
5. checkSuiProtocols — DeFi protocol interactions
6. MCP security check — malicious address database

Provide:
- Trust Score (0-100) with clear verdict
- Wallet overview (balance, tx count, age, last active)
- Risk signals (positive +, warning !, negative -)
- Protocol interactions (verified vs unverified)
- Fund flow summary
- Recommendation

Be thorough and specific. Use real data from tools.`;

    const message = (normalizedMode && modePrompts[normalizedMode]) || prompt || defaultMessage;

    // Run agent with timeout
    const response = await withTimeout(
      runAgent(message, walletAddress || address, [], normalizedMode),
      60000 // 60 second timeout
    );

    // Cache the result
    cache.set(cacheKeyStr, response as unknown as Record<string, unknown>, CACHE_TTL.ANALYSIS);

    return apiSuccess(response as unknown as Record<string, unknown>);
  } catch (error: unknown) {
    console.error("Analysis API error:", error);

    if (error instanceof Error && error.message.includes("Timeout")) {
      return apiError("Analysis timed out. The address may have too many transactions.", 504);
    }

    return apiError(
      error instanceof Error ? error.message : "Analysis failed",
      500
    );
  }
}
