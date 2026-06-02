"use client";

import { Shield, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface TrustScoreCardProps {
  score: number;
  level: "safe" | "low" | "medium" | "high" | "critical";
  address: string;
  chain?: string;
}

const levelConfig = {
  safe: { label: "SAFE", color: "#00FF9D", icon: CheckCircle, bg: "bg-magenta-500/10", border: "border-magenta-500/30" },
  low: { label: "LOW RISK", color: "#4DA6FF", icon: Shield, bg: "bg-blue-500/10", border: "border-blue-500/30" },
  medium: { label: "MEDIUM RISK", color: "#FFB300", icon: AlertTriangle, bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  high: { label: "HIGH RISK", color: "#FF6B00", icon: XCircle, bg: "bg-orange-500/10", border: "border-orange-500/30" },
  critical: { label: "DANGEROUS", color: "#FF3366", icon: XCircle, bg: "bg-red-500/10", border: "border-red-500/30" },
};

export function TrustScoreCard({ score, level, address, chain = "Sui" }: TrustScoreCardProps) {
  const config = levelConfig[level] || levelConfig.medium;
  const Icon = config.icon;

  return (
    <div className={`rounded-2xl p-6 ${config.bg} border ${config.border}`}>
      {/* Verdict */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon className="w-8 h-8" style={{ color: config.color }} />
          <div>
            <div className="text-2xl font-bold" style={{ color: config.color }}>
              {config.label}
            </div>
            <div className="text-white/30 text-xs font-mono">
              {address.slice(0, 8)}...{address.slice(-6)} · {chain}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold" style={{ color: config.color }}>
            {score}
          </div>
          <div className="text-white/30 text-xs">/100</div>
        </div>
      </div>

      {/* Score Bar */}
      <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: config.color }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-white/30 mt-1.5">
        <span>Safe</span>
        <span>Critical</span>
      </div>
    </div>
  );
}
