// SuiShield Trust Layer — Contract interaction utilities
// This module handles on-chain interactions with the SuiShield Move contract

const SUI_SHIELD_PACKAGE = process.env.NEXT_PUBLIC_SUI_SHIELD_PACKAGE || "";
const SUI_SHIELD_REGISTRY = process.env.NEXT_PUBLIC_SUI_SHIELD_REGISTRY || "";

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
 * Get trust score for a wallet address
 * In production, this calls the Sui RPC directly
 * For demo, returns mock data
 */
export async function getTrustScore(_address: string): Promise<TrustScoreData | null> {
  if (!SUI_SHIELD_PACKAGE || !SUI_SHIELD_REGISTRY) {
    // Mock data for demo
    return {
      score: 72,
      level: 1,
      analysisBlob: "mock_blob_id",
      timestamp: Date.now(),
    };
  }

  try {
    // In production: call sui_executeTransactionBlock
    // const result = await suiClient.devInspectTransactionBlock({...});
    return null;
  } catch (e) {
    console.error("Failed to get trust score:", e);
    return null;
  }
}

/**
 * Get scam report count for an address
 */
export async function getReportCount(_address: string): Promise<number> {
  if (!SUI_SHIELD_PACKAGE || !SUI_SHIELD_REGISTRY) {
    return 0;
  }

  try {
    // In production: call contract
    return 0;
  } catch (e) {
    console.error("Failed to get report count:", e);
    return 0;
  }
}

/**
 * Build transaction for analyze_wallet call
 * Returns the transaction bytes for signing
 */
export function buildAnalyzeTransaction(
  _wallet: string,
  _score: number,
  _level: number,
  _analysisBlob: string
) {
  // In production: build Sui transaction
  // const tx = new TransactionBlock();
  // tx.moveCall({
  //   target: `${SUI_SHIELD_PACKAGE}::trust_layer::analyze_wallet`,
  //   arguments: [
  //     tx.object(SUI_SHIELD_REGISTRY),
  //     tx.pure(wallet),
  //     tx.pure(score),
  //     tx.pure(level),
  //     tx.pure(analysisBlob),
  //   ],
  // });
  // return tx;
  return null;
}

/**
 * Build transaction for submit_report call
 */
export function buildReportTransaction(
  _reportedAddress: string,
  _reportType: number,
  _evidenceBlob: string
) {
  // In production: build Sui transaction
  return null;
}

/**
 * Build transaction for verify_report call
 */
export function buildVerifyTransaction(_reportId: string) {
  // In production: build Sui transaction
  return null;
}
