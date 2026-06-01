"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Bell,
  BellOff,
  Plus,
  Trash2,
  RefreshCw,
  Activity,
  Clock,
  Zap,
  Database,
  ChevronLeft,
  Loader2,
  Eye,
  Globe,
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
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
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
    if (score < 25) return "text-green-400";
    if (score < 50) return "text-yellow-400";
    if (score < 75) return "text-orange-400";
    return "text-red-400";
  };

  const getRiskBg = (score: number) => {
    if (score < 25) return "bg-green-500/10 border-green-500/20";
    if (score < 50) return "bg-yellow-500/10 border-yellow-500/20";
    if (score < 75) return "bg-orange-500/10 border-orange-500/20";
    return "bg-red-500/10 border-red-500/20";
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute -top-[15%] -left-[10%] w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] -right-[10%] w-[500px] h-[500px] bg-magenta-500/4 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <div className="border-b border-white/5 glass-bright sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl hover:bg-white/5 transition-colors text-[#525880] hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 flex items-center justify-center">
                <img src="/logo.png" alt="SuiShield" className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(0,229,255,0.4)]" />
              </div>
              <div>
                <div className="text-white font-display font-semibold text-sm">SuiShield</div>
                <div className="text-[#525880] text-[11px]">Address Monitor</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors text-[#525880] hover:text-white"
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
          <div className="badge badge-secondary inline-flex">
            <Bell className="w-3 h-3" />
            Real-time Monitoring
          </div>
          <h1 className="font-display font-bold text-3xl text-white tracking-tight">
            Address Monitor
          </h1>
          <p className="text-[#8B93C4] text-sm max-w-md">
            Monitor Sui addresses for suspicious activity. Get alerts when flagged addresses move funds.
          </p>
        </div>

        {/* Status Cards */}
        {status && (
          <div className="grid grid-cols-3 gap-3">
            <div className="card-premium p-4">
              <div className="flex items-center gap-2 text-[#525880] text-xs mb-2">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                Tatum API
              </div>
              <div className={`font-display font-bold text-lg ${status.tatumAvailable ? "text-green-400" : "text-yellow-400"}`}>
                {status.tatumAvailable ? "Connected" : "Local Only"}
              </div>
            </div>
            <div className="card-premium p-4">
              <div className="flex items-center gap-2 text-[#525880] text-xs mb-2">
                <Eye className="w-3.5 h-3.5 text-magenta-400" />
                Monitored
              </div>
              <div className="font-display font-bold text-lg text-white">
                {status.localMonitors}
              </div>
            </div>
            <div className="card-premium p-4">
              <div className="flex items-center gap-2 text-[#525880] text-xs mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                Alerts
              </div>
              <div className="font-display font-bold text-lg text-white">
                {status.activeAlerts}
              </div>
            </div>
          </div>
        )}

        {/* Add Address */}
        <div className="card-premium p-5">
          <div className="flex items-center gap-2 mb-3">
            <Plus className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-display font-semibold text-sm">Add Address to Monitor</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="0x..."
              className="flex-1 bg-[#0E1120] border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-[#525880] text-sm outline-none focus:border-cyan-500/40 transition-colors"
              onKeyDown={(e) => e.key === "Enter" && handleAddAddress()}
            />
            <button
              onClick={handleAddAddress}
              disabled={adding || !newAddress.trim()}
              className="btn-primary px-5 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
            <p className="text-red-400 text-xs mt-2">{error}</p>
          )}
        </div>

        {/* Monitored Addresses */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
          </div>
        ) : monitored.length === 0 ? (
          <div className="card-premium p-8 text-center">
            <BellOff className="w-10 h-10 text-[#525880] mx-auto mb-3" />
            <p className="text-[#525880] text-sm">No addresses being monitored</p>
            <p className="text-[#525880] text-xs mt-1">Add an address above to start monitoring</p>
          </div>
        ) : (
          <div className="space-y-3">
            {monitored.map((addr) => (
              <div key={addr.address} className="card-premium p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getRiskBg(addr.riskScore)}`}>
                      <Shield className={`w-5 h-5 ${getRiskColor(addr.riskScore)}`} />
                    </div>
                    <div>
                      <div className="font-mono text-sm text-white">
                        {addr.address.slice(0, 10)}...{addr.address.slice(-6)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#525880] mt-0.5">
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
                      className="p-2 rounded-lg hover:bg-white/5 transition-colors text-[#525880] hover:text-cyan-400"
                      title="Subscribe to Tatum webhook"
                    >
                      <Bell className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/analyze?address=${addr.address}`}
                      className="p-2 rounded-lg hover:bg-white/5 transition-colors text-[#525880] hover:text-white"
                      title="Analyze address"
                    >
                      <Activity className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
                {addr.lastAlert && (
                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-2 text-xs text-orange-400">
                    <AlertTriangle className="w-3 h-3" />
                    Last alert: {new Date(addr.lastAlert).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="card-premium p-4">
          <div className="flex gap-3 text-xs text-[#8B93C4]">
            <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
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
