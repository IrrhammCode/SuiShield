<div align="center">

# ⛓️ Tatum Integration Skill

**One command. Any framework. Full blockchain API access.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Endpoints](https://img.shields.io/badge/API_Endpoints-126-blue)](reference/data-api-complete.md)
[![Chains](https://img.shields.io/badge/Blockchains-60+-purple)](#-supported-networks)
[![Frameworks](https://img.shields.io/badge/Frameworks-18+-green)](#-supported-stacks)

A skill for AI coding agents that automatically integrates the **Tatum blockchain API** into any project.
Detects your framework, writes code, installs dependencies, and configures everything.

</div>

---

## 🚀 Quick Start

```bash
npx skills add https://github.com/tatumio/tatum-integration-skill --skill tatum
```

Then just tell it what you need:

```bash
/tatum add balance checking for Ethereum
/tatum add webhook for Bitcoin transactions
/tatum add NFT balance checking
/tatum add crypto price tracking
```

---

## ✨ What It Does

| | Feature | Description |
|---|---------|-------------|
| 🔍 | **Auto-Detection** | Detects your framework: Express, FastAPI, Spring Boot, Django, Laravel, and more |
| 🏗️ | **Code Generation** | Creates service files, controllers, and routes following your project conventions |
| 📦 | **Dependency Management** | Installs packages automatically (`npm install`, `pip install`, etc.) |
| 🔐 | **Environment Config** | Configures `.env` with your Tatum API key |
| 🆕 | **Latest APIs** | Uses v4 endpoints (latest, non-deprecated) |
| 🔗 | **MCP-Enhanced** | Validates API params & responses via live MCP calls when [Tatum MCP](https://tatum.io/mcp) is installed |

---

## 🛠️ Supported Stacks

| Language | Frameworks |
|:---------|:-----------|
| **JavaScript / TypeScript** | Express · NestJS · Fastify · Koa |
| **Python** | FastAPI · Django · Flask |
| **Java** | Spring Boot · Quarkus · Micronaut |
| **PHP** | Laravel · Symfony · Slim |
| **Go** | Gin · Echo · Chi |
| **Ruby** | Rails · Sinatra |

---

## 📡 API Coverage

| Category | Examples |
|:---------|:---------|
| **V4 Data API** | Wallets, transactions, tokens, NFTs, DeFi, staking, exchange rates |
| **V4 Notifications** | Webhook subscriptions, templates, filtering, HMAC verification |
| **V3 Chain-Specific** | TRON · XLM · XRP · ADA · Algorand |

### 🌐 Supported Networks

> **60+ blockchain networks** including Ethereum, Bitcoin, Polygon, Solana, Arbitrum, Base, and more.

---

## 🔗 MCP Integration (Optional)

If you have the [Tatum MCP server](https://tatum.io/mcp) installed, this skill automatically detects it and uses **live API calls** to validate request parameters and response structures before generating code resulting in more accurate integrations.

**Don't have it?** No problem, the skill works without it using built-in reference docs. But if you want the enhanced experience:

```bash
npm install -g @tatumio/blockchain-mcp
```

Then add to your MCP config (`.claude/mcp.json`, `.cursor/mcp.json`, etc.):

```json
{
  "mcpServers": {
    "tatumio": {
      "command": "npx",
      "args": ["@tatumio/blockchain-mcp"],
      "env": {
        "TATUM_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

---

## 📚 Documentation

| Resource | Description |
|:---------|:------------|
| [📘 Skill.md](Skill.md) | Complete integration workflow |
| [📋 API Parameters](reference/api-parameters.md) | Request parameters for all endpoints |
| [📤 API Responses](reference/api-responses.md) | Response schemas for all endpoints |
| [📖 Data API Reference](reference/data-api-complete.md) | Full API reference |
| [💡 Framework Examples](reference/frameworks/) | Express, FastAPI, Spring Boot, Django, Laravel |

---

## 🤝 Support

- 🐛 [GitHub Issues](https://github.com/tatumio/tatum-integration-skill/issues) : Report bugs or request features
- 📖 [Tatum Docs](https://docs.tatum.io) : Official API documentation

---

<div align="center">

**MIT License** · Built with ❤️ by [Tatum](https://tatum.io)

</div>
