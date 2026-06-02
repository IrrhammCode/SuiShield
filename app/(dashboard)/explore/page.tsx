"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Database,
  Brain,
  ChevronLeft,
  Search,
  ExternalLink,
  Copy,
  Check,
  Download,
  Filter,
  Eye,
  Hash,
  HardDrive,
  Calendar,
  BarChart2,
  FileText,
  CheckCircle2,
  Globe,
  Zap,
  ArrowRight,
} from "lucide-react";
import { TATUM_DATASETS, formatBlobId, getAggregatorUrl } from "@/lib/walrus";
import type { Dataset } from "@/types";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";

// ─── Chain filter options ──────────────────────────────────
const CHAIN_FILTERS = ["All", "Bitcoin", "Ethereum", "BNB Chain", "Sui", "Multi-Chain"];

// ─── Format badge ──────────────────────────────────────────
function FormatBadge({ format }: { format: Dataset["format"] }) {
  const styles = {
    Parquet: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    CSV: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
    JSON: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  };
  return <span className={`badge ${styles[format]} text-xs`}>{format}</span>;
}

// ─── Dataset card ──────────────────────────────────────────
function DatasetCard({ dataset, onClick }: { dataset: Dataset; onClick: () => void }) {
  const [copied, setCopied] = useState(false);

  const copyBlobId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dataset.blobId) {
      navigator.clipboard.writeText(dataset.blobId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="card p-5 cursor-pointer group hover:scale-[1.01] transition-all duration-300"
      style={{
        borderColor: `${dataset.chainColor}20`,
      }}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{
              background: `${dataset.chainColor}12`,
              border: `1px solid ${dataset.chainColor}30`,
            }}
          >
            {dataset.chainIcon}
          </div>
          <div>
            <h3 className="font-display font-semibold text-white text-sm leading-tight group-hover:text-purple-300 transition-colors">
              {dataset.name}
            </h3>
            <div className="text-white/30 text-xs mt-0.5">{dataset.chain}</div>
          </div>
        </div>
        <FormatBadge format={dataset.format} />
      </div>

      {/* Description */}
      <p className="text-white/40 text-xs leading-relaxed mb-4 line-clamp-2">{dataset.description}</p>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { icon: <HardDrive className="w-3 h-3" />, label: "Size", value: dataset.size },
          { icon: <Calendar className="w-3 h-3" />, label: "Range", value: dataset.timeRange },
          { icon: <BarChart2 className="w-3 h-3" />, label: "Rows", value: dataset.rowCount || "—" },
        ].map(({ icon, label, value }) => (
          <div key={label} className="bg-black/40 rounded-xl p-2.5 border border-white/5">
            <div className="flex items-center gap-1 text-white/30 text-[10px] mb-1">
              {icon}
              {label}
            </div>
            <div className="text-white font-medium text-xs truncate">{value}</div>
          </div>
        ))}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {dataset.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="text-[10px] font-mono text-white/30 bg-white/[0.03] border border-white/5 rounded px-2 py-0.5">
            #{tag}
          </span>
        ))}
      </div>

      {/* Walrus blob ID */}
      <div className="flex items-center justify-between border-t border-white/5 pt-4">
        <div className="walrus-proof flex-1 mr-2">
          <span className="text-teal-400">⬡</span>
          <span className="truncate">Blob: {formatBlobId(dataset.blobId || "")}</span>
        </div>
        <button
          onClick={copyBlobId}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/30 hover:text-white"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

// ─── Sample preview data (actual data loaded from Walrus blobs) ─────────────────────────────
function DataPreviewTable({ dataset }: { dataset: Dataset }) {
  const sampleRows = {
    "btc-full-history": [
      { tx_hash: "a1b2c3...", block: "830,241", from: "1A1zP1...", to: "3J98t...", amount: "0.5823", fee: "0.00001", time: "2024-01-15 08:23:11" },
      { tx_hash: "d4e5f6...", block: "830,242", from: "bc1q0...", to: "1BoatS...", amount: "2.1000", fee: "0.00002", time: "2024-01-15 08:23:45" },
      { tx_hash: "789abc...", block: "830,242", from: "3Cbiiv...", to: "bc1qa...", amount: "0.0021", fee: "0.00001", time: "2024-01-15 08:24:01" },
    ],
    "eth-full-history": [
      { tx_hash: "0xa1b2...", block: "19,423,112", from: "0x742d...", to: "0xA0b8...", value: "1.234 ETH", gas: "21000", gas_price: "32 Gwei", time: "2024-03-12 14:22:33" },
      { tx_hash: "0xc3d4...", block: "19,423,113", from: "0xdAC1...", to: "0x68b3...", value: "0 ETH", gas: "156,823", gas_price: "31 Gwei", time: "2024-03-12 14:22:47" },
      { tx_hash: "0xe5f6...", block: "19,423,114", from: "0x22F5...", to: "0x7a25...", value: "0.5 ETH", gas: "21000", gas_price: "33 Gwei", time: "2024-03-12 14:23:05" },
    ],
    "crypto-price-ohlcv": [
      { timestamp: "2024-01-01 00:00", symbol: "BTC/USD", open: "42,123.50", high: "42,450.00", low: "41,987.00", close: "42,380.00", volume: "1,842.33" },
      { timestamp: "2024-01-01 00:01", symbol: "BTC/USD", open: "42,380.00", high: "42,400.00", low: "42,310.00", close: "42,355.00", volume: "923.11" },
      { timestamp: "2024-01-01 00:02", symbol: "ETH/USD", open: "2,234.50", high: "2,241.00", low: "2,229.00", close: "2,238.00", volume: "8,421.50" },
    ],
    "sui-transactions": [
      { digest: "DK2xM...", checkpoint: "38,423,112", sender: "0x742d...", type: "PTB", gas: "1,234 MIST", modules: "cetus_amm::swap", time: "2026-05-24 10:22:33" },
      { digest: "9mN2q...", checkpoint: "38,423,113", sender: "0xa1b2...", type: "Coin Transfer", gas: "984 MIST", modules: "sui::transfer", time: "2026-05-24 10:22:41" },
      { digest: "P8kLz...", checkpoint: "38,423,114", sender: "0xc3d4...", type: "NFT Mint", gas: "2,341 MIST", modules: "bluemove::mint", time: "2026-05-24 10:22:55" },
    ],
  };

  const defaultRows = [
    { id: "row_001", data: "Sample data row 1", chain: dataset.chain, timestamp: "2024-01-01" },
    { id: "row_002", data: "Sample data row 2", chain: dataset.chain, timestamp: "2024-01-02" },
    { id: "row_003", data: "Sample data row 3", chain: dataset.chain, timestamp: "2024-01-03" },
  ];

  const rows = sampleRows[dataset.id as keyof typeof sampleRows] || defaultRows;
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="overflow-x-auto rounded-xl border border-white/5">
      <table className="data-table">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h.replace(/_/g, " ")}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {Object.values(row).map((val, j) => (
                <td key={j} className="font-mono text-xs max-w-[150px] truncate">
                  {String(val)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2 text-xs text-white/30 border-t border-white/5 flex items-center justify-between">
        <span>Showing 3 preview rows • Full dataset: {dataset.rowCount}</span>
        <span className="font-mono">{dataset.format} format</span>
      </div>
    </div>
  );
}

// ─── Dataset Detail Modal ──────────────────────────────────
function DatasetModal({ dataset, onClose }: { dataset: Dataset; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copyBlobId = () => {
    if (dataset.blobId) {
      navigator.clipboard.writeText(dataset.blobId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="card w-full max-w-3xl max-h-[90vh] overflow-y-auto scroll-area p-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div
          className="p-6 border-b border-white/5 flex items-start justify-between"
          style={{ background: `${dataset.chainColor}08` }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: `${dataset.chainColor}15`, border: `1px solid ${dataset.chainColor}30` }}
            >
              {dataset.chainIcon}
            </div>
            <div>
              <h2 className="font-display font-bold text-white text-xl">{dataset.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-white/30 text-sm">{dataset.chain}</span>
                <span className="text-white/30">·</span>
                <FormatBadge format={dataset.format} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          <p className="text-white/40 leading-relaxed">{dataset.description}</p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: <HardDrive className="w-4 h-4" />, label: "Size", value: dataset.size },
              { icon: <Calendar className="w-4 h-4" />, label: "Time Range", value: dataset.timeRange },
              { icon: <BarChart2 className="w-4 h-4" />, label: "Records", value: dataset.rowCount || "—" },
              { icon: <FileText className="w-4 h-4" />, label: "Format", value: dataset.format },
            ].map(({ icon, label, value }) => (
              <div key={label} className="card p-4 border-white/[0.04]">
                <div className="flex items-center gap-2 text-white/30 text-xs mb-2">
                  {icon} {label}
                </div>
                <div className="text-white font-semibold">{value}</div>
              </div>
            ))}
          </div>

          {/* Walrus blob section */}
          <div className="card p-4 border-teal-500/20 bg-teal-500/5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span className="text-white font-medium text-sm">Walrus Storage Verified</span>
              <span className="badge badge-teal text-xs ml-auto">Proof of Availability</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 font-mono text-sm text-teal-300 bg-teal-500/10 rounded-lg px-4 py-2.5 border border-teal-500/20 truncate">
                Blob ID: {dataset.blobId || "Fetching from Walrus..."}
              </div>
              <button
                onClick={copyBlobId}
                className="p-2.5 rounded-lg border border-teal-500/20 bg-teal-500/10 hover:bg-teal-500/20 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4 text-teal-400" />}
              </button>
            </div>
            {dataset.blobId && !dataset.blobId.startsWith("BLOB_ID_") && (
              <a
                href={getAggregatorUrl(dataset.blobId)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 mt-2 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                View on Walrus Aggregator
              </a>
            )}
          </div>

          {/* Aggregator URL */}
          <div className="card p-4 border-purple-500/20 bg-purple-500/5">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="w-4 h-4 text-purple-400" />
              <span className="text-white font-medium text-sm">Fetch via HTTP</span>
            </div>
            <div className="font-mono text-xs text-purple-300 bg-purple-500/10 rounded-lg px-4 py-3 border border-purple-500/20 break-all">
              {`curl https://aggregator.walrus.space/v1/blobs/${dataset.blobId || "<BLOB_ID>"}`}
            </div>
          </div>

          {/* Data preview */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-white/30" />
              <span className="text-white font-medium text-sm">Data Preview</span>
              <span className="text-white/30 text-xs">(3 rows)</span>
            </div>
            <DataPreviewTable dataset={dataset} />
          </div>

          {/* Tags */}
          <div>
            <div className="text-sm text-white/30 mb-3">Tags</div>
            <div className="flex flex-wrap gap-2">
              {dataset.tags.map((tag) => (
                <span key={tag} className="font-mono text-xs text-white/30 bg-white/[0.03] border border-white/5 rounded px-2.5 py-1">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Link
              href={`/chat?q=Tell me about the ${dataset.name} dataset on Walrus`}
              className="btn-primary flex items-center gap-2 text-sm flex-1 justify-center"
            >
              <Brain className="w-4 h-4" />
              Query with AI
            </Link>
            <button className="btn-ghost flex items-center gap-2 text-sm px-4">
              <Download className="w-4 h-4 text-teal-400" />
              Export Sample
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Explore Page ──────────────────────────────────────────
export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

  const filtered = TATUM_DATASETS.filter((ds) => {
    const matchSearch =
      ds.name.toLowerCase().includes(search.toLowerCase()) ||
      ds.chain.toLowerCase().includes(search.toLowerCase()) ||
      ds.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchChain = filter === "All" || ds.chain === filter;
    return matchSearch && matchChain;
  });

  const totalSize = "11+ TB";
  const totalDatasets = TATUM_DATASETS.length;

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute -top-[15%] -left-[10%] w-[600px] h-[600px] bg-gradient-to-br from-teal-500/15 via-teal-500/5 to-transparent rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[500px] h-[500px] bg-gradient-to-bl from-purple-500/10 via-purple-500/5 to-transparent rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[30%] w-[400px] h-[400px] bg-gradient-to-t from-cyan-500/10 via-transparent to-transparent rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="border-b border-white/[0.06] bg-black/40 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1.5 text-white/30 hover:text-white transition-colors text-sm">
              <ChevronLeft className="w-4 h-4" />
              Home
            </Link>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-400" />
              <span className="font-display font-bold text-white">Dataset Explorer</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ConnectWalletButton />
            <Link href="/chat" className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-400 to-teal-500 text-black font-bold text-sm hover:from-teal-300 hover:to-teal-400 transition-all shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Chat with Data
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Page title */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-500/10 to-purple-500/10 border border-white/[0.06] text-xs mb-4">
            <CheckCircle2 className="w-3 h-3 text-teal-400" />
            <span className="bg-gradient-to-r from-teal-300 to-purple-300 bg-clip-text text-transparent font-bold uppercase tracking-widest">Walrus Verified</span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4 tracking-tight">
            Tatum Historical{" "}
            <span className="bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">Datasets</span>
          </h1>
          <p className="text-white/30 text-lg max-w-2xl">
            {totalSize} of verified blockchain history stored on Walrus decentralized storage.
            Every dataset is immutable, publicly readable, and cryptographically pinned to Sui.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <HardDrive className="w-5 h-5 text-teal-400" />, value: "11+ TB", label: "Total Data", color: "border-teal-500/20 bg-teal-500/5" },
            { icon: <Database className="w-5 h-5 text-purple-400" />, value: `${totalDatasets} Datasets`, label: "Available Now", color: "border-purple-500/20 bg-purple-500/5" },
            { icon: <Globe className="w-5 h-5 text-blue-400" />, value: "4 Chains", label: "Bitcoin, ETH, BNB, Sui", color: "border-blue-500/20 bg-blue-500/5" },
            { icon: <Zap className="w-5 h-5 text-yellow-400" />, value: "HTTP Access", label: "via Walrus Aggregator", color: "border-yellow-500/20 bg-yellow-500/5" },
          ].map(({ icon, value, label, color }) => (
            <div key={label} className={`card p-4 border ${color} flex items-center gap-3`}>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">{icon}</div>
              <div>
                <div className="text-white font-bold text-lg leading-tight">{value}</div>
                <div className="text-white/30 text-xs">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search datasets by name, chain, or tag..."
              className="w-full bg-black/40 border border-white/[0.06] rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-purple-500/40 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/30" />
            <div className="flex gap-1.5">
              {CHAIN_FILTERS.map((chain) => (
                <button
                  key={chain}
                  onClick={() => setFilter(chain)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    filter === chain
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "text-white/30 hover:text-white border border-transparent hover:border-white/10"
                  }`}
                >
                  {chain}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dataset grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <Database className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No datasets match your search.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((ds) => (
              <DatasetCard key={ds.id} dataset={ds} onClick={() => setSelectedDataset(ds)} />
            ))}
          </div>
        )}

        {/* How to access CTA */}
        <div className="mt-12 bg-black/40 backdrop-blur-xl rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 ambient-blob ambient-purple opacity-20" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display font-bold text-2xl text-white mb-2">
                Access any dataset with a single HTTP call
              </h3>
              <p className="text-white/40 mb-4">
                No authentication required. No rate limiting. Just fetch directly from any Walrus aggregator.
              </p>
              <div className="font-mono text-sm text-teal-300 bg-teal-500/10 rounded-xl px-5 py-3 border border-teal-500/20 inline-block">
                GET https://aggregator.walrus.space/v1/blobs/{"<BLOB_ID>"}
              </div>
            </div>
            <div className="flex flex-col gap-3 min-w-fit">
              <Link href="/chat" className="btn-primary flex items-center gap-2 justify-center whitespace-nowrap">
                <Brain className="w-4 h-4" />
                Query with AI
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://docs.wal.app"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost flex items-center gap-2 justify-center text-sm whitespace-nowrap"
              >
                Walrus Docs
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset modal */}
      {selectedDataset && (
        <DatasetModal dataset={selectedDataset} onClose={() => setSelectedDataset(null)} />
      )}
    </div>
  );
}
