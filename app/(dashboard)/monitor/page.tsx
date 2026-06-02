"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Shield,
  AlertTriangle,
  Bell,
  BellOff,
  Plus,
  RefreshCw,
  Activity,
  Zap,
  Database,
  Eye,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { DualWalletButton } from "@/components/WalletConnect";

interface MonitoredAddress {
  address: string;
  chain: string;
  riskScore: number;
  monitoredAt: string;
  alertCount: number;
  lastAlert?: string;
}

interface MonitorStatus {
  tatumAvailable: boolean;
  localMonitors: number;
  activeAlerts: number;
}

export default function MonitorPage() {
  const [monitored, setMonitored] = useState<MonitoredAddress[]>([]);
  const [status, setStatus] = useState<MonitorStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/webhooks");
      if (res.ok) {
        const data = await res.json();
        setMonitored(data.monitored || []);
        setStatus(data.status || null);
      }
    } catch (e) {
      console.error("Failed to fetch monitor data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await fetchData();
    };
    loadData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleAddAddress = async () => {
    if (!newAddress.trim()) return;
    setAdding(true);
    setError(null);

    try {
      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "monitor",
          address: newAddress.trim(),
          chain: "sui-testnet",
        }),
      });

      if (!res.ok) throw new Error("Failed to add address");

      setNewAddress("");
      await fetchData();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setAdding(false);
    }
  };

  const handleSubscribe = async (address: string) => {
    try {
      await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "subscribe",
          address,
          chain: "sui-testnet",
          eventType: "ADDRESS_TRANSACTION",
        }),
      });
      await fetchData();
    } catch (e) {
      console.error("Failed to subscribe:", e);
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 25) return "text-white/80";
    if (score < 50) return "text-white/50";
    if (score < 75) return "text-white/50";
    return "text-white/50";
  };

  const getRiskGradient = (score: number) => {
    if (score < 25) return "from-white/[0.06] to-white/[0.02] border-white/[0.08]";
    if (score < 50) return "from-white/[0.06] to-white/[0.02] border-white/[0.08]";
    if (score < 75) return "from-white/[0.06] to-white/[0.02] border-white/[0.08]";
    return "from-white/[0.06] to-white/[0.02] border-white/[0.08]";
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute -top-[15%] -left-[10%] w-[600px] h-[600px] bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[500px] h-[500px] bg-gradient-to-bl from-white/[0.04] via-magenta-500/5 to-transparent rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[30%] w-[400px] h-[400px] bg-gradient-to-t from-white/[0.04] via-transparent to-transparent rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="border-b border-white/[0.06] bg-black/40 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl hover:bg-white/5 transition-colors text-white/30 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 flex items-center justify-center">
                <img src="/logo.png" alt="SuiShield" className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(0,229,255,0.4)]" />
              </div>
              <div>
                <div className="text-white font-display font-semibold text-sm">SuiShield</div>
                <div className="text-white/20 text-[11px]">Address Monitor</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/30 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <DualWalletButton />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-5 py-8 space-y-6">
        {/* Page Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-white/[0.04] to-white/[0.04] border border-white/[0.06] text-xs">
            <Bell className="w-3 h-3 text-white/50" />
            <span className="text-white/50 font-bold uppercase tracking-widest">Real-time Monitoring</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-white tracking-tight">
            Address <span className="text-white/50">Monitor</span>
          </h1>
          <p className="text-white/30 text-sm max-w-md">
            Monitor Sui addresses for suspicious activity. Get alerts when flagged addresses move funds.
          </p>
        </div>

        {/* Status Cards */}
        {status && (
          <div className="grid grid-cols-3 gap-3">
            <div className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-cyan-500/[0.02] p-4 backdrop-blur-xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
              <div className="flex items-center gap-2 text-white/30 text-xs mb-2">
                <Database className="w-3.5 h-3.5 text-white/80" />
                Tatum API
              </div>
              <div className={`font-display font-bold text-lg ${status.tatumAvailable ? "text-white/80" : "text-white/50"}`}>
                {status.tatumAvailable ? "Connected" : "Local Only"}
              </div>
            </div>
            <div className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-magenta-500/[0.02] p-4 backdrop-blur-xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
              <div className="flex items-center gap-2 text-white/30 text-xs mb-2">
                <Eye className="w-3.5 h-3.5 text-white/50" />
                Monitored
              </div>
              <div className="font-display font-bold text-lg text-white">
                {status.localMonitors}
              </div>
            </div>
            <div className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-magenta-500/[0.02] p-4 backdrop-blur-xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
              <div className="flex items-center gap-2 text-white/30 text-xs mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-white/50" />
                Alerts
              </div>
              <div className="font-display font-bold text-lg text-white">
                {status.activeAlerts}
              </div>
            </div>
          </div>
        )}

        {/* Add Address */}
        <div className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-cyan-500/[0.02] p-5 backdrop-blur-xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
          <div className="flex items-center gap-2 mb-3">
            <Plus className="w-4 h-4 text-white/80" />
            <span className="text-white font-display font-semibold text-sm">Add Address to Monitor</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="0x..."
              className="flex-1 bg-black/40 border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none focus:border-cyan-500/40 transition-colors"
              onKeyDown={(e) => e.key === "Enter" && handleAddAddress()}
            />
            <button
              onClick={handleAddAddress}
              disabled={adding || !newAddress.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-white to-white/80 text-black font-bold hover:from-cyan-300 hover:to-cyan-400 transition-all shadow-[0_0_20px_rgba(255,255,255,0.08)] hover:shadow-[0_0_30px_rgba(255,255,255,0.12)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {adding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add
            </button>
          </div>
          {error && (
            <p className="text-white/50 text-xs mt-2">{error}</p>
          )}
        </div>

        {/* Monitored Addresses */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-white/80 animate-spin" />
          </div>
        ) : monitored.length === 0 ? (
          <div className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-magenta-500/[0.02] p-8 text-center backdrop-blur-xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
            <BellOff className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No addresses being monitored</p>
            <p className="text-white/20 text-xs mt-1">Add an address above to start monitoring</p>
          </div>
        ) : (
          <div className="space-y-3">
            {monitored.map((addr) => (
              <div key={addr.address} className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-4 backdrop-blur-xl overflow-hidden hover:border-white/[0.1] transition-all">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${getRiskGradient(addr.riskScore)}`}>
                      <Shield className={`w-5 h-5 ${getRiskColor(addr.riskScore)}`} />
                    </div>
                    <div>
                      <div className="font-mono text-sm text-white">
                        {addr.address.slice(0, 10)}...{addr.address.slice(-6)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/30 mt-0.5">
                        <span>{addr.chain}</span>
                        <span>·</span>
                        <span className={getRiskColor(addr.riskScore)}>
                          Risk: {addr.riskScore}/100
                        </span>
                        <span>·</span>
                        <span>Alerts: {addr.alertCount}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSubscribe(addr.address)}
                      className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/30 hover:text-white/80"
                      title="Subscribe to Tatum webhook"
                    >
                      <Bell className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/analyze?address=${addr.address}`}
                      className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/30 hover:text-white"
                      title="Analyze address"
                    >
                      <Activity className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
                {addr.lastAlert && (
                  <div className="mt-2 pt-2 border-t border-white/[0.04] flex items-center gap-2 text-xs text-white/50">
                    <AlertTriangle className="w-3 h-3" />
                    Last alert: {new Date(addr.lastAlert).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-cyan-500/[0.02] p-4 backdrop-blur-xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
          <div className="flex gap-3 text-xs text-white/40">
            <Zap className="w-4 h-4 text-white/80 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-white mb-1">How monitoring works</p>
              <p className="leading-relaxed">
                After analyzing an address, you can add it to the monitor. SuiShield will track activity
                and alert you if the address performs suspicious transactions. Uses Tatum webhooks for
                real-time notifications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
