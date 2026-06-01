// Fund Flow Analyzer — Trace money movement patterns
// This is SuiShield's killer feature: visual fund flow analysis
// Detects mixer patterns, suspicious clusters, and money laundering

import { getSuiTransactionBlocks, getSuiBalances } from "./tatum-sui";

// ── Types ────────────────────────────────────────────────

export interface FlowNode {
  id: string;
  address: string;
  label?: string;
  balance?: string;
  riskScore: number;
  riskLevel: "safe" | "low" | "medium" | "high" | "critical";
  isOrigin: boolean;
  isFlagged: boolean;
  txCount: number;
  firstSeen?: string;
  lastActive?: string;
}

export interface FlowEdge {
  id: string;
  from: string;
  to: string;
  amount: string;
  timestamp: string;
  txHash: string;
  isSuspicious: boolean;
}

export interface FlowGraph {
  origin: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  depth: number;
  totalTransfers: number;
  suspiciousPatterns: SuspiciousPattern[];
  riskSummary: {
    overallRisk: number;
    flaggedAddresses: number;
    totalVolume: string;
    uniqueAddresses: number;
  };
}

export interface SuspiciousPattern {
  type: "mixer" | "funnel" | "scatter" | "circular" | "sybil" | "rapid_drain";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  addresses: string[];
  confidence: number; // 0-100
}

export interface Transfer {
  from: string;
  to: string;
  amount: string;
  timestamp: string;
  txHash: string;
}

// ── Known Addresses Database ─────────────────────────────

const KNOWN_ADDRESSES: Record<string, { label: string; risk: number }> = {
  // DEX addresses
  "0x1eabed72c53feb3805120a081dc15963c204dc8d0981f3c20b65b2": { label: "Cetus Router", risk: 5 },
  "0x0000000000000000000000000000000000000000000000000000000000000002": { label: "Sui System", risk: 0 },
  // Known scam addresses (examples)
  "0xdead000000000000000000000000000000000000000000000000000000000000": { label: "Known Scam", risk: 95 },
};

// ── Fund Flow Tracer ─────────────────────────────────────

export async function traceFundFlow(
  originAddress: string,
  maxDepth = 2,
  maxNodes = 50
): Promise<FlowGraph> {
  const nodes = new Map<string, FlowNode>();
  const edges: FlowEdge[] = [];
  const visited = new Set<string>();
  const suspiciousPatterns: SuspiciousPattern[] = [];

  // Add origin node
  nodes.set(originAddress, {
    id: originAddress,
    address: originAddress,
    isOrigin: true,
    isFlagged: false,
    riskScore: 50,
    riskLevel: "medium",
    txCount: 0,
  });

  // BFS traversal
  const queue: Array<{ address: string; depth: number }> = [
    { address: originAddress, depth: 0 },
  ];

  while (queue.length > 0 && nodes.size < maxNodes) {
    const { address, depth } = queue.shift()!;

    if (visited.has(address) || depth > maxDepth) continue;
    visited.add(address);

    try {
      const txs = await getSuiTransactionBlocks(address, 20);
      const transfers = extractTransfers(txs.data || [], address);

      // Update node
      const node = nodes.get(address);
      if (node) {
        node.txCount = (txs.data || []).length;
      }

      for (const transfer of transfers) {
        const counterpart = transfer.from === address ? transfer.to : transfer.from;

        // Add edge
        edges.push({
          id: `${transfer.txHash}-${counterpart}`,
          from: transfer.from,
          to: transfer.to,
          amount: transfer.amount,
          timestamp: transfer.timestamp,
          txHash: transfer.txHash,
          isSuspicious: false,
        });

        // Add counterpart node if not exists
        if (!nodes.has(counterpart)) {
          const known = KNOWN_ADDRESSES[counterpart];
          nodes.set(counterpart, {
            id: counterpart,
            address: counterpart,
            label: known?.label,
            riskScore: known?.risk || 50,
            riskLevel: riskToLevel(known?.risk || 50),
            isOrigin: false,
            isFlagged: (known?.risk || 0) > 70,
            txCount: 0,
          });

          // Queue for deeper analysis
          if (depth < maxDepth) {
            queue.push({ address: counterpart, depth: depth + 1 });
          }
        }
      }
    } catch (error) {
      console.error(`Failed to trace ${address}:`, error);
    }
  }

  // Detect suspicious patterns
  const patterns = detectSuspiciousPatterns(
    Array.from(nodes.values()),
    edges
  );
  suspiciousPatterns.push(...patterns);

  // Calculate risk summary
  const flaggedCount = Array.from(nodes.values()).filter((n) => n.isFlagged).length;
  const totalVolume = edges.reduce((sum, e) => sum + parseFloat(e.amount || "0"), 0);
  const avgRisk = Array.from(nodes.values()).reduce((sum, n) => sum + n.riskScore, 0) / (nodes.size || 1);

  // Mark suspicious edges
  for (const edge of edges) {
    const fromNode = nodes.get(edge.from);
    const toNode = nodes.get(edge.to);
    if ((fromNode?.riskScore || 0) > 70 || (toNode?.riskScore || 0) > 70) {
      edge.isSuspicious = true;
    }
  }

  return {
    origin: originAddress,
    nodes: Array.from(nodes.values()),
    edges,
    depth: maxDepth,
    totalTransfers: edges.length,
    suspiciousPatterns,
    riskSummary: {
      overallRisk: Math.round(avgRisk),
      flaggedAddresses: flaggedCount,
      totalVolume: formatAmount(totalVolume),
      uniqueAddresses: nodes.size,
    },
  };
}

// ── Extract Transfers from Transactions ──────────────────

function extractTransfers(
  txs: Array<{
    digest?: string;
    timestampMs?: string;
    balanceChanges?: Array<{
      owner?: { AddressOwner?: string };
      amount?: string;
      coinType?: string;
    }>;
  }>,
  ownerAddress: string
): Transfer[] {
  const transfers: Transfer[] = [];

  for (const tx of txs) {
    if (!tx.balanceChanges) continue;

    // Find transfers involving the owner
    const outgoing = tx.balanceChanges.filter(
      (c) => c.owner?.AddressOwner === ownerAddress && parseInt(c.amount || "0") < 0
    );
    const incoming = tx.balanceChanges.filter(
      (c) => c.owner?.AddressOwner === ownerAddress && parseInt(c.amount || "0") > 0
    );

    // Find counterparties
    for (const change of tx.balanceChanges) {
      if (change.owner?.AddressOwner === ownerAddress) continue;
      if (!change.owner?.AddressOwner) continue;

      const amount = Math.abs(parseInt(change.amount || "0"));
      if (amount === 0) continue;

      const isOutgoing = outgoing.length > 0;

      transfers.push({
        from: isOutgoing ? ownerAddress : change.owner.AddressOwner,
        to: isOutgoing ? change.owner.AddressOwner : ownerAddress,
        amount: (amount / 1e9).toFixed(4), // Convert MIST to SUI
        timestamp: tx.timestampMs ? new Date(Number(tx.timestampMs)).toISOString() : "",
        txHash: tx.digest || "",
      });
    }
  }

  return transfers;
}

// ── Suspicious Pattern Detection ─────────────────────────

function detectSuspiciousPatterns(
  nodes: FlowNode[],
  edges: FlowEdge[]
): SuspiciousPattern[] {
  const patterns: SuspiciousPattern[] = [];

  // Pattern 1: Mixer — many inputs → one address → many outputs
  const addressFlow = new Map<string, { incoming: number; outgoing: number }>();
  for (const edge of edges) {
    const toFlow = addressFlow.get(edge.to) || { incoming: 0, outgoing: 0 };
    toFlow.incoming++;
    addressFlow.set(edge.to, toFlow);

    const fromFlow = addressFlow.get(edge.from) || { incoming: 0, outgoing: 0 };
    fromFlow.outgoing++;
    addressFlow.set(edge.from, fromFlow);
  }

  for (const [address, flow] of addressFlow) {
    if (flow.incoming >= 3 && flow.outgoing >= 3) {
      patterns.push({
        type: "mixer",
        severity: "high",
        description: `Address ${address.slice(0, 10)}... has ${flow.incoming} inputs and ${flow.outgoing} outputs — potential mixer/layering pattern`,
        addresses: [address],
        confidence: 70,
      });
    }
  }

  // Pattern 2: Funnel — many addresses → one address
  const recipientCounts = new Map<string, number>();
  for (const edge of edges) {
    recipientCounts.set(edge.to, (recipientCounts.get(edge.to) || 0) + 1);
  }

  for (const [address, count] of recipientCounts) {
    if (count >= 5) {
      patterns.push({
        type: "funnel",
        severity: "medium",
        description: `Address ${address.slice(0, 10)}... received from ${count} different addresses — potential funnel/consolidation`,
        addresses: [address],
        confidence: 60,
      });
    }
  }

  // Pattern 3: Rapid Drain — large outflows in short time
  const outflowsByAddress = new Map<string, { total: number; count: number; timestamps: string[] }>();
  for (const edge of edges) {
    const outflow = outflowsByAddress.get(edge.from) || { total: 0, count: 0, timestamps: [] };
    outflow.total += parseFloat(edge.amount || "0");
    outflow.count++;
    if (edge.timestamp) outflow.timestamps.push(edge.timestamp);
    outflowsByAddress.set(edge.from, outflow);
  }

  for (const [address, outflow] of outflowsByAddress) {
    if (outflow.count >= 3 && outflow.total > 10000) {
      patterns.push({
        type: "rapid_drain",
        severity: "critical",
        description: `Address ${address.slice(0, 10)}... sent ${outflow.total.toFixed(2)} SUI in ${outflow.count} transactions — potential rug pull drain`,
        addresses: [address],
        confidence: 80,
      });
    }
  }

  // Pattern 4: Circular — A → B → C → A
  const adjacency = new Map<string, Set<string>>();
  for (const edge of edges) {
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, new Set());
    adjacency.get(edge.from)!.add(edge.to);
  }

  for (const node of nodes) {
    const neighbors = adjacency.get(node.address);
    if (!neighbors) continue;
    for (const neighbor of neighbors) {
      const neighborNeighbors = adjacency.get(neighbor);
      if (!neighborNeighbors) continue;
      if (neighborNeighbors.has(node.address) && neighbor !== node.address) {
        patterns.push({
          type: "circular",
          severity: "high",
          description: `Circular flow detected: ${node.address.slice(0, 10)}... ↔ ${neighbor.slice(0, 10)}... — potential wash trading`,
          addresses: [node.address, neighbor],
          confidence: 65,
        });
      }
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  return patterns.filter((p) => {
    const key = `${p.type}-${p.addresses.join(",")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── Behavioral Analysis ──────────────────────────────────

export interface BehavioralAnalysis {
  address: string;
  patterns: {
    type: string;
    detected: boolean;
    confidence: number;
    description: string;
  }[];
  riskAdjustment: number;
  summary: string;
}

export async function analyzeBehavior(
  address: string,
  transactions: Array<{
    digest?: string;
    timestampMs?: string;
    balanceChanges?: Array<{
      owner?: { AddressOwner?: string };
      amount?: string;
    }>;
  }>
): Promise<BehavioralAnalysis> {
  const patterns = [];

  // Pattern 1: New wallet with high activity
  const txCount = transactions.length;
  const isNew = txCount < 10;
  const isHighActivity = txCount > 100;

  patterns.push({
    type: "new_wallet_high_activity",
    detected: isNew && isHighActivity,
    confidence: 70,
    description: isNew && isHighActivity
      ? "New wallet with unusually high activity — suspicious"
      : "Normal activity pattern",
  });

  // Pattern 2: Round-trip transactions (A→B→A)
  const counterparties = new Map<string, { sent: boolean; received: boolean }>();
  for (const tx of transactions) {
    if (!tx.balanceChanges) continue;
    for (const change of tx.balanceChanges) {
      const other = change.owner?.AddressOwner;
      if (!other || other === address) continue;
      const amount = parseInt(change.amount || "0");
      const entry = counterparties.get(other) || { sent: false, received: false };
      if (amount < 0) entry.sent = true;
      if (amount > 0) entry.received = true;
      counterparties.set(other, entry);
    }
  }

  const roundTrips = Array.from(counterparties.entries()).filter(
    ([, v]) => v.sent && v.received
  );

  patterns.push({
    type: "round_trip",
    detected: roundTrips.length > 2,
    confidence: 60,
    description: roundTrips.length > 2
      ? `${roundTrips.length} round-trip transactions detected — potential wash trading`
      : `${roundTrips.length} round-trips (normal)`,
  });

  // Pattern 3: Large single transfers
  let maxTransfer = 0;
  for (const tx of transactions) {
    if (!tx.balanceChanges) continue;
    for (const change of tx.balanceChanges) {
      const amount = Math.abs(parseInt(change.amount || "0"));
      if (amount > maxTransfer) maxTransfer = amount;
    }
  }

  const maxSui = maxTransfer / 1e9;
  patterns.push({
    type: "large_transfer",
    detected: maxSui > 100000,
    confidence: 50,
    description: maxSui > 100000
      ? `Largest transfer: ${maxSui.toLocaleString()} SUI — whale activity`
      : `Largest transfer: ${maxSui.toLocaleString()} SUI`,
  });

  // Calculate risk adjustment
  const riskAdjustment = patterns.reduce((sum, p) => {
    return sum + (p.detected ? p.confidence * 0.2 : 0);
  }, 0);

  const detectedCount = patterns.filter((p) => p.detected).length;
  const summary = detectedCount === 0
    ? "No suspicious behavioral patterns detected"
    : `${detectedCount} suspicious pattern(s) detected — review recommended`;

  return {
    address,
    patterns,
    riskAdjustment: Math.round(riskAdjustment),
    summary,
  };
}

// ── Helpers ──────────────────────────────────────────────

function riskToLevel(score: number): FlowNode["riskLevel"] {
  if (score < 25) return "safe";
  if (score < 50) return "low";
  if (score < 75) return "medium";
  if (score < 90) return "high";
  return "critical";
}

function formatAmount(amount: number): string {
  if (amount >= 1e6) return `${(amount / 1e6).toFixed(2)}M SUI`;
  if (amount >= 1e3) return `${(amount / 1e3).toFixed(2)}K SUI`;
  return `${amount.toFixed(2)} SUI`;
}
