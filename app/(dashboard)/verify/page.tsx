"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Shield,
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  ExternalLink,
  Clock,
  Copy,
  Check,
  ChevronLeft,
} from "lucide-react";

interface VerificationResult {
  blobId: string;
  found: boolean;
  record?: {
    type: string;
    address: string;
    chain: string;
    riskScore: number;
    riskLevel: string;
    timestamp: string;
    analysis: string;
    analyzedBy: string;
    model: string;
    proofVersion: string;
  };
  verifiedAt: string;
}

export default function VerifyPage() {
  const [blobId, setBlobId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleVerify = useCallback(async () => {
    if (!blobId.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/verify?blobId=${encodeURIComponent(blobId.trim())}`);
      if (!res.ok) throw new Error(`Verification failed: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [blobId]);

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/verify/${blobId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRiskColor = (score: number) => {
    if (score < 25) return "text-white/80";
    if (score < 50) return "text-white/80";
    if (score < 75) return "text-white/50";
    return "text-white/50";
  };

  const getRiskGradient = (score: number) => {
    if (score < 25) return "from-white/[0.06] to-white/[0.02] border-white/[0.08]";
    if (score < 50) return "from-white/[0.06] to-white/[0.02] border-white/[0.08]";
    if (score < 75) return "from-white/[0.06] to-white/[0.02] border-white/[0.08]";
    return "from-white/[0.06] to-white/[0.02] border-white/[0.08]";
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute -top-[15%] -left-[10%] w-[600px] h-[600px] bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[500px] h-[500px] bg-gradient-to-bl from-white/[0.04] via-cyan-500/5 to-transparent rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[30%] w-[400px] h-[400px] bg-gradient-to-t from-white/[0.04] via-transparent to-transparent rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="border-b border-white/[0.06] bg-black/40 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-xl hover:bg-white/5 transition-colors text-white/30 hover:text-white">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 flex items-center justify-center">
                <img src="/logo.png" alt="SuiShield" className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(0,229,255,0.4)]" />
              </div>
              <div>
                <div className="font-display font-black text-white text-sm">SuiShield</div>
                <div className="text-white/20 text-[11px]">Verify Proof</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-white/[0.04] to-white/[0.04] border border-white/[0.06] text-xs">
            <Shield className="w-3 h-3 text-white/80" />
            <span className="text-white/50 font-bold uppercase tracking-widest">On-Chain Verification</span>
          </div>
          <h1 className="font-display font-black text-3xl text-white tracking-tight">
            Verify Analysis <span className="text-white/50">Proof</span>
          </h1>
          <p className="text-white/30 text-sm max-w-md">
            Enter a Walrus blob ID to verify an analysis proof stored on-chain.
          </p>
        </div>

        {/* Input */}
        <div className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-cyan-500/[0.02] p-5 backdrop-blur-xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-white/80" />
            <span className="text-white font-bold text-sm">Enter Blob ID</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={blobId}
              onChange={(e) => setBlobId(e.target.value)}
              placeholder="Paste Walrus blob ID..."
              className="flex-1 bg-black/40 border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none focus:border-white/[0.12] transition-colors font-mono"
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            />
            <button
              onClick={handleVerify}
              disabled={loading || !blobId.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-white to-white/80 text-black font-bold text-sm hover:from-cyan-300 hover:to-cyan-400 transition-all shadow-[0_0_20px_rgba(0,255,157,0.2)] hover:shadow-[0_0_30px_rgba(0,255,157,0.4)] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              Verify
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-white/[0.04] border border-white/[0.08] flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white/80 animate-spin" />
            </div>
            <p className="text-white text-sm">Verifying proof...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-5 text-center backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
            <XCircle className="w-8 h-8 text-white/50 mx-auto mb-2" />
            <p className="text-white/50 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4 animate-slide-up">
            {/* Status */}
            <div className={`relative rounded-2xl border p-5 backdrop-blur-xl overflow-hidden ${
              result.found 
                ? "border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.02]" 
                : "border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.02]"
            }`}>
              <div className={`absolute top-0 left-0 right-0 h-px ${
                result.found ? "bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" : "bg-gradient-to-r from-transparent via-white/[0.12] to-transparent"
              }`} />
              <div className="flex items-center gap-3 mb-3">
                {result.found ? (
                  <CheckCircle className="w-6 h-6 text-white/80" />
                ) : (
                  <XCircle className="w-6 h-6 text-white/50" />
                )}
                <div>
                  <div className={`font-display font-bold text-lg ${result.found ? "text-white/80" : "text-white/50"}`}>
                    {result.found ? "Proof Verified" : "Proof Not Found"}
                  </div>
                  <div className="text-white/30 text-xs">
                    {result.found ? "This analysis was stored on Walrus" : "No analysis found for this blob ID"}
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            {result.found && result.record && (
              <div className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-cyan-500/[0.02] p-5 space-y-4 backdrop-blur-xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
                <div className="flex items-center justify-between">
                  <span className="text-white/30 text-xs font-bold uppercase tracking-wider">Analysis Details</span>
                  <span className={`font-display font-bold ${getRiskColor(result.record.riskScore)}`}>
                    {result.record.riskScore}/100
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Address", value: `${result.record.address.slice(0, 10)}...` },
                    { label: "Chain", value: result.record.chain },
                    { label: "Risk Level", value: result.record.riskLevel.toUpperCase() },
                    { label: "Model", value: result.record.model },
                    { label: "Analyzed By", value: `${result.record.analyzedBy.slice(0, 10)}...` },
                    { label: "Proof Version", value: result.record.proofVersion },
                  ].map(({ label, value }) => (
                    <div key={label} className={`rounded-xl p-3 bg-gradient-to-br ${getRiskGradient(result.record!.riskScore)}`}>
                      <div className="text-white/20 text-[10px] mb-1">{label}</div>
                      <div className="text-white text-xs font-mono">{value}</div>
                    </div>
                  ))}
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-2 text-xs text-white/20">
                  <Clock className="w-3 h-3" />
                  <span>Analyzed: {new Date(result.record.timestamp).toLocaleString()}</span>
                </div>

                {/* Analysis Text */}
                {result.record.analysis && (
                  <div className="rounded-xl p-4 bg-black/40 border border-white/[0.06]">
                    <div className="text-white/20 text-[10px] mb-2 font-bold uppercase">Analysis</div>
                    <p className="text-white/40 text-sm leading-relaxed">{result.record.analysis}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={copyLink}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/50 text-xs font-medium hover:bg-white/[0.06] hover:border-white/[0.1] transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-white/80" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy Link"}
                  </button>
                  <a
                    href={`https://aggregator.walrus.space/v1/blobs/${blobId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/50 text-xs font-medium hover:bg-white/[0.06] hover:border-white/[0.1] transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View on Walrus
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
