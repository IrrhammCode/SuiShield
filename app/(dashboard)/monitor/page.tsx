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
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  XCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";
import { DualWalletButton } from "@/components/WalletConnect";

interface MonitoredActivity {
  digest: string;
  timestamp: string;
  type: string;
  amount?: string;
  status: "success" | "failure";
  gasUsed?: string;
}

interface MonitoredAddress {
  address: string;
  chain: string;
  riskScore: number;
  monitoredAt: string;
  alertCount: number;
  lastAlert?: string;
  balance?: string;
  label?: string;
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
  const [newLabel, setNewLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedAddress, setExpandedAddress] = useState<string | null>(null);
  const [activity, setActivity] = useState<Record<string, MonitoredActivity[]>>({});
  const [loadingActivity, setLoadingActivity] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

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
    const interval = setInterval(fetchData, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, [fetchData]);

  // Auto-clear success messages
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

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
          label: newLabel.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add address");

      setNewAddress("");
      setNewLabel("");
      setSuccess(`Added ${newAddress.trim().slice(0, 10)}... to monitoring`);
      await fetchData();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (address: string) => {
    try {
      const res = await fetch(`/api/webhooks?address=${address}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSuccess(`Removed ${address.slice(0, 10)}... from monitoring`);
        if (expandedAddress === address) setExpandedAddress(null);
        await fetchData();
      }
    } catch (e) {
      console.error("Failed to remove address:", e);
    }
  };

  const handleCheckSingle = async (address: string) => {
    setLoadingActivity(address);
    try {
      const res = await fetch(`/api/webhooks?action=check&address=${address}`);
      if (res.ok) {
        const data = await res.json();
        if (data.newTxs?.length > 0) {
          setSuccess(`Found ${data.newTxs.length} new transaction(s)`);
        }
        // Update activity for this address
        const actRes = await fetch(`/api/webhooks?action=activity&address=${address}`);
        if (actRes.ok) {
          const actData = await actRes.json();
          setActivity((prev) => ({ ...prev, [address]: actData.activity || [] }));
        }
        await fetchData();
      }
    } catch (e) {
      console.error("Failed to check address:", e);
    } finally {
      setLoadingActivity(null);
    }
  };

  const handleCheckAll = async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/webhooks?action=check-all");
      if (res.ok) {
        const data = await res.json();
        const totalNew = data.results?.reduce((sum: number, r: { newTxs: MonitoredActivity[] }) => sum + r.newTxs.length, 0) || 0;
        if (totalNew > 0) {
          setSuccess(`Found ${totalNew} new transaction(s) across all addresses`);
        }
        await fetchData();
      }
    } catch (e) {
      console.error("Failed to check all:", e);
    } finally {
      setChecking(false);
    }
  };

  const toggleExpand = async (address: string) => {
    if (expandedAddress === address) {
      setExpandedAddress(null);
      return;
    }
    setExpandedAddress(address);
    // Fetch activity if not cached
    if (!activity[address]) {
      setLoadingActivity(address);
      try {
        const res = await fetch(`/api/webhooks?action=activity&address=${address}`);
        if (res.ok) {
          const data = await res.json();
          setActivity((prev) => ({ ...prev, [address]: data.activity || [] }));
        }
      } catch (e) {
        console.error("Failed to fetch activity:", e);
      } finally {
        setLoadingActivity(null);
      }
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 25) return "text-green-400";
    if (score < 50) return "text-yellow-400";
    if (score < 75) return "text-orange-400";
    return "text-red-400";
  };

  const getRiskBg = (score: number) => {
    if (score < 25) return "from-green-500/10 to-green-500/5 border-green-500/20";
    if (score < 50) return "from-yellow-500/10 to-yellow-500/5 border-yellow-500/20";
    if (score < 75) return "from-orange-500/10 to-orange-500/5 border-orange-500/20";
    return "from-red-500/10 to-red-500/5 border-red-500/20";
  };

  const getRiskLabel = (score: number) => {
    if (score < 25) return "Low Risk";
    if (score < 50) return "Medium Risk";
    if (score < 75) return "High Risk";
    return "Critical";
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const truncateHash = (hash: string) => {
    if (!hash) return "";
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
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
              onClick={handleCheckAll}
              disabled={checking}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-white/30 hover:text-white text-xs"
              title="Check all addresses now"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Check All</span>
            </button>
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
            Monitor Sui addresses for suspicious activity. Get real-time alerts when flagged addresses move funds.
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm animate-slide-up">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-slide-up">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto">
              <XCircle className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Status Cards */}
        {status && (
          <div className="grid grid-cols-3 gap-3">
            <div className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-cyan-500/[0.02] p-4 backdrop-blur-xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
              <div className="flex items-center gap-2 text-white/30 text-xs mb-2">
                <Database className="w-3.5 h-3.5 text-white/80" />
                Tatum API
              </div>
              <div className={`font-display font-bold text-lg ${status.tatumAvailable ? "text-green-400" : "text-yellow-400"}`}>
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
                <Activity className="w-3.5 h-3.5 text-white/50" />
                Total Alerts
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
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="0x... Sui address"
                className="flex-1 bg-black/40 border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none focus:border-cyan-500/40 transition-colors font-mono"
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
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Label (optional) — e.g. 'My Wallet', 'DEX Contract'"
              className="w-full bg-black/40 border border-white/[0.06] rounded-xl px-4 py-2.5 text-white placeholder-white/20 text-sm outline-none focus:border-cyan-500/40 transition-colors"
            />
          </div>
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
            <p className="text-white/20 text-xs mt-1">Add a Sui address above to start monitoring</p>
          </div>
        ) : (
          <div className="space-y-3">
            {monitored.map((addr) => {
              const isExpanded = expandedAddress === addr.address;
              const addrActivity = activity[addr.address] || [];
              const isLoading = loadingActivity === addr.address;

              return (
                <div key={addr.address} className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl overflow-hidden hover:border-white/[0.1] transition-all">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

                  {/* Main Row */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${getRiskBg(addr.riskScore)} border flex-shrink-0`}>
                          <Shield className={`w-5 h-5 ${getRiskColor(addr.riskScore)}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {addr.label && (
                              <span className="text-white font-display font-semibold text-sm truncate">{addr.label}</span>
                            )}
                            <span className="font-mono text-xs text-white/60 truncate">
                              {addr.address.slice(0, 8)}...{addr.address.slice(-6)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/30 mt-0.5 flex-wrap">
                            <span className={getRiskColor(addr.riskScore)}>
                              {getRiskLabel(addr.riskScore)} ({addr.riskScore})
                            </span>
                            <span>·</span>
                            {addr.balance && (
                              <>
                                <span className="text-white/50">{addr.balance}</span>
                                <span>·</span>
                              </>
                            )}
                            <span>{addr.alertCount} alert{addr.alertCount !== 1 ? "s" : ""}</span>
                            {addr.lastAlert && (
                              <>
                                <span>·</span>
                                <span>Last: {formatTimeAgo(addr.lastAlert)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleCheckSingle(addr.address)}
                          disabled={isLoading}
                          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/30 hover:text-cyan-400"
                          title="Check for new activity"
                        >
                          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                        </button>
                        <button
                          onClick={() => toggleExpand(addr.address)}
                          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/30 hover:text-white"
                          title="View activity"
                        >
                          <Activity className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/analyze?address=${addr.address}`}
                          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/30 hover:text-white"
                          title="Analyze address"
                        >
                          <TrendingUp className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleRemove(addr.address)}
                          className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-white/20 hover:text-red-400"
                          title="Remove from monitoring"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Activity */}
                  {isExpanded && (
                    <div className="border-t border-white/[0.04] bg-black/20">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="w-5 h-5 text-white/50 animate-spin" />
                        </div>
                      ) : addrActivity.length === 0 ? (
                        <div className="text-center py-6">
                          <Clock className="w-6 h-6 text-white/15 mx-auto mb-2" />
                          <p className="text-white/20 text-xs">No activity recorded yet</p>
                          <p className="text-white/10 text-[10px] mt-1">Click the refresh icon to check for transactions</p>
                        </div>
                      ) : (
                        <div className="max-h-64 overflow-y-auto">
                          {addrActivity.map((tx, i) => (
                            <div
                              key={tx.digest + i}
                              className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors"
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                tx.type === "Sent"
                                  ? "bg-red-500/10 text-red-400"
                                  : tx.type === "Received"
                                  ? "bg-green-500/10 text-green-400"
                                  : "bg-white/5 text-white/40"
                              }`}>
                                {tx.type === "Sent" ? (
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                ) : tx.type === "Received" ? (
                                  <ArrowDownLeft className="w-3.5 h-3.5" />
                                ) : (
                                  <Activity className="w-3.5 h-3.5" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-white/70 font-medium">{tx.type}</span>
                                  {tx.amount && (
                                    <span className="text-xs text-white/50">{tx.amount}</span>
                                  )}
                                  {tx.status === "failure" && (
                                    <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">Failed</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <a
                                    href={`https://suiscan.xyz/mainnet/tx/${tx.digest}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-[10px] text-cyan-400/60 hover:text-cyan-400 transition-colors"
                                  >
                                    {truncateHash(tx.digest)}
                                  </a>
                                  <span className="text-[10px] text-white/15">{formatTimeAgo(tx.timestamp)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
                SuiShield monitors addresses by polling the Sui blockchain via Tatum RPC.
                Click the refresh icon on any address to check for new transactions, or use
                &quot;Check All&quot; to scan all monitored addresses at once. New transactions
                appear in the activity feed with amount, direction, and link to SuiScan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
