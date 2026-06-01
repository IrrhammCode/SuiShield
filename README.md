# 🛡️ SuiShield — Check Before You Approve

> AI-powered trust analysis for every Sui interaction. Paste any address. Get a verdict. Share the proof.

**Built for the [Tatum x Walrus Hackathon](https://tatum.io/tatum-x-walrus-hackathon)**

---

## What is SuiShield?

SuiShield is an AI-powered trust analysis platform for the Sui blockchain. It answers one question before you click: **"Am I safe to interact with this?"**

- 📋 **Paste any Sui address** — wallet, contract, token, or NFT collection
- 🤖 **AI analyzes everything** — balance, transactions, patterns, risk signals
- ⬡ **Proof stored on Walrus** — immutable, shareable, cryptographically verifiable
- ⚡ **Powered by Tatum** — enterprise-grade Sui RPC and Data APIs

## Key Features

### 🎯 Multi-Mode Analysis
- **DeFi Analysis** — TVL trends, yield sustainability, concentration risk, protocol health
- **NFT Analysis** — Creator track record, wash trading detection, floor price manipulation
- **P2P Counterparty Risk** — Wallet pedigree, money flow tracing, scam database cross-reference
- **General Trust Analysis** — Comprehensive wallet health check

### 🧠 AI Agent (Tool-Calling)
The AI agent autonomously selects and executes blockchain tools:
- `getSuiBalance` — Fetch all coin balances
- `getSuiObjects` — Analyze owned objects (NFTs, tokens, contracts)
- `getSuiTransactions` — Transaction pattern analysis
- `getSuiFundFlow` — Money flow tracing
- `checkSuiProtocols` — DeFi protocol interaction analysis
- `analyzeSuiWallet` — Full multi-signal trust scoring

### ⬡ Walrus Integration
- Every analysis stored as a **blob on Walrus** decentralized storage
- **Analysis Certificate NFTs** minted on Sui for each analysis
- **Shareable verification links** — anyone can verify the analysis
- **11TB+ historical datasets** available for cross-referencing

### ⚡ Tatum Integration
- **Tatum Sui RPC** — Real-time wallet data (balance, objects, transactions)
- **Tatum Data APIs** — Price feeds, address checking, exchange rates
- **Tatum MCP Server** — AI-optimized tool interface (optional)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4 |
| **AI Engine** | Groq (Llama 3.3 70B Versatile) |
| **Blockchain RPC** | Tatum Sui RPC Gateway |
| **Smart Contract** | Sui Move (trust_layer module) |
| **Storage** | Walrus (decentralized blob storage) |
| **Data APIs** | Tatum Data API |

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   User UI   │────▶│  Next.js API │────▶│  AI Agent   │
│  (Next.js)  │     │   Routes     │     │  (Groq LLM) │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                │
                    ┌───────────────────────────┼────────────────────┐
                    │                           │                    │
              ┌─────▼─────┐            ┌────────▼────────┐   ┌──────▼──────┐
              │  Tatum    │            │  Tool Functions  │   │   Walrus    │
              │  Sui RPC  │            │  (Balance, Tx,   │   │  Storage    │
              │  Gateway  │            │  Objects, Flow)  │   │  (Blobs)    │
              └───────────┘            └─────────────────┘   └─────────────┘
                                              │
                                       ┌──────▼──────┐
                                       │  Sui Move   │
                                       │  Contract   │
                                       │ (trust_layer)│
                                       └─────────────┘
```

## Getting Started

### Prerequisites
- Node.js 18+
- A [Tatum API key](https://dashboard.tatum.io) (free)
- A [Groq API key](https://console.groq.com) (free)

### Setup

```bash
# Clone the repository
git clone https://github.com/IrrhammCode/SuiShield.git
cd SuiShield

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your keys
# TATUM_API_KEY=your_key
# GROQ_API_KEY=your_key

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Deploy Smart Contract (Optional)

```bash
# Install Sui CLI
# https://docs.sui.io/guides/developer/getting-started/sui-install

# Deploy to testnet
cd move
sui client publish --gas-budget 100000000

# Update .env.local with the deployed package ID and registry object ID
```

## How It Works

1. **User pastes a Sui address** → frontend sends to `/api/analyze`
2. **AI Agent receives the request** → detects intent (DeFi, NFT, P2P, General)
3. **Agent executes tools** → fetches data from Tatum Sui RPC
4. **Multi-signal risk scoring** → calculates trust score (0-100)
5. **Stores proof on Walrus** → creates immutable analysis record
6. **Returns verdict** → frontend displays trust score + risk signals + on-chain proof

## Judging Criteria Alignment

### Walrus and Tatum Integration (30%)
- ✅ **Tatum Sui RPC** — All blockchain data fetched via Tatum gateway
- ✅ **Tatum Data APIs** — Price feeds, address checking
- ✅ **Walrus Storage** — Every analysis stored as a Walrus blob
- ✅ **Walrus Datasets** — 11TB+ historical data for cross-referencing
- ✅ **On-chain proof** — Shareable verification links

### Technical Quality (30%)
- ✅ **Clean architecture** — Next.js App Router, TypeScript, modular design
- ✅ **Smart contract** — Sui Move with trust scores, scam reports, verification
- ✅ **AI agent** — Multi-step tool execution with reasoning trace
- ✅ **Error handling** — Graceful fallbacks throughout

### Creativity (20%)
- ✅ **Unique concept** — "Check Before You Approve" — solves real problem
- ✅ **Multi-mode analysis** — DeFi, NFT, P2P, General
- ✅ **Community-driven** — Scam reports with verification system
- ✅ **NFT certificates** — Analysis proofs as Sui objects

### Presentation (20%)
- ✅ **Clean UI** — Premium dark theme, glass morphism
- ✅ **Working demo** — Live at [suishield.vercel.app](https://suishield.vercel.app)
- ✅ **Documentation** — This README + inline code comments

## Project Structure

```
SuiShield/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Landing page
│   ├── analyze/page.tsx    # Address analysis
│   ├── chat/page.tsx       # AI chat interface
│   ├── dashboard/page.tsx  # Wallet dashboard
│   ├── explore/page.tsx    # Dataset explorer
│   └── api/                # API routes
│       ├── analyze/        # Analysis endpoint
│       ├── chat/           # Chat endpoint
│       ├── price/          # Price endpoint
│       ├── verify/         # Verification endpoint
│       └── wallet/         # Wallet endpoint
├── components/             # React components
│   └── SuiShield/          # Domain-specific components
├── lib/                    # Core libraries
│   ├── tatum-sui.ts        # Tatum Sui RPC integration
│   ├── tatum-data.ts       # Tatum Data API integration
│   ├── tatum.ts            # Tatum SDK wrapper
│   ├── walrus.ts           # Walrus read integration
│   ├── walrus-write.ts     # Walrus write integration
│   ├── sui-contract.ts     # Sui Move contract interaction
│   ├── sui-protocols.ts    # DeFi protocol database
│   └── agent/              # AI agent
│       ├── agent.ts        # Main agent logic
│       ├── tools.ts        # EVM tools
│       ├── sui-tools.ts    # Sui-specific tools
│       ├── memory.ts       # Agent memory
│       └── store.ts        # Analysis store
├── move/                   # Sui Move smart contract
│   └── sources/
│       └── trust_layer.move
└── types/                  # TypeScript types
```

## License

MIT

---

**Built with ⚡ Tatum + ⬡ Walrus + ◎ Sui**

*Check Before You Approve*
