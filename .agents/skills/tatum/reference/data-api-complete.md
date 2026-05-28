# Complete Tatum Data API Reference

This document provides comprehensive coverage of ALL Tatum Data API v4 endpoints organized by category.

## Table of Contents

1. [Wallet API](#wallet-api)
2. [Transactions API](#transactions-api)
3. [Prices & Exchange Rate API](#prices--exchange-rate-api)
4. [Staking API](#staking-api)
5. [Mining API](#mining-api)
6. [Token API](#token-api)
7. [Web3 Name Service API](#web3-name-service-api)
8. [Fee Estimation API](#fee-estimation-api)
9. [NFT API](#nft-api)
10. [DeFi API](#defi-api)
11. [Blockchains API](#blockchains-api)
12. [Marketplace API](#marketplace-api)
13. [Chain-Specific Operations (V3)](#chain-specific-operations-v3---still-valid)

---

## Wallet API

Get wallet balances, portfolio data, and reputation scores.

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/v4/data/blockchains/balance` | GET | Get native cryptocurrency balance | chain, address |
| `/v4/data/blockchains/balance/batch` | POST | Get balances for multiple addresses | chain, addresses[] |
| `/v4/data/wallet/balance/time` | GET | Get historical balance at specific time | chain, address, timestamp |
| `/v4/data/wallet/portfolio` | GET | Get complete wallet portfolio | chain, address |
| `/v4/data/wallet/reputation` | GET | Get wallet reputation score | chain, address |
| `/v4/data/wallet/reputation/portfolio` | GET | Get reputation-weighted portfolio | chain, address |
| `/v4/data/wallet/reputation/tokens` | GET | Get reputation scores for tokens | chain, address |

**Common Use Cases:**
- Check ETH/BTC/SOL balance
- Get complete portfolio value
- Batch query multiple wallets
- Historical balance tracking
- Reputation analysis

---

## Transactions API

Query transaction history, internal transactions, and UTXO data.

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/v4/data/blockchains/transaction` | GET | Get transaction by hash | chain, hash |
| `/v4/data/blockchains/transaction/count` | GET | Get transaction count for address | chain, address |
| `/v4/data/blockchains/transaction/internal` | GET | Get internal transactions (EVM only) | chain, address, pageSize, page |
| `/v4/data/blockchains/transaction/history/utxos` | GET | Get UTXO transaction history | chain, address, pageSize, page |
| `/v4/data/blockchains/transaction/history/utxos/batch` | POST | Batch UTXO transaction history | chain, addresses[] |
| `/v4/data/transaction/history` | GET | Get complete transaction history | chain, address, pageSize, page |
| `/v4/data/transactions/dna` | GET | Get transaction DNA/fingerprint | chain, address |
| `/v4/data/transactions/hash` | GET | Get transaction details by hash | chain, hash |

**Common Use Cases:**
- Transaction history display
- Internal transaction tracking (for contracts)
- UTXO tracking (Bitcoin, Cardano)
- Transaction count analytics
- Wallet activity analysis

**Supported Chains:**
- Internal transactions: Ethereum, BSC, Polygon, Arbitrum, Optimism, Base
- UTXO: Bitcoin, Litecoin, Dogecoin, Cardano

---

## Prices & Exchange Rate API

Get cryptocurrency prices, exchange rates, and historical OHLCV data.

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/v4/data/rate/symbol` | GET | Get current exchange rate by symbol | symbol, basePair |
| `/v4/data/rate/symbol/batch` | POST | Batch exchange rates by symbols | symbols[], basePair |
| `/v4/data/rate/contract` | GET | Get rate by contract address | chain, address, basePair |
| `/v4/data/rate/contract/batch` | POST | Batch rates by contract addresses | chain, addresses[], basePair |
| `/v4/data/rate/history` | GET | Get historical rate data | symbol, basePair, from, to |
| `/v4/data/rate/price-change` | GET | Get price change over period | symbol, basePair, period |
| `/v4/data/rate/price-change/batch` | POST | Batch price changes | symbols[], basePair, period |
| `/v4/data/rate/symbol/OHLCV` | GET | Get OHLCV candlestick data | symbol, basePair, interval, from, to |
| `/v4/data/rate/symbol/OHLCV/batch` | POST | Batch OHLCV data | symbols[], basePair, interval, from, to |

**Supported Base Pairs:** USD, EUR, GBP, JPY, CNY, and more

**OHLCV Intervals:** 1m, 5m, 15m, 30m, 45m, 1h, 2h, 4h, 1d, 1w, 1M

**Common Use Cases:**
- Real-time price display
- Historical price charts
- Portfolio valuation
- Price change alerts
- Trading indicators

---

## Staking API

Query staking positions, rewards, and validator data.

### Native Staking

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/v4/data/staking/native/current-assets` | GET | Get current staked assets | chain, address |
| `/v4/data/staking/native/current-assets-by-validator` | GET | Get staked assets by validator | chain, address, validator |
| `/v4/data/staking/native/pools` | GET | Get available staking pools | chain |
| `/v4/data/staking/native/rewards` | GET | Get staking reward history | chain, address, pageSize, page |
| `/v4/data/staking/native/transactions` | GET | Get staking transactions | chain, address, pageSize, page |

### Liquid Staking

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/v4/data/staking/liquid/current-assets` | GET | Get liquid staking positions | chain, address |
| `/v4/data/staking/liquid/pools` | GET | Get liquid staking pools | chain |

**Supported Chains:**
- Native Staking: Ethereum, Solana, Cardano, Polkadot
- Liquid Staking: Ethereum (Lido, Rocket Pool), Solana (Marinade)

**Common Use Cases:**
- Display staking balances
- Show validator information
- Track staking rewards
- Liquid staking positions
- APY calculations

---

## Mining API

Query mining rewards for PoW blockchains.

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/v4/data/mining/rewards` | GET | Get mining rewards (coinbase outputs) | chain, address, pageSize, page |
| `/v4/data/mining/totalRewards` | GET | Get total accumulated mining rewards | chain, address |

**Supported Chains:** Bitcoin, Litecoin, Dogecoin

**Common Use Cases:**
- Mining pool payouts
- Total mining earnings
- Mining history tracking

---

## Token API

Discover and track token trends and popularity.

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/v4/data/tokens` | GET | Search for tokens | query, chain, pageSize, page |
| `/v4/data/tokens/newest` | GET | Get newest tokens | chain, pageSize, page |
| `/v4/data/tokens/popular` | GET | Get popular tokens | chain, pageSize, page |
| `/v4/data/tokens/popular/history` | GET | Get historical popularity | chain, period |
| `/v4/data/tokens/trending` | GET | Get trending tokens | chain, pageSize, page |

**Supported Chains:** Ethereum, BSC, Polygon, Arbitrum, Optimism, Base, Solana

**Common Use Cases:**
- Token discovery
- Trending token alerts
- New token monitoring
- Popularity tracking

---

## Web3 Name Service API

Resolve Web3 domain names to addresses and vice versa.

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/v4/data/ns/name` | GET | Resolve ENS/SNS/other Web3 names | name, chain |

**Supported Services:**
- ENS (Ethereum Name Service) - .eth domains
- SNS (Solana Name Service) - .sol domains
- Unstoppable Domains - .crypto, .nft, etc.

**Common Use Cases:**
- Resolve ENS name to address (vitalik.eth → 0x...)
- Display human-readable names
- Reverse lookup (address → name)

---

## Fee Estimation API

Estimate gas fees for transactions.

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/v4/blockchainOperations/gas` | GET | Estimate gas cost for transaction | chain, type, from, to, amount |

**Supported Chains:** All EVM chains (Ethereum, BSC, Polygon, etc.)

**Common Use Cases:**
- Display estimated transaction cost
- Gas price optimization
- Transaction cost calculators

---

## NFT API

Query NFT balances, metadata, collections, and ownership.

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/v4/data/nft/balances` | GET | Get NFT balances (ERC-721/ERC-1155) | chain, address, pageSize, page |
| `/v4/data/multitoken/balances` | GET | Get ERC-1155 multitoken balances | chain, address, contractAddress |
| `/v4/data/metadata` | GET | Get NFT metadata | chain, contractAddress, tokenId |
| `/v4/data/collections` | GET | Get all NFTs from a collection | chain, contractAddress, pageSize, page |
| `/v4/data/owners` | GET | Get all owners of an NFT | chain, contractAddress, tokenId |
| `/v4/data/owners/address` | GET | Get owner address of specific NFT | chain, contractAddress, tokenId |

**Supported Chains:** Ethereum, BSC, Polygon, Arbitrum, Optimism, Base, Solana

**Common Use Cases:**
- NFT gallery display
- Collection browsing
- Ownership verification
- Metadata fetching (images, attributes)
- Rarity analysis

**Note:** IPFS URLs in metadata should be converted:
```
ipfs://QmXyz... → https://ipfs.io/ipfs/QmXyz...
```

---

## DeFi API

Query DeFi protocol events and block data.

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/v4/data/defi/blocks` | GET | Get DeFi block events | chain, blockNumber |
| `/v4/data/defi/blocks/latest` | GET | Get latest DeFi blocks | chain, pageSize |
| `/v4/data/defi/events` | GET | Get DeFi protocol events | chain, address, pageSize, page |

**Supported Protocols:** Uniswap, SushiSwap, PancakeSwap, Curve, Aave, Compound

**Common Use Cases:**
- DeFi position tracking
- Protocol event monitoring
- Liquidity pool analysis
- Yield farming data

---

## Blockchains API

Query blockchain data including blocks, UTXOs, and network info.

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/v4/data/blockchains/block` | GET | Get block by hash or height | chain, hash OR height |
| `/v4/data/blockchains/block/current` | GET | Get current block height | chain |
| `/v4/data/blockchains/block/hash` | GET | Get block hash by height | chain, height |
| `/v4/data/blockchains/mempool` | GET | Get mempool transactions | chain, pageSize, page |
| `/v4/data/blockchains/utxo/info` | GET | Get UTXO information | chain, hash, index |
| `/v4/data/block/time` | GET | Get block timestamp | chain, blockNumber |
| `/v4/data/utxos` | GET | Get UTXOs for address | chain, address |
| `/v4/data/utxos/batch` | POST | Batch UTXO query | chain, addresses[] |

**Supported Chains:**
- All chains for block queries
- Bitcoin, Litecoin, Dogecoin, Cardano for UTXO queries
- Bitcoin, Litecoin, Dogecoin for mempool

**Common Use Cases:**
- Block explorer functionality
- UTXO selection for transactions
- Mempool monitoring
- Network confirmation times

---

## Marketplace API

Query NFT marketplace data from CryptoSlam integration.

### Chain-Level Data

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/v4/data/marketplace/cryptoslam/chain/trades` | GET | Get all trades on a chain | chain, pageSize, page |
| `/v4/data/marketplace/cryptoslam/chain/trades/dna` | GET | Get trade DNA for chain | chain |
| `/v4/data/marketplace/cryptoslam/chain/transfers` | GET | Get all transfers on a chain | chain, pageSize, page |
| `/v4/data/marketplace/cryptoslam/chain/transfers/dna` | GET | Get transfer DNA for chain | chain |

### Trading Pair Data

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/v4/data/marketplace/cryptoslam/pair/trades` | GET | Get trades for specific pair | chain, collection, pageSize, page |
| `/v4/data/marketplace/cryptoslam/pair/trades/dna` | GET | Get pair trade DNA | chain, collection |

### Token-Level Data

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/v4/data/marketplace/cryptoslam/token/holder/reputation` | GET | Get token holder reputation | chain, contractAddress, tokenId |
| `/v4/data/marketplace/cryptoslam/token/price` | GET | Get current token price | chain, contractAddress, tokenId |
| `/v4/data/marketplace/cryptoslam/token/price/exotic` | GET | Get exotic token pricing | chain, contractAddress, tokenId |
| `/v4/data/marketplace/cryptoslam/token/price/exotic/history` | GET | Historical exotic pricing | chain, contractAddress, tokenId |
| `/v4/data/marketplace/cryptoslam/token/price/history` | GET | Get token price history | chain, contractAddress, tokenId |
| `/v4/data/marketplace/cryptoslam/token/trades` | GET | Get trades for specific token | chain, contractAddress, tokenId, pageSize, page |
| `/v4/data/marketplace/cryptoslam/token/transfers` | GET | Get transfers for token | chain, contractAddress, tokenId, pageSize, page |
| `/v4/data/marketplace/cryptoslam/token/transfers/dna` | GET | Get token transfer DNA | chain, contractAddress, tokenId |

### Wallet-Level Data

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/v4/data/marketplace/cryptoslam/wallet/trades` | GET | Get wallet's marketplace trades | chain, address, pageSize, page |
| `/v4/data/marketplace/cryptoslam/wallet/trades/dna` | GET | Get wallet trade DNA | chain, address |
| `/v4/data/marketplace/cryptoslam/wallet/transfers` | GET | Get wallet's NFT transfers | chain, address, pageSize, page |
| `/v4/data/marketplace/cryptoslam/wallet/transfers/dna` | GET | Get wallet transfer DNA | chain, address |

**Supported Marketplaces:** OpenSea, Blur, LooksRare, X2Y2, Rarible, and more

**Common Use Cases:**
- NFT price tracking
- Trading volume analysis
- Wallet trading activity
- Market trends
- Collection floor prices
- Holder reputation scores

---

## Chain-Specific Operations (V3 - Still Valid)

Some blockchains have specialized operations that are NOT deprecated but still use v3 endpoints (no v4 alternative exists yet).

### TRON Operations

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v3/tron/account/{address}` | GET | Get TRON account information |
| `/v3/tron/info` | GET | Get TRON network information |
| `/v3/tron/freezeBalance` | POST | Freeze TRX for resources |
| `/v3/tron/unfreezeBalance` | POST | Unfreeze TRX |
| `/v3/tron/trc10/deploy` | POST | Deploy TRC-10 token |
| `/v3/tron/trc20/deploy` | POST | Deploy TRC-20 token |
| `/v3/tron/trc10/detail/{id}` | GET | Get TRC-10 token details |
| `/v3/tron/transaction/account/{address}/trc20` | GET | Get TRC-20 transactions |
| `/v3/tron/trc10/transaction` | POST | TRC-10 transfer |
| `/v3/tron/trc20/transaction` | POST | TRC-20 transfer |

### Stellar (XLM) Operations

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v3/xlm/account/{address}` | GET | Get account information |
| `/v3/xlm/ledger/{sequence}` | GET | Get ledger information |
| `/v3/xlm/account` | POST | Create account |
| `/v3/xlm/trust` | POST | Create trust line |
| `/v3/xlm/transaction` | POST | Send payment |
| `/v3/xlm/fee` | GET | Get current fee |
| `/v3/xlm/broadcast` | POST | Broadcast transaction |

### Ripple (XRP) Operations

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v3/xrp/account/{address}` | GET | Get account information |
| `/v3/xrp/ledger/{index}` | GET | Get ledger information |
| `/v3/xrp/account/{address}/balance` | GET | Get account balance |
| `/v3/xrp/account` | POST | Create account |
| `/v3/xrp/trust` | POST | Create trust line |
| `/v3/xrp/transaction` | POST | Send payment |
| `/v3/xrp/fee` | GET | Get current fee |
| `/v3/xrp/broadcast` | POST | Broadcast transaction |

### Cardano (ADA) Operations

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v3/ada/wallet` | POST | Generate wallet |
| `/v3/ada/wallet/priv` | POST | Generate wallet with private key |
| `/v3/ada/block/{hash}` | GET | Get block by hash |
| `/v3/ada/info` | GET | Get network information |
| `/v3/ada/broadcast` | POST | Broadcast transaction |
| `/v3/ada/{address}/utxos` | GET | Get UTXOs for address |

### Algorand (ALGO) Operations

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v3/algorand/node/indexer/{xApiKey}/{path}` | GET | Indexer API proxy |
| `/v3/algorand/node/algod/{xApiKey}/{path}` | GET | Algod API proxy |
| `/v3/algorand/asset/receive` | POST | Opt-in to asset |
| `/v3/algorand/wallet` | POST | Generate wallet |

**Note:** These are **NOT deprecated**. Use these v3 endpoints for chain-specific operations. They are still officially supported and have no v4 alternatives.

---

## Integration Examples

### Basic Pattern

All Data API endpoints follow this pattern:

```javascript
const response = await axios.get('https://api.tatum.io/v4/data/{category}/{operation}', {
  headers: {
    'x-api-key': process.env.TATUM_API_KEY
  },
  params: {
    chain: 'ethereum-mainnet',
    // ... other parameters
  }
});
```

### Pagination

Most list endpoints support pagination:

```javascript
{
  params: {
    pageSize: 50,  // default: 10, max: 50
    page: 1        // default: 1
  }
}
```

### Response Format

All endpoints return JSON responses. Common patterns:

**Single Item:**
```json
{
  "data": { /* item data */ }
}
```

**List:**
```json
{
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 100
  }
}
```

---

## Rate Limiting

**Free Tier:**
- 3 requests per second
- 100,000 credits per month

**Credit Costs:**
- Balance queries: 10 credits
- Transaction queries: 10 credits
- NFT queries: 50 credits
- Marketplace queries: 100 credits
- Historical data: 20 credits

**Best Practices:**
- Cache frequently accessed data
- Use batch endpoints when possible
- Implement exponential backoff for 429 errors

---

## Chain Identifiers

Always use official chain identifiers. Common mappings:

- `ethereum-mainnet` (not "ethereum" or "eth")
- `bitcoin-mainnet` (not "bitcoin" or "btc")
- `polygon-mainnet` (not "polygon" or "matic")
- `bsc-mainnet` (not "bsc" or "binance")
- `solana-mainnet` (not "solana" or "sol")

See `reference/chain_identifiers.json` for complete list.

---

## Error Handling

**Common HTTP Status Codes:**

- `200` - Success
- `400` - Bad request (invalid parameters)
- `401` - Unauthorized (invalid API key)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found (address/token doesn't exist)
- `429` - Rate limit exceeded
- `500` - Internal server error

**Error Response Format:**
```json
{
  "statusCode": 400,
  "message": "Invalid chain identifier",
  "errorCode": "INVALID_CHAIN"
}
```

---

## Detailed Parameter Documentation

**⚠️ For accurate request/response parameters, see:**
- **[Complete API Parameters Reference](api-parameters.md)** - Detailed specs for all 75 v4 endpoints (89 KB)
- **[API Summary](api-summary.md)** - Overview, statistics, and usage patterns
- **[Quick Reference](api-quick-reference.md)** - Fast lookup table for all endpoints

These files are generated from the official Tatum OpenAPI specification and contain 100% accurate parameter information including types, formats, examples, and constraints.

---

## Summary

This document covers **all 75 Data API v4 endpoints** across 12 categories:

- ✅ **7** Wallet API endpoints
- ✅ **8** Transactions API endpoints
- ✅ **9** Prices & Exchange Rate API endpoints
- ✅ **7** Staking API endpoints
- ✅ **2** Mining API endpoints
- ✅ **5** Token API endpoints
- ✅ **1** Web3 Name Service API endpoint
- ✅ **1** Fee Estimation API endpoint
- ✅ **6** NFT API endpoints
- ✅ **3** DeFi API endpoints
- ✅ **8** Blockchains API endpoints
- ✅ **18** Marketplace API endpoints

**Plus chain-specific v3 operations** (still valid, not deprecated):
- ✅ **10** TRON operations
- ✅ **7** Stellar (XLM) operations
- ✅ **8** Ripple (XRP) operations
- ✅ **6** Cardano (ADA) operations
- ✅ **4** Algorand operations

**Total: 75 v4 endpoints + 35 chain-specific v3 endpoints = 110 total operations**

---

For implementation examples and framework-specific code, see:
- [express.md](frameworks/express.md)
- [fastapi.md](frameworks/fastapi.md)
- [spring-boot.md](frameworks/spring-boot.md)
- [django.md](frameworks/django.md)
- [laravel.md](frameworks/laravel.md)
