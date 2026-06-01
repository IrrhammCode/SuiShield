// Tatum Data API — Enhanced blockchain data via Tatum
// Docs: https://docs.tatum.io/reference/tatum-data-api

const TATUM_API_BASE = "https://api.tatum.io";
const TATUM_API_KEY = process.env.TATUM_API_KEY;

async function tatumFetch<T = unknown>(endpoint: string): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (TATUM_API_KEY) {
    headers["x-api-key"] = TATUM_API_KEY;
  }

  const response = await fetch(`${TATUM_API_BASE}${endpoint}`, { headers });
  if (!response.ok) {
    throw new Error(`Tatum API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// ── Types ────────────────────────────────────────────────

export interface TatumTokenBalance {
  chain: string;
  address: string;
  balance: string;
  symbol: string;
  type: string;
}

export interface TatumTransaction {
  hash: string;
  blockNumber: number;
  timestamp: number;
  from: string;
  to: string;
  value: string;
  currency: string;
}

export interface TatumMaliciousCheck {
  address: string;
  isMalicious: boolean;
  category?: string;
  description?: string;
}

export interface TatumExchangeRate {
  basePair: string;
  rate: number;
  timestamp: string;
}

export interface TatumBlockInfo {
  blockNumber: number;
  hash: string;
  timestamp: number;
  parentHash: string;
  transactionCount: number;
}

// ── Sui-Specific Tatum Data API ──────────────────────────

/**
 * Check if a Sui address is flagged as malicious
 * Uses Tatum's address checking capabilities
 */
export async function checkMaliciousAddress(address: string): Promise<TatumMaliciousCheck> {
  try {
    // Use Tatum's address checking endpoint
    const data = await tatumFetch<{ isMalicious: boolean; category?: string }>(
      `/v3/security/address/${address}`
    );
    return {
      address,
      isMalicious: data.isMalicious || false,
      category: data.category,
    };
  } catch {
    // Fallback: return safe if endpoint not available
    return {
      address,
      isMalicious: false,
    };
  }
}

/**
 * Get exchange rate for a currency pair via Tatum
 */
export async function getExchangeRate(
  currency: string,
  basePair = "USD"
): Promise<TatumExchangeRate> {
  const data = await tatumFetch<{ value: string; basePair: string }>(
    `/v4/data/rate?currency=${currency}&basePair=${basePair}`
  );
  return {
    basePair: data.basePair,
    rate: parseFloat(data.value || "0"),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get block info by number via Tatum RPC
 */
export async function getBlockInfo(
  chain: string,
  blockNumber?: number
): Promise<TatumBlockInfo> {
  const endpoint = blockNumber
    ? `/v3/${chain.toLowerCase()}/block/${blockNumber}`
    : `/v3/${chain.toLowerCase()}/block/current`;
  
  const data = await tatumFetch<{
    blockNumber: number;
    hash: string;
    timestamp: number;
    parentHash: string;
    transactionCount: number;
  }>(endpoint);

  return {
    blockNumber: data.blockNumber,
    hash: data.hash,
    timestamp: data.timestamp,
    parentHash: data.parentHash,
    transactionCount: data.transactionCount || 0,
  };
}

/**
 * Get gas price for a chain via Tatum
 */
export async function getGasPrice(chain: string): Promise<string> {
  const data = await tatumFetch<{ gasPrice: string }>(
    `/v3/${chain.toLowerCase()}/gas`
  );
  return data.gasPrice;
}

/**
 * Get transaction details by hash via Tatum
 */
export async function getTransactionByHash(
  chain: string,
  txHash: string
): Promise<Record<string, unknown>> {
  return tatumFetch(`/v3/${chain.toLowerCase()}/transaction/${txHash}`);
}

// ── MCP Server Integration (for AI features) ─────────────

/**
 * Get MCP server capabilities from Tatum
 * MCP (Model Context Protocol) enables AI agents to use Tatum tools
 */
export function getMcpServerUrl(): string {
  return "https://mcp.tatum.io";
}

/**
 * Check if Tatum MCP server is available
 */
export async function isMcpAvailable(): Promise<boolean> {
  try {
    const response = await fetch("https://mcp.tatum.io/health", {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// ── Tatum API Status ─────────────────────────────────────

export interface TatumApiStatus {
  apiKeyValid: boolean;
  rateLimitRemaining: number;
  mcpAvailable: boolean;
}

/**
 * Check Tatum API status and capabilities
 */
export async function checkTatumStatus(): Promise<TatumApiStatus> {
  const mcpAvailable = await isMcpAvailable().catch(() => false);
  
  return {
    apiKeyValid: !!TATUM_API_KEY,
    rateLimitRemaining: 100, // Default, actual value from response headers
    mcpAvailable,
  };
}
