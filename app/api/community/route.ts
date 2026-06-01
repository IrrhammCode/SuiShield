import { NextRequest } from "next/server";
import {
  submitScamReport,
  voteOnReport,
  getReportsForAddress,
  getCommunityRiskScore,
  getRecentReports,
  REPORT_CATEGORIES,
} from "@/lib/community";
import { apiError, apiSuccess, isValidSuiAddress } from "@/lib/api-utils";

// GET — Get reports for address or recent reports
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");
    const action = searchParams.get("action");

    if (action === "categories") {
      return apiSuccess({ categories: REPORT_CATEGORIES });
    }

    if (action === "recent") {
      const limit = parseInt(searchParams.get("limit") || "20");
      return apiSuccess({ reports: getRecentReports(limit) });
    }

    if (address) {
      if (!isValidSuiAddress(address)) {
        return apiError("Invalid Sui address format", 400);
      }
      const reports = getReportsForAddress(address);
      const risk = getCommunityRiskScore(address);
      return apiSuccess({ reports, risk });
    }

    return apiError("Address or action required", 400);
  } catch (error: unknown) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch reports", 500);
  }
}

// POST — Submit report or vote
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "report") {
      const { address, chain, reportedBy, reason, category, evidence } = body;
      if (!address || !reason || !category) {
        return apiError("address, reason, and category required", 400);
      }
      if (!isValidSuiAddress(address)) {
        return apiError("Invalid Sui address format", 400);
      }
      const report = await submitScamReport({ address, chain, reportedBy, reason, category, evidence });
      return apiSuccess({ success: true, report });
    }

    if (action === "vote") {
      const { reportId, voter, vote, reason } = body;
      if (!reportId || !voter || !vote) {
        return apiError("reportId, voter, and vote required", 400);
      }
      if (!["verify", "dispute"].includes(vote)) {
        return apiError("vote must be 'verify' or 'dispute'", 400);
      }
      const result = voteOnReport(reportId, voter, vote, reason);
      return apiSuccess(result);
    }

    return apiError("Unknown action. Use 'report' or 'vote'", 400);
  } catch (error: unknown) {
    return apiError(error instanceof Error ? error.message : "Failed to process request", 500);
  }
}
