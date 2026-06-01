// Tatum Webhooks — Real-time blockchain notifications
// Docs: https://docs.tatum.io/reference/subscriptions
// This enables monitoring addresses for suspicious activity after analysis.

const TATUM_API_BASE = "https://api.tatum.io";
const TATUM_API_KEY = process.env.TATUM_API_KEY;

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

// ── Types ────────────────────────────────────────────────

export type WebhookEventType =
  | "ADDRESS_TRANSACTION"      // Any transaction on address
  | "ADDRESS_FUNDS_RECEIVED"   // Funds received
  | "ADDRESS_FUNDS_SENT"       // Funds sent
  | "NFT_RECEIVED"             // NFT received
  | "TOKEN_TRANSFER"           // Token transfer
  | "BLOCK_MINED";             // New block mined

export interface WebhookSubscription {
  id: string;
  chain: string;
  address: string;
  eventType: WebhookEventType;
  url: string;
  active: boolean;
  createdAt: string;
}

export interface WebhookPayload {
  subscriptionId: string;
  chain: string;
  address: string;
  eventType: WebhookEventType;
  txHash: string;
  blockNumber: number;
  timestamp: string;
  amount?: string;
  tokenAddress?: string;
  from?: string;
  to?: string;
}

// ── In-Memory Store (for demo — production would use DB) ─

const monitoredAddresses = new Map<string, {
  address: string;
  chain: string;
  riskScore: number;
  monitoredAt: string;
  alerts: WebhookPayload[];
}>();

// ── Create Webhook Subscription ──────────────────────────

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
    // If Tatum webhook API not available, store locally
    console.warn("Tatum webhook creation failed, storing locally:", error);
    const id = `local_${Date.now()}`;
    monitoredAddresses.set(address, {
      address,
      chain,
      riskScore: 50,
      monitoredAt: new Date().toISOString(),
      alerts: [],
    });
    return {
      id,
      chain,
      address,
      eventType,
      url: callbackUrl,
      active: true,
      createdAt: new Date().toISOString(),
    };
  }
}

// ── Get Active Subscriptions ─────────────────────────────

export async function getActiveSubscriptions(): Promise<WebhookSubscription[]> {
  try {
    const data = await tatumFetch<{ subscriptions: WebhookSubscription[] }>("/v3/subscription");
    return data.subscriptions || [];
  } catch {
    // Return local subscriptions
    return Array.from(monitoredAddresses.values()).map((m) => ({
      id: `local_${m.address}`,
      chain: m.chain,
      address: m.address,
      eventType: "ADDRESS_TRANSACTION" as WebhookEventType,
      url: "",
      active: true,
      createdAt: m.monitoredAt,
    }));
  }
}

// ── Delete Webhook Subscription ──────────────────────────

export async function deleteWebhookSubscription(subscriptionId: string): Promise<boolean> {
  try {
    await tatumFetch(`/v3/subscription/${subscriptionId}`, { method: "DELETE" });
    return true;
  } catch {
    monitoredAddresses.delete(subscriptionId.replace("local_", ""));
    return true;
  }
}

// ── Monitor Address (local tracking) ─────────────────────

export function monitorAddress(
  address: string,
  chain: string,
  riskScore: number
): void {
  monitoredAddresses.set(address, {
    address,
    chain,
    riskScore,
    monitoredAt: new Date().toISOString(),
    alerts: [],
  });
}

// ── Get Monitored Addresses ──────────────────────────────

export function getMonitoredAddresses(): Array<{
  address: string;
  chain: string;
  riskScore: number;
  monitoredAt: string;
  alertCount: number;
  lastAlert?: string;
}> {
  return Array.from(monitoredAddresses.values()).map((m) => ({
    address: m.address,
    chain: m.chain,
    riskScore: m.riskScore,
    monitoredAt: m.monitoredAt,
    alertCount: m.alerts.length,
    lastAlert: m.alerts.length > 0 ? m.alerts[m.alerts.length - 1].timestamp : undefined,
  }));
}

// ── Record Alert ─────────────────────────────────────────

export function recordAlert(address: string, alert: WebhookPayload): void {
  const monitored = monitoredAddresses.get(address);
  if (monitored) {
    monitored.alerts.push(alert);
  }
}

// ── Process Webhook Callback ─────────────────────────────

export function processWebhookCallback(payload: WebhookPayload): {
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

  // Record the alert
  recordAlert(payload.address, payload);

  // Determine risk level based on event type and existing risk score
  let riskLevel: "low" | "medium" | "high" = "low";
  let message = "";

  if (payload.eventType === "ADDRESS_FUNDS_RECEIVED" && monitored.riskScore > 60) {
    riskLevel = "medium";
    message = `Monitored high-risk address received funds: ${payload.amount || "unknown"}`;
  } else if (payload.eventType === "ADDRESS_FUNDS_SENT" && monitored.riskScore > 70) {
    riskLevel = "high";
    message = `Flagged address sent funds — potential movement detected`;
  } else if (payload.eventType === "TOKEN_TRANSFER") {
    riskLevel = "medium";
    message = `Token transfer detected on monitored address`;
  } else {
    message = `Activity detected on monitored address`;
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
