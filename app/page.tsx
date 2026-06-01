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
import { StarField, ShootingStars } from "@/components/Galaxy";
import { HolographicCard, MagneticBtn, AnimatedCounter } from "@/components/Advanced3D";
import ScrollReveal, { Stagger } from "@/components/ScrollAnimations";

// ─── Navbar ───────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "backdrop-blur-xl bg-black/40 border-b border-white/5 py-3" : "py-5"}`}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center">
            <img src="/logo.png" alt="SuiShield" className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(0,229,255,0.4)]" />
          </div>
          <span className="font-display font-black text-white text-lg tracking-tight">
            Sui<span className="text-gradient-primary">Shield</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/trust-graph" className="text-white/50 hover:text-white text-sm transition-colors hidden sm:block font-semibold">Trust Graph</Link>
          <Link href="/explore" className="text-white/50 hover:text-white text-sm transition-colors hidden sm:block font-semibold">Explore</Link>
          <Link href="/chat" className="text-white/50 hover:text-white text-sm transition-colors hidden sm:block font-semibold">Chat</Link>
          <DualWalletButton />
        </div>
      </div>
    </nav>
  );
}

// ─── Feature Card ────────────────────────────────────────
function FeatureCard({ icon, title, description, accent }: { icon: React.ReactNode; title: string; description: string; accent: "primary" | "secondary" }) {
  return (
    <HolographicCard className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 cursor-default">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
        accent === "primary" ? "bg-cyan-500/10 border border-cyan-500/20" : "bg-white/5 border border-white/10"
      }`}>
        <div className={accent === "primary" ? "text-cyan-400" : "text-white/60"}>{icon}</div>
      </div>
      <h3 className="font-display font-bold text-white text-base mb-2">{title}</h3>
      <p className="text-white/40 text-sm leading-relaxed">{description}</p>
    </HolographicCard>
  );
}

// ─── Step ────────────────────────────────────────────────
function Step({ num, title, description }: { num: number; title: string; description: string }) {
  return (
    <ScrollReveal direction="left" delay={num * 150}>
      <div className="flex items-start gap-5 group">
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 font-display font-bold text-lg flex-shrink-0 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/10 transition-all duration-300">
          {num}
        </div>
        <div className="pt-1">
          <div className="font-display font-bold text-white text-base mb-1">{title}</div>
          <div className="text-white/40 text-sm leading-relaxed">{description}</div>
        </div>
      </div>
    </ScrollReveal>
  );
}

// ─── Tech Pill ───────────────────────────────────────────
function TechPill({ label, sub, color, icon }: { label: string; sub: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`font-display font-bold text-sm ${color}`}>{label}</div>
      <div className="text-white/30 text-xs text-center">{sub}</div>
    </div>
  );
}

// ─── Live Demo Card ──────────────────────────────────────
function LiveDemoCard() {
  return (
    <ScrollReveal direction="scale" delay={500}>
      <div className="max-w-lg mx-auto">
        <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 text-left">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white/30 font-bold uppercase tracking-wider">Live Analysis</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-green-400 font-display font-bold text-lg">SAFE</div>
                <div className="text-white/30 text-xs">Low Risk</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-display font-black text-white">82</span>
              <span className="text-white/30 text-sm">/100</span>
            </div>
          </div>
          <div className="risk-meter mb-5">
            <div className="risk-thumb" style={{ left: "82%" }} />
          </div>
          <div className="space-y-2 mb-5">
            {[
              { icon: <CheckCircle className="w-3.5 h-3.5" />, text: "Active since Jan 2024", color: "text-green-400" },
              { icon: <CheckCircle className="w-3.5 h-3.5" />, text: "1,247 transactions", color: "text-green-400" },
              { icon: <AlertTriangle className="w-3.5 h-3.5" />, text: "2 flagged counterparties", color: "text-yellow-400" },
            ].map(({ icon, text, color }) => (
              <div key={text} className={`flex items-center gap-2.5 text-sm ${color}`}>
                {icon}
                <span className="font-medium">{text}</span>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-[11px] text-white/20 font-mono">0x7a8b...3c4d</span>
            <div className="flex items-center gap-1.5 text-[10px] text-cyan-400/60">
              <Database className="w-3 h-3" />
              <span>Stored on Walrus</span>
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}

// ─── Main Landing Page ───────────────────────────────────
export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <Navbar />

      {/* Star Field Background */}
      <StarField />
      <ShootingStars />

      {/* HERO */}
      <section className="relative pt-32 pb-20 z-10">
        <div className="max-w-5xl mx-auto px-6 pt-20 text-center">
          {/* Badge */}
          <ScrollReveal direction="fade">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] text-xs text-white/60 mb-8 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-semibold">Powered by Tatum Sui RPC + Walrus Storage</span>
            </div>
          </ScrollReveal>

          {/* Headline */}
          <ScrollReveal direction="up" delay={100}>
            <h1 className="font-display font-black text-[52px] md:text-[80px] leading-[0.98] tracking-[-0.03em] mb-6">
              <span className="text-white">Check Before</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-white bg-clip-text text-transparent">You Approve</span>
            </h1>
          </ScrollReveal>

          {/* Subtitle */}
          <ScrollReveal direction="up" delay={200}>
            <p className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
              AI-powered trust analysis for every Sui interaction. Paste any address. Get a verdict. Share the proof.
            </p>
          </ScrollReveal>

          {/* CTA Buttons */}
          <ScrollReveal direction="up" delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <MagneticBtn
                href="/analyze"
                className="inline-flex items-center gap-2.5 text-base py-4 px-8 rounded-xl bg-white text-black font-bold hover:bg-white/90 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]"
              >
                <Search className="w-4.5 h-4.5" />
                Analyze an Address
              </MagneticBtn>
              <MagneticBtn
                href="/trust-graph"
                className="inline-flex items-center gap-2.5 text-base py-4 px-8 rounded-xl bg-white/5 text-white font-bold border border-white/10 hover:bg-white/10 transition-all"
              >
                <GitBranch className="w-4.5 h-4.5" />
                Trust Graph
              </MagneticBtn>
            </div>
          </ScrollReveal>

          {/* Live Demo */}
          <LiveDemoCard />
        </div>
      </section>

      {/* STATS BAR */}
      <section className="relative z-10 py-12 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-8" staggerDelay={150}>
            {[
              { value: 11, suffix: "TB+", label: "Blockchain Data" },
              { value: 4, suffix: "", label: "Chains Supported" },
              { value: 59, suffix: "", label: "AI Tools" },
              { value: 0, suffix: "∞", label: "Proof Storage", isInfinity: true },
            ].map(({ value, suffix, label, isInfinity }) => (
              <div key={label} className="text-center">
                <div className="font-display font-black text-3xl md:text-4xl text-white mb-1">
                  {isInfinity ? "∞" : <AnimatedCounter value={value} suffix={suffix} />}
                </div>
                <div className="text-white/20 text-xs uppercase tracking-wider font-bold">{label}</div>
              </div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="relative max-w-5xl mx-auto px-6 py-24 z-10">
        <ScrollReveal>
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-bold uppercase tracking-wider mb-4">
              <AlertTriangle className="w-3 h-3" />
              The Problem
            </div>
            <h2 className="font-display font-black text-3xl md:text-4xl text-white mb-4 tracking-tight">
              Every day, Sui users lose money
            </h2>
            <p className="text-white/30 text-base max-w-xl mx-auto leading-relaxed font-medium">
              No tool gives you a clear answer before you click. Existing explorers show raw data — not verdicts.
            </p>
          </div>
        </ScrollReveal>
        <Stagger className="grid md:grid-cols-2 gap-4" staggerDelay={100}>
          {[
            { icon: <XCircle className="w-4 h-4 text-red-400" />, title: "Rug pulls disguised as yield farms", desc: "300% APY that collapses after you deposit" },
            { icon: <XCircle className="w-4 h-4 text-red-400" />, title: "Fake NFT collections", desc: "Copycat names, wash trading, anonymous creators" },
            { icon: <XCircle className="w-4 h-4 text-red-400" />, title: "Scam airdrops and phishing", desc: "DMs with malicious links that drain wallets" },
            { icon: <XCircle className="w-4 h-4 text-red-400" />, title: "Unknown counterparty risk", desc: "P2P trading with wallets that have dirty history" },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4 p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0 border border-red-500/15">{icon}</div>
              <div>
                <div className="text-sm font-bold text-white mb-0.5">{title}</div>
                <div className="text-xs text-white/30 leading-relaxed">{desc}</div>
              </div>
            </div>
          ))}
        </Stagger>
      </section>

      {/* SOLUTION */}
      <section className="relative max-w-5xl mx-auto px-6 py-24 z-10">
        <ScrollReveal>
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400 font-bold uppercase tracking-wider mb-4">
              <Shield className="w-3 h-3" />
              The Solution
            </div>
            <h2 className="font-display font-black text-3xl md:text-4xl text-white mb-4 tracking-tight">
              SuiShield gives you a verdict
            </h2>
            <p className="text-white/30 text-base max-w-xl mx-auto leading-relaxed font-medium">
              Not raw data. Not charts. A clear answer: safe or not, with proof stored on-chain.
            </p>
          </div>
        </ScrollReveal>
        <Stagger className="grid md:grid-cols-2 gap-4" staggerDelay={100}>
          <FeatureCard icon={<Zap className="w-5 h-5" />} title="Real-time via Tatum Sui RPC" description="Balance, objects, transactions — live from Sui mainnet through Tatum enterprise infrastructure." accent="primary" />
          <FeatureCard icon={<Database className="w-5 h-5" />} title="Historical via Walrus Datasets" description="Cross-reference with 11TB+ of blockchain history stored on Walrus decentralized storage." accent="secondary" />
          <FeatureCard icon={<Lock className="w-5 h-5" />} title="Verifiable On-Chain Proof" description="Every analysis stored on Walrus — immutable, shareable, cryptographically verifiable." accent="secondary" />
          <FeatureCard icon={<GitBranch className="w-5 h-5" />} title="Trust Graph Analysis" description="Trace fund flow patterns, detect suspicious clusters, visualize address relationships." accent="primary" />
        </Stagger>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative max-w-4xl mx-auto px-6 py-24 z-10">
        <ScrollReveal>
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/50 font-bold uppercase tracking-wider mb-4">
              <Layers className="w-3 h-3" />
              How It Works
            </div>
            <h2 className="font-display font-black text-3xl md:text-4xl text-white mb-4 tracking-tight">
              Three steps. Five seconds.
            </h2>
          </div>
        </ScrollReveal>
        <div className="max-w-lg mx-auto space-y-8">
          <Step num={1} title="Paste any Sui address" description="Wallet, contract, token, or NFT collection — just paste it." />
          <Step num={2} title="AI analyzes everything" description="Tatum RPC data + Walrus history + multi-signal risk scoring." />
          <Step num={3} title="Get verdict + share proof" description="On-chain certificate stored on Walrus. Shareable link." />
        </div>
        <ScrollReveal delay={400}>
          <div className="text-center mt-14">
            <MagneticBtn
              href="/analyze"
              className="inline-flex items-center gap-2.5 text-base py-4 px-10 rounded-xl bg-white text-black font-bold hover:bg-white/90 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            >
              Try it now
              <ArrowRight className="w-4.5 h-4.5" />
            </MagneticBtn>
          </div>
        </ScrollReveal>
      </section>

      {/* USE CASES */}
      <section className="relative max-w-5xl mx-auto px-6 py-24 z-10">
        <ScrollReveal>
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/50 font-bold uppercase tracking-wider mb-4">
              <Eye className="w-3 h-3" />
              Use Cases
            </div>
            <h2 className="font-display font-black text-3xl md:text-4xl text-white mb-4 tracking-tight">
              Built for everyone on Sui
            </h2>
          </div>
        </ScrollReveal>
        <Stagger className="grid md:grid-cols-2 gap-4" staggerDelay={100}>
          {[
            { icon: <TrendingUp className="w-5 h-5" />, title: "DeFi Farmers", question: "Is this yield safe?", flow: "Paste pool address, agent checks TVL trend, sustainability, concentration risk, trust score on-chain", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/15" },
            { icon: <Globe className="w-5 h-5" />, title: "NFT Buyers", question: "Is this creator legit?", flow: "Paste creator address, agent checks wallet age, past projects, wash trading, verdict with evidence", color: "text-white/60 bg-white/5 border-white/10" },
            { icon: <Users className="w-5 h-5" />, title: "P2P Traders", question: "Is this wallet clean?", flow: "Paste counterparty, agent checks money flow, scam database, network risk, instant verdict", color: "text-white/60 bg-white/5 border-white/10" },
            { icon: <Shield className="w-5 h-5" />, title: "New Users", question: "Where do I start?", flow: "Paste any address, simple safe/not verdict, community-verified reports protect you", color: "text-green-400 bg-green-500/10 border-green-500/15" },
          ].map(({ icon, title, question, flow, color }) => (
            <Link key={title} href="/analyze" className="group block">
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:border-white/10 transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${color}`}>
                    {icon}
                  </div>
                  <div>
                    <div className="font-display font-bold text-white text-base">{title}</div>
                    <div className="text-sm font-semibold text-cyan-400 mt-0.5">{question}</div>
                  </div>
                </div>
                <div className="text-sm text-white/30 leading-relaxed">{flow}</div>
              </div>
            </Link>
          ))}
        </Stagger>
      </section>

      {/* TECH STACK */}
      <section className="relative max-w-4xl mx-auto px-6 py-20 z-10">
        <ScrollReveal>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-10">
            <div className="text-center mb-8">
              <h3 className="font-display font-black text-xl text-white mb-2">Built with the best</h3>
              <p className="text-white/30 text-sm font-medium">Enterprise-grade infrastructure, decentralized storage</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <TechPill label="Tatum" sub="Sui RPC & Data APIs" color="text-cyan-400" icon={<Zap className="w-6 h-6" />} />
              <TechPill label="Walrus" sub="Decentralized Storage" color="text-white/60" icon={<Database className="w-6 h-6" />} />
              <TechPill label="Sui" sub="Move Smart Contracts" color="text-blue-400" icon={<Globe className="w-6 h-6" />} />
              <TechPill label="Groq" sub="AI Agent (Llama 3.3)" color="text-orange-400" icon={<Activity className="w-6 h-6" />} />
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* CTA */}
      <section className="relative max-w-3xl mx-auto px-6 py-24 z-10 text-center">
        <ScrollReveal>
          <h2 className="font-display font-black text-4xl md:text-5xl text-white mb-6 tracking-tight">
            Ready to check?
          </h2>
          <p className="text-white/30 text-lg mb-10 max-w-lg mx-auto font-medium">
            Paste any Sui address and get a verdict in seconds. No signup required.
          </p>
          <MagneticBtn
            href="/analyze"
            className="inline-flex items-center gap-2.5 text-lg py-5 px-12 rounded-xl bg-white text-black font-bold hover:bg-white/90 transition-all shadow-[0_0_50px_rgba(255,255,255,0.15)]"
            strength={0.4}
          >
            <Shield className="w-5 h-5" />
            Start Analyzing
            <ArrowRight className="w-5 h-5" />
          </MagneticBtn>
        </ScrollReveal>
      </section>

      {/* FOOTER */}
      <footer className="relative max-w-5xl mx-auto px-6 py-12 z-10 border-t border-white/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SuiShield" className="w-5 h-5 object-contain" />
            <span className="font-display font-bold text-white text-sm">SuiShield</span>
            <span className="text-xs text-white/20">· Check Before You Approve</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/20">
            <a href="https://tatum.io" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors flex items-center gap-1 font-medium">Tatum <ExternalLink className="w-3 h-3" /></a>
            <a href="https://walrus.space" target="_blank" rel="noopener noreferrer" className="hover:text-white/50 transition-colors flex items-center gap-1 font-medium">Walrus <ExternalLink className="w-3 h-3" /></a>
            <a href="https://sui.io" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors flex items-center gap-1 font-medium">Sui <ExternalLink className="w-3 h-3" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
