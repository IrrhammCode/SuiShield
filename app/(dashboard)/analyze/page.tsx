"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Brain,
  Shield,
  Loader2,
  Zap,
  Database,
  Activity,
  Search,
  ChevronLeft,
} from "lucide-react";
import type { AgentStep } from "@/types";
import { TrustScoreCard } from "@/components/SuiShield/TrustScoreCard";
import { AnalysisSection } from "@/components/SuiShield/AnalysisSection";
import { RiskSignal } from "@/components/SuiShield/RiskSignal";
import { OnChainProof } from "@/components/SuiShield/OnChainProof";
import { ShareButton } from "@/components/SuiShield/ShareButton";
import { AddressInput } from "@/components/SuiShield/AddressInput";
import { ScanHistory, saveScan } from "@/components/SuiShield/ScanHistory";
import { DualWalletButton } from "@/components/WalletConnect";

type AnalysisMode = "defi" | "nft" | "p2p" | "general";

const modeLabels: Record<AnalysisMode, { label: string; icon: string; prompt: string; color: string; gradient: string; glow: string }> = {
  defi: {
    label: "DeFi",
    icon: "📊",
    prompt: "Perform a DeFi-focused trust analysis on this address. Check TVL trend, yield sustainability, concentration risk, protocol health, exit liquidity, and peer comparison with alternatives. Is it safe to deposit?",
    color: "cyan",
    gradient: "from-white/[0.06] to-white/[0.02]",
    glow: "shadow-[0_0_20px_rgba(255,255,255,0.06)]",
  },
  nft: {
    label: "NFT",
    icon: "🎨",
    prompt: "Perform an NFT-focused trust analysis on this address. Check creator track record, collection health, wash trading detection, floor price manipulation, copycat detection, and metadata integrity. Is it safe to buy?",
    color: "magenta",
    gradient: "from-white/[0.06] to-white/[0.02]",
    glow: "shadow-[0_0_20px_rgba(255,0,122,0.15)]",
  },
  p2p: {
    label: "P2P",
    icon: "🤝",
    prompt: "Perform a P2P counterparty risk analysis on this address. Check wallet age, money flow pattern, scam database cross-reference, money mule detection, and network risk. Is it safe to transact?",
    color: "orange",
    gradient: "from-white/[0.06] to-white/[0.02]",
    glow: "shadow-[0_0_20px_rgba(255,179,0,0.15)]",
  },
  general: {
    label: "General",
    icon: "🔍",
    prompt: "Perform a comprehensive trust analysis on this Sui address. Analyze balance, transactions, patterns, risk signals, and provide a trust score with clear verdict.",
    color: "blue",
    gradient: "from-white/[0.06] to-white/[0.02]",
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.15)]",
  },
};

interface AnalysisResult {
  content: string;
  trustScore: number;
  trustLevel: "safe" | "low" | "medium" | "high" | "critical";
  address: string;
  signals: Array<{ type: "positive" | "warning" | "negative"; text: string; detail?: string }>;
  sources: Array<{ type: string; label: string }>;
  agentSteps: AgentStep[];
  onChainProof?: { blobId: string; storedAt: string; verificationUrl: string };
  executionTime: number;
}

interface AnalysisResponse {
  riskScore?: number;
  content?: string;
  walletInfo?: {
    riskScore?: number;
    totalTransactions?: number;
    balance?: string;
    isMalicious?: boolean;
  };
  sources?: AnalysisResult["sources"];
  agentSteps?: AgentStep[];
  onChainProof?: AnalysisResult["onChainProof"];
  executionTime?: number;
}

function parseAnalysisResponse(data: AnalysisResponse, address: string): AnalysisResult {
  const score = data.riskScore || data.walletInfo?.riskScore || 50;
  const level = score < 25 ? "safe" : score < 50 ? "low" : score < 75 ? "medium" : "high";

  const content: string = data.content || "";
  const signals: AnalysisResult["signals"] = [];

  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ✅") || trimmed.startsWith("- **Safe")) {
      signals.push({ type: "positive", text: trimmed.replace(/^-\s*✅\s*/, "").replace(/^\*\*(.*?)\*\*/, "$1") });
    } else if (trimmed.startsWith("- ⚠") || trimmed.startsWith("- **Warning")) {
      signals.push({ type: "warning", text: trimmed.replace(/^-\s*⚠️?\s*/, "").replace(/^\*\*(.*?)\*\*/, "$1") });
    } else if (trimmed.startsWith("- 🔴") || trimmed.startsWith("- **Danger") || trimmed.startsWith("- ❌")) {
      signals.push({ type: "negative", text: trimmed.replace(/^-\s*[🔴❌]\s*/, "").replace(/^\*\*(.*?)\*\*/, "$1") });
    }
  }

  if (signals.length === 0 && data.walletInfo) {
    const info = data.walletInfo;
    if (info.totalTransactions && info.totalTransactions > 100) signals.push({ type: "positive", text: `Active history: ${info.totalTransactions} transactions` });
    if (info.totalTransactions && info.totalTransactions < 10) signals.push({ type: "warning", text: "Very few transactions — new or inactive wallet" });
    if (info.balance && info.balance !== "0") signals.push({ type: "positive", text: `Balance: ${info.balance}` });
    if (info.isMalicious) signals.push({ type: "negative", text: "Flagged as malicious address" });
  }

  return {
    content,
    trustScore: score,
    trustLevel: level as AnalysisResult["trustLevel"],
    address,
    signals: signals.length > 0 ? signals : [{ type: "warning", text: "No specific signals detected — manual review recommended" }],
    sources: data.sources || [],
    agentSteps: data.agentSteps || [],
    onChainProof: data.onChainProof,
    executionTime: data.executionTime || 0,
  };
}

// ─── Agent Steps Visualizer ──────────────────────────────
function AgentStepsBar({ steps }: { steps: AgentStep[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-cyan-500/[0.02] p-4 backdrop-blur-xl overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-xs"
      >
        <div className="flex items-center gap-2 text-white/80 font-semibold">
          <Zap className="w-4 h-4" />
          Agent executed {steps.length} step{steps.length !== 1 ? "s" : ""}
        </div>
        <span className="text-white/20 text-[10px]">{expanded ? "▲ COLLAPSE" : "▼ EXPAND"}</span>
      </button>
      {expanded && (
        <div className="mt-4 space-y-3">
          {steps.map((step) => (
            <div key={step.step} className="flex items-start gap-3 text-xs">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                  step.status === "success"
                    ? "bg-gradient-to-br from-cyan-500/20 to-white/[0.04] text-white/80 border border-white/[0.1]"
                    : "bg-gradient-to-br from-magenta-500/20 to-white/[0.04] text-white/50 border border-magenta-500/25"
                }`}
              >
                {step.step}
              </div>
              <div className="flex-1">
                <span className="font-mono text-white/70 text-[11px]">{step.tool}</span>
                <div className="text-white/40 mt-0.5 leading-relaxed">{step.summary}</div>
                {step.reasoning && (
                  <div className="text-white/20 text-[10px] mt-1 italic">💡 {step.reasoning}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Mode Selector ────────────────────────────────────────
function ModeSelector({ mode, onChange }: { mode: AnalysisMode; onChange: (m: AnalysisMode) => void }) {
  const modes: AnalysisMode[] = ["general", "defi", "nft", "p2p"];
  return (
    <div className="flex items-center gap-2 justify-center flex-wrap">
      {modes.map((m) => {
        const config = modeLabels[m];
        const active = m === mode;
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              active
                ? `bg-gradient-to-r ${config.gradient} text-${config.color}-400 border border-${config.color}-500/30 ${config.glow}`
                : "bg-white/[0.03] text-white/30 border border-white/5 hover:text-white hover:border-white/10 hover:bg-white/5"
            }`}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Loading State ────────────────────────────────────────
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.04] border border-white/[0.08] flex items-center justify-center animate-pulse-glow">
          <Loader2 className="w-8 h-8 text-white/80 animate-spin" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-magenta-500/20 to-white/[0.04] border border-white/[0.12] flex items-center justify-center">
          <Shield className="w-3 h-3 text-white/50" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-white font-display font-semibold text-lg">Analyzing address...</p>
        <p className="text-white/30 text-sm">Fetching data from Tatum Sui RPC + Walrus</p>
      </div>
      <div className="flex items-center gap-4 text-[11px] text-white/30">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> Tatum RPC</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-magenta-400 animate-pulse" /> Walrus</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-magenta-400 animate-pulse" /> AI Agent</span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function AnalyzePage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<AnalysisMode>("general");

  const handleAnalyze = useCallback(async (address: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, mode, prompt: modeLabels[mode].prompt }),
      });

      if (!res.ok) throw new Error(`Analysis failed: ${res.status}`);

      const data = await res.json();
      const parsed = parseAnalysisResponse(data, address);
      setResult(parsed);

      saveScan({
        address,
        score: parsed.trustScore,
        level: parsed.trustLevel,
        timestamp: Date.now(),
      });
    } catch (e: unknown) {
      setError((e instanceof Error ? e.message : String(e)));
    } finally {
      setIsLoading(false);
    }
  }, [mode]);

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[500px] h-[500px] bg-gradient-to-bl from-white/[0.04] via-magenta-500/5 to-transparent rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[30%] w-[400px] h-[400px] bg-gradient-to-t from-white/[0.04] via-transparent to-transparent rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="border-b border-white/[0.06] bg-black/40 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl hover:bg-white/5 transition-colors text-white/30 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 flex items-center justify-center">
                <img src="/logo.png" alt="SuiShield" className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(0,229,255,0.4)]" />
              </div>
              <div>
                <div className="text-white font-display font-semibold text-sm">SuiShield</div>
                <div className="text-white/20 text-[11px]">Check Before You Approve</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-white/30">
              <Database className="w-3.5 h-3.5 text-white/80" />
              <span>Tatum + Walrus</span>
            </div>
            <DualWalletButton />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-5 py-8 space-y-6">
        {/* Input Section */}
        <div className="space-y-5">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-white/[0.05] to-white/[0.03] border border-white/[0.06] text-xs">
              <Search className="w-3 h-3 text-white/80" />
              <span className="text-white/60 font-bold uppercase tracking-widest">Trust Analysis</span>
            </div>
            <h1 className="font-display font-bold text-3xl text-white tracking-tight">
              Analyze Any <span className="text-white/60">Sui Address</span>
            </h1>
            <p className="text-white/30 text-sm max-w-md mx-auto">
              Paste a wallet, contract, or token address to get an AI-powered trust verdict with on-chain proof
            </p>
          </div>
          <ModeSelector mode={mode} onChange={setMode} />
          <AddressInput onAnalyze={handleAnalyze} isLoading={isLoading} />
          <ScanHistory onSelect={handleAnalyze} />
        </div>

        {/* Loading */}
        {isLoading && <LoadingState />}

        {/* Error */}
        {error && (
          <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-5 text-center backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
            <p className="text-white/50 text-sm font-medium">{error}</p>
            <p className="text-white/20 text-xs mt-2">Make sure GROQ_API_KEY is set in .env.local</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-5 animate-slide-up">
            {/* Trust Score */}
            <TrustScoreCard
              score={result.trustScore}
              level={result.trustLevel}
              address={result.address}
            />

            {/* Share Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-white/30">
                <Activity className="w-3.5 h-3.5 text-white/80" />
                Analysis completed in {(result.executionTime / 1000).toFixed(1)}s
              </div>
              {result.onChainProof && (
                <ShareButton
                  url={`${typeof window !== "undefined" ? window.location.origin : ""}/verify/${result.onChainProof.blobId}`}
                />
              )}
            </div>

            {/* Risk Signals */}
            <AnalysisSection
              title="Risk Signals"
              icon={<Shield className="w-4 h-4 text-white/80" />}
              defaultOpen
              accent="cyan"
            >
              <div className="space-y-1">
                {result.signals.map((signal, i) => (
                  <RiskSignal key={i} {...signal} />
                ))}
              </div>
            </AnalysisSection>

            {/* Full Analysis */}
            <AnalysisSection
              title="Full Analysis"
              icon={<Brain className="w-4 h-4 text-white/80" />}
              accent="blue"
            >
              <div className="text-sm text-white/50 leading-relaxed whitespace-pre-wrap">
                {result.content}
              </div>
            </AnalysisSection>

            {/* Agent Steps */}
            {result.agentSteps.length > 0 && <AgentStepsBar steps={result.agentSteps} />}

            {/* Sources */}
            {result.sources.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {result.sources.map((src, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 text-xs border rounded-lg px-2.5 py-1 font-mono text-white/40 border-white/[0.06] bg-white/[0.03]"
                  >
                    {src.type === "tatum-sui-rpc" && <span className="text-white/80">⚡</span>}
                    {src.type === "walrus" && <span className="text-white/50">⬡</span>}
                    {src.type === "agent" && <span className="text-white/50">🤖</span>}
                    {src.label}
                  </span>
                ))}
              </div>
            )}

            {/* On-Chain Proof */}
            {result.onChainProof && (
              <OnChainProof
                blobId={result.onChainProof.blobId}
                storedAt={result.onChainProof.storedAt}
                verificationUrl={result.onChainProof.verificationUrl}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
