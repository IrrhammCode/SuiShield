# SuiShield — Check Before You Approve

> AI-powered trust analysis for every Sui interaction. Paste any address. Get a verdict. Share the proof.

**Built for the [Tatum x Walrus Hackathon](https://tatum.io/tatum-x-walrus-hackathon)**

---

## What is SuiShield?

SuiShield answers one question before you click: **"Am I safe to interact with this address?"**

- Paste any Sui address (wallet, contract, token, NFT)
- AI analyzes real-time data from Tatum RPC + 11TB historical data from Walrus
- Get a trust score (0-100) with clear verdict: SAFE / LOW RISK / MEDIUM RISK / HIGH RISK
- Every analysis stored on Walrus — immutable, shareable, verifiable
- Monitor addresses for suspicious activity via Tatum webhooks

## Key Features

### Trust Analysis
- **Multi-mode analysis**: DeFi, NFT, P2P, General
- **6-signal scoring**: On-chain activity, wallet maturity, balance health, community trust, protocol quality, MCP security
- **Tatum MCP integration**: Malicious address check, exchange rates, wallet portfolio
- **Behavioral pattern detection**: Wash trading, mixer patterns, rapid drain, circular flows

### Trust Graph
- **Fund flow visualization**: Trace money movement across addresses
- **Suspicious pattern detection**: Mixer, funnel, circular, rapid drain patterns
- **Interactive graph**: Visual nodes and edges with risk coloring

### On-Chain Proof
- **Walrus storage**: Every analysis stored as immutable blob
- **Verification page**: Anyone can verify proofs by blob ID
- **Shareable links**: Share analysis proofs with anyone

### Address Monitor
- **Tatum webhooks**: Real-time alerts for monitored addresses
- **Score updates**: Trust scores update when activity detected
- **Community reports**: Submit and verify scam reports

### Transaction Simulation
- **Preview before approve**: See what would happen before sending
- **Risk assessment**: Warnings for suspicious receivers
- **Balance impact**: Show exact balance changes

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4 |
| **AI Engine** | Groq (Llama 3.3 70B Versatile) |
| **Blockchain RPC** | Tatum Sui RPC Gateway |
| **MCP Tools** | Tatum MCP Server (59 tools) |
| **Smart Contract** | Sui Move (trust_layer module) |
| **Storage** | Walrus (decentralized blob storage) |
| **Webhooks** | Tatum Subscriptions API |

## Architecture

```
User → Paste Address
         ↓
   ┌─────┴──────────────┐
   │ Tatum Sui RPC      │ ← Real-time: balance, objects, transactions
   └─────┬──────────────┘
         ↓
   ┌─────┴──────────────┐
   │ Tatum MCP Tools    │ ← Malicious check, exchange rate, portfolio
   └─────┬──────────────┘
         ↓
   ┌─────┴──────────────┐
   │ AI Agent (Groq)    │ ← Multi-step reasoning with tool-calling
   └─────┬──────────────┘
         ↓
   ┌─────┴──────────────┐
   │ Fund Flow Analyzer │ ← Trace money movement, detect patterns
   └─────┬──────────────┘
         ↓
   ┌─────┴──────────────┐
   │ Walrus Storage     │ ← Store proof permanently
   └─────┬──────────────┘
         ↓
   ┌─────┴──────────────┐
   │ Tatum Webhooks     │ ← Monitor, alert on activity
   └────────────────────┘
```

## Getting Started

```bash
# Clone
git clone https://github.com/IrrhammCode/SuiShield.git
cd SuiShield

# Install
npm install

# Environment
cp .env.example .env.local
# Add: TATUM_API_KEY, GROQ_API_KEY

# Run
npm run dev
```

## Routes (21)

| Route | Type | Description |
|-------|------|-------------|
| `/` | Page | Landing page |
| `/dashboard` | Page | AI chat + sidebar navigation |
| `/analyze` | Page | Address trust analysis |
| `/trust-graph` | Page | Fund flow visualization |
| `/monitor` | Page | Address monitoring |
| `/explore` | Page | Dataset explorer |
| `/verify` | Page | Proof verification |
| `/verify/[blobId]` | Page | Direct proof lookup |
| `/api/analyze` | API | Analysis endpoint |
| `/api/chat` | API | Chat endpoint |
| `/api/fund-flow` | API | Fund flow analysis |
| `/api/community` | API | Scam reports |
| `/api/simulate` | API | Transaction simulation |
| `/api/webhooks` | API | Webhook management |
| `/api/health` | API | Health check |
| `/api/price` | API | Price data |
| `/api/verify` | API | Verification |
| `/api/wallet` | API | Wallet data |

## Judging Criteria Alignment

### Walrus and Tatum Integration (30%)
- Tatum Sui RPC — all blockchain data
- Tatum MCP — 59 tools for AI agent
- Tatum Data APIs — price, exchange rates
- Tatum Webhooks — real-time monitoring
- Walrus Storage — immutable proof storage
- Walrus Datasets — 11TB historical data

### Technical Quality (30%)
- Clean architecture — Next.js App Router, TypeScript
- Error handling — retry logic, timeouts, validation
- AI agent — multi-step tool execution with reasoning
- Smart contract — Sui Move trust layer

### Creativity (20%)
- "Check Before You Approve" — unique concept
- Trust Graph — fund flow visualization
- Behavioral pattern detection
- Community scam reports
- Transaction simulation

### Presentation (20%)
- Premium dark UI
- Working demo
- Comprehensive documentation

## License

MIT

---

**Built with Tatum + Walrus + Sui + Groq**
