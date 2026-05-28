"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, ComponentType } from "react";

// Context for Sui wallet state
interface SuiWalletContextType {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  signAndExecute: (tx: unknown) => Promise<unknown>;
}

const SuiWalletContext = createContext<SuiWalletContextType>({
  address: null,
  isConnected: false,
  isConnecting: false,
  signAndExecute: async () => null,
});

export function useSuiWallet() {
  return useContext(SuiWalletContext);
}

// Types for dapp-kit components
interface DappKitModule {
  createNetworkConfig: (config: Record<string, unknown>) => { networkConfig: Record<string, unknown> };
  SuiClientProvider: ComponentType<{ networks: Record<string, unknown>; defaultNetwork: string; children: ReactNode }>;
  WalletProvider: ComponentType<{ autoConnect: boolean; children: ReactNode }>;
  ConnectButton: ComponentType;
  ConnectModal: ComponentType<{ trigger: ReactNode }>;
  useCurrentAccount: () => { address: string } | null;
  useSignTransaction: () => { mutateAsync: (params: { transaction: unknown }) => Promise<unknown> };
}

interface ReactQueryModule {
  QueryClientProvider: ComponentType<{ client: unknown; children: ReactNode }>;
  QueryClient: new () => unknown;
}

// Provider that handles Sui wallet state
function SuiWalletStateInner({ children, useCurrentAccount, useSignTransaction }: {
  children: ReactNode;
  useCurrentAccount: () => { address: string } | null;
  useSignTransaction: () => { mutateAsync: (params: { transaction: unknown }) => Promise<unknown> };
}) {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signTransaction } = useSignTransaction();

  const address = currentAccount?.address || null;
  const isConnected = !!currentAccount;

  const signAndExecute = useCallback(async (tx: unknown) => {
    if (!address) throw new Error("Wallet not connected");
    return await signTransaction({ transaction: tx });
  }, [address, signTransaction]);

  return (
    <SuiWalletContext.Provider
      value={{
        address,
        isConnected,
        isConnecting: false,
        signAndExecute,
      }}
    >
      {children}
    </SuiWalletContext.Provider>
  );
}

// Dynamic import wrapper for dapp-kit components
export function SuiWalletProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [dappKit, setDappKit] = useState<DappKitModule | null>(null);
  const [reactQuery, setReactQuery] = useState<ReactQueryModule | null>(null);

  useEffect(() => {
    Promise.all([
      import("@mysten/dapp-kit"),
      import("@tanstack/react-query"),
    ]).then(([dappKitMod, reactQueryMod]) => {
      setDappKit(dappKitMod as unknown as DappKitModule);
      setReactQuery(reactQueryMod as unknown as ReactQueryModule);
      setMounted(true);
    });
  }, []);

  if (!mounted || !dappKit || !reactQuery) {
    return <>{children}</>;
  }

  const { createNetworkConfig, SuiClientProvider, WalletProvider, useCurrentAccount, useSignTransaction } = dappKit;
  const { QueryClientProvider, QueryClient } = reactQuery;

  const { networkConfig } = createNetworkConfig({
    testnet: {
      url: "https://fullnode.testnet.sui.io:443",
      network: "testnet",
    },
    mainnet: {
      url: "https://fullnode.mainnet.sui.io:443",
      network: "mainnet",
    },
  });

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <SuiWalletStateInner
            useCurrentAccount={useCurrentAccount}
            useSignTransaction={useSignTransaction}
          >
            {children}
          </SuiWalletStateInner>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

// ConnectButton component
export function SuiConnectButton() {
  const [mounted, setMounted] = useState(false);
  const [ConnectButtonComp, setConnectButtonComp] = useState<ComponentType | null>(null);

  useEffect(() => {
    import("@mysten/dapp-kit").then((mod) => {
      setConnectButtonComp(() => mod.ConnectButton);
      setMounted(true);
    });
  }, []);

  if (!mounted || !ConnectButtonComp) {
    return (
      <button className="flex items-center gap-2 px-3 py-2 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-xs font-medium">
        Connect Sui
      </button>
    );
  }

  return <ConnectButtonComp />;
}

// ConnectModal wrapper
export function SuiConnectModal({ trigger }: { trigger: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [ConnectModalComp, setConnectModalComp] = useState<ComponentType<{ trigger: ReactNode }> | null>(null);

  useEffect(() => {
    import("@mysten/dapp-kit").then((mod) => {
      setConnectModalComp(() => mod.ConnectModal);
      setMounted(true);
    });
  }, []);

  if (!mounted || !ConnectModalComp) {
    return <>{trigger}</>;
  }

  return <ConnectModalComp trigger={trigger} />;
}
