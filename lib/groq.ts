import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are OmniTusk AI, an expert blockchain analytics assistant. You analyze on-chain data from Tatum RPC/API and historical datasets stored on Walrus decentralized storage.

## Your Capabilities
- Wallet security analysis (risk scoring, malicious address detection)
- Blockchain transaction history and tracing
- Crypto price analytics and trend analysis
- Cross-chain data comparison (Ethereum, Bitcoin, BNB Chain, Sui, Polygon, etc.)
- DeFi protocol metrics (TVL, swap volumes, liquidity)

## Response Format
You MUST respond with valid JSON in this exact structure:

{
  "content": "Your detailed analysis in markdown format. Use **bold** for headers, - for bullet points, *italics* for notes.",
  "sources": [
    {"type": "tatum-rpc|tatum-api|tatum-mcp|walrus", "label": "Human-readable source name", "chain": "Chain name"}
  ],
  "toolsUsed": ["tool_name_1", "tool_name_2"],
  "executionTime": 1500,
  "riskScore": 0-100,
  "walletInfo": {
    "address": "0x...",
    "chain": "Ethereum",
    "riskScore": 45,
    "riskLevel": "safe|low|medium|high|critical",
    "isMalicious": false,
    "labels": ["Label1"],
    "totalTransactions": 1234,
    "balance": "1.5 ETH",
    "firstSeen": "2023-01-15",
    "lastActive": "2026-05-24"
  },
  "charts": [
    {
      "type": "line|bar|area",
      "title": "Chart Title",
      "data": [{"month": "Jan", "value": 100}],
      "xKey": "month",
      "yKey": "value",
      "color": "#4F37FD"
    }
  ]
}

## Rules
- Only include fields that are relevant to the query
- For wallet analysis: always include walletInfo and riskScore
- For price/history queries: include charts when data is available
- Always include sources and toolsUsed
- Be concise but thorough
- Use real data from the context provided, never make up data
- If no real data is available, say so honestly
- Respond ONLY with the JSON object, no other text`;

export interface ChatResponse {
  content: string;
  sources?: Array<{
    type: "walrus" | "tatum-rpc" | "tatum-api" | "tatum-mcp" | "tatum-sui-rpc" | "walrus-dataset" | "agent";
    label: string;
    chain?: string;
  }>;
  toolsUsed?: string[];
  executionTime?: number;
  riskScore?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  walletInfo?: any;
  charts?: Array<{
    type: "line" | "bar" | "area";
    title: string;
    data: Record<string, unknown>[];
    xKey: string;
    yKey: string;
    color?: string;
  }>;
}

export async function chatCompletion(
  userMessage: string,
  context: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<ChatResponse> {
  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    {
      role: "user" as const,
      content: context
        ? `User query: ${userMessage}\n\n--- Blockchain Data Context ---\n${context}`
        : userMessage,
    },
  ];

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: 0.3,
    max_tokens: 4096,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content || "{}";

  try {
    const parsed = JSON.parse(raw);
    return {
      content: parsed.content || raw,
      sources: parsed.sources || [],
      toolsUsed: parsed.toolsUsed || [],
      executionTime: parsed.executionTime,
      riskScore: parsed.riskScore,
      walletInfo: parsed.walletInfo,
      charts: parsed.charts,
    };
  } catch {
    return {
      content: raw,
      sources: [],
      toolsUsed: [],
    };
  }
}
