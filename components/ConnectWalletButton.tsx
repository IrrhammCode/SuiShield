"use client";

import { useWallet } from "@/components/WalletProvider";

export function ConnectWalletButton() {
  const { address, isConnected, isConnecting, hasProvider, error, connect, disconnect, balance } =
    useWallet();

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  // ——— Connected State ———
  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        {/* Balance pill */}
        {balance && (
          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/50">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-60">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6 3v6M4 5.5L6 3l2 2.5M4 6.5L6 9l2-2.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {balance} ETH
          </span>
        )}

        {/* Address + Disconnect */}
        <button
          onClick={disconnect}
          className="group relative flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#4F37FD]/20 to-[#7B61FF]/20 border border-[#4F37FD]/30 hover:border-[#4F37FD]/60 transition-all duration-300 cursor-pointer"
        >
          {/* Green dot */}
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

          {/* Address */}
          <span className="text-sm font-mono text-white/80 group-hover:text-white transition-colors">
            {shortAddress}
          </span>

          {/* Disconnect icon on hover */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            className="opacity-0 group-hover:opacity-80 transition-opacity duration-200 text-red-400"
          >
            <path
              d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    );
  }

  // ——— Disconnected State ———
  return (
    <div className="flex items-center gap-2">
      {error && (
        <span className="hidden sm:block text-xs text-red-400 max-w-[180px] truncate">{error}</span>
      )}

      <button
        id="connect-wallet-btn"
        onClick={connect}
        disabled={isConnecting}
        className="relative group flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white overflow-hidden transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {/* Gradient background */}
        <span className="absolute inset-0 bg-gradient-to-r from-[#4F37FD] to-[#7B61FF] transition-opacity duration-300 group-hover:opacity-90" />

        {/* Glow effect */}
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_50%,rgba(123,97,255,0.4),transparent_70%)]" />

        {/* Content */}
        <span className="relative flex items-center gap-2">
          {isConnecting ? (
            <>
              {/* Spinner */}
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path
                  d="M4 12a8 8 0 018-8"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="opacity-75"
                />
              </svg>
              Connecting...
            </>
          ) : (
            <>
              {/* Wallet icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="6" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
                <path d="M6 6V5a3 3 0 013-3h6a3 3 0 013 3v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="16" cy="13" r="1.5" fill="currentColor" />
              </svg>
              {hasProvider ? "Connect Wallet" : "Install MetaMask"}
            </>
          )}
        </span>
      </button>
    </div>
  );
}
