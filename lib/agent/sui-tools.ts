// Sui-specific Agent Tools — powered by Tatum Sui RPC

import {
  getSuiBalances,
  getSuiObjects,
  getSuiTransactionBlocks,
  getSuiLatestCheckpoint,
  getSuiProtocolConfig,
  formatSuiBalance,
  mistToSui,
} from "@/lib/tatum-sui";
import { saveAnalysis, buildMemoryContext, getPreviousAnalysis } from "./memory";
import type { ToolResult } from "./tools";

// ── Sui Tools ────────────────────────────────────────────

export async function toolGetSuiBalance(
  address: string
): Promise<ToolResult> {
  const start = Date.now();
  try {
    const balances = await getSuiBalances(address);
    const suiBalance = balances.find((b) => b.coinType === "0x2::sui::SUI");

    return {
      tool: "getSuiBalance",
      success: true,
      data: {
        address,
        totalBalance: suiBalance?.totalBalance || "0",
        formattedBalance: formatSuiBalance(suiBalance?.totalBalance || "0"),
        coinTypes: balances.map((b) => ({
          coinType: b.coinType,
          balance: b.totalBalance,
          objectCount: b.coinObjectCount,
        })),
        allBalances: balances,
      },
      duration: Date.now() - start,
    };
  } catch (e: unknown) {
    return {
      tool: "getSuiBalance",
      success: false,
      data: null,
      error: e instanceof Error ? e.message : String(e),
      duration: Date.now() - start,
    };
  }
}

export async function toolGetSuiObjects(
  address: string,
  limit = 50
): Promise<ToolResult> {
  const start = Date.now();
  try {
    const result = await getSuiObjects(address, limit);

    // Categorize objects
    const objects = result.data || [];
    const objectTypes: Record<string, number> = {};
    for (const obj of objects) {
      const type = obj.data?.type || "unknown";
      const category = type.includes("::coin::Coin") ? "coin" :
                       type.includes("::nft") || type.includes("::display") ? "nft" :
                       type.includes("::package") ? "package" :
                       type.includes("::staking") ? "staking" :
                       "other";
      objectTypes[category] = (objectTypes[category] || 0) + 1;
    }

    return {
      tool: "getSuiObjects",
      success: true,
      data: {
        objectCount: objects.length,
        hasNextPage: result.hasNextPage,
        objectTypes,
        objects: objects.slice(0, 20).map((o) => ({
          objectId: o.data?.objectId,
          type: o.data?.type,
          digest: o.data?.digest,
        })),
      },
      duration: Date.now() - start,
    };
  } catch (e: unknown) {
    return {
      tool: "getSuiObjects",
      success: false,
      data: null,
      error: e instanceof Error ? e.message : String(e),
      duration: Date.now() - start,
    };
  }
}

export async function toolGetSuiTransactions(
  address: string,
  limit = 20
): Promise<ToolResult> {
  const start = Date.now();
  try {
    const result = await getSuiTransactionBlocks(address, limit);
    const txs = result.data || [];

    // Analyze transaction patterns
    const txTypes: Record<string, number> = {};
    let totalGasUsed = 0;

    for (const tx of txs) {
      const kind = tx.transaction?.data?.transaction?.kind || "unknown";
      txTypes[kind] = (txTypes[kind] || 0) + 1;

      if (tx.effects?.gasUsed) {
        totalGasUsed +=
          Number(tx.effects.gasUsed.computationCost) +
          Number(tx.effects.gasUsed.storageCost) -
          Number(tx.effects.gasUsed.storageRebate);
      }
    }

    return {
      tool: "getSuiTransactions",
      success: true,
      data: {
        transactionCount: txs.length,
        hasNextPage: result.hasNextPage,
        txTypes,
        totalGasUsed: formatSuiBalance(totalGasUsed),
        transactions: txs.slice(0, 10).map((tx) => ({
          digest: tx.digest,
          timestamp: tx.timestampMs
            ? new Date(Number(tx.timestampMs)).toISOString()
            : "unknown",
          status: tx.effects?.status?.status,
          kind: tx.transaction?.data?.transaction?.kind,
          sender: tx.transaction?.data?.sender,
        })),
      },
      duration: Date.now() - start,
    };
  } catch (e: unknown) {
    return {
      tool: "getSuiTransactions",
      success: false,
      data: null,
      error: e instanceof Error ? e.message : String(e),
      duration: Date.now() - start,
    };
  }
}

export async function toolGetSuiNetworkStatus(): Promise<ToolResult> {
  const start = Date.now();
  try {
    const [checkpoint, protocolConfig] = await Promise.all([
      getSuiLatestCheckpoint(),
      getSuiProtocolConfig(),
    ]);

    return {
      tool: "getSuiNetworkStatus",
      success: true,
      data: {
        latestCheckpoint: checkpoint,
        protocolVersion: (protocolConfig as Record<string, unknown>)?.protocolVersion,
        chainId: ((protocolConfig as Record<string, unknown>)?.attributes as Record<string, Record<string, unknown>>)?.ChainIdentifier?.u64,
      },
      duration: Date.now() - start,
    };
  } catch (e: unknown) {
    return {
      tool: "getSuiNetworkStatus",
      success: false,
      data: null,
      error: e instanceof Error ? e.message : String(e),
      duration: Date.now() - start,
    };
  }
}

// ── Composite: Full Sui Wallet Analysis ──────────────────

export async function toolAnalyzeSuiWallet(
  address: string,
  analyzedBy: string
): Promise<ToolResult> {
  const start = Date.now();

  try {
    // Check for previous analysis (agent memory)
    const memoryContext = buildMemoryContext("sui", address);
    const previousAnalysis = await getPreviousAnalysis("sui", address);

    // Fetch all data in parallel
    const [balanceResult, objectsResult, txResult] = await Promise.all([
      toolGetSuiBalance(address),
      toolGetSuiObjects(address, 50),
      toolGetSuiTransactions(address, 20),
    ]);

    // Calculate risk score based on patterns
    interface BalanceData { totalBalance: string; formattedBalance: string }
    interface ObjectsData { objectCount: number; objectTypes: Record<string, number> }
    interface TxsData { transactionCount: number; transactions: unknown[] }

    const balance = balanceResult.success ? (balanceResult.data as BalanceData) : null;
    const objects = objectsResult.success ? (objectsResult.data as ObjectsData) : null;
    const txs = txResult.success ? (txResult.data as TxsData) : null;

    let riskScore = 50; // baseline
    const riskFactors: string[] = [];

    // Balance-based risk
    if (balance) {
      const suiAmount = mistToSui(balance.totalBalance);
      if (suiAmount === 0) {
        riskScore += 10;
        riskFactors.push("Zero balance");
      }
      if (suiAmount > 100000) {
        riskScore -= 10;
        riskFactors.push("High balance (whale)");
      }
    }

    // Transaction-based risk
    if (txs) {
      if (txs.transactionCount === 0) {
        riskScore += 15;
        riskFactors.push("No transaction history");
      }
      if (txs.transactionCount > 100) {
        riskScore -= 10;
        riskFactors.push("Active transaction history");
      }
    }

    // Object-based risk
    if (objects) {
      if (objects.objectCount > 1000) {
        riskFactors.push("Very high object count");
      }
    }

    // Previous analysis comparison
    if (previousAnalysis) {
      const prevScore = previousAnalysis.record.riskScore;
      const scoreDiff = Math.abs(riskScore - prevScore);
      if (scoreDiff > 20) {
        riskFactors.push(`Risk score changed significantly (${prevScore} → ${riskScore})`);
      }
    }

    riskScore = Math.max(0, Math.min(100, riskScore));

    const riskLevel =
      riskScore < 25 ? "safe" :
      riskScore < 50 ? "low" :
      riskScore < 75 ? "medium" :
      "high";

    // Store analysis on Walrus
    const analysisText = [
      `Sui wallet analysis for ${address}`,
      `Balance: ${balance?.formattedBalance || "unknown"}`,
      `Objects: ${objects?.objectCount || 0}`,
      `Transactions: ${txs?.transactionCount || 0}`,
      `Risk factors: ${riskFactors.join(", ") || "none"}`,
    ].join(". ");

    const stored = await saveAnalysis({
      address,
      chain: "sui",
      riskScore,
      riskLevel,
      balance: balance?.formattedBalance || "0 SUI",
      transactionCount: txs?.transactionCount || 0,
      analysis: analysisText,
      agentSteps: [
        "getSuiBalance",
        "getSuiObjects",
        "getSuiTransactions",
        "riskAnalysis",
        "storeOnWalrus",
      ],
      analyzedBy,
    });

    return {
      tool: "analyzeSuiWallet",
      success: true,
      data: {
        address,
        chain: "sui",
        riskScore,
        riskLevel,
        riskFactors,
        balance: balance?.formattedBalance || "0 SUI",
        objectCount: objects?.objectCount || 0,
        transactionCount: txs?.transactionCount || 0,
        objectTypes: objects?.objectTypes || {},
        recentTransactions: txs?.transactions || [],
        onChainProof: {
          blobId: stored.blobId,
          storedAt: stored.storedAt,
          verificationUrl: `/verify/${stored.blobId}`,
        },
        previousAnalysis: previousAnalysis
          ? {
              blobId: previousAnalysis.blobId,
              timestamp: previousAnalysis.storedAt,
              previousRiskScore: previousAnalysis.record.riskScore,
            }
          : null,
        memoryContext,
      },
      duration: Date.now() - start,
    };
  } catch (e: unknown) {
    return {
      tool: "analyzeSuiWallet",
      success: false,
      data: null,
      error: e instanceof Error ? e.message : String(e),
      duration: Date.now() - start,
    };
  }
}

// ── Intent Detection for Sui ─────────────────────────────

export type SuiIntent =
  | "sui_balance"
  | "sui_objects"
  | "sui_transactions"
  | "sui_wallet_analysis"
  | "sui_network"
  | "general";

export function detectSuiIntent(message: string): SuiIntent {
  const lower = message.toLowerCase();

  // Check for Sui address (0x prefix, typically 64 hex chars)
  const hasSuiAddress = /0x[a-fA-F0-9]{40,64}/.test(message);

  if (hasSuiAddress && (lower.includes("analyz") || lower.includes("check") || lower.includes("safe") || lower.includes("risk") || lower.includes("scan"))) {
    return "sui_wallet_analysis";
  }

  if (hasSuiAddress && (lower.includes("balance") || lower.includes("sui") || lower.includes("coin"))) {
    return "sui_balance";
  }

  if (hasSuiAddress && (lower.includes("object") || lower.includes("nft") || lower.includes("token"))) {
    return "sui_objects";
  }

  if (hasSuiAddress && (lower.includes("transaction") || lower.includes("tx") || lower.includes("history"))) {
    return "sui_transactions";
  }

  if (hasSuiAddress) {
    return "sui_wallet_analysis"; // default for Sui address queries
  }

  if (lower.includes("sui") && (lower.includes("network") || lower.includes("status") || lower.includes("checkpoint"))) {
    return "sui_network";
  }

  return "general";
}

/** Extract Sui address from message */
export function extractSuiAddress(message: string): string | null {
  const match = message.match(/0x[a-fA-F0-9]{40,64}/);
  return match ? match[0] : null;
}
