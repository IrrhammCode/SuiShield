"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, ComponentType } from "react";

// ── DappKit readiness context ──────────────────────────────
// Lets child components know when WalletProvider is available
const DappKitReadyContext = createContext<boolean>(false);
function useDappKitReady() {
  return useContext(DappKitReadyContext);
}

// ── Wallet state context ───────────────────────────────────
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

// ── DappKit types ─────────────────────────────────────────
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

// ── Shared dapp-kit loader ─────────────────────────────────
// Single place to load dapp-kit so all components share the same state
let _dappKitPromise: Promise<{ dappKit: DappKitModule; reactQuery: ReactQueryModule }> | null = null;

function loadDappKit() {
  if (!_dappKitPromise) {
    _dappKitPromise = Promise.all([
      import("@mysten/dapp-kit"),
      import("@tanstack/react-query"),
    ]).then(([dappKitMod, reactQueryMod]) => ({
      dappKit: dappKitMod as unknown as DappKitModule,
      reactQuery: reactQueryMod as unknown as ReactQueryModule,
    }));
  }
  return _dappKitPromise;
}

// ── Wallet state provider ──────────────────────────────────
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
    <SuiWalletContext.Provider value={{ address, isConnected, isConnecting: false, signAndExecute }}>
      {children}
    </SuiWalletContext.Provider>
  );
}

// ── Loaded provider ────────────────────────────────────────
function SuiWalletLoaded({ children, dappKit, reactQuery }: {
  children: ReactNode;
  dappKit: DappKitModule;
  reactQuery: ReactQueryModule;
}) {
  const { createNetworkConfig, SuiClientProvider, WalletProvider, useCurrentAccount, useSignTransaction } = dappKit;
  const { QueryClientProvider, QueryClient } = reactQuery;

  const { networkConfig } = createNetworkConfig({
    testnet: { url: "https://fullnode.testnet.sui.io:443", network: "testnet" },
    mainnet: { url: "https://fullnode.mainnet.sui.io:443", network: "mainnet" },
  });

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <DappKitReadyContext.Provider value={true}>
            <SuiWalletStateInner useCurrentAccount={useCurrentAccount} useSignTransaction={useSignTransaction}>
              {children}
            </SuiWalletStateInner>
          </DappKitReadyContext.Provider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

// ── Inner loader ───────────────────────────────────────────
function SuiWalletInner({ children }: { children: ReactNode }) {
  const [dappKit, setDappKit] = useState<DappKitModule | null>(null);
  const [reactQuery, setReactQuery] = useState<ReactQueryModule | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadDappKit().then(({ dappKit: dk, reactQuery: rq }) => {
      setDappKit(dk);
      setReactQuery(rq);
      setLoaded(true);
    });
  }, []);

  if (!loaded || !dappKit || !reactQuery) {
    return <>{children}</>;
  }

  return <SuiWalletLoaded dappKit={dappKit} reactQuery={reactQuery}>{children}</SuiWalletLoaded>;
}

// ── Public provider ────────────────────────────────────────
export function SuiWalletProvider({ children }: { children: ReactNode }) {
  return <SuiWalletInner>{children}</SuiWalletInner>;
}

// ── ConnectButton ──────────────────────────────────────────
export function SuiConnectButton() {
  const ready = useDappKitReady();
  const [Comp, setComp] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (ready) {
      loadDappKit().then(({ dappKit }) => setComp(() => dappKit.ConnectButton));
    }
  }, [ready]);

  if (!ready || !Comp) {
    return (
      <button className="flex items-center gap-2 px-3 py-2 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-xs font-medium">
        Connect Sui
      </button>
    );
  }

  return <Comp />;
}

// ── ConnectModal ───────────────────────────────────────────
export function SuiConnectModal({ trigger }: { trigger: ReactNode }) {
  const ready = useDappKitReady();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [Comp, setComp] = useState<any>(null);

  useEffect(() => {
    if (ready) {
      loadDappKit().then(({ dappKit }) => setComp(() => dappKit.ConnectModal));
    }
  }, [ready]);

  if (!ready || !Comp) {
    return <>{trigger}</>;
  }

  return <Comp trigger={trigger} />;
}
