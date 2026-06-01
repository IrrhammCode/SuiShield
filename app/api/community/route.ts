import { NextRequest, NextResponse } from "next/server";
import {
  submitScamReport,
  voteOnReport,
  getReportsForAddress,
  getCommunityRiskScore,
  getRecentReports,
  REPORT_CATEGORIES,
} from "@/lib/community";

// GET — Get reports for address or recent reports
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");
    const action = searchParams.get("action");

    if (action === "categories") {
      return NextResponse.json({ categories: REPORT_CATEGORIES });
    }

    if (action === "recent") {
      const limit = parseInt(searchParams.get("limit") || "20");
      return NextResponse.json({ reports: getRecentReports(limit) });
    }

    if (address) {
      const reports = getReportsForAddress(address);
      const risk = getCommunityRiskScore(address);
      return NextResponse.json({ reports, risk });
    }

    return NextResponse.json({ error: "Address or action required" }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
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
        return NextResponse.json({ error: "address, reason, and category required" }, { status: 400 });
      }
      const report = await submitScamReport({ address, chain, reportedBy, reason, category, evidence });
      return NextResponse.json({ success: true, report });
    }

    if (action === "vote") {
      const { reportId, voter, vote, reason } = body;
      if (!reportId || !voter || !vote) {
        return NextResponse.json({ error: "reportId, voter, and vote required" }, { status: 400 });
      }
      const result = voteOnReport(reportId, voter, vote, reason);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
