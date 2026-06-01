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
    <div className="relative min-h-screen bg-black">
      <Navbar />
      <SubtleStars />

      {/* ═══ HERO ═══ */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.02] text-xs text-white/40 mb-10">
            <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <span className="font-bold uppercase tracking-widest">Powered by Tatum + Walrus</span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-black text-[60px] md:text-[96px] leading-[0.95] tracking-[-0.04em] mb-8">
            <span className="text-white">Check</span>
            <br />
            <span className="text-white/20">Before You Approve</span>
          </h1>

          {/* Subtitle */}
          <p className="text-white/25 text-xl md:text-2xl max-w-xl mx-auto mb-14 leading-relaxed font-medium">
            AI-powered trust analysis for every Sui interaction.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-3 text-lg py-5 px-10 rounded-2xl bg-white text-black font-black hover:bg-white/90 transition-all"
            >
              <Search className="w-5 h-5" />
              Analyze Address
            </Link>
            <Link
              href="/trust-graph"
              className="inline-flex items-center gap-3 text-lg py-5 px-10 rounded-2xl bg-white/[0.03] text-white font-black border border-white/[0.08] hover:bg-white/[0.06] transition-all"
            >
              <GitBranch className="w-5 h-5" />
              Trust Graph
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="relative z-10 py-20 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { value: "11TB+", label: "Blockchain Data" },
              { value: "4", label: "Chains" },
              { value: "59", label: "AI Tools" },
              { value: "∞", label: "Storage" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="font-display font-black text-5xl md:text-6xl text-white mb-2">{value}</div>
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs text-white/30 font-bold uppercase tracking-[0.15em] mb-6">
              <AlertTriangle className="w-3 h-3" />
              The Problem
            </div>
            <h2 className="font-display font-black text-4xl md:text-5xl text-white tracking-tight">
              Every day, Sui users<br />lose money
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              { icon: <XCircle className="w-5 h-5" />, title: "Rug pulls disguised as yield farms", desc: "300% APY that collapses after you deposit" },
              { icon: <XCircle className="w-5 h-5" />, title: "Fake NFT collections", desc: "Copycat names, wash trading, anonymous creators" },
              { icon: <XCircle className="w-5 h-5" />, title: "Scam airdrops and phishing", desc: "DMs with malicious links that drain wallets" },
              { icon: <XCircle className="w-5 h-5" />, title: "Unknown counterparty risk", desc: "P2P trading with wallets that have dirty history" },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-6 rounded-2xl border border-white/[0.04] bg-white/[0.01]">
                <div className="text-white/10 mt-0.5">{icon}</div>
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs text-white/30 font-bold uppercase tracking-[0.15em] mb-6">
              <Shield className="w-3 h-3" />
              The Solution
            </div>
            <h2 className="font-display font-black text-4xl md:text-5xl text-white tracking-tight">
              SuiShield gives you<br />a verdict
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              { icon: <Zap className="w-5 h-5" />, title: "Real-time via Tatum", desc: "Balance, objects, transactions — live from Sui mainnet through Tatum enterprise infrastructure." },
              { icon: <Database className="w-5 h-5" />, title: "Historical via Walrus", desc: "Cross-reference with 11TB+ of blockchain history stored on Walrus decentralized storage." },
              { icon: <Lock className="w-5 h-5" />, title: "Verifiable Proof", desc: "Every analysis stored on Walrus — immutable, shareable, cryptographically verifiable." },
              { icon: <GitBranch className="w-5 h-5" />, title: "Trust Graph", desc: "Trace fund flow patterns, detect suspicious clusters, visualize address relationships." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:border-white/[0.08] transition-all">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30 mb-4">
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs text-white/30 font-bold uppercase tracking-[0.15em] mb-6">
              <Layers className="w-3 h-3" />
              How It Works
            </div>
            <h2 className="font-display font-black text-4xl md:text-5xl text-white tracking-tight">
              Three steps. Five seconds.
            </h2>
          </div>
          <div className="max-w-lg mx-auto space-y-10">
            {[
              { num: "01", title: "Paste any Sui address", desc: "Wallet, contract, token, or NFT collection." },
              { num: "02", title: "AI analyzes everything", desc: "Tatum RPC data + Walrus history + multi-signal risk scoring." },
              { num: "03", title: "Get verdict + share proof", desc: "On-chain certificate stored on Walrus." },
            ].map(({ num, title, desc }) => (
              <div key={num} className="flex items-start gap-6 group">
                <div className="font-display font-black text-3xl text-white/[0.08] group-hover:text-white/20 transition-colors w-16 flex-shrink-0">
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
              className="inline-flex items-center gap-3 text-lg py-5 px-12 rounded-2xl bg-white text-black font-black hover:bg-white/90 transition-all"
            >
              Try it now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ USE CASES ═══ */}
      <section className="relative z-10 py-24 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs text-white/30 font-bold uppercase tracking-[0.15em] mb-6">
              <Eye className="w-3 h-3" />
              Use Cases
            </div>
            <h2 className="font-display font-black text-4xl md:text-5xl text-white tracking-tight">
              Built for everyone on Sui
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              { icon: <TrendingUp className="w-5 h-5" />, title: "DeFi Farmers", question: "Is this yield safe?" },
              { icon: <Globe className="w-5 h-5" />, title: "NFT Buyers", question: "Is this creator legit?" },
              { icon: <Users className="w-5 h-5" />, title: "P2P Traders", question: "Is this wallet clean?" },
              { icon: <Shield className="w-5 h-5" />, title: "New Users", question: "Where do I start?" },
            ].map(({ icon, title, question }) => (
              <Link key={title} href="/analyze" className="group block">
                <div className="p-6 rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:border-white/[0.08] transition-all">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30">
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
          <div className="rounded-2xl border border-white/[0.04] bg-white/[0.01] p-10">
            <div className="text-center mb-10">
              <h3 className="font-display font-black text-2xl text-white mb-2">Built with the best</h3>
              <p className="text-white/15 text-sm font-medium">Enterprise-grade infrastructure, decentralized storage</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "Tatum", sub: "Sui RPC & APIs", icon: <Zap className="w-6 h-6" />, color: "text-white" },
                { label: "Walrus", sub: "Storage", icon: <Database className="w-6 h-6" />, color: "text-white/60" },
                { label: "Sui", sub: "Contracts", icon: <Globe className="w-6 h-6" />, color: "text-white/40" },
                { label: "Groq", sub: "AI Agent", icon: <Activity className="w-6 h-6" />, color: "text-white/30" },
              ].map(({ label, sub, icon, color }) => (
                <div key={label} className="flex flex-col items-center gap-3 text-center">
                  <div className={`${color}`}>{icon}</div>
                  <div>
                    <div className="font-display font-black text-white text-sm">{label}</div>
                    <div className="text-white/15 text-xs">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative z-10 py-32 text-center px-8">
        <h2 className="font-display font-black text-5xl md:text-6xl text-white mb-8 tracking-tight">
          Ready to check?
        </h2>
        <p className="text-white/15 text-lg mb-14 max-w-md mx-auto font-medium">
          Paste any Sui address. Get a verdict in seconds.
        </p>
        <Link
          href="/analyze"
          className="inline-flex items-center gap-3 text-xl py-6 px-14 rounded-2xl bg-white text-black font-black hover:bg-white/90 transition-all"
        >
          <Shield className="w-6 h-6" />
          Start Analyzing
          <ArrowRight className="w-6 h-6" />
        </Link>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 border-t border-white/[0.04] py-10">
        <div className="max-w-5xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SuiShield" className="w-5 h-5 object-contain" />
            <span className="font-display font-black text-white text-sm">SuiShield</span>
          </div>
          <div className="flex items-center gap-8 text-xs text-white/15">
            <a href="https://tatum.io" target="_blank" rel="noopener noreferrer" className="hover:text-white/40 transition-colors font-bold">Tatum</a>
            <a href="https://walrus.space" target="_blank" rel="noopener noreferrer" className="hover:text-white/40 transition-colors font-bold">Walrus</a>
            <a href="https://sui.io" target="_blank" rel="noopener noreferrer" className="hover:text-white/40 transition-colors font-bold">Sui</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
