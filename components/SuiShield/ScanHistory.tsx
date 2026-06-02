"use client";

import { useState } from "react";
import { Clock, Shield, AlertTriangle, XCircle, CheckCircle } from "lucide-react";

interface ScanEntry {
  address: string;
  score: number;
  level: string;
  timestamp: number;
}

const levelIcons: Record<string, typeof CheckCircle> = {
  safe: CheckCircle,
  low: Shield,
  medium: AlertTriangle,
  high: XCircle,
  critical: XCircle,
};

const levelColors: Record<string, string> = {
  safe: "text-magenta-400",
  low: "text-cyan-400",
  medium: "text-magenta-400",
  high: "text-magenta-400",
  critical: "text-magenta-400",
};

function loadScans(): ScanEntry[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("suishield-scans");
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function timeAgo(timestamp: number): string {
  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function ScanHistory({ onSelect }: { onSelect: (address: string) => void }) {
  const [scans] = useState<ScanEntry[]>(loadScans);

  if (scans.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-white/30">
        <Clock className="w-3.5 h-3.5" />
        <span>Recent scans</span>
      </div>
      <div className="space-y-1">
        {scans.slice(0, 5).map((scan) => {
          const Icon = levelIcons[scan.level] || Shield;
          const color = levelColors[scan.level] || "text-white/40";
          return (
            <button
              key={scan.address + scan.timestamp}
              onClick={() => onSelect(scan.address)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left"
            >
              <Icon className={`w-3.5 h-3.5 ${color} flex-shrink-0`} />
              <span className="font-mono text-xs text-white/40 flex-1 truncate">
                {scan.address.slice(0, 8)}...{scan.address.slice(-6)}
              </span>
              <span className={`text-xs font-medium ${color}`}>{scan.score}</span>
              <span className="text-[10px] text-white/30">
                {timeAgo(scan.timestamp)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function saveScan(entry: ScanEntry) {
  const stored = localStorage.getItem("suishield-scans");
  let scans: ScanEntry[] = [];
  try {
    scans = stored ? JSON.parse(stored) : [];
  } catch {}
  scans.unshift(entry);
  if (scans.length > 20) scans = scans.slice(0, 20);
  localStorage.setItem("suishield-scans", JSON.stringify(scans));
}
