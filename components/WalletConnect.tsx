"use client";

import { useState } from "react";
import { Wallet, ChevronDown, Copy, Check, LogOut } from "lucide-react";
import { useWallet } from "@/components/WalletProvider";

// EVM Wallet Connect Button (Native MetaMask / EIP-1193)
export function WalletButton() {
  const { address, isConnected, connect, disconnect, isConnecting, hasProvider } = useWallet();
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected || !address) {
    return (
      <button
        onClick={connect}
        disabled={isConnecting}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00E5FF] to-[#00B8D4] text-[#050505] font-medium text-sm py-2.5 px-5 rounded-full shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Wallet className="w-4 h-4" />
        {isConnecting ? "Connecting..." : hasProvider ? "Connect Wallet" : "Install MetaMask"}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/[0.12] bg-cyan-500/10 hover:bg-cyan-500/20 transition-all cursor-pointer"
      >
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-white/80 font-mono text-xs">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <ChevronDown className="w-3 h-3 text-white/50" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-[#1A1D2E] shadow-xl z-50 overflow-hidden">
          <div className="p-3 border-b border-white/5">
            <div className="text-xs text-white/30 mb-1">Connected Wallet</div>
            <div className="font-mono text-xs text-white">{address}</div>
          </div>
          <div className="p-1">
            <button
              onClick={copyAddress}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white/50" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Address"}
            </button>
            <button
              onClick={() => { disconnect(); setShowDropdown(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Keep DualWalletButton as alias for backward compat
export function DualWalletButton() {
  return <WalletButton />;
}

// Keep EvmWalletButton as alias
export function EvmWalletButton() {
  return <WalletButton />;
}
