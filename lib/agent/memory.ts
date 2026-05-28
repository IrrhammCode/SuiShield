// Agent Memory — persistent memory via Walrus
// Stores analysis history so the agent can recall previous analyses

import {
  storeAnalysisOnWalrus,
  readAnalysisFromWalrus,
  createAnalysisRecord,
  type WalletAnalysisRecord,
  type StoredAnalysis,
} from "@/lib/walrus-write";

// ── In-memory cache (for current session) ────────────────
// Also stores blob IDs for lookup
const analysisCache = new Map<string, StoredAnalysis>();

// ── Store a new analysis ─────────────────────────────────

export async function saveAnalysis(params: {
  address: string;
  chain: string;
  riskScore: number;
  riskLevel: string;
  balance: string;
  transactionCount: number;
  analysis: string;
  agentSteps: string[];
  analyzedBy: string;
}): Promise<StoredAnalysis> {
  const record = createAnalysisRecord(params);

  // Store on Walrus
  const result = await storeAnalysisOnWalrus(record);

  const stored: StoredAnalysis = {
    blobId: result.blobId,
    record,
    storedAt: new Date().toISOString(),
  };

  // Cache locally
  const cacheKey = `${params.chain}:${params.address.toLowerCase()}`;
  analysisCache.set(cacheKey, stored);

  return stored;
}

// ── Retrieve previous analysis ───────────────────────────

export async function getPreviousAnalysis(
  chain: string,
  address: string
): Promise<StoredAnalysis | null> {
  const cacheKey = `${chain}:${address.toLowerCase()}`;

  // Check local cache first
  if (analysisCache.has(cacheKey)) {
    return analysisCache.get(cacheKey) || null;
  }

  // TODO: In production, we'd maintain an index of address → blobId mappings
  // For now, we rely on the in-memory cache
  return null;
}

// ── Retrieve analysis by blob ID ─────────────────────────

export async function getAnalysisByBlobId(
  blobId: string
): Promise<WalletAnalysisRecord | null> {
  return readAnalysisFromWalrus(blobId);
}

// ── Build memory context for the agent ───────────────────

export function buildMemoryContext(
  chain: string,
  address: string
): string | null {
  const cacheKey = `${chain}:${address.toLowerCase()}`;
  const cached = analysisCache.get(cacheKey);

  if (!cached) return null;

  const record = cached.record;
  const timeDiff = Date.now() - new Date(record.timestamp).getTime();
  const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
  const daysAgo = Math.floor(hoursAgo / 24);

  let timeAgo: string;
  if (daysAgo > 0) {
    timeAgo = `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`;
  } else if (hoursAgo > 0) {
    timeAgo = `${hoursAgo} hour${hoursAgo > 1 ? "s" : ""} ago`;
  } else {
    timeAgo = "just now";
  }

  return [
    `## Previous Analysis Found`,
    `This wallet was analyzed ${timeAgo} (blob: ${cached.blobId.slice(0, 12)}...)`,
    `- Risk Score: ${record.riskScore}/100 (${record.riskLevel})`,
    `- Balance: ${record.balance}`,
    `- Transactions: ${record.transactionCount}`,
    `- Summary: ${record.analysis.slice(0, 200)}...`,
    ``,
    `Use this context to provide updated analysis. Compare current data with previous data to identify changes.`,
  ].join("\n");
}

// ── Format stored analysis for display ───────────────────

export function formatStoredAnalysis(stored: StoredAnalysis): string {
  const { record, blobId } = stored;
  return [
    `**Analysis stored on Walrus**`,
    `- Blob ID: ${blobId.slice(0, 12)}...`,
    `- Address: ${record.address}`,
    `- Chain: ${record.chain}`,
    `- Risk: ${record.riskScore}/100 (${record.riskLevel})`,
    `- Time: ${record.timestamp}`,
  ].join("\n");
}
