"use client";

import { Zap, Database, Globe, Activity } from "lucide-react";

interface TatumBadgeProps {
  variant?: "default" | "compact" | "banner";
  className?: string;
}

export function TatumBadge({ variant = "default", className = "" }: TatumBadgeProps) {
  if (variant === "banner") {
    return (
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/8 to-blue-500/5 border border-cyan-500/15 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/15 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <span className="font-display font-semibold text-cyan-400 text-sm">Tatum</span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <span className="text-white/30 text-xs">Sui RPC Gateway</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-[10px] font-medium">LIVE</span>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`inline-flex items-center gap-1.5 text-[10px] font-mono text-cyan-400/70 ${className}`}>
        <Zap className="w-3 h-3" />
        <span>via Tatum</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/8 border border-cyan-500/15 text-xs ${className}`}>
      <Zap className="w-3.5 h-3.5 text-cyan-400" />
      <span className="text-cyan-400 font-medium">Powered by Tatum</span>
    </div>
  );
}

export function WalrusBadge({ variant = "default", className = "" }: TatumBadgeProps) {
  if (variant === "banner") {
    return (
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-magenta-500/8 to-purple-500/5 border border-magenta-500/15 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-magenta-500/15 flex items-center justify-center">
            <Database className="w-3.5 h-3.5 text-magenta-400" />
          </div>
          <span className="font-display font-semibold text-magenta-400 text-sm">Walrus</span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <span className="text-white/30 text-xs">Decentralized Storage</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-[10px] font-medium">VERIFIED</span>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`inline-flex items-center gap-1.5 text-[10px] font-mono text-magenta-400/70 ${className}`}>
        <Database className="w-3 h-3" />
        <span>via Walrus</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-magenta-500/8 border border-magenta-500/15 text-xs ${className}`}>
      <Database className="w-3.5 h-3.5 text-magenta-400" />
      <span className="text-magenta-400 font-medium">Stored on Walrus</span>
    </div>
  );
}

export function TechStackBadges({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <TatumBadge variant="compact" />
      <div className="w-px h-3 bg-white/10" />
      <WalrusBadge variant="compact" />
      <div className="w-px h-3 bg-white/10" />
      <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-blue-400/70">
        <Globe className="w-3 h-3" />
        <span>Sui Mainnet</span>
      </div>
    </div>
  );
}
