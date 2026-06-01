import { NextResponse } from "next/server";

export async function GET() {
  const results: Record<string, { status: string; message: string; details?: string }> = {};

  // Test Tatum Sui RPC
  try {
    const tatumKey = process.env.TATUM_API_KEY;
    if (!tatumKey) {
      results.tatum = { status: "MISSING", message: "TATUM_API_KEY not set" };
    } else {
      const response = await fetch("https://sui-testnet.gateway.tatum.io", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": tatumKey,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "sui_getLatestCheckpointSequenceNumber",
          params: [],
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.result) {
          results.tatum = {
            status: "OK",
            message: "Tatum Sui RPC connected",
            details: `Latest checkpoint: ${data.result}`,
          };
        } else {
          results.tatum = { status: "ERROR", message: "Tatum returned error", details: JSON.stringify(data.error) };
        }
      } else {
        results.tatum = { status: "ERROR", message: `HTTP ${response.status}` };
      }
    }
  } catch (e) {
    results.tatum = { status: "ERROR", message: String(e) };
  }

  // Test Groq
  try {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      results.groq = { status: "MISSING", message: "GROQ_API_KEY not set" };
    } else {
      const response = await fetch("https://api.groq.com/openai/v1/models", {
        headers: {
          "Authorization": `Bearer ${groqKey}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        results.groq = {
          status: "OK",
          message: "Groq API connected",
          details: `${data.data?.length || 0} models available`,
        };
      } else {
        results.groq = { status: "ERROR", message: `HTTP ${response.status}` };
      }
    }
  } catch (e) {
    results.groq = { status: "ERROR", message: String(e) };
  }

  // Test Walrus
  try {
    const response = await fetch("https://aggregator.walrus-testnet.walrus.space/v1/blobs", {
      method: "HEAD",
    });
    results.walrus = {
      status: response.ok || response.status === 405 ? "OK" : "ERROR",
      message: "Walrus aggregator reachable",
      details: `HTTP ${response.status}`,
    };
  } catch (e) {
    results.walrus = { status: "ERROR", message: String(e) };
  }

  // Test Sui RPC (direct)
  try {
    const response = await fetch("https://fullnode.testnet.sui.io:443", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "sui_getLatestCheckpointSequenceNumber",
        params: [],
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      results.sui = {
        status: "OK",
        message: "Sui testnet reachable",
        details: `Latest checkpoint: ${data.result}`,
      };
    } else {
      results.sui = { status: "ERROR", message: `HTTP ${response.status}` };
    }
  } catch (e) {
    results.sui = { status: "ERROR", message: String(e) };
  }

  const allOk = Object.values(results).every((r) => r.status === "OK");

  return NextResponse.json({
    status: allOk ? "ALL_OK" : "SOME_ISSUES",
    timestamp: new Date().toISOString(),
    results,
  });
}
