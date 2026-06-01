"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Shield,
  Search,
  Loader2,
  ChevronLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Zap,
  Database,
  Eye,
  GitBranch,
  TrendingUp,
  ArrowRight,
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
}

interface FlowEdge {
  from: string;
  to: string;
  amount: string;
  timestamp: string;
  txHash: string;
  isSuspicious: boolean;
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

function getRiskLevel(level: string): string {
  const colors: Record<string, string> = {
    safe: "#00FF9D",
    low: "#00E5FF",
    medium: "#FFB300",
    high: "#FF6B00",
    critical: "#FF3366",
  };
  return colors[level] || "#525880";
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

// ── Trust Graph Visualization ────────────────────────────

function TrustGraphViz({ graph }: { graph: FlowGraph }) {
  // Calculate node positions using simple force-directed layout
  const width = 800;
  const height = 500;
  const centerX = width / 2;
  const centerY = height / 2;

  const nodePositions = new Map<string, { x: number; y: number }>();

  // Position origin at center
  const originNode = graph.nodes.find((n) => n.isOrigin);
  if (originNode) {
    nodePositions.set(originNode.id, { x: centerX, y: centerY });
  }

  // Position other nodes in concentric circles
  const otherNodes = graph.nodes.filter((n) => !n.isOrigin);
  const radius = Math.min(width, height) * 0.35;

  otherNodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / otherNodes.length;
    nodePositions.set(node.id, {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    });
  });

  return (
    <div className="card-premium p-4 overflow-hidden">
      <svg width="100%" height="500" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
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

          return (
            <g key={i}>
              <line
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                stroke={edge.isSuspicious ? "#FF3366" : "rgba(0,229,255,0.2)"}
                strokeWidth={edge.isSuspicious ? 2 : 1}
                strokeDasharray={edge.isSuspicious ? "5,5" : "none"}
              />
              {/* Amount label */}
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
            </g>
          );
        })}

        {/* Nodes */}
        {graph.nodes.map((node) => {
          const pos = nodePositions.get(node.id);
          if (!pos) return null;

          const isOrigin = node.isOrigin;
          const isFlagged = node.isFlagged;
          const nodeSize = isOrigin ? 20 : 12;
          const color = isFlagged ? "#FF3366" : getRiskColor(node.riskScore);

          return (
            <g key={node.id}>
              {/* Glow ring for origin */}
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

              {/* Node circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={nodeSize}
                fill={isFlagged ? "rgba(255,51,102,0.2)" : "rgba(0,229,255,0.1)"}
                stroke={color}
                strokeWidth={isOrigin ? 3 : 2}
              />

              {/* Inner dot */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={4}
                fill={color}
              />

              {/* Address label */}
              <text
                x={pos.x}
                y={pos.y + nodeSize + 14}
                fill="#8B93C4"
                fontSize="9"
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
              >
                {node.label || `${node.address.slice(0, 6)}...${node.address.slice(-4)}`}
              </text>

              {/* Risk score */}
              <text
                x={pos.x}
                y={pos.y + nodeSize + 26}
                fill={color}
                fontSize="8"
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="bold"
              >
                {node.riskScore}/100
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
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
      <div className="text-xl">{iconMap[pattern.type] || "⚠️"}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs font-semibold" style={{ color: getSeverityColor(pattern.severity) }}>
            {pattern.type.replace(/_/g, " ").toUpperCase()}
          </span>
          <span className="text-[10px] text-[#525880]">
            Confidence: {pattern.confidence}%
          </span>
        </div>
        <p className="text-xs text-[#8B93C4] leading-relaxed">{pattern.description}</p>
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
        body: JSON.stringify({ address: address.trim(), depth: 2, maxNodes: 30 }),
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
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute -top-[15%] -left-[10%] w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] -right-[10%] w-[500px] h-[500px] bg-magenta-500/4 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <div className="border-b border-white/5 glass-bright sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-xl hover:bg-white/5 transition-colors text-[#525880] hover:text-white">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 flex items-center justify-center">
                <img src="/logo.png" alt="SuiShield" className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(0,229,255,0.4)]" />
              </div>
              <div>
                <div className="text-white font-display font-semibold text-sm">SuiShield</div>
                <div className="text-[#525880] text-[11px]">Trust Graph</div>
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
          <div className="badge badge-primary inline-flex">
            <GitBranch className="w-3 h-3" />
            Fund Flow Analysis
          </div>
          <h1 className="font-display font-bold text-3xl text-white tracking-tight">
            Trust Graph
          </h1>
          <p className="text-[#8B93C4] text-sm max-w-md">
            Trace fund flow patterns, detect suspicious clusters, and visualize address relationships.
          </p>
        </div>

        {/* Input */}
        <div className="card-premium p-5">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-display font-semibold text-sm">Trace Fund Flow</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Paste Sui address to trace..."
              className="flex-1 bg-[#0E1120] border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-[#525880] text-sm outline-none focus:border-cyan-500/40 transition-colors font-mono"
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !address.trim()}
              className="btn-primary px-5 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitBranch className="w-4 h-4" />}
              Trace
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-white text-sm">Tracing fund flow...</p>
            <p className="text-[#525880] text-xs">Analyzing transactions via Tatum Sui RPC</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card-premium p-5 border-red-500/20 bg-red-500/5 text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {graph && (
          <div className="space-y-6">
            {/* Risk Summary */}
            <div className="grid grid-cols-4 gap-3">
              <div className="card-premium p-4">
                <div className="text-[#525880] text-xs mb-1">Overall Risk</div>
                <div className="font-display font-bold text-2xl" style={{ color: getRiskColor(graph.riskSummary.overallRisk) }}>
                  {graph.riskSummary.overallRisk}/100
                </div>
              </div>
              <div className="card-premium p-4">
                <div className="text-[#525880] text-xs mb-1">Addresses</div>
                <div className="font-display font-bold text-2xl text-white">
                  {graph.riskSummary.uniqueAddresses}
                </div>
              </div>
              <div className="card-premium p-4">
                <div className="text-[#525880] text-xs mb-1">Flagged</div>
                <div className="font-display font-bold text-2xl text-red-400">
                  {graph.riskSummary.flaggedAddresses}
                </div>
              </div>
              <div className="card-premium p-4">
                <div className="text-[#525880] text-xs mb-1">Volume</div>
                <div className="font-display font-bold text-lg text-cyan-400">
                  {graph.riskSummary.totalVolume}
                </div>
              </div>
            </div>

            {/* Trust Graph Visualization */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span className="text-white font-display font-semibold text-sm">Trust Graph</span>
              </div>
              <TrustGraphViz graph={graph} />
            </div>

            {/* Suspicious Patterns */}
            {graph.suspiciousPatterns.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
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
                  <Activity className="w-4 h-4 text-magenta-400" />
                  <span className="text-white font-display font-semibold text-sm">Behavioral Analysis</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {behavioral.map((pattern, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                      {pattern.detected ? (
                        <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="text-xs font-mono text-[#8B93C4]">{pattern.type.replace(/_/g, " ")}</div>
                        <div className="text-xs text-[#525880] mt-0.5">{pattern.description}</div>
                      </div>
                      {pattern.detected && (
                        <span className="text-[10px] text-orange-400">{pattern.confidence}%</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="card-premium p-4">
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#525880]">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: "#00FF9D" }} /> Safe</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: "#FFB300" }} /> Medium</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: "#FF3366" }} /> High Risk</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border-2 border-cyan-400" /> Origin</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border-2 border-red-400" /> Flagged</span>
                <span className="flex items-center gap-1.5"><span className="w-8 h-0.5 border-t-2 border-dashed border-red-400" /> Suspicious</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
