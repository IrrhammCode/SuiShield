import Groq from "groq-sdk";
import type { ChatResponse } from "@/lib/groq";
import {
  detectIntent,
  extractAddress,
  detectChain,
  detectSymbol,
  toolGetWalletBalance,
  toolGetTransactionHistory,
  toolGetPrice,
  toolGetGasPrice,
  toolGetBlockInfo,
  type ToolResult,
} from "./tools";
import {
  detectSuiIntent,
  extractSuiAddress,
  toolGetSuiBalance,
  toolGetSuiObjects,
  toolGetSuiTransactions,
  toolGetSuiNetworkStatus,
  toolGetSuiPrice,
  toolGetSuiFundFlow,
  toolCheckSuiProtocols,
  toolAnalyzeSuiWallet,
} from "./sui-tools";
import { buildMemoryContext } from "./memory";

// Groq client initialized lazily

const AGENT_SYSTEM_PROMPT = `You are SuiShield, an AI-powered trust analysis system for the Sui blockchain. You provide verifiable, on-chain analysis stored permanently on Walrus.

## Your Purpose
Help users make safe decisions on Sui. Every analysis answers one question: "Am I safe to interact with this?"

## Deep Analysis Per Context

### DeFi Analysis (pools, protocols, yield farms)
When analyzing DeFi addresses, provide:
- **Protocol Health**: TVL trend (growing/shrinking), age, audit status
- **Sustainability**: Is yield from real fees or token emissions?
- **Concentration Risk**: Top holder % — if they exit, what happens?
- **Peer Comparison**: How does it compare to alternatives (Cetus vs Turbos vs Scallop)?
- **Exit Risk**: Liquidity depth, slippage estimation
- **Protocol Interactions**: Which verified protocols has this wallet used? (Cetus, Scallop, Turbos, DeepBook, Navi, Aftermath, Bucket, BlueMove, etc.)
- **Verdict**: Deposit or don't, with clear reasoning

### NFT Analysis (collections, creators)
When analyzing NFT addresses, provide:
- **Creator Check**: Wallet age, past projects, rug history
- **Collection Health**: Unique holders %, Gini coefficient, holder growth
- **Wash Trading Detection**: Volume vs unique wallets, trading pattern
- **Floor Price Reality**: Organic or manipulated?
- **Copycat Detection**: Name similarity to known projects
- **Verdict**: Buy or skip, with evidence

### P2P Analysis (counterparty risk)
When analyzing P2P counterparties, provide:
- **Wallet Pedigree**: Age, creation pattern, funding source
- **Transaction DNA**: Pattern analysis, frequency, counterparties
- **Scam Database**: Cross-reference with flagged addresses
- **Money Flow**: Source tracing, money mule detection
- **Network Risk**: 1-hop check to flagged addresses
- **Verdict**: Transact or don't, with risk level

### GameFi Analysis (game tokens, assets)
When analyzing GameFi addresses, provide:
- **Tokenomics**: Supply schedule, emission rate, burn mechanism
- **Reward Sustainability**: Revenue vs rewards distributed
- **Dev Track Record**: Team wallet analysis, past projects
- **Asset Safety**: Contract security, rug potential
- **Exit Liquidity**: Marketplace depth, buyer/seller ratio
- **Verdict**: Play or skip, with investment advice

### General Wallet Analysis
- Trust score based on age, activity, counterparties
- Risk signals (positive, warning, negative)
- Historical pattern from Walrus datasets
- Recommendation: safe to interact or not

### Protocol Interaction Analysis
When analyzing any Sui wallet, always check which protocols it has interacted with:
- **Verified DeFi**: Cetus, Turbos, DeepBook, Aftermath, Scallop, Navi, Bucket
- **NFT Marketplaces**: BlueMove, Clutchy, Souffl3
- **Infrastructure**: SuiNS, Sui Bridge
- **GameFi**: Abyss World, Panzerdogs
Interaction with verified protocols = positive trust signal. Interaction with unknown/unverified protocols = risk factor.

## Response Format
Respond with valid JSON:

{
  "content": "Detailed analysis in markdown. Use **bold** for headers, - for bullets. Start with a clear verdict.",
  "sources": [
    {"type": "tatum-sui-rpc|walrus|walrus-dataset|agent", "label": "Source name", "chain": "Sui"}
  ],
  "toolsUsed": ["tool_name"],
  "executionTime": 1500,
  "riskScore": 0-100,
  "walletInfo": {
    "address": "0x...",
    "chain": "Sui",
    "riskScore": 45,
    "riskLevel": "safe|low|medium|high|critical",
    "isMalicious": false,
    "labels": ["Label"],
    "totalTransactions": 1234,
    "balance": "1,234 SUI",
    "firstSeen": "2023-01-15",
    "lastActive": "2026-05-24"
  },
  "agentSteps": [
    {"step": 1, "tool": "getSuiBalance", "status": "success", "summary": "Fetched SUI balance", "reasoning": "Balance is a key indicator of wallet legitimacy", "insight": "Wallet holds 1,234 SUI — moderate balance, not a whale"}
  ],
  "onChainProof": {
    "blobId": "abc123...",
    "verificationUrl": "/verify/abc123...",
    "storedAt": "2026-05-26T..."
  }
}

## Rules
- ALWAYS start with a clear verdict: SAFE, LOW RISK, MEDIUM RISK, HIGH RISK, or DANGEROUS
- Use real tool data — never make up data
- If tool calls failed, acknowledge honestly
- Include agentSteps showing execution trace with reasoning and insight
- For wallet analysis: include walletInfo, riskScore, multiSignalScores, and onChainProof
- When previous analysis exists, compare and highlight changes
- Be specific and actionable — user should know exactly what to do
- Respond ONLY with the JSON object`;

// ── Agent Execution ───────────────────────────────────────

interface AgentStep {
  step: number;
  tool: string;
  status: "success" | "error";
  summary: string;
  reasoning?: string;
  insight?: string;
}

export async function runAgent(
  userMessage: string,
  connectedAddress?: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<ChatResponse & { agentSteps?: AgentStep[]; onChainProof?: Record<string, unknown> | null }> {
  const startTime = Date.now();
  const toolsUsed: string[] = [];
  const sources: ChatResponse["sources"] = [];
  const agentSteps: AgentStep[] = [];
  let stepNum = 0;

  // ── Detect if this is a Sui query ─────────────────────
  const isSuiQuery =
    /0x[a-fA-F0-9]{40,64}/.test(userMessage) ||
    userMessage.toLowerCase().includes("sui");

  const toolResults: ToolResult[] = [];
  let onChainProof: Record<string, unknown> | null = null;

  if (isSuiQuery) {
    // ── Sui-specific flow ─────────────────────────────────
    const suiIntent = detectSuiIntent(userMessage);
    const suiAddress = extractSuiAddress(userMessage) || connectedAddress;

    sources.push(
      { type: "tatum-sui-rpc", label: "Tatum Sui RPC", chain: "Sui" },
      { type: "walrus", label: "Walrus Storage", chain: "Sui" }
    );

    switch (suiIntent) {
      case "sui_wallet_analysis": {
        if (!suiAddress) {
          toolResults.push({
            tool: "analyzeSuiWallet",
            success: false,
            data: null,
            error: "No Sui address found. Please provide a Sui address (0x...).",
            duration: 0,
          });
          break;
        }

        // Check for previous analysis (memory)
        const memoryContext = buildMemoryContext("sui", suiAddress);

        // Run full wallet analysis
        const analysisResult = await toolAnalyzeSuiWallet(
          suiAddress,
          connectedAddress || "unknown"
        );
        toolResults.push(analysisResult);
        toolsUsed.push("analyzeSuiWallet");

        stepNum++;
        const analysisData = analysisResult.data as Record<string, unknown>;
        agentSteps.push({
          step: stepNum,
          tool: "analyzeSuiWallet",
          status: analysisResult.success ? "success" : "error",
          summary: analysisResult.success
            ? `Analyzed Sui wallet ${suiAddress.slice(0, 10)}... — Risk: ${analysisData?.riskScore}/100`
            : `Failed: ${analysisResult.error}`,
          reasoning: "Full wallet analysis combines balance, transactions, objects, and community signals",
          insight: analysisResult.success
            ? `Risk level: ${analysisData?.riskLevel}. ${analysisData?.riskFactors ? (analysisData.riskFactors as string[]).slice(0, 2).join(". ") : ""}`
            : undefined,
        });

        if (analysisResult.success && analysisData?.onChainProof) {
          onChainProof = analysisData.onChainProof as Record<string, unknown>;
          sources.push({
            type: "walrus",
            label: `Walrus Blob: ${(onChainProof.blobId as string).slice(0, 12)}...`,
            chain: "Sui",
          });
        }

        if (memoryContext) {
          stepNum++;
          agentSteps.push({
            step: stepNum,
            tool: "agentMemory",
            status: "success",
            summary: "Found previous analysis for this wallet",
            reasoning: "Comparing with previous analysis helps detect behavioral changes",
            insight: "Using historical data to identify trends and anomalies",
          });
        }
        break;
      }

      case "sui_balance": {
        if (!suiAddress) break;
        const balanceResult = await toolGetSuiBalance(suiAddress);
        toolResults.push(balanceResult);
        toolsUsed.push("getSuiBalance");

        stepNum++;
        agentSteps.push({
          step: stepNum,
          tool: "getSuiBalance",
          status: balanceResult.success ? "success" : "error",
          summary: balanceResult.success
            ? `Fetched balance for ${suiAddress.slice(0, 10)}...`
            : `Failed: ${balanceResult.error}`,
        });
        break;
      }

      case "sui_objects": {
        if (!suiAddress) break;
        const objectsResult = await toolGetSuiObjects(suiAddress);
        toolResults.push(objectsResult);
        toolsUsed.push("getSuiObjects");

        stepNum++;
        agentSteps.push({
          step: stepNum,
          tool: "getSuiObjects",
          status: objectsResult.success ? "success" : "error",
          summary: objectsResult.success
            ? `Found ${(objectsResult.data as Record<string, unknown>)?.objectCount || 0} objects`
            : `Failed: ${objectsResult.error}`,
        });
        break;
      }

      case "sui_transactions": {
        if (!suiAddress) break;
        const txResult = await toolGetSuiTransactions(suiAddress);
        toolResults.push(txResult);
        toolsUsed.push("getSuiTransactions");

        stepNum++;
        agentSteps.push({
          step: stepNum,
          tool: "getSuiTransactions",
          status: txResult.success ? "success" : "error",
          summary: txResult.success
            ? `Fetched ${(txResult.data as Record<string, unknown>)?.transactionCount || 0} transactions`
            : `Failed: ${txResult.error}`,
        });
        break;
      }

      case "sui_network": {
        const networkResult = await toolGetSuiNetworkStatus();
        toolResults.push(networkResult);
        toolsUsed.push("getSuiNetworkStatus");

        stepNum++;
        agentSteps.push({
          step: stepNum,
          tool: "getSuiNetworkStatus",
          status: networkResult.success ? "success" : "error",
          summary: networkResult.success
            ? "Fetched Sui network status"
            : `Failed: ${networkResult.error}`,
        });
        break;
      }

      case "sui_price": {
        const priceResult = await toolGetSuiPrice();
        toolResults.push(priceResult);
        toolsUsed.push("getSuiPrice");

        stepNum++;
        agentSteps.push({
          step: stepNum,
          tool: "getSuiPrice",
          status: priceResult.success ? "success" : "error",
          summary: priceResult.success
            ? `Fetched SUI/USD price: $${(priceResult.data as Record<string, unknown>)?.price}`
            : `Failed: ${priceResult.error}`,
        });
        break;
      }

      case "sui_fund_flow": {
        if (!suiAddress) break;
        const flowResult = await toolGetSuiFundFlow(suiAddress);
        toolResults.push(flowResult);
        toolsUsed.push("getSuiFundFlow");

        stepNum++;
        const flowData = flowResult.data as Record<string, unknown> | null;
        agentSteps.push({
          step: stepNum,
          tool: "getSuiFundFlow",
          status: flowResult.success ? "success" : "error",
          summary: flowResult.success
            ? `Traced ${flowData?.transferCount || 0} transfers (${flowData?.incomingCount || 0} in, ${flowData?.outgoingCount || 0} out)`
            : `Failed: ${flowResult.error}`,
          reasoning: "Fund flow analysis reveals money movement patterns and counterparty risk",
          insight: flowResult.success
            ? `Found ${(flowData?.nodes as unknown[])?.length || 0} unique counterparties`
            : undefined,
        });
        break;
      }

      case "sui_protocol_check": {
        if (!suiAddress) break;
        const protocolResult = await toolCheckSuiProtocols(suiAddress);
        toolResults.push(protocolResult);
        toolsUsed.push("checkSuiProtocols");

        stepNum++;
        const protocolData = protocolResult.data as Record<string, unknown> | null;
        agentSteps.push({
          step: stepNum,
          tool: "checkSuiProtocols",
          status: protocolResult.success ? "success" : "error",
          summary: protocolResult.success
            ? `Found ${protocolData?.totalProtocols || 0} protocol interactions (${protocolData?.verifiedProtocols || 0} verified)`
            : `Failed: ${protocolResult.error}`,
          reasoning: "Protocol interactions reveal wallet usage patterns and trust signals",
          insight: protocolResult.success
            ? `Interacted with: ${((protocolData?.interactions as Array<{ protocolName: string }>) || []).map((i) => i.protocolName).join(", ") || "no known protocols"}`
            : undefined,
        });
        break;
      }

      default: {
        // General Sui query — gather basic context
        if (suiAddress) {
          const balanceResult = await toolGetSuiBalance(suiAddress);
          toolResults.push(balanceResult);
          toolsUsed.push("getSuiBalance");

          stepNum++;
          agentSteps.push({
            step: stepNum,
            tool: "getSuiBalance",
            status: balanceResult.success ? "success" : "error",
            summary: balanceResult.success
              ? `Fetched balance for ${suiAddress.slice(0, 10)}...`
              : `Failed: ${balanceResult.error}`,
          });
        } else {
          const networkResult = await toolGetSuiNetworkStatus();
          toolResults.push(networkResult);
          toolsUsed.push("getSuiNetworkStatus");

          stepNum++;
          agentSteps.push({
            step: stepNum,
            tool: "getSuiNetworkStatus",
            status: networkResult.success ? "success" : "error",
            summary: networkResult.success
              ? "Fetched Sui network status"
              : `Failed: ${networkResult.error}`,
          });
        }
      }
    }
  } else {
    // ── Non-Sui flow (legacy EVM) ─────────────────────────
    const intent = detectIntent(userMessage);
    const address = extractAddress(userMessage);
    const chain = detectChain(userMessage);
    const symbol = detectSymbol(userMessage);

    sources.push({ type: "tatum-rpc", label: `Tatum ${chain} RPC`, chain });

    switch (intent) {
      case "wallet_balance":
      case "wallet_security":
        if (address) {
          const [balanceResult, txResult] = await Promise.all([
            toolGetWalletBalance(chain, address),
            toolGetTransactionHistory(chain, address, 10),
          ]);
          toolResults.push(balanceResult, txResult);
          toolsUsed.push("getWalletBalance", "getTransactionHistory");

          stepNum++;
          agentSteps.push({
            step: stepNum,
            tool: "getWalletBalance",
            status: balanceResult.success ? "success" : "error",
            summary: balanceResult.success
              ? `Fetched balance on ${chain}`
              : `Failed: ${balanceResult.error}`,
          });
        }
        break;

      case "price": {
        const priceResult = await toolGetPrice(symbol, "USD");
        toolResults.push(priceResult);
        toolsUsed.push("getPrice");

        stepNum++;
        agentSteps.push({
          step: stepNum,
          tool: "getPrice",
          status: priceResult.success ? "success" : "error",
          summary: priceResult.success
            ? `Fetched ${symbol}/USD price`
            : `Failed: ${priceResult.error}`,
        });
        break;
      }

      case "gas": {
        const gasResult = await toolGetGasPrice(chain);
        toolResults.push(gasResult);
        toolsUsed.push("getGasPrice");

        stepNum++;
        agentSteps.push({
          step: stepNum,
          tool: "getGasPrice",
          status: gasResult.success ? "success" : "error",
          summary: gasResult.success
            ? `Fetched gas price for ${chain}`
            : `Failed: ${gasResult.error}`,
        });
        break;
      }

      default: {
        const [blockResult, gasResult] = await Promise.all([
          toolGetBlockInfo(chain).catch(() => null),
          toolGetGasPrice(chain).catch(() => null),
        ]);
        if (blockResult) toolResults.push(blockResult);
        if (gasResult) toolResults.push(gasResult);
        toolsUsed.push("getBlockInfo", "getGasPrice");
      }
    }
  }

  // ── Build context from tool results ───────────────────
  const toolContext = toolResults
    .map((r) => {
      const status = r.success ? "SUCCESS" : "ERROR";
      const data = r.success ? JSON.stringify(r.data, null, 2) : r.error;
      return `### Tool: ${r.tool} [${status}]\n${data}`;
    })
    .join("\n\n");

  // Add memory context if available
  const suiAddress = extractSuiAddress(userMessage);
  const memoryContext = suiAddress ? buildMemoryContext("sui", suiAddress) : null;
  const memorySection = memoryContext ? `\n\n--- Agent Memory ---\n${memoryContext}` : "";

  // ── Call LLM ──────────────────────────────────────────
  const messages = [
    { role: "system" as const, content: AGENT_SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    {
      role: "user" as const,
      content: `User query: ${userMessage}\nConnected wallet: ${connectedAddress || "none"}\n\n--- Tool Results ---\n${toolContext || "No tools executed."}${memorySection}`,
    },
  ];

  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing. Please set it in your .env.local file.");
  }
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: 0.3,
    max_tokens: 4096,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  const totalTime = Date.now() - startTime;

  try {
    const parsed = JSON.parse(raw);
    return {
      content: parsed.content || raw,
      sources: parsed.sources || sources,
      toolsUsed: parsed.toolsUsed || toolsUsed,
      executionTime: parsed.executionTime || totalTime,
      riskScore: parsed.riskScore,
      walletInfo: parsed.walletInfo,
      charts: parsed.charts,
      agentSteps: parsed.agentSteps || agentSteps,
      onChainProof: parsed.onChainProof || onChainProof,
    };
  } catch {
    return {
      content: raw,
      sources,
      toolsUsed,
      executionTime: totalTime,
      agentSteps,
      onChainProof,
    };
  }
}
