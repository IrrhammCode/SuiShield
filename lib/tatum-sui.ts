// Tatum Sui RPC — direct JSON-RPC calls via Tatum infrastructure
// Endpoints: https://docs.tatum.io/reference/rpc-sui
// Mainnet: https://sui-mainnet.gateway.tatum.io
// Testnet: https://sui-testnet.gateway.tatum.io
// Devnet: https://sui-devnet.gateway.tatum.io

const TATUM_SUI_MAINNET = "https://sui-mainnet.gateway.tatum.io";
const TATUM_SUI_TESTNET = "https://sui-testnet.gateway.tatum.io";
const TATUM_API_KEY = process.env.TATUM_API_KEY;

// ── Sui JSON-RPC Helper ─────────────────────────────────

async function suiRpc<T = unknown>(
  method: string,
  params: unknown[] = [],
  network: "mainnet" | "testnet" = "testnet"
): Promise<T> {
  // Use Tatum Sui RPC gateway — default testnet for development
  const rpcUrl = network === "testnet" ? TATUM_SUI_TESTNET : TATUM_SUI_MAINNET;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Tatum API key for authentication
  if (TATUM_API_KEY) {
    headers["x-api-key"] = TATUM_API_KEY;
  }

  const response = await fetch(rpcUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`Sui RPC error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`Sui RPC error: ${data.error.message || JSON.stringify(data.error)}`);
  }

  return data.result as T;
}

// ── Sui RPC Methods ─────────────────────────────────────

export interface SuiBalance {
  coinType: string;
  coinObjectCount: number;
  totalBalance: string;
  lockedBalance: Record<string, string>;
}

export interface SuiObject {
  data: {
    objectId: string;
    version: string;
    digest: string;
    type: string;
    owner: Record<string, unknown>;
    content: Record<string, unknown>;
    previousTransaction: string;
    storageRebate: string;
  };
}

export interface SuiTransactionBlock {
  digest: string;
  transaction: {
    data: {
      messageVersion: string;
      transaction: {
        kind: string;
        inputs: unknown[];
        transactions: unknown[];
      };
      sender: string;
      gasData: {
        payment: unknown[];
        owner: string;
        price: string;
        budget: string;
      };
    };
    txSignatures: string[];
  };
  effects: {
    messageVersion: string;
    status: { status: string };
    executedEpoch: string;
    gasUsed: {
      computationCost: string;
      storageCost: string;
      storageRebate: string;
      nonRefundableStorageFee: string;
    };
    modifiedAtVersions: unknown[];
    transactionDigest: string;
    created: unknown[];
    mutated: unknown[];
    deleted: unknown[];
    gasObject: {
      reference: { objectId: string; version: string; digest: string };
      owner: { AddressOwner: string };
    };
    eventsDigest: string;
    dependencies: string[];
  };
  checkpoint: string;
  timestampMs: string;
}

export interface SuiCheckpoint {
  epoch: string;
  sequenceNumber: string;
  digest: string;
  networkTotalTransactions: string;
  previousDigest: string;
  epochRollingGasCostSummary: {
    computationCost: string;
    storageCost: string;
    storageRebate: string;
    nonRefundableStorageFee: string;
  };
  timestampMs: string;
  transactions: string[];
}

// ── Public API ──────────────────────────────────────────

/** Get all coin balances for an address */
export async function getSuiBalances(address: string): Promise<SuiBalance[]> {
  return suiRpc<SuiBalance[]>("suix_getAllBalances", [address]);
}

/** Get balance of a specific coin type */
export async function getSuiBalance(
  address: string,
  coinType = "0x2::sui::SUI"
): Promise<string> {
  const result = await suiRpc<{ totalBalance: string }>(
    "suix_getBalance",
    [address, coinType]
  );
  return result.totalBalance;
}

/** Get objects owned by an address */
export async function getSuiObjects(
  address: string,
  limit = 50
): Promise<{ data: SuiObject[]; hasNextPage: boolean; nextCursor: string | null }> {
  return suiRpc("suix_getOwnedObjects", [
    address,
    { options: { showType: true, showContent: true, showOwner: true } },
    null,
    limit,
  ]);
}

/** Get transaction blocks for an address */
export async function getSuiTransactionBlocks(
  address: string,
  limit = 20
): Promise<{ data: SuiTransactionBlock[]; hasNextPage: boolean; nextCursor: string | null }> {
  return suiRpc("suix_queryTransactionBlocks", [
    {
      filter: { FromAddress: address },
      options: {
        showInput: true,
        showEffects: true,
        showEvents: true,
        showBalanceChanges: true,
      },
    },
    null,
    limit,
    true,
  ]);
}

/** Get a specific transaction block by digest */
export async function getSuiTransactionBlock(
  digest: string
): Promise<SuiTransactionBlock> {
  return suiRpc<SuiTransactionBlock>("sui_getTransactionBlock", [
    digest,
    {
      showInput: true,
      showEffects: true,
      showEvents: true,
      showBalanceChanges: true,
    },
  ]);
}

/** Get latest checkpoint */
export async function getSuiLatestCheckpoint(): Promise<SuiCheckpoint> {
  return suiRpc<SuiCheckpoint>("sui_getLatestCheckpointSequenceNumber").then(
    async (seq) => {
      return suiRpc<SuiCheckpoint>("sui_getCheckpoint", [seq]);
    }
  );
}

/** Get Sui protocol config */
export async function getSuiProtocolConfig(): Promise<Record<string, unknown>> {
  return suiRpc("sui_getProtocolConfig");
}

/** Resolve Sui Name Service (e.g., name.sui) */
export async function resolveSuiName(
  name: string
): Promise<string | null> {
  try {
    const result = await suiRpc<string | null>("suix_resolveNameServiceAddress", [name]);
    return result;
  } catch {
    return null;
  }
}

/** Check if address is a valid Sui address */
export function isValidSuiAddress(address: string): boolean {
  // Sui addresses are 32 bytes (64 hex chars) with 0x prefix
  return /^0x[a-fA-F0-9]{64}$/.test(address) || /^0x[a-fA-F0-9]{1,64}$/.test(address);
}

/** Format MIST to SUI (1 SUI = 10^9 MIST) */
export function mistToSui(mist: string | number): number {
  return Number(mist) / 1_000_000_000;
}

/** Format SUI balance for display */
export function formatSuiBalance(mist: string | number): string {
  const sui = mistToSui(mist);
  if (sui >= 1_000_000) return `${(sui / 1_000_000).toFixed(2)}M SUI`;
  if (sui >= 1_000) return `${(sui / 1_000).toFixed(2)}K SUI`;
  if (sui >= 1) return `${sui.toFixed(4)} SUI`;
  if (sui > 0) return `${sui.toFixed(9)} SUI`;
  return "0 SUI";
}
