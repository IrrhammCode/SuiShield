"use client";

import { useAppKitAccount } from "@reown/appkit/react";

export function ConnectWalletButton() {
  const { address, isConnected } = useAppKitAccount();

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  return (
    <div className="flex items-center gap-3">
      {isConnected && (
        <span className="text-sm text-gray-400 font-mono hidden sm:block">
          {shortAddress}
        </span>
      )}
      {/* @ts-expect-error w3m web component */}
      <w3m-button />
    </div>
  );
}
