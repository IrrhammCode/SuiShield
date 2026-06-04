// Community Scam Report System
// Users can report scam addresses, verify/dispute reports
// Trust scores update based on community consensus

import { storeAnalysisOnWalrus } from "./walrus-write";

// ── Types ────────────────────────────────────────────────

export interface ScamReport {
  id: string;
  address: string;
  chain: string;
  reportedBy: string;
  reason: string;
  category: "rug_pull" | "phishing" | "fake_token" | "wash_trading" | "scam_airdrop" | "other";
  evidence: string;
  timestamp: string;
  status: "pending" | "verified" | "disputed" | "resolved";
  verifications: number;
  disputes: number;
  riskScore: number;
}

export interface ReportVote {
  reportId: string;
  voter: string;
  vote: "verify" | "dispute";
  reason?: string;
  timestamp: string;
}

// ── In-Memory Store (demo — production would use DB) ─────

const reports = new Map<string, ScamReport>();
const votes = new Map<string, ReportVote[]>();

// ── Submit Scam Report ───────────────────────────────────

export async function submitScamReport(params: {
  address: string;
  chain: string;
  reportedBy: string;
  reason: string;
  category: ScamReport["category"];
  evidence: string;
}): Promise<ScamReport> {
  const id = `report_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const report: ScamReport = {
    id,
    address: params.address,
    chain: params.chain || "sui",
    reportedBy: params.reportedBy,
    reason: params.reason,
    category: params.category,
    evidence: params.evidence,
    timestamp: new Date().toISOString(),
    status: "pending",
    verifications: 0,
    disputes: 0,
    riskScore: 50, // Neutral until verified
  };

  // Store report locally
  reports.set(id, report);

  // Also store on Walrus for immutability
  try {
    await storeAnalysisOnWalrus({
      version: "1.0",
      type: "wallet-analysis",
      address: params.address,
      chain: params.chain || "sui",
      timestamp: report.timestamp,
      riskScore: 50,
      riskLevel: "medium",
      balance: "0",
      transactionCount: 0,
      analysis: `SCAM REPORT: ${params.reason}. Category: ${params.category}. Evidence: ${params.evidence}`,
      agentSteps: ["scamReport", "storeOnWalrus"],
      analyzedBy: params.reportedBy,
      inputHash: "",
      outputHash: "",
      model: "community",
      proofVersion: "1.0",
    });
  } catch (error) {
    console.warn("Failed to store report on Walrus:", error);
  }

  return report;
}

// ── Vote on Report ───────────────────────────────────────

export function voteOnReport(
  reportId: string,
  voter: string,
  vote: "verify" | "dispute",
  reason?: string
): { success: boolean; report: ScamReport | null; message: string } {
  const report = reports.get(reportId);
  if (!report) {
    return { success: false, report: null, message: "Report not found" };
  }

  // Check if already voted
  const reportVotes = votes.get(reportId) || [];
  const alreadyVoted = reportVotes.find((v) => v.voter === voter);
  if (alreadyVoted) {
    return { success: false, report, message: "You already voted on this report" };
  }

  // Add vote
  reportVotes.push({
    reportId,
    voter,
    vote,
    reason,
    timestamp: new Date().toISOString(),
  });
  votes.set(reportId, reportVotes);

  // Update report counts
  if (vote === "verify") {
    report.verifications++;
  } else {
    report.disputes++;
  }

  // Update status based on consensus
  if (report.verifications >= 3 && report.verifications > report.disputes) {
    report.status = "verified";
    report.riskScore = 85; // High risk if verified
  } else if (report.disputes >= 3 && report.disputes > report.verifications) {
    report.status = "disputed";
    report.riskScore = 25; // Low risk if disputed
  }

  reports.set(reportId, report);

  return { success: true, report, message: "Vote recorded" };
}

// ── Get Reports for Address ──────────────────────────────

export function getReportsForAddress(address: string): ScamReport[] {
  return Array.from(reports.values())
    .filter((r) => r.address === address)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// ── Get Community Risk Score ─────────────────────────────

export function getCommunityRiskScore(address: string): {
  score: number;
  reportCount: number;
  verifiedCount: number;
  disputedCount: number;
  consensus: "safe" | "uncertain" | "risky";
} {
  const addressReports = getReportsForAddress(address);

  if (addressReports.length === 0) {
    return { score: 50, reportCount: 0, verifiedCount: 0, disputedCount: 0, consensus: "uncertain" };
  }

  const verifiedCount = addressReports.filter((r) => r.status === "verified").length;
  const disputedCount = addressReports.filter((r) => r.status === "disputed").length;
  const totalVerifications = addressReports.reduce((sum, r) => sum + r.verifications, 0);
  const totalDisputes = addressReports.reduce((sum, r) => sum + r.disputes, 0);

  // Weighted score
  let score = 50;
  if (verifiedCount > 0) score += verifiedCount * 15;
  if (disputedCount > 0) score -= disputedCount * 10;
  if (totalVerifications > totalDisputes * 2) score += 20;
  if (totalDisputes > totalVerifications * 2) score -= 15;

  score = Math.max(0, Math.min(100, score));

  const consensus = verifiedCount > disputedCount
    ? "risky"
    : disputedCount > verifiedCount
    ? "safe"
    : "uncertain";

  return {
    score,
    reportCount: addressReports.length,
    verifiedCount,
    disputedCount,
    consensus,
  };
}

// ── Get All Recent Reports ───────────────────────────────

export function getRecentReports(limit = 20): ScamReport[] {
  return Array.from(reports.values())
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

// ── Report Categories ────────────────────────────────────

export const REPORT_CATEGORIES = {
  rug_pull: { label: "Rug Pull", icon: "💸", description: "Liquidity drained, project abandoned" },
  phishing: { label: "Phishing", icon: "🎣", description: "Fake website/app stealing credentials" },
  fake_token: { label: "Fake Token", icon: "🪙", description: "Impersonating legitimate token" },
  wash_trading: { label: "Wash Trading", icon: "🔄", description: "Fake volume via self-trades" },
  scam_airdrop: { label: "Scam Airdrop", icon: "🎁", description: "Malicious airdrop requiring approval" },
  other: { label: "Other", icon: "⚠️", description: "Other suspicious activity" },
} as const;
