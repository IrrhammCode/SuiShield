// Walrus Write Integration — store analysis results on-chain
// Docs: https://docs.walrus.site/

// Testnet first for hackathon development
const WALRUS_PUBLISHER_URLS = [
  "https://publisher.walrus.space",
  "https://publisher.walrus-testnet.walrus.space",
];

const WALRUS_AGGREGATOR_URLS = [
  "https://aggregator.walrus.space",
  "https://aggregator.walrus-testnet.walrus.space",
];

// ── Hash Utility ─────────────────────────────────────────

async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ── Types ────────────────────────────────────────────────

export interface WalrusBlobResult {
  blobId: string;
  blobObjectId?: string;
  endEpoch?: number;
  status: "newlyCreated" | "alreadyCertified";
}

export interface WalletAnalysisRecord {
  version: string;
  type: "wallet-analysis";
  address: string;
  chain: string;
  timestamp: string;
  riskScore: number;
  riskLevel: string;
  balance: string;
  transactionCount: number;
  analysis: string;
  agentSteps: string[];
  analyzedBy: string; // connected wallet that requested analysis
  // Proof chain fields
  inputHash: string;   // SHA-256 of the prompt + tool context
  outputHash: string;  // SHA-256 of the raw LLM response
  model: string;       // "llama-3.3-70b-versatile"
  proofVersion: string; // "1.0"
}

export interface StoredAnalysis {
  blobId: string;
  record: WalletAnalysisRecord;
  storedAt: string;
}

// ── Write to Walrus ──────────────────────────────────────

/**
 * Store a wallet analysis record on Walrus.
 * Returns the blob ID for verification.
 */
export async function storeAnalysisOnWalrus(
  record: WalletAnalysisRecord,
  epochs = 5
): Promise<WalrusBlobResult> {
  const publisher = WALRUS_PUBLISHER_URLS[0];
  const data = JSON.stringify(record, null, 2);
  const bytes = new TextEncoder().encode(data);

  const response = await fetch(`${publisher}/v1/blobs?epochs=${epochs}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/octet-stream",
    },
    body: bytes,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Walrus write failed: ${response.status} ${errorText}`);
  }

  const result = await response.json();

  if (result.newlyCreated) {
    return {
      blobId: result.newlyCreated.blobObject.blobId,
      blobObjectId: result.newlyCreated.blobObject.id,
      endEpoch: result.newlyCreated.blobObject.storage.endEpoch,
      status: "newlyCreated",
    };
  }

  if (result.alreadyCertified) {
    return {
      blobId: result.alreadyCertified.blobId,
      endEpoch: result.alreadyCertified.endEpoch,
      status: "alreadyCertified",
    };
  }

  throw new Error("Unexpected Walrus response format");
}

// ── Read from Walrus ─────────────────────────────────────

/**
 * Read a stored analysis from Walrus by blob ID.
 */
export async function readAnalysisFromWalrus(
  blobId: string
): Promise<WalletAnalysisRecord | null> {
  const aggregator = WALRUS_AGGREGATOR_URLS[0];

  try {
    const response = await fetch(`${aggregator}/v1/blobs/${blobId}`, {
      headers: { Accept: "application/octet-stream" },
    });

    if (!response.ok) {
      return null;
    }

    const buffer = await response.arrayBuffer();
    const text = new TextDecoder().decode(buffer);
    const record = JSON.parse(text) as WalletAnalysisRecord;

    // Validate it's a wallet analysis record
    if (record.type !== "wallet-analysis") {
      return null;
    }

    return record;
  } catch {
    return null;
  }
}

// ── Helper: Create analysis record ───────────────────────

export async function createAnalysisRecord(params: {
  address: string;
  chain: string;
  riskScore: number;
  riskLevel: string;
  balance: string;
  transactionCount: number;
  analysis: string;
  agentSteps: string[];
  analyzedBy: string;
  inputContext?: string; // prompt + tool context for hashing
  outputContent?: string; // raw LLM output for hashing
}): Promise<WalletAnalysisRecord> {
  const inputHash = params.inputContext
    ? await sha256(params.inputContext)
    : await sha256(`${params.address}:${params.chain}:${params.analysis}`);
  const outputHash = params.outputContent
    ? await sha256(params.outputContent)
    : await sha256(params.analysis);

  return {
    version: "1.0",
    type: "wallet-analysis",
    address: params.address,
    chain: params.chain,
    timestamp: new Date().toISOString(),
    riskScore: params.riskScore,
    riskLevel: params.riskLevel,
    balance: params.balance,
    transactionCount: params.transactionCount,
    analysis: params.analysis,
    agentSteps: params.agentSteps,
    analyzedBy: params.analyzedBy,
    inputHash,
    outputHash,
    model: "llama-3.3-70b-versatile",
    proofVersion: "1.0",
  };
}

// ── Helper: Get Walrus explorer URL for a blob ───────────

export function getWalrusExplorerUrl(blobId: string): string {
  // Walrus doesn't have a dedicated explorer yet, but we can link to the aggregator
  return `https://aggregator.walrus.space/v1/blobs/${blobId}`;
}

// ── Helper: Format blob ID for display ───────────────────

export function formatBlobId(blobId: string): string {
  if (!blobId || blobId.length < 16) return blobId;
  return `${blobId.slice(0, 8)}...${blobId.slice(-6)}`;
}
