import { NextRequest, NextResponse } from "next/server";

const WALRUS_AGGREGATOR = "https://aggregator.walrus-mainnet.walrus.space";

export async function GET(req: NextRequest) {
  const blobId = req.nextUrl.searchParams.get("blobId");

  if (!blobId) {
    return NextResponse.json({ error: "Missing blobId parameter" }, { status: 400 });
  }

  try {
    // Fetch blob from Walrus
    const response = await fetch(`${WALRUS_AGGREGATOR}/v1/blobs/${blobId}`, {
      headers: { Accept: "application/octet-stream" },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Blob not found on Walrus (${response.status})` },
        { status: 404 }
      );
    }

    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const size = bytes.length;

    // Try to parse as JSON (SuiShield analysis proof)
    let record: Record<string, unknown> | null = null;
    let isJson = false;

    try {
      const text = new TextDecoder().decode(buffer);
      record = JSON.parse(text);
      isJson = true;
    } catch {
      // Not JSON — that's fine, it's a binary blob
    }

    // If it's a SuiShield analysis proof
    if (isJson && record && record.type === "wallet-analysis") {
      return NextResponse.json({
        blobId,
        found: true,
        type: "suiShieldAnalysis",
        record: {
          type: record.type,
          address: record.address,
          chain: record.chain,
          riskScore: record.riskScore,
          riskLevel: record.riskLevel,
          timestamp: record.timestamp,
          analysis: record.analysis,
          analyzedBy: record.analyzedBy,
          model: record.model,
          proofVersion: record.proofVersion,
        },
        size,
        verifiedAt: new Date().toISOString(),
      });
    }

    // If it's JSON but not a SuiShield proof
    if (isJson && record) {
      return NextResponse.json({
        blobId,
        found: true,
        type: "jsonBlob",
        contentType: "application/json",
        size,
        preview: JSON.stringify(record).slice(0, 500),
        verifiedAt: new Date().toISOString(),
      });
    }

    // Binary blob (Parquet, CSV, etc.)
    // Detect content type from first bytes
    let detectedType = "unknown";
    if (bytes[0] === 0x50 && bytes[1] === 0x41 && bytes[2] === 0x52 && bytes[3] === 0x31) {
      detectedType = "parquet";
    } else if (bytes[0] === 0x50 && bytes[1] === 0x4B) {
      detectedType = "zip";
    } else {
      // Check if it's CSV-like
      const textSample = new TextDecoder().decode(bytes.slice(0, 200));
      if (textSample.includes(",") && textSample.includes("\n")) {
        detectedType = "csv";
      }
    }

    return NextResponse.json({
      blobId,
      found: true,
      type: "binaryBlob",
      contentType: detectedType,
      size,
      sizeFormatted: formatBytes(size),
      aggregatorUrl: `${WALRUS_AGGREGATOR}/v1/blobs/${blobId}`,
      verifiedAt: new Date().toISOString(),
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e instanceof Error ? e.message : String(e)) || "Failed to fetch blob" },
      { status: 500 }
    );
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
