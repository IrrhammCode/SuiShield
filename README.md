<p align="center">
  <img src="public/logo.png" alt="SuiShield Logo" width="150" />
</p>

# 🛡️ SuiShield — AI-Powered Trust Analysis for Sui

> **Check Before You Approve. Paste any Sui address. Get a verdict. Share the proof.**

[![Sui Blockchain](https://img.shields.io/badge/Blockchain-Sui-4DA2FF?style=for-the-badge&logo=sui&logoColor=white)](https://sui.io/)
[![AI Powered](https://img.shields.io/badge/AI-Trust%20Analysis-purple?style=for-the-badge&logo=openai)](https://github.com/IrrhammCode/SuiShield)
[![Web3 Security](https://img.shields.io/badge/Web3-Security%20Protocol-black?style=for-the-badge)](https://github.com/IrrhammCode/SuiShield)
[![Hackathon: Tatum x Walrus](https://img.shields.io/badge/Hackathon-Tatum_x_Walrus-blue?style=for-the-badge)](https://tatum.io/tatum-x-walrus-hackathon)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

<p align="center">
  <img src="public/og-image.png" width="900">
</p>

---

## ⏱️ How SuiShield Works in 10 Seconds

SuiShield distills complex blockchain trust analysis into a simple 5-step flow:

1. **User pastes any Sui address** (wallet, contract, token, NFT).
2. ↓ **AI Agent analyzes** real-time data via Tatum Sui RPC.
3. ↓ **Historical data fetched** from 11TB Walrus decentralized storage.
4. ↓ **Trust score calculated** using 6-signal multi-factor scoring.
5. ↓ **Proof stored on Walrus** — immutable, shareable, verifiable.

---

## ⚡ Quick Start

Get SuiShield running locally in under 60 seconds:

```bash
# 1. Clone the repository
git clone https://github.com/IrrhammCode/SuiShield.git
cd SuiShield

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys:
# - GROQ_API_KEY (for AI agent)
# - TATUM_API_KEY (for Sui RPC + data APIs)

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌍 Project Overview

**What is SuiShield?**
SuiShield is an AI-powered trust analysis system for the Sui blockchain. It combines real-time on-chain data from Tatum RPC with 11TB of historical blockchain data stored on Walrus decentralized storage to answer one critical question: "Am I safe to interact with this address?"

**Why does it exist?**
The Sui ecosystem is growing rapidly, but users have no way to verify the trustworthiness of wallets, contracts, or tokens before interacting. SuiShield bridges this gap by providing instant, AI-powered trust analysis with cryptographic proof.

**Who is it for?**
For DeFi users, NFT collectors, developers, and anyone interacting with the Sui blockchain who wants to verify the safety of an address before transacting.

**How does it improve blockchain security?**
It combines multiple data sources (Tatum RPC, Walrus historical data, Tatum MCP) with AI reasoning to provide comprehensive trust analysis. Every analysis is stored on Walrus for transparency and verifiability.

---

## 📂 Repository Structure & Component Documentation

SuiShield is highly modularized for maximum security and maintainability:

| Component | Directory | Description |
|-----------|-----------|-------------|
| **Frontend** | [`/app`](./app) | Next.js 16 App Router with premium glass-morphism UI |
| **AI Agent** | [`/lib/agent`](./lib/agent) | Groq-powered AI agent with Tatum MCP integration |
| **Smart Contracts** | [`/move`](./move) | Sui Move trust layer for on-chain verification |
| **Components** | [`/components`](./components) | Reusable React components (TrustScore, RiskSignal, etc.) |
| **API Routes** | [`/app/api`](./app/api) | Next.js API routes for analysis, chat, webhooks |
| **Context** | [`/context`](./context) | React context for wallet authentication |
| **Types** | [`/types`](./types) | TypeScript type definitions |

---

## 🚨 Problem Statement

The Sui blockchain ecosystem faces critical trust and security challenges:

- **No Pre-Transaction Verification:** Users interact with addresses without knowing if they're safe, leading to scams and rug pulls.
- **Opaque Wallet History:** Wallet age, transaction patterns, and protocol interactions are invisible to average users.
- **No Immutable Proof:** Analysis results are ephemeral — there's no way to share or verify past analyses.
- **Fragmented Data Sources:** On-chain data, historical records, and security signals exist in separate silos.
- **Manual Due Diligence:** Checking an address requires navigating multiple explorers and tools manually.

---

## 💡 Solution

SuiShield completely reimagines blockchain trust analysis by combining AI intelligence with decentralized verification:

- **AI-Powered Analysis:** Groq LLM agent analyzes addresses using 6-signal multi-factor scoring.
- **Tatum RPC Integration:** Real-time Sui blockchain data via Tatum's enterprise-grade RPC infrastructure.
- **Walrus Historical Data:** 11TB of historical blockchain data (BTC, ETH, BNB, Sui) stored on Walrus decentralized storage.
- **On-Chain Proof Storage:** Every analysis stored as immutable Walrus blob — verifiable by anyone.
- **Sui Move Trust Layer:** On-chain smart contract for community-driven scam reporting and verification.
- **Real-Time Monitoring:** Tatum webhooks for address activity alerts and suspicious transaction detection.

---

## 💎 Key Features

### 🔍 Trust Analysis
- **Multi-mode analysis**: DeFi, NFT, P2P, General — each with specialized focus
- **6-signal scoring**: On-chain activity, wallet maturity, balance health, community trust, protocol quality, MCP security
- **Tatum MCP integration**: Malicious address check, exchange rates, wallet portfolio
- **Behavioral pattern detection**: Wash trading, mixer patterns, rapid drain, circular flows

### 📊 Trust Graph
- **Fund flow visualization**: Trace money movement across addresses
- **Suspicious pattern detection**: Mixer, funnel, circular, rapid drain patterns
- **Interactive graph**: Visual nodes and edges with risk coloring

### 🔐 On-Chain Proof
- **Walrus storage**: Every analysis stored as immutable blob
- **Verification page**: Anyone can verify proofs by blob ID
- **Shareable links**: Share analysis proofs with anyone

### 📍 Address Monitor
- **Real-time activity tracking**: Check addresses for new transactions via Tatum RPC
- **Activity feed**: View transaction history with amounts and directions
- **Batch monitoring**: Monitor multiple addresses simultaneously

### 💬 Chat with Data
- **AI-powered queries**: Ask questions about blockchain data in natural language
- **Dataset context**: Chat directly about specific Walrus datasets
- **Quick actions**: Pre-built queries for common analysis patterns

### 📦 Dataset Explorer
- **11TB verified data**: Bitcoin, Ethereum, BNB Chain, Sui historical data
- **Walrus storage**: Every dataset cryptographically pinned to Sui
- **HTTP access**: Fetch any dataset via Walrus Aggregator

---

## ⚡ Tatum Integration — Deep Dive

SuiShield leverages Tatum's infrastructure at **every layer** of the analysis pipeline. This section details exactly how we use Tatum's RPC endpoints, Data APIs, and MCP server to power our trust analysis engine.

### 🔌 Tatum Sui RPC — Real-Time Blockchain Data

We use Tatum's enterprise-grade Sui RPC gateway for all real-time blockchain queries. Every address analysis starts with direct JSON-RPC calls via Tatum.

| RPC Method | Purpose | Code Location |
|------------|---------|---------------|
| `suix_getAllBalances` | Fetch all token balances (SUI + fungible tokens) | [`lib/tatum-sui.ts#L80`](./lib/tatum-sui.ts#L80) |
| `suix_getBalance` | Get specific coin balance (e.g., SUI only) | [`lib/tatum-sui.ts#L93`](./lib/tatum-sui.ts#L93) |
| `suix_getOwnedObjects` | List all owned objects (NFTs, contracts, LP tokens) | [`lib/tatum-sui.ts#L103`](./lib/tatum-sui.ts#L103) |
| `suix_queryTransactionBlocks` | Query transaction history with filters | [`lib/tatum-sui.ts#L120`](./lib/tatum-sui.ts#L120) |
| `sui_getTransactionBlock` | Fetch specific transaction details | [`lib/tatum-sui.ts#L145`](./lib/tatum-sui.ts#L145) |
| `sui_getLatestCheckpointSequenceNumber` | Get latest checkpoint for network status | [`lib/tatum-sui.ts#L155`](./lib/tatum-sui.ts#L155) |
| `sui_getProtocolConfig` | Fetch Sui protocol configuration | [`lib/tatum-sui.ts#L165`](./lib/tatum-sui.ts#L165) |
| `suix_resolveNameServiceAddress` | Resolve Sui Name Service (e.g., name.sui) | [`lib/tatum-sui.ts#L172`](./lib/tatum-sui.ts#L172) |
| `suix_getStakes` | Get staking positions for an address | [`lib/tatum-sui.ts#L230`](./lib/tatum-sui.ts#L230) |
| `suix_getDynamicFields` | Get dynamic fields of an object | [`lib/tatum-sui.ts#L250`](./lib/tatum-sui.ts#L250) |

**Example — Fetching Balance via Tatum Sui RPC:**

```typescript
// lib/tatum-sui.ts
const TATUM_SUI_MAINNET = "https://sui-mainnet.gateway.tatum.io";
const TATUM_API_KEY = process.env.TATUM_API_KEY;

async function suiRpc<T>(method: string, params: unknown[]): Promise<T> {
  const response = await fetch(TATUM_SUI_MAINNET, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": TATUM_API_KEY,
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  return (await response.json()).result;
}

// Usage
const balances = await suiRpc("suix_getAllBalances", [address]);
```

### 🛡️ Tatum MCP — 59 Blockchain Tools

SuiShield's AI agent has direct access to Tatum's MCP (Model Context Protocol) server, which provides 59 specialized blockchain analysis tools. We call these APIs directly for deep analysis.

| MCP Tool | Purpose | Code Location |
|----------|---------|---------------|
| `check_malicious_address` | Security check — is address flagged as malicious? | [`lib/tatum-mcp.ts#L50`](./lib/tatum-mcp.ts#L50) |
| `get_wallet_portfolio` | Full portfolio: native + tokens + NFTs | [`lib/tatum-mcp.ts#L90`](./lib/tatum-mcp.ts#L90) |
| `get_transaction_history` | Transaction history across chains | [`lib/tatum-mcp.ts#L170`](./lib/tatum-mcp.ts#L170) |
| `get_exchange_rate` | Real-time crypto/fiat exchange rates | [`lib/tatum-mcp.ts#L220`](./lib/tatum-mcp.ts#L220) |
| `get_block_by_time` | Block info for specific timestamp | [`lib/tatum-mcp.ts#L260`](./lib/tatum-mcp.ts#L260) |
| `gateway_execute_rpc` | Execute any JSON-RPC method on any chain | [`lib/tatum-mcp.ts#L300`](./lib/tatum-mcp.ts#L300) |
| `get_tokens` | Token metadata (name, symbol, decimals) | [`lib/tatum-mcp.ts#L320`](./lib/tatum-mcp.ts#L320) |
| `get_metadata` | NFT/multitoken metadata | [`lib/tatum-mcp.ts#L370`](./lib/tatum-mcp.ts#L370) |

**Example — Malicious Address Check:**

```typescript
// lib/tatum-mcp.ts
export async function mcpCheckMaliciousAddress(
  address: string,
  chain: TatumChain = "sui-testnet"
): Promise<MaliciousCheckResult> {
  const data = await tatumFetch(
    `/v3/security/address/${address}?chain=${chain}`
  );
  return {
    address,
    chain,
    isMalicious: data.isMalicious || false,
    category: data.category,
    riskScore: data.isMalicious ? 85 : 15,
  };
}
```

### 🤖 Tatum in AI Agent Pipeline

The AI agent orchestrates Tatum tools in a specific order for comprehensive analysis:

```typescript
// lib/agent/sui-tools.ts — toolAnalyzeSuiWallet()

// Step 1: Tatum Sui RPC — Get base data
const [balance, objects, txs, fundFlow] = await Promise.all([
  toolGetSuiBalance(address),      // suix_getAllBalances
  toolGetSuiObjects(address),      // suix_getOwnedObjects
  toolGetSuiTransactions(address), // suix_queryTransactionBlocks
  toolGetSuiFundFlow(address),     // Custom fund flow analysis
]);

// Step 2: Tatum MCP — Security check
const maliciousCheck = await mcpCheckMaliciousAddress(address);
// Signal 6: Tatum MCP Security Check (0-100)
if (maliciousCheck.isMalicious) {
  riskScore += 40;
  riskFactors.push(`Tatum MCP flagged: ${maliciousCheck.category}`);
}

// Step 3: Tatum Data API — Exchange rates
const price = await mcpGetExchangeRate("SUI", "USD");
const usdValue = (Number(balance) / 1e9) * price.rate;
```

### 📊 Tatum Data APIs — Cross-Chain Intelligence

For cross-chain analysis and historical data, we use Tatum's Data APIs:

| API Endpoint | Purpose | Usage |
|-------------|---------|-------|
| `/v3/data/wallet/portfolio/{address}` | Wallet portfolio across chains | Multi-chain wallet analysis |
| `/v3/data/transactions/address/{address}` | Transaction history | Pattern detection |
| `/v3/data/tokens/{contract}` | Token metadata | Token risk assessment |
| `/v4/data/rate/symbol` | Exchange rates | USD value calculation |
| `/v3/security/address/{address}` | Malicious address check | Security signal |
| `/v3/{chain}/block/current` | Current block info | Network status |

### 🔗 Tatum Webhook Integration

For real-time address monitoring, we integrate Tatum webhooks:

```typescript
// lib/tatum-webhooks.ts
export async function createWebhookSubscription(
  address: string,
  chain: string,
  eventType: WebhookEventType,
  callbackUrl: string
): Promise<WebhookSubscription> {
  const data = await tatumFetch("/v3/subscription", {
    method: "POST",
    body: JSON.stringify({
      chain: chain.toUpperCase(),
      address,
      type: eventType,
      url: callbackUrl,
    }),
  });
  return { id: data.id, chain, address, eventType, url: callbackUrl, active: true };
}
```

**Supported Webhook Events:**
- `ADDRESS_TRANSACTION` — Any transaction on address
- `ADDRESS_FUNDS_RECEIVED` — Funds received
- `ADDRESS_FUNDS_SENT` — Funds sent
- `NFT_RECEIVED` — NFT received
- `TOKEN_TRANSFER` — Token transfer

### 📈 Tatum Usage Summary

| Category | Tools/APIs Used | Count |
|----------|----------------|-------|
| **Sui RPC Methods** | suix_getAllBalances, suix_getOwnedObjects, suix_queryTransactionBlocks, etc. | 10 |
| **MCP Tools** | check_malicious_address, get_wallet_portfolio, get_exchange_rate, etc. | 8 |
| **Data APIs** | Portfolio, Transactions, Tokens, Rates, Security | 6 |
| **Webhook Events** | ADDRESS_TRANSACTION, FUNDS_RECEIVED, FUNDS_SENT, etc. | 5 |
| **Total Tatum Integrations** | | **29** |

### 🎯 Why Tatum?

- **Enterprise-Grade Reliability**: 99.9% uptime SLA for production applications
- **Multi-Chain Support**: Single API for Sui, Ethereum, Bitcoin, Polygon, and 40+ chains
- **MCP Server**: 59 specialized blockchain tools accessible via standard protocol
- **Real-Time Data**: Sub-second latency for balance and transaction queries
- **Security Built-In**: Malicious address detection and fraud scoring
- **Developer-Friendly**: Clean REST APIs with comprehensive documentation

---

## 🏆 Hackathon Challenge Response: Tatum x Walrus

SuiShield is engineered from the ground up to win the **Tatum x Walrus Hackathon**. We leverage both Tatum's enterprise infrastructure and Walrus decentralized storage to create a comprehensive trust analysis system.

Here is exactly how we answer the challenge (**5W1H**):

- **What:** An AI-powered trust analysis system that combines real-time Tatum RPC data with 11TB of historical Walrus data to provide instant, verifiable trust scores for any Sui address.
- **Why:** To solve the trust deficit in the Sui ecosystem. Users need to know if an address is safe before interacting, preventing scams and rug pulls.
- **Who:** Built for DeFi users, NFT collectors, developers, and anyone interacting with the Sui blockchain.
- **Where:** Operating at the intersection of Tatum's enterprise RPC infrastructure and Walrus decentralized storage, with AI reasoning powered by Groq.
- **When:** Analysis happens in real-time — paste an address and get a verdict in seconds.
- **How:** By programmatically combining Tatum Sui RPC for real-time data, Walrus for historical analysis and proof storage, and Groq AI for intelligent pattern recognition and trust scoring.

<details>
<summary><b>🔎 Proof of Implementation (Tatum + Walrus Integration)</b></summary>

*   **Tatum Sui RPC Integration:** [`lib/tatum-sui.ts`](./lib/tatum-sui.ts) — Direct JSON-RPC calls via Tatum infrastructure for balance, transactions, objects.
*   **Tatum MCP Agent:** [`lib/agent/sui-tools.ts`](./lib/agent/sui-tools.ts) — AI agent tools using Tatum's 59 specialized blockchain tools.
*   **Walrus Dataset Storage:** [`lib/walrus.ts`](./lib/walrus.ts) — 11TB of historical blockchain data stored on Walrus.
*   **On-Chain Proof Storage:** [`app/api/verify/route.ts`](./app/api/verify/route.ts) — Analysis proofs stored as Walrus blobs.
*   **Sui Move Trust Layer:** [`move/sources/trust_layer.move`](./move/sources/trust_layer.move) — On-chain trust registry and scam reporting.

</details>

---

## 🎨 Screenshots

### 1. Trust Analysis Dashboard
*Real-time AI-powered trust analysis with 6-signal scoring and clear verdict.*
![Trust Analysis](public/og-image.png)

### 2. Chat with Data
*Natural language queries about blockchain data powered by AI.*
![Chat Interface](public/og-image.png)

### 3. Trust Graph Visualization
*Interactive fund flow visualization with suspicious pattern detection.*
![Trust Graph](public/og-image.png)

---

## 🏗️ Architecture Diagram

![SuiShield Architecture](public/og-image.png)

```text
    [USER]
      │ (Pastes Address)
      ▼
 ┌─────────────────────────┐
 │   SuiShield Frontend    │
 │   (Next.js 16 + React)  │
 └─────────────────────────┘
           │
           ▼
 ┌─────────────────────────┐
 │   API Routes            │
 │   (Next.js Server)      │
 └─────────────────────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐  ┌─────────────┐
│ Groq AI │  │ Tatum Sui   │
│ Agent   │  │ RPC         │
└─────────┘  └─────────────┘
     │           │
     ▼           ▼
┌─────────┐  ┌─────────────┐
│ Tatum   │  │ Walrus      │
│ MCP     │  │ Storage     │
│ (59     │  │ (11TB       │
│ tools)  │  │ Historical) │
└─────────┘  └─────────────┘
     │           │
     └─────┬─────┘
           ▼
 ┌─────────────────────────┐
 │   Trust Score Engine    │
 │   (6-Signal Scoring)    │
 └─────────────────────────┘
           │
           ▼
 ┌─────────────────────────┐
 │   Walrus Proof Storage  │
 │   (Immutable Blobs)     │
 └─────────────────────────┘
           │
           ▼
 ┌─────────────────────────┐
 │   Sui Move Contract     │
 │   (On-Chain Registry)   │
 └─────────────────────────┘
```

**Architecture Breakdown:**
1. **User:** Pastes any Sui address into the frontend.
2. **API Routes:** Next.js server handles the analysis request.
3. **Groq AI Agent:** LLM-powered agent orchestrates data collection and analysis.
4. **Tatum Sui RPC:** Real-time blockchain data (balance, transactions, objects).
5. **Tatum MCP:** 59 specialized blockchain tools for deep analysis.
6. **Walrus Storage:** 11TB historical data + analysis proof storage.
7. **Trust Score Engine:** 6-signal multi-factor scoring algorithm.
8. **Sui Move Contract:** On-chain trust registry for community verification.

---

## ⚙️ Analysis Execution Flow

Here is the step-by-step lifecycle of a trust analysis:

1. **Address Input:** User pastes a Sui address (wallet, contract, token, NFT).
2. **Intent Detection:** AI agent detects analysis mode (DeFi, NFT, P2P, General).
3. **Data Collection:** Tatum Sui RPC fetches balance, objects, transactions, fund flow.
4. **Protocol Analysis:** Check interactions with verified protocols (Cetus, Scallop, Turbos, etc.).
5. **Historical Context:** Walrus provides historical patterns and cross-chain data.
6. **Signal Scoring:** 6 signals calculated (0-100 each): activity, maturity, balance, trust, protocol, security.
7. **Risk Classification:** Score mapped to risk level (SAFE/LOW/MEDIUM/HIGH/CRITICAL).
8. **Proof Storage:** Analysis stored as immutable Walrus blob with verification URL.
9. **Result Delivery:** Trust score, signals, and proof presented to user.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|------|------------|--------|
| Blockchain | **Sui** | High-throughput L1 for smart contracts and settlement |
| Smart Contracts | **Sui Move** | On-chain trust registry and scam reporting |
| RPC Infrastructure | **Tatum Sui RPC** | Enterprise-grade real-time blockchain data |
| AI Engine | **Groq + Llama 3.3** | Fast inference for AI-powered analysis |
| MCP Tools | **Tatum MCP** | 59 specialized blockchain analysis tools |
| Historical Data | **Walrus** | 11TB decentralized storage for blockchain history |
| Proof Storage | **Walrus Blobs** | Immutable, verifiable analysis proofs |
| Frontend | **Next.js 16** | React App Router with premium glass-morphism UI |
| Styling | **Tailwind CSS** | Utility-first CSS with custom design system |
| Wallet | **Sui Wallet Kit** | Sui wallet connection and authentication |

### 🔍 Key Source Code Files

- **Tatum Sui RPC:** [`lib/tatum-sui.ts`](./lib/tatum-sui.ts) — Direct JSON-RPC calls via Tatum infrastructure
- **Tatum MCP Agent:** [`lib/agent/sui-tools.ts`](./lib/agent/sui-tools.ts) — AI agent with 59 blockchain tools
- **Walrus Integration:** [`lib/walrus.ts`](./lib/walrus.ts) — 11TB dataset access and blob storage
- **Trust Score Engine:** [`lib/agent/agent.ts`](./lib/agent/agent.ts) — 6-signal multi-factor scoring
- **Sui Move Contract:** [`move/sources/trust_layer.move`](./move/sources/trust_layer.move) — On-chain trust registry
- **Trust Graph:** [`lib/fund-flow.ts`](./lib/fund-flow.ts) — Fund flow visualization and pattern detection

---

## 📁 Project Structure

```
SuiShield/
├── app/                    # Next.js 16 App Router
│   ├── (dashboard)/        # Dashboard pages
│   │   ├── analyze/        # Trust analysis page
│   │   ├── chat/           # AI chat interface
│   │   ├── dashboard/      # Main dashboard
│   │   ├── explore/        # Dataset explorer
│   │   ├── monitor/        # Address monitoring
│   │   ├── trust-graph/    # Fund flow visualization
│   │   └── verify/         # Proof verification
│   └── api/                # API routes
│       ├── analyze/        # Trust analysis API
│       ├── chat/           # AI chat API
│       ├── webhooks/       # Tatum webhook handlers
│       └── verify/         # Proof verification API
├── components/             # React components
│   ├── SuiShield/          # SuiShield-specific components
│   └── ui/                 # UI primitives
├── lib/                    # Core libraries
│   ├── agent/              # AI agent logic
│   │   ├── agent.ts        # Main agent orchestration
│   │   ├── sui-tools.ts    # Tatum MCP tools
│   │   └── tools.ts        # General blockchain tools
│   ├── tatum-sui.ts        # Tatum Sui RPC client
│   ├── tatum-webhooks.ts   # Webhook management
│   ├── walrus.ts           # Walrus integration
│   └── fund-flow.ts        # Fund flow analysis
├── move/                   # Sui Move contracts
│   └── sources/
│       └── trust_layer.move
├── public/                 # Static assets
├── types/                  # TypeScript types
└── scripts/                # Utility scripts
```

---

## 🔧 Environment Variables

Create a `.env.local` file with the following:

```env
# Groq — AI Agent
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx

# Tatum — Sui RPC + Data APIs
TATUM_API_KEY=t-xxxxxxxxxxxxxxxx

# Sui Network (mainnet read-only, contract stays on testnet)
NEXT_PUBLIC_SUI_NETWORK=mainnet

# Sui Contract (deployed on testnet)
NEXT_PUBLIC_SUI_SHIELD_PACKAGE=0x1338586f8497a017f2356b38a5e99ce0177544694bfb580769815f43e61d596b
NEXT_PUBLIC_SUI_SHIELD_REGISTRY=0x9135f60b183d6e36e25da20cde7157b6b15f217bc4c1934796f006a5641542d
```

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Manual Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 🧪 Testing

```bash
# Run development server
npm run dev

# Test trust analysis
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"address": "0x742d35Cc6634C0532925a3b844Bc9e7595f2bC56"}'

# Test chat API
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Is this wallet safe? 0x742d35Cc..."}'
```

---

## 📊 API Reference

### Trust Analysis

```http
POST /api/analyze
Content-Type: application/json

{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f2bC56",
  "mode": "general"  // "defi" | "nft" | "p2p" | "general"
}
```

### Chat with Data

```http
POST /api/chat
Content-Type: application/json

{
  "message": "Analyze this wallet for DeFi safety",
  "history": [],
  "walletAddress": "0x742d35Cc..."
}
```

### Address Monitoring

```http
POST /api/webhooks
Content-Type: application/json

{
  "action": "monitor",
  "address": "0x742d35Cc...",
  "chain": "sui-testnet"
}
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Tatum](https://tatum.io/) — Enterprise-grade Sui RPC infrastructure
- [Walrus](https://wal.app/) — Decentralized storage for blockchain data
- [Sui](https://sui.io/) — High-performance L1 blockchain
- [Groq](https://groq.com/) — Fast AI inference for real-time analysis
- [Next.js](https://nextjs.org/) — The React framework for production

---

<p align="center">
  Built with ❤️ for the Tatum x Walrus Hackathon
</p>
