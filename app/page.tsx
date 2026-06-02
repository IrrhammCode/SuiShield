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
  ExternalLink,
  Activity,
  Eye,
  Layers,
  GitBranch,
} from "lucide-react";
import { DualWalletButton } from "@/components/WalletConnect";
import { SubtleStars } from "@/components/Galaxy";

// ─── Navbar ───────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "backdrop-blur-xl bg-black/60 border-b border-white/[0.06] py-4" : "py-6"}`}>
      <div className="max-w-6xl mx-auto px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <img src="/logo.png" alt="SuiShield" className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-black text-white text-xl tracking-tight">
            SuiShield
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/trust-graph" className="text-white/30 hover:text-white text-sm transition-colors hidden sm:block font-bold">Trust Graph</Link>
          <Link href="/explore" className="text-white/30 hover:text-white text-sm transition-colors hidden sm:block font-bold">Explore</Link>
          <Link href="/dashboard" className="text-white/30 hover:text-white text-sm transition-colors hidden sm:block font-bold">Dashboard</Link>
          <DualWalletButton />
        </div>
      </div>
    </nav>
  );
}

// ─── Main Landing Page ───────────────────────────────────
export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <Navbar />
      <SubtleStars />

      {/* ═══ GLOBAL GRADIENT BACKGROUND ═══ */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Top-left cyan glow */}
        <div className="absolute -top-[20%] -left-[15%] w-[800px] h-[800px] bg-gradient-to-br from-cyan-500/20 via-cyan-500/5 to-transparent rounded-full blur-[150px]" />
        {/* Top-right magenta glow */}
        <div className="absolute -top-[10%] -right-[15%] w-[600px] h-[600px] bg-gradient-to-bl from-magenta-500/15 via-magenta-500/5 to-transparent rounded-full blur-[120px]" />
        {/* Center subtle purple */}
        <div className="absolute top-[40%] left-[30%] w-[500px] h-[500px] bg-gradient-to-r from-magenta-500/10 via-transparent to-cyan-500/10 rounded-full blur-[100px]" />
        {/* Bottom cyan glow */}
        <div className="absolute -bottom-[10%] left-[20%] w-[600px] h-[600px] bg-gradient-to-t from-cyan-500/10 via-transparent to-transparent rounded-full blur-[120px]" />
        {/* Bottom-right magenta glow */}
        <div className="absolute -bottom-[15%] -right-[10%] w-[500px] h-[500px] bg-gradient-to-tl from-magenta-500/10 via-transparent to-transparent rounded-full blur-[100px]" />
        {/* Grid overlay */}
        <div className="absolute inset-0 grid-bg opacity-30" />
      </div>

      {/* ═══ HERO ═══ */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/[0.08] bg-gradient-to-r from-cyan-500/10 via-white/[0.03] to-magenta-500/10 text-xs text-white/50 mb-10 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-magenta-400 animate-pulse" />
            <span className="font-bold uppercase tracking-widest bg-gradient-to-r from-cyan-300 to-magenta-300 bg-clip-text text-transparent">Powered by Tatum + Walrus</span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-black text-[60px] md:text-[96px] leading-[0.95] tracking-[-0.04em] mb-8">
            <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">Check</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-cyan-200 to-magenta-400 bg-clip-text text-transparent">Before You Approve</span>
          </h1>

          {/* Subtitle */}
          <p className="text-white/30 text-xl md:text-2xl max-w-xl mx-auto mb-14 leading-relaxed font-medium">
            AI-powered trust analysis for every Sui interaction.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/analyze"
              className="group relative inline-flex items-center gap-3 text-lg py-5 px-10 rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-black font-black hover:from-cyan-300 hover:to-cyan-400 transition-all shadow-[0_0_40px_rgba(0,229,255,0.3)] hover:shadow-[0_0_60px_rgba(0,229,255,0.5)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <Search className="w-5 h-5" />
              Analyze Address
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/trust-graph"
              className="group inline-flex items-center gap-3 text-lg py-5 px-10 rounded-2xl bg-white/[0.03] text-white font-black border border-white/[0.08] hover:border-cyan-500/30 hover:bg-white/[0.06] transition-all hover:shadow-[0_0_30px_rgba(0,229,255,0.1)]"
            >
              <GitBranch className="w-5 h-5 text-cyan-400" />
              Trust Graph
            </Link>
          </div>

          {/* Live Demo Card */}
          <div className="max-w-md mx-auto">
            <div className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-cyan-500/[0.03] p-6 text-left backdrop-blur-xl overflow-hidden">
              {/* Card gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
              <div className="absolute -top-[50%] -right-[50%] w-[200px] h-[200px] bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-full blur-[60px]" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-400 animate-pulse" />
                  <span className="text-[10px] text-white/30 font-bold uppercase tracking-[0.15em]">Live Analysis</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-cyan-400 font-display font-black text-sm">SAFE</div>
                      <div className="text-white/20 text-[10px]">Low Risk</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-display font-black bg-gradient-to-r from-cyan-400 to-cyan-400 bg-clip-text text-transparent">82</span>
                    <span className="text-white/20 text-sm">/100</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full mb-4 overflow-hidden">
                  <div className="h-full w-[82%] bg-gradient-to-r from-cyan-400 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(0,255,157,0.5)]" />
                </div>
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-cyan-400/80">
                    <CheckCircle className="w-3 h-3" />
                    <span>Active since Jan 2024</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-cyan-400/80">
                    <CheckCircle className="w-3 h-3" />
                    <span>1,247 transactions</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-magenta-400/80">
                    <AlertTriangle className="w-3 h-3" />
                    <span>2 flagged counterparties</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
                  <span className="text-[10px] text-white/15 font-mono">0x7a8b...3c4d</span>
                  <div className="flex items-center gap-1 text-[10px]">
                    <Database className="w-3 h-3 text-cyan-400/50" />
                    <span className="bg-gradient-to-r from-cyan-400/50 to-magenta-400/50 bg-clip-text text-transparent font-medium">Stored on Walrus</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="relative z-10 py-20 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { value: "11TB+", label: "Blockchain Data", color: "from-cyan-400 to-cyan-300" },
              { value: "4", label: "Chains", color: "from-magenta-400 to-magenta-300" },
              { value: "59", label: "AI Tools", color: "from-magenta-400 to-magenta-300" },
              { value: "∞", label: "Storage", color: "from-cyan-400 to-magenta-400" },
            ].map(({ value, label, color }) => (
              <div key={label} className="text-center group">
                <div className={`font-display font-black text-5xl md:text-6xl mb-2 bg-gradient-to-b ${color} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}>{value}</div>
                <div className="text-white/15 text-xs uppercase tracking-[0.2em] font-bold">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROBLEM ═══ */}
      <section className="relative z-10 py-24">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-magenta-500/10 via-magenta-500/10 to-magenta-500/10 border border-white/[0.06] text-xs text-white/30 font-bold uppercase tracking-[0.15em] mb-6">
              <AlertTriangle className="w-3 h-3 text-magenta-400" />
              The Problem
            </div>
            <h2 className="font-display font-black text-4xl md:text-5xl text-white tracking-tight">
              Every day, Sui users<br />
              <span className="bg-gradient-to-r from-magenta-400 via-magenta-400 to-magenta-400 bg-clip-text text-transparent">lose money</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              { icon: <XCircle className="w-5 h-5" />, title: "Rug pulls disguised as yield farms", desc: "300% APY that collapses after you deposit" },
              { icon: <XCircle className="w-5 h-5" />, title: "Fake NFT collections", desc: "Copycat names, wash trading, anonymous creators" },
              { icon: <XCircle className="w-5 h-5" />, title: "Scam airdrops and phishing", desc: "DMs with malicious links that drain wallets" },
              { icon: <XCircle className="w-5 h-5" />, title: "Unknown counterparty risk", desc: "P2P trading with wallets that have dirty history" },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="group flex items-start gap-4 p-6 rounded-2xl border border-white/[0.04] bg-gradient-to-br from-white/[0.02] to-magenta-500/[0.02] hover:border-magenta-500/20 hover:from-magenta-500/[0.04] hover:to-transparent transition-all duration-300">
                <div className="text-magenta-400/50 group-hover:text-magenta-400 transition-colors mt-0.5">{icon}</div>
                <div>
                  <div className="text-sm font-bold text-white mb-1">{title}</div>
                  <div className="text-xs text-white/20 leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SOLUTION ═══ */}
      <section className="relative z-10 py-24 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-magenta-500/10 border border-white/[0.06] text-xs text-white/30 font-bold uppercase tracking-[0.15em] mb-6">
              <Shield className="w-3 h-3 text-cyan-400" />
              The Solution
            </div>
            <h2 className="font-display font-black text-4xl md:text-5xl text-white tracking-tight">
              SuiShield gives you<br />
              <span className="bg-gradient-to-r from-cyan-400 via-cyan-200 to-magenta-400 bg-clip-text text-transparent">a verdict</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              { icon: <Zap className="w-5 h-5" />, title: "Real-time via Tatum", desc: "Balance, objects, transactions — live from Sui mainnet through Tatum enterprise infrastructure.", gradient: "from-cyan-500/10 to-cyan-500/5", border: "hover:border-cyan-500/20", iconColor: "text-cyan-400" },
              { icon: <Database className="w-5 h-5" />, title: "Historical via Walrus", desc: "Cross-reference with 11TB+ of blockchain history stored on Walrus decentralized storage.", gradient: "from-magenta-500/10 to-magenta-500/5", border: "hover:border-magenta-500/20", iconColor: "text-magenta-400" },
              { icon: <Lock className="w-5 h-5" />, title: "Verifiable Proof", desc: "Every analysis stored on Walrus — immutable, shareable, cryptographically verifiable.", gradient: "from-cyan-500/10 to-cyan-500/5", border: "hover:border-cyan-500/20", iconColor: "text-cyan-400" },
              { icon: <GitBranch className="w-5 h-5" />, title: "Trust Graph", desc: "Trace fund flow patterns, detect suspicious clusters, visualize address relationships.", gradient: "from-magenta-500/10 to-magenta-500/5", border: "hover:border-magenta-500/20", iconColor: "text-magenta-400" },
            ].map(({ icon, title, desc, gradient, border, iconColor }) => (
              <div key={title} className={`group p-6 rounded-2xl border border-white/[0.04] bg-gradient-to-br ${gradient} ${border} transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,229,255,0.05)]`}>
                <div className={`w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center ${iconColor} mb-4 group-hover:scale-110 transition-transform`}>
                  {icon}
                </div>
                <h3 className="font-display font-black text-white text-lg mb-2">{title}</h3>
                <p className="text-white/20 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="relative z-10 py-24">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-magenta-500/10 border border-white/[0.06] text-xs text-white/30 font-bold uppercase tracking-[0.15em] mb-6">
              <Layers className="w-3 h-3 text-cyan-400" />
              How It Works
            </div>
            <h2 className="font-display font-black text-4xl md:text-5xl text-white tracking-tight">
              Three steps. <span className="bg-gradient-to-r from-cyan-400 to-magenta-400 bg-clip-text text-transparent">Five seconds.</span>
            </h2>
          </div>
          <div className="max-w-lg mx-auto space-y-10">
            {[
              { num: "01", title: "Paste any Sui address", desc: "Wallet, contract, token, or NFT collection.", color: "from-cyan-400 to-cyan-300" },
              { num: "02", title: "AI analyzes everything", desc: "Tatum RPC data + Walrus history + multi-signal risk scoring.", color: "from-magenta-400 to-magenta-300" },
              { num: "03", title: "Get verdict + share proof", desc: "On-chain certificate stored on Walrus.", color: "from-magenta-400 to-magenta-300" },
            ].map(({ num, title, desc, color }) => (
              <div key={num} className="flex items-start gap-6 group">
                <div className={`font-display font-black text-3xl bg-gradient-to-b ${color} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 w-16 flex-shrink-0`}>
                  {num}
                </div>
                <div>
                  <div className="font-display font-black text-white text-xl mb-1">{title}</div>
                  <div className="text-white/20 text-sm leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-16">
            <Link
              href="/analyze"
              className="group relative inline-flex items-center gap-3 text-lg py-5 px-12 rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-black font-black hover:from-cyan-300 hover:to-cyan-400 transition-all shadow-[0_0_40px_rgba(0,229,255,0.3)] hover:shadow-[0_0_60px_rgba(0,229,255,0.5)] hover:scale-[1.02] active:scale-[0.98]"
            >
              Try it now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ USE CASES ═══ */}
      <section className="relative z-10 py-24 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-magenta-500/10 border border-white/[0.06] text-xs text-white/30 font-bold uppercase tracking-[0.15em] mb-6">
              <Eye className="w-3 h-3 text-cyan-400" />
              Use Cases
            </div>
            <h2 className="font-display font-black text-4xl md:text-5xl text-white tracking-tight">
              Built for <span className="bg-gradient-to-r from-cyan-400 via-magenta-400 to-magenta-400 bg-clip-text text-transparent">everyone on Sui</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              { icon: <TrendingUp className="w-5 h-5" />, title: "DeFi Farmers", question: "Is this yield safe?", gradient: "from-cyan-500/10 to-cyan-500/5", border: "hover:border-cyan-500/20", iconColor: "text-cyan-400" },
              { icon: <Globe className="w-5 h-5" />, title: "NFT Buyers", question: "Is this creator legit?", gradient: "from-magenta-500/10 to-magenta-500/5", border: "hover:border-magenta-500/20", iconColor: "text-magenta-400" },
              { icon: <Users className="w-5 h-5" />, title: "P2P Traders", question: "Is this wallet clean?", gradient: "from-magenta-500/10 to-magenta-500/5", border: "hover:border-magenta-500/20", iconColor: "text-magenta-400" },
              { icon: <Shield className="w-5 h-5" />, title: "New Users", question: "Where do I start?", gradient: "from-cyan-500/10 to-cyan-500/5", border: "hover:border-cyan-500/20", iconColor: "text-cyan-400" },
            ].map(({ icon, title, question, gradient, border, iconColor }) => (
              <Link key={title} href="/analyze" className="group block">
                <div className={`p-6 rounded-2xl border border-white/[0.04] bg-gradient-to-br ${gradient} ${border} transition-all duration-300 hover:scale-[1.02]`}>
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center ${iconColor} group-hover:scale-110 transition-transform`}>
                      {icon}
                    </div>
                    <div>
                      <div className="font-display font-black text-white text-lg">{title}</div>
                      <div className="text-sm text-white/30 font-medium">{question}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TECH STACK ═══ */}
      <section className="relative z-10 py-20">
        <div className="max-w-3xl mx-auto px-8">
          <div className="relative rounded-2xl border border-white/[0.04] bg-gradient-to-br from-white/[0.02] via-white/[0.01] to-cyan-500/[0.02] p-10 overflow-hidden">
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            {/* Ambient glow */}
            <div className="absolute -top-[50%] -left-[50%] w-[300px] h-[300px] bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-[80px]" />
            <div className="absolute -bottom-[50%] -right-[50%] w-[300px] h-[300px] bg-gradient-to-tl from-magenta-500/10 to-transparent rounded-full blur-[80px]" />
            
            <div className="relative z-10">
              <div className="text-center mb-10">
                <h3 className="font-display font-black text-2xl text-white mb-2">Built with the best</h3>
                <p className="text-white/15 text-sm font-medium">Enterprise-grade infrastructure, decentralized storage</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { label: "Tatum", sub: "Sui RPC & APIs", icon: <Zap className="w-6 h-6" />, color: "text-cyan-400", glow: "from-cyan-500/20" },
                  { label: "Walrus", sub: "Storage", icon: <Database className="w-6 h-6" />, color: "text-magenta-400", glow: "from-magenta-500/20" },
                  { label: "Sui", sub: "Contracts", icon: <Globe className="w-6 h-6" />, color: "text-magenta-400", glow: "from-magenta-500/20" },
                  { label: "Groq", sub: "AI Agent", icon: <Activity className="w-6 h-6" />, color: "text-cyan-400", glow: "from-cyan-500/20" },
                ].map(({ label, sub, icon, color, glow }) => (
                  <div key={label} className="flex flex-col items-center gap-3 text-center group">
                    <div className={`relative ${color} group-hover:scale-110 transition-transform duration-300`}>
                      {icon}
                      <div className={`absolute inset-0 ${glow} blur-[20px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity`} />
                    </div>
                    <div>
                      <div className="font-display font-black text-white text-sm">{label}</div>
                      <div className="text-white/15 text-xs">{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative z-10 py-32 text-center px-8">
        <div className="relative">
          {/* CTA ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-cyan-500/20 via-magenta-500/10 to-cyan-500/20 rounded-full blur-[100px]" />
          
          <h2 className="relative font-display font-black text-5xl md:text-6xl text-white mb-8 tracking-tight">
            Ready to <span className="bg-gradient-to-r from-cyan-400 to-magenta-400 bg-clip-text text-transparent">check?</span>
          </h2>
          <p className="relative text-white/15 text-lg mb-14 max-w-md mx-auto font-medium">
            Paste any Sui address. Get a verdict in seconds.
          </p>
          <Link
            href="/analyze"
            className="relative group inline-flex items-center gap-3 text-xl py-6 px-14 rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-black font-black hover:from-cyan-300 hover:to-cyan-400 transition-all shadow-[0_0_60px_rgba(0,229,255,0.4)] hover:shadow-[0_0_80px_rgba(0,229,255,0.6)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <Shield className="w-6 h-6" />
            Start Analyzing
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 border-t border-white/[0.04] py-10">
        <div className="max-w-5xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SuiShield" className="w-5 h-5 object-contain" />
            <span className="font-display font-black text-white text-sm">SuiShield</span>
          </div>
          <div className="flex items-center gap-8 text-xs text-white/15">
            <a href="https://tatum.io" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors font-bold">Tatum</a>
            <a href="https://walrus.space" target="_blank" rel="noopener noreferrer" className="hover:text-magenta-400 transition-colors font-bold">Walrus</a>
            <a href="https://sui.io" target="_blank" rel="noopener noreferrer" className="hover:text-magenta-400 transition-colors font-bold">Sui</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
