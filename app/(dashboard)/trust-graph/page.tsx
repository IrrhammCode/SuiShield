"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Loader2,
  ChevronLeft,
  AlertTriangle,
  CheckCircle,
  Activity,
  Eye,
  GitBranch,
} from "lucide-react";
import { DualWalletButton } from "@/components/WalletConnect";

// ── Types ────────────────────────────────────────────────

interface FlowNode {
  id: string;
  address: string;
  label?: string;
  riskScore: number;
  riskLevel: string;
  isOrigin: boolean;
  isFlagged: boolean;
  txCount: number;
  nodeType: "wallet" | "protocol" | "contract" | "exchange" | "unknown";
  protocolInfo?: { name: string; type: string; verified: boolean };
}

interface FlowEdge {
  from: string;
  to: string;
  amount: string;
  timestamp: string;
  txHash: string;
  isSuspicious: boolean;
  edgeType: "transfer" | "contract_call" | "nft_transfer" | "stake" | "swap";
}

interface SuspiciousPattern {
  type: string;
  severity: string;
  description: string;
  addresses: string[];
  confidence: number;
}

interface FlowGraph {
  origin: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  suspiciousPatterns: SuspiciousPattern[];
  riskSummary: {
    overallRisk: number;
    flaggedAddresses: number;
    totalVolume: string;
    uniqueAddresses: number;
  };
}

interface BehavioralPattern {
  type: string;
  detected: boolean;
  confidence: number;
  description: string;
}

// ── Risk Color Helpers ───────────────────────────────────

function getRiskColor(score: number): string {
  if (score < 25) return "#00FF9D";
  if (score < 50) return "#FFB300";
  if (score < 75) return "#FF6B00";
  return "#FF3366";
}

function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    low: "#00E5FF",
    medium: "#FFB300",
    high: "#FF6B00",
    critical: "#FF3366",
  };
  return colors[severity] || "#525880";
}

function getEdgeStyle(edgeType: string, isSuspicious: boolean): { stroke: string; strokeWidth: number; dashArray: string } {
  if (isSuspicious) return { stroke: "#FF3366", strokeWidth: 2.5, dashArray: "5,5" };
  const styles: Record<string, { stroke: string; strokeWidth: number; dashArray: string }> = {
    transfer:      { stroke: "rgba(0,229,255,0.25)", strokeWidth: 1.5, dashArray: "none" },
    contract_call: { stroke: "rgba(168,85,247,0.4)",  strokeWidth: 1.5, dashArray: "4,3" },
    swap:          { stroke: "rgba(0,255,157,0.4)",   strokeWidth: 2,   dashArray: "none" },
    stake:         { stroke: "rgba(255,179,0,0.35)",   strokeWidth: 1.5, dashArray: "6,3" },
    nft_transfer:  { stroke: "rgba(255,107,0,0.4)",   strokeWidth: 1.5, dashArray: "3,3" },
  };
  return styles[edgeType] || styles.transfer;
}

function getNodeColor(node: FlowNode): string {
  if (node.isFlagged) return "#FF3366";
  if (node.nodeType === "protocol") {
    if (node.protocolInfo?.verified) return "#00E5FF";
    return "#A855F7";
  }
  return getRiskColor(node.riskScore);
}

function getNodeShape(nodeType: string): "circle" | "diamond" | "square" {
  if (nodeType === "protocol") return "diamond";
  if (nodeType === "contract") return "square";
  return "circle";
}

// ── Trust Graph Visualization ────────────────────────────

function TrustGraphViz({ graph }: { graph: FlowGraph }) {
  const width = 800;
  const height = 500;
  const centerX = width / 2;
  const centerY = height / 2;

  const nodePositions = new Map<string, { x: number; y: number }>();

  const originNode = graph.nodes.find((n) => n.isOrigin);
  if (originNode) {
    nodePositions.set(originNode.id, { x: centerX, y: centerY });
  }

  // Separate protocol nodes from wallet nodes for layout
  const protocolNodes = graph.nodes.filter((n) => !n.isOrigin && n.nodeType === "protocol");
  const walletNodes = graph.nodes.filter((n) => !n.isOrigin && n.nodeType !== "protocol");

  // Place protocol nodes in an inner ring
  const protocolRadius = Math.min(width, height) * 0.22;
  protocolNodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / (protocolNodes.length || 1) - Math.PI / 2;
    nodePositions.set(node.id, {
      x: centerX + protocolRadius * Math.cos(angle),
      y: centerY + protocolRadius * Math.sin(angle),
    });
  });

  // Place wallet nodes in an outer ring
  const walletRadius = Math.min(width, height) * 0.38;
  walletNodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / (walletNodes.length || 1);
    nodePositions.set(node.id, {
      x: centerX + walletRadius * Math.cos(angle),
      y: centerY + walletRadius * Math.sin(angle),
    });
  });

  return (
    <div className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-cyan-500/[0.02] p-4 backdrop-blur-xl overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
      <svg width="100%" height="500" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="protocolGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {graph.edges.map((edge, i) => {
          const fromPos = nodePositions.get(edge.from);
          const toPos = nodePositions.get(edge.to);
          if (!fromPos || !toPos) return null;

          const style = getEdgeStyle(edge.edgeType, edge.isSuspicious);

          return (
            <g key={i}>
              <line
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                strokeDasharray={style.dashArray}
              />
              {/* Only show amount label for coin transfers */}
              {edge.edgeType === "transfer" && parseFloat(edge.amount) > 0 && (
                <text
                  x={(fromPos.x + toPos.x) / 2}
                  y={(fromPos.y + toPos.y) / 2 - 8}
                  fill={edge.isSuspicious ? "#FF3366" : "#525880"}
                  fontSize="9"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {edge.amount} SUI
                </text>
              )}
              {/* Show edge type label for non-transfer edges */}
              {edge.edgeType !== "transfer" && (
                <text
                  x={(fromPos.x + toPos.x) / 2}
                  y={(fromPos.y + toPos.y) / 2 - 8}
                  fill={style.stroke}
                  fontSize="8"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                  opacity={0.7}
                >
                  {edge.edgeType.replace("_", " ")}
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {graph.nodes.map((node) => {
          const pos = nodePositions.get(node.id);
          if (!pos) return null;

          const isOrigin = node.isOrigin;
          const isProtocol = node.nodeType === "protocol";
          const color = getNodeColor(node);
          const shape = getNodeShape(node.nodeType);

          const nodeSize = isOrigin ? 20 : isProtocol ? 16 : 12;

          return (
            <g key={node.id}>
              {/* Origin glow ring */}
              {isOrigin && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={28}
                  fill="none"
                  stroke="rgba(0,229,255,0.3)"
                  strokeWidth="2"
                  filter="url(#glow)"
                />
              )}

              {/* Protocol glow */}
              {isProtocol && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeSize + 6}
                  fill="none"
                  stroke={node.protocolInfo?.verified ? "rgba(0,229,255,0.15)" : "rgba(168,85,247,0.15)"}
                  strokeWidth="1"
                  filter="url(#protocolGlow)"
                />
              )}

              {/* Node shape */}
              {shape === "diamond" ? (
                <rect
                  x={pos.x - nodeSize * 0.7}
                  y={pos.y - nodeSize * 0.7}
                  width={nodeSize * 1.4}
                  height={nodeSize * 1.4}
                  transform={`rotate(45 ${pos.x} ${pos.y})`}
                  fill={isProtocol ? "rgba(0,229,255,0.08)" : "rgba(0,229,255,0.1)"}
                  stroke={color}
                  strokeWidth={2}
                  rx={2}
                />
              ) : (
                <>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={nodeSize}
                    fill={node.isFlagged ? "rgba(255,51,102,0.2)" : "rgba(0,229,255,0.1)"}
                    stroke={color}
                    strokeWidth={isOrigin ? 3 : 2}
                  />
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={4}
                    fill={color}
                  />
                </>
              )}

              {/* Center dot for diamond */}
              {shape === "diamond" && (
                <circle cx={pos.x} cy={pos.y} r={3} fill={color} />
              )}

              {/* Label */}
              <text
                x={pos.x}
                y={pos.y + nodeSize + 14}
                fill={isProtocol ? "#00E5FF" : "#8B93C4"}
                fontSize={isProtocol ? "10" : "9"}
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontWeight={isProtocol ? "bold" : "normal"}
              >
                {node.label || `${node.address.slice(0, 6)}...${node.address.slice(-4)}`}
              </text>

              {/* Sub-label: protocol type or risk score */}
              <text
                x={pos.x}
                y={pos.y + nodeSize + 26}
                fill={isProtocol ? "rgba(0,229,255,0.5)" : color}
                fontSize="8"
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="bold"
              >
                {isProtocol
                  ? (node.protocolInfo?.verified ? "✓ Verified" : "Unverified")
                  : `${node.riskScore}/100`
                }
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Pattern Card ─────────────────────────────────────────

function PatternCard({ pattern }: { pattern: SuspiciousPattern }) {
  const iconMap: Record<string, string> = {
    mixer: "🔄",
    funnel: "🔻",
    scatter: "💫",
    circular: "🔁",
    sybil: "👥",
    rapid_drain: "💸",
    dusting: "🧹",
    peel_chain: "🔗",
    unverified_contract: "🚨",
    nft_wash_trade: "🎭",
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-white/[0.01] hover:border-white/[0.1] transition-all">
      <div className="text-xl">{iconMap[pattern.type] || "⚠️"}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs font-semibold" style={{ color: getSeverityColor(pattern.severity) }}>
            {pattern.type.replace(/_/g, " ").toUpperCase()}
          </span>
          <span className="text-[10px] text-white/20">
            Confidence: {pattern.confidence}%
          </span>
        </div>
        <p className="text-xs text-white/40 leading-relaxed">{pattern.description}</p>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────

export default function TrustGraphPage() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [graph, setGraph] = useState<FlowGraph | null>(null);
  const [behavioral, setBehavioral] = useState<BehavioralPattern[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!address.trim()) return;
    setLoading(true);
    setError(null);
    setGraph(null);
    setBehavioral(null);

    try {
      const res = await fetch("/api/fund-flow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: address.trim(), depth: 2, maxNodes: 50 }),
      });

      if (!res.ok) throw new Error(`Analysis failed: ${res.status}`);

      const data = await res.json();
      setGraph(data.flowGraph);
      setBehavioral(data.behavioral?.patterns || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [address]);

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute -top-[15%] -left-[10%] w-[600px] h-[600px] bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[500px] h-[500px] bg-gradient-to-bl from-white/[0.04] via-magenta-500/5 to-transparent rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[30%] w-[400px] h-[400px] bg-gradient-to-t from-white/[0.04] via-transparent to-transparent rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="border-b border-white/[0.06] bg-black/40 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-xl hover:bg-white/5 transition-colors text-white/30 hover:text-white">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 flex items-center justify-center">
                <img src="/logo.png" alt="SuiShield" className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(0,229,255,0.4)]" />
              </div>
              <div>
                <div className="text-white font-display font-semibold text-sm">SuiShield</div>
                <div className="text-white/20 text-[11px]">Trust Graph</div>
              </div>
            </div>
          </div>
          <DualWalletButton />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-5 py-8 space-y-6">
        {/* Page Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-white/[0.04] to-white/[0.04] border border-white/[0.06] text-xs">
            <GitBranch className="w-3 h-3 text-white/50" />
            <span className="text-white/50 font-bold uppercase tracking-widest">Fund Flow Analysis</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-white tracking-tight">
            Trust <span className="text-white/50">Graph</span>
          </h1>
          <p className="text-white/30 text-sm max-w-md">
            Trace fund flow patterns, detect suspicious clusters, and visualize address relationships.
          </p>
        </div>

        {/* Input */}
        <div className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-magenta-500/[0.02] p-5 backdrop-blur-xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-white/50" />
            <span className="text-white font-display font-semibold text-sm">Trace Fund Flow</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Paste Sui address to trace..."
              className="flex-1 bg-black/40 border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none focus:border-magenta-500/40 transition-colors font-mono"
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !address.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-magenta-400 to-magenta-500 text-white font-bold hover:from-magenta-300 hover:to-magenta-400 transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitBranch className="w-4 h-4" />}
              Trace
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-magenta-500/20 to-white/[0.04] border border-white/[0.08] flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
            </div>
            <p className="text-white text-sm">Tracing fund flow...</p>
            <p className="text-white/20 text-xs">Analyzing transactions via Tatum Sui RPC</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-5 text-center backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
            <p className="text-white/50 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {graph && (
          <div className="space-y-6">
            {/* Risk Summary */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Overall Risk", value: `${graph.riskSummary.overallRisk}/100`, color: getRiskColor(graph.riskSummary.overallRisk), gradient: "from-white/[0.04] to-white/[0.02]" },
                { label: "Addresses", value: graph.riskSummary.uniqueAddresses.toString(), color: "#FFFFFF", gradient: "from-white/[0.04] to-white/[0.02]" },
                { label: "Flagged", value: graph.riskSummary.flaggedAddresses.toString(), color: "#FF3366", gradient: "from-white/[0.04] to-white/[0.02]" },
                { label: "Volume", value: graph.riskSummary.totalVolume, color: "#00E5FF", gradient: "from-white/[0.04] to-white/[0.02]" },
              ].map(({ label, value, color, gradient }) => (
                <div key={label} className={`relative rounded-2xl border border-white/[0.06] bg-gradient-to-br ${gradient} p-4 backdrop-blur-xl overflow-hidden`}>
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                  <div className="text-white/30 text-xs mb-1">{label}</div>
                  <div className="font-display font-bold text-2xl" style={{ color }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Graph Visualization */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-white/50" />
                <span className="text-white font-display font-semibold text-sm">Trust Graph</span>
              </div>
              <TrustGraphViz graph={graph} />
            </div>

            {/* Suspicious Patterns */}
            {graph.suspiciousPatterns.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-white/50" />
                  <span className="text-white font-display font-semibold text-sm">
                    Suspicious Patterns ({graph.suspiciousPatterns.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {graph.suspiciousPatterns.map((pattern, i) => (
                    <PatternCard key={i} pattern={pattern} />
                  ))}
                </div>
              </div>
            )}

            {/* Behavioral Patterns */}
            {behavioral && behavioral.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-white/50" />
                  <span className="text-white font-display font-semibold text-sm">Behavioral Analysis</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {behavioral.map((pattern, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-white/[0.01] hover:border-white/[0.1] transition-all">
                      {pattern.detected ? (
                        <AlertTriangle className="w-4 h-4 text-white/50 flex-shrink-0" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-white/80 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="text-xs font-mono text-white/40">{pattern.type.replace(/_/g, " ")}</div>
                        <div className="text-xs text-white/20 mt-0.5">{pattern.description}</div>
                      </div>
                      {pattern.detected && (
                        <span className="text-[10px] text-white/50">{pattern.confidence}%</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-4 backdrop-xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
              <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-3">Legend</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {/* Node Types */}
                <div className="text-white/30 text-[10px] font-bold uppercase tracking-wider col-span-2 mt-1 mb-0.5">Nodes</div>
                <span className="flex items-center gap-1.5 text-xs text-white/30"><span className="w-3 h-3 rounded-full" style={{ background: "#00FF9D" }} /> Safe Wallet</span>
                <span className="flex items-center gap-1.5 text-xs text-white/30"><span className="w-3 h-3 rounded-full" style={{ background: "#FFB300" }} /> Medium Risk</span>
                <span className="flex items-center gap-1.5 text-xs text-white/30"><span className="w-3 h-3 rounded-full" style={{ background: "#FF3366" }} /> High Risk</span>
                <span className="flex items-center gap-1.5 text-xs text-white/30"><span className="w-3 h-3 rounded-full border-2 border-cyan-400" /> Origin</span>
                <span className="flex items-center gap-1.5 text-xs text-white/30"><span className="w-3 h-3 rotate-45 rounded-sm" style={{ background: "rgba(0,229,255,0.3)", border: "1.5px solid #00E5FF" }} /> Verified Protocol</span>
                <span className="flex items-center gap-1.5 text-xs text-white/30"><span className="w-3 h-3 rotate-45 rounded-sm" style={{ background: "rgba(168,85,247,0.3)", border: "1.5px solid #A855F7" }} /> Unverified Contract</span>

                {/* Edge Types */}
                <div className="text-white/30 text-[10px] font-bold uppercase tracking-wider col-span-2 mt-2 mb-0.5">Connections</div>
                <span className="flex items-center gap-1.5 text-xs text-white/30"><span className="w-6 h-0.5" style={{ background: "rgba(0,229,255,0.4)" }} /> Transfer</span>
                <span className="flex items-center gap-1.5 text-xs text-white/30"><span className="w-6 h-0.5 border-t-2 border-dashed" style={{ borderColor: "rgba(168,85,247,0.6)" }} /> Contract Call</span>
                <span className="flex items-center gap-1.5 text-xs text-white/30"><span className="w-6 h-0.5" style={{ background: "rgba(0,255,157,0.5)" }} /> Swap</span>
                <span className="flex items-center gap-1.5 text-xs text-white/30"><span className="w-6 h-0.5 border-t-2 border-dashed" style={{ borderColor: "rgba(255,179,0,0.5)" }} /> Stake</span>
                <span className="flex items-center gap-1.5 text-xs text-white/30"><span className="w-6 h-0.5 border-t-2 border-dashed" style={{ borderColor: "rgba(255,107,0,0.5)" }} /> NFT Transfer</span>
                <span className="flex items-center gap-1.5 text-xs text-white/30"><span className="w-6 h-0.5 border-t-2 border-dashed border-magenta-400" /> Suspicious</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
