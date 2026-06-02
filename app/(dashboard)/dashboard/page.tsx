"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Brain,
  Send,
  Database,
  Shield,
  TrendingUp,
  Copy,
  Check,
  Zap,
  Loader2,
  Clock,
  User,
  GitBranch,
} from "lucide-react";
import type { Message, DataSource } from "@/types";
import { useWalletAuth } from "@/context/WalletAuthContext";

// ─── Source Badge ─────────────────────────────────────────
function SourceBadge({ source }: { source: DataSource }) {
  const configs: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    walrus: { label: "Walrus", color: "text-white/50 border-white/10 bg-white/5", icon: <Database className="w-3 h-3" /> },
    "tatum-rpc": { label: "Tatum RPC", color: "text-cyan-400/70 border-cyan-500/20 bg-cyan-500/5", icon: <Zap className="w-3 h-3" /> },
    "tatum-sui-rpc": { label: "Tatum Sui RPC", color: "text-cyan-400/70 border-cyan-500/20 bg-cyan-500/5", icon: <Zap className="w-3 h-3" /> },
    "tatum-api": { label: "Tatum API", color: "text-cyan-400/70 border-cyan-500/20 bg-cyan-500/5", icon: <Database className="w-3 h-3" /> },
    "tatum-mcp": { label: "Tatum MCP", color: "text-cyan-400/70 border-cyan-500/20 bg-cyan-500/5", icon: <Brain className="w-3 h-3" /> },
    "walrus-dataset": { label: "Walrus Dataset", color: "text-white/50 border-white/10 bg-white/5", icon: <Database className="w-3 h-3" /> },
    agent: { label: "Agent", color: "text-magenta-400/70 border-magenta-500/20 bg-magenta-500/5", icon: <Brain className="w-3 h-3" /> },
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
            <span className="text-cyan-400/60 mt-0.5">›</span>
            <span dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold text-white">$1</span>') }} />
          </div>
        );
      }
      if (line === "") return <div key={i} className="h-2" />;
      return (
        <div key={i} className="text-white/40 text-sm leading-relaxed" dangerouslySetInnerHTML={{
          __html: line.replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold text-white">$1</span>').replace(/`(.*?)`/g, '<code class="font-mono text-xs bg-white/5 px-1.5 py-0.5 rounded text-cyan-300/70">$1</code>')
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
      <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-1">
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
      <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-1">
        <img src="/logo.png" alt="SuiShield" className="w-5 h-5 object-contain" />
      </div>
      <div className="rounded-2xl rounded-bl-md px-5 py-4 flex items-center gap-2 bg-white/[0.03] border border-white/5">
        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
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
  { icon: <Shield className="w-4 h-4" />, text: "Is this wallet safe to interact with?" },
  { icon: <TrendingUp className="w-4 h-4" />, text: "Show me SUI price history" },
  { icon: <GitBranch className="w-4 h-4" />, text: "Trace fund flow from address" },
  { icon: <Database className="w-4 h-4" />, text: "Top DeFi protocols on Sui" },
];

// ─── Dashboard Page ───────────────────────────────────────
export default function DashboardPage() {
  const { address: walletAddress } = useWalletAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Welcome to SuiShield.

I'm your AI blockchain analytics assistant. I can help you with:

- **Wallet Security** — check if an address is safe or malicious
- **Historical Data** — query blockchain history via Walrus
- **Price Analytics** — crypto price data and trends
- **On-chain Analysis** — TPS, TVL, active addresses

What would you like to know?`,
      timestamp: new Date(),
      metadata: {
        sources: [
          { type: "tatum-mcp", label: "Tatum MCP" },
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

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input.trim(), timestamp: new Date() };
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
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
        metadata: { sources: data.sources || [], toolsUsed: data.toolsUsed || [], executionTime: data.executionTime, riskScore: data.riskScore, walletInfo: data.walletInfo, charts: data.charts },
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: unknown) {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : String(error)}. Check GROQ_API_KEY in .env.local.`,
        timestamp: new Date(),
        metadata: { sources: [], toolsUsed: [] },
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, walletAddress]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div>
          <div className="font-display font-black text-white text-sm">AI Assistant</div>
          <div className="text-[10px] text-white/20">Powered by Groq + Tatum + Walrus</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] text-cyan-400">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-medium">Online</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto scroll-area">
        <div className="max-w-3xl mx-auto w-full px-6 py-8 space-y-6">
          {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Queries */}
      {messages.length === 1 && (
        <div className="px-6 pb-3">
          <div className="max-w-3xl mx-auto flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map(({ icon, text }) => (
              <button
                key={text}
                onClick={() => { setInput(text); inputRef.current?.focus(); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/5 bg-white/[0.02] text-xs text-white/40 hover:text-white hover:border-white/10 hover:bg-white/5 transition-all"
              >
                {icon}
                {text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="px-6 pb-6 pt-2">
        <div className="max-w-3xl mx-auto flex items-end gap-2 bg-white/[0.03] border border-white/5 rounded-2xl p-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about blockchain data..."
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
        <div className="max-w-3xl mx-auto flex items-center justify-between mt-2 px-1">
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
    </>
  );
}
