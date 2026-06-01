"use client";

import { type ReactNode } from "react";
import "@/lib/wallet-config";

export function WalletProvider({ children }: { children: ReactNode }) {
  // AppKit is initialized via the import above (lib/wallet-config.ts)
  // The w3m web components register themselves automatically
  return <>{children}</>;
}
