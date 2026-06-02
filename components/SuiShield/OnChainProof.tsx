"use client";

import { useState } from "react";
import { Database, ExternalLink, Copy, Check } from "lucide-react";

interface OnChainProofProps {
  blobId: string;
  storedAt?: string;
  verificationUrl?: string;
}

export function OnChainProof({ blobId, storedAt, verificationUrl }: OnChainProofProps) {
  const [copied, setCopied] = useState(false);

  const copyBlobId = () => {
    navigator.clipboard.writeText(blobId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-white/[0.08] bg-magenta-500/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Database className="w-4 h-4 text-white/50" />
        <span className="text-sm font-medium text-white/50">On-Chain Proof</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/30 w-16">Blob ID</span>
          <code className="font-mono text-xs text-white/50 flex-1 truncate">{blobId}</code>
          <button onClick={copyBlobId} className="p-1 rounded hover:bg-white/5">
            {copied ? <Check className="w-3.5 h-3.5 text-white/50" /> : <Copy className="w-3.5 h-3.5 text-white/30" />}
          </button>
        </div>

        {storedAt && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/30 w-16">Stored</span>
            <span className="text-xs text-white/40">{new Date(storedAt).toLocaleString()}</span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          {verificationUrl && (
            <a
              href={verificationUrl}
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/40 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Verify on Walrus
            </a>
          )}
          <span className="text-white/30">·</span>
          <span className="text-xs text-white/30">Immutable & Verifiable</span>
        </div>
      </div>
    </div>
  );
}
