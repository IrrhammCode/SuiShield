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
  Zap,
  Search,
  Loader2,
  Globe,
  Clock,
  Info,
  ChevronDown,
  User,
} from "lucide-react";
import type { Message, DataSource } from "@/types";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { useWalletAuth } from "@/context/WalletAuthContext";

// ─── Source Badge ─────────────────────────────────────────
function SourceBadge({ source }: { source: DataSource }) {
  const configs: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    walrus: { label: "Walrus", color: "text-white/50 border-white/10 bg-white/5", icon: <Database className="w-3 h-3" /> },
    "tatum-rpc": { label: "Tatum RPC", color: "text-white/80/70 border-white/[0.08] bg-cyan-500/5", icon: <Zap className="w-3 h-3" /> },
    "tatum-sui-rpc": { label: "Tatum Sui RPC", color: "text-white/80/70 border-white/[0.08] bg-cyan-500/5", icon: <Zap className="w-3 h-3" /> },
    "tatum-api": { label: "Tatum API", color: "text-white/80/70 border-white/[0.08] bg-cyan-500/5", icon: <Database className="w-3 h-3" /> },
    "tatum-mcp": { label: "Tatum MCP", color: "text-white/80/70 border-white/[0.08] bg-cyan-500/5", icon: <Brain className="w-3 h-3" /> },
    "walrus-dataset": { label: "Walrus Dataset", color: "text-white/50 border-white/10 bg-white/5", icon: <Database className="w-3 h-3" /> },
    agent: { label: "Agent", color: "text-white/50/70 border-white/[0.08] bg-magenta-500/5", icon: <Brain className="w-3 h-3" /> },
  };
  const config = configs[source.type] || configs["tatum-api"];
  return (
    <div className={`inline-flex items-center gap-1.5 text-[10px] border rounded-lg px-2 py-0.5 font-mono ${config.color}`}>
      {config.icon}
      <span>{source.label}</span>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────
function MessageBubble({ message }: { message: Message }) {
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
          <div key={i} className="flex gap-2 text-white/50 text-sm">
            <span className="text-white/80/60 mt-0.5">›</span>
            <span dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold text-white">$1</span>') }} />
          </div>
        );
      }
      if (line === "") return <div key={i} className="h-2" />;
      return (
        <div key={i} className="text-white/40 text-sm leading-relaxed" dangerouslySetInnerHTML={{
          __html: line.replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold text-white">$1</span>').replace(/`(.*?)`/g, '<code class="font-mono text-xs bg-white/5 px-1.5 py-0.5 rounded text-white/70/70">$1</code>')
        }} />
      );
    });
  };

  if (message.role === "user") {
    return (
      <div className="flex justify-end gap-3 animate-slide-up">
        <div className="rounded-2xl rounded-br-md px-5 py-3.5 max-w-[80%] bg-white/10 border border-white/10">
          <p className="text-white text-[15px] leading-relaxed">{message.content}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-4 h-4 text-white/40" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 animate-slide-up">
      <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-white/[0.08] flex items-center justify-center flex-shrink-0 mt-1">
        <img src="/logo.png" alt="SuiShield" className="w-5 h-5 object-contain" />
      </div>
      <div className="flex-1 max-w-[90%] space-y-3">
        <div className="rounded-2xl rounded-bl-md px-5 py-4 space-y-1.5 bg-white/[0.03] border border-white/5">
          {renderContent(message.content)}
        </div>
        {message.metadata && (
          <div className="flex flex-wrap items-center gap-2">
            {message.metadata.sources?.map((src, i) => <SourceBadge key={i} source={src} />)}
            {message.metadata.executionTime && (
              <div className="text-[10px] text-white/20 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {(message.metadata.executionTime / 1000).toFixed(2)}s
              </div>
            )}
            <button onClick={copyContent} className="p-1 rounded hover:bg-white/5 text-white/20 hover:text-white/50 transition-colors">
              {copied ? <Check className="w-3 h-3 text-white/80" /> : <Copy className="w-3 h-3" />}
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
      <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-white/[0.08] flex items-center justify-center flex-shrink-0 mt-1">
        <img src="/logo.png" alt="SuiShield" className="w-5 h-5 object-contain" />
      </div>
      <div className="rounded-2xl rounded-bl-md px-5 py-4 flex items-center gap-2 bg-white/[0.03] border border-white/5">
        <Loader2 className="w-4 h-4 text-white/80 animate-spin" />
        <span className="text-white/30 text-sm">Thinking...</span>
        <div className="flex gap-1 ml-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400/50 animate-typing-dot typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Suggested Queries ────────────────────────────────────
const SUGGESTED_QUERIES = [
  { icon: <Shield className="w-4 h-4" />, text: "Is wallet 0x742d35Cc... safe to interact with?", color: "border-white/[0.08] hover:border-magenta-500/40" },
  { icon: <TrendingUp className="w-4 h-4" />, text: "Show me SUI price history for 2026", color: "border-white/[0.08] hover:border-cyan-500/40" },
  { icon: <Activity className="w-4 h-4" />, text: "What was Ethereum's daily TPS in Q1 2025?", color: "border-white/[0.08] hover:border-cyan-500/40" },
  { icon: <Database className="w-4 h-4" />, text: "Top DeFi protocols on Sui by TVL", color: "border-white/[0.08] hover:border-magenta-500/40" },
  { icon: <Search className="w-4 h-4" />, text: "Trace fund flow from suspicious address", color: "border-white/[0.08] hover:border-magenta-500/40" },
  { icon: <Globe className="w-4 h-4" />, text: "Bitcoin transaction volume in 2024 vs 2025", color: "border-white/[0.08] hover:border-magenta-500/40" },
];

// ─── Right Info Panel ─────────────────────────────────────
function InfoPanel() {
  const [expanded, setExpanded] = useState<string | null>("tools");

  const sections = [
    {
      id: "tools",
      title: "Active Tatum Tools",
      icon: <Zap className="w-4 h-4 text-white/80" />,
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
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-mono text-white/40">{tool}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "walrus",
      title: "Walrus Data Sources",
      icon: <Database className="w-4 h-4 text-white/50" />,
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
                <span className="text-white/40">{ds.name}</span>
              </div>
              <span className="text-white/20 font-mono">{ds.size}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "network",
      title: "Network Status",
      icon: <Activity className="w-4 h-4 text-white/80" />,
      content: (
        <div className="space-y-2">
          {[
            { label: "Tatum RPC", status: "Online", color: "text-white/80" },
            { label: "Walrus Aggregator", status: "Online", color: "text-white/80" },
            { label: "Sui Mainnet", status: "Online", color: "text-white/80" },
            { label: "MCP Server", status: "Ready", color: "text-white/80" },
          ].map(({ label, status, color }) => (
            <div key={label} className="flex items-center justify-between text-xs">
              <span className="text-white/20">{label}</span>
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
      {sections.map((section, idx) => (
        <div key={section.id} className={`p-4 rounded-2xl backdrop-blur-xl bg-black/40 border ${idx === 0 ? 'border-white/[0.08]' : 'border-white/5'}`}>
          <button
            className="w-full flex items-center justify-between text-sm font-medium text-white mb-2"
            onClick={() => setExpanded(expanded === section.id ? null : section.id)}
          >
            <div className="flex items-center gap-2">
              {section.icon}
              {section.title}
            </div>
            <ChevronDown
              className={`w-4 h-4 text-white/20 transition-transform ${expanded === section.id ? "rotate-180" : ""}`}
            />
          </button>
          {expanded === section.id && section.content}
        </div>
      ))}

      {/* Info */}
      <div className="p-3 rounded-xl border border-cyan-500/10 bg-cyan-500/5">
        <div className="flex gap-2 text-xs text-white/40">
          <Info className="w-3 h-3 text-white/80 flex-shrink-0 mt-0.5" />
          <span>Queries for data older than 3 days are automatically routed to Walrus blobs, bypassing the Sui RPC pruning limit.</span>
        </div>
      </div>
    </div>
  );
}

// ─── Chat Page ─────────────────────────────────────────────
export default function ChatPage() {
  const { address: walletAddress } = useWalletAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Welcome to SuiShield!

I'm your AI-powered blockchain analytics assistant. I can answer questions about:

- **Wallet security** — check if an address is safe or malicious
- **Historical data** — query months/years of blockchain history (via Walrus)
- **Price analytics** — 4 years of crypto price data in 1-minute resolution
- **On-chain trends** — TPS, TVL, active addresses, transaction volumes

I use Tatum's MCP server with 59 specialized blockchain tools and fetch historical data directly from Walrus decentralized storage — breaking the 3-day RPC wall.

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
        body: JSON.stringify({ message: input.trim(), history, walletAddress }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json();

      const aiMessage: Message = {
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
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: unknown) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I encountered an error: ${(error instanceof Error ? error.message : String(error))}. Please check that GROQ_API_KEY is set in .env.local and try again.`,
        timestamp: new Date(),
        metadata: {
          sources: [],
          toolsUsed: [],
        },
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
    <>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 text-white/20 hover:text-white transition-colors text-sm">
            <ChevronLeft className="w-4 h-4" />
            Home
          </Link>
          <div className="w-px h-4 bg-white/10" />
          <div>
            <div className="text-white font-semibold text-sm">SuiShield Chat</div>
            <div className="text-white/20 text-xs">Powered by Tatum × Walrus</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ConnectWalletButton />
          <div className="hidden md:flex items-center gap-1.5 text-xs text-white/80">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Online</span>
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto scroll-area">
            <div className="max-w-4xl mx-auto w-full px-5 py-8 space-y-6">
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
              <div className="max-w-4xl mx-auto w-full">
                <div className="text-xs text-white/20 mb-3 font-medium uppercase tracking-wider">Try asking...</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUGGESTED_QUERIES.map(({ icon, text, color }) => (
                    <button
                      key={text}
                      onClick={() => handleSuggestion(text)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 group text-sm ${color} bg-white/[0.02] hover:bg-white/5`}
                    >
                      <span className="text-white/30 group-hover:text-white/80 transition-colors flex-shrink-0">{icon}</span>
                      <span className="text-white/40 group-hover:text-white transition-colors leading-tight">{text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="px-5 pb-6 pt-2">
            <div className="max-w-4xl mx-auto flex items-end gap-2 bg-white/[0.03] border border-white/5 rounded-2xl p-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message or command..."
                className="flex-1 bg-transparent border-none text-white text-sm pl-4 pr-4 py-3 focus:outline-none resize-none placeholder-white/20"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  input.trim() && !isLoading
                    ? "bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    : "bg-white/5 text-white/20 cursor-not-allowed"
                }`}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <div className="max-w-4xl mx-auto flex items-center justify-between mt-2 px-1">
              <div className="text-[10px] text-white/10 flex items-center gap-2">
                <span className="flex items-center gap-1"><Database className="w-3 h-3" /> Walrus</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Tatum</span>
                <span>·</span>
                <span>Sui Testnet</span>
              </div>
              <div className="text-[10px] text-white/10">Enter to send</div>
            </div>
          </div>
        </div>

        {/* Right Info Panel */}
        <InfoPanel />
      </div>
    </>
  );
}
