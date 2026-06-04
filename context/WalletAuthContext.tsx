"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useWallet } from "@/components/WalletProvider";
import { useRouter, usePathname } from "next/navigation";

interface WalletAuthState {
  address: string | undefined;
  isConnected: boolean;
}

const WalletAuthContext = createContext<WalletAuthState>({
  address: undefined,
  isConnected: false,
});

export function useWalletAuth() {
  return useContext(WalletAuthContext);
}

export function WalletAuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useWallet();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isConnected) {
      document.cookie = "wallet-connected=1; path=/; max-age=86400";
    } else {
      document.cookie = "wallet-connected=; path=/; max-age=0";
    }

    if (isConnected && pathname === "/") {
      router.push("/dashboard");
    }

    if (!isConnected && pathname === "/dashboard") {
      router.push("/");
    }
  }, [isConnected, pathname, router]);

  return (
    <WalletAuthContext.Provider
      value={{
        address,
        isConnected,
      }}
    >
      {children}
    </WalletAuthContext.Provider>
  );
}
