/**
 * Tatum SDK singleton for browser-based wallet interactions.
 * Uses MetaMask wallet provider for connect/disconnect/balance operations.
 */

// Wallet state types
export interface WalletState {
  address: string | undefined;
  isConnected: boolean;
  balance: string | undefined;
  chainId: number | undefined;
}

// Check if MetaMask or any EIP-1193 provider is available
export function hasInjectedProvider(): boolean {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
}

// Connect to MetaMask / injected wallet
export async function connectWallet(): Promise<string> {
  if (!hasInjectedProvider()) {
    throw new Error("No wallet extension detected. Please install MetaMask.");
  }

  const accounts = await window.ethereum!.request<string[]>({
    method: "eth_requestAccounts",
  });

  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts returned from wallet.");
  }

  return accounts[0]!;
}

// Get currently connected accounts (without prompting)
export async function getConnectedAccounts(): Promise<string[]> {
  if (!hasInjectedProvider()) return [];

  try {
    const accounts = await window.ethereum!.request<string[]>({
      method: "eth_accounts",
    });
    return accounts || [];
  } catch {
    return [];
  }
}

// Get ETH balance for an address
export async function getBalance(address: string): Promise<string> {
  if (!hasInjectedProvider()) return "0";

  try {
    const balanceHex = await window.ethereum!.request<string>({
      method: "eth_getBalance",
      params: [address, "latest"],
    });

    if (!balanceHex) return "0";

    // Convert from wei (hex) to ETH
    const balanceWei = BigInt(balanceHex);
    const ethBalance = Number(balanceWei) / 1e18;
    return ethBalance.toFixed(4);
  } catch {
    return "0";
  }
}

// Get chain ID
export async function getChainId(): Promise<number | undefined> {
  if (!hasInjectedProvider()) return undefined;

  try {
    const chainIdHex = await window.ethereum!.request<string>({
      method: "eth_chainId",
    });
    return chainIdHex ? parseInt(chainIdHex, 16) : undefined;
  } catch {
    return undefined;
  }
}

// Subscribe to account changes
export function onAccountsChanged(callback: (accounts: string[]) => void): () => void {
  if (!hasInjectedProvider()) return () => {};

  const handler = (accounts: unknown) => {
    callback(accounts as string[]);
  };

  window.ethereum!.on("accountsChanged", handler);
  return () => {
    window.ethereum!.removeListener("accountsChanged", handler);
  };
}

// Subscribe to chain changes
export function onChainChanged(callback: (chainId: number) => void): () => void {
  if (!hasInjectedProvider()) return () => {};

  const handler = (chainIdHex: unknown) => {
    callback(parseInt(chainIdHex as string, 16));
  };

  window.ethereum!.on("chainChanged", handler);
  return () => {
    window.ethereum!.removeListener("chainChanged", handler);
  };
}

// Ethereum provider type declaration
declare global {
  interface Window {
    ethereum?: {
      request: <T = unknown>(args: { method: string; params?: unknown[] }) => Promise<T>;
      on: (event: string, handler: (data: unknown) => void) => void;
      removeListener: (event: string, handler: (data: unknown) => void) => void;
      isMetaMask?: boolean;
    };
  }
}
