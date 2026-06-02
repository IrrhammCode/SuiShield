"use client";

import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface RiskSignalProps {
  type: "positive" | "warning" | "negative";
  text: string;
  detail?: string;
}

const signalConfig = {
  positive: { icon: CheckCircle, color: "text-magenta-400", bg: "bg-magenta-500/10" },
  warning: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  negative: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
};

export function RiskSignal({ type, text, detail }: RiskSignalProps) {
  const config = signalConfig[type];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <Icon className={`w-4 h-4 ${config.color} flex-shrink-0 mt-0.5`} />
      <div>
        <span className="text-sm text-[#B0B8E0]">{text}</span>
        {detail && <div className="text-xs text-white/30 mt-0.5">{detail}</div>}
      </div>
    </div>
  );
}
