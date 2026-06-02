"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  CheckCircle,
  XCircle,
  ExternalLink,
  Clock,
  Wallet,
  Activity,
  ArrowLeft,
  Loader2,
  Database,
  Brain,
  Copy,
  Check,
  Link2,
  Hash,
} from "lucide-react";

interface AnalysisRecord {
  version: string;
  type: string;
  address: string;
  chain: string;
  timestamp: string;
  riskScore: number;
  riskLevel: string;
  balance: string;
  transactionCount: number;
  analysis: string;
  agentSteps: string[];
  analyzedBy: string;
  // Proof chain fields
  inputHash?: string;
  outputHash?: string;
  model?: string;
  proofVersion?: string;
}

function RiskBadge({ level, score }: { level: string; score: number }) {
  const colors: Record<string, string> = {
    safe: "bg-teal-500/20 text-teal-400 border-teal-500/30",
    low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    high: "bg-red-500/20 text-red-400 border-red-500/30",
    critical: "bg-red-600/20 text-red-300 border-red-600/30",
  };
  const color = colors[level] || colors.safe;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${color}`}>
      <Shield className="w-4 h-4" />
      {level.toUpperCase()} ({score}/100)
    </div>
  );
}

export default function VerifyPage() {
  const params = useParams();
  const blobId = params.blobId as string;

  const [record, setRecord] = useState<AnalysisRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const res = await fetch(`/api/verify?blobId=${encodeURIComponent(blobId)}`);
        if (!res.ok) {
          throw new Error("Analysis not found or Walrus blob expired");
        }
        const data = await res.json();
        setRecord(data);
      } catch (e: unknown) {
        setError((e instanceof Error ? e.message : String(e)));
      } finally {
        setLoading(false);
      }
    }
    if (blobId) fetchAnalysis();
  }, [blobId]);

  const copyBlobId = () => {
    navigator.clipboard.writeText(blobId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080A14]">
      {/* Header */}
      <div className="border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/30 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-teal-500 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">On-Chain Verification</div>
                <div className="text-white/30 text-xs">Powered by Walrus Storage</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/30">
            <Database className="w-3.5 h-3.5 text-teal-400" />
            <span>Walrus Blob</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-5 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-teal-400 animate-spin mb-4" />
            <p className="text-white/40 text-sm">Fetching analysis from Walrus...</p>
          </div>
        ) : error ? (
          <div className="card p-8 text-center border-red-500/20">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Verification Failed</h2>
            <p className="text-white/40 text-sm mb-4">{error}</p>
            <p className="text-white/30 text-xs">
              The blob may have expired or the ID is invalid. Walrus blobs are stored for a limited number of epochs.
            </p>
          </div>
        ) : record ? (
          <div className="space-y-6">
            {/* Verification Status */}
            <div className="card p-6 border-teal-500/20 bg-teal-500/5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-teal-400" />
                  <div>
                    <h2 className="text-lg font-semibold text-white">Verified On-Chain Analysis</h2>
                    <p className="text-white/40 text-sm">
                      This analysis was stored immutably on Walrus decentralized storage
                    </p>
                  </div>
                </div>
                <RiskBadge level={record.riskLevel} score={record.riskScore} />
              </div>
            </div>

            {/* Blob Info */}
            <div className="card p-4">
              <div className="text-xs text-white/30 mb-2 font-medium">WALRUS BLOB ID</div>
              <div className="flex items-center gap-2">
                <code className="font-mono text-sm text-teal-400 break-all">{blobId}</code>
                <button onClick={copyBlobId} className="p-1.5 rounded-lg hover:bg-white/5 flex-shrink-0">
                  {copied ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4 text-white/30" />}
                </button>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-white/30">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(record.timestamp).toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  {record.analyzedBy}
                </span>
              </div>
            </div>

            {/* Proof Chain */}
            {record.inputHash && (
              <div className="card p-5 border-purple-500/20 bg-purple-500/5">
                <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-purple-400" />
                  Proof Chain
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                      <Hash className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-white/30 mb-0.5">INPUT HASH (Prompt + Context)</div>
                      <code className="font-mono text-xs text-purple-400 break-all">{record.inputHash}</code>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                      <Hash className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-white/30 mb-0.5">OUTPUT HASH (LLM Response)</div>
                      <code className="font-mono text-xs text-purple-400 break-all">{record.outputHash}</code>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/30 pt-2 border-t border-white/5">
                    <span>Model: <span className="text-purple-400">{record.model}</span></span>
                    <span>Proof: <span className="text-purple-400">v{record.proofVersion}</span></span>
                  </div>
                </div>
              </div>
            )}

            {/* Wallet Summary */}
            <div className="card p-5">
              <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-purple-400" />
                Wallet Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Address", value: `${record.address.slice(0, 8)}...${record.address.slice(-6)}` },
                  { label: "Chain", value: record.chain.charAt(0).toUpperCase() + record.chain.slice(1) },
                  { label: "Balance", value: record.balance },
                  { label: "Transactions", value: record.transactionCount.toLocaleString() },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-black/40 rounded-lg p-3 border border-white/5">
                    <div className="text-[10px] text-white/30 mb-1">{label}</div>
                    <div className="text-white font-medium text-sm truncate">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Score */}
            <div className="card p-5">
              <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                Risk Assessment
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${record.riskScore}%`,
                        background:
                          record.riskScore < 25 ? "#2CCD9A" :
                          record.riskScore < 50 ? "#F5A623" :
                          record.riskScore < 75 ? "#FF8C42" : "#FF4D6D",
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-white/30 mt-1.5">
                    <span>Safe</span>
                    <span>Critical</span>
                  </div>
                </div>
                <div className="text-3xl font-bold" style={{
                  color: record.riskScore < 25 ? "#2CCD9A" :
                         record.riskScore < 50 ? "#F5A623" :
                         record.riskScore < 75 ? "#FF8C42" : "#FF4D6D",
                }}>
                  {record.riskScore}
                </div>
              </div>
            </div>

            {/* Analysis */}
            <div className="card p-5">
              <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                Analysis
              </h3>
              <p className="text-white/40 text-sm leading-relaxed">{record.analysis}</p>
            </div>

            {/* Agent Steps */}
            {record.agentSteps && record.agentSteps.length > 0 && (
              <div className="card p-5">
                <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  Agent Execution Steps
                </h3>
                <div className="space-y-2">
                  {record.agentSteps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center text-[10px] font-bold">
                        {i + 1}
                      </div>
                      <span className="font-mono text-white/40">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-xs text-white/30 pt-4 border-t border-white/5">
              <p>
                This analysis is stored on{" "}
                <a href="https://walrus.space" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">
                  Walrus Decentralized Storage
                </a>{" "}
                and verified via{" "}
                <a href="https://tatum.io" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                  Tatum Sui RPC
                </a>
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
