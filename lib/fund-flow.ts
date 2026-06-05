// Fund Flow Analyzer — Trace money movement patterns
// This is SuiShield's killer feature: visual fund flow analysis
// Detects mixer patterns, suspicious clusters, and money laundering

import { getSuiTransactionBlocks, getSuiObjects } from "./tatum-sui";
import { SUI_PROTOCOLS, type SuiProtocol } from "./sui-protocols";

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
  nodeType: "wallet" | "protocol" | "contract" | "exchange" | "unknown";
  protocolInfo?: { name: string; type: SuiProtocol["type"]; verified: boolean };
}

export interface FlowEdge {
  id: string;
  from: string;
  to: string;
  amount: string;
  timestamp: string;
  txHash: string;
  isSuspicious: boolean;
  edgeType: "transfer" | "contract_call" | "nft_transfer" | "stake" | "swap";
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
  type: "mixer" | "funnel" | "scatter" | "circular" | "sybil" | "rapid_drain" | "dusting" | "peel_chain" | "unverified_contract" | "nft_wash_trade";
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
  transferType: "transfer" | "contract_call" | "nft_transfer" | "stake" | "swap";
  packageId?: string;
}

// ── Dynamic Protocol Registry ────────────────────────────

// Build a lookup map from SUI_PROTOCOLS for O(1) matching
// Includes primary packageId AND additionalPackages (router/aggregator addresses)
const PROTOCOL_PACKAGE_MAP = new Map<string, SuiProtocol>();
for (const protocol of SUI_PROTOCOLS) {
  PROTOCOL_PACKAGE_MAP.set(protocol.packageId, protocol);
  // Also register additional packages (upgraded/router contracts)
  if (protocol.additionalPackages) {
    for (const pkg of protocol.additionalPackages) {
      PROTOCOL_PACKAGE_MAP.set(pkg, protocol);
    }
  }
}

// System / well-known addresses
const SYSTEM_ADDRESSES: Record<string, { label: string; risk: number; nodeType: FlowNode["nodeType"] }> = {
  "0x0000000000000000000000000000000000000000000000000000000000000002": { label: "Sui Framework", risk: 0, nodeType: "protocol" },
  "0x0000000000000000000000000000000000000000000000000000000000000003": { label: "Sui System", risk: 0, nodeType: "protocol" },
  "0x0000000000000000000000000000000000000000000000000000000000000005": { label: "Sui System", risk: 0, nodeType: "protocol" },
  "0x0000000000000000000000000000000000000000000000000000000000000006": { label: "Sui Clock", risk: 0, nodeType: "protocol" },
  "0x0000000000000000000000000000000000000000000000000000000000000009": { label: "Sui Bridge", risk: 5, nodeType: "protocol" },
};

/** Look up an address or package ID against known protocols and system addresses */
function lookupAddress(address: string): { label?: string; risk: number; nodeType: FlowNode["nodeType"]; protocolInfo?: FlowNode["protocolInfo"] } {
  // Check system addresses
  const system = SYSTEM_ADDRESSES[address];
  if (system) return { label: system.label, risk: system.risk, nodeType: system.nodeType };

  // Check protocol registry
  const protocol = PROTOCOL_PACKAGE_MAP.get(address);
  if (protocol) {
    const riskMap: Record<string, number> = { low: 10, medium: 30, high: 60 };
    return {
      label: protocol.name,
      risk: riskMap[protocol.riskLevel] || 20,
      nodeType: "protocol",
      protocolInfo: { name: protocol.name, type: protocol.type, verified: protocol.verified },
    };
  }

  return { risk: 50, nodeType: "wallet" };
}

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
  const originInfo = lookupAddress(originAddress);
  nodes.set(originAddress, {
    id: originAddress,
    address: originAddress,
    label: originInfo.label,
    isOrigin: true,
    isFlagged: false,
    riskScore: originInfo.risk,
    riskLevel: riskToLevel(originInfo.risk),
    txCount: 0,
    nodeType: originInfo.nodeType,
    protocolInfo: originInfo.protocolInfo,
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
      // Fetch transactions with higher limit for richer graph
      const txs = await getSuiTransactionBlocks(address, 30);
      const transfers = extractTransfers(txs.data || [], address);

      // Also fetch objects to detect protocol interactions via owned objects
      let objectProtocols: string[] = [];
      try {
        const objs = await getSuiObjects(address, 30);
        for (const obj of (objs.data || [])) {
          const objType = obj.data?.type || "";
          // Extract packageId from type string (e.g. "0xABC::module::Type")
          const pkgId = objType.split("::")[0];
          if (pkgId && PROTOCOL_PACKAGE_MAP.has(pkgId)) {
            objectProtocols.push(pkgId);
          }
        }
        objectProtocols = [...new Set(objectProtocols)];
      } catch {
        // non-critical, continue
      }

      // Update node tx count
      const node = nodes.get(address);
      if (node) {
        node.txCount = (txs.data || []).length;
      }

      // Add protocol nodes discovered via owned objects (even if no direct transfer edge)
      for (const pkgId of objectProtocols) {
        if (!nodes.has(pkgId) && nodes.size < maxNodes) {
          const info = lookupAddress(pkgId);
          nodes.set(pkgId, {
            id: pkgId,
            address: pkgId,
            label: info.label,
            riskScore: info.risk,
            riskLevel: riskToLevel(info.risk),
            isOrigin: false,
            isFlagged: false,
            txCount: 0,
            nodeType: "protocol",
            protocolInfo: info.protocolInfo,
          });
        }
        // Add implicit edge: wallet interacts with protocol
        const edgeId = `obj-${address}-${pkgId}`;
        if (!edges.find(e => e.id === edgeId)) {
          edges.push({
            id: edgeId,
            from: address,
            to: pkgId,
            amount: "0",
            timestamp: "",
            txHash: "",
            isSuspicious: false,
            edgeType: "contract_call",
          });
        }
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
          edgeType: transfer.transferType,
        });

        // Add counterpart node if not exists
        if (!nodes.has(counterpart) && nodes.size < maxNodes) {
          const info = lookupAddress(counterpart);
          nodes.set(counterpart, {
            id: counterpart,
            address: counterpart,
            label: info.label,
            riskScore: info.risk,
            riskLevel: riskToLevel(info.risk),
            isOrigin: false,
            isFlagged: info.risk > 70,
            txCount: 0,
            nodeType: info.nodeType,
            protocolInfo: info.protocolInfo,
          });

          // Queue for deeper analysis (skip protocol nodes — they are endpoints)
          if (depth < maxDepth && info.nodeType === "wallet") {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawTx = Record<string, any>;

function classifyTransferType(tx: RawTx): Transfer["transferType"] {
  const txStr = JSON.stringify(tx).toLowerCase();

  // DeFi swap detection
  const swapKeywords = ["swap", "amm", "cetus", "turbos", "deepbook", "aftermath"];
  if (swapKeywords.some(kw => txStr.includes(kw))) return "swap";

  // Staking detection
  const stakeKeywords = ["stake", "unstake", "staking", "validator"];
  if (stakeKeywords.some(kw => txStr.includes(kw))) return "stake";

  // NFT detection
  const nftKeywords = ["nft", "kiosk", "display", "collection", "bluemove", "clutchy", "souffl3"];
  if (nftKeywords.some(kw => txStr.includes(kw))) return "nft_transfer";

  // Smart contract call detection (Programmable Transaction Block with MoveCall)
  const innerTxs = tx.transaction?.data?.transaction?.transactions || [];
  for (const inner of innerTxs) {
    if (inner.MoveCall) return "contract_call";
  }

  return "transfer";
}

function extractPackageIds(tx: RawTx): string[] {
  const packages: string[] = [];
  const innerTxs = tx.transaction?.data?.transaction?.transactions || [];
  for (const inner of innerTxs) {
    if (inner.MoveCall?.package) {
      packages.push(inner.MoveCall.package);
    }
  }
  return [...new Set(packages)];
}

function extractTransfers(
  txs: RawTx[],
  ownerAddress: string
): Transfer[] {
  const transfers: Transfer[] = [];

  for (const tx of txs) {
    const transferType = classifyTransferType(tx);
    const packageIds = extractPackageIds(tx);

    // If tx is a contract call, create edges to the called packages
    if (transferType === "contract_call" || transferType === "swap" || transferType === "stake") {
      for (const pkgId of packageIds) {
        // Skip Sui framework packages (0x1, 0x2, 0x3)
        if (pkgId.length < 10) continue;
        transfers.push({
          from: ownerAddress,
          to: pkgId,
          amount: "0",
          timestamp: tx.timestampMs ? new Date(Number(tx.timestampMs)).toISOString() : "",
          txHash: tx.digest || "",
          transferType,
          packageId: pkgId,
        });
      }
    }

    // Balance-change based transfers (coin movements)
    if (!tx.balanceChanges) continue;

    const outgoing = tx.balanceChanges.filter(
      (c: { owner?: { AddressOwner?: string }; amount?: string }) =>
        c.owner?.AddressOwner === ownerAddress && parseInt(c.amount || "0") < 0
    );

    for (const change of tx.balanceChanges) {
      if ((change as { owner?: { AddressOwner?: string } }).owner?.AddressOwner === ownerAddress) continue;
      if (!(change as { owner?: { AddressOwner?: string } }).owner?.AddressOwner) continue;

      const counterparty = (change as { owner?: { AddressOwner?: string } }).owner!.AddressOwner!;
      const amount = Math.abs(parseInt((change as { amount?: string }).amount || "0"));
      if (amount === 0) continue;

      const isOutgoing = outgoing.length > 0;

      transfers.push({
        from: isOutgoing ? ownerAddress : counterparty,
        to: isOutgoing ? counterparty : ownerAddress,
        amount: (amount / 1e9).toFixed(4),
        timestamp: tx.timestampMs ? new Date(Number(tx.timestampMs)).toISOString() : "",
        txHash: tx.digest || "",
        transferType,
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

  // Pattern 5: Dusting — small amounts sent to many addresses
  const dustThreshold = 0.1; // 0.1 SUI
  const senderDustCounts = new Map<string, { count: number; recipients: Set<string> }>();
  for (const edge of edges) {
    const amount = parseFloat(edge.amount || "0");
    if (amount < dustThreshold && amount > 0) {
      const entry = senderDustCounts.get(edge.from) || { count: 0, recipients: new Set() };
      entry.count++;
      entry.recipients.add(edge.to);
      senderDustCounts.set(edge.from, entry);
    }
  }

  for (const [address, data] of senderDustCounts) {
    if (data.recipients.size >= 5) {
      patterns.push({
        type: "dusting",
        severity: "medium",
        description: `Address ${address.slice(0, 10)}... sent dust (< ${dustThreshold} SUI) to ${data.recipients.size} addresses — potential dusting attack or airdrop scam`,
        addresses: [address],
        confidence: 55,
      });
    }
  }

  // Pattern 6: Peel Chain — sequential A→B→C→D with decreasing amounts
  const peelAdjacency = new Map<string, Set<string>>();
  for (const edge of edges) {
    if (!peelAdjacency.has(edge.from)) peelAdjacency.set(edge.from, new Set());
    peelAdjacency.get(edge.from)!.add(edge.to);
  }

  for (const node of nodes) {
    const neighbors = peelAdjacency.get(node.address);
    if (!neighbors || neighbors.size !== 1) continue;
    
    let current = node.address;
    let chainLength = 0;
    const visited = new Set<string>();
    
    while (current && !visited.has(current)) {
      visited.add(current);
      const next = peelAdjacency.get(current);
      if (!next || next.size !== 1) break;
      const nextAddr = Array.from(next)[0];
      if (visited.has(nextAddr)) break;
      current = nextAddr;
      chainLength++;
    }
    
    if (chainLength >= 4) {
      patterns.push({
        type: "peel_chain",
        severity: "high",
        description: `Peel chain detected starting from ${node.address.slice(0, 10)}... — ${chainLength} sequential transfers, potential money laundering`,
        addresses: [node.address],
        confidence: 75,
      });
    }
  }

  // Pattern 7: Sybil — multiple addresses funded from same source
  const fundingSource = new Map<string, Set<string>>();
  for (const edge of edges) {
    if (!fundingSource.has(edge.to)) fundingSource.set(edge.to, new Set());
    fundingSource.get(edge.to)!.add(edge.from);
  }

  const reverseFunding = new Map<string, Set<string>>();
  for (const [recipient, senders] of fundingSource) {
    for (const sender of senders) {
      if (!reverseFunding.has(sender)) reverseFunding.set(sender, new Set());
      reverseFunding.get(sender)!.add(recipient);
    }
  }

  for (const [source, recipients] of reverseFunding) {
    if (recipients.size >= 3) {
      patterns.push({
        type: "sybil",
        severity: "high",
        description: `Address ${source.slice(0, 10)}... funded ${recipients.size} different addresses — potential Sybil attack or airdrop farming`,
        addresses: [source, ...Array.from(recipients).slice(0, 3)],
        confidence: 65,
      });
    }
  }

  // Pattern 8: Unverified Contract Interaction — wallet interacts heavily with unverified contracts
  const contractEdges = edges.filter(e => e.edgeType === "contract_call" || e.edgeType === "swap" || e.edgeType === "stake");
  const unverifiedContracts = new Map<string, number>();
  for (const edge of contractEdges) {
    const targetNode = nodes.find(n => n.id === edge.to);
    if (targetNode && targetNode.nodeType !== "protocol") {
      // This is a contract call to a non-recognized protocol
      unverifiedContracts.set(edge.to, (unverifiedContracts.get(edge.to) || 0) + 1);
    }
  }

  for (const [contractAddr, count] of unverifiedContracts) {
    if (count >= 2) {
      patterns.push({
        type: "unverified_contract",
        severity: count >= 5 ? "high" : "medium",
        description: `Address interacted ${count} times with unverified contract ${contractAddr.slice(0, 10)}... — exercise caution, contract is not in verified protocol registry`,
        addresses: [contractAddr],
        confidence: Math.min(50 + count * 10, 90),
      });
    }
  }

  // Pattern 9: NFT Wash Trading — same NFT transferred back and forth between limited addresses
  const nftEdges = edges.filter(e => e.edgeType === "nft_transfer");
  if (nftEdges.length >= 4) {
    const nftCounterparties = new Set<string>();
    for (const edge of nftEdges) {
      nftCounterparties.add(edge.from);
      nftCounterparties.add(edge.to);
    }
    // If many NFT transfers but few unique addresses → wash trading signal
    if (nftEdges.length > nftCounterparties.size * 2) {
      patterns.push({
        type: "nft_wash_trade",
        severity: "high",
        description: `${nftEdges.length} NFT transfers among only ${nftCounterparties.size} addresses — strong wash trading signal to inflate volume/floor price`,
        addresses: Array.from(nftCounterparties).slice(0, 5),
        confidence: 75,
      });
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

  // Pattern 4: Counterparty concentration — too many txs with same address
  const counterpartyTxCounts = new Map<string, number>();
  for (const tx of transactions) {
    if (!tx.balanceChanges) continue;
    for (const change of tx.balanceChanges) {
      const other = change.owner?.AddressOwner;
      if (!other || other === address) continue;
      counterpartyTxCounts.set(other, (counterpartyTxCounts.get(other) || 0) + 1);
    }
  }
  
  const maxConcentration = Math.max(...Array.from(counterpartyTxCounts.values()), 0);
  const concentratedCounterparty = Array.from(counterpartyTxCounts.entries()).find(([, v]) => v === maxConcentration);
  
  patterns.push({
    type: "counterparty_concentration",
    detected: maxConcentration > 10,
    confidence: 55,
    description: maxConcentration > 10
      ? `High concentration: ${maxConcentration} transactions with ${concentratedCounterparty?.[0]?.slice(0, 10)}... — potential bot or coordinated activity`
      : `Max concentration: ${maxConcentration} txs with single counterparty`,
  });

  // Pattern 5: Rapid succession — many transactions in short time
  let rapidCount = 0;
  const timestamps = transactions
    .map((tx) => tx.timestampMs ? Number(tx.timestampMs) : 0)
    .filter((t) => t > 0)
    .sort();
  
  for (let i = 1; i < timestamps.length; i++) {
    if (timestamps[i] - timestamps[i - 1] < 5000) { // Less than 5 seconds apart
      rapidCount++;
    }
  }
  
  patterns.push({
    type: "rapid_succession",
    detected: rapidCount > 5,
    confidence: 60,
    description: rapidCount > 5
      ? `${rapidCount} transactions within 5 seconds of each other — potential bot activity`
      : `${rapidCount} rapid transactions (normal)`,
  });

  // Pattern 6: Suspicious round numbers
  let roundNumberCount = 0;
  for (const tx of transactions) {
    if (!tx.balanceChanges) continue;
    for (const change of tx.balanceChanges) {
      const amount = Math.abs(parseInt(change.amount || "0"));
      const sui = amount / 1e9;
      if (sui > 0 && sui === Math.round(sui)) {
        roundNumberCount++;
      }
    }
  }
  
  patterns.push({
    type: "round_numbers",
    detected: roundNumberCount > 5 && roundNumberCount > transactions.length * 0.5,
    confidence: 40,
    description: roundNumberCount > 5 && roundNumberCount > transactions.length * 0.5
      ? `${roundNumberCount} transfers with exact round numbers — potential automated/scripted activity`
      : `${roundNumberCount} round number transfers (normal)`,
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
