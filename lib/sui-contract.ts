// SuiShield Trust Layer — Contract interaction utilities
// This module handles on-chain interactions with the SuiShield Move contract

import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { Transaction } from "@mysten/sui/transactions";
import { bcs } from "@mysten/sui/bcs";

const SUI_SHIELD_PACKAGE = process.env.NEXT_PUBLIC_SUI_SHIELD_PACKAGE || "";
const SUI_SHIELD_REGISTRY = process.env.NEXT_PUBLIC_SUI_SHIELD_REGISTRY || "";

// Default to testnet if not specified
const NETWORK = process.env.NEXT_PUBLIC_SUI_NETWORK || "testnet";

// Tatum Sui RPC endpoints
const TATUM_SUI_ENDPOINTS: Record<string, string> = {
  mainnet: "https://sui-mainnet.gateway.tatum.io",
  testnet: "https://sui-testnet.gateway.tatum.io",
  devnet: "https://sui-devnet.gateway.tatum.io",
};

const TATUM_API_KEY = process.env.TATUM_API_KEY;

export interface TrustScoreData {
  score: number;
  level: number;
  analysisBlob: string;
  timestamp: number;
}

export interface ScamReportData {
  reportedAddress: string;
  reportType: number;
  evidenceBlob: string;
  reporter: string;
  timestamp: number;
  verifications: string[];
  status: number;
}

// Trust level mapping
export const TRUST_LEVELS: Record<number, string> = {
  0: "safe",
  1: "low",
  2: "medium",
  3: "high",
};

// Report type mapping
export const REPORT_TYPES: Record<number, string> = {
  0: "Rug Pull",
  1: "Phishing",
  2: "Fake Token/Collection",
  3: "Other",
};

// Report status mapping
export const REPORT_STATUS: Record<number, string> = {
  0: "Pending",
  1: "Verified",
  2: "Disputed",
};

/**
 * Helper to get a configured SuiClient
 * @returns {SuiClient} A configured SuiClient instance
 */
export function getSuiClient(): SuiJsonRpcClient {
  // Use Tatum Sui RPC gateway for all networks
  const url = TATUM_SUI_ENDPOINTS[NETWORK] || TATUM_SUI_ENDPOINTS.testnet;
  return new SuiJsonRpcClient({ url, network: NETWORK as "mainnet" | "testnet" | "devnet" | "localnet" });
}

/**
 * Get trust score for a wallet address from the on-chain registry
 * @param {string} address - The wallet address to query
 * @returns {Promise<TrustScoreData | null>} The trust score data or null if not found/error
 */
export async function getTrustScore(address: string): Promise<TrustScoreData | null> {
  if (!SUI_SHIELD_PACKAGE || !SUI_SHIELD_REGISTRY) {
    console.warn("Sui contract env vars not set (NEXT_PUBLIC_SUI_SHIELD_PACKAGE or REGISTRY).");
    return null;
  }

  try {
    const client = getSuiClient();
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${SUI_SHIELD_PACKAGE}::trust_layer::get_trust_score`,
      arguments: [
        tx.object(SUI_SHIELD_REGISTRY),
        tx.pure.address(address)
      ],
    });
    
    const result = await client.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: address, // Sender is required for devInspect
    });

    if (result.error) {
      console.error("Contract devInspect error (get_trust_score):", result.error);
      return null;
    }

    const returnValues = result.results?.[0]?.returnValues;
    if (!returnValues || returnValues.length < 4) {
      return null; // Not found or invalid response
    }

    // Decode the (u8, u8, String, u64) tuple
    const scoreBytes = new Uint8Array(returnValues[0][0]);
    const levelBytes = new Uint8Array(returnValues[1][0]);
    const analysisBlobBytes = new Uint8Array(returnValues[2][0]);
    const timestampBytes = new Uint8Array(returnValues[3][0]);

    const score = bcs.u8().parse(scoreBytes);
    const level = bcs.u8().parse(levelBytes);
    const analysisBlob = bcs.string().parse(analysisBlobBytes);
    const timestamp = Number(bcs.u64().parse(timestampBytes));

    return {
      score,
      level,
      analysisBlob,
      timestamp,
    };
  } catch (e) {
    console.error("Failed to get trust score:", e);
    return null;
  }
}

/**
 * Get scam report count for an address from the on-chain registry
 * @param {string} address - The wallet address to query
 * @returns {Promise<number>} The number of reports or 0 on error/not found
 */
export async function getReportCount(address: string): Promise<number> {
  if (!SUI_SHIELD_PACKAGE || !SUI_SHIELD_REGISTRY) {
    console.warn("Sui contract env vars not set (NEXT_PUBLIC_SUI_SHIELD_PACKAGE or REGISTRY).");
    return 0;
  }

  try {
    const client = getSuiClient();
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${SUI_SHIELD_PACKAGE}::trust_layer::get_report_count`,
      arguments: [
        tx.object(SUI_SHIELD_REGISTRY),
        tx.pure.address(address)
      ],
    });
    
    const result = await client.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: address,
    });

    if (result.error) {
      console.error("Contract devInspect error (get_report_count):", result.error);
      return 0;
    }

    const returnValues = result.results?.[0]?.returnValues;
    if (!returnValues || returnValues.length === 0) {
      return 0;
    }

    const countBytes = new Uint8Array(returnValues[0][0]);
    const count = Number(bcs.u64().parse(countBytes));
    return count;
  } catch (e) {
    console.error("Failed to get report count:", e);
    return 0;
  }
}

/**
 * Build transaction for analyze_wallet call
 * Returns the Transaction object for signing by the user's wallet
 * @param {string} wallet - Target wallet address
 * @param {number} score - Computed trust score
 * @param {number} level - Computed trust level
 * @param {string} analysisBlob - Walrus blob ID containing analysis
 * @returns {Transaction | null} The built transaction
 */
export function buildAnalyzeTransaction(
  wallet: string,
  score: number,
  level: number,
  analysisBlob: string
): Transaction | null {
  if (!SUI_SHIELD_PACKAGE || !SUI_SHIELD_REGISTRY) {
    console.warn("Sui contract env vars not set.");
    return null;
  }

  const tx = new Transaction();
  tx.moveCall({
    target: `${SUI_SHIELD_PACKAGE}::trust_layer::analyze_wallet`,
    arguments: [
      tx.object(SUI_SHIELD_REGISTRY),
      tx.pure.address(wallet),
      tx.pure.u8(score),
      tx.pure.u8(level),
      tx.pure.string(analysisBlob),
    ],
  });
  
  return tx;
}

/**
 * Build transaction for submit_report call
 * Returns the Transaction object for signing by the reporter's wallet
 * @param {string} reportedAddress - Address being reported
 * @param {number} reportType - Type of scam
 * @param {string} evidenceBlob - Walrus blob ID containing evidence
 * @returns {Transaction | null} The built transaction
 */
export function buildReportTransaction(
  reportedAddress: string,
  reportType: number,
  evidenceBlob: string
): Transaction | null {
  if (!SUI_SHIELD_PACKAGE || !SUI_SHIELD_REGISTRY) {
    console.warn("Sui contract env vars not set.");
    return null;
  }

  const tx = new Transaction();
  tx.moveCall({
    target: `${SUI_SHIELD_PACKAGE}::trust_layer::submit_report`,
    arguments: [
      tx.object(SUI_SHIELD_REGISTRY),
      tx.pure.address(reportedAddress),
      tx.pure.u8(reportType),
      tx.pure.string(evidenceBlob),
    ],
  });
  
  return tx;
}

/**
 * Build transaction for verify_report call
 * Returns the Transaction object for signing by the verifier's wallet
 * @param {string} reportId - ID of the report to verify
 * @returns {Transaction | null} The built transaction
 */
export function buildVerifyTransaction(reportId: string): Transaction | null {
  if (!SUI_SHIELD_PACKAGE || !SUI_SHIELD_REGISTRY) {
    console.warn("Sui contract env vars not set.");
    return null;
  }

  const tx = new Transaction();
  tx.moveCall({
    target: `${SUI_SHIELD_PACKAGE}::trust_layer::verify_report`,
    arguments: [
      tx.object(SUI_SHIELD_REGISTRY),
      tx.pure.address(reportId), // ID is an address representation
    ],
  });

  return tx;
}

/**
 * Build transaction for dispute_report call
 * Returns the Transaction object for signing by the disputed address owner
 * @param {string} reportId - ID of the report to dispute
 * @param {string} counterEvidence - Walrus blob ID containing counter-evidence
 * @returns {Transaction | null} The built transaction
 */
export function buildDisputeTransaction(
  reportId: string,
  counterEvidence: string
): Transaction | null {
  if (!SUI_SHIELD_PACKAGE || !SUI_SHIELD_REGISTRY) {
    console.warn("Sui contract env vars not set.");
    return null;
  }

  const tx = new Transaction();
  tx.moveCall({
    target: `${SUI_SHIELD_PACKAGE}::trust_layer::dispute_report`,
    arguments: [
      tx.object(SUI_SHIELD_REGISTRY),
      tx.pure.address(reportId),
      tx.pure.string(counterEvidence),
    ],
  });

  return tx;
}

/**
 * Build transaction for getting verified reports check
 * @param {string} address - The wallet address to check
 * @returns {Promise<boolean>} Whether the address has verified reports
 */
export async function hasVerifiedReports(address: string): Promise<boolean> {
  if (!SUI_SHIELD_PACKAGE || !SUI_SHIELD_REGISTRY) {
    return false;
  }

  try {
    const client = getSuiClient();
    const tx = new Transaction();

    tx.moveCall({
      target: `${SUI_SHIELD_PACKAGE}::trust_layer::has_verified_reports`,
      arguments: [
        tx.object(SUI_SHIELD_REGISTRY),
        tx.pure.address(address),
      ],
    });

    const result = await client.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: address,
    });

    if (result.error) return false;

    const returnValues = result.results?.[0]?.returnValues;
    if (!returnValues || returnValues.length === 0) return false;

    const boolBytes = new Uint8Array(returnValues[0][0]);
    return boolBytes[0] === 1;
  } catch {
    return false;
  }
}
