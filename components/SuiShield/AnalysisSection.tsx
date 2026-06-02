"use client";

import { useState, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface AnalysisSectionProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  accent?: "cyan" | "magenta" | "blue" | "orange";
}

const accentColors = {
  cyan: "border-cyan-500/20 bg-cyan-500/5",
  magenta: "border-magenta-500/20 bg-magenta-500/5",
  blue: "border-cyan-500/20 bg-cyan-500/5",
  orange: "border-magenta-500/20 bg-magenta-500/5",
};

export function AnalysisSection({ title, icon, children, defaultOpen = false, accent = "cyan" }: AnalysisSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`rounded-xl border ${accentColors[accent]} overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          {icon}
          {title}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-white/30 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
