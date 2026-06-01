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
  LogOut,
  Globe,
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

// ─── Agent Steps Visualizer ──────────────────────────────
function AgentStepsVisualizer({ steps }: { steps: AgentStep[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card p-3 border-purple-500/20 bg-purple-500/5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-xs"
      >
        <div className="flex items-center gap-2 text-purple-400 font-medium">
          <Zap className="w-3.5 h-3.5" />
          Agent executed {steps.length} tool{steps.length !== 1 ? "s" : ""}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#525880] transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>
      {expanded && (
        <div className="mt-3 space-y-2">
          {steps.map((step) => (
            <div
              key={step.step}
              className="flex items-start gap-2 text-xs"
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                  step.status === "success"
                    ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {step.step}
              </div>
              <div>
                <span className="font-mono text-[#8B93C4]">{step.tool}</span>
                <div className="text-[#525880] mt-0.5">{step.summary}</div>
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
  const configs: Record<string, { label: string; color: string; icon: string }> = {
    walrus: { label: "Walrus", color: "text-teal-400 border-teal-500/30 bg-teal-500/10", icon: "⬡" },
    "tatum-rpc": { label: "Tatum RPC", color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10", icon: "⚡" },
    "tatum-sui-rpc": { label: "Tatum Sui RPC", color: "text-blue-400 border-blue-500/30 bg-blue-500/10", icon: "🔷" },
    "tatum-api": { label: "Tatum API", color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10", icon: "📡" },
    "tatum-mcp": { label: "Tatum MCP", color: "text-blue-400 border-blue-500/30 bg-blue-500/10", icon: "🤖" },
    "walrus-dataset": { label: "Walrus Dataset", color: "text-magenta-400 border-magenta-500/30 bg-magenta-500/10", icon: "📊" },
    agent: { label: "Agent", color: "text-orange-400 border-orange-500/30 bg-orange-500/10", icon: "🤖" },
  };
  const config = configs[source.type] || configs["tatum-api"];

  return (
    <div className={`inline-flex items-center gap-1.5 text-xs border rounded-lg px-2 py-1 font-mono ${config.color}`}>
      <span>{config.icon}</span>
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
        <span className="font-bold text-lg" style={{ color: getColor() }}>
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
    <div className="card p-4 space-y-4 h-full">
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
          {copied ? <Check className="w-3.5 h-3.5 text-magenta-400" /> : <Copy className="w-3.5 h-3.5 text-[#525880]" />}
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
    <div className="card p-4">
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
            <Area
              type="monotone"
              dataKey={typeof chart.yKey === "string" ? chart.yKey : chart.yKey[0]}
              stroke="#00E5FF"
              strokeWidth={2}
              fill="url(#areaGradDash)"
            />
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
            <span dangerouslySetInnerHTML={{
              __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold text-white">$1</span>')
            }} />
          </div>
        );
      }
      if (line.startsWith("*") && !line.startsWith("**")) {
        return <div key={i} className="text-[#525880] text-xs italic mt-2">{line.slice(1, -1)}</div>;
      }
      if (line === "") return <div key={i} className="h-2" />;
      return (
        <div key={i} className="text-[#B0B8E0] text-sm leading-relaxed" dangerouslySetInnerHTML={{
          __html: line.replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold text-white">$1</span>')
            .replace(/`(.*?)`/g, '<code class="font-mono text-xs bg-white/8 px-1.5 py-0.5 rounded text-teal-300">$1</code>')
        }} />
      );
    });
  };

  if (message.role === "user") {
    return (
      <div className="flex justify-end gap-3 animate-slide-up">
        <div className="bg-[#FF007A]/10 border border-[#FF007A]/20 rounded-2xl rounded-tr-sm px-5 py-3.5 max-w-[80%]">
          <p className="text-white text-[15px] leading-relaxed">{message.content}</p>
        </div>
        <div className="w-8 h-8 rounded-full border border-[#FF007A]/40 flex items-center justify-center flex-shrink-0 bg-[#FF007A]/10">
          <User className="w-4 h-4 text-[#FF007A]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 animate-slide-up">
      <div className="w-8 h-8 rounded-full border border-[#00E5FF]/40 flex items-center justify-center flex-shrink-0 bg-[#00E5FF]/10">
        <img src="/logo.png" alt="SuiShield Logo" className="w-5 h-5 object-contain drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]" />
      </div>

      <div className="flex-1 max-w-[90%] space-y-3">
        <div className="bg-[#1A1D2E]/60 border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4 space-y-1.5">
          {renderContent(message.content)}
        </div>

        {message.metadata?.charts?.map((chart, i) => (
          <ChartRenderer key={i} chart={chart} />
        ))}

        {message.agentSteps && message.agentSteps.length > 0 && (
          <AgentStepsVisualizer steps={message.agentSteps} />
        )}

        {/* On-chain proof */}
        {message.onChainProof && (
          <div className="card p-3 border-magenta-500/20 bg-magenta-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-magenta-400">⬡</span>
                <span className="text-magenta-400 font-medium">Stored on Walrus</span>
                <span className="font-mono text-[#525880]">
                  {message.onChainProof.blobId.slice(0, 12)}...
                </span>
              </div>
              <a
                href={message.onChainProof.verificationUrl}
                className="text-xs text-magenta-400 hover:text-magenta-300 transition-colors flex items-center gap-1"
              >
                Verify
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {message.metadata && (
          <div className="flex flex-wrap items-center gap-2">
            {message.metadata.sources?.map((src, i) => (
              <SourceBadge key={i} source={src} />
            ))}
            {message.metadata.executionTime && (
              <div className="text-xs text-[#525880] flex items-center gap-1 ml-auto">
                <Clock className="w-3 h-3" />
                {(message.metadata.executionTime / 1000).toFixed(2)}s
              </div>
            )}
            <button onClick={copyContent} className="p-1 rounded hover:bg-white/5 text-[#525880] hover:text-white transition-colors">
              {copied ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
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
      <div className="w-8 h-8 rounded-full border border-[#00E5FF]/40 flex items-center justify-center flex-shrink-0 bg-[#00E5FF]/10">
        <img src="/logo.png" alt="SuiShield Logo" className="w-5 h-5 object-contain drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]" />
      </div>
      <div className="bg-[#1A1D2E]/60 border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2">
        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
        <span className="text-[#525880] text-sm">Agent is thinking...</span>
        <div className="flex gap-1 ml-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-typing-dot typing-dot"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Suggested Queries ────────────────────────────────────
const SUGGESTED_QUERIES = [
  { icon: <Shield className="w-4 h-4" />, text: "Analyze my Sui wallet" },
  { icon: <Activity className="w-4 h-4" />, text: "Show my Sui objects and NFTs" },
  { icon: <TrendingUp className="w-4 h-4" />, text: "What's the Sui network status?" },
  { icon: <Zap className="w-4 h-4" />, text: "Check my recent Sui transactions" },
];

// ─── Dashboard Page ───────────────────────────────────────
export default function DashboardPage() {
  const { address, isConnected } = useWalletAuth();
  const [messages, setMessages] = useState<DashboardMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Welcome to **SuiShield** — Check Before You Approve!

I'm a Sui blockchain intelligence agent powered by **Tatum Sui RPC** and **Walrus decentralized storage**.

**What I can do:**
- **Analyze Sui wallets** — risk scoring, object analysis, transaction patterns
- **Store on-chain proof** — every analysis stored permanently on Walrus
- **Recall previous analyses** — agent memory across sessions
- **Verify results** — anyone can verify from the blockchain

**Try these:**
- Paste a Sui address to analyze
- "What's the Sui network status?"
- "Check balance of 0x..."`,
      timestamp: new Date(),
      metadata: {
        sources: [
          { type: "agent", label: "SuiShield Agent" },
          { type: "tatum-rpc", label: "Tatum RPC" },
          { type: "walrus", label: "Walrus Storage" },
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

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      window.location.href = "/";
    }
  }, [isConnected]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input.trim(), history, walletAddress: address }),
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
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : String(error)}. Make sure GROQ_API_KEY is set in .env.local.`,
        timestamp: new Date(),
        metadata: { sources: [], toolsUsed: [] },
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, address]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#080A14]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 glass-bright z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/logo.png" alt="SuiShield Logo" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(0,229,255,0.3)]" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm leading-none">SuiShield</div>
              <div className="text-[#525880] text-xs mt-0.5">Check Before You Approve</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {address && (
            <div className="hidden md:flex items-center gap-2 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-magenta-400 animate-pulse" />
              <span className="text-magenta-400 font-mono">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </div>
          )}
          <ConnectWalletButton />
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto scroll-area">
            <div className="max-w-3xl mx-auto w-full px-5 py-6 space-y-5">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Suggested queries */}
          {messages.length === 1 && (
            <div className="px-5 pb-3">
              <div className="max-w-3xl mx-auto w-full">
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTED_QUERIES.map(({ icon, text }) => (
                    <button
                      key={text}
                      onClick={() => {
                        setInput(text);
                        inputRef.current?.focus();
                      }}
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-white/5 text-left transition-all duration-200 group text-sm bg-[#1A1D2E]/40 hover:bg-[#1A1D2E]/80 hover:border-white/10"
                    >
                      <span className="text-[#525880] group-hover:text-cyan-400 transition-colors">{icon}</span>
                      <span className="text-[#8B93C4] group-hover:text-white transition-colors text-xs">{text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="px-5 pb-5 pt-2">
            <div className="relative max-w-3xl mx-auto flex items-end bg-[#1A1D2E]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask the agent anything..."
                className="flex-1 bg-transparent border-none text-white text-sm pl-4 pr-4 py-3 focus:outline-none resize-none"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`w-[38px] h-[38px] rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 mb-0.5 mr-0.5 ${
                  input.trim() && !isLoading
                    ? "bg-gradient-to-br from-[#00E5FF] to-[#00B8D4] text-[#050505] shadow-[0_0_20px_rgba(0,229,255,0.5)] hover:shadow-[0_0_30px_rgba(0,229,255,0.8)]"
                    : "bg-white/5 text-[#525880] cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-center mt-2 gap-3 text-[10px] text-[#525880]">
              <span className="text-teal-400">⬡ Walrus</span>
              <span>·</span>
              <span className="text-purple-400">⚡ Tatum</span>
              <span>·</span>
              <span>Agent Mode</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 border-l border-white/5 p-4 space-y-4 overflow-y-auto scroll-area hidden lg:block">
          {address && <WalletOverviewCard address={address} />}

          {/* Agent Status */}
          <div className="card p-4 border-cyan-500/20 bg-cyan-500/5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-white">Agent Tools</span>
            </div>
            <div className="space-y-1.5">
              {[
                "getSuiBalance",
                "getSuiObjects",
                "getSuiTransactions",
                "analyzeSuiWallet",
                "getSuiNetworkStatus",
                "storeOnWalrus",
              ].map((tool) => (
                <div key={tool} className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-magenta-400 animate-pulse-glow" />
                  <span className="font-mono text-[#8B93C4]">{tool}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Data Sources */}
          <div className="card p-4 border-magenta-500/20 bg-magenta-500/5">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-4 h-4 text-magenta-400" />
              <span className="text-sm font-medium text-white">Data Sources</span>
            </div>
            <div className="space-y-2">
              {[
                { name: "Tatum Sui RPC", status: "Online" },
                { name: "Walrus Publisher", status: "Online" },
                { name: "Walrus Aggregator", status: "Online" },
                { name: "Groq LLM", status: "Online" },
              ].map(({ name, status }) => (
                <div key={name} className="flex items-center justify-between text-xs">
                  <span className="text-[#8B93C4]">{name}</span>
                  <span className="text-magenta-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-magenta-400 animate-pulse" />
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-3 border-cyan-500/10 bg-cyan-500/5">
            <div className="flex gap-2 text-xs text-[#8B93C4]">
              <Info className="w-3 h-3 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>Agent autonomously selects and executes blockchain tools based on your query intent.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
