# Tatum API Endpoint Reference (V3 vs V4)

This document maps deprecated v3 endpoints to their v4 alternatives and identifies valid v3 endpoints that should still be used.

## Quick Decision Guide

- **READ operations** → Use V4
- **WRITE operations** → Use V3 (no v4 alternative yet)
- **Webhooks** → V4 only
- **Chain-specific operations** → Check if v3-only (TRON, XLM, XRP, ADA, ALGO)

---

## DEPRECATED V3 Endpoints → Use V4 Instead

**⚠️ DO NOT USE THESE V3 ENDPOINTS - They are deprecated**

### Balance Queries (DEPRECATED)

| ❌ Deprecated V3 | ✅ Use V4 Instead | Query Parameters |
|------------------|-------------------|-------------------|
| GET /v3/{blockchain}/account/balance/{address} | GET /v4/data/blockchains/balance | chain, address |
| GET /v3/ethereum/account/balance/{address} | GET /v4/data/blockchains/balance | chain=ethereum-mainnet, address |
| GET /v3/polygon/account/balance/{address} | GET /v4/data/blockchains/balance | chain=polygon-mainnet, address |
| GET /v3/bsc/account/balance/{address} | GET /v4/data/blockchains/balance | chain=bsc-mainnet, address |

**Affected Blockchains**: Ethereum, Polygon, BSC, Arbitrum, Optimism, Base, Avalanche, Fantom, Cronos, Klaytn, Harmony ONE, VeChain, XDC, KuCoin, Flare, Sonic, Solana, Celo

---

### Transaction Queries (DEPRECATED)

| ❌ Deprecated V3 | ✅ Use V4 Instead | Query Parameters |
|------------------|-------------------|-------------------|
| GET /v3/{blockchain}/transaction/{hash} | GET /v4/data/blockchains/transaction | chain, hash |
| GET /v3/{blockchain}/transaction/count/{address} | GET /v4/data/blockchains/transaction/count | chain, address |
| GET /v3/ethereum/account/transaction/{address} | GET /v4/data/transactions | chain=ethereum-mainnet, address |
| GET /v3/ethereum/account/transaction/internal/{address} | GET /v4/data/blockchains/transaction/internal | chain=ethereum-mainnet, address |

**Note**: Internal transactions only work on EVM chains (Ethereum, BSC, Polygon, Celo, Base, Arbitrum, Optimism, Berachain, Unichain, Monad)

---

### Block Operations (DEPRECATED)

| ❌ Deprecated V3 | ✅ Use V4 Instead | Query Parameters |
|------------------|-------------------|-------------------|
| GET /v3/{blockchain}/block/current | GET /v4/data/blockchains/block/current | chain |
| GET /v3/{blockchain}/block/{hashOrHeight} | GET /v4/data/blockchains/block | chain, hash or height |
| GET /v3/algorand/block/{roundNumber} | GET /v4/data/blockchains/block | chain=algorand-mainnet, height |

---

### UTXO Operations (DEPRECATED)

| ❌ Deprecated V3 | ✅ Use V4 Instead | Query Parameters |
|------------------|-------------------|-------------------|
| GET /v3/{blockchain}/utxo/{hash}/{index} | GET /v4/data/blockchains/utxo/info | chain, hash, index |
| GET /v3/bitcoin/transaction/address/{address} | GET /v4/data/blockchains/transaction/history/utxos | chain=bitcoin-mainnet, address |
| POST /v3/bitcoin/transaction/address/batch | POST /v4/data/blockchains/transaction/history/utxos/batch | chain, addresses[] |
| GET /v3/ada/transaction/address/{address} | GET /v4/data/blockchains/transaction/history/utxos | chain=cardano-mainnet, address |

**UTXO Chains**: Bitcoin, Litecoin, Dogecoin, Cardano

---

### Mempool Queries (DEPRECATED)

| ❌ Deprecated V3 | ✅ Use V4 Instead | Query Parameters |
|------------------|-------------------|-------------------|
| GET /v3/{blockchain}/mempool | GET /v4/data/blockchains/mempool | chain |

**Supported Chains**: Bitcoin, Litecoin, Dogecoin

---

## VALID V3 Endpoints (NOT Deprecated - Still Use)

**✅ USE THESE V3 ENDPOINTS - No v4 alternative exists yet**

### Transaction Broadcasting (VALID V3)

| Operation | V3 Endpoint | Purpose |
|-----------|-------------|---------|
| Broadcast signed transaction | POST /v3/{blockchain}/broadcast | Broadcast transaction to blockchain |

**Request Body**:
```json
{
  "txData": "0x...",
  "signatureId": "optional-kms-signature-id"
}
```

---

### Wallet Generation (VALID V3)

| Operation | V3 Endpoint | Purpose |
|-----------|-------------|---------|
| Generate wallet | POST /v3/{blockchain}/wallet | Generate new HD wallet |
| Generate wallet with private key | POST /v3/{blockchain}/wallet/priv | Generate wallet with private key |
| Derive address from xpub | GET /v3/{blockchain}/address/{xpub}/{index} | Derive address at index |

---

### Smart Contract Operations (VALID V3)

| Operation | V3 Endpoint | Purpose |
|-----------|-------------|---------|
| Deploy contract | POST /v3/{blockchain}/smartcontract | Deploy smart contract |
| Invoke contract method | POST /v3/{blockchain}/smartcontract/invoke | Call contract function |

**Note**: There are some v4 contract endpoints (e.g., `POST /v4/contract/deploy`, `POST /v4/contract/erc721/mint`) but they have limited support. V3 endpoints have broader chain support.

---

### RPC Node Access (VALID V3)

| Operation | V3 Endpoint | Purpose |
|-----------|-------------|---------|
| RPC proxy | POST /v3/blockchain/node/{chain}/{xApiKey} | Forward JSON-RPC to blockchain node |
| Web3 RPC | POST /v3/{blockchain}/web3/{xApiKey} | EVM Web3 RPC forwarding |

---

### Chain-Specific Operations (VALID V3 - No v4 Alternative)

#### TRON Operations

| Operation | V3 Endpoint |
|-----------|-------------|
| Get TRON account info | GET /v3/tron/account/{address} |
| Get TRON network info | GET /v3/tron/info |
| Freeze TRX | POST /v3/tron/freezeBalance |
| Unfreeze TRX | POST /v3/tron/unfreezeBalance |
| Deploy TRC-10 token | POST /v3/tron/trc10/deploy |
| Deploy TRC-20 token | POST /v3/tron/trc20/deploy |
| Get TRC-10 details | GET /v3/tron/trc10/detail/{idOrOwnerAddress} |
| Get TRC-20 transactions | GET /v3/tron/transaction/account/{address}/trc20 |
| TRC-10 transfer | POST /v3/tron/trc10/transaction |
| TRC-20 transfer | POST /v3/tron/trc20/transaction |

#### Stellar (XLM) Operations

| Operation | V3 Endpoint |
|-----------|-------------|
| Get account info | GET /v3/xlm/account/{address} |
| Get ledger info | GET /v3/xlm/ledger/{sequence} |
| Create account | POST /v3/xlm/account |
| Create trust line | POST /v3/xlm/trust |
| Send payment | POST /v3/xlm/transaction |
| Get fee | GET /v3/xlm/fee |
| Broadcast transaction | POST /v3/xlm/broadcast |

#### Ripple (XRP) Operations

| Operation | V3 Endpoint |
|-----------|-------------|
| Get account info | GET /v3/xrp/account/{address} |
| Get ledger info | GET /v3/xrp/ledger/{index} |
| Get account balance | GET /v3/xrp/account/{address}/balance |
| Create account | POST /v3/xrp/account |
| Create trust line | POST /v3/xrp/trust |
| Send payment | POST /v3/xrp/transaction |
| Get fee | GET /v3/xrp/fee |
| Broadcast transaction | POST /v3/xrp/broadcast |

#### Cardano (ADA) Operations

| Operation | V3 Endpoint |
|-----------|-------------|
| Generate wallet | POST /v3/ada/wallet |
| Generate wallet with private key | POST /v3/ada/wallet/priv |
| Get block by hash | GET /v3/ada/block/{hash} |
| Get network info | GET /v3/ada/info |
| Broadcast transaction | POST /v3/ada/broadcast |
| Get UTXOs for address | GET /v3/ada/{address}/utxos |

#### Algorand Operations

| Operation | V3 Endpoint |
|-----------|-------------|
| Indexer API proxy | GET /v3/algorand/node/indexer/{xApiKey}/{path} |
| Algod API proxy | GET /v3/algorand/node/algod/{xApiKey}/{path} |
| Opt-in to asset | POST /v3/algorand/asset/receive |
| Generate wallet | POST /v3/algorand/wallet |

---

## V4-ONLY Endpoints (No V3 Equivalent)

**✅ These operations ONLY exist in v4**

### Webhook/Subscription Management

| Operation | V4 Endpoint | Method |
|-----------|-------------|--------|
| Create webhook | /v4/subscription | POST |
| List webhooks | /v4/subscription | GET |
| Update webhook (enable HMAC) | /v4/subscription | PUT |
| Delete webhook | /v4/subscription/{id} | DELETE |
| Create custom template | /v4/subscription/template | POST |

**Webhook Event Types**:
- `ADDRESS_EVENT` - Any address activity
- `INCOMING_FUNGIBLE_TX` - ERC-20/SPL token transfers (incoming)
- `OUTGOING_FUNGIBLE_TX` - ERC-20/SPL token transfers (outgoing)
- `INCOMING_NATIVE_TX` - Native currency transfers (incoming)
- `OUTGOING_NATIVE_TX` - Native currency transfers (outgoing)
- `CONTRACT_ADDRESS_LOG_EVENT` - Smart contract events
- `FAILED_TXS_PER_BLOCK` - Failed transactions per block

---

### NFT & Token Data

| Operation | V4 Endpoint | Description |
|-----------|-------------|-------------|
| Get token balances | GET /v4/data/balances | ERC-20/SPL/TRC-20 balances |
| Get NFT balances | GET /v4/data/nft/balances | ERC-721/ERC-1155 balances |
| Get multitoken balances | GET /v4/data/multitoken/balances | ERC-1155 only |
| Get NFT metadata | GET /v4/data/metadata | Token metadata (name, image, attributes) |
| Get NFT collection | GET /v4/data/collections | All tokens from collection |
| Get token owners | GET /v4/data/owners | All owners of a token |

---

### Exchange Rates & Pricing

| Operation | V4 Endpoint | Description |
|-----------|-------------|-------------|
| Get rate by symbol | GET /v4/data/rate/symbol | Get crypto-to-fiat rate |
| Batch rates | POST /v4/data/rate/symbol/batch | Multiple rates in one call |
| Get rate by contract | GET /v4/data/rate/contract | Rate by contract address |
| Get price change | GET /v4/data/rate/price-change | Price change over period |
| Get OHLCV data | GET /v4/data/rate/symbol/OHLCV | Historical candlestick data |
| Batch OHLCV | GET /v4/data/rate/symbol/OHLCV/batch | Multiple candles |

**OHLCV Intervals**: 1m, 5m, 15m, 30m, 45m, 1h, 2h, 4h, 1d, 1w, 1M

---

### Staking Data

| Operation | V4 Endpoint | Description |
|-----------|-------------|-------------|
| Get native staking | GET /v4/data/staking/native/current-assets | Current staked assets |
| Get staking by validator | GET /v4/data/staking/native/current-assets-by-validator | Staked assets by validator |
| Get staking rewards | GET /v4/data/staking/native/rewards | Staking reward history |
| Get total rewards | GET /v4/data/staking/native/rewards/total | Total accumulated rewards |
| Get liquid staking | GET /v4/data/staking/liquid/current-assets | Liquid staking balances |
| Get liquid pools | GET /v4/data/staking/liquid/pools | Supported liquid staking pools |
| Get liquid rewards | GET /v4/data/staking/liquid/rewards | Liquid staking rewards |

**Supported Chains**: Ethereum, Solana

---

### Mining Data

| Operation | V4 Endpoint | Description |
|-----------|-------------|-------------|
| Get mining rewards | GET /v4/data/mining/rewards | Mining rewards (coinbase outputs) |
| Get total mining rewards | GET /v4/data/mining/totalRewards | Total accumulated mining rewards |

**Supported Chains**: Bitcoin, Litecoin, Dogecoin

---

### Blockchain Operations

| Operation | V4 Endpoint | Description |
|-----------|-------------|-------------|
| Estimate gas | GET /v4/blockchainOperations/gas | Estimate gas cost for transaction |
| Wallet operations | GET /v4/blockchainOperations/wallet | Wallet-related operations |

---

### Kadena-Specific

| Operation | V4 Endpoint | Description |
|-----------|-------------|-------------|
| Get Kadena balances | GET /v4/data/wallet/balances/kadena | Kadena wallet balances |
| Get Kadena transactions | GET /v4/data/transactions/kadena | Kadena transaction history |
| Get Kadena transfers | GET /v4/data/transfers/kadena | Kadena transfer history |

---

## Common Integration Patterns

### Pattern 1: Get Native Balance

**Use Case**: Check ETH, BTC, SOL balance

**Endpoint**: `GET /v4/data/blockchains/balance`

**Parameters**:
- `chain`: e.g., "ethereum-mainnet", "bitcoin-mainnet"
- `address`: Wallet address

**Response**:
```json
{
  "balance": "1234567890123456789",
  "decimals": 18,
  "symbol": "ETH"
}
```

**Remember to convert**: `balance_eth = balance_wei / (10 ** decimals)`

---

### Pattern 2: Get Token Balances (ERC-20, SPL, TRC-20)

**Use Case**: Check USDC, DAI, or other token balances

**Endpoint**: `GET /v4/data/balances`

**Parameters**:
- `addresses`: Wallet address (note: plural "addresses")
- `chain`: e.g., "ethereum-mainnet"

**Response**: List of token balances with contract addresses

---

### Pattern 3: Get NFT Balances

**Use Case**: Check NFT holdings

**Endpoint**: `GET /v4/data/nft/balances`

**Parameters**:
- `address`: Wallet address (note: singular "address")
- `chain`: e.g., "ethereum-mainnet"

**Response**: Nested structure - flatten for display

```json
{
  "contractAddress": "0x...",
  "metadata": [
    {
      "tokenId": "123",
      "metadata": {
        "name": "NFT #123",
        "image": "ipfs://...",
        "attributes": [...]
      }
    }
  ]
}
```

**Remember**: Convert IPFS URLs (`ipfs://` → `https://ipfs.io/ipfs/`)

---

### Pattern 4: Create Webhook

**Use Case**: Monitor Bitcoin address for transactions

**Endpoint**: `POST /v4/subscription`

**Request Body**:
```json
{
  "type": "ADDRESS_EVENT",
  "attr": {
    "address": "bc1q...",
    "chain": "bitcoin-mainnet",
    "url": "https://your-server.com/webhook"
  },
  "templateId": "enriched"
}
```

**Optional HMAC**: Use `PUT /v4/subscription` with `{"hmacSecret": "your-secret"}` to enable signature verification

---

### Pattern 5: Get Exchange Rate

**Use Case**: Get current ETH to USD price

**Endpoint**: `GET /v4/data/rate/symbol`

**Parameters**:
- `symbol`: e.g., "ETH"
- `basePair`: e.g., "USD" (default: EUR)

**Response**:
```json
{
  "value": 2145.67,
  "currency": "USD"
}
```

---

## Summary Table

| Category | Use V3 | Use V4 | Why |
|----------|--------|--------|-----|
| Balance queries | ❌ | ✅ | v3 deprecated |
| Transaction queries | ❌ | ✅ | v3 deprecated |
| NFT/Token data | N/A | ✅ | v4 only |
| Exchange rates | ❌ (legacy) | ✅ | v3 deprecated |
| Webhooks | N/A | ✅ | v4 only |
| Broadcast tx | ✅ | N/A | No v4 yet |
| Deploy contract | ✅ | ⚠️ | v4 limited support |
| Generate wallet | ✅ | N/A | No v4 yet |
| TRON operations | ✅ | N/A | Chain-specific |
| Stellar operations | ✅ | N/A | Chain-specific |
| Ripple operations | ✅ | N/A | Chain-specific |
| Cardano operations | ✅ | N/A | Chain-specific |
| Algorand operations | ✅ | N/A | Chain-specific |

---

## Credits & Rate Limiting

**Standard costs:**
- Balance query: 10 credits
- Transaction query: 10 credits
- NFT balance query: 50 credits
- Webhook notification: 50 credits per event + 50 credits/day
- Exchange rate: 20 credits
- Gas estimation: 10 credits

**Rate limits** (Free tier):
- 3 requests per second
- 100,000 credits per month

**Best practices:**
- Cache exchange rates (refresh every 30-60 seconds)
- Use batch endpoints when querying multiple items
- Implement exponential backoff for rate limit errors (429)

---

This endpoint reference ensures you always use the correct API version and avoid deprecated endpoints.
