---
name: tatum
description: Automatically integrate Tatum blockchain API into developers' projects. Detects project structure and framework, writes actual code files, installs dependencies, and configures environment. Supports all languages (Python, JavaScript, Java, Go, PHP, etc.) and frameworks (Express, FastAPI, Spring Boot, Django, Laravel, etc.). Always uses v4 endpoints (never deprecated v3). Use when developers want to add blockchain functionality like balance checking, NFT queries, webhooks, or exchange rates to their application.
when_to_use: |
  - "Add Tatum to my app to check ETH balance"
  - "Integrate blockchain balance checking"
  - "Add webhook for Bitcoin transactions"
  - "Help me query NFT balances in my project"
  - "Add crypto price tracking to my app"
argument-hint: "[operation] [chain] [details]"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
user-invocable: true
---

# Tatum Automated Integration

This skill automatically integrates Tatum blockchain API into your existing project by detecting your framework, writing code files, installing dependencies, and configuring your environment.

## What This Skill Does

**Instead of giving code snippets, this skill:**
1. ✅ Reads your project to understand structure and framework
2. ✅ Writes/edits actual files in your project (services, routes, controllers)
3. ✅ Installs dependencies (npm, pip, maven, etc.)
4. ✅ Configures environment variables (.env files)
5. ✅ Uses correct v4 endpoints (never deprecated v3)
6. ✅ Tests that the integration works
7. ✅ (Optional) Validates API behavior via live MCP calls when Tatum MCP server is available

## Integration Workflow

When a developer asks to integrate Tatum, follow this 5-phase process:

### Phase 1: Understand the Project

**1. Detect Project Type**

Read configuration files to identify the project:
- `package.json` → Node.js/JavaScript project
- `requirements.txt`, `pyproject.toml`, or `setup.py` → Python project
- `pom.xml` or `build.gradle` → Java project
- `go.mod` → Go project
- `composer.json` → PHP project
- `Gemfile` → Ruby project

**2. Identify Framework**

Check dependencies to determine the framework:
- **Express**: `"express"` in package.json dependencies
- **FastAPI**: `fastapi` in requirements.txt
- **Spring Boot**: `spring-boot-starter-web` in pom.xml
- **Django**: `Django` in requirements.txt
- **Laravel**: `"laravel/framework"` in composer.json
- **Rails**: `rails` in Gemfile

**3. Understand Project Structure**

Use Glob to explore the project:
```
Glob: **/*.js, **/*.py, **/*.java, etc.
```

Identify common patterns:
- **Routes**: `routes/`, `routers/`, `api/routes/`
- **Controllers**: `controllers/`, `handlers/`
- **Services**: `services/`, `lib/`, `utils/`
- **Config**: `.env`, `config/`, `application.properties`
- **Main entry**: `index.js`, `app.js`, `main.py`, `Application.java`

### Phase 2: Plan the Integration

Based on the detected framework, determine what files to create/edit:

**Express.js Pattern:**
- Create: `src/services/tatumService.js`
- Create: `src/controllers/balanceController.js`
- Create: `src/routes/balance.js`
- Edit: `src/index.js` (register routes)
- Install: `npm install axios`
- Configure: Add `TATUM_API_KEY` to `.env`

**FastAPI Pattern:**
- Create: `app/services/tatum_service.py`
- Create: `app/routers/balance.py`
- Create: `app/models/balance.py` (Pydantic models)
- Edit: `app/main.py` (register router)
- Install: `pip install httpx`
- Configure: Add `TATUM_API_KEY` to `.env`

**Spring Boot Pattern:**
- Create: `src/main/java/.../service/TatumService.java`
- Create: `src/main/java/.../controller/BalanceController.java`
- Create: `src/main/java/.../model/BalanceResponse.java`
- Edit: `src/main/resources/application.properties`
- Install: Add dependency to `pom.xml` or `build.gradle`

**Django Pattern:**
- Create: `myapp/services/tatum_service.py`
- Edit: `myapp/views.py` (add view function)
- Edit: `myapp/urls.py` (add URL pattern)
- Edit: `settings.py` (add TATUM_API_KEY setting)
- Install: `pip install requests`

**Ask clarifying questions if needed:**
- "What endpoint path would you like? (default: /api/balance)"
- "Should this be authenticated with your existing middleware?"
- "Which blockchain(s) do you want to support primarily?"

### Phase 3: Validate with Live API (MCP-Enhanced)

This phase uses the Tatum MCP server for live API validation when available. If MCP is not available, fall back to static reference documentation.

**Step 1: Detect Tatum MCP Availability**

Check if the Tatum MCP server is connected and available:

1. **Check available tools**: Look for MCP tools with the prefix `tatumio` (e.g., `tatumio__get_balance`, `tatumio__get_nft_balances`, `tatumio__get_exchange_rate`). If any `tatumio*` tools appear in the available tool list, MCP is active.

2. **If no tools found**: Check for MCP configuration files that reference `@tatumio/blockchain-mcp`:
   - `.claude/mcp.json`
   - `.cursor/mcp.json`
   - `mcp.json` (project root)
   - `~/.config/claude/mcp.json` (global)

3. **Set MCP status**: Record whether MCP is `available`, `configured-but-not-running`, or `not-installed`.

**Step 2A: MCP IS Available — Live Validation**

If Tatum MCP tools are available, use them to validate the planned integration before writing code.

**Map each planned Tatum endpoint to its MCP tool:**

| Planned REST Endpoint | MCP Tool Name | Sample Call Parameters |
|----------------------|---------------|----------------------|
| `GET /v4/data/blockchains/balance` | `tatumio__get_balance` | `chain: "ethereum-mainnet", address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"` |
| `GET /v4/data/nft/balances` | `tatumio__get_nft_balances` | `chain: "ethereum-mainnet", address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"` |
| `GET /v4/data/rate/symbol` | `tatumio__get_exchange_rate` | `symbol: "ETH", basePair: "USD"` |
| `GET /v4/data/transactions` | `tatumio__get_transactions` | `chain: "ethereum-mainnet", address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"` |
| `GET /v4/data/balances` | `tatumio__get_token_balances` | `chain: "ethereum-mainnet", address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"` |
| `GET /v4/data/metadata` | `tatumio__get_nft_metadata` | `chain: "ethereum-mainnet", tokenAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D", tokenId: "1"` |
| `GET /v4/data/collections` | `tatumio__get_collection` | `chain: "ethereum-mainnet", collectionAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D"` |
| `GET /v4/data/owners` | `tatumio__get_nft_owners` | `chain: "ethereum-mainnet", tokenAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D", tokenId: "1"` |

**For each endpoint the integration will use:**

1. Call the corresponding MCP tool with sample parameters
2. Observe the live response structure
3. Note the exact field names, types, and nesting
4. Compare against `reference/api-responses.md` — if there are discrepancies, **trust the LIVE response**
5. Record the validated response schema for use in Phase 4 (code generation)

**What to extract from the live response:**
- Exact field names (e.g., is it `balance` or `amount`? Is it `nativeCurrency` or `asset`?)
- Data types (is the balance a string or number? Does the response use BigInt-style strings?)
- Nested structure (is metadata inside `data.metadata` or `result.metadata`?)
- Pagination format (does it use `offset`/`limit`, `page`/`pageSize`, or cursor-based?)
- Any extra fields not in static docs that might be useful

**Tell the user:**
```
MCP Validation: Tatum MCP server detected. Making live API call to validate
response structure for [endpoint name]...

Live response received. Validated [N] fields. Response structure confirmed.
Proceeding with code generation using validated schema.
```

**If the MCP call fails** (e.g., invalid API key, rate limit, network error):
- Log the error but do NOT block the workflow
- Fall back to static reference documentation
- Inform the user: "MCP validation call failed ([reason]). Proceeding with static reference documentation."

**Step 2B: MCP is NOT Available — Static Fallback + Recommendation**

If MCP is not available, proceed with static reference documentation (this is the current/default behavior):

1. Load `reference/api-parameters.md` for request parameter schemas
2. Load `reference/api-responses.md` for response body schemas
3. Load `reference/endpoints.md` to verify correct endpoint versions

**Then recommend MCP installation to the user (once per session):**

```
Tip: For enhanced accuracy, you can install the Tatum MCP server. It allows
this skill to make live API calls to validate parameters and response structures
before generating code.

Install:
  npm install -g @tatumio/blockchain-mcp

Configure (add to your MCP settings):
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

Learn more: https://tatum.io/mcp

This is optional — the integration will work correctly without it.
```

### Phase 4: Implement the Integration

**Step 1: Create Tatum Service**

The service handles all Tatum API communication. Always include:

✅ Load API key from environment
✅ Use correct v4 endpoints (load `reference/endpoints.md` to verify)
✅ Normalize chain names (load `reference/chain_identifiers.json`)
✅ Error handling with try/catch
✅ Response parsing and type conversions (wei → ETH, timestamps, IPFS URLs)
✅ If MCP validation was performed in Phase 3, use the validated live response schema to define response types/interfaces. The live schema takes priority over static docs if there are any differences.

**Step 2: Create Controller/Handler**

The controller handles HTTP requests:

✅ Validate input parameters (chain, address)
✅ Call Tatum service methods
✅ Format response for client
✅ Handle errors gracefully

**Step 3: Create Route/Endpoint**

Define RESTful endpoints:

✅ GET `/api/balance/:chain/:address` - Get balance
✅ GET `/api/nft/:chain/:address` - Get NFT balances
✅ GET `/api/price/:symbol` - Get exchange rate
✅ POST `/api/webhooks` - Create webhook
✅ POST `/api/webhooks/handler` - Receive webhook events

**Step 4: Update Main Application**

Register the new routes:

✅ Import route file
✅ Register with app/router
✅ Ensure middleware is applied correctly

**Step 5: Install Dependencies**

Run package manager commands:

- **Node.js**: `npm install axios` or `npm install node-fetch`
- **Python**: `pip install httpx` or `pip install requests`
- **Java**: Add to `pom.xml` dependencies
- **Go**: `go get <package>`
- **PHP**: `composer require guzzlehttp/guzzle`

**Step 6: Configure Environment**

Update environment configuration:

✅ Add `TATUM_API_KEY=your-key-here` to `.env`
✅ Create `.env.example` with template
✅ Add `.env` to `.gitignore` if not already there
✅ Document setup in comments

### Phase 5: Verify and Test

**Step 1: Run the Application**

Start the development server:
- `npm start` or `npm run dev`
- `python main.py` or `uvicorn app.main:app --reload`
- `./mvnw spring-boot:run`
- Check console for errors

**Step 2: Test the Endpoint**

Make a test HTTP request:
```bash
curl http://localhost:3000/api/balance/ethereum-mainnet/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

Verify:
✅ Endpoint responds (not 404)
✅ Response format is correct JSON
✅ Balance value is converted properly (not in wei)
✅ Error handling works (try invalid address)

**Step 3: Report to Developer**

Provide a clear summary:

```
✅ Integration Complete!

Created Files:
- src/services/tatumService.js
- src/controllers/balanceController.js
- src/routes/balance.js

Updated Files:
- src/index.js (registered balance routes)
- .env (added TATUM_API_KEY template)

Installed Dependencies:
- axios

Next Steps:
1. Add your Tatum API key to .env:
   TATUM_API_KEY=your-actual-api-key

2. Restart your server:
   npm start

3. Test the endpoint:
   GET http://localhost:3000/api/balance/ethereum-mainnet/{address}

Example Response:
{
  "address": "0x742d35Cc...",
  "chain": "ethereum-mainnet",
  "balance": 1.23,
  "symbol": "ETH"
}
```

## Endpoint Selection Rules

**CRITICAL**: Always use the correct API version

### READ Operations → Always V4

Load `reference/endpoints.md` when unsure, but these are the most common:

| Operation | V4 Endpoint |
|-----------|-------------|
| Get balance | `GET /v4/data/blockchains/balance` |
| Get transaction | `GET /v4/data/blockchains/transaction` |
| Get NFT balances | `GET /v4/data/nft/balances` |
| Get token balances | `GET /v4/data/balances` |
| Get tx history | `GET /v4/data/transactions` |
| Get exchange rate | `GET /v4/data/rate/symbol` |
| Get OHLCV data | `GET /v4/data/rate/symbol/OHLCV` |

### WRITE Operations → Use V3 (no v4 alternative yet)

| Operation | V3 Endpoint |
|-----------|-------------|
| Broadcast transaction | `POST /v3/{blockchain}/broadcast` |
| Deploy contract | `POST /v3/{blockchain}/smartcontract` |
| Generate wallet | `POST /v3/{blockchain}/wallet` |
| Derive address | `GET /v3/{blockchain}/address/{xpub}/{index}` |

### Webhooks → V4 Only

| Operation | V4 Endpoint |
|-----------|-------------|
| Create webhook | `POST /v4/subscription` |
| List webhooks | `GET /v4/subscription` |
| Update webhook | `PUT /v4/subscription` |
| Delete webhook | `DELETE /v4/subscription/{id}` |

## Chain Name Normalization

Developers may use friendly names - normalize them using `reference/chain_identifiers.json`:

Common mappings:
- `"ethereum"`, `"eth"`, `"ETH"` → `"ethereum-mainnet"`
- `"bitcoin"`, `"btc"`, `"BTC"` → `"bitcoin-mainnet"`
- `"polygon"`, `"matic"` → `"polygon-mainnet"`
- `"sepolia"` → `"ethereum-sepolia"`

**Always load** `reference/chain_identifiers.json` for complete mappings.

## Code Generation Guidelines

### Follow Project Conventions

**Detect and match their style:**

Read existing files to understand:
- Variable naming (`camelCase` vs `snake_case`)
- Quote style (single `'` vs double `"`)
- Semicolons (`;` or not)
- Indentation (2 spaces, 4 spaces, tabs)
- Async style (`async/await` vs promises vs callbacks)

**Example**: If their code uses:
```javascript
const express = require('express');
const router = express.Router();
```

Then use the same pattern (not ES6 imports).

### Error Handling Patterns

**Express.js:**
```javascript
try {
  const balance = await tatumService.getBalance(chain, address);
  res.json(balance);
} catch (error) {
  console.error('Tatum API error:', error);
  const statusCode = error.response?.status || 500;
  res.status(statusCode).json({ error: error.message });
}
```

**FastAPI:**
```python
from fastapi import HTTPException
import httpx

try:
    balance = await tatum_service.get_balance(chain, address)
    return balance
except httpx.HTTPStatusError as e:
    raise HTTPException(status_code=e.response.status_code, detail=str(e))
```

### Value Conversion Patterns

**Wei to ETH (and similar conversions):**

JavaScript:
```javascript
const balanceWei = BigInt(response.data.balance);
const decimals = response.data.decimals; // Usually 18 for ETH
const balanceEth = Number(balanceWei) / (10 ** decimals);
```

Python:
```python
balance_wei = int(response["balance"])
decimals = response["decimals"]
balance_eth = balance_wei / (10 ** decimals)
```

**Timestamps:**

JavaScript:
```javascript
const readableDate = new Date(timestamp * 1000).toISOString();
```

Python:
```python
from datetime import datetime
readable_date = datetime.fromtimestamp(timestamp).isoformat()
```

**IPFS URLs:**

```javascript
const httpUrl = ipfsUri.replace('ipfs://', 'https://ipfs.io/ipfs/');
```

## Common Integration Patterns

### Pattern 1: Balance Checking

**User Request:** "Add balance checking for Ethereum"

**Implementation:**
1. Create service method: `getBalance(chain, address)`
2. Create endpoint: `GET /api/balance/:chain/:address`
3. Use endpoint: `GET /v4/data/blockchains/balance`
4. Convert wei to ETH
5. Return formatted response

### Pattern 2: NFT Querying

**User Request:** "Add NFT balance checking"

**Implementation:**
1. Create service method: `getNFTBalances(chain, address)`
2. Create endpoint: `GET /api/nft/:chain/:address`
3. Use endpoint: `GET /v4/data/nft/balances`
4. Parse nested metadata structure
5. Convert IPFS URLs to HTTP

### Pattern 3: Webhook/Notification Integration

**User Request:** "Add webhook for Bitcoin transactions"

**Implementation:**
1. Create service method: `createSubscription(type, chain, address, url, conditions?)`
2. Create service method: `handleWebhook(data, hmacSignature?)` with HMAC verification
3. Create service method: `listSubscriptions()` and `deleteSubscription(id)`
4. Create endpoints:
   - `POST /api/webhooks` (create subscription)
   - `GET /api/webhooks` (list subscriptions)
   - `DELETE /api/webhooks/:id` (delete subscription)
   - `POST /api/webhooks/handler` (receive events)
5. Use endpoints: `POST /v4/subscription`, `GET /v4/subscription`, `DELETE /v4/subscription/{id}`
6. Implement HMAC signature verification (`PUT /v4/subscription` to enable)
7. Store webhook IDs for management

**Subscription Types** (15 available):
- `ADDRESS_EVENT` - Any address activity (broadest, recommended for most cases)
- `INCOMING_NATIVE_TX` / `OUTGOING_NATIVE_TX` - Native currency transfers
- `INCOMING_FUNGIBLE_TX` / `OUTGOING_FUNGIBLE_TX` - ERC-20/SPL token transfers
- `INCOMING_NFT_TX` / `OUTGOING_NFT_TX` - NFT transfers
- `INCOMING_MULTITOKEN_TX` / `OUTGOING_MULTITOKEN_TX` - ERC-1155 transfers
- `INCOMING_INTERNAL_TX` / `OUTGOING_INTERNAL_TX` - Internal (trace) transfers
- `OUTGOING_FAILED_TX` - Failed outgoing transactions
- `PAID_FEE` - Fee payments
- `FAILED_TXS_PER_BLOCK` - Failed transactions per block
- `CONTRACT_ADDRESS_LOG_EVENT` - Smart contract log events

**Filtering with Conditions** (reduce webhook noise):
```json
{
  "type": "INCOMING_FUNGIBLE_TX",
  "attr": {
    "address": "0x...",
    "chain": "ethereum-mainnet",
    "url": "https://your-server.com/webhook",
    "conditions": [
      { "field": "contractAddress", "operator": "==", "value": "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
      { "field": "value", "operator": ">=", "value": "1000000000" }
    ]
  }
}
```

Available fields: `txId`, `fromAddress`, `toAddress`, `value`, `contractAddress`, `tokenId`, `blockNumber`
Operators: `==`, `!=`, `>`, `>=`, `<`, `<=`

**HMAC Verification Example (Node.js):**
```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, hmacSecret) {
  const expected = crypto.createHmac('sha512', hmacSecret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
```

### Pattern 4: Exchange Rates

**User Request:** "Add crypto price tracking"

**Implementation:**
1. Create service method: `getExchangeRate(symbol, baseCurrency)`
2. Create endpoint: `GET /api/price/:symbol`
3. Use endpoint: `GET /v4/data/rate/symbol`
4. Cache prices (5-minute TTL recommended)
5. Return current price with 24h change

## Security Best Practices

### API Key Management

**Always:**
✅ Load from environment variables
✅ Never hardcode API keys in source code
✅ Add `.env` to `.gitignore`
✅ Provide `.env.example` template for setup

**Node.js:**
```javascript
require('dotenv').config();
const apiKey = process.env.TATUM_API_KEY;

if (!apiKey) {
  throw new Error('TATUM_API_KEY environment variable is required');
}
```

**Python:**
```python
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('TATUM_API_KEY')

if not api_key:
    raise ValueError('TATUM_API_KEY environment variable is required')
```

### Input Validation

**Always validate:**
✅ Chain names (must be in supported list)
✅ Address format (basic regex validation)
✅ Request parameters (prevent injection)

**Example:**
```javascript
function validateChainName(chain) {
  const validChains = ['ethereum-mainnet', 'bitcoin-mainnet', 'polygon-mainnet', /* ... */];
  if (!validChains.includes(chain)) {
    throw new Error(`Invalid chain: ${chain}`);
  }
  return chain;
}
```

### HTTPS for Webhooks

**When creating webhooks:**
- ⚠️ Warn if URL uses HTTP (should be HTTPS)
- ✅ Implement HMAC signature verification
- ✅ Validate webhook payload structure

## Complete Data API Reference

**IMPORTANT**: Load `reference/data-api-complete.md` for comprehensive coverage of ALL 75 Data API v4 endpoints across 12 categories:

- Wallet API (7 endpoints) - Balances, portfolio, reputation
- Transactions API (8 endpoints) - History, internal txs, UTXO tracking
- Prices & Exchange Rate API (9 endpoints) - Real-time rates, OHLCV
- Staking API (7 endpoints) - Native & liquid staking, rewards
- Mining API (2 endpoints) - Mining rewards
- Token API (5 endpoints) - Trending, popular, newest tokens
- Web3 Name Service API (1 endpoint) - ENS/SNS resolution
- Fee Estimation API (1 endpoint) - Gas estimation
- NFT API (6 endpoints) - Balances, metadata, collections, owners
- DeFi API (3 endpoints) - Protocol events
- Blockchains API (8 endpoints) - Blocks, UTXOs, mempool
- Marketplace API (18 endpoints) - NFT trades, transfers, pricing

**Plus Notification/Subscription API (16 v4 endpoints):**
- Subscription Management (8) - Create, list, update, delete subscriptions
- Webhook Inspection (2) - List and count executed webhooks
- Template Management (6) - Custom webhook templates
- Filtering support with conditions (field, operator, value)
- 15 subscription event types

**Plus 35 valid v3 chain-specific operations** for TRON, Stellar, Ripple, Cardano, Algorand.

Load `reference/api-parameters.md` for detailed request parameters for all endpoints.
Load `reference/api-responses.md` for response body schemas with JSON examples for all endpoints.

## Framework-Specific Examples

Load detailed examples from `reference/frameworks/{framework}.md` when implementing:

- `reference/frameworks/express.md` - Express.js complete example
- `reference/frameworks/fastapi.md` - FastAPI complete example
- `reference/frameworks/spring-boot.md` - Spring Boot complete example
- `reference/frameworks/django.md` - Django complete example
- `reference/frameworks/laravel.md` - Laravel complete example

These framework examples demonstrate the basic integration pattern. For specific Data API operations beyond the basic examples, refer to `reference/data-api-complete.md` for endpoint details and adapt the pattern accordingly.

## Testing Checklist

Before reporting completion to the developer:

- [ ] Application starts without errors
- [ ] New endpoint responds (not 404)
- [ ] Response format is correct JSON
- [ ] Values are converted properly (not raw wei)
- [ ] Error handling works (test invalid input)
- [ ] Dependencies are installed
- [ ] Environment is configured correctly
- [ ] Documentation is provided to user

## MCP Server Integration (Optional Enhancement)

The Tatum MCP server (`@tatumio/blockchain-mcp`) provides live blockchain API access as MCP tools. When installed and configured, this skill can make live API calls to validate endpoint behavior before generating integration code.

### Available MCP Tools

| MCP Tool | Corresponding REST Endpoint | Description |
|----------|---------------------------|-------------|
| `tatumio__get_balance` | `GET /v4/data/blockchains/balance` | Native cryptocurrency balance |
| `tatumio__get_token_balances` | `GET /v4/data/balances` | Fungible token balances |
| `tatumio__get_nft_balances` | `GET /v4/data/nft/balances` | NFT balances for a wallet |
| `tatumio__get_nft_metadata` | `GET /v4/data/metadata` | NFT metadata by token |
| `tatumio__get_collection` | `GET /v4/data/collections` | NFT collection details |
| `tatumio__get_nft_owners` | `GET /v4/data/owners` | NFT ownership data |
| `tatumio__get_exchange_rate` | `GET /v4/data/rate/symbol` | Crypto-to-fiat exchange rate |
| `tatumio__get_transactions` | `GET /v4/data/transactions` | Transaction history |
| `tatumio__get_block_info` | `GET /v4/data/blockchains/block` | Block information |
| `tatumio__check_malicious_address` | N/A (MCP-only) | Malicious address detection |
| `tatumio__get_wallet_portfolio` | `GET /v4/data/wallet/portfolio` | Portfolio analysis |
| `tatumio__get_wallet_history` | `GET /v4/data/wallet/balance/time` | Wallet balance history |

### Benefits of MCP Validation

- **Schema accuracy**: Live responses confirm exact field names, types, and nesting
- **API evolution**: Catches any changes between the static docs and current API behavior
- **Edge cases**: Reveals optional fields, null-handling, and pagination patterns
- **Developer confidence**: Generated code is validated against real API behavior

### MCP Detection Priority

1. Check for `tatumio__*` tools in the active tool list (most reliable)
2. Check MCP config files for `@tatumio/blockchain-mcp` entries
3. If neither found, MCP is not available — use static reference docs

### Installation for Users

```bash
npm install -g @tatumio/blockchain-mcp
```

**MCP Configuration:**
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

**Configuration file locations:**
- Claude Code: `.claude/mcp.json` or `~/.config/claude/mcp.json`
- Cursor: `.cursor/mcp.json`
- Other MCP-compatible editors: Refer to their MCP documentation

Learn more: https://tatum.io/mcp

## Troubleshooting Common Issues

### Issue: "Cannot find module 'axios'"
**Solution**: Run `npm install axios` in project directory

### Issue: "TATUM_API_KEY is not defined"
**Solution**: Add API key to `.env` file and restart server

### Issue: "404 Not Found"
**Solution**: Ensure routes are registered in main application file

### Issue: "Invalid chain identifier"
**Solution**: Use normalized chain name (e.g., `ethereum-mainnet` not `ethereum`)

### Issue: "Balance shows as very large number"
**Solution**: Convert from wei - divide by 10^decimals

## Summary

This skill automates Tatum API integration by:

1. **Understanding** your project structure and framework
2. **Planning** what files to create and what endpoints to use
3. **Validating** endpoint parameters and responses via live MCP calls (when available)
4. **Writing** actual code files (services, routes, controllers)
5. **Installing** necessary dependencies
6. **Configuring** environment variables
7. **Using** correct v4 endpoints (never deprecated v3)
8. **Testing** to ensure it works
9. **Supporting** all major languages and frameworks

The result: Developers get working Tatum integration in minutes, not hours.
