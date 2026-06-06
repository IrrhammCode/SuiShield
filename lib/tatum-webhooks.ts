// Tatum Webhooks — Real-time blockchain notifications + local monitoring
// Docs: https://docs.tatum.io/reference/subscriptions
// Uses Tatum RPC to poll for new transactions on monitored addresses.

import { getSuiTransactionBlocks, getSuiBalances, formatSuiBalance, isValidSuiAddress } from "./tatum-sui";

const TATUM_API_BASE = "https://api.tatum.io";
const TATUM_API_KEY = process.env.TATUM_API_KEY;

// ── Types ────────────────────────────────────────────────

export type WebhookEventType =
  | "ADDRESS_TRANSACTION"
  | "ADDRESS_FUNDS_RECEIVED"
  | "ADDRESS_FUNDS_SENT"
  | "NFT_RECEIVED"
  | "TOKEN_TRANSFER"
  | "BLOCK_MINED";

export interface WebhookSubscription {
  id: string;
  chain: string;
  address: string;
  eventType: WebhookEventType;
  url: string;
  active: boolean;
  createdAt: string;
}

export interface MonitoredActivity {
  digest: string;
  timestamp: string;
  type: string;
  amount?: string;
  from?: string;
  to?: string;
  status: "success" | "failure";
  gasUsed?: string;
}

export interface MonitoredAddress {
  address: string;
  chain: string;
  riskScore: number;
  monitoredAt: string;
  alerts: MonitoredActivity[];
  lastCheckedTx?: string;
  balance?: string;
  label?: string;
}

// ── Persistent Store (global singleton for serverless) ──

const globalStore = globalThis as unknown as {
  __suiShieldMonitored?: Map<string, MonitoredAddress>;
};

if (!globalStore.__suiShieldMonitored) {
  globalStore.__suiShieldMonitored = new Map();
}

const monitoredAddresses: Map<string, MonitoredAddress> = globalStore.__suiShieldMonitored!;

// ── Tatum Webhook API ───────────────────────────────────

async function tatumFetch<T = unknown>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(TATUM_API_KEY ? { "x-api-key": TATUM_API_KEY } : {}),
  };

  const response = await fetch(`${TATUM_API_BASE}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options?.headers },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Tatum API ${response.status}: ${errorText}`);
  }

  return response.json();
}

// ── Monitor Address ─────────────────────────────────────

export function monitorAddress(
  address: string,
  chain: string,
  riskScore: number,
  label?: string
): void {
  if (!isValidSuiAddress(address)) {
    throw new Error("Invalid Sui address format");
  }

  const existing = monitoredAddresses.get(address);
  monitoredAddresses.set(address, {
    address,
    chain,
    riskScore,
    monitoredAt: existing?.monitoredAt || new Date().toISOString(),
    alerts: existing?.alerts || [],
    lastCheckedTx: existing?.lastCheckedTx,
    balance: existing?.balance,
    label: label || existing?.label,
  });
}

// ── Remove Address from Monitor ─────────────────────────

export function unmonitorAddress(address: string): boolean {
  return monitoredAddresses.delete(address);
}

// ── Get Monitored Addresses ─────────────────────────────

export function getMonitoredAddresses(): Array<{
  address: string;
  chain: string;
  riskScore: number;
  monitoredAt: string;
  alertCount: number;
  lastAlert?: string;
  balance?: string;
  label?: string;
}> {
  return Array.from(monitoredAddresses.values()).map((m) => ({
    address: m.address,
    chain: m.chain,
    riskScore: m.riskScore,
    monitoredAt: m.monitoredAt,
    alertCount: m.alerts.length,
    lastAlert: m.alerts.length > 0 ? m.alerts[m.alerts.length - 1].timestamp : undefined,
    balance: m.balance,
    label: m.label,
  }));
}

// ── Check for New Activity ──────────────────────────────

export async function checkAddressActivity(
  address: string
): Promise<{ newTxs: MonitoredActivity[]; balance: string }> {
  const monitored = monitoredAddresses.get(address);
  if (!monitored) {
    throw new Error("Address not monitored");
  }

  try {
    // Fetch recent transactions
    const txResult = await getSuiTransactionBlocks(address, 10);
    const txs = txResult.data || [];

    // Fetch balance
    const balances = await getSuiBalances(address);
    const suiBalance = balances.find((b) => b.coinType.includes("sui::SUI"));
    const balance = suiBalance ? formatSuiBalance(suiBalance.totalBalance) : "0 SUI";

    // Find new transactions (not seen before)
    const lastChecked = monitored.lastCheckedTx;
    const newTxs: MonitoredActivity[] = [];

    for (const tx of txs) {
      // Stop if we've seen this tx before
      if (tx.digest === lastChecked) break;

      const effects = tx.effects;
      const isSuccess = effects?.status?.status === "success";
      const timestamp = tx.timestampMs
        ? new Date(parseInt(tx.timestampMs)).toISOString()
        : new Date().toISOString();

      // Determine transaction type from balance changes
      let txType = "Transaction";
      let amount: string | undefined;

      if (tx.balanceChanges) {
        const suiChange = tx.balanceChanges.find(
          (c) => c.coinType?.includes("sui::SUI") && c.owner?.AddressOwner === address
        );
        if (suiChange) {
          const changeAmount = BigInt(suiChange.amount);
          if (changeAmount < BigInt(0)) {
            txType = "Sent";
            amount = formatSuiBalance((-changeAmount).toString());
          } else if (changeAmount > BigInt(0)) {
            txType = "Received";
            amount = formatSuiBalance(changeAmount.toString());
          }
        }
      }

      newTxs.push({
        digest: tx.digest,
        timestamp,
        type: txType,
        amount,
        status: isSuccess ? "success" : "failure",
        gasUsed: effects?.gasUsed
          ? formatSuiBalance(
              (BigInt(effects.gasUsed.computationCost) +
                BigInt(effects.gasUsed.storageCost) -
                BigInt(effects.gasUsed.storageRebate)).toString()
            )
          : undefined,
      });
    }

    // Update monitored state
    if (txs.length > 0) {
      monitored.lastCheckedTx = txs[0].digest;
    }
    monitored.balance = balance;
    monitored.alerts = [...newTxs, ...monitored.alerts].slice(0, 50); // Keep last 50

    return { newTxs, balance };
  } catch (error) {
    console.error(`Failed to check activity for ${address}:`, error);
    return { newTxs: [], balance: monitored.balance || "Unknown" };
  }
}

// ── Check All Monitored Addresses ───────────────────────

export async function checkAllAddresses(): Promise<
  Array<{ address: string; newTxs: MonitoredActivity[]; balance: string }>
> {
  const results = [];
  for (const [address] of monitoredAddresses) {
    const result = await checkAddressActivity(address);
    results.push({ address, ...result });
    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 200));
  }
  return results;
}

// ── Update Risk Score ───────────────────────────────────

export function updateRiskScore(address: string, riskScore: number): boolean {
  const monitored = monitoredAddresses.get(address);
  if (!monitored) return false;
  monitored.riskScore = Math.max(0, Math.min(100, riskScore));
  return true;
}

// ── Get Activity for Address ────────────────────────────

export function getAddressActivity(
  address: string,
  limit = 20
): MonitoredActivity[] {
  const monitored = monitoredAddresses.get(address);
  if (!monitored) return [];
  return monitored.alerts.slice(0, limit);
}

// ── Tatum Webhook (optional — for production) ───────────

export async function createWebhookSubscription(
  address: string,
  chain: string,
  eventType: WebhookEventType,
  callbackUrl: string
): Promise<WebhookSubscription> {
  try {
    const data = await tatumFetch<{
      id: string;
      chain: string;
      address: string;
      eventType: string;
      url: string;
      active: boolean;
    }>("/v3/subscription", {
      method: "POST",
      body: JSON.stringify({
        chain: chain.toUpperCase(),
        address,
        type: eventType,
        url: callbackUrl,
      }),
    });

    return {
      id: data.id,
      chain: data.chain,
      address: data.address,
      eventType: data.eventType as WebhookEventType,
      url: data.url,
      active: data.active,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn("Tatum webhook creation failed:", error);
    // Fallback: just track locally
    monitorAddress(address, chain, 50);
    return {
      id: `local_${Date.now()}`,
      chain,
      address,
      eventType,
      url: callbackUrl,
      active: true,
      createdAt: new Date().toISOString(),
    };
  }
}

export async function deleteWebhookSubscription(subscriptionId: string): Promise<boolean> {
  if (subscriptionId.startsWith("local_")) {
    const address = subscriptionId.replace("local_", "");
    monitoredAddresses.delete(address);
    return true;
  }
  try {
    await tatumFetch(`/v3/subscription/${subscriptionId}`, { method: "DELETE" });
    return true;
  } catch {
    return false;
  }
}

export function processWebhookCallback(payload: {
  address: string;
  eventType: string;
  txHash?: string;
  amount?: string;
}): {
  address: string;
  alert: boolean;
  riskLevel: "low" | "medium" | "high";
  message: string;
} {
  const monitored = monitoredAddresses.get(payload.address);
  if (!monitored) {
    return {
      address: payload.address,
      alert: false,
      riskLevel: "low",
      message: "Address not monitored",
    };
  }

  let riskLevel: "low" | "medium" | "high" = "low";
  let message = "";

  if (payload.eventType === "ADDRESS_FUNDS_SENT" && monitored.riskScore > 60) {
    riskLevel = "high";
    message = `High-risk address sent funds${payload.amount ? `: ${payload.amount}` : ""}`;
  } else if (payload.eventType === "ADDRESS_FUNDS_RECEIVED" && monitored.riskScore > 50) {
    riskLevel = "medium";
    message = `Monitored address received funds${payload.amount ? `: ${payload.amount}` : ""}`;
  } else {
    message = `Activity on monitored address`;
  }

  return {
    address: payload.address,
    alert: riskLevel !== "low",
    riskLevel,
    message,
  };
}

// ── Webhook Status ───────────────────────────────────────

export async function getWebhookStatus(): Promise<{
  tatumAvailable: boolean;
  localMonitors: number;
  activeAlerts: number;
}> {
  const totalAlerts = Array.from(monitoredAddresses.values())
    .reduce((sum, m) => sum + m.alerts.length, 0);

  return {
    tatumAvailable: !!TATUM_API_KEY,
    localMonitors: monitoredAddresses.size,
    activeAlerts: totalAlerts,
  };
}
