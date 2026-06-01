import { NextResponse } from "next/server";

export async function GET() {
  const results: Record<string, { status: string; message: string; details?: string; latencyMs?: number }> = {};

  // Test Tatum Sui RPC
  try {
    const tatumKey = process.env.TATUM_API_KEY;
    if (!tatumKey) {
      results.tatum = { status: "MISSING", message: "TATUM_API_KEY not set" };
    } else {
      const start = Date.now();
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
        signal: AbortSignal.timeout(10000),
      });

      const latencyMs = Date.now() - start;

      if (response.ok) {
        const data = await response.json();
        if (data.result) {
          results.tatum = {
            status: "OK",
            message: "Tatum Sui RPC connected",
            details: `Checkpoint: ${data.result}`,
            latencyMs,
          };
        } else {
          results.tatum = { status: "ERROR", message: "Tatum returned error", details: JSON.stringify(data.error) };
        }
      } else {
        results.tatum = { status: "ERROR", message: `HTTP ${response.status}`, latencyMs };
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
      const start = Date.now();
      const response = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { "Authorization": `Bearer ${groqKey}` },
        signal: AbortSignal.timeout(10000),
      });
      const latencyMs = Date.now() - start;

      if (response.ok) {
        const data = await response.json();
        results.groq = {
          status: "OK",
          message: "Groq API connected",
          details: `${data.data?.length || 0} models available`,
          latencyMs,
        };
      } else {
        results.groq = { status: "ERROR", message: `HTTP ${response.status}`, latencyMs };
      }
    }
  } catch (e) {
    results.groq = { status: "ERROR", message: String(e) };
  }

  // Test Walrus
  try {
    const start = Date.now();
    const response = await fetch("https://aggregator.walrus-testnet.walrus.space/v1/blobs", {
      method: "HEAD",
      signal: AbortSignal.timeout(10000),
    });
    const latencyMs = Date.now() - start;
    results.walrus = {
      status: response.ok || response.status === 405 ? "OK" : "ERROR",
      message: "Walrus aggregator reachable",
      details: `HTTP ${response.status}`,
      latencyMs,
    };
  } catch (e) {
    results.walrus = { status: "ERROR", message: String(e) };
  }

  // Test Sui RPC (direct)
  try {
    const start = Date.now();
    const response = await fetch("https://fullnode.testnet.sui.io:443", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "sui_getLatestCheckpointSequenceNumber",
        params: [],
      }),
      signal: AbortSignal.timeout(10000),
    });
    const latencyMs = Date.now() - start;

    if (response.ok) {
      const data = await response.json();
      results.sui = {
        status: "OK",
        message: "Sui testnet reachable",
        details: `Checkpoint: ${data.result}`,
        latencyMs,
      };
    } else {
      results.sui = { status: "ERROR", message: `HTTP ${response.status}`, latencyMs };
    }
  } catch (e) {
    results.sui = { status: "ERROR", message: String(e) };
  }

  // Test Tatum MCP
  try {
    const start = Date.now();
    const response = await fetch("https://mcp.tatum.io/health", {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    const latencyMs = Date.now() - start;
    results.mcp = {
      status: response.ok ? "OK" : "ERROR",
      message: "Tatum MCP server",
      details: `HTTP ${response.status}`,
      latencyMs,
    };
  } catch {
    results.mcp = { status: "UNAVAILABLE", message: "MCP server not reachable" };
  }

  const allOk = Object.values(results).every((r) => r.status === "OK" || r.status === "UNAVAILABLE");

  return NextResponse.json({
    status: allOk ? "ALL_OK" : "SOME_ISSUES",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    results,
  });
}
