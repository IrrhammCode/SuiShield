"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  connectWallet as connectWalletFn,
  getConnectedAccounts,
  getBalance,
  getChainId,
  onAccountsChanged,
  onChainChanged,
  hasInjectedProvider,
} from "@/lib/wallet";

// ——— Context Types ———

interface WalletContextValue {
  address: string | undefined;
  isConnected: boolean;
  balance: string | undefined;
  chainId: number | undefined;
  hasProvider: boolean;
  isConnecting: boolean;
  error: string | undefined;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue>({
  address: undefined,
  isConnected: false,
  balance: undefined,
  chainId: undefined,
  hasProvider: false,
  isConnecting: false,
  error: undefined,
  connect: async () => {},
  disconnect: () => {},
});

export function useWallet() {
  return useContext(WalletContext);
}

// ——— Provider Component ———

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [balance, setBalance] = useState<string | undefined>(undefined);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [hasProvider, setHasProvider] = useState(false);

  const isConnected = !!address;

  // Check for injected provider on mount to avoid hydration mismatch
  useEffect(() => {
    // Run asynchronously to avoid the synchronous setState within effect lint warning
    Promise.resolve().then(() => {
      setHasProvider(hasInjectedProvider());
    });
  }, []);

  // Fetch balance whenever address changes
  useEffect(() => {
    if (!address) return;

    let cancelled = false;

    const fetchBalance = async () => {
      const bal = await getBalance(address);
      if (!cancelled) setBalance(bal);
    };

    fetchBalance();

    // Refresh balance every 30 seconds
    const interval = setInterval(fetchBalance, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [address]);

  // Fetch chain ID and subscribe to changes
  useEffect(() => {
    getChainId().then(setChainId);

    const unsubChain = onChainChanged((newChainId) => {
      setChainId(newChainId);
    });

    return unsubChain;
  }, []);

  // Auto-reconnect if previously connected
  useEffect(() => {
    const autoReconnect = async () => {
      const accounts = await getConnectedAccounts();
      if (accounts.length > 0) {
        setAddress(accounts[0]);
      }
    };

    autoReconnect();
  }, []);

  // Listen for account changes (user switches account in MetaMask)
  useEffect(() => {
    const unsub = onAccountsChanged((accounts) => {
      if (accounts.length === 0) {
        // User disconnected from MetaMask
        setAddress(undefined);
        setBalance(undefined);
      } else {
        setAddress(accounts[0]);
      }
    });

    return unsub;
  }, []);

  // ——— Actions ———

  const connect = useCallback(async () => {
    setError(undefined);
    setIsConnecting(true);

    try {
      const addr = await connectWalletFn();
      setAddress(addr);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to connect wallet";
      setError(message);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(undefined);
    setBalance(undefined);
    setError(undefined);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        balance,
        chainId,
        hasProvider,
        isConnecting,
        error,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
