"use client";

import { useState, useRef } from "react";
import { Search, Loader2 } from "lucide-react";

interface AddressInputProps {
  onAnalyze: (address: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function AddressInput({ onAnalyze, isLoading, placeholder = "Paste Sui address, contract, or token..." }: AddressInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      onAnalyze(value.trim());
    }
  };

  const handleQuickCheck = (type: string) => {
    const examples: Record<string, string> = {
      wallet: "0x7a8b9c...",
      defi: "Cetus Pool",
      nft: "Sui Legends",
    };
    setValue(examples[type] || "");
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative flex items-center bg-[#1A1D2E]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 focus-within:border-cyan-500/40 transition-colors">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white text-sm pl-4 pr-2 py-3 focus:outline-none placeholder:text-white/30"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!value.trim() || isLoading}
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
            value.trim() && !isLoading
              ? "bg-gradient-to-br from-[#00E5FF] to-[#00B8D4] text-[#050505] shadow-[0_0_20px_rgba(0,229,255,0.3)]"
              : "bg-white/5 text-white/30 cursor-not-allowed"
          }`}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] text-white/30">Quick:</span>
        {["DeFi Pool", "NFT Collection", "P2P Wallet"].map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => handleQuickCheck(label.toLowerCase())}
            className="text-[10px] px-2 py-0.5 rounded-full border border-white/5 text-white/40 hover:text-white hover:border-white/10 transition-colors"
          >
            {label}
          </button>
        ))}
      </div>
    </form>
  );
}
