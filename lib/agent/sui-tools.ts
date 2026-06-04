// Sui-specific Agent Tools — powered by Tatum Sui RPC

import {
  getSuiBalances,
  getSuiObjects,
  getSuiTransactionBlocks,
  getSuiLatestCheckpoint,
  getSuiProtocolConfig,
  getSuiPrice,
  formatSuiBalance,
  mistToSui,
} from "@/lib/tatum-sui";
import {
  analyzeProtocolInteractions,
  getVerifiedProtocols,
  getProtocolsByType,
  type ProtocolAnalysis,
} from "@/lib/sui-protocols";
import {
  mcpCheckMaliciousAddress,
  mcpGetExchangeRate,
} from "@/lib/tatum-mcp";
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

export async function toolGetSuiPrice(): Promise<ToolResult> {
  const start = Date.now();
  try {
    const price = await getSuiPrice();

    return {
      tool: "getSuiPrice",
      success: true,
      data: {
        symbol: price.symbol,
        basePair: price.basePair,
        price: price.price,
        timestamp: price.timestamp,
      },
      duration: Date.now() - start,
    };
  } catch (e: unknown) {
    return {
      tool: "getSuiPrice",
      success: false,
      data: null,
      error: e instanceof Error ? e.message : String(e),
      duration: Date.now() - start,
    };
  }
}

export async function toolGetSuiFundFlow(address: string): Promise<ToolResult> {
  const start = Date.now();
  try {
    // Get recent transactions to trace fund flow
    const txResult = await toolGetSuiTransactions(address, 20);
    if (!txResult.success) throw new Error(txResult.error || "Failed to fetch transactions");

    const txs = txResult.data as { transactions: Array<{ digest: string; effects?: { balanceChanges?: Array<{ owner?: { AddressOwner?: string }; coinType: string; amount: string }> } }> };
    const nodes: Array<{ id: string; label: string; type: "target" | "counterparty" | "self" }> = [
      { id: address, label: `${address.slice(0, 6)}...${address.slice(-4)}`, type: "target" },
    ];
    const links: Array<{ source: string; target: string; value: number; type: string }> = [];
    const seen = new Set<string>();

    for (const tx of txs.transactions || []) {
      const changes = tx.effects?.balanceChanges || [];
      for (const change of changes) {
        const counterparty = change.owner?.AddressOwner;
        if (!counterparty || counterparty === address) continue;

        const amount = Math.abs(Number(change.amount)) / 1_000_000_000; // Convert MIST to SUI
        if (amount < 0.01) continue; // Skip dust

        const isIncoming = Number(change.amount) > 0;
        const source = isIncoming ? counterparty : address;
        const target = isIncoming ? address : counterparty;

        if (!seen.has(counterparty)) {
          seen.add(counterparty);
          nodes.push({
            id: counterparty,
            label: `${counterparty.slice(0, 6)}...${counterparty.slice(-4)}`,
            type: "counterparty",
          });
        }

        links.push({
          source,
          target,
          value: Math.round(amount * 100) / 100,
          type: isIncoming ? "incoming" : "outgoing",
        });
      }
    }

    // If depth > 1, we could recursively trace (simplified for hackathon)
    const summary = `Fund flow for ${address.slice(0, 10)}...: ${links.length} transfers found, ${links.filter(l => l.type === "incoming").length} incoming, ${links.filter(l => l.type === "outgoing").length} outgoing`;

    return {
      tool: "getSuiFundFlow",
      success: true,
      data: {
        address,
        nodes,
        links,
        summary,
        transferCount: links.length,
        incomingCount: links.filter(l => l.type === "incoming").length,
        outgoingCount: links.filter(l => l.type === "outgoing").length,
      },
      duration: Date.now() - start,
    };
  } catch (e: unknown) {
    return {
      tool: "getSuiFundFlow",
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

    // Fetch all data in parallel — Tatum Sui RPC + MCP tools
    const [balanceResult, objectsResult, txResult, maliciousCheck, exchangeRate] = await Promise.all([
      toolGetSuiBalance(address),
      toolGetSuiObjects(address, 50),
      toolGetSuiTransactions(address, 20),
      mcpCheckMaliciousAddress(address, "sui-testnet").catch(() => null),
      mcpGetExchangeRate("SUI", "USD").catch(() => null),
    ]);

    // Calculate multi-signal trust score
    interface BalanceData { totalBalance: string; formattedBalance: string }
    interface ObjectsData { objectCount: number; objectTypes: Record<string, number> }
    interface TxsData { transactionCount: number; transactions: unknown[] }

    const balance = balanceResult.success ? (balanceResult.data as BalanceData) : null;
    const objects = objectsResult.success ? (objectsResult.data as ObjectsData) : null;
    const txs = txResult.success ? (txResult.data as TxsData) : null;

    const riskFactors: string[] = [];

    // ── Signal 1: On-chain Activity Score ─────────────────
    let onChainScore = 50;
    if (txs) {
      if (txs.transactionCount === 0) {
        onChainScore += 20;
        riskFactors.push("No transaction history");
      } else if (txs.transactionCount > 100) {
        onChainScore -= 15;
        riskFactors.push("Active transaction history (100+ txs)");
      } else if (txs.transactionCount > 10) {
        onChainScore -= 5;
      }
    }
    if (objects) {
      const diversity = Object.keys(objects.objectTypes || {}).length;
      if (diversity > 3) onChainScore -= 5; // Diverse interactions = safer
      if (objects.objectCount > 1000) riskFactors.push("Very high object count");
    }
    onChainScore = Math.max(0, Math.min(100, onChainScore));

    // ── Signal 2: Wallet Maturity Score ───────────────────
    let maturityScore = 50;
    if (txs && txs.transactions.length > 0) {
      // Estimate age from transaction count (approximation)
      const estimatedAgeDays = Math.min(txs.transactionCount * 2, 730);
      maturityScore -= Math.min(estimatedAgeDays / 10, 30); // Older = safer
      if (estimatedAgeDays < 7) {
        maturityScore += 20;
        riskFactors.push("Very new wallet (< 1 week)");
      }
    } else {
      maturityScore += 15;
      riskFactors.push("No transaction history to estimate age");
    }
    maturityScore = Math.max(0, Math.min(100, maturityScore));

    // ── Signal 3: Balance Health Score ────────────────────
    let balanceScore = 50;
    if (balance) {
      const suiAmount = mistToSui(balance.totalBalance);
      if (suiAmount === 0) {
        balanceScore += 20;
        riskFactors.push("Zero balance");
      } else if (suiAmount > 0 && suiAmount < 1000000) {
        balanceScore -= 10; // Reasonable balance = safer
      } else if (suiAmount > 100000) {
        riskFactors.push("High balance (whale)");
      }
    }
    balanceScore = Math.max(0, Math.min(100, balanceScore));

    // ── Signal 4: Community Score (from reports) ──────────
    let communityScore = 50;
    if (previousAnalysis) {
      const prevScore = previousAnalysis.record.riskScore;
      const scoreDiff = Math.abs(50 - prevScore);
      if (scoreDiff > 20) {
        riskFactors.push(`Previous analysis showed ${prevScore > 70 ? "high" : "low"} risk`);
        communityScore = prevScore; // Use previous as baseline
      }
    }

    // ── Signal 5: Protocol Interaction Score ──────────────
    let protocolScore = 50;
    let protocolAnalysis: ProtocolAnalysis | null = null;
    if (txs && txs.transactions.length > 0) {
      protocolAnalysis = analyzeProtocolInteractions(
        txs.transactions as Parameters<typeof analyzeProtocolInteractions>[0]
      );
      protocolScore = protocolAnalysis.protocolScore;
      riskFactors.push(...protocolAnalysis.riskFactors);

      if (protocolAnalysis.totalProtocols > 0) {
        const verifiedNames = protocolAnalysis.interactions
          .filter((i) => i.riskLevel === "low")
          .map((i) => i.protocolName);
        if (verifiedNames.length > 0) {
          riskFactors.push(`Verified protocol interactions: ${verifiedNames.join(", ")}`);
        }
      }
    }

    // ── Signal 6: Tatum MCP Security Check ────────────────
    let mcpSecurityScore = 50;
    if (maliciousCheck) {
      if (maliciousCheck.isMalicious) {
        mcpSecurityScore = 95;
        riskFactors.push(`Tatum MCP flagged as malicious: ${maliciousCheck.category || "unknown"}`);
      } else {
        mcpSecurityScore = 10;
        riskFactors.push("Tatum MCP: address not in malicious database");
      }
    }

    // ── Signal 7: Object Diversity Score ───────────────────
    let objectDiversityScore = 50;
    if (objects) {
      const typeCount = Object.keys(objects.objectTypes || {}).length;
      if (typeCount >= 3) {
        objectDiversityScore -= 15; // Diverse interactions = safer
        riskFactors.push(`Diverse object types: ${typeCount} different types`);
      } else if (typeCount === 0) {
        objectDiversityScore += 10;
        riskFactors.push("No objects owned");
      }
    }
    objectDiversityScore = Math.max(0, Math.min(100, objectDiversityScore));

    // ── Signal 8: Transaction Regularity Score ─────────────
    let txRegularityScore = 50;
    if (txs && txs.transactions.length >= 5) {
      // Check if transactions are evenly spaced (regular pattern)
      const timestamps = txs.transactions
        .map((tx) => (tx as { timestampMs?: string }).timestampMs ? Number((tx as { timestampMs?: string }).timestampMs) : 0)
        .filter((t) => t > 0)
        .sort();
      
      if (timestamps.length >= 3) {
        const intervals = [];
        for (let i = 1; i < timestamps.length; i++) {
          intervals.push(timestamps[i] - timestamps[i - 1]);
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length;
        const stdDev = Math.sqrt(variance);
        
        // Low variance = regular pattern = safer
        if (stdDev < avgInterval * 0.3) {
          txRegularityScore -= 10;
          riskFactors.push("Regular transaction pattern detected");
        }
      }
    }
    txRegularityScore = Math.max(0, Math.min(100, txRegularityScore));

    // ── Composite Score (weighted average) ────────────────
    const riskScore = Math.round(
      onChainScore * 0.15 +
      maturityScore * 0.12 +
      balanceScore * 0.12 +
      communityScore * 0.08 +
      protocolScore * 0.12 +
      mcpSecurityScore * 0.2 +
      objectDiversityScore * 0.1 +
      txRegularityScore * 0.11
    );

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
        multiSignalScores: {
          onChain: onChainScore,
          maturity: maturityScore,
          balance: balanceScore,
          community: communityScore,
          protocol: protocolScore,
          mcpSecurity: mcpSecurityScore,
        },
        mcpData: {
          maliciousCheck: maliciousCheck || null,
          exchangeRate: exchangeRate || null,
        },
        protocolAnalysis: protocolAnalysis
          ? {
              totalProtocols: protocolAnalysis.totalProtocols,
              verifiedProtocols: protocolAnalysis.verifiedProtocols,
              unverifiedProtocols: protocolAnalysis.unverifiedProtocols,
              interactions: protocolAnalysis.interactions,
              protocolScore: protocolAnalysis.protocolScore,
            }
          : null,
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

export async function toolCheckSuiProtocols(address: string): Promise<ToolResult> {
  const start = Date.now();
  try {
    const txResult = await toolGetSuiTransactions(address, 50);
    if (!txResult.success) throw new Error(txResult.error || "Failed to fetch transactions");

    const txs = txResult.data as { transactions: unknown[] };
    const protocolAnalysis = analyzeProtocolInteractions(
      txs.transactions as Parameters<typeof analyzeProtocolInteractions>[0]
    );

    // Get all known protocols for reference
    const allProtocols = getVerifiedProtocols();
    const dexProtocols = getProtocolsByType("dex");
    const lendingProtocols = getProtocolsByType("lending");
    const nftProtocols = getProtocolsByType("nft");

    return {
      tool: "checkSuiProtocols",
      success: true,
      data: {
        address,
        ...protocolAnalysis,
        knownProtocols: {
          total: allProtocols.length,
          dex: dexProtocols.map((p) => p.name),
          lending: lendingProtocols.map((p) => p.name),
          nft: nftProtocols.map((p) => p.name),
        },
      },
      duration: Date.now() - start,
    };
  } catch (e: unknown) {
    return {
      tool: "checkSuiProtocols",
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
  | "sui_price"
  | "sui_fund_flow"
  | "sui_protocol_check"
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

  if (lower.includes("sui") && (lower.includes("price") || lower.includes("cost") || lower.includes("value") || lower.includes("worth"))) {
    return "sui_price";
  }

  if (hasSuiAddress && (lower.includes("fund") || lower.includes("flow") || lower.includes("trace") || lower.includes("transfer") || lower.includes("money"))) {
    return "sui_fund_flow";
  }

  if (hasSuiAddress && (lower.includes("protocol") || lower.includes("defi") || lower.includes("cetus") || lower.includes("scallop") || lower.includes("turbos") || lower.includes("swap") || lower.includes("lending") || lower.includes("nft"))) {
    return "sui_protocol_check";
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
