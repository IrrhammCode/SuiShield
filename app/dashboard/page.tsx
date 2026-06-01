"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Brain,
  Send,
  Database,
  Shield,
  TrendingUp,
  Activity,
  ChevronLeft,
  Copy,
  Check,
  ExternalLink,
  Zap,
  Loader2,
  BarChart3,
  Clock,
  Wallet,
  RefreshCw,
  Info,
  ChevronDown,
  User,
  Globe,
  Search,
  ArrowRight,
  Eye,
  GitBranch,
  Bell,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Message, MessageMetadata, DataSource, WalletInfo, AgentStep } from "@/types";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { useWalletAuth } from "@/context/WalletAuthContext";
import Floating3DCard from "@/components/Floating3D";

// ─── Agent Steps Visualizer ──────────────────────────────
function AgentStepsVisualizer({ steps }: { steps: AgentStep[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card-premium p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-xs"
      >
        <div className="flex items-center gap-2 text-cyan-400 font-semibold">
          <Zap className="w-4 h-4" />
          Agent executed {steps.length} step{steps.length !== 1 ? "s" : ""}
        </div>
        <span className="text-[#525880] text-[10px]">{expanded ? "▲ COLLAPSE" : "▼ EXPAND"}</span>
      </button>
      {expanded && (
        <div className="mt-4 space-y-3">
          {steps.map((step) => (
            <div key={step.step} className="flex items-start gap-3 text-xs">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                step.status === "success"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25"
                  : "bg-red-500/15 text-red-400 border border-red-500/25"
              }`}>
                {step.step}
              </div>
              <div className="flex-1">
                <span className="font-mono text-cyan-300 text-[11px]">{step.tool}</span>
                <div className="text-[#8B93C4] mt-0.5 leading-relaxed">{step.summary}</div>
                {step.reasoning && (
                  <div className="text-[#525880] text-[10px] mt-1 italic">{step.reasoning}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Source Badge ─────────────────────────────────────────
function SourceBadge({ source }: { source: DataSource }) {
  const configs: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    walrus: { label: "Walrus", color: "text-magenta-400 border-magenta-500/30 bg-magenta-500/10", icon: <Database className="w-3 h-3" /> },
    "tatum-rpc": { label: "Tatum RPC", color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10", icon: <Zap className="w-3 h-3" /> },
    "tatum-sui-rpc": { label: "Tatum Sui RPC", color: "text-blue-400 border-blue-500/30 bg-blue-500/10", icon: <Zap className="w-3 h-3" /> },
    "tatum-api": { label: "Tatum API", color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10", icon: <Database className="w-3 h-3" /> },
    "tatum-mcp": { label: "Tatum MCP", color: "text-blue-400 border-blue-500/30 bg-blue-500/10", icon: <Brain className="w-3 h-3" /> },
    "walrus-dataset": { label: "Walrus Dataset", color: "text-magenta-400 border-magenta-500/30 bg-magenta-500/10", icon: <Database className="w-3 h-3" /> },
    agent: { label: "Agent", color: "text-orange-400 border-orange-500/30 bg-orange-500/10", icon: <Brain className="w-3 h-3" /> },
  };
  const config = configs[source.type] || configs["tatum-api"];

  return (
    <div className={`inline-flex items-center gap-1.5 text-xs border rounded-lg px-2 py-1 font-mono ${config.color}`}>
      {config.icon}
      <span>{source.label || config.label}</span>
    </div>
  );
}

// ─── Risk Meter ───────────────────────────────────────────
function RiskMeter({ score }: { score: number }) {
  const getColor = () => {
    if (score < 25) return "#00FF9D";
    if (score < 50) return "#FFB300";
    if (score < 75) return "#FF6B00";
    return "#FF3366";
  };
  const getLabel = () => {
    if (score < 25) return "SAFE";
    if (score < 50) return "LOW RISK";
    if (score < 75) return "MEDIUM RISK";
    return "HIGH RISK";
  };

  return (
    <div className="bg-[#1A1D2E] rounded-2xl p-4 border border-white/5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[#8B93C4] text-xs font-medium">Risk Score</span>
        <span className="font-display font-bold text-lg" style={{ color: getColor() }}>
          {score}/100
        </span>
      </div>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, background: getColor() }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-[#525880] mt-1.5">
        <span>Safe</span>
        <span className="font-bold" style={{ color: getColor() }}>{getLabel()}</span>
        <span>Critical</span>
      </div>
    </div>
  );
}

// ─── Wallet Info Card ─────────────────────────────────────
function WalletOverviewCard({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWalletInfo() {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `Analyze Sui wallet ${address}`,
            walletAddress: address,
            history: [],
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setWalletInfo({
            address,
            chain: "Sui",
            riskScore: data.riskScore || data.walletInfo?.riskScore || 0,
            riskLevel: data.walletInfo?.riskLevel || "safe",
            isMalicious: data.walletInfo?.isMalicious || false,
            totalTransactions: data.walletInfo?.totalTransactions || 0,
            balance: data.walletInfo?.balance || "—",
          });
        }
      } catch (e) {
        console.error("Failed to fetch wallet info:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchWalletInfo();
  }, [address]);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card-premium p-4 space-y-4 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
            <Wallet className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-xs text-[#525880]">Connected Wallet</div>
            <div className="font-mono text-xs text-white">
              {address.slice(0, 8)}...{address.slice(-6)}
            </div>
          </div>
        </div>
        <button onClick={copyAddress} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5 text-[#525880]" />}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
        </div>
      ) : walletInfo ? (
        <>
          <RiskMeter score={walletInfo.riskScore} />
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Balance", value: walletInfo.balance || "—", icon: <Wallet className="w-3 h-3" /> },
              { label: "Transactions", value: walletInfo.totalTransactions?.toLocaleString() || "—", icon: <Activity className="w-3 h-3" /> },
              { label: "Chain", value: walletInfo.chain, icon: <Globe className="w-3 h-3" /> },
              { label: "Status", value: walletInfo.isMalicious ? "Flagged" : "Clean", icon: <Shield className="w-3 h-3" /> },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-[#0E1120] rounded-lg p-2.5 border border-white/5">
                <div className="flex items-center gap-1 text-[#525880] text-[10px] mb-1">
                  {icon}
                  {label}
                </div>
                <div className="text-white font-medium text-xs truncate">{value}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-xs text-[#525880] text-center py-4">
          Unable to fetch wallet data
        </div>
      )}
    </div>
  );
}

// ─── Chart Renderer ───────────────────────────────────────
function ChartRenderer({ chart }: { chart: NonNullable<MessageMetadata["charts"]>[0] }) {
  const tooltipStyle = {
    backgroundColor: "#1A1D2E",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    color: "#F0F1FF",
  };

  return (
    <div className="card-premium p-4">
      <div className="text-sm font-medium text-[#8B93C4] mb-3 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-cyan-400" />
        {chart.title}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        {chart.type === "area" ? (
          <AreaChart data={chart.data}>
            <defs>
              <linearGradient id="areaGradDash" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey={chart.xKey} tick={{ fill: "#525880", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#525880", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey={typeof chart.yKey === "string" ? chart.yKey : chart.yKey[0]} stroke="#00E5FF" strokeWidth={2} fill="url(#areaGradDash)" />
          </AreaChart>
        ) : chart.type === "bar" ? (
          <BarChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey={chart.xKey} tick={{ fill: "#525880", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#525880", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey={typeof chart.yKey === "string" ? chart.yKey : chart.yKey[0]} fill="#00E5FF" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey={chart.xKey} tick={{ fill: "#525880", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#525880", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey={typeof chart.yKey === "string" ? chart.yKey : chart.yKey[0]} stroke="#00E5FF" strokeWidth={2} dot={false} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────
type DashboardMessage = Message & { agentSteps?: AgentStep[]; onChainProof?: { blobId: string; storedAt: string; verificationUrl: string } };

function MessageBubble({ message }: { message: DashboardMessage }) {
  const [copied, setCopied] = useState(false);

  const copyContent = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <div key={i} className="font-bold text-white mt-3 mb-1">{line.slice(2, -2)}</div>;
      }
      if (line.startsWith("- ")) {
        return (
          <div key={i} className="flex gap-2 text-[#8B93C4] text-sm">
            <span className="text-cyan-400 mt-0.5">›</span>
            <span dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold text-white">$1</span>') }} />
          </div>
        );
      }
      if (line.startsWith("*") && !line.startsWith("**")) {
        return <div key={i} className="text-[#525880] text-xs italic mt-2">{line.slice(1, -1)}</div>;
      }
      if (line === "") return <div key={i} className="h-2" />;
      return (
        <div key={i} className="text-[#B0B8E0] text-sm leading-relaxed" dangerouslySetInnerHTML={{
          __html: line.replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold text-white">$1</span>').replace(/`(.*?)`/g, '<code class="font-mono text-xs bg-white/8 px-1.5 py-0.5 rounded text-cyan-300">$1</code>')
        }} />
      );
    });
  };

  if (message.role === "user") {
    return (
      <div className="flex justify-end gap-3 animate-slide-up">
        <div className="chat-bubble-user px-5 py-3.5 max-w-[80%] mt-1">
          <p className="text-white text-[15px] leading-relaxed">{message.content}</p>
        </div>
        <div className="w-10 h-10 rounded-full border border-[#FF007A]/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(255,0,122,0.3)] bg-[#FF007A]/10 mt-1">
          <User className="w-5 h-5 text-[#FF007A]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 animate-slide-up">
      <div className="w-10 h-10 rounded-full border border-[#00E5FF]/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(0,229,255,0.4)] bg-[#00E5FF]/10 mt-1">
        <img src="/logo.png" alt="SuiShield" className="w-6 h-6 object-contain drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]" />
      </div>
      <div className="flex-1 max-w-[90%] space-y-3">
        <div className="chat-bubble-ai px-5 py-4 space-y-1.5">
          {renderContent(message.content)}
        </div>
        {message.metadata?.charts?.map((chart, i) => (
          <ChartRenderer key={i} chart={chart} />
        ))}
        {message.metadata?.walletInfo && (
          <WalletOverviewCard address={message.metadata.walletInfo.address} />
        )}
        {message.metadata && (
          <div className="flex flex-wrap items-center gap-2">
            {message.metadata.sources?.map((src, i) => (
              <SourceBadge key={i} source={src} />
            ))}
            {message.metadata.toolsUsed && message.metadata.toolsUsed.length > 0 && (
              <div className="text-xs text-[#525880] font-mono flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {message.metadata.toolsUsed.join(", ")}
              </div>
            )}
            {message.metadata.executionTime && (
              <div className="text-xs text-[#525880] flex items-center gap-1 ml-auto">
                <Clock className="w-3 h-3" />
                {(message.metadata.executionTime / 1000).toFixed(2)}s
              </div>
            )}
            <button onClick={copyContent} className="p-1 rounded hover:bg-white/5 text-[#525880] hover:text-white transition-colors">
              {copied ? <Check className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Typing Indicator ─────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-10 h-10 rounded-full border border-[#00E5FF]/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(0,229,255,0.4)] bg-[#00E5FF]/10 mt-1">
        <img src="/logo.png" alt="SuiShield" className="w-6 h-6 object-contain drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]" />
      </div>
      <div className="chat-bubble-ai px-5 py-4 flex items-center gap-2">
        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
        <span className="text-[#525880] text-sm">Querying Walrus & Tatum...</span>
        <div className="flex gap-1 ml-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-typing-dot typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Quick Action Card ────────────────────────────────────
function QuickAction({ icon, title, description, href, color }: { icon: React.ReactNode; title: string; description: string; href: string; color: string }) {
  return (
    <Link href={href} className="group">
      <Floating3DCard className="card-premium p-4 cursor-pointer h-full" glowColor="rgba(0,229,255,0.15)">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-white text-sm mb-0.5 group-hover:text-cyan-300 transition-colors">{title}</div>
            <div className="text-[#525880] text-xs leading-relaxed">{description}</div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#525880] group-hover:text-cyan-400 transition-colors flex-shrink-0 mt-1" />
        </div>
      </Floating3DCard>
    </Link>
  );
}

// ─── Suggested Queries ────────────────────────────────────
const SUGGESTED_QUERIES = [
  { icon: <Shield className="w-4 h-4" />, text: "Is wallet 0x742d35Cc... safe to interact with?", color: "border-orange-500/20 hover:border-orange-500/40" },
  { icon: <TrendingUp className="w-4 h-4" />, text: "Show me SUI price history for 2026", color: "border-cyan-500/20 hover:border-cyan-500/40" },
  { icon: <Activity className="w-4 h-4" />, text: "What was Ethereum's daily TPS in Q1 2025?", color: "border-blue-500/20 hover:border-blue-500/40" },
  { icon: <Database className="w-4 h-4" />, text: "Top DeFi protocols on Sui by TVL", color: "border-magenta-500/20 hover:border-magenta-500/40" },
  { icon: <Search className="w-4 h-4" />, text: "Trace fund flow from suspicious address", color: "border-red-500/20 hover:border-red-500/40" },
  { icon: <Globe className="w-4 h-4" />, text: "Bitcoin transaction volume in 2024 vs 2025", color: "border-yellow-500/20 hover:border-yellow-500/40" },
];

// ─── Sidebar ──────────────────────────────────────────────
function Sidebar() {
  const [expanded, setExpanded] = useState<string | null>("tools");

  const sections = [
    {
      id: "tools",
      title: "Active Tatum Tools",
      icon: <Zap className="w-4 h-4 text-cyan-400" />,
      content: (
        <div className="space-y-1.5">
          {[
            "check_malicious_address",
            "get_transaction_history",
            "get_wallet_portfolio",
            "get_exchange_rate",
            "gateway_execute_rpc",
            "get_block_by_time",
          ].map((tool) => (
            <div key={tool} className="flex items-center gap-2 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse-glow" />
              <span className="font-mono text-[#8B93C4]">{tool}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "walrus",
      title: "Walrus Data Sources",
      icon: <Database className="w-4 h-4 text-magenta-400" />,
      content: (
        <div className="space-y-2">
          {[
            { name: "Sui Transactions", size: "80GB", status: "live" },
            { name: "BTC History", size: "4TB", status: "live" },
            { name: "ETH History", size: "5TB", status: "live" },
            { name: "Price OHLCV", size: "500GB", status: "live" },
          ].map((ds) => (
            <div key={ds.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-magenta-400" />
                <span className="text-[#8B93C4]">{ds.name}</span>
              </div>
              <span className="text-[#525880] font-mono">{ds.size}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "network",
      title: "Network Status",
      icon: <Activity className="w-4 h-4 text-green-400" />,
      content: (
        <div className="space-y-2">
          {[
            { label: "Tatum RPC", status: "Online", color: "text-cyan-400" },
            { label: "Walrus Aggregator", status: "Online", color: "text-magenta-400" },
            { label: "Sui Testnet", status: "Online", color: "text-blue-400" },
            { label: "MCP Server", status: "Ready", color: "text-orange-400" },
          ].map(({ label, status, color }) => (
            <div key={label} className="flex items-center justify-between text-xs">
              <span className="text-[#525880]">{label}</span>
              <span className={`font-medium ${color} flex items-center gap-1`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {status}
              </span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="w-72 flex-shrink-0 border-l border-white/5 p-4 space-y-3 overflow-y-auto scroll-area hidden lg:block">
      {/* Walrus proof banner */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500/8 to-magenta-500/5 border border-cyan-500/10 text-xs text-cyan-400 mb-4">
        <Database className="w-3.5 h-3.5" />
        <span>Data verified on Walrus</span>
      </div>

      {sections.map((section, idx) => (
        <div key={section.id} className={`p-4 rounded-2xl backdrop-blur-xl bg-[#080A14]/60 border ${idx === 0 ? 'border-cyan-500/15 shadow-[0_0_20px_rgba(0,229,255,0.08)]' : 'border-magenta-500/15 shadow-[0_0_20px_rgba(255,0,122,0.08)]'}`}>
          <button
            className="w-full flex items-center justify-between text-sm font-bold text-white mb-2"
            onClick={() => setExpanded(expanded === section.id ? null : section.id)}
          >
            <div className="flex items-center gap-2">
              {section.icon}
              {section.title}
            </div>
            <ChevronDown className={`w-4 h-4 text-[#525880] transition-transform ${expanded === section.id ? "rotate-180" : ""}`} />
          </button>
          {expanded === section.id && section.content}
        </div>
      ))}

      {/* Info */}
      <div className="card-premium p-3">
        <div className="flex gap-2 text-xs text-[#8B93C4]">
          <Info className="w-3 h-3 text-cyan-400 flex-shrink-0 mt-0.5" />
          <span>Queries for data older than 3 days are automatically routed to Walrus blobs, bypassing the Sui RPC pruning limit.</span>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────
export default function DashboardPage() {
  const { address: walletAddress } = useWalletAuth();
  const [messages, setMessages] = useState<DashboardMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Welcome to SuiShield Dashboard.

I'm your AI-powered blockchain analytics assistant. I can help you with:

- **Wallet Security** — check if an address is safe or malicious
- **Historical Data** — query months/years of blockchain history via Walrus
- **Price Analytics** — 4 years of crypto price data in 1-minute resolution
- **On-chain Trends** — TPS, TVL, active addresses, transaction volumes

I use Tatum's MCP server with 59 specialized blockchain tools and fetch historical data directly from Walrus decentralized storage.

What would you like to know?`,
      timestamp: new Date(),
      metadata: {
        sources: [
          { type: "tatum-mcp", label: "Tatum MCP Server" },
          { type: "walrus", label: "11TB Historical Dataset" },
        ],
        toolsUsed: [],
      },
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: DashboardMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input.trim(), history, walletAddress }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();

      const aiMessage: DashboardMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
        metadata: {
          sources: data.sources || [],
          toolsUsed: data.toolsUsed || [],
          executionTime: data.executionTime,
          riskScore: data.riskScore,
          walletInfo: data.walletInfo,
          charts: data.charts,
        },
        agentSteps: data.agentSteps,
        onChainProof: data.onChainProof,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: unknown) {
      const errorMessage: DashboardMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : String(error)}. Please check GROQ_API_KEY in .env.local.`,
        timestamp: new Date(),
        metadata: { sources: [], toolsUsed: [] },
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, walletAddress]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: "var(--bg-base)" }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute top-[60%] -right-[10%] w-[500px] h-[500px] bg-magenta-500/4 blur-[120px] rounded-full" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 py-3 border-b border-white/5 glass-bright">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 text-[#525880] hover:text-white transition-colors text-sm">
            <ChevronLeft className="w-4 h-4" />
            Home
          </Link>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/logo.png" alt="SuiShield" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(0,229,255,0.3)]" />
            </div>
            <div>
              <div className="text-white font-display font-bold text-sm leading-none">SuiShield</div>
              <div className="text-[#525880] text-xs mt-0.5">Dashboard</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ConnectWalletButton />
          <div className="hidden md:flex items-center gap-1.5 text-xs text-cyan-400">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Live</span>
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Quick Actions — shown when no user messages yet */}
          {messages.length === 1 && (
            <div className="px-5 pt-6 pb-2">
              <div className="max-w-4xl mx-auto">
                <div className="text-xs text-[#525880] mb-3 font-bold uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  Quick Actions
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <QuickAction
                    icon={<Search className="w-5 h-5 text-cyan-400" />}
                    title="Analyze Address"
                    description="Check if a Sui address is safe before interacting"
                    href="/analyze"
                    color="bg-cyan-500/10 border border-cyan-500/20"
                  />
                  <QuickAction
                    icon={<GitBranch className="w-5 h-5 text-magenta-400" />}
                    title="Trust Graph"
                    description="Trace fund flow and detect suspicious patterns"
                    href="/trust-graph"
                    color="bg-magenta-500/10 border border-magenta-500/20"
                  />
                  <QuickAction
                    icon={<Bell className="w-5 h-5 text-orange-400" />}
                    title="Monitor"
                    description="Get alerts when flagged addresses move funds"
                    href="/monitor"
                    color="bg-orange-500/10 border border-orange-500/20"
                  />
                  <QuickAction
                    icon={<Database className="w-5 h-5 text-blue-400" />}
                    title="Explore Datasets"
                    description="Browse 11TB+ of blockchain data on Walrus"
                    href="/explore"
                    color="bg-blue-500/10 border border-blue-500/20"
                  />
                  <QuickAction
                    icon={<Eye className="w-5 h-5 text-green-400" />}
                    title="Verify Proof"
                    description="Verify an analysis proof stored on Walrus"
                    href="/verify"
                    color="bg-green-500/10 border border-green-500/20"
                  />
                  <QuickAction
                    icon={<Activity className="w-5 h-5 text-purple-400" />}
                    title="Network Status"
                    description="Check Tatum RPC, Walrus, and Sui network health"
                    href="/api/health"
                    color="bg-purple-500/10 border border-purple-500/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scroll-area">
            <div className="max-w-4xl mx-auto w-full px-5 py-6 space-y-6">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Suggested queries */}
          {messages.length === 1 && (
            <div className="px-5 pb-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-xs text-[#525880] mb-3 font-bold uppercase tracking-wider flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-cyan-400" />
                  Try asking...
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUGGESTED_QUERIES.map(({ icon, text, color }) => (
                    <button
                      key={text}
                      onClick={() => handleSuggestion(text)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 group text-sm ${color} bg-[#1A1D2E]/40 hover:bg-[#1A1D2E]/80 backdrop-blur-sm`}
                    >
                      <span className="text-[#525880] group-hover:text-cyan-400 transition-colors flex-shrink-0">{icon}</span>
                      <span className="text-[#8B93C4] group-hover:text-white transition-colors leading-tight">{text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="px-5 pb-6 pt-2">
            <div className="relative max-w-4xl mx-auto flex items-end bg-[#1A1D2E]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about blockchain data..."
                className="flex-1 bg-transparent border-none text-white text-[15px] pl-5 pr-4 py-3 focus:outline-none resize-none"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`w-[44px] h-[44px] rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 mb-0.5 mr-0.5 ${
                  input.trim() && !isLoading
                    ? "bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] hover:scale-105"
                    : "bg-white/5 text-[#525880] cursor-not-allowed"
                }`}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <div className="text-xs text-[#525880] flex items-center gap-2">
                <span className="text-cyan-400 flex items-center gap-1"><Database className="w-3 h-3" /> Walrus</span>
                <span>·</span>
                <span className="text-cyan-400 flex items-center gap-1"><Zap className="w-3 h-3" /> Tatum MCP</span>
                <span>·</span>
                <span>Sui Testnet</span>
              </div>
              <div className="text-xs text-[#525880]">Enter to send</div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar />
      </div>
    </div>
  );
}
