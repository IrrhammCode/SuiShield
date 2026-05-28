"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Database,
  Zap,
  Globe,
  Users,
  Search,
  Lock,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { DualWalletButton } from "@/components/WalletConnect";

// ─── Background ──────────────────────────────────────────
function Background() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute -top-[10%] -left-[10%] w-[700px] h-[700px] bg-[#00E5FF]/15 blur-[120px] rounded-full mix-blend-screen" />
      <div className="absolute top-[5%] -right-[10%] w-[600px] h-[600px] bg-[#FF007A]/10 blur-[120px] rounded-full mix-blend-screen" />
      <div className="absolute top-[45%] right-[-15%] w-[500px] h-[500px] rounded-full" style={{
        background: "radial-gradient(circle at 20% 20%, #00E5FF 0%, #00B8D4 40%, #080A14 80%)",
        boxShadow: "inset -20px -20px 60px rgba(0,0,0,0.8), 0 0 100px rgba(0, 229, 255, 0.15)",
        opacity: 0.6,
      }} />
    </div>
  );
}

// ─── Navbar ──────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "glass-bright py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)]" : "py-5"}`}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src="/logo.png" alt="SuiShield Logo" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(0,229,255,0.3)]" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">
            Sui<span className="text-cyan-400">Shield</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <DualWalletButton />
        </div>
      </div>
    </nav>
  );
}

// ─── Problem Card ────────────────────────────────────────
function ProblemCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/10 bg-red-500/5">
      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium text-white">{title}</div>
        <div className="text-xs text-[#8B93C4] mt-0.5">{description}</div>
      </div>
    </div>
  );
}

// ─── Solution Card ───────────────────────────────────────
function SolutionCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-magenta-500/10 bg-magenta-500/5">
      <div className="w-8 h-8 rounded-lg bg-magenta-500/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium text-white">{title}</div>
        <div className="text-xs text-[#8B93C4] mt-0.5">{description}</div>
      </div>
    </div>
  );
}

// ─── How It Works Step ───────────────────────────────────
function Step({ num, title, description }: { num: number; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm flex-shrink-0">
        {num}
      </div>
      <div>
        <div className="text-sm font-medium text-white">{title}</div>
        <div className="text-xs text-[#8B93C4] mt-0.5">{description}</div>
      </div>
    </div>
  );
}

// ─── Main Landing Page ───────────────────────────────────
export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "var(--bg-base)" }}>
      <Navbar />
      <Background />

      {/* HERO */}
      <section className="relative pt-32 pb-16 z-10">
        <div className="max-w-4xl mx-auto px-6 pt-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-xs text-cyan-400 mb-6">
            <Shield className="w-3.5 h-3.5" />
            Powered by Tatum Sui RPC + Walrus Storage
          </div>

          <h1 className="font-bold text-[40px] md:text-[60px] leading-[1.1] mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-[#00E5FF] via-[#00B8D4] to-[#FF007A] bg-clip-text text-transparent">
              Check Before
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#00E5FF] via-[#00B8D4] to-[#FF007A] bg-clip-text text-transparent">
              You Approve
            </span>
          </h1>

          <p className="text-[#8B93C4] text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-powered trust analysis for every Sui interaction. Paste any address. Get a verdict. Share the proof.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00E5FF] to-[#00B8D4] text-[#050505] font-medium text-[15px] py-3.5 px-8 rounded-full shadow-[0_0_30px_rgba(0,229,255,0.5)] hover:shadow-[0_0_40px_rgba(0,229,255,0.8)] transition-all"
            >
              <Search className="w-4 h-4" />
              Analyze an Address
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-[#8B93C4] hover:text-white text-[15px] transition-colors"
            >
              How it works
              <ChevronDown className="w-4 h-4" />
            </a>
          </div>

          {/* Demo Preview */}
          <div className="max-w-lg mx-auto">
            <div className="rounded-2xl border border-white/10 bg-[#0E1120]/80 backdrop-blur-md p-5 text-left">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-magenta-400 animate-pulse" />
                <span className="text-xs text-[#525880]">Live analysis result</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-magenta-400" />
                  <span className="text-magenta-400 font-bold text-lg">SAFE</span>
                </div>
                <span className="text-2xl font-bold text-magenta-400">82/100</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-4">
                <div className="h-full rounded-full bg-magenta-400" style={{ width: "82%" }} />
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-magenta-400"><CheckCircle className="w-3 h-3" /> Active since Jan 2024</div>
                <div className="flex items-center gap-2 text-magenta-400"><CheckCircle className="w-3 h-3" /> 1,247 transactions</div>
                <div className="flex items-center gap-2 text-yellow-400"><AlertTriangle className="w-3 h-3" /> 2 flagged counterparties</div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-[#525880] font-mono">0x7a8b...3c4d</span>
                <span className="text-[10px] text-magenta-400">Stored on Walrus</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="relative max-w-4xl mx-auto px-6 py-16 z-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-3">Every day, Sui users lose money</h2>
          <p className="text-[#8B93C4] text-sm max-w-xl mx-auto">
            No tool gives you a clear answer before you click. Existing explorers show raw data — not verdicts.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <ProblemCard
            icon={<XCircle className="w-4 h-4 text-red-400" />}
            title="Rug pulls disguised as yield farms"
            description="300% APY that collapses after you deposit"
          />
          <ProblemCard
            icon={<XCircle className="w-4 h-4 text-red-400" />}
            title="Fake NFT collections"
            description="Copycat names, wash trading, anonymous creators"
          />
          <ProblemCard
            icon={<XCircle className="w-4 h-4 text-red-400" />}
            title="Scam airdrops & phishing"
            description="DMs with malicious links that drain wallets"
          />
          <ProblemCard
            icon={<XCircle className="w-4 h-4 text-red-400" />}
            title="Unknown counterparty risk"
            description="P2P trading with wallets that have dirty history"
          />
        </div>
      </section>

      {/* SOLUTION */}
      <section className="relative max-w-4xl mx-auto px-6 py-16 z-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-3">SuiShield gives you a verdict</h2>
          <p className="text-[#8B93C4] text-sm max-w-xl mx-auto">
            Not raw data. Not charts. A clear answer: safe or not, with proof stored on-chain.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <SolutionCard
            icon={<Zap className="w-4 h-4 text-magenta-400" />}
            title="Real-time analysis via Tatum Sui RPC"
            description="Balance, objects, transactions — live from Sui mainnet"
          />
          <SolutionCard
            icon={<Database className="w-4 h-4 text-magenta-400" />}
            title="Historical patterns from Walrus datasets"
            description="Cross-reference with 11TB of blockchain history"
          />
          <SolutionCard
            icon={<Lock className="w-4 h-4 text-magenta-400" />}
            title="Verifiable on-chain proof"
            description="Every analysis stored on Walrus — immutable, shareable"
          />
          <SolutionCard
            icon={<Users className="w-4 h-4 text-magenta-400" />}
            title="Community-driven scam reports"
            description="Report scams, verify reports, protect others"
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative max-w-4xl mx-auto px-6 py-16 z-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-3">Three steps. Five seconds.</h2>
        </div>
        <div className="max-w-md mx-auto space-y-6">
          <Step num={1} title="Paste any Sui address" description="Wallet, contract, token, or NFT collection" />
          <Step num={2} title="AI analyzes everything" description="Tatum data + Walrus history + risk scoring" />
          <Step num={3} title="Get verdict + share proof" description="On-chain certificate stored on Walrus" />
        </div>
        <div className="text-center mt-10">
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00E5FF] to-[#00B8D4] text-[#050505] font-medium text-[15px] py-3.5 px-8 rounded-full shadow-[0_0_30px_rgba(0,229,255,0.5)] hover:shadow-[0_0_40px_rgba(0,229,255,0.8)] transition-all"
          >
            Try it now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* WHO ITS FOR */}
      <section className="relative max-w-4xl mx-auto px-6 py-16 z-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-3">Built for everyone on Sui</h2>
          <p className="text-[#8B93C4] text-sm max-w-xl mx-auto">
            Each analysis stored on-chain via Sui Move contract + Walrus. Verifiable by anyone.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              icon: <TrendingUp className="w-5 h-5" />,
              title: "DeFi Farmers",
              question: "Is this yield safe?",
              flow: "Paste pool address → Agent checks TVL trend, sustainability, concentration risk → Trust score stored on Sui contract → Full analysis on Walrus",
              contract: "analyze_wallet()",
              color: "cyan",
            },
            {
              icon: <Globe className="w-5 h-5" />,
              title: "NFT Buyers",
              question: "Is this creator legit?",
              flow: "Paste creator address → Agent checks wallet age, past projects, wash trading → Trust score on-chain → Report if scam via submit_report()",
              contract: "analyze_wallet() + submit_report()",
              color: "magenta",
            },
            {
              icon: <Users className="w-5 h-5" />,
              title: "P2P Traders",
              question: "Is this wallet clean?",
              flow: "Paste counterparty address → Agent checks money flow, scam database, network risk → Instant verdict from get_trust_score()",
              contract: "get_trust_score()",
              color: "blue",
            },
            {
              icon: <Shield className="w-5 h-5" />,
              title: "New Users",
              question: "Where do I start?",
              flow: "Paste any address → Simple safe/not verdict → Community-verified reports protect you → Learn from real scam examples",
              contract: "get_trust_score() + has_verified_reports()",
              color: "orange",
            },
          ].map(({ icon, title, question, flow, contract, color }) => (
            <Link
              key={title}
              href="/analyze"
              className={`card p-5 border transition-all hover:scale-[1.01] group text-left ${
                color === "cyan" ? "border-cyan-500/10 hover:border-cyan-500/30 bg-cyan-500/5" :
                color === "magenta" ? "border-magenta-500/10 hover:border-magenta-500/30 bg-magenta-500/5" :
                color === "blue" ? "border-blue-500/10 hover:border-blue-500/30 bg-blue-500/5" :
                "border-orange-500/10 hover:border-orange-500/30 bg-orange-500/5"
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  color === "cyan" ? "bg-cyan-500/10 text-cyan-400" :
                  color === "magenta" ? "bg-magenta-500/10 text-magenta-400" :
                  color === "blue" ? "bg-blue-500/10 text-blue-400" :
                  "bg-orange-500/10 text-orange-400"
                }`}>
                  {icon}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{title}</div>
                  <div className="text-xs text-cyan-400 font-medium mt-0.5">&ldquo;{question}&rdquo;</div>
                </div>
              </div>
              <div className="text-xs text-[#8B93C4] mb-3 leading-relaxed">{flow}</div>
              <div className="flex items-center justify-between">
                <code className="text-[10px] font-mono text-[#525880] bg-white/5 px-2 py-0.5 rounded">
                  {contract}
                </code>
                <span className="text-[10px] text-[#525880] group-hover:text-white transition-colors">
                  Try it →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TECH STACK */}
      <section className="relative max-w-4xl mx-auto px-6 py-16 z-10">
        <div className="border border-white/10 rounded-2xl bg-[#0E1120]/80 backdrop-blur-md p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: "Tatum Sui RPC", sub: "Real-time data", color: "text-cyan-400" },
              { label: "Walrus Storage", sub: "On-chain proof", color: "text-magenta-400" },
              { label: "Walrus Datasets", sub: "11TB historical", color: "text-magenta-400" },
              { label: "Sui Move", sub: "Trust contract", color: "text-blue-400" },
            ].map(({ label, sub, color }) => (
              <div key={label}>
                <div className={`text-sm font-medium ${color} mb-1`}>{label}</div>
                <div className="text-xs text-[#525880]">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative max-w-4xl mx-auto px-6 py-10 z-10 border-t border-white/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="SuiShield Logo" className="w-4 h-4 object-contain drop-shadow-[0_0_10px_rgba(0,229,255,0.3)]" />
            <span className="text-sm text-white font-medium">SuiShield</span>
            <span className="text-xs text-[#525880]">· Check Before You Approve</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#525880]">
            <a href="https://tatum.io" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Tatum</a>
            <a href="https://walrus.space" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Walrus</a>
            <a href="https://sui.io" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Sui</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
