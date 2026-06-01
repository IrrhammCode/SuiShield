import { NextRequest, NextResponse } from "next/server";
import { readAnalysisFromWalrus } from "@/lib/walrus-write";

export async function GET(req: NextRequest) {
  const blobId = req.nextUrl.searchParams.get("blobId");

  if (!blobId) {
    return NextResponse.json({ error: "Missing blobId parameter" }, { status: 400 });
  }

  try {
    const record = await readAnalysisFromWalrus(blobId);
    if (!record) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }
    return NextResponse.json(record);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e instanceof Error ? e.message : String(e)) || "Failed to fetch analysis" }, { status: 500 });
  }
}
