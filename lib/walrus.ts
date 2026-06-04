// Dataset utilities for Walrus integration

import type { Dataset } from "@/types";

// Fallback chain: testnet first (mainnet not live yet)
export const WALRUS_AGGREGATOR_URLS = [
  "https://aggregator.walrus-testnet.walrus.space",
];

export const TATUM_DATASETS: Dataset[] = [
  {
    id: "btc-full-history",
    name: "Bitcoin Full Transaction History",
    chain: "Bitcoin",
    chainIcon: "₿",
    chainColor: "#F7931A",
    description:
      "Complete Bitcoin blockchain transaction history from genesis block to present. Includes all inputs, outputs, fees, and block metadata.",
    size: "~4 TB",
    format: "Parquet",
    timeRange: "2009 – Present",
    rowCount: "850M+ transactions",
    blobId: "pending", // To be updated with actual blob ID from Tatum Discord
    tags: ["bitcoin", "transactions", "UTXO", "historical"],
    lastUpdated: "2026-05-20",
  },
  {
    id: "eth-full-history",
    name: "Ethereum Transaction Dataset",
    chain: "Ethereum",
    chainIcon: "⟠",
    chainColor: "#627EEA",
    description:
      "Full Ethereum mainnet transaction history including internal transactions, token transfers (ERC-20, ERC-721), and smart contract events.",
    size: "~5 TB",
    format: "Parquet",
    timeRange: "2015 – Present",
    rowCount: "2.5B+ transactions",
    blobId: "pending",
    tags: ["ethereum", "ERC-20", "DeFi", "NFT", "historical"],
    lastUpdated: "2026-05-20",
  },
  {
    id: "bnb-full-history",
    name: "BNB Smart Chain History",
    chain: "BNB Chain",
    chainIcon: "◈",
    chainColor: "#F3BA2F",
    description:
      "BNB Smart Chain complete transaction and block history. Includes PancakeSwap, Venus Protocol, and all major BSC DeFi activity.",
    size: "~1.5 TB",
    format: "Parquet",
    timeRange: "2020 – Present",
    rowCount: "3B+ transactions",
    blobId: "pending",
    tags: ["BSC", "BNB", "DeFi", "PancakeSwap", "historical"],
    lastUpdated: "2026-05-19",
  },
  {
    id: "crypto-price-ohlcv",
    name: "Crypto Price OHLCV – 4 Years",
    chain: "Multi-Chain",
    chainIcon: "📈",
    chainColor: "#2CCD9A",
    description:
      "4 years of 1-minute OHLCV (Open, High, Low, Close, Volume) candle data for Bitcoin, Ethereum, BNB, Sui, and 50+ cryptocurrencies.",
    size: "~500 GB",
    format: "CSV",
    timeRange: "2022 – Present",
    rowCount: "210M+ candles",
    blobId: "pending",
    tags: ["price", "OHLCV", "trading", "BTC", "ETH", "SUI", "historical"],
    lastUpdated: "2026-05-25",
  },
  {
    id: "sui-transactions",
    name: "Sui Network Transactions",
    chain: "Sui",
    chainIcon: "◎",
    chainColor: "#4CA3FF",
    description:
      "Sui blockchain transaction data including Move smart contract interactions, coin transfers, NFT mints, and DeFi protocol activity.",
    size: "~80 GB",
    format: "Parquet",
    timeRange: "2023 – Present",
    rowCount: "420M+ transactions",
    blobId: "pending",
    tags: ["Sui", "Move", "NFT", "DeFi", "CETUS", "historical"],
    lastUpdated: "2026-05-24",
  },
  {
    id: "defi-protocols",
    name: "Cross-Chain DeFi Protocol Data",
    chain: "Multi-Chain",
    chainIcon: "⚡",
    chainColor: "#9B8BFF",
    description:
      "Aggregated DeFi protocol metrics across Ethereum, BSC, and Sui — TVL history, swap volumes, liquidity pool data, and yield rates.",
    size: "~120 GB",
    format: "CSV",
    timeRange: "2021 – Present",
    rowCount: "50M+ data points",
    blobId: "pending",
    tags: ["DeFi", "TVL", "liquidity", "Uniswap", "CETUS", "historical"],
    lastUpdated: "2026-05-22",
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
