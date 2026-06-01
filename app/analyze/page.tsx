"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Brain,
  Shield,
  ArrowLeft,
  Loader2,
  Zap,
  Database,
  Activity,
  TrendingUp,
  Wallet,
  Globe,
  ExternalLink,
  CheckCircle,
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
import { buildAnalyzeTransaction } from "@/lib/sui-contract";
import { useSuiWallet } from "@/lib/sui-wallet";

type AnalysisMode = "defi" | "nft" | "p2p" | "general";

const modeLabels: Record<AnalysisMode, { label: string; icon: string; prompt: string; color: string }> = {
  defi: {
    label: "DeFi",
    icon: "📊",
    prompt: "Perform a DeFi-focused trust analysis on this address. Check TVL trend, yield sustainability, concentration risk, protocol health, exit liquidity, and peer comparison with alternatives. Is it safe to deposit?",
    color: "cyan",
  },
  nft: {
    label: "NFT",
    icon: "🎨",
    prompt: "Perform an NFT-focused trust analysis on this address. Check creator track record, collection health, wash trading detection, floor price manipulation, copycat detection, and metadata integrity. Is it safe to buy?",
    color: "magenta",
  },
  p2p: {
    label: "P2P",
    icon: "🤝",
    prompt: "Perform a P2P counterparty risk analysis on this address. Check wallet age, money flow pattern, scam database cross-reference, money mule detection, and network risk. Is it safe to transact?",
    color: "orange",
  },
  general: {
    label: "General",
    icon: "🔍",
    prompt: "Perform a comprehensive trust analysis on this Sui address. Analyze balance, transactions, patterns, risk signals, and provide a trust score with clear verdict.",
    color: "blue",
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

// ─── Agent Steps Visualizer — Premium ────────────────────
function AgentStepsBar({ steps }: { steps: AgentStep[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card-premium p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-xs"
      >
        <div className="flex items-center gap-2 text-cyan-400 font-semibold">
          <Zap className="w-4 h-4" />
          Agent executed {steps.length} step{steps.length !== 1 ? "s" : ""}
        </div>
        <span className="text-[#525880] text-[10px]">{expanded ? "▲ COLLAPSE" : "▼ EXPAND"}</span>
      </button>
      {expanded && (
        <div className="mt-4 space-y-3">
          {steps.map((step) => (
            <div key={step.step} className="flex items-start gap-3 text-xs">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                  step.status === "success"
                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25"
                    : "bg-red-500/15 text-red-400 border border-red-500/25"
                }`}
              >
                {step.step}
              </div>
              <div className="flex-1">
                <span className="font-mono text-cyan-300 text-[11px]">{step.tool}</span>
                <div className="text-[#8B93C4] mt-0.5 leading-relaxed">{step.summary}</div>
                {step.reasoning && (
                  <div className="text-[#525880] text-[10px] mt-1 italic">💡 {step.reasoning}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Mode Selector — Premium ──────────────────────────────
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
                ? `bg-${config.color}-500/15 text-${config.color}-400 border border-${config.color}-500/30 shadow-[0_0_20px_rgba(0,229,255,0.1)]`
                : "bg-white/3 text-[#525880] border border-white/5 hover:text-white hover:border-white/10 hover:bg-white/5"
            }`}
          >
            <span className="text-base">{config.icon}</span>
            {config.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Loading State — Premium ──────────────────────────────
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-magenta-500/10 border border-cyan-500/20 flex items-center justify-center animate-pulse-glow">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-magenta-500/20 border border-magenta-500/30 flex items-center justify-center">
          <Shield className="w-3 h-3 text-magenta-400" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-white font-display font-semibold text-lg">Analyzing address...</p>
        <p className="text-[#525880] text-sm">Fetching data from Tatum Sui RPC + Walrus</p>
      </div>
      <div className="flex items-center gap-4 text-[11px] text-[#525880]">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> Tatum RPC</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-magenta-400 animate-pulse" /> Walrus</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" /> AI Agent</span>
      </div>
    </div>
  );
}

// ─── Main Page — Premium ──────────────────────────────────
export default function AnalyzePage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<AnalysisMode>("general");
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [recordError, setRecordError] = useState<string | null>(null);
  const { signAndExecute, isConnected } = useSuiWallet();

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
  }, []);

  const handleRecordOnSui = useCallback(async () => {
    if (!result?.onChainProof || !isConnected) return;
    setRecording(true);
    setRecordError(null);
    try {
      const tx = buildAnalyzeTransaction(
        result.address,
        result.trustScore,
        result.trustLevel === "safe" ? 0 : result.trustLevel === "low" ? 1 : result.trustLevel === "medium" ? 2 : 3,
        result.onChainProof.blobId
      );
      if (!tx) throw new Error("Failed to build transaction — contract env vars not set");
      await signAndExecute(tx);
      setRecorded(true);
    } catch (e: unknown) {
      setRecordError(e instanceof Error ? e.message : String(e));
    } finally {
      setRecording(false);
    }
  }, [result, isConnected, signAndExecute]);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-cyan-500/6 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] -right-[10%] w-[500px] h-[500px] bg-magenta-500/4 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <div className="border-b border-white/5 glass-bright sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl hover:bg-white/5 transition-colors text-[#525880] hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 flex items-center justify-center">
                <img src="/logo.png" alt="SuiShield" className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(0,229,255,0.4)]" />
              </div>
              <div>
                <div className="text-white font-display font-semibold text-sm">SuiShield</div>
                <div className="text-[#525880] text-[11px]">Check Before You Approve</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#525880]">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
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
            <div className="badge badge-primary inline-flex">
              <Search className="w-3 h-3" />
              Trust Analysis
            </div>
            <h1 className="font-display font-bold text-3xl text-white tracking-tight">
              Analyze Any Sui Address
            </h1>
            <p className="text-[#8B93C4] text-sm max-w-md mx-auto">
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
          <div className="card-premium p-5 border-red-500/20 bg-red-500/5 text-center">
            <p className="text-red-400 text-sm font-medium">{error}</p>
            <p className="text-[#525880] text-xs mt-2">Make sure GROQ_API_KEY is set in .env.local</p>
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
              <div className="flex items-center gap-2 text-xs text-[#525880]">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
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
              icon={<Shield className="w-4 h-4 text-cyan-400" />}
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
              icon={<Brain className="w-4 h-4 text-blue-400" />}
              accent="blue"
            >
              <div className="text-sm text-[#B0B8E0] leading-relaxed whitespace-pre-wrap">
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
                    className="inline-flex items-center gap-1.5 text-xs border rounded-lg px-2.5 py-1 font-mono text-[#8B93C4] border-white/8 bg-white/3"
                  >
                    {src.type === "tatum-sui-rpc" && <span className="text-cyan-400">⚡</span>}
                    {src.type === "walrus" && <span className="text-magenta-400">⬡</span>}
                    {src.type === "agent" && <span className="text-orange-400">🤖</span>}
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

            {/* Record on Sui */}
            {result.onChainProof && (
              <div className="card-premium p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-display font-semibold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      Record on Sui Blockchain
                    </div>
                    <div className="text-xs text-[#525880] mt-1">
                      Permanently record this analysis on-chain and mint an AnalysisCertificate NFT
                    </div>
                  </div>
                  {recorded ? (
                    <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Recorded
                    </div>
                  ) : (
                    <button
                      onClick={handleRecordOnSui}
                      disabled={recording || !isConnected}
                      className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {recording ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Recording...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Record on Sui
                        </>
                      )}
                    </button>
                  )}
                </div>
                {!isConnected && (
                  <p className="text-xs text-yellow-400/80 mt-3">Connect your Sui wallet to record on-chain</p>
                )}
                {recordError && (
                  <p className="text-xs text-red-400 mt-3">{recordError}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
