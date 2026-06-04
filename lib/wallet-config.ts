// Pre-init must be imported BEFORE @reown/appkit to suppress extension errors
import "./pre-init";

import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import type { CaipNetwork } from "@reown/appkit-common";

// 1. Get a project ID at https://cloud.reown.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "b56e18d47c72ab683b10814fe9495694";

// 2. Define supported networks
const ethereum: CaipNetwork = {
  id: "eip155:1",
  chainId: 1,
  chainNamespace: "eip155",
  name: "Ethereum",
  currency: "ETH",
  explorerUrl: "https://etherscan.io",
  rpcUrl: "https://eth.llamarpc.com",
};

const arbitrum: CaipNetwork = {
  id: "eip155:42161",
  chainId: 42161,
  chainNamespace: "eip155",
  name: "Arbitrum",
  currency: "ETH",
  explorerUrl: "https://arbiscan.io",
  rpcUrl: "https://arb1.arbitrum.io/rpc",
};

const optimism: CaipNetwork = {
  id: "eip155:10",
  chainId: 10,
  chainNamespace: "eip155",
  name: "Optimism",
  currency: "ETH",
  explorerUrl: "https://optimistic.etherscan.io",
  rpcUrl: "https://mainnet.optimism.io",
};

const polygon: CaipNetwork = {
  id: "eip155:137",
  chainId: 137,
  chainNamespace: "eip155",
  name: "Polygon",
  currency: "MATIC",
  explorerUrl: "https://polygonscan.com",
  rpcUrl: "https://polygon-rpc.com",
};

const base: CaipNetwork = {
  id: "eip155:8453",
  chainId: 8453,
  chainNamespace: "eip155",
  name: "Base",
  currency: "ETH",
  explorerUrl: "https://basescan.org",
  rpcUrl: "https://mainnet.base.org",
};

const sepolia: CaipNetwork = {
  id: "eip155:11155111",
  chainId: 11155111,
  chainNamespace: "eip155",
  name: "Sepolia",
  currency: "ETH",
  explorerUrl: "https://sepolia.etherscan.io",
  rpcUrl: "https://rpc.sepolia.org",
};

export const networks = [ethereum, arbitrum, optimism, polygon, base, sepolia];

// 3. Set up the metadata
const metadata = {
  name: "ChainLens AI",
  description: "On-Chain Analytics Powered by AI",
  url: "https://chainlens.ai",
  icons: ["https://chainlens.ai/icon.png"],
};

// 4. Create the AppKit instance
let appKit: ReturnType<typeof createAppKit> | undefined;
try {
  appKit = createAppKit({
    adapters: [new EthersAdapter()],
    networks,
    metadata,
    projectId,
    themeMode: "dark",
    themeVariables: {
      "--w3m-accent": "#4F37FD",
      "--w3m-border-radius-master": "8px",
    },
  });
} catch (e) {
  // AppKit initialization may fail in dev mode without WalletConnect project ID
  console.warn("AppKit initialization skipped:", e);
}

export { appKit };
