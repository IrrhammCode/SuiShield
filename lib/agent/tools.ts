import {
  getAddressBalance,
  getAddressTransactions,
  getCurrentRate,
  getGasPrice,
  getBlockNumber,
  getTransactionByHash,
  getBlockByNumber,
} from "@/lib/tatum";
import { TATUM_DATASETS } from "@/lib/walrus";

// ── Tool Result Types ─────────────────────────────────────

export interface ToolResult {
  tool: string;
  success: boolean;
  data: unknown;
  error?: string;
  duration: number;
}

// ── Chain Normalization ───────────────────────────────────

const CHAIN_ALIASES: Record<string, string> = {
  eth: "ethereum",
  btc: "bitcoin",
  bnb: "bsc",
  matic: "polygon",
  avax: "avalanche",
};

function normalizeChain(chain: string): string {
  return CHAIN_ALIASES[chain.toLowerCase()] || chain.toLowerCase();
}

// ── Address Extraction ────────────────────────────────────

export function extractAddress(text: string): string | null {
  const match = text.match(/0x[a-fA-F0-9]{40}/);
  return match ? match[0] : null;
}

export function extractTxHash(text: string): string | null {
  const match = text.match(/0x[a-fA-F0-9]{64}/);
  return match ? match[0] : null;
}

export function detectChain(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("bitcoin") || lower.includes("btc")) return "bitcoin";
  if (lower.includes("polygon") || lower.includes("matic")) return "polygon";
  if (lower.includes("bsc") || lower.includes("bnb") || lower.includes("binance")) return "bsc";
  if (lower.includes("arbitrum")) return "arbitrum";
  if (lower.includes("optimism")) return "optimism";
  if (lower.includes("avalanche") || lower.includes("avax")) return "avalanche";
  return "ethereum";
}

export function detectSymbol(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("bitcoin") || lower.includes("btc")) return "BTC";
  if (lower.includes("ethereum") || lower.includes("eth")) return "ETH";
  if (lower.includes("sui")) return "SUI";
  if (lower.includes("bnb") || lower.includes("binance")) return "BNB";
  if (lower.includes("polygon") || lower.includes("matic")) return "MATIC";
  if (lower.includes("solana") || lower.includes("sol")) return "SOL";
  return "ETH";
}

// ── Agent Tools ───────────────────────────────────────────

export async function toolGetWalletBalance(
  chain: string,
  address: string
): Promise<ToolResult> {
  const start = Date.now();
  try {
    const normalizedChain = normalizeChain(chain);
    const balance = await getAddressBalance(normalizedChain, address);
    return {
      tool: "getWalletBalance",
      success: true,
      data: balance,
      duration: Date.now() - start,
    };
  } catch (e: unknown) {
    return {
      tool: "getWalletBalance",
      success: false,
      data: null,
      error: e instanceof Error ? e.message : String(e),
      duration: Date.now() - start,
    };
  }
}

export async function toolGetTransactionHistory(
  chain: string,
  address: string,
  pageSize = 10
): Promise<ToolResult> {
  const start = Date.now();
  try {
    const normalizedChain = normalizeChain(chain);
    const txs = await getAddressTransactions(normalizedChain, address, { pageSize });
    return {
      tool: "getTransactionHistory",
      success: true,
      data: txs,
      duration: Date.now() - start,
    };
  } catch (e: unknown) {
    return {
      tool: "getTransactionHistory",
      success: false,
      data: null,
      error: e instanceof Error ? e.message : String(e),
      duration: Date.now() - start,
    };
  }
}

export async function toolGetPrice(
  symbol: string,
  base = "USD"
): Promise<ToolResult> {
  const start = Date.now();
  try {
    const rate = await getCurrentRate(symbol, base);
    return {
      tool: "getPrice",
      success: true,
      data: rate,
      duration: Date.now() - start,
    };
  } catch (e: unknown) {
    return {
      tool: "getPrice",
      success: false,
      data: null,
      error: e instanceof Error ? e.message : String(e),
      duration: Date.now() - start,
    };
  }
}

export async function toolGetGasPrice(chain: string): Promise<ToolResult> {
  const start = Date.now();
  try {
    const normalizedChain = normalizeChain(chain);
    const gas = await getGasPrice(normalizedChain);
    return {
      tool: "getGasPrice",
      success: true,
      data: gas,
      duration: Date.now() - start,
    };
  } catch (e: unknown) {
    return {
      tool: "getGasPrice",
      success: false,
      data: null,
      error: e instanceof Error ? e.message : String(e),
      duration: Date.now() - start,
    };
  }
}

export async function toolGetBlockInfo(
  chain: string,
  blockNumber?: string | number
): Promise<ToolResult> {
  const start = Date.now();
  try {
    const normalizedChain = normalizeChain(chain);
    if (blockNumber) {
      const block = await getBlockByNumber(normalizedChain, blockNumber);
      return {
        tool: "getBlockInfo",
        success: true,
        data: block,
        duration: Date.now() - start,
      };
    }
    const blockNum = await getBlockNumber(normalizedChain);
    return {
      tool: "getBlockInfo",
      success: true,
      data: { latestBlock: blockNum },
      duration: Date.now() - start,
    };
  } catch (e: unknown) {
    return {
      tool: "getBlockInfo",
      success: false,
      data: null,
      error: e instanceof Error ? e.message : String(e),
      duration: Date.now() - start,
    };
  }
}

export async function toolGetTransactionByHash(
  chain: string,
  txHash: string
): Promise<ToolResult> {
  const start = Date.now();
  try {
    const normalizedChain = normalizeChain(chain);
    const tx = await getTransactionByHash(normalizedChain, txHash);
    return {
      tool: "getTransactionByHash",
      success: true,
      data: tx,
      duration: Date.now() - start,
    };
  } catch (e: unknown) {
    return {
      tool: "getTransactionByHash",
      success: false,
      data: null,
      error: e instanceof Error ? e.message : String(e),
      duration: Date.now() - start,
    };
  }
}

export async function toolSearchDatasets(query: string): Promise<ToolResult> {
  const start = Date.now();
  try {
    const lower = query.toLowerCase();
    const results = TATUM_DATASETS.filter(
      (ds) =>
        ds.name.toLowerCase().includes(lower) ||
        ds.chain.toLowerCase().includes(lower) ||
        ds.tags.some((t) => t.toLowerCase().includes(lower)) ||
        ds.description.toLowerCase().includes(lower)
    );
    return {
      tool: "searchDatasets",
      success: true,
      data: results.map((ds) => ({
        id: ds.id,
        name: ds.name,
        chain: ds.chain,
        size: ds.size,
        format: ds.format,
        tags: ds.tags,
      })),
      duration: Date.now() - start,
    };
  } catch (e: unknown) {
    return {
      tool: "searchDatasets",
      success: false,
      data: null,
      error: e instanceof Error ? e.message : String(e),
      duration: Date.now() - start,
    };
  }
}

// ── Intent Detection ──────────────────────────────────────

export type AgentIntent =
  | "wallet_balance"
  | "wallet_transactions"
  | "wallet_security"
  | "price"
  | "gas"
  | "block"
  | "transaction_lookup"
  | "dataset_search"
  | "general";

export function detectIntent(message: string): AgentIntent {
  const lower = message.toLowerCase();

  if (extractTxHash(message)) return "transaction_lookup";

  if (
    lower.match(/0x[a-fA-F0-9]{40}/) &&
    (lower.includes("safe") || lower.includes("scam") || lower.includes("malicious") || lower.includes("risk") || lower.includes("security"))
  ) {
    return "wallet_security";
  }

  if (lower.match(/0x[a-fA-F0-9]{40}/) && (lower.includes("balance") || lower.includes("wallet") || lower.includes("address"))) {
    return "wallet_balance";
  }

  if (lower.match(/0x[a-fA-F0-9]{40}/) && (lower.includes("transaction") || lower.includes("tx") || lower.includes("history"))) {
    return "wallet_transactions";
  }

  if (lower.match(/0x[a-fA-F0-9]{40}/)) {
    return "wallet_balance";
  }

  if (lower.includes("price") || lower.includes("rate") || lower.includes("how much")) {
    return "price";
  }

  if (lower.includes("gas")) return "gas";
  if (lower.includes("block")) return "block";

  if (lower.includes("dataset") || lower.includes("data") || lower.includes("walrus")) {
    return "dataset_search";
  }

  return "general";
}
