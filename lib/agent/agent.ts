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

const AGENT_SYSTEM_PROMPT = `You are SuiShield — an AI-powered trust analysis system for the Sui blockchain and cross-chain data.

## CRITICAL: Response Style
- Be CONCISE and DIRECT. Do NOT show your thinking process, tool execution steps, or internal reasoning.
- Output ONLY the final result — clean, structured, premium.
- Use bullet points and bold headers. No verbose explanations.
- Think of it like a Bloomberg terminal or a security dashboard — just the facts, beautifully formatted.
- Do NOT include phrases like "Let me analyze...", "I'll check...", "Based on the tool results...", "Here's what I found..."
- Just give the answer directly.

## Instruction
If the user's query is about analyzing a specific wallet or address, you MUST follow the **Wallet Analysis Framework** below.
If the user asks a general question (e.g. comparing transaction volumes, prices, network stats, or searching datasets), **DO NOT use the wallet analysis format**. Instead, answer naturally, directly, and comprehensively using the provided tool data or your general knowledge.
IMPORTANT: Do not apologize for or mention internal tool execution errors (like getGasPrice failing) unless they are directly the reason you cannot answer the user's core question.

---

## Wallet Analysis Framework
(Use ONLY when analyzing a wallet/address)

### Step 1: On-Chain Data Collection
Execute tools in this order:
1. getSuiBalance — native + token balances
2. getSuiObjects — owned objects, NFTs, contracts
3. getSuiTransactions — transaction history, patterns
4. getSuiFundFlow — money flow, counterparties
5. checkSuiProtocols — DeFi protocol interactions

### Step 2: Multi-Signal Scoring
Calculate these 6 signals (each 0-100):
- **On-Chain Activity**: tx count, frequency, diversity
- **Wallet Maturity**: age, consistent usage
- **Balance Health**: reasonable balance, not empty/whale
- **Community Trust**: previous reports, verifications
- **Protocol Quality**: verified vs unverified protocol usage
- **MCP Security**: malicious address check via Tatum

### Step 3: Risk Classification
- 0-20: SAFE — green, no concerns
- 21-40: LOW RISK — minor notes
- 41-60: MEDIUM RISK — investigate further
- 61-80: HIGH RISK — do not interact
- 81-100: DANGEROUS — confirmed threat

### Step 4: Structured Output
(When analyzing a wallet, output EXACTLY this structure)
**VERDICT**: [SAFE/LOW RISK/MEDIUM RISK/HIGH RISK/DANGEROUS]
**SCORE**: [0-100]/100

**Wallet Overview**
- Address: 0x...
- Balance: X SUI ($Y USD)
- Transactions: N total
- Age: ~X days
- Last Active: timestamp

**Risk Signals**
- [+] Positive signal 1
- [+] Positive signal 2
- [!] Warning signal 1
- [-] Negative signal 1

**Protocol Interactions**
- Verified: Cetus, Scallop, etc.
- Unverified: unknown protocols

**Fund Flow Summary**
- Unique counterparties: N
- Largest transfer: X SUI
- Suspicious patterns: none/detected

**Recommendation**
Clear actionable advice.

## Protocol Database
Verified (positive signal): Cetus, Turbos, DeepBook, Aftermath, Scallop, Navi, Bucket, BlueMove, SuiNS
Unknown (risk factor): any protocol not in the verified list

## Rules
- ALWAYS start with verdict + score
- Use REAL data from tools — never fabricate
- If tools fail, say so honestly
- Be specific and actionable
- Respond ONLY with valid JSON
- Keep content CONCISE — no verbose explanations, no thinking process shown

## Response Format
{
  "content": "Full analysis markdown (verdict, signals, protocols, recommendation)",
  "sources": [{"type": "tatum-sui-rpc|walrus|agent", "label": "Source", "chain": "Sui"}],
  "toolsUsed": ["tool_name"],
  "executionTime": 1500,
  "riskScore": 0-100,
  "walletInfo": {"address": "0x...", "chain": "Sui", "riskScore": 45, "riskLevel": "safe|low|medium|high|critical", "isMalicious": false, "labels": [], "totalTransactions": 1234, "balance": "1,234 SUI", "firstSeen": "2023-01-15", "lastActive": "2026-05-24"},
  "agentSteps": [{"step": 1, "tool": "getSuiBalance", "status": "success", "summary": "Fetched balance", "reasoning": "Why this step matters", "insight": "What the data tells us"}],
  "onChainProof": {"blobId": "abc...", "verificationUrl": "/verify/abc...", "storedAt": "2026-..."}
}`;

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
  history: Array<{ role: "user" | "assistant"; content: string }> = [],
  mode?: string
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
          connectedAddress || "unknown",
          mode
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

        // MCP Security Check
        try {
          const { mcpCheckMaliciousAddress } = await import("@/lib/tatum-mcp");
          const maliciousResult = await mcpCheckMaliciousAddress(suiAddress, "sui-testnet");
          stepNum++;
          agentSteps.push({
            step: stepNum,
            tool: "mcpCheckMaliciousAddress",
            status: "success",
            summary: maliciousResult.isMalicious
              ? `WARNING: Address flagged as malicious (${maliciousResult.category || "unknown"})`
              : "Address not in malicious database",
            reasoning: "Tatum MCP security check cross-references known malicious addresses",
            insight: maliciousResult.isMalicious
              ? `This address is flagged: ${maliciousResult.description || "confirmed threat"}`
              : "No known threats detected for this address",
          });
        } catch {
          // MCP check optional
        }

        // Exchange Rate
        try {
          const { mcpGetExchangeRate } = await import("@/lib/tatum-mcp");
          const rate = await mcpGetExchangeRate("SUI", "USD");
          stepNum++;
          agentSteps.push({
            step: stepNum,
            tool: "mcpGetExchangeRate",
            status: "success",
            summary: `SUI/USD: $${rate.rate.toFixed(4)}`,
            reasoning: "Exchange rate needed to calculate USD value of holdings",
            insight: `Current SUI price: $${rate.rate.toFixed(4)}`,
          });
        } catch {
          // Rate check optional
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
        const promises: Promise<any>[] = [toolGetBlockInfo(chain).catch(() => null)];
        
        // Skip gas price for non-EVM chains
        const isEvm = !["bitcoin", "solana", "sui"].includes(chain);
        if (isEvm) {
          promises.push(toolGetGasPrice(chain).catch(() => null));
          toolsUsed.push("getBlockInfo", "getGasPrice");
        } else {
          toolsUsed.push("getBlockInfo");
        }
        
        const results = await Promise.all(promises);
        results.forEach((res) => {
          if (res) toolResults.push(res);
        });
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
  // Build mode-specific focus instructions
  const modeFocus: Record<string, string> = {
    defi: `\n\n## ANALYSIS MODE: DeFi
CRITICAL: You MUST produce a DeFi-specific analysis that is COMPLETELY DIFFERENT from a general analysis.
The tool results include "modeSpecificData" with DeFi-specific fields like protocolAnalysis, fundFlow, defiRelatedTypes, and verifiedProtocolsUsed. USE THIS DATA.

Your output MUST include these DeFi-specific sections instead of the generic ones:
- **DeFi Protocol Interactions**: List all protocols used (Cetus, Scallop, Turbos, Navi, Bucket, BlueMove, Aftermath, DeepBook). Mark each as verified/unverified.
- **Liquidity & Position Analysis**: LP tokens, pool positions, staking positions found in objects
- **Yield Assessment**: Is yield from real fees or token emissions?
- **Exit Risk**: Liquidity depth, concentration risk, slippage estimation
- **Fund Flow for DeFi**: How money flows between protocols and counterparties

Risk Signals MUST use DeFi-specific markers:
- [+] Uses verified protocols (Cetus, Scallop, etc.)
- [!] Unverified protocol interactions
- [-] High concentration risk or exit liquidity issues

DO NOT produce a generic "wallet overview" analysis. This MUST read as a DeFi audit.`,

    nft: `\n\n## ANALYSIS MODE: NFT
CRITICAL: You MUST produce an NFT-specific analysis that is COMPLETELY DIFFERENT from a general analysis.
The tool results include "modeSpecificData" with NFT-specific fields like nftObjects, collections, collectionCount, mintingTransactions, and washTradingSignals. USE THIS DATA.

Your output MUST include these NFT-specific sections instead of the generic ones:
- **NFT Holdings**: List NFT objects found, grouped by collection
- **Collection Analysis**: Number of collections, diversity of holdings
- **Creator Assessment**: Based on object types and minting patterns
- **Wash Trading Detection**: Analyze volume vs unique counterparties, repeated patterns
- **Minting Activity**: Number of mint transactions, publish transactions
- **Metadata Check**: Object type integrity, display objects

Risk Signals MUST use NFT-specific markers:
- [+] Diverse NFT holdings across multiple collections
- [!] Potential wash trading signals detected
- [-] Copycat or suspicious collection patterns

DO NOT produce a generic "wallet overview" analysis. This MUST read as an NFT collector/creator audit.`,

    p2p: `\n\n## ANALYSIS MODE: P2P Counterparty
CRITICAL: You MUST produce a P2P counterparty risk analysis that is COMPLETELY DIFFERENT from a general analysis.
The tool results include "modeSpecificData" with P2P-specific fields like fundFlow, counterpartyList, repeatedSenders, walletAge, moneyMuleIndicators. USE THIS DATA.

Your output MUST include these P2P-specific sections instead of the generic ones:
- **Counterparty Profile**: Wallet age, first/last transaction dates, activity timeline
- **Money Flow Analysis**: Incoming vs outgoing transfers, unique counterparties, top transfers by value
- **Counterparty Network**: Who does this wallet interact with? Repeated senders?
- **Money Mule Detection**: High throughput + rapid turnover + low retention = mule risk
- **Behavioral Patterns**: Transaction frequency, regularity, counterparty diversity

Risk Signals MUST use P2P-specific markers:
- [+] Long wallet history with consistent counterparties
- [!] Rapid fund turnover or high volume with low retention
- [-] Money mule indicators detected

DO NOT produce a generic "wallet overview" analysis. This MUST read as a counterparty risk assessment for P2P trading.`,
  };

  const modeInstruction = mode && modeFocus[mode] ? modeFocus[mode] : "";

  const messages = [
    { role: "system" as const, content: AGENT_SYSTEM_PROMPT + modeInstruction },
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
