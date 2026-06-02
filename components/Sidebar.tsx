"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Database,
  Shield,
  Brain,
  Zap,
  Home,
  Search,
  GitBranch,
  Bell,
  Eye,
  Globe,
} from "lucide-react";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";

const NAV_ITEMS = [
  { icon: <Home className="w-4 h-4" />, label: "Dashboard", href: "/dashboard", description: "AI Chat" },
  { icon: <Search className="w-4 h-4" />, label: "Analyze", href: "/analyze", description: "Trust Score" },
  { icon: <GitBranch className="w-4 h-4" />, label: "Trust Graph", href: "/trust-graph", description: "Fund Flow" },
  { icon: <Bell className="w-4 h-4" />, label: "Monitor", href: "/monitor", description: "Alerts" },
  { icon: <Database className="w-4 h-4" />, label: "Explore", href: "/explore", description: "Datasets" },
  { icon: <Eye className="w-4 h-4" />, label: "Verify", href: "/verify", description: "Proofs" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 flex-shrink-0 border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src="/logo.png" alt="SuiShield" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(0,229,255,0.4)]" />
          </div>
          <div>
            <div className="font-display font-black text-white text-sm">SuiShield</div>
            <div className="text-[10px] text-white/20 font-medium">Check Before You Approve</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-white/10 text-white border border-white/10"
                  : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <div className={`${isActive ? "text-cyan-400" : "text-white/30 group-hover:text-white/60"} transition-colors`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold">{item.label}</div>
                <div className="text-[10px] text-white/20">{item.description}</div>
              </div>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Status */}
      <div className="p-3 border-t border-white/5">
        <div className="space-y-2">
          {[
            { label: "Tatum RPC", status: "Online", color: "text-cyan-400" },
            { label: "Walrus", status: "Connected", color: "text-cyan-400" },
            { label: "Sui Testnet", status: "Live", color: "text-cyan-400" },
          ].map(({ label, status, color }) => (
            <div key={label} className="flex items-center justify-between text-xs">
              <span className="text-white/20">{label}</span>
              <span className={`${color} flex items-center gap-1.5 font-medium`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Wallet */}
      <div className="p-3 border-t border-white/5">
        <ConnectWalletButton />
      </div>
    </div>
  );
}
