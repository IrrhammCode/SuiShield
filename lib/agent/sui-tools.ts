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
        objects: objects.map((o) => ({
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
    // Get raw transactions directly — NOT via toolGetSuiTransactions which strips balanceChanges
    const txResult = await getSuiTransactionBlocks(address, 50);
    const rawTxs = txResult.data || [];

    const nodes: Array<{ id: string; label: string; type: "target" | "counterparty" | "self" }> = [
      { id: address, label: `${address.slice(0, 6)}...${address.slice(-4)}`, type: "target" },
    ];
    const links: Array<{ source: string; target: string; value: number; type: string; txHash?: string }> = [];
    const seen = new Set<string>();

    for (const tx of rawTxs) {
      // balanceChanges is at the ROOT level of the transaction block (not inside effects)
      const changes = tx.balanceChanges || [];
      if (changes.length === 0) continue;

      // Identify outgoing changes (negative amounts from the owner)
      const outgoing = changes.filter(
        (c) => c.owner?.AddressOwner === address && parseInt(c.amount || "0") < 0
      );

      for (const change of changes) {
        const counterparty = change.owner?.AddressOwner;
        if (!counterparty || counterparty === address) continue;

        const amount = Math.abs(Number(change.amount)) / 1_000_000_000; // MIST → SUI
        if (amount < 0.001) continue; // Skip dust

        const isOutgoing = outgoing.length > 0;
        const source = isOutgoing ? address : counterparty;
        const target = isOutgoing ? counterparty : address;

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
          value: Math.round(amount * 10000) / 10000,
          type: isOutgoing ? "outgoing" : "incoming",
          txHash: tx.digest,
        });
      }
    }

    const summary = `Fund flow for ${address.slice(0, 10)}...: ${links.length} transfers found, ${links.filter(l => l.type === "incoming").length} incoming, ${links.filter(l => l.type === "outgoing").length} outgoing, ${seen.size} unique counterparties`;

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
  analyzedBy: string,
  mode?: string
): Promise<ToolResult> {
  const start = Date.now();

  try {
    const normalizedMode = mode?.toLowerCase() || "general";
    // Check for previous analysis (agent memory)
    const memoryContext = buildMemoryContext("sui", address);
    const previousAnalysis = await getPreviousAnalysis("sui", address);

    // Fetch base data in parallel — Tatum Sui RPC + MCP tools
    // Mode-specific: fetch more objects for NFT. Always fetch 50 txs to share cache with protocol check
    const objectLimit = 50;
    const txLimit = 50;

    const [balanceResult, objectsResult, txResult, maliciousCheck, exchangeRate] = await Promise.all([
      toolGetSuiBalance(address),
      toolGetSuiObjects(address, objectLimit),
      toolGetSuiTransactions(address, txLimit),
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

    // ── Mode-specific data enrichment ─────────────────────
    // Each mode collects DIFFERENT additional data so the LLM produces distinct results
    let modeSpecificData: Record<string, unknown> = {};

    if (normalizedMode === "defi") {
      // DeFi: run full protocol check + fund flow for DeFi-specific analysis
      const [protocolCheckResult, fundFlowResult] = await Promise.all([
        toolCheckSuiProtocols(address).catch((e) => { console.error("Protocol check error:", e); return null; }),
        toolGetSuiFundFlow(address).catch((e) => { console.error("Fund flow error:", e); return null; }),
      ]);

      // Scan objects for DeFi-related types
      const allObjectTypes = objects?.objectTypes || {};
      const objectTypeKeys = Object.keys(allObjectTypes);
      const defiKeywords = ["pool", "liquidity", "lp", "vault", "stake", "lending", "swap", "amm", "farm", "yield"];
      const defiRelatedTypes = objectTypeKeys.filter(t =>
        defiKeywords.some(kw => t.toLowerCase().includes(kw))
      );

      const protocolData = protocolCheckResult?.success ? protocolCheckResult.data as Record<string, unknown> : null;
      const flowData = fundFlowResult?.success ? fundFlowResult.data as Record<string, unknown> : null;

      modeSpecificData = {
        mode: "defi",
        defiRelatedTypes,
        hasDeFiActivity: defiRelatedTypes.length > 0 || (protocolData?.totalProtocols as number || 0) > 0,
        protocolAnalysis: protocolData ? {
          totalProtocols: protocolData.totalProtocols,
          verifiedProtocols: protocolData.verifiedProtocols,
          unverifiedProtocols: protocolData.unverifiedProtocols,
          interactions: protocolData.interactions,
          protocolScore: protocolData.protocolScore,
          knownProtocols: protocolData.knownProtocols,
        } : null,
        fundFlow: flowData ? {
          transferCount: flowData.transferCount,
          incomingCount: flowData.incomingCount,
          outgoingCount: flowData.outgoingCount,
          uniqueCounterparties: (flowData.nodes as unknown[])?.length || 0,
          topTransfers: (flowData.links as Array<{ value: number; type: string }>)?.slice(0, 5),
        } : null,
        verifiedProtocolsUsed: defiRelatedTypes.filter(d =>
          ["cetus", "scallop", "turbos", "navi", "bucket", "bluemove", "aftermath", "deepbook"].some(p => d.toLowerCase().includes(p))
        ),
        allObjectTypes,
      };
    } else if (normalizedMode === "nft") {
      // NFT: deep object scan — classify every object for NFT analysis
      const allObjects = (objectsResult.success && objectsResult.data)
        ? (objectsResult.data as { objects: Array<{ objectId: string; type: string; digest: string }> }).objects
        : [];

      const nftKeywords = ["nft", "collection", "display", "kiosk", "suifrens", "bullshark", "capy", "image", "art", "mint"];
      const nftObjects = allObjects.filter(obj =>
        nftKeywords.some(kw => (obj.type || "").toLowerCase().includes(kw))
      );

      // Group by collection (approximate by type prefix)
      const collectionMap: Record<string, number> = {};
      for (const obj of nftObjects) {
        const typePrefix = (obj.type || "unknown").split("::").slice(0, 2).join("::");
        collectionMap[typePrefix] = (collectionMap[typePrefix] || 0) + 1;
      }

      // Check for minting activity in transactions
      const txList = txs?.transactions || [];
      const mintTxs = (txList as Array<{ kind?: string; digest?: string }>).filter(tx =>
        (tx.kind || "").toLowerCase().includes("move") ||
        (tx.kind || "").toLowerCase().includes("publish")
      );

      modeSpecificData = {
        mode: "nft",
        totalObjects: objects?.objectCount || 0,
        nftObjectCount: nftObjects.length,
        nftObjects: nftObjects.slice(0, 20).map(o => ({ objectId: o.objectId, type: o.type })),
        collections: collectionMap,
        collectionCount: Object.keys(collectionMap).length,
        hasNFTActivity: nftObjects.length > 0,
        mintingTransactions: mintTxs.length,
        allObjectTypes: objects?.objectTypes || {},
        washTradingSignals: {
          highVolumeUniqueRatio: txs ? (txs.transactionCount > 50 && nftObjects.length < 5) : false,
          repeatedCounterparties: false, // would need deeper analysis
        },
      };
    } else if (normalizedMode === "p2p") {
      // P2P: full fund flow tracing + counterparty analysis
      const fundFlowResult = await toolGetSuiFundFlow(address).catch(() => null);
      const flowData = fundFlowResult?.success ? fundFlowResult.data as Record<string, unknown> : null;

      // Extract counterparties from fund flow links (much more accurate than tx.sender)
      const counterparties = new Set<string>();
      const senderCounts: Record<string, number> = {};
      const flowLinks = (flowData?.links as Array<{ source: string; target: string; value: number; type: string }>) || [];

      for (const link of flowLinks) {
        const counterparty = link.source === address ? link.target : link.source;
        if (counterparty && counterparty !== address) {
          counterparties.add(counterparty);
          senderCounts[counterparty] = (senderCounts[counterparty] || 0) + 1;
        }
      }

      // Detect suspicious patterns
      const repeatedSenders = Object.entries(senderCounts)
        .filter(([, count]) => count >= 3)
        .map(([addr, count]) => ({ address: addr.slice(0, 10) + "...", count }));

      // Estimate wallet age from raw transaction timestamps
      const rawTxData = await getSuiTransactionBlocks(address, 50).catch(() => null);
      const rawTimestamps = (rawTxData?.data || [])
        .map(tx => tx.timestampMs ? new Date(Number(tx.timestampMs)).toISOString() : null)
        .filter(Boolean)
        .sort() as string[];
      const firstTxDate = rawTimestamps.length > 0 ? rawTimestamps[0] : null;
      const lastTxDate = rawTimestamps.length > 0 ? rawTimestamps[rawTimestamps.length - 1] : null;

      // Sort transfers by value for top transfers
      const sortedLinks = [...flowLinks].sort((a, b) => b.value - a.value);

      modeSpecificData = {
        mode: "p2p",
        fundFlow: flowData ? {
          transferCount: flowData.transferCount,
          incomingCount: flowData.incomingCount,
          outgoingCount: flowData.outgoingCount,
          nodes: (flowData.nodes as unknown[])?.length || 0,
          topTransfers: sortedLinks.slice(0, 10),
          summary: flowData.summary,
        } : null,
        uniqueCounterparties: counterparties.size,
        counterpartyList: Array.from(counterparties).slice(0, 15).map(a => a.slice(0, 10) + "..."),
        repeatedSenders,
        hasSuspiciousPatterns: repeatedSenders.length > 3 || counterparties.size > 50,
        walletAge: {
          firstTransaction: firstTxDate,
          lastTransaction: lastTxDate,
        },
        transactionFrequency: txs?.transactionCount || 0,
        moneyMuleIndicators: {
          highThroughput: (flowData?.incomingCount as number || 0) > 10 && (flowData?.outgoingCount as number || 0) > 10,
          rapidTurnover: counterparties.size > 20,
          lowRetention: balance ? mistToSui(balance.totalBalance) < 1 && (txs?.transactionCount || 0) > 20 : false,
        },
      };
    }

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
    
    // Always fetch accurate protocol interactions
    const checkResult = await toolCheckSuiProtocols(address).catch((e) => { console.error("toolCheckSuiProtocols failed:", e); return null; });
    if (checkResult && checkResult.success) {
      protocolAnalysis = checkResult.data as ProtocolAnalysis;
      protocolScore = protocolAnalysis.protocolScore;
      riskFactors.push(...(protocolAnalysis.riskFactors || []));

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
          mode: normalizedMode,
          modeSpecificData,
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
    // Call getSuiTransactionBlocks directly instead of toolGetSuiTransactions
    // so we get the full raw transaction data (including inner MoveCalls)
    const result = await getSuiTransactionBlocks(address, 50);
    if (!result.data) throw new Error("Failed to fetch transactions");

    const protocolAnalysis = analyzeProtocolInteractions(
      result.data as Parameters<typeof analyzeProtocolInteractions>[0]
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
  | "sui_ecosystem"
  | "general";

export function detectSuiIntent(message: string): SuiIntent {
  const lower = message.toLowerCase();

  // Check for Sui address (0x prefix, typically 64 hex chars)
  const hasSuiAddress = /0x[a-fA-F0-9]{40,64}/.test(message);

  // General ecosystem queries (no address needed)
  const ecosystemKeywords = ["tvl", "top defi", "top protocol", "ecosystem", "overview", "list", "ranking", "compare", "best", "most active", "largest", "biggest"];
  if (ecosystemKeywords.some(kw => lower.includes(kw))) {
    return "sui_ecosystem";
  }

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
