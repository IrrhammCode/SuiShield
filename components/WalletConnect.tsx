"use client";

import { useState } from "react";
import { Wallet, ChevronDown, Copy, Check } from "lucide-react";
import { useSuiWallet, SuiConnectButton, SuiConnectModal } from "@/lib/sui-wallet";
import { useWalletAuth } from "@/context/WalletAuthContext";
import { useAppKit } from "@reown/appkit/react";

// Sui Wallet Connect Button
export function SuiWalletButton() {
  const { address, isConnected } = useSuiWallet();
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
      <div className="[&_button]:bg-gradient-to-r [&_button]:from-[#00E5FF] [&_button]:to-[#00B8D4] [&_button]:text-[#050505] [&_button]:font-medium [&_button]:text-sm [&_button]:py-2.5 [&_button]:px-5 [&_button]:rounded-full [&_button]:shadow-[0_0_20px_rgba(0,229,255,0.3)] [&_button]:hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] [&_button]:transition-all [&_button]:border-none">
        <SuiConnectButton />
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-2 rounded-full border border-magenta-500/30 bg-magenta-500/10 hover:bg-magenta-500/20 transition-all"
      >
        <div className="w-2 h-2 rounded-full bg-magenta-400 animate-pulse" />
        <span className="text-magenta-400 font-mono text-xs">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <ChevronDown className="w-3 h-3 text-magenta-400" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-[#1A1D2E] shadow-xl z-50 overflow-hidden">
          <div className="p-3 border-b border-white/5">
            <div className="text-xs text-[#525880] mb-1">Sui Wallet</div>
            <div className="font-mono text-xs text-white">{address}</div>
          </div>
          <div className="p-1">
            <button
              onClick={copyAddress}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#8B93C4] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-magenta-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Address"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// EVM Wallet Connect Button (Reown)
export function EvmWalletButton() {
  const { address, isConnected } = useWalletAuth();
  const { open } = useAppKit();

  if (!isConnected || !address) {
    return (
      <button 
        onClick={() => open()}
        className="flex items-center gap-2 px-3 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all text-cyan-400 text-xs font-medium cursor-pointer"
      >
        <Wallet className="w-3.5 h-3.5" />
        Connect EVM
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => open({ view: 'Account' })}
        className="flex items-center gap-2 px-3 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all cursor-pointer"
      >
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-cyan-400 font-mono text-xs">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
      </button>
    </div>
  );
}

// Combined wallet button that shows both options cleanly
export function DualWalletButton() {
  const { isConnected: isEvmConnected } = useWalletAuth();
  const { isConnected: isSuiConnected } = useSuiWallet();
  const { open } = useAppKit();
  const [isOpen, setIsOpen] = useState(false);

  // If either is connected, show the connected state buttons
  if (isEvmConnected || isSuiConnected) {
    return (
      <div className="flex items-center gap-2">
        {isEvmConnected && <EvmWalletButton />}
        {isSuiConnected && <SuiWalletButton />}
        
        {/* If only one is connected, provide an option to connect the other */}
        {!isEvmConnected && (
           <button 
             onClick={() => open()}
             className="flex items-center gap-2 px-3 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all text-cyan-400 text-xs font-medium cursor-pointer"
           >
             <Wallet className="w-3.5 h-3.5" />
             Add EVM
           </button>
        )}
        
        {!isSuiConnected && (
          <SuiConnectModal 
            trigger={
              <button className="flex items-center gap-2 px-3 py-2 rounded-full border border-magenta-500/30 bg-magenta-500/10 hover:bg-magenta-500/20 transition-all text-magenta-400 text-xs font-medium cursor-pointer">
                <span>Add Sui</span>
              </button>
            }
          />
        )}
      </div>
    );
  }

  // If neither connected, show unified dropdown
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00E5FF] to-[#00B8D4] text-[#050505] font-medium text-sm py-2.5 px-5 rounded-full shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] transition-all"
      >
        <Wallet className="w-4 h-4" />
        Connect Wallet
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#1A1D2E] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 flex flex-col p-1 gap-1">
          <div className="px-3 py-2 text-xs font-medium text-[#8B93C4] border-b border-white/5 mb-1">Select Network</div>
          
          <button 
            onClick={() => { open(); setIsOpen(false); }}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-cyan-500/10 transition-colors text-cyan-400 text-sm font-medium w-full text-left cursor-pointer"
          >
            <Wallet className="w-4 h-4" />
            Connect EVM
          </button>

          <SuiConnectModal
            trigger={
              <button 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-magenta-500/10 transition-colors text-magenta-400 text-sm font-medium w-full text-left cursor-pointer"
              >
                <Wallet className="w-4 h-4" />
                Connect Sui
              </button>
            }
          />
        </div>
      )}
    </div>
  );
}
