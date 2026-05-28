export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  sources?: DataSource[];
  charts?: ChartData[];
  walletInfo?: WalletInfo;
  riskScore?: number;
  executionTime?: number;
  toolsUsed?: string[];
}

export interface DataSource {
  type: "walrus" | "tatum-rpc" | "tatum-api" | "tatum-mcp" | "tatum-sui-rpc" | "walrus-dataset" | "agent";
  label: string;
  blobId?: string;
  endpoint?: string;
  chain?: string;
}

export interface ChartData {
  type: "line" | "bar" | "area" | "pie";
  title: string;
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string | string[];
  color?: string;
}

export interface WalletInfo {
  address: string;
  chain: string;
  riskScore: number;
  riskLevel: "safe" | "low" | "medium" | "high" | "critical";
  isMalicious: boolean;
  labels?: string[];
  totalTransactions?: number;
  balance?: string;
  firstSeen?: string;
  lastActive?: string;
}

export interface Dataset {
  id: string;
  name: string;
  chain: string;
  chainIcon: string;
  chainColor: string;
  description: string;
  size: string;
  format: "CSV" | "Parquet" | "JSON";
  timeRange: string;
  rowCount?: string;
  blobId?: string;
  tags: string[];
  lastUpdated: string;
}

export interface TatumMCPTool {
  name: string;
  description: string;
  category: "data" | "rpc" | "security" | "notifications" | "smart-contracts";
}

export interface SuggestedQuery {
  text: string;
  icon: string;
  category: "security" | "analytics" | "history" | "defi";
}

export interface AgentStep {
  step: number;
  tool: string;
  status: "success" | "error";
  summary: string;
}

export interface AgentResponse {
  content: string;
  sources?: DataSource[];
  toolsUsed?: string[];
  executionTime?: number;
  riskScore?: number;
  walletInfo?: WalletInfo;
  charts?: ChartData[];
  agentSteps?: AgentStep[];
  onChainProof?: {
    blobId: string;
    verificationUrl: string;
    storedAt: string;
  };
}

export interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  chainId: number | null;
}
