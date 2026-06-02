"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

interface ShareButtonProps {
  url: string;
}

export function ShareButton({ url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`I verified this wallet on SuiShield 🔐\n\n${url}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={copyLink}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/40 hover:text-white hover:border-white/20 transition-all"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-magenta-400" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? "Copied!" : "Copy Link"}
      </button>
      <button
        onClick={shareTwitter}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/40 hover:text-white hover:border-white/20 transition-all"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Share
      </button>
    </div>
  );
}
