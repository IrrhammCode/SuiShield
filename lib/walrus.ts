// Dataset utilities for Walrus integration

import type { Dataset } from "@/types";

// Walrus mainnet aggregator (Tatum publishes here)
export const WALRUS_AGGREGATOR_URLS = [
  "https://aggregator.walrus-mainnet.walrus.space",
];

// Working Walrus mainnet blob IDs (regular blobs, not quilts)
const BLOB_OHLCV = "lOkowvjr-tKj1N8oiQiBSbkNZjQkScrXKircwEW0DCg";
const BLOB_SUI = "fCM9Oo6QcoakdF7h81pK22KA_1l2pRb5eC7h8exxKFk";
const BLOB_A = "s3bvi9zHs5tw3mW_q_EGdhEI84IvsVedCIqpgRzBC-Y";
const BLOB_B = "FelM02u30o_COlk_qI-CplhTbCcEeEA3x3a1pXdDKPg";
const BLOB_C = "gPPfZSZimicrZAW0DRO5fQnn_fW6DQ_gHModLoCM3dA";
const BLOB_D = "UfyxGqkicbqMkskER1VdDBVyGIfs0eyg1PB5Pc7x4xU";

export const TATUM_DATASETS: Dataset[] = [
  // ── 1-6: Primary chain datasets ─────────────────────────
  {
    id: "btc-full-history",
    name: "Bitcoin Full Transaction History",
    chain: "Bitcoin",
    chainIcon: "bitcoin",
    chainColor: "#F7931A",
    description: "Complete Bitcoin blockchain transaction history from genesis block to present. Includes all inputs, outputs, fees, and block metadata.",
    size: "~4 TB", format: "Parquet", timeRange: "2009 – Present", rowCount: "850M+ transactions",
    blobId: BLOB_A,
    tags: ["bitcoin", "transactions", "UTXO", "historical"], lastUpdated: "2026-06-01",
  },
  {
    id: "eth-full-history",
    name: "Ethereum Transaction Dataset",
    chain: "Ethereum",
    chainIcon: "ethereum",
    chainColor: "#627EEA",
    description: "Full Ethereum mainnet transaction history including internal transactions, token transfers (ERC-20, ERC-721), and smart contract events.",
    size: "~5 TB", format: "Parquet", timeRange: "2015 – Present", rowCount: "2.5B+ transactions",
    blobId: BLOB_B,
    tags: ["ethereum", "ERC-20", "DeFi", "NFT", "historical"], lastUpdated: "2026-06-01",
  },
  {
    id: "bnb-full-history",
    name: "BNB Smart Chain History",
    chain: "BNB Chain",
    chainIcon: "bnb",
    chainColor: "#F3BA2F",
    description: "BNB Smart Chain complete transaction and block history. Includes PancakeSwap, Venus Protocol, and all major BSC DeFi activity.",
    size: "~1.5 TB", format: "Parquet", timeRange: "2020 – Present", rowCount: "3B+ transactions",
    blobId: BLOB_C,
    tags: ["BSC", "BNB", "DeFi", "PancakeSwap", "historical"], lastUpdated: "2026-06-01",
  },
  {
    id: "crypto-price-ohlcv",
    name: "Crypto Price OHLCV – 4 Years",
    chain: "Multi-Chain",
    chainIcon: "chart",
    chainColor: "#2CCD9A",
    description: "4 years of 1-minute OHLCV (Open, High, Low, Close, Volume) candle data for Bitcoin, Ethereum, BNB, Sui, and 50+ cryptocurrencies.",
    size: "~500 GB", format: "CSV", timeRange: "2022 – Present", rowCount: "210M+ candles",
    blobId: BLOB_OHLCV,
    tags: ["price", "OHLCV", "trading", "BTC", "ETH", "SUI", "historical"], lastUpdated: "2026-06-01",
  },
  {
    id: "sui-transactions",
    name: "Sui Network Transactions",
    chain: "Sui",
    chainIcon: "sui",
    chainColor: "#4CA3FF",
    description: "Sui blockchain transaction data including Move smart contract interactions, coin transfers, NFT mints, and DeFi protocol activity.",
    size: "~80 GB", format: "Parquet", timeRange: "2023 – Present", rowCount: "420M+ transactions",
    blobId: BLOB_SUI,
    tags: ["Sui", "Move", "NFT", "DeFi", "CETUS", "historical"], lastUpdated: "2026-06-01",
  },
  {
    id: "defi-protocols",
    name: "Cross-Chain DeFi Protocol Data",
    chain: "Multi-Chain",
    chainIcon: "zap",
    chainColor: "#9B8BFF",
    description: "Aggregated DeFi protocol metrics across Ethereum, BSC, and Sui — TVL history, swap volumes, liquidity pool data, and yield rates.",
    size: "~120 GB", format: "CSV", timeRange: "2021 – Present", rowCount: "50M+ data points",
    blobId: BLOB_D,
    tags: ["DeFi", "TVL", "liquidity", "Uniswap", "CETUS", "historical"], lastUpdated: "2026-06-01",
  },
  // ── 7-20: Additional analytics datasets ─────────────────
  {
    id: "btc-blocks",
    name: "Bitcoin Block Headers",
    chain: "Bitcoin",
    chainIcon: "bitcoin",
    chainColor: "#F7931A",
    description: "All Bitcoin block headers with difficulty, nonce, merkle root, and timestamp data. Useful for chain analysis and mining statistics.",
    size: "~60 GB", format: "Parquet", timeRange: "2009 – Present", rowCount: "850K+ blocks",
    blobId: BLOB_A,
    tags: ["bitcoin", "blocks", "mining", "difficulty"], lastUpdated: "2026-06-01",
  },
  {
    id: "eth-contracts",
    name: "Ethereum Smart Contract Deployments",
    chain: "Ethereum",
    chainIcon: "ethereum",
    chainColor: "#627EEA",
    description: "All smart contract deployment transactions on Ethereum, including bytecode size, deployer address, and creation timestamp.",
    size: "~200 GB", format: "Parquet", timeRange: "2015 – Present", rowCount: "50M+ contracts",
    blobId: BLOB_B,
    tags: ["ethereum", "contracts", "deployment", "Solidity"], lastUpdated: "2026-06-01",
  },
  {
    id: "eth-token-transfers",
    name: "Ethereum ERC-20 Token Transfers",
    chain: "Ethereum",
    chainIcon: "ethereum",
    chainColor: "#627EEA",
    description: "Complete ERC-20 token transfer events across all Ethereum contracts. Includes token address, from/to, and value.",
    size: "~800 GB", format: "Parquet", timeRange: "2015 – Present", rowCount: "5B+ transfers",
    blobId: BLOB_B,
    tags: ["ethereum", "ERC-20", "tokens", "transfers"], lastUpdated: "2026-06-01",
  },
  {
    id: "sui-defi-tvl",
    name: "Sui DeFi TVL History",
    chain: "Sui",
    chainIcon: "sui",
    chainColor: "#4CA3FF",
    description: "Total Value Locked history for all Sui DeFi protocols including CETUS, Turbos, Scallop, and Navi.",
    size: "~15 GB", format: "CSV", timeRange: "2023 – Present", rowCount: "10M+ data points",
    blobId: BLOB_SUI,
    tags: ["Sui", "DeFi", "TVL", "CETUS"], lastUpdated: "2026-06-01",
  },
  {
    id: "sui-nft-mints",
    name: "Sui NFT Mint Events",
    chain: "Sui",
    chainIcon: "sui",
    chainColor: "#4CA3FF",
    description: "All NFT minting events on Sui including collection, creator, recipient, and metadata.",
    size: "~25 GB", format: "Parquet", timeRange: "2023 – Present", rowCount: "50M+ mints",
    blobId: BLOB_SUI,
    tags: ["Sui", "NFT", "minting", "digital art"], lastUpdated: "2026-06-01",
  },
  {
    id: "bnb-defi-swaps",
    name: "BSC DEX Swap History",
    chain: "BNB Chain",
    chainIcon: "bnb",
    chainColor: "#F3BA2F",
    description: "All decentralized exchange swaps on BSC including PancakeSwap, BiSwap, and other major DEXes.",
    size: "~500 GB", format: "Parquet", timeRange: "2020 – Present", rowCount: "10B+ swaps",
    blobId: BLOB_C,
    tags: ["BSC", "DEX", "swaps", "PancakeSwap"], lastUpdated: "2026-06-01",
  },
  {
    id: "cross-chain-bridges",
    name: "Cross-Chain Bridge Transactions",
    chain: "Multi-Chain",
    chainIcon: "bridge",
    chainColor: "#FF6B35",
    description: "Bridge transaction data across Ethereum, BSC, and Sui — Wormhole, LayerZero, and native bridges.",
    size: "~100 GB", format: "Parquet", timeRange: "2021 – Present", rowCount: "100M+ bridges",
    blobId: BLOB_D,
    tags: ["bridge", "cross-chain", "Wormhole", "LayerZero"], lastUpdated: "2026-06-01",
  },
  {
    id: "whale-tracker",
    name: "Whale Wallet Tracker",
    chain: "Multi-Chain",
    chainIcon: "whale",
    chainColor: "#1E90FF",
    description: "Transactions from top 1000 whale wallets across Bitcoin, Ethereum, and Sui. Track large movements and accumulation patterns.",
    size: "~80 GB", format: "Parquet", timeRange: "2020 – Present", rowCount: "200M+ transactions",
    blobId: BLOB_A,
    tags: ["whale", "tracking", "large transfers", "market signal"], lastUpdated: "2026-06-01",
  },
  {
    id: "gas-tracker",
    name: "Multi-Chain Gas Price History",
    chain: "Multi-Chain",
    chainIcon: "gas",
    chainColor: "#FFD700",
    description: "Historical gas prices across Ethereum, BSC, and Sui with block-level granularity. Optimize transaction timing.",
    size: "~30 GB", format: "CSV", timeRange: "2020 – Present", rowCount: "500M+ data points",
    blobId: BLOB_D,
    tags: ["gas", "fees", "optimization", "timing"], lastUpdated: "2026-06-01",
  },
  {
    id: "stablecoin-flows",
    name: "Stablecoin Flow Analysis",
    chain: "Multi-Chain",
    chainIcon: "dollar",
    chainColor: "#26A17B",
    description: "USDT, USDC, and DAI transfer flows across Ethereum, BSC, and Sui. Track stablecoin liquidity movements.",
    size: "~150 GB", format: "Parquet", timeRange: "2019 – Present", rowCount: "3B+ transfers",
    blobId: BLOB_B,
    tags: ["stablecoin", "USDT", "USDC", "liquidity"], lastUpdated: "2026-06-01",
  },
  {
    id: "dex-liquidity",
    name: "DEX Liquidity Pool Snapshots",
    chain: "Multi-Chain",
    chainIcon: "droplet",
    chainColor: "#00BFFF",
    description: "Hourly snapshots of liquidity pool states across Uniswap, PancakeSwap, and CETUS. TVL, volume, and fee data.",
    size: "~200 GB", format: "Parquet", timeRange: "2021 – Present", rowCount: "1B+ snapshots",
    blobId: BLOB_C,
    tags: ["DEX", "liquidity", "Uniswap", "CETUS"], lastUpdated: "2026-06-01",
  },
  {
    id: "address-labels",
    name: "Labeled Address Database",
    chain: "Multi-Chain",
    chainIcon: "tag",
    chainColor: "#9370DB",
    description: "Known address labels for exchanges, protocols, whales, and scam addresses across Bitcoin, Ethereum, and Sui.",
    size: "~5 GB", format: "CSV", timeRange: "2009 – Present", rowCount: "10M+ labels",
    blobId: BLOB_A,
    tags: ["labels", "addresses", "exchanges", "scam detection"], lastUpdated: "2026-06-01",
  },
  {
    id: "scam-addresses",
    name: "Known Scam Address Database",
    chain: "Multi-Chain",
    chainIcon: "alert",
    chainColor: "#FF4444",
    description: "Community-reported and verified scam addresses across all chains. Includes scam type, report count, and associated losses.",
    size: "~2 GB", format: "CSV", timeRange: "2018 – Present", rowCount: "500K+ addresses",
    blobId: BLOB_D,
    tags: ["scam", "security", "fraud", "risk"], lastUpdated: "2026-06-01",
  },
  {
    id: "market-sentiment",
    name: "On-Chain Market Sentiment Index",
    chain: "Multi-Chain",
    chainIcon: "bar-chart",
    chainColor: "#FF8C00",
    description: "Derived sentiment metrics from on-chain data — MVRV, NVT, exchange flows, and holder behavior patterns.",
    size: "~10 GB", format: "CSV", timeRange: "2018 – Present", rowCount: "20M+ data points",
    blobId: BLOB_OHLCV,
    tags: ["sentiment", "MVRV", "NVT", "analytics"], lastUpdated: "2026-06-01",
  },
];

export async function fetchBlobFromWalrus(blobId: string): Promise<ArrayBuffer> {
  const aggregator = WALRUS_AGGREGATOR_URLS[0];
  const url = `${aggregator}/v1/blobs/${blobId}`;

  const response = await fetch(url, {
    headers: { Accept: "*/*" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch blob ${blobId}: ${response.statusText}`);
  }

  return response.arrayBuffer();
}

// Fetch quilt patches list (for quilt-type blobs)
export async function fetchQuiltPatches(quiltId: string): Promise<Array<{ identifier: string; patch_id: string; tags: Record<string, string> }>> {
  const aggregator = WALRUS_AGGREGATOR_URLS[0];
  const url = `${aggregator}/v1/quilts/${quiltId}/patches`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch quilt patches: ${response.statusText}`);
  }

  return response.json();
}

// Fetch a single blob from a quilt by patch ID
export async function fetchQuiltPatch(patchId: string): Promise<ArrayBuffer> {
  const aggregator = WALRUS_AGGREGATOR_URLS[0];
  const url = `${aggregator}/v1/blobs/by-quilt-patch-id/${patchId}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch quilt patch ${patchId}: ${response.statusText}`);
  }

  return response.arrayBuffer();
}

export function formatBlobId(blobId: string): string {
  if (!blobId || blobId === "pending") return "Pending...";
  if (blobId.length > 20) {
    return `${blobId.slice(0, 8)}...${blobId.slice(-6)}`;
  }
  return blobId;
}

export function getAggregatorUrl(blobId: string): string {
  return `${WALRUS_AGGREGATOR_URLS[0]}/v1/blobs/${blobId}`;
}
