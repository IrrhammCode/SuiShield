# Tatum API - Complete Parameter Reference

This document provides comprehensive parameter documentation for all Tatum v4 Data API endpoints and chain-specific v3 endpoints, extracted from the OpenAPI specification. For response body schemas, see [api-responses.md](api-responses.md).

**Base URL**: `https://api.tatum.io`

**Authentication**: All endpoints require an API key passed via the `X-API-Key` header.

---

## Table of Contents

- [Exchange Rate APIs](#exchange-rate-apis)
- [Wallet APIs](#wallet-apis)
- [Transaction APIs](#transaction-apis)
- [Token APIs](#token-apis)
- [NFT APIs](#nft-apis)
- [Blockchain APIs](#blockchain-apis)
- [DeFi APIs](#defi-apis)
- [Staking APIs](#staking-apis)
- [Mining APIs](#mining-apis)
- [Marketplace APIs](#marketplace-apis)
- [Fee Estimation APIs](#fee-estimation-apis)
- [Web3 Name Service APIs](#web3-name-service-apis)
- [Notification/Subscription APIs](#notificationsubscription-apis)
- [Chain-Specific V3 APIs](#chain-specific-v3-apis)

---

## Exchange Rate APIs

### GET /v4/data/rate/symbol
Get current exchange rate for a single symbol.

**Credits**: 20 per API call

**Query Parameters**:
- `symbol` (required): Currency symbol (e.g., "BTC", "ETH")
  - Type: string
  - Example: `BTC`
- `basePair` (optional): Target fiat currency (default: EUR)
  - Type: string
  - Example: `USD`

**Example Request**:
```bash
curl -X GET "https://api.tatum.io/v4/data/rate/symbol?symbol=BTC&basePair=USD" \
  -H "x-api-key: YOUR_API_KEY"
```

---

### POST /v4/data/rate/symbol/batch
Get current exchange rates for multiple symbols in a single batch request.

**Credits**: 20 per pair per API call

**Request Body**: Array of objects

**Body Parameters**:
Each object in the array must contain:
- `symbol` (required): FIAT or crypto asset
  - Type: string
  - Example: `BTC`
- `basePair` (required): Base pair for exchange rate
  - Type: string
  - Example: `USD`
- `batchId` (required): Identifier for this pair (returned with result)
  - Type: string
  - Example: `1`

**Response**: Array of exchange rate objects with corresponding `batchId`

**Complete JavaScript Example**:
```javascript
const getBatchRatesBySymbol = async () => {
  const url = 'https://api.tatum.io/v4/data/rate/symbol/batch';

  const requestBody = [
    { basePair: 'USD', batchId: '1', symbol: 'BTC' },
    { basePair: 'USD', batchId: '2', symbol: 'ETH' },
    { basePair: 'USD', batchId: '3', symbol: 'SOL' }
  ];

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY'
    },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();
  console.log('Exchange rates:', data);
  return data;
};

// Example response:
// [
//   { batchId: '1', symbol: 'BTC', basePair: 'USD', value: '45000.50', timestamp: '2026-04-17T12:00:00Z' },
//   { batchId: '2', symbol: 'ETH', basePair: 'USD', value: '3200.75', timestamp: '2026-04-17T12:00:00Z' },
//   { batchId: '3', symbol: 'SOL', basePair: 'USD', value: '150.25', timestamp: '2026-04-17T12:00:00Z' }
// ]
```

---

### GET /v4/data/rate/contract
Get current exchange rate by chain and contract address.

**Credits**: 20 per API call

**Query Parameters**:
- `chain` (required): The blockchain to work with
  - Type: string
  - Example: `ethereum-mainnet`
- `contractAddress` (required): Smart contract address
  - Type: string
  - Example: `0xdAC17F958D2ee523a2206206994597C13D831ec7`
- `basePair` (optional): Target fiat asset (default: EUR)
  - Type: string
  - Example: `USD`

**Example Request**:
```bash
curl -X GET "https://api.tatum.io/v4/data/rate/contract?chain=ethereum-mainnet&contractAddress=0xdAC17F958D2ee523a2206206994597C13D831ec7&basePair=USD" \
  -H "x-api-key: YOUR_API_KEY"
```

---

### POST /v4/data/rate/contract/batch
Get current exchange rates by chain and contract address for multiple pairs in one request.

**Credits**: 20 per pair per API call

**Limits**:
- Maximum 25 pairs per request
- Maximum 3 different chains per request
- Duplicate (chain, contractAddress) pairs allowed

**Request Body**: Array of objects (max 25 items)

**Body Parameters**:
Each object in the array must contain:
- `chain` (required): The blockchain to work with
  - Type: string
  - Example: `ethereum-mainnet`
- `contractAddress` (required): Smart contract address
  - Type: string
  - Example: `0xdac17f958d2ee523a2206206994597c13d831ec7`
- `basePair` (required): Target fiat asset
  - Type: string
  - Example: `USD`
- `batchId` (required): Identifier for this pair (returned with result)
  - Type: string
  - Example: `1`

**Complete JavaScript Example**:
```javascript
const getBatchRatesByContract = async () => {
  const url = 'https://api.tatum.io/v4/data/rate/contract/batch';

  const requestBody = [
    {
      chain: 'ethereum-mainnet',
      basePair: 'USD',
      contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
      batchId: '1'
    },
    {
      chain: 'ethereum-mainnet',
      basePair: 'USD',
      contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
      batchId: '2'
    },
    {
      chain: 'polygon-mainnet',
      basePair: 'USD',
      contractAddress: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // USDT on Polygon
      batchId: '3'
    }
  ];

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY'
    },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();
  console.log('Contract exchange rates:', data);
  return data;
};

// Example response:
// [
//   { batchId: '1', chain: 'ethereum-mainnet', contractAddress: '0xdac...', value: '1.00', timestamp: '...' },
//   { batchId: '2', chain: 'ethereum-mainnet', contractAddress: '0xa0b...', value: '1.00', timestamp: '...' },
//   { batchId: '3', chain: 'polygon-mainnet', contractAddress: '0xc21...', value: '1.00', timestamp: '...' }
// ]
```

**Error Handling**: When a token price is not available, the response includes `value` and `timestamp` as `null` with an error object containing `message: "Token not found"`.

---

### GET /v4/data/rate/price-change
Get price change data for a symbol over a time range or interval.

**Credits**: 200 per API call

**Query Parameters**:
- `symbol` (required): Base symbol
  - Type: string
  - Example: `BTC`
- `basePair` (optional): Quote asset (default: USDT)
  - Type: string
  - Example: `USDT`
- `timeFrom` (conditionally required): Range start (ISO 8601). Required if not using interval
  - Type: string (date-time)
  - Example: `2026-04-10T00:00:00Z`
- `timeTo` (conditionally required): Range end (ISO 8601). Required if not using interval
  - Type: string (date-time)
  - Example: `2026-04-17T00:00:00Z`
- `interval` (conditionally required): Predefined interval. Use instead of timeFrom/timeTo
  - Type: string
  - Enum: `1m`, `5m`, `15m`, `30m`, `45m`, `1h`, `2h`, `4h`, `1d`, `1w`, `1M`

**Example Request**:
```bash
curl -X GET "https://api.tatum.io/v4/data/rate/price-change?symbol=BTC&basePair=USDT&timeFrom=2026-04-10T00:00:00Z&timeTo=2026-04-17T00:00:00Z" \
  -H "x-api-key: YOUR_API_KEY"
```

---

### POST /v4/data/rate/price-change/batch
Get price change data for multiple symbols in a single request.

**Credits**: 200 per API call

**Limits**: Maximum 10 items per request

**Request Body**: Array of objects (max 10 items)

**Body Parameters**:
Each object in the array must contain:
- `symbol` (required): Base symbol
  - Type: string
  - Example: `BTC`
- `basePair` (optional): Quote asset (default: USDT)
  - Type: string
  - Example: `USDT`
- `batchId` (required): Identifier for this item (returned with result)
  - Type: string
  - Example: `1`
- Either time range OR interval:
  - `timeFrom` + `timeTo`: Range start and end (ISO 8601)
    - Type: string (date-time)
    - Example: `2026-04-10T00:00:00Z`
  - OR `interval`: Predefined interval
    - Type: string
    - Enum: `1m`, `5m`, `15m`, `30m`, `45m`, `1h`, `2h`, `4h`, `1d`, `1w`, `1M`

**Complete JavaScript Example**:
```javascript
const getBatchPriceChanges = async () => {
  const url = 'https://api.tatum.io/v4/data/rate/price-change/batch';

  const requestBody = [
    {
      symbol: 'BTC',
      basePair: 'USDT',
      batchId: '1',
      timeFrom: '2026-04-10T00:00:00Z',
      timeTo: '2026-04-17T00:00:00Z'
    },
    {
      symbol: 'ETH',
      basePair: 'USDT',
      batchId: '2',
      timeFrom: '2026-04-10T00:00:00Z',
      timeTo: '2026-04-17T00:00:00Z'
    },
    {
      symbol: 'SOL',
      basePair: 'USDT',
      batchId: '3',
      interval: '1w' // Alternative: use interval instead of timeFrom/timeTo
    }
  ];

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY'
    },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();
  console.log('Price changes:', data);
  return data;
};

// Example response:
// [
//   { batchId: '1', symbol: 'BTC', priceChange: 2.5, priceChangePercent: 5.5, ... },
//   { batchId: '2', symbol: 'ETH', priceChange: 150.0, priceChangePercent: 4.8, ... },
//   { batchId: '3', symbol: 'SOL', priceChange: 10.5, priceChangePercent: 7.0, ... }
// ]
```

---

### GET /v4/data/rate/symbol/OHLCV
Get historical OHLCV (Open, High, Low, Close, Volume) data for a symbol at a specific point in time.

Retrieves the closest available price record for a given symbol and timestamp. By default returns 1-minute candles; use the `interval` parameter for larger candle sizes.

**Credits**: 50 per API call

**Supported Symbols**: 439+ trading pairs (BTC, ETH, SOL, BNB, ADA, XRP, DOGE, SHIB, UNI, LINK, and many more)

**Query Parameters**:
- `symbol` (required): The base symbol of the trading pair
  - Type: string (enum, 439+ supported symbols)
  - Example: `BTC`, `ETH`, `SOL`

- `unix` OR `time` (one required): Timestamp for the price lookup
  - `unix`: Unix timestamp in milliseconds
    - Type: integer
    - Example: `1609459200000`
  - `time`: Date in ISO 8601 format
    - Type: string (date-time)
    - Example: `2021-01-01T00:00:00Z`
  - **Note**: You must provide exactly one of these, not both

- `interval` (optional): Candle interval size (defaults to `1m`)
  - Type: string
  - Allowed values: `1m`, `5m`, `15m`, `30m`, `45m`, `1h`, `2h`, `4h`, `1d`, `1w`, `1M`

**Time Handling**:
- If the provided time falls within an interval, returns that interval's OHLCV record
- If time is later than any available data, returns the most recent OHLCV record
- If time is earlier than any available data, returns the earliest available OHLCV record

**Example Request (using `time`)**:
```javascript
const url = 'https://api.tatum.io/v4/data/rate/symbol/OHLCV?' + new URLSearchParams({
  symbol: 'BTC',
  time: '2026-04-17T12:00:00Z',
  interval: '1h'
});

const response = await fetch(url, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY'
  }
});

const ohlcv = await response.json();
```

**Example Request (using `unix`)**:
```javascript
const url = 'https://api.tatum.io/v4/data/rate/symbol/OHLCV?' + new URLSearchParams({
  symbol: 'ETH',
  unix: 1609459200000,
  interval: '1d'
});

const response = await fetch(url, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY'
  }
});

const ohlcv = await response.json();
```

**Response Schema** (HistoricalPrice):
```json
{
  "symbol": "BTC",
  "openTime": 1499040000000,
  "open": "0.01634790",
  "high": "0.80000000",
  "low": "0.01575800",
  "close": "0.01577100",
  "closeTime": 1499644799999,
  "volume": "148976.11427815",
  "quoteAssetVolume": "2434.19055334",
  "numberOfTrades": 308,
  "takerBuyBaseAssetVolume": "1756.87402397",
  "takerBuyQuoteAssetVolume": "28.46694368"
}
```

| Response Field | Type | Description |
|----------------|------|-------------|
| `symbol` | string | Base symbol (e.g., "BTC") |
| `openTime` | number | Kline open time (Unix ms) |
| `open` | string | Open price |
| `high` | string | High price |
| `low` | string | Low price |
| `close` | string | Close price |
| `closeTime` | number | Kline close time (Unix ms) |
| `volume` | string | Base asset volume |
| `quoteAssetVolume` | string | Quote asset volume (USDT) |
| `numberOfTrades` | number | Number of trades |
| `takerBuyBaseAssetVolume` | string | Taker buy base asset volume |
| `takerBuyQuoteAssetVolume` | string | Taker buy quote asset volume |

---

### GET /v4/data/rate/symbol/OHLCV/batch
Get multiple historical OHLCV (Open, High, Low, Close, Volume) candles for a symbol starting from a given time.

Returns up to `numberOfCandles` (max 50) OHLCV candles with `openTime` >= the provided start time, ordered by `openTime` ascending.

**Credits**: 500 per API call

**Query Parameters**:
- `symbol` (required): The base symbol of the trading pair
  - Type: string (enum with 439+ supported symbols)
  - Example: `BTC`, `ETH`, `SOL`

- `unixFrom` OR `timeFrom` (one required): Start time for the range
  - `unixFrom`: Unix timestamp in milliseconds
    - Type: integer
    - Example: `1609459200000`
  - `timeFrom`: ISO 8601 date-time format
    - Type: string
    - Example: `2021-01-01T00:00:00Z`
  - **Note**: You must provide exactly one of these parameters, not both

- `numberOfCandles` (required): Number of candles to return
  - Type: integer
  - Range: 1 to 50
  - Example: `10`

- `interval` (optional): Candle interval size (defaults to `1m`)
  - Type: string
  - Allowed values: `1m`, `5m`, `15m`, `30m`, `45m`, `1h`, `2h`, `4h`, `1d`, `1w`, `1M`
  - Example: `1h`

**Supported Symbols**: 439+ trading pairs including BTC, ETH, SOL, and many more.

**Example Request**:
```javascript
const url = 'https://api.tatum.io/v4/data/rate/symbol/OHLCV/batch?' + new URLSearchParams({
  symbol: 'BTC',
  timeFrom: '2026-04-10T00:00:00Z',
  numberOfCandles: 10,
  interval: '1h'
});

const response = await fetch(url, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY'
  }
});

const ohlcvData = await response.json();
```

**Example Response**:
```json
[
  {
    "symbol": "BTC",
    "openTime": 1712793600000,
    "open": "65000.50",
    "high": "66500.00",
    "low": "64800.00",
    "close": "66200.75",
    "closeTime": 1712797199999,
    "volume": "1234.56789",
    "quoteAssetVolume": "80000000.00",
    "numberOfTrades": 15678,
    "takerBuyBaseAssetVolume": "678.12345",
    "takerBuyQuoteAssetVolume": "44000000.00"
  }
]
```

---

### GET /v4/data/rate/history
Get historical exchange rates for a symbol.

**Credits**: 50 per API call

**Query Parameters**:
- `symbol` (required): Currency symbol
  - Type: string
  - Example: `BTC`
- `basePair` (optional): Target currency (default: EUR)
  - Type: string
  - Example: `USD`
- `from` (required): Start timestamp (Unix epoch in milliseconds)
  - Type: number
  - Example: `1712793600000`
- `to` (required): End timestamp (Unix epoch in milliseconds)
  - Type: number
  - Example: `1713398400000`

**Example Request**:
```bash
curl -X GET "https://api.tatum.io/v4/data/rate/history?symbol=BTC&basePair=USD&from=1712793600000&to=1713398400000" \
  -H "x-api-key: YOUR_API_KEY"
```

---

## Wallet APIs

### GET /v4/data/wallet/portfolio
Get portfolio balances (native, fungible tokens, NFTs) for a wallet address.

**Credits**: 50 per API call

**Supported Chains**:
- Ethereum (mainnet, sepolia, holesky)
- Solana (mainnet, devnet)
- Base, Arbitrum, BNB Smart Chain, Polygon, Optimism, Berachain, Unichain, Monad, Celo, Chiliz, Tezos, Moca Chain

**Query Parameters**:
- `chain` (required): The blockchain to work with
  - Type: string
  - Example: `ethereum-mainnet`
- `addresses` (required): Wallet address (only one allowed)
  - Type: string
  - Example: `0x80d8bac9a6901698b3749fe336bbd1385c1f98f2`
- `tokenTypes` (required): Token types to fetch
  - Type: string
  - Enum: `native`, `fungible`, `nft,multitoken`
  - Example: `fungible`
- `excludeMetadata` (optional): Exclude metadata from response
  - Type: boolean
  - Default: false
- `pageSize` (optional): Items per page
  - Type: number
  - Default: 50
- `offset` (optional): Pagination offset
  - Type: number

**Example Request**:
```bash
curl -X GET "https://api.tatum.io/v4/data/wallet/portfolio?chain=ethereum-mainnet&addresses=0x80d8bac9a6901698b3749fe336bbd1385c1f98f2&tokenTypes=fungible&pageSize=50" \
  -H "x-api-key: YOUR_API_KEY"
```

**Example Response Structure**:
```json
{
  "result": [
    {
      "asset": "USDT",
      "balance": "1000.5",
      "type": "fungible",
      "tokenAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7",
      "metadata": { "name": "Tether USD", "symbol": "USDT", "decimals": 6 }
    }
  ],
  "offset": 0,
  "totalResults": 1
}
```

---

### GET /v4/data/wallet/balance/time
Get wallet balance at a specific point in time.

**Credits**: Variable based on chain

**Query Parameters**:
- `chain` (required): Blockchain
  - Type: string
- `addresses` (required): Wallet address
  - Type: string
- `timestamp` (required): Unix timestamp
  - Type: number
- `tokenAddress` (optional): Specific token address
  - Type: string

**Example Request**:
```bash
curl -X GET "https://api.tatum.io/v4/data/wallet/balance/time?chain=ethereum-mainnet&addresses=0x123...&timestamp=1713398400" \
  -H "x-api-key: YOUR_API_KEY"
```

---

### GET /v4/data/wallet/reputation
Get wallet reputation score and risk assessment.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): Blockchain
  - Type: string
- `address` (required): Wallet address
  - Type: string

---

### GET /v4/data/wallet/reputation/portfolio
Get reputation data for all tokens in a wallet portfolio.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): Blockchain
  - Type: string
- `address` (required): Wallet address
  - Type: string

---

### GET /v4/data/wallet/reputation/tokens
Get reputation data for specific tokens held by a wallet.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): Blockchain
  - Type: string
- `address` (required): Wallet address
  - Type: string
- `tokenAddresses` (required): Comma-separated token addresses
  - Type: string

---

## Transaction APIs

### GET /v4/data/transaction/history
Get transaction history for a wallet address.

**Credits**: 20 per API call

**Supported Chains**:
- Ethereum, Base, Arbitrum, BNB Smart Chain, Polygon, Optimism, Berachain, Unichain, Monad, Celo, Chiliz, Tezos, Moca Chain

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
  - Example: `ethereum-mainnet`
- `addresses` (required): Wallet address (only one allowed)
  - Type: string
  - Example: `0x2474a7227877f2b65185f09468af7c6577fa207c`
- `transactionTypes` (optional): Filter by transaction types (comma-separated)
  - Type: string
  - Enum: `fungible`, `nft`, `multitoken`, `native`
  - Example: `fungible,nft`
- `transactionSubtype` (optional): Filter by direction
  - Type: string
  - Enum: `incoming`, `outgoing`, `zero-transfer`
  - Example: `incoming`
- `tokenAddress` (optional): Specific token contract address
  - Type: string
- `tokenId` (optional): Specific token ID
  - Type: string
- `blockFrom` (optional): Start block number
  - Type: number
  - Note: If blockTo not specified, automatically calculated as blockFrom + 1000
- `blockTo` (optional): End block number
  - Type: number
  - Note: If blockFrom not specified, automatically calculated as blockTo - 1000
- `pageSize` (optional): Items per page
  - Type: number
  - Default: 50
- `offset` (optional): Pagination offset
  - Type: number
- `cursor` (optional): Pagination cursor (for Tezos block queries)
  - Type: string

**Important Notes**:
- For wallets with 250+ transactions, use `transactionTypes` filter with only one value at a time
- Tezos accepts only one wallet address
- Tezos does not support: `transactionTypes`, `transactionSubtype`, `tokenId`, `blockTo` filters

**Example Request**:
```bash
curl -X GET "https://api.tatum.io/v4/data/transaction/history?chain=ethereum-mainnet&addresses=0x2474a7227877f2b65185f09468af7c6577fa207c&transactionTypes=fungible&transactionSubtype=incoming&pageSize=50" \
  -H "x-api-key: YOUR_API_KEY"
```

**Example Response Structure**:
```json
{
  "result": [
    {
      "chain": "ethereum-mainnet",
      "hash": "0xabc...",
      "address": "0x2474a7227877f2b65185f09468af7c6577fa207c",
      "blockNumber": 12345678,
      "transactionType": "fungible",
      "transactionSubtype": "incoming",
      "amount": "100.5",
      "timestamp": 1713398400000
    }
  ],
  "offset": 0
}
```

---

### GET /v4/data/transactions/hash
Get transaction details by transaction hash.

**Credits**: 20 per API call

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
  - Example: `ethereum-mainnet`
- `hash` (required): Transaction hash
  - Type: string
  - Example: `0x1234567890abcdef...`

**Example Request**:
```bash
curl -X GET "https://api.tatum.io/v4/data/transactions/hash?chain=ethereum-mainnet&hash=0x1234567890abcdef..." \
  -H "x-api-key: YOUR_API_KEY"
```

---

### GET /v4/data/transactions/dna
Get transaction DNA (detailed analysis) for a transaction.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `hash` (required): Transaction hash
  - Type: string

---

## Token APIs

### GET /v4/data/tokens
Get information about a token (fungible, NFT, or multitoken collection).

**Credits**: 20 per API call

**Supported Chains**:
- Ethereum, Solana, Base, Arbitrum, BNB Smart Chain, Polygon, Optimism, Berachain, Unichain, Monad, Celo, Chiliz, Tezos

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
  - Example: `ethereum-mainnet`
- `tokenAddress` (required): Token contract address or 'native' for native currency
  - Type: string
  - Example: `0xdac17f958d2ee523a2206206994597c13d831ec7`
- `tokenId` (optional): Specific NFT token ID
  - Type: string

**Special Feature**: Use `tokenAddress=native` to get information about the chain's native currency (supported on mainnet for Ethereum, Polygon, Berachain, Celo, Tezos, Solana).

**Example Request**:
```bash
curl -X GET "https://api.tatum.io/v4/data/tokens?chain=ethereum-mainnet&tokenAddress=0xdac17f958d2ee523a2206206994597c13d831ec7" \
  -H "x-api-key: YOUR_API_KEY"
```

**Example Response (Fungible Token)**:
```json
{
  "type": "fungible",
  "name": "Tether USD",
  "symbol": "USDT",
  "decimals": 6,
  "totalSupply": "80000000000",
  "contractAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7"
}
```

---

### GET /v4/data/tokens/trending
Get trending tokens on a blockchain.

**Credits**: 20 per API call

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `pageSize` (optional): Items per page
  - Type: number
- `offset` (optional): Pagination offset
  - Type: number

---

### GET /v4/data/tokens/newest
Get newest tokens on a blockchain.

**Credits**: 20 per API call

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `pageSize` (optional): Items per page
  - Type: number
- `offset` (optional): Pagination offset
  - Type: number

---

### GET /v4/data/tokens/popular
Get popular tokens on a blockchain.

**Credits**: 20 per API call

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `pageSize` (optional): Items per page
  - Type: number
- `offset` (optional): Pagination offset
  - Type: number

---

### GET /v4/data/tokens/popular/history
Get historical popularity data for tokens.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `from` (required): Start timestamp
  - Type: number
- `to` (required): End timestamp
  - Type: number

---

## NFT APIs

### GET /v4/data/collections
Get all NFTs and multitokens from specified collections.

**Credits**: 20 per API call

**Supported Chains**:
- Ethereum, Base, Arbitrum, BNB Smart Chain, Polygon, Optimism, Berachain, Unichain, Monad, Celo, Chiliz, Tezos

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `collectionAddresses` (required): Comma-separated collection addresses
  - Type: string
- `excludeMetadata` (optional): Exclude metadata from response
  - Type: boolean
  - Default: false
- `pageSize` (optional): Items per page
  - Type: number
  - Default: 50
- `offset` (optional): Pagination offset
  - Type: number

**Example Request**:
```bash
curl -X GET "https://api.tatum.io/v4/data/collections?chain=ethereum-mainnet&collectionAddresses=0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d&pageSize=50" \
  -H "x-api-key: YOUR_API_KEY"
```

---

### GET /v4/data/metadata
Get metadata for a specific NFT.

**Credits**: 20 per API call

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `tokenAddress` (required): NFT contract address
  - Type: string
- `tokenId` (required): NFT token ID
  - Type: string

**Example Request**:
```bash
curl -X GET "https://api.tatum.io/v4/data/metadata?chain=ethereum-mainnet&tokenAddress=0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d&tokenId=1" \
  -H "x-api-key: YOUR_API_KEY"
```

---

### GET /v4/data/owners
Get all owners of tokens from a collection.

**Credits**: 20 per API call

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `tokenAddress` (required): Collection contract address
  - Type: string
- `pageSize` (optional): Items per page
  - Type: number
- `offset` (optional): Pagination offset
  - Type: number

---

### GET /v4/data/owners/address
Get all tokens owned by a specific address from a collection.

**Credits**: 20 per API call

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `tokenAddress` (required): Collection contract address
  - Type: string
- `ownerAddress` (required): Owner wallet address
  - Type: string

---

### GET /v4/data/nft/balances
Get NFT balances for a wallet address.

**Credits**: 20 per API call

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `address` (required): Wallet address
  - Type: string
- `pageSize` (optional): Items per page
  - Type: number
- `offset` (optional): Pagination offset
  - Type: number

---

### GET /v4/data/multitoken/balances
Get multitoken (ERC-1155) balances for a wallet address.

**Credits**: 20 per API call

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `address` (required): Wallet address
  - Type: string
- `pageSize` (optional): Items per page
  - Type: number
- `offset` (optional): Pagination offset
  - Type: number

---

## Blockchain APIs

### GET /v4/data/blockchains/block/current
Get current block number for a blockchain.

**Credits**: 10 per API call

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
  - Example: `ethereum-mainnet`

**Example Request**:
```bash
curl -X GET "https://api.tatum.io/v4/data/blockchains/block/current?chain=ethereum-mainnet" \
  -H "x-api-key: YOUR_API_KEY"
```

---

### GET /v4/data/blockchains/block
Get block details by block number.

**Credits**: 10 per API call

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `blockNumber` (required): Block number
  - Type: number

---

### GET /v4/data/blockchains/block/hash
Get block details by block hash.

**Credits**: 10 per API call

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `hash` (required): Block hash
  - Type: string

---

### GET /v4/data/blockchains/utxo/info
Get UTXO information for UTXO-based chains.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain (Bitcoin, Litecoin, Dogecoin, Cardano)
  - Type: string
- `hash` (required): Transaction hash
  - Type: string
- `index` (required): UTXO index
  - Type: number

---

### GET /v4/data/blockchains/mempool
Get mempool information for a blockchain.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string

---

### GET /v4/data/blockchains/transaction
Get transaction details from blockchain.

**Credits**: 10 per API call

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `hash` (required): Transaction hash
  - Type: string

---

### GET /v4/data/blockchains/transaction/internal
Get internal transactions (for EVM chains).

**Credits**: 20 per API call

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `hash` (required): Transaction hash
  - Type: string

---

### GET /v4/data/blockchains/balance
Get native balance for an address.

**Credits**: 10 per API call

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `address` (required): Wallet address
  - Type: string

**Example Request**:
```bash
curl -X GET "https://api.tatum.io/v4/data/blockchains/balance?chain=ethereum-mainnet&address=0x123..." \
  -H "x-api-key: YOUR_API_KEY"
```

---

### GET /v4/data/blockchains/balance/batch
Get native balances for multiple addresses in one request.

**Credits**: 10 per address

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
  - Example: `ethereum-mainnet`

- `addresses` (required): Comma-separated list of addresses
  - Type: string (comma-separated, NOT an array)
  - Maximum: 30 addresses (10 for Tron)
  - Example: `0x8ba1f109551bd432803012645ac136ddd64dba72,0xd6A7AC86DF3017A164d7d3991Fe76c9fdc8a4A61`

**Example Request**:
```javascript
const addresses = [
  '0x8ba1f109551bd432803012645ac136ddd64dba72',
  '0xd6A7AC86DF3017A164d7d3991Fe76c9fdc8a4A61'
].join(',');

const url = 'https://api.tatum.io/v4/data/blockchains/balance/batch?' + new URLSearchParams({
  chain: 'ethereum-mainnet',
  addresses: addresses
});

const response = await fetch(url, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY'
  }
});

const balances = await response.json();
```

**Example with curl**:
```bash
curl -X GET "https://api.tatum.io/v4/data/blockchains/balance/batch?chain=ethereum-mainnet&addresses=0x8ba1f109551bd432803012645ac136ddd64dba72,0xd6A7AC86DF3017A164d7d3991Fe76c9fdc8a4A61" \
  -H "x-api-key: YOUR_API_KEY"
```

---

### GET /v4/data/blockchains/transaction/count
Get transaction count (nonce) for an address.

**Credits**: 10 per API call

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `address` (required): Wallet address
  - Type: string

---

### GET /v4/data/blockchains/transaction/history/utxos
Get transaction history for UTXO-based chains (single address).

**Credits**: 20 per API call

**Supported Chains**: Bitcoin, Litecoin, Dogecoin, Cardano

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
  - Example: `bitcoin-mainnet`
- `address` (required): Wallet address
  - Type: string
- `txType` (optional): Transaction direction (not supported for Cardano)
  - Type: string
  - Enum: `incoming`, `outgoing`

**Example Request**:
```bash
curl -X GET "https://api.tatum.io/v4/data/blockchains/transaction/history/utxos?chain=bitcoin-mainnet&address=1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa&txType=incoming" \
  -H "x-api-key: YOUR_API_KEY"
```

---

### POST /v4/data/blockchains/transaction/history/utxos/batch
Get transaction history for UTXO-based chains for multiple addresses in one request.

**Credits**: 20 per address (e.g., 5 addresses = 100 credits)

**Supported Chains**: Bitcoin, Litecoin, Dogecoin, Cardano

**Limits**: Maximum 30 addresses per request

**Request Body**: Single object

**Body Parameters**:
- `chain` (required): The blockchain
  - Type: string
  - Example: `bitcoin-mainnet`
  - Enum: `bitcoin-mainnet`, `bitcoin-testnet`, `litecoin-mainnet`, `litecoin-testnet`, `doge-mainnet`, `doge-testnet`, `cardano-mainnet`, `cardano-preprod`
- `addresses` (required): Array of wallet addresses (min 1, max 30)
  - Type: array of strings
  - Example: `['btscca', 'abcacb', 'xyzxyz']`
- `txType` (optional): Transaction direction filter (NOT supported for Cardano)
  - Type: string
  - Enum: `incoming`, `outgoing`

**Response**: Array of objects, each containing:
- `address`: The requested address
- `transactions`: Array of transaction objects

**Complete JavaScript Example**:
```javascript
const getUtxoBatchHistory = async () => {
  const url = 'https://api.tatum.io/v4/data/blockchains/transaction/history/utxos/batch';

  const requestBody = {
    chain: 'bitcoin-mainnet',
    addresses: ['btscca', 'abcacb', 'xyzxyz'],
    txType: 'incoming' // Optional: filter by transaction type
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY'
    },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();
  console.log('UTXO transaction history:', data);
  return data;
};

// Example response:
// [
//   {
//     address: 'btscca',
//     transactions: [
//       { hash: '...', block: { number: 12345, hash: '...' }, inputs: [...], outputs: [...] }
//     ]
//   },
//   {
//     address: 'abcacb',
//     transactions: [...]
//   },
//   {
//     address: 'xyzxyz',
//     transactions: [...]
//   }
// ]

// Cardano-specific response format:
// [
//   {
//     address: 'addr1qywlx4v9sa7jplgdrjr2vjjdsjx509zenr4zt9w7gmn4cwga7d2ctpmayr7s68yx5e9ympydg729nx82yk2au3h8tsusqtczws',
//     transactions: [
//       {
//         block: { hash: 'cef055...', number: 13050937 },
//         hash: '121c14f0...',
//         inputs: [{ address: '...', symbol: 'ADA', value: '1456780', txHash: '...' }],
//         outputs: [{ address: '...', symbol: 'ADA', value: '1456780', index: 2, txHash: '...' }],
//         withdrawals: [{ address: 'stake1u...', symbol: 'ADA', value: '5323949', txHash: '...' }],
//         fee: '209479'
//       }
//     ]
//   }
// ]
```

**Important Notes**:
- Cardano returns a different response format with `inputs`, `outputs`, `withdrawals`, and `fee` fields
- `txType` filter is NOT available for Cardano chains
- Maximum 30 addresses per request

---

### GET /v4/data/utxos
Get unspent UTXOs for a single address.

**Credits**: 100 per API call

**Supported Chains**: Bitcoin, Litecoin, Dogecoin, Cardano

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
  - Example: `bitcoin-mainnet`
- `address` (required): Wallet address
  - Type: string
- `totalValue` (optional): Total amount needed for transaction
  - Type: number

**Example Request**:
```bash
curl -X GET "https://api.tatum.io/v4/data/utxos?chain=bitcoin-mainnet&address=1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa&totalValue=0.01" \
  -H "x-api-key: YOUR_API_KEY"
```

---

### POST /v4/data/utxos/batch
Get unspent UTXOs for multiple addresses up to a specified total amount.

**Credits**: 100 per address per API call

**Supported Chains**: Bitcoin, Litecoin, Dogecoin, Cardano

**Request Body**: Single object

**Body Parameters**:
- `chain` (required): The blockchain
  - Type: string
  - Example: `bitcoin-mainnet`
  - Enum: `bitcoin-mainnet`, `bitcoin-testnet`, `litecoin-mainnet`, `litecoin-testnet`, `doge-mainnet`, `doge-testnet`, `cardano-mainnet`, `cardano-preprod`
- `addresses` (required): Array of wallet addresses (min 1, max 50)
  - Type: array of strings
  - Example: `['abcabc', 'xyzxyz', 'oa12abc']`
- `totalValue` (required): Total transaction amount
  - Type: number
  - Description: Only UTXOs up to this amount will be returned, so you will not spend more than needed
  - Example: `0.01`

**Complete JavaScript Example**:
```javascript
const getUtxosBatch = async () => {
  const url = 'https://api.tatum.io/v4/data/utxos/batch';

  const requestBody = {
    addresses: ['abcabc', 'xyzxyz', 'oa12abc'],
    chain: 'bitcoin-mainnet',
    totalValue: 0.01
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY'
    },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();
  console.log('UTXOs:', data);
  return data;
};

// Example response:
// [
//   {
//     address: 'abcabc',
//     utxos: [
//       { txHash: '...', index: 0, value: 0.005, script: '...' },
//       { txHash: '...', index: 1, value: 0.003, script: '...' }
//     ]
//   },
//   {
//     address: 'xyzxyz',
//     utxos: [
//       { txHash: '...', index: 0, value: 0.002, script: '...' }
//     ]
//   },
//   {
//     address: 'oa12abc',
//     utxos: []
//   }
// ]
```

**Important Notes**:
- Bitcoin mainnet/testnet, Litecoin mainnet/testnet, Dogecoin mainnet/testnet support any amount of UTXOs per address
- The API returns only enough UTXOs to cover the `totalValue`, preventing overspending
- Useful for preparing transactions on UTXO-based chains

---

## DeFi APIs

### GET /v4/data/defi/events
Get DeFi events (swaps, liquidity adds/removes, etc.) for an address.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `address` (required): Wallet or contract address
  - Type: string
- `eventType` (optional): Filter by event type
  - Type: string
  - Enum: `swap`, `add_liquidity`, `remove_liquidity`
- `blockFrom` (optional): Start block
  - Type: number
- `blockTo` (optional): End block
  - Type: number
- `pageSize` (optional): Items per page
  - Type: number
- `offset` (optional): Pagination offset
  - Type: number

---

### GET /v4/data/defi/blocks
Get blocks with DeFi activity.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `from` (required): Start block
  - Type: number
- `to` (required): End block
  - Type: number

---

### GET /v4/data/defi/blocks/latest
Get the latest block with DeFi activity.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string

---

## Staking APIs

### GET /v4/data/staking/native/current-assets
Get current staked assets for a wallet address.

**Credits**: 100 per API call

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `address` (required): Wallet address
  - Type: string

**Example Request**:
```bash
curl -X GET "https://api.tatum.io/v4/data/staking/native/current-assets?chain=ethereum-mainnet&address=0x123..." \
  -H "x-api-key: YOUR_API_KEY"
```

---

### GET /v4/data/staking/native/current-assets-by-validator
Get current staked assets by validator.

**Credits**: 100 per API call

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `address` (required): Wallet address
  - Type: string
- `validator` (required): Validator address
  - Type: string

---

### GET /v4/data/staking/native/rewards
Get staking rewards for a wallet address.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `address` (required): Wallet address
  - Type: string
- `from` (optional): Start timestamp
  - Type: number
- `to` (optional): End timestamp
  - Type: number

---

### GET /v4/data/staking/native/transactions
Get staking transactions (stakes, unstakes, claims).

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `address` (required): Wallet address
  - Type: string
- `pageSize` (optional): Items per page
  - Type: number
- `offset` (optional): Pagination offset
  - Type: number

---

### GET /v4/data/staking/native/pools
Get information about native staking pools.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string

---

### GET /v4/data/staking/liquid/current-assets
Get current liquid staking positions.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `address` (required): Wallet address
  - Type: string

---

### GET /v4/data/staking/liquid/pools
Get information about liquid staking pools.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string

---

## Mining APIs

### GET /v4/data/mining/rewards
Get mining rewards for a wallet address.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `address` (required): Wallet address
  - Type: string
- `from` (optional): Start timestamp
  - Type: number
- `to` (optional): End timestamp
  - Type: number
- `pageSize` (optional): Items per page
  - Type: number
- `offset` (optional): Pagination offset
  - Type: number

---

### GET /v4/data/mining/totalRewards
Get total mining rewards for a wallet address.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `address` (required): Wallet address
  - Type: string

---

## Marketplace APIs

All marketplace APIs are under the `/v4/data/marketplace/cryptoslam/` prefix.

### GET /v4/data/marketplace/cryptoslam/token/price
Get current floor price for an NFT collection.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `collectionAddress` (required): NFT collection address
  - Type: string

---

### GET /v4/data/marketplace/cryptoslam/token/price/history
Get historical floor price data for an NFT collection.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `collectionAddress` (required): NFT collection address
  - Type: string
- `from` (required): Start timestamp
  - Type: number
- `to` (required): End timestamp
  - Type: number

---

### GET /v4/data/marketplace/cryptoslam/token/price/exotic
Get exotic pricing metrics for an NFT collection.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `collectionAddress` (required): NFT collection address
  - Type: string

---

### GET /v4/data/marketplace/cryptoslam/token/price/exotic/history
Get historical exotic pricing metrics.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `collectionAddress` (required): NFT collection address
  - Type: string
- `from` (required): Start timestamp
  - Type: number
- `to` (required): End timestamp
  - Type: number

---

### GET /v4/data/marketplace/cryptoslam/token/trades
Get NFT trades for a specific collection.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `collectionAddress` (required): NFT collection address
  - Type: string
- `pageSize` (optional): Items per page
  - Type: number
- `offset` (optional): Pagination offset
  - Type: number

---

### GET /v4/data/marketplace/cryptoslam/token/transfers
Get NFT transfers for a specific collection.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `collectionAddress` (required): NFT collection address
  - Type: string
- `pageSize` (optional): Items per page
  - Type: number
- `offset` (optional): Pagination offset
  - Type: number

---

### GET /v4/data/marketplace/cryptoslam/token/transfers/dna
Get transfer DNA (detailed analysis) for NFT transfers.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `collectionAddress` (required): NFT collection address
  - Type: string
- `tokenId` (required): NFT token ID
  - Type: string

---

### GET /v4/data/marketplace/cryptoslam/token/holder/reputation
Get reputation score for NFT holders.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `collectionAddress` (required): NFT collection address
  - Type: string
- `holderAddress` (required): Holder wallet address
  - Type: string

---

### GET /v4/data/marketplace/cryptoslam/chain/trades
Get all NFT trades on a blockchain.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `from` (optional): Start timestamp
  - Type: number
- `to` (optional): End timestamp
  - Type: number
- `pageSize` (optional): Items per page
  - Type: number
- `offset` (optional): Pagination offset
  - Type: number

---

### GET /v4/data/marketplace/cryptoslam/chain/trades/dna
Get trade DNA for chain-level trades.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `txHash` (required): Transaction hash
  - Type: string

---

### GET /v4/data/marketplace/cryptoslam/chain/transfers
Get all NFT transfers on a blockchain.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `from` (optional): Start timestamp
  - Type: number
- `to` (optional): End timestamp
  - Type: number
- `pageSize` (optional): Items per page
  - Type: number
- `offset` (optional): Pagination offset
  - Type: number

---

### GET /v4/data/marketplace/cryptoslam/chain/transfers/dna
Get transfer DNA for chain-level transfers.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `txHash` (required): Transaction hash
  - Type: string

---

### GET /v4/data/marketplace/cryptoslam/wallet/trades
Get NFT trades for a specific wallet.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `address` (required): Wallet address
  - Type: string
- `pageSize` (optional): Items per page
  - Type: number
- `offset` (optional): Pagination offset
  - Type: number

---

### GET /v4/data/marketplace/cryptoslam/wallet/trades/dna
Get trade DNA for wallet trades.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `address` (required): Wallet address
  - Type: string
- `txHash` (required): Transaction hash
  - Type: string

---

### GET /v4/data/marketplace/cryptoslam/wallet/transfers
Get NFT transfers for a specific wallet.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `address` (required): Wallet address
  - Type: string
- `pageSize` (optional): Items per page
  - Type: number
- `offset` (optional): Pagination offset
  - Type: number

---

### GET /v4/data/marketplace/cryptoslam/wallet/transfers/dna
Get transfer DNA for wallet transfers.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `address` (required): Wallet address
  - Type: string
- `txHash` (required): Transaction hash
  - Type: string

---

### GET /v4/data/marketplace/cryptoslam/pair/trades
Get NFT trades for a specific trading pair.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `collectionAddress` (required): NFT collection address
  - Type: string
- `tokenId` (required): NFT token ID
  - Type: string
- `pageSize` (optional): Items per page
  - Type: number
- `offset` (optional): Pagination offset
  - Type: number

---

### GET /v4/data/marketplace/cryptoslam/pair/trades/dna
Get trade DNA for pair trades.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `collectionAddress` (required): NFT collection address
  - Type: string
- `tokenId` (required): NFT token ID
  - Type: string
- `txHash` (required): Transaction hash
  - Type: string

---

## Fee Estimation APIs

### POST /v4/blockchainOperations/gas
Estimate gas price (wei) and units needed for a transaction across multiple blockchain networks.

**Credits**: 10 per API call

**Description**: Unified gas estimation endpoint that consolidates all supported chains into one endpoint.

**Supported Chains** (15):
- BNB Smart Chain (BSC)
- Celo (CELO)
- Elrond (EGLD)
- Ethereum (ETH)
- Harmony (ONE)
- Klaytn (KLAY)
- KuCoin Community Chain (KCS)
- Flare (FLR)
- Cronos (CRO)
- Avalanche (AVAX)
- Base (BASE)
- Polygon (POL_ETH)
- Optimism (OPTIMISM)
- Fantom (FTM)
- Sonic (S)

**Request Body**: Single object

**Body Parameters**:
- `chain` (required): Blockchain to estimate gas for
  - Type: string
  - Enum: `BSC`, `CELO`, `EGLD`, `ETH`, `ONE`, `KLAY`, `KCS`, `FLR`, `CRO`, `AVAX`, `BASE`, `POL_ETH`, `OPTIMISM`, `FTM`, `S`
  - Example: `ETH`

- `from` (required): Blockchain address of the sender
  - Type: string
  - Example: `0xfb99f8ae9b70a0c8cd96ae665bbaf85a7e01a2ef`

- `to` (required): Blockchain address of the recipient
  - Type: string
  - Example: `0x687422eEA2cB73B5d3e242bA5456b782919AFc85`

- `amount` (required): Amount to be sent
  - Type: string
  - Example: `100000`

- `data` (optional): Data to be sent to smart contract
  - Type: string
  - Example: `0x`

- `contractAddress` (optional): Contract address of the token (only for ETH)
  - Type: string
  - Example: `0x687422eEA2cB73B5d3e242bA5456b782919AFc85`

**Response**:
Returns an object with:
- `gasPrice`: The estimated price for one gas unit in wei (string)
- `gasLimit`: The number of gas units needed to process the transaction (string)

**Complete JavaScript Example**:
```javascript
const estimateGas = async () => {
  const url = 'https://api.tatum.io/v4/blockchainOperations/gas';

  const requestBody = {
    chain: 'ETH',
    from: '0xfb99f8ae9b70a0c8cd96ae665bbaf85a7e01a2ef',
    to: '0x687422eEA2cB73B5d3e242bA5456b782919AFc85',
    amount: '100000'
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY'
    },
    body: JSON.stringify(requestBody)
  });

  const gasEstimate = await response.json();
  console.log('Gas estimate:', gasEstimate);
  return gasEstimate;
};

// Example response:
// {
//   "gasPrice": "10000000000",
//   "gasLimit": "21000"
// }
```

**Example with ERC20 Token**:
```javascript
const requestBody = {
  chain: 'ETH',
  from: '0xfb99f8ae9b70a0c8cd96ae665bbaf85a7e01a2ef',
  to: '0x687422eEA2cB73B5d3e242bA5456b782919AFc85',
  amount: '1000',
  contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7' // USDT
};
```

---

## Web3 Name Service APIs

### GET /v4/data/ns/name
Resolve Web3 name service addresses (ENS, etc.).

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `name` (required): Web3 domain name
  - Type: string
  - Example: `vitalik.eth`

**Example Request**:
```bash
curl -X GET "https://api.tatum.io/v4/data/ns/name?chain=ethereum-mainnet&name=vitalik.eth" \
  -H "x-api-key: YOUR_API_KEY"
```

---

## Additional APIs

### GET /v4/data/block/time
Get block number at a specific timestamp.

**Credits**: Variable

**Query Parameters**:
- `chain` (required): The blockchain
  - Type: string
- `timestamp` (required): Unix timestamp
  - Type: number

---

## Common Query Parameters

The following parameters are commonly used across multiple endpoints:

### Pagination Parameters
- `pageSize`: Number of items per page (default: 50)
  - Type: number
  - Example: `100`
- `offset`: Pagination offset
  - Type: number
  - Example: `0`
- `cursor`: Cursor-based pagination (some endpoints)
  - Type: string

### Filter Parameters
- `excludeMetadata`: Exclude metadata from response
  - Type: boolean
  - Default: `false`

### Block Range Parameters
- `blockFrom`: Start block number
  - Type: number
- `blockTo`: End block number
  - Type: number

### Time Range Parameters
- `from`: Start timestamp (Unix epoch in milliseconds)
  - Type: number
- `to`: End timestamp (Unix epoch in milliseconds)
  - Type: number
- `timeFrom`: Start time (ISO 8601 format)
  - Type: string
  - Example: `2026-04-10T00:00:00Z`
- `timeTo`: End time (ISO 8601 format)
  - Type: string
  - Example: `2026-04-17T00:00:00Z`

---

## Supported Chains

The following chains are commonly supported across endpoints (exact support varies by endpoint):

### EVM Chains
- `ethereum-mainnet`, `ethereum-sepolia`, `ethereum-holesky`
- `base-mainnet`, `base-sepolia`
- `arbitrum-mainnet` (arb-one-mainnet), `arb-testnet`
- `bsc-mainnet`, `bsc-testnet` (BNB Smart Chain)
- `polygon-mainnet`, `polygon-amoy`
- `optimism-mainnet`, `optimism-testnet`
- `berachain-mainnet`
- `unichain-mainnet`, `unichain-sepolia`
- `monad-mainnet`, `monad-testnet`
- `celo-mainnet`, `celo-testnet`
- `chiliz-mainnet`
- `mocachain-devnet`

### Non-EVM Chains
- `solana-mainnet`, `solana-devnet`
- `tezos-mainnet`
- `bitcoin-mainnet`, `bitcoin-testnet`
- `litecoin-mainnet`, `litecoin-testnet`
- `doge-mainnet`, `doge-testnet` (Dogecoin)
- `cardano-mainnet`, `cardano-preprod`

---

## Error Responses

Common error response codes:

- **400 Bad Request**: Invalid parameters
- **401 Unauthorized**: Missing or invalid API key
- **403 Forbidden**: Insufficient permissions or credits
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

---

## Rate Limits and Credits

Each API endpoint consumes credits based on:
- Complexity of the operation
- Number of items processed (in batch endpoints)
- Amount of data returned

Refer to individual endpoint documentation for specific credit costs.

---

## Best Practices

1. **Batch Endpoints**: Use batch endpoints when querying multiple items to save on API calls and credits
2. **Pagination**: Always implement pagination for large datasets using `pageSize` and `offset`
3. **Filtering**: Use filters (`transactionTypes`, `tokenTypes`, etc.) to reduce response size and improve performance
4. **Block Ranges**: When using `blockFrom`/`blockTo`, keep ranges under 1000 blocks for optimal performance
5. **Error Handling**: Always check response status and handle errors appropriately
6. **Rate Limiting**: Implement exponential backoff for rate limit errors
7. **Caching**: Cache responses when appropriate to reduce API calls

---

## Additional Resources

- [Tatum API Documentation](https://apidoc.tatum.io/)
- [Tatum Dashboard](https://dashboard.tatum.io/)
- [Tatum GitHub](https://github.com/tatumio)

---

---

## Notification/Subscription APIs

The Notification/Subscription APIs allow you to create and manage webhook-based subscriptions for real-time blockchain event notifications. When a subscribed event occurs on-chain, Tatum sends an HTTP POST request to your specified webhook URL.

**Base URL**: `https://api.tatum.io`

**Authentication**: All endpoints require an API key passed via the `x-api-key` header.

**Credit Model**: 50 credits per sent notification + 50 credits per day per active subscription.

**Retry Policy**: If a webhook delivery fails (non-2xx response), retries follow exponential backoff: T = 15 * 2.7925^n seconds, where n is the retry attempt. Free plans get 3 retries; paid plans get 10 retries. The webhook recipient must respond with 2xx within 10 seconds. After all retries are exhausted, the webhook is removed.

**Free Plan Limits**: Monthly limit of 1,000 sent webhooks. Free community plans can monitor up to 10 addresses.

---

### V4 Subscription Types (Recommended)

The following subscription types are available for `POST /v4/subscription`:

| Type | Description |
|------|-------------|
| `ADDRESS_EVENT` | Any address-level transaction or event (incoming and outgoing, native and tokens) |
| `INCOMING_NATIVE_TX` | Incoming native currency transfers (ETH, MATIC, BNB, etc.) |
| `OUTGOING_NATIVE_TX` | Outgoing native currency transfers |
| `OUTGOING_FAILED_TX` | Failed outgoing transactions |
| `PAID_FEE` | Gas/fee payments for transactions |
| `INCOMING_INTERNAL_TX` | Incoming internal transactions (EVM only) |
| `OUTGOING_INTERNAL_TX` | Outgoing internal transactions (EVM only) |
| `INCOMING_FUNGIBLE_TX` | Incoming ERC-20/SPL/TRC-20 fungible token transfers |
| `OUTGOING_FUNGIBLE_TX` | Outgoing fungible token transfers |
| `INCOMING_NFT_TX` | Incoming NFT (ERC-721) transfers |
| `OUTGOING_NFT_TX` | Outgoing NFT transfers |
| `INCOMING_MULTITOKEN_TX` | Incoming multi-token (ERC-1155) transfers |
| `OUTGOING_MULTITOKEN_TX` | Outgoing multi-token transfers |
| `FAILED_TXS_PER_BLOCK` | Failed transactions per block |
| `CONTRACT_ADDRESS_LOG_EVENT` | Smart contract log events for a specific contract address |

---

### Supported Chains for V4 Subscriptions

The supported chains vary by subscription type. Below is the comprehensive list for `ADDRESS_EVENT` (the broadest type):

**EVM Chains**: `arb-one-mainnet`, `avax-mainnet`, `avax-testnet`, `base-mainnet`, `base-sepolia`, `berachain-mainnet`, `bsc-mainnet`, `bsc-testnet`, `celo-mainnet`, `celo-testnet`, `chiliz-mainnet`, `cro-mainnet`, `ethereum-holesky`, `ethereum-mainnet`, `ethereum-sepolia`, `fantom-mainnet`, `fantom-testnet`, `flare-coston`, `flare-coston2`, `flare-mainnet`, `flare-songbird`, `kaia-mainnet`, `kaia-kairos`, `klaytn-baobab`, `klaytn-cypress`, `mocachain-devnet`, `monad-testnet`, `optimism-mainnet`, `optimism-testnet`, `polygon-amoy`, `polygon-mainnet`, `tron-mainnet`, `tron-testnet`, `unichain-mainnet`

**Non-EVM Chains**: `bch-mainnet`, `bch-testnet`, `bitcoin-mainnet`, `bitcoin-testnet`, `doge-mainnet`, `doge-testnet`, `litecoin-core-mainnet`, `litecoin-core-testnet`, `ripple-mainnet`, `ripple-testnet`, `solana-devnet`, `solana-mainnet`, `tezos-mainnet`, `tezos-testnet`

**Notes on chain support by type**:
- `OUTGOING_FAILED_TX`, `PAID_FEE`: EVM chains only (no Bitcoin, Litecoin, Dogecoin, Solana, BCH, Ripple)
- `INCOMING_INTERNAL_TX`, `OUTGOING_INTERNAL_TX`: EVM chains only (no UTXO chains, no Solana, no Ripple, no BCH, no avax-testnet, no base-sepolia, no bsc-testnet, no fantom-testnet, no optimism-testnet)
- `INCOMING_MULTITOKEN_TX`, `OUTGOING_MULTITOKEN_TX`: EVM chains only (no Solana, Tezos, Tron, Ripple, or UTXO chains)
- `CONTRACT_ADDRESS_LOG_EVENT` (V4): EVM chains + Tezos + Tron (no UTXO chains, no Solana, no Ripple, no mocachain-devnet)

---

### POST /v4/subscription
Create a new webhook subscription for blockchain events.

**Credits**: 50 per sent notification + 50 per day per active subscription

**Summary**: Create a subscription

**Request Body** (JSON): One of the subscription type schemas below. All share a common structure:

**Common Body Parameters**:
- `type` (required): The subscription type
  - Type: string
  - Enum: `ADDRESS_EVENT`, `INCOMING_NATIVE_TX`, `OUTGOING_NATIVE_TX`, `OUTGOING_FAILED_TX`, `PAID_FEE`, `INCOMING_INTERNAL_TX`, `OUTGOING_INTERNAL_TX`, `INCOMING_FUNGIBLE_TX`, `OUTGOING_FUNGIBLE_TX`, `INCOMING_NFT_TX`, `OUTGOING_NFT_TX`, `INCOMING_MULTITOKEN_TX`, `OUTGOING_MULTITOKEN_TX`, `FAILED_TXS_PER_BLOCK`, `CONTRACT_ADDRESS_LOG_EVENT`
- `attr` (required): Attributes object (varies by type, see below)
- `mempool` (optional, ADDRESS_EVENT only): Include mempool transactions (BTC only)
  - Type: boolean
- `finality` (optional): Choose between speed and block confirmations. Only available on TRON and EVM.
  - Type: string
  - Enum: `confirmed`, `final`
- `templateId` (optional): Configure the response format. Only available on TRON and EVM.
  - Type: string
  - Enum: `enriched`, `enriched_with_raw_data`, `legacy`, or a custom template ID
  - Recommended: `enriched`

**Attributes by Subscription Type**:

**For ADDRESS_EVENT** (`AddressTransactionAttributesV4`):
- `attr.chain` (required): Blockchain identifier
  - Type: string
  - Example: `ethereum-mainnet`
- `attr.address` (required): Blockchain address to watch
  - Type: string
  - Min length: 13, Max length: 128
  - Example: `0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6`
- `attr.url` (required): Webhook endpoint URL
  - Type: string
  - Max length: 500
  - Example: `https://dashboard.tatum.io/webhook-handler`
- `attr.conditions` (optional): Array of filter conditions
  - Type: array of NotificationCondition objects

**For INCOMING_NATIVE_TX / OUTGOING_NATIVE_TX** (`NativeAttributes`):
- `attr.chain` (required): Blockchain identifier
- `attr.address` (required): Blockchain address to watch (min 13, max 128 chars)
- `attr.url` (required): Webhook endpoint URL (max 500 chars)
- `attr.conditions` (optional): Array of filter conditions

**For OUTGOING_FAILED_TX** (`FailedAttributes`):
- `attr.chain` (required): Blockchain identifier (EVM chains only)
- `attr.address` (required): Blockchain address to watch
- `attr.url` (required): Webhook endpoint URL
- `attr.conditions` (optional): Array of filter conditions

**For PAID_FEE** (`PaidFeeAttributes`):
- `attr.chain` (required): Blockchain identifier
- `attr.address` (required): Blockchain address to watch
- `attr.url` (required): Webhook endpoint URL
- `attr.conditions` (optional): Array of filter conditions

**For INCOMING_INTERNAL_TX / OUTGOING_INTERNAL_TX** (`InternalAttributes`):
- `attr.chain` (required): Blockchain identifier (EVM chains only)
- `attr.address` (required): Blockchain address to watch
- `attr.url` (required): Webhook endpoint URL
- `attr.conditions` (optional): Array of filter conditions

**For INCOMING_FUNGIBLE_TX / OUTGOING_FUNGIBLE_TX** (`FungibleAttributes`):
- `attr.chain` (required): Blockchain identifier
- `attr.address` (required): Blockchain address to watch
- `attr.url` (required): Webhook endpoint URL
- `attr.conditions` (optional): Array of filter conditions

**For INCOMING_NFT_TX / OUTGOING_NFT_TX** (`NftAttributes`):
- `attr.chain` (required): Blockchain identifier
- `attr.address` (required): Blockchain address to watch
- `attr.conditions` (optional): Array of filter conditions

**For INCOMING_MULTITOKEN_TX / OUTGOING_MULTITOKEN_TX** (`MultiTokenAttributes`):
- `attr.chain` (required): Blockchain identifier (EVM chains only)
- `attr.address` (required): Blockchain address to watch
- `attr.url` (required): Webhook endpoint URL
- `attr.conditions` (optional): Array of filter conditions

**For FAILED_TXS_PER_BLOCK** (`FailedTxsPerBlockAttributes`):
- `attr.chain` (required): Blockchain identifier
- `attr.address` (required): Blockchain address to watch
- `attr.url` (required): Webhook endpoint URL
- `attr.conditions` (optional): Array of filter conditions

**For CONTRACT_ADDRESS_LOG_EVENT** (`ContractAddressLogEventAttributesV4`):
- `attr.chain` (required): Blockchain identifier
- `attr.contractAddress` (required): Contract address to monitor
  - Type: string
  - Min length: 13, Max length: 128
  - Example: `0xA0b86a33E6441b8c4C8C0C8C0C8C0C8C0C8C0C8C0C`
- `attr.event` (required): Event signature hash to watch. For EVM chains, usually the keccak256 hash of the event signature. For Tezos, the event name.
  - Type: string
  - Max length: 66
  - Example: `0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef` (ERC-20 Transfer event)
- `attr.url` (required): Webhook endpoint URL
- `attr.conditions` (optional): Array of filter conditions

**NotificationCondition Schema** (used in `attr.conditions`):
Each condition object has:
- `field` (required): Field to evaluate
  - Type: string
  - Enum: `value`, `contractAddress`, `from`, `to`, `tokenId`, `tokenMetadata.type`, `tokenMetadata.symbol`
- `operator` (required): Comparison operator
  - Type: string
  - Enum: `>`, `>=`, `<`, `<=`, `==`, `!=`
- `value` (required): Value to compare against
  - Type: string

**Uniqueness Constraints**: Each subscription must be unique within your API key:
- Address subscriptions: unique by `type + chain + address + url`
- Contract log subscriptions: unique by `type + chain + contractAddress + event + url`
- Block subscriptions: unique by `type + chain + url`

**Response (200)**:
```json
{
  "id": "5e68c66581f2ee32bc354087"
}
```

**Error Responses**:
- 400: Bad Request
- 401: Unauthorized (missing/invalid API key)
- 403: Forbidden - possible errors:
  - `subscription.type.invalid` - Invalid subscription type
  - `subscription.attr.currency.invalid` - Invalid chain/currency
  - `subscription.attr.balance.invalid` - Invalid limit or typeOfBalance
  - `subscription.attr.interval.invalid` - Invalid interval
  - `subscription.attr.incoming.invalid` - Invalid id or url
  - `subscription.attr.pending.invalid` - Invalid id or url
- 500: Internal Server Error

**Complete JavaScript Example - Create ADDRESS_EVENT Subscription**:
```javascript
const createAddressEventSubscription = async () => {
  const url = 'https://api.tatum.io/v4/subscription';

  const requestBody = {
    type: 'ADDRESS_EVENT',
    attr: {
      chain: 'ethereum-mainnet',
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      url: 'https://your-server.com/webhook'
    },
    finality: 'confirmed',
    templateId: 'enriched'
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY'
    },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();
  console.log('Subscription created:', data);
  // Response: { "id": "5e68c66581f2ee32bc354087" }
  return data;
};
```

**Complete JavaScript Example - Create INCOMING_FUNGIBLE_TX Subscription with Conditions**:
```javascript
const createFungibleSubscription = async () => {
  const url = 'https://api.tatum.io/v4/subscription';

  const requestBody = {
    type: 'INCOMING_FUNGIBLE_TX',
    attr: {
      chain: 'ethereum-mainnet',
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      url: 'https://your-server.com/webhook',
      conditions: [
        {
          field: 'value',
          operator: '>=',
          value: '1000000000000000000' // >= 1 token (in wei)
        },
        {
          field: 'contractAddress',
          operator: '==',
          value: '0xdAC17F958D2ee523a2206206994597C13D831ec7' // USDT only
        }
      ]
    },
    finality: 'final',
    templateId: 'enriched'
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY'
    },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();
  console.log('Fungible subscription created:', data);
  return data;
};
```

**Complete JavaScript Example - Create CONTRACT_ADDRESS_LOG_EVENT Subscription**:
```javascript
const createContractLogSubscription = async () => {
  const url = 'https://api.tatum.io/v4/subscription';

  // Subscribe to ERC-20 Transfer events on a specific contract
  const requestBody = {
    type: 'CONTRACT_ADDRESS_LOG_EVENT',
    attr: {
      chain: 'ethereum-mainnet',
      contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
      event: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer(address,address,uint256)
      url: 'https://your-server.com/webhook'
    },
    finality: 'confirmed',
    templateId: 'enriched'
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY'
    },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();
  console.log('Contract log subscription created:', data);
  return data;
};
```

---

### GET /v4/subscription
List all active subscriptions.

**Credits**: 1 per API call

**Summary**: List all active subscriptions

**Query Parameters**:
- `pageSize` (required): Number of items per page
  - Type: number
  - Minimum: 1
  - Maximum: 50
  - Example: `10`
- `offset` (optional): Pagination offset
  - Type: number
  - Example: `0`
- `address` (optional): Filter subscriptions by address
  - Type: string

**Response (200)**: Array of subscription objects

**Response Schema** (`SubscriptionV4`):
```json
[
  {
    "type": "ADDRESS_EVENT",
    "id": "7c21ed165e294db78b95f0f1",
    "attr": {
      "chain": "ethereum-mainnet",
      "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      "url": "https://your-server.com/webhook"
    },
    "note": ""
  }
]
```

| Response Field | Type | Required | Description |
|----------------|------|----------|-------------|
| `type` | string | Yes | Subscription type (see SubscriptionType enum) |
| `id` | string | Yes | ID of the subscription |
| `attr` | object | No | Additional attributes based on subscription type |
| `note` | string | No | Any other relevant information such as important updates |

**Complete JavaScript Example**:
```javascript
const listSubscriptions = async () => {
  const params = new URLSearchParams({
    pageSize: '10',
    offset: '0'
  });

  const response = await fetch(`https://api.tatum.io/v4/subscription?${params}`, {
    method: 'GET',
    headers: {
      'x-api-key': 'YOUR_API_KEY'
    }
  });

  const subscriptions = await response.json();
  console.log('Active subscriptions:', subscriptions);
  return subscriptions;
};

// Filter by address
const listSubscriptionsByAddress = async (address) => {
  const params = new URLSearchParams({
    pageSize: '50',
    offset: '0',
    address: address
  });

  const response = await fetch(`https://api.tatum.io/v4/subscription?${params}`, {
    method: 'GET',
    headers: {
      'x-api-key': 'YOUR_API_KEY'
    }
  });

  const subscriptions = await response.json();
  console.log('Subscriptions for address:', subscriptions);
  return subscriptions;
};
```

---

### PUT /v4/subscription
Enable HMAC webhook digest for signature verification.

**Deprecated**: Yes (compatible with v3 Notifications; replace `v4` with `v3` in URL for v3)

**Summary**: Enable HMAC webhook digest

**Description**: Enable HMAC hash ID on fired webhooks. This allows you to verify that webhooks are genuinely sent by Tatum using HMAC SHA-512 signing.

**Request Body** (JSON):
- `hmacSecret` (required): Your HMAC secret password used for signing webhook payloads
  - Type: string
  - Max length: 100
  - Example: `1f7f7c0c-3906-4aa1-9dfe-4b67c43918f6`

**Response**: 204 No Content (success)

**HMAC Verification Steps**:
1. Extract the `x-payload-hash` header from the incoming webhook request
2. Stringify the webhook body as JSON without spaces: `JSON.stringify(req.body)`
3. Compute HMAC SHA-512 digest: `require('crypto').createHmac('sha512', hmacSecret).update(JSON.stringify(req.body)).digest('base64')`
4. Compare the `x-payload-hash` header value with your calculated Base64 digest

**Complete JavaScript Example**:
```javascript
// Enable HMAC on your subscriptions
const enableHmac = async () => {
  const response = await fetch('https://api.tatum.io/v4/subscription', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY'
    },
    body: JSON.stringify({
      hmacSecret: '1f7f7c0c-3906-4aa1-9dfe-4b67c43918f6'
    })
  });

  if (response.status === 204) {
    console.log('HMAC enabled successfully');
  }
};

// Verify HMAC on incoming webhook (Express.js example)
const crypto = require('crypto');

const verifyWebhook = (req, hmacSecret) => {
  const payloadHash = req.headers['x-payload-hash'];
  const computedHash = crypto
    .createHmac('sha512', hmacSecret)
    .update(JSON.stringify(req.body))
    .digest('base64');
  return payloadHash === computedHash;
};
```

---

### DELETE /v4/subscription
Disable HMAC webhook digest.

**Deprecated**: Yes (compatible with v3 Notifications; replace `v4` with `v3` for v3)

**Summary**: Disable HMAC webhook digest

**No request body required.**

**Response**: 204 No Content (success)

**Complete JavaScript Example**:
```javascript
const disableHmac = async () => {
  const response = await fetch('https://api.tatum.io/v4/subscription', {
    method: 'DELETE',
    headers: {
      'x-api-key': 'YOUR_API_KEY'
    }
  });

  if (response.status === 204) {
    console.log('HMAC disabled successfully');
  }
};
```

---

### GET /v4/subscription/count
Get count of active subscriptions matching filter criteria.

**Deprecated**: Yes (compatible with v3; replace `v4` with `v3` for v3)

**Credits**: 1 per API call

**Summary**: Count of subscriptions

**Query Parameters**:
- `pageSize` (required): Max number of items per page
  - Type: number
  - Minimum: 1
  - Maximum: 50
  - Example: `10`
- `offset` (optional): Pagination offset
  - Type: number
  - Example: `0`
- `address` (optional): Filter by address
  - Type: string

**Response (200)**: EntitiesCount object
```json
{
  "count": 25
}
```

**Complete JavaScript Example**:
```javascript
const getSubscriptionCount = async () => {
  const params = new URLSearchParams({
    pageSize: '50',
    offset: '0'
  });

  const response = await fetch(`https://api.tatum.io/v4/subscription/count?${params}`, {
    method: 'GET',
    headers: {
      'x-api-key': 'YOUR_API_KEY'
    }
  });

  const data = await response.json();
  console.log('Total subscriptions:', data.count);
  return data;
};
```

---

### PUT /v4/subscription/{id}
Update an existing subscription.

**Deprecated**: Yes (compatible with v3; replace `v4` with `v3` for v3)

**Summary**: Update subscription

**Path Parameters**:
- `id` (required): Subscription ID
  - Type: string
  - Example: `5e68c66581f2ee32bc354087`

**Request Body** (JSON, all fields optional):
- `url` (optional): New webhook endpoint URL
  - Type: string
  - Max length: 500
  - Example: `https://dashboard.tatum.io/webhook-handler`
- `mempool` (optional): Include mempool transactions (BTC only)
  - Type: boolean
- `paused` (optional): Pause or resume the subscription
  - Type: boolean
- `conditions` (optional): Array of NotificationCondition objects
  - Each with `field`, `operator`, `value` (see NotificationCondition schema above)
- `finality` (optional): Choose between speed and block confirmations (TRON and EVM only)
  - Type: string
  - Enum: `confirmed`, `final`
- `templateId` (optional): Configure the response format (TRON and EVM only)
  - Type: string
  - Enum: `enriched`, `enriched_with_raw_data`, `legacy`, or custom template ID

**Response**: 204 No Content (success)

**Complete JavaScript Example**:
```javascript
const updateSubscription = async (subscriptionId) => {
  const response = await fetch(`https://api.tatum.io/v4/subscription/${subscriptionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY'
    },
    body: JSON.stringify({
      url: 'https://your-new-server.com/webhook',
      paused: false,
      finality: 'final',
      templateId: 'enriched',
      conditions: [
        {
          field: 'value',
          operator: '>=',
          value: '1000000000000000000'
        }
      ]
    })
  });

  if (response.status === 204) {
    console.log('Subscription updated successfully');
  }
};
```

---

### DELETE /v4/subscription/{id}
Cancel an existing subscription.

**Deprecated**: Yes (compatible with v3; replace `v4` with `v3` for v3)

**Summary**: Cancel existing subscription

**Path Parameters**:
- `id` (required): Subscription ID
  - Type: string
  - Example: `5e68c66581f2ee32bc354087`

**Response**: 204 No Content (success)

**Complete JavaScript Example**:
```javascript
const deleteSubscription = async (subscriptionId) => {
  const response = await fetch(`https://api.tatum.io/v4/subscription/${subscriptionId}`, {
    method: 'DELETE',
    headers: {
      'x-api-key': 'YOUR_API_KEY'
    }
  });

  if (response.status === 204) {
    console.log('Subscription deleted successfully');
  }
};
```

---

### PUT /v4/subscription/batch
Update all subscriptions for a specified chain.

**Summary**: Update subscriptions by chain

**Query Parameters**:
- `chain` (required): The blockchain to filter by
  - Type: string
  - Example: `tron-mainnet`
- `url` (optional): New webhook URL for all matching subscriptions
  - Type: string
  - Max length: 500
  - Example: `https://dashboard.tatum.io/webhook-handler`
- `finality` (optional): Finality setting (only available on TRON and EVM)
  - Type: string
  - Enum: `confirmed`, `final`

**Response**: 204 No Content (success)

**Complete JavaScript Example**:
```javascript
const updateSubscriptionsByChain = async () => {
  const params = new URLSearchParams({
    chain: 'ethereum-mainnet',
    url: 'https://your-new-server.com/webhook',
    finality: 'final'
  });

  const response = await fetch(`https://api.tatum.io/v4/subscription/batch?${params}`, {
    method: 'PUT',
    headers: {
      'x-api-key': 'YOUR_API_KEY'
    }
  });

  if (response.status === 204) {
    console.log('All subscriptions for chain updated');
  }
};
```

---

### GET /v4/subscription/webhook
List all executed webhooks.

**Deprecated**: Yes (compatible with v3; replace `v4` with `v3` for v3)

**Credits**: 1 per API call

**Summary**: List all executed webhooks

**Query Parameters**:
- `pageSize` (required): Max number of items per page
  - Type: number
  - Minimum: 1
  - Maximum: 50
  - Example: `10`
- `offset` (optional): Pagination offset
  - Type: number
  - Example: `0`
- `direction` (optional): Sorting direction
  - Type: string
  - Enum: `asc`, `desc`
  - Example: `asc`
- `failed` (optional): Filter by success/failure status
  - Type: boolean
  - Example: `false`

**Response (200)**: Array of WebHook objects

**Response Schema** (`WebHookV4`):
```json
[
  {
    "type": "ADDRESS_EVENT",
    "id": "7c21ed165e294db78b95f0f1",
    "subscriptionId": "7c21ed165e294db78b95f0f1",
    "url": "https://your-server.com/webhook",
    "data": { },
    "nextTime": 1653320900353,
    "timestamp": 1653320900353,
    "retryCount": 3,
    "failed": false,
    "response": {
      "code": 200,
      "data": "OK",
      "networkError": false
    },
    "note": ""
  }
]
```

| Response Field | Type | Required | Description |
|----------------|------|----------|-------------|
| `type` | string | Yes | Subscription type |
| `id` | string | Yes | ID of the webhook |
| `subscriptionId` | string | Yes | ID of the subscription that triggered this webhook |
| `url` | string | Yes | Webhook endpoint URL |
| `data` | object | Yes | Webhook payload data |
| `nextTime` | number | No | Next retry execution time (Unix timestamp ms) |
| `timestamp` | number | No | Webhook execution time (Unix timestamp ms) |
| `retryCount` | number | No | Number of retry attempts |
| `failed` | boolean | Yes | Whether this webhook delivery failed |
| `response` | object | Yes | Response details from webhook endpoint |
| `response.code` | number | No | HTTP status code from endpoint |
| `response.data` | string | No | Response body from endpoint |
| `response.networkError` | boolean | Yes | Whether error was a network error |
| `note` | string | No | Any other relevant information |

**Complete JavaScript Example**:
```javascript
const listWebhooks = async () => {
  const params = new URLSearchParams({
    pageSize: '10',
    offset: '0',
    direction: 'desc',
    failed: 'false'
  });

  const response = await fetch(`https://api.tatum.io/v4/subscription/webhook?${params}`, {
    method: 'GET',
    headers: {
      'x-api-key': 'YOUR_API_KEY'
    }
  });

  const webhooks = await response.json();
  console.log('Executed webhooks:', webhooks);
  return webhooks;
};

// List only failed webhooks
const listFailedWebhooks = async () => {
  const params = new URLSearchParams({
    pageSize: '50',
    offset: '0',
    direction: 'desc',
    failed: 'true'
  });

  const response = await fetch(`https://api.tatum.io/v4/subscription/webhook?${params}`, {
    method: 'GET',
    headers: {
      'x-api-key': 'YOUR_API_KEY'
    }
  });

  const failedWebhooks = await response.json();
  console.log('Failed webhooks:', failedWebhooks);
  return failedWebhooks;
};
```

---

### GET /v4/subscription/webhook/count
Get count of executed webhooks matching filter criteria.

**Deprecated**: Yes (compatible with v3; replace `v4` with `v3` for v3)

**Credits**: 1 per API call

**Summary**: Count of found entities for get webhook request

**Query Parameters**:
- `pageSize` (required): Max number of items per page
  - Type: number
  - Minimum: 1
  - Maximum: 50
  - Example: `10`
- `offset` (optional): Pagination offset
  - Type: number
  - Example: `0`
- `direction` (optional): Sorting direction
  - Type: string
  - Enum: `asc`, `desc`
  - Example: `asc`
- `failed` (optional): Filter by success/failure status
  - Type: boolean
  - Example: `false`

**Response (200)**: EntitiesCount object
```json
{
  "count": 150
}
```

**Complete JavaScript Example**:
```javascript
const getWebhookCount = async () => {
  const params = new URLSearchParams({
    pageSize: '50',
    offset: '0'
  });

  const response = await fetch(`https://api.tatum.io/v4/subscription/webhook/count?${params}`, {
    method: 'GET',
    headers: {
      'x-api-key': 'YOUR_API_KEY'
    }
  });

  const data = await response.json();
  console.log('Total webhooks:', data.count);
  return data;
};
```

---

### POST /v4/subscription/template
Create a custom notification template to control webhook payload format.

**Summary**: Create a notification template (V4)

**Description**: Create a custom notification template. You can then use its ID as `templateId` when creating or updating subscriptions. Only available on TRON and EVM.

**Request Body** (JSON): One of the following template formats:

**String Template** (`StringNotificationTemplate`):
- `format` (required): Template format
  - Type: string
  - Enum: `string`
- `message` (required): Notification message using available template properties
  - Type: string
  - Example: `{{from}} sent {{value}} {{tokenMetadata.symbol}} to {{to}}`

**JSON Template** (`JSONNotificationTemplate`):
- `format` (required): Template format
  - Type: string
  - Enum: `json`
- `keys` (required): Mapping of custom field names (keys) to available properties (values)
  - Type: object (additionalProperties)
  - Available property values: `kind`, `blockHash`, `blockNumber`, `blockTimestamp`, `txId`, `txTimestamp`, `from`, `to`, `value`, `currency`, `contractAddress`, `tokenId`, `logIndex`, `tokenMetadata`, `tokenMetadata.type`, `tokenMetadata.symbol`, `tokenMetadata.name`, `tokenMetadata.decimals`, `tokenMetadata.uri`, `subscriptionId`, `subscriptionType`, `type`, `address`, `counterAddress`, `amount`, `metadataURI`, `additionalData`, `topic_0`, `topic_1`, `topic_2`, `topic_3`, `data`

**Response (200)**:
```json
{
  "id": "5e68c66581f2ee32bc354087"
}
```

**Complete JavaScript Example - String Template**:
```javascript
const createStringTemplate = async () => {
  const response = await fetch('https://api.tatum.io/v4/subscription/template', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY'
    },
    body: JSON.stringify({
      format: 'string',
      message: '{{from}} sent {{value}} {{tokenMetadata.symbol}} to {{to}}'
    })
  });

  const data = await response.json();
  console.log('Template created:', data);
  // Response: { "id": "5e68c66581f2ee32bc354087" }
  return data;
};
```

**Complete JavaScript Example - JSON Template**:
```javascript
const createJsonTemplate = async () => {
  const response = await fetch('https://api.tatum.io/v4/subscription/template', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY'
    },
    body: JSON.stringify({
      format: 'json',
      keys: {
        sender: 'from',
        recipient: 'to',
        amount: 'value',
        token: 'tokenMetadata.symbol',
        transactionHash: 'txId',
        block: 'blockNumber',
        contract: 'contractAddress',
        nftId: 'tokenId'
      }
    })
  });

  const data = await response.json();
  console.log('JSON template created:', data);
  return data;
};
```

---

### GET /v4/subscription/template
List all custom notification templates.

**Summary**: List all notification templates (V4)

**Query Parameters**:
- `pageSize` (required): Max number of items per page
  - Type: number
  - Minimum: 1
  - Maximum: 50
  - Example: `10`
- `offset` (optional): Pagination offset
  - Type: number
  - Example: `0`

**Response (200)**: Array of NotificationTemplate objects
```json
[
  {
    "id": "7c21ed165e294db78b95f0f1",
    "format": "json",
    "keys": {
      "sender": "from",
      "recipient": "to",
      "amount": "value"
    }
  }
]
```

**Complete JavaScript Example**:
```javascript
const listTemplates = async () => {
  const params = new URLSearchParams({
    pageSize: '10',
    offset: '0'
  });

  const response = await fetch(`https://api.tatum.io/v4/subscription/template?${params}`, {
    method: 'GET',
    headers: {
      'x-api-key': 'YOUR_API_KEY'
    }
  });

  const templates = await response.json();
  console.log('Notification templates:', templates);
  return templates;
};
```

---

### GET /v4/subscription/template/default
Get the default notification template for the current API key.

**Summary**: Get the default notification template

**Description**: This template is used for subscriptions that do not have an explicit `templateId` set.

**No query parameters.**

**Response (200)**:
```json
{
  "templateId": "enriched"
}
```

| Response Field | Type | Required | Description |
|----------------|------|----------|-------------|
| `templateId` | string | Yes | The resolved default template ID for the current API key |

**Complete JavaScript Example**:
```javascript
const getDefaultTemplate = async () => {
  const response = await fetch('https://api.tatum.io/v4/subscription/template/default', {
    method: 'GET',
    headers: {
      'x-api-key': 'YOUR_API_KEY'
    }
  });

  const data = await response.json();
  console.log('Default template:', data.templateId);
  return data;
};
```

---

### PUT /v4/subscription/template/default
Update the default notification template for the current API key.

**Summary**: Update the default notification template

**Description**: Accepts `enriched`, `enriched_with_raw_data`, or a custom template ID. Custom template must exist. Deprecated `legacy` is also accepted.

**Request Body** (JSON):
- `templateId` (required): A built-in template name or a custom template ID
  - Type: string
  - Example: `enriched`

**Response**: 200 OK

**Complete JavaScript Example**:
```javascript
const setDefaultTemplate = async () => {
  const response = await fetch('https://api.tatum.io/v4/subscription/template/default', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY'
    },
    body: JSON.stringify({
      templateId: 'enriched'
    })
  });

  if (response.ok) {
    console.log('Default template updated to enriched');
  }
};
```

---

### PUT /v4/subscription/template/{id}
Update an existing notification template.

**Summary**: Update notification template (V4)

**Path Parameters**:
- `id` (required): Notification template ID
  - Type: string
  - Example: `5e68c66581f2ee32bc354087`

**Request Body** (JSON): Same as POST /v4/subscription/template (StringNotificationTemplate or JSONNotificationTemplate)

**Response**: 204 No Content (success)

**Complete JavaScript Example**:
```javascript
const updateTemplate = async (templateId) => {
  const response = await fetch(`https://api.tatum.io/v4/subscription/template/${templateId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY'
    },
    body: JSON.stringify({
      format: 'json',
      keys: {
        sender: 'from',
        recipient: 'to',
        amount: 'value',
        token: 'tokenMetadata.symbol',
        txHash: 'txId',
        blockNum: 'blockNumber'
      }
    })
  });

  if (response.status === 204) {
    console.log('Template updated successfully');
  }
};
```

---

### DELETE /v4/subscription/template/{id}
Delete a notification template and remove it from all subscriptions using it.

**Summary**: Delete notification template (V4)

**Description**: If the template is used as the default for the account, the system default (`enriched`) will be set instead.

**Path Parameters**:
- `id` (required): Notification template ID
  - Type: string
  - Example: `5e68c66581f2ee32bc354087`

**Response**: 204 No Content (success)

**Complete JavaScript Example**:
```javascript
const deleteTemplate = async (templateId) => {
  const response = await fetch(`https://api.tatum.io/v4/subscription/template/${templateId}`, {
    method: 'DELETE',
    headers: {
      'x-api-key': 'YOUR_API_KEY'
    }
  });

  if (response.status === 204) {
    console.log('Template deleted successfully');
  }
};
```

---

### Notification Filtering (Conditions)

Filter webhook notifications using conditions to receive only the events that matter to your application. Conditions are available on **v4 subscriptions only**.

Add a `conditions` array inside the `attr` object when creating a subscription via `POST /v4/subscription`.

#### Condition Structure

Each condition is an object with three properties:

| Property | Type | Description |
|----------|------|-------------|
| `field` | string | The webhook payload field to evaluate |
| `operator` | string | The comparison operator |
| `value` | string | The value to compare against (always a string) |

When multiple conditions are provided, **all** must match (AND logic). If any condition fails, the notification is not sent.

#### Available Fields

| Field | Description | Example Use Case |
|-------|-------------|------------------|
| `value` | Transfer amount in the chain's smallest unit (e.g. wei for ETH, lamports for SOL) | Only notify for transfers above a threshold |
| `contractAddress` | Token contract address (ERC-20 / ERC-721 / ERC-1155) | Only notify for a specific token |
| `from` | Sender address | Only notify when a specific wallet sends |
| `to` | Receiver address | Only notify when a specific wallet receives |
| `tokenId` | Token ID (ERC-721 / ERC-1155) | Track a specific NFT |
| `tokenMetadata.type` | Token type: `native`, `fungible`, `nft`, `multitoken` | Only notify for NFT transfers |
| `tokenMetadata.symbol` | Token symbol (e.g. `USDT`, `WETH`) | Only notify for a specific token symbol |

#### Available Operators

| Operator | Meaning |
|----------|---------|
| `>` | Greater than |
| `>=` | Greater than or equal to |
| `<` | Less than |
| `<=` | Less than or equal to |
| `==` | Equal to |
| `!=` | Not equal to |

**Important - Raw amounts in smallest unit:**
- 1 ETH = `"1000000000000000000"` (18 decimals)
- 1 USDT = `"1000000"` (6 decimals)
- 1 SOL = `"1000000000"` (9 decimals)
- Always pass the value as a **string**, not a number

#### Supported Subscription Types

Conditions work with **all v4 address-based subscription types**:

`ADDRESS_EVENT`, `INCOMING_NATIVE_TX`, `OUTGOING_NATIVE_TX`, `INCOMING_FUNGIBLE_TX`, `OUTGOING_FUNGIBLE_TX`, `INCOMING_NFT_TX`, `OUTGOING_NFT_TX`, `INCOMING_MULTITOKEN_TX`, `OUTGOING_MULTITOKEN_TX`, `INCOMING_INTERNAL_TX`, `OUTGOING_INTERNAL_TX`, `OUTGOING_FAILED_TX`, `PAID_FEE`, `FAILED_TXS_PER_BLOCK`, `CONTRACT_ADDRESS_LOG_EVENT`

#### Example: Filter by transfer amount (> 1 ETH)

```json
{
  "type": "ADDRESS_EVENT",
  "attr": {
    "chain": "ethereum-mainnet",
    "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "url": "https://your-app.com/webhook",
    "conditions": [
      {
        "field": "value",
        "operator": ">",
        "value": "1000000000000000000"
      }
    ]
  }
}
```

#### Example: Filter by token contract (USDT only)

```json
{
  "type": "INCOMING_FUNGIBLE_TX",
  "attr": {
    "chain": "ethereum-mainnet",
    "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "url": "https://your-app.com/webhook",
    "conditions": [
      {
        "field": "contractAddress",
        "operator": "==",
        "value": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
      }
    ]
  }
}
```

#### Example: Filter by token type (NFT only)

```json
{
  "type": "ADDRESS_EVENT",
  "attr": {
    "chain": "ethereum-mainnet",
    "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "url": "https://your-app.com/webhook",
    "conditions": [
      {
        "field": "tokenMetadata.type",
        "operator": "==",
        "value": "nft"
      }
    ]
  }
}
```

#### Example: Filter by sender

```json
{
  "type": "INCOMING_NATIVE_TX",
  "attr": {
    "chain": "ethereum-mainnet",
    "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "url": "https://your-app.com/webhook",
    "conditions": [
      {
        "field": "from",
        "operator": "==",
        "value": "0x8ba1f109551bD432803012645Ac136Ddd64DBA72"
      }
    ]
  }
}
```

#### Example: Combine multiple conditions (AND logic)

Only notify for incoming USDT transfers above 1,000 USDT:

```json
{
  "type": "INCOMING_FUNGIBLE_TX",
  "attr": {
    "chain": "ethereum-mainnet",
    "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "url": "https://your-app.com/webhook",
    "conditions": [
      {
        "field": "contractAddress",
        "operator": "==",
        "value": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
      },
      {
        "field": "value",
        "operator": ">=",
        "value": "1000000000"
      }
    ]
  }
}
```

Both conditions must match. If the transfer is USDT but below 1,000 USDT, no notification is sent.

#### Updating Conditions

Update conditions on an existing subscription using `PUT /v4/subscription/{id}`:

```json
{
  "conditions": [
    {
      "field": "value",
      "operator": ">=",
      "value": "5000000000000000000"
    }
  ]
}
```

Passing a new `conditions` array **replaces** all existing conditions. To remove all conditions, pass an empty array `[]`.

#### Best Practices

- **Use the most specific subscription type.** Instead of `ADDRESS_EVENT` with a `tokenMetadata.type == "fungible"` condition, prefer `INCOMING_FUNGIBLE_TX` - it's more efficient
- **Combine conditions to reduce noise.** Filter by both contract address and minimum amount to receive only high-value transfers for a specific token
- **Use raw units carefully.** Always verify the token's decimal count before setting amount thresholds
- **Use different webhook URLs** to monitor the same address with different filter configurations

---

### Webhook Payload Examples

#### Enriched Template Payload (Recommended for V4)

When using `templateId: "enriched"`, the webhook POST body looks like:
```json
{
  "data": {
    "kind": "transfer",
    "blockHash": "0x1234567890abcdef...",
    "blockNumber": 18500000,
    "blockTimestamp": 1699123456,
    "txId": "0xabcdef1234567890...",
    "currency": "ETH",
    "txTimestamp": 1699123456,
    "from": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "to": "0x8ba1f109551bD432803012645Hac136c",
    "value": "1000000000000000000",
    "contractAddress": "0xA0b86a33E6441b8c4C8C0C8C0C8C0C8C0C8C0C8C0C",
    "tokenId": "12345",
    "additionalData": {
      "gasUsed": "21000",
      "gasPrice": "20000000000"
    },
    "tokenMetadata": {
      "type": "nft",
      "decimals": 0,
      "symbol": "NFT",
      "name": "My NFT",
      "uri": "https://api.example.com/metadata/12345"
    },
    "subscriptionId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "subscriptionType": "ADDRESS_EVENT"
  },
  "location": "...",
  "scheme": "..."
}
```

---

### End-to-End JavaScript Examples

#### Full Workflow: Create, List, Update, and Delete a Subscription

```javascript
// 1. Create a webhook subscription
const createSubscription = async () => {
  const response = await fetch('https://api.tatum.io/v4/subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY'
    },
    body: JSON.stringify({
      type: 'ADDRESS_EVENT',
      attr: {
        chain: 'ethereum-mainnet',
        address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        url: 'https://your-server.com/webhook'
      },
      finality: 'confirmed',
      templateId: 'enriched'
    })
  });
  const data = await response.json();
  console.log('Created subscription ID:', data.id);
  return data.id;
};

// 2. List all subscriptions
const listAllSubscriptions = async () => {
  const response = await fetch('https://api.tatum.io/v4/subscription?pageSize=50&offset=0', {
    method: 'GET',
    headers: { 'x-api-key': 'YOUR_API_KEY' }
  });
  const subscriptions = await response.json();
  console.log(`Found ${subscriptions.length} subscriptions`);
  return subscriptions;
};

// 3. Update a subscription (change URL, enable conditions)
const updateExistingSubscription = async (subscriptionId) => {
  const response = await fetch(`https://api.tatum.io/v4/subscription/${subscriptionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY'
    },
    body: JSON.stringify({
      url: 'https://your-new-server.com/webhook',
      finality: 'final',
      templateId: 'enriched',
      conditions: [
        { field: 'value', operator: '>=', value: '1000000000000000000' }
      ]
    })
  });
  console.log('Update status:', response.status); // 204 = success
};

// 4. Enable HMAC verification
const enableHmacVerification = async () => {
  const response = await fetch('https://api.tatum.io/v4/subscription', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY'
    },
    body: JSON.stringify({
      hmacSecret: 'your-secret-key-here'
    })
  });
  console.log('HMAC enabled:', response.status); // 204 = success
};

// 5. Delete a subscription
const cancelSubscription = async (subscriptionId) => {
  const response = await fetch(`https://api.tatum.io/v4/subscription/${subscriptionId}`, {
    method: 'DELETE',
    headers: { 'x-api-key': 'YOUR_API_KEY' }
  });
  console.log('Delete status:', response.status); // 204 = success
};

// Run the full workflow
(async () => {
  const subId = await createSubscription();
  await listAllSubscriptions();
  await updateExistingSubscription(subId);
  await enableHmacVerification();
  await cancelSubscription(subId);
})();
```

#### Webhook Handler Server (Express.js)

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const HMAC_SECRET = 'your-secret-key-here';

// Middleware to verify HMAC signature
const verifyHmac = (req, res, next) => {
  const payloadHash = req.headers['x-payload-hash'];
  if (!payloadHash) {
    return next(); // No HMAC enabled, skip verification
  }

  const computedHash = crypto
    .createHmac('sha512', HMAC_SECRET)
    .update(JSON.stringify(req.body))
    .digest('base64');

  if (payloadHash !== computedHash) {
    return res.status(401).json({ error: 'Invalid HMAC signature' });
  }
  next();
};

// Webhook handler endpoint
app.post('/webhook', verifyHmac, (req, res) => {
  const { data } = req.body;

  console.log('Received webhook:');
  console.log('  Type:', data.subscriptionType);
  console.log('  From:', data.from);
  console.log('  To:', data.to);
  console.log('  Value:', data.value);
  console.log('  TX ID:', data.txId);
  console.log('  Block:', data.blockNumber);

  if (data.tokenMetadata) {
    console.log('  Token:', data.tokenMetadata.symbol, data.tokenMetadata.name);
  }

  // Process the webhook data...
  // IMPORTANT: Respond with 2xx within 10 seconds
  res.status(200).json({ received: true });
});

app.listen(3000, () => {
  console.log('Webhook server listening on port 3000');
});
```

#### Monitor Multiple Addresses on Multiple Chains

```javascript
const monitorAddresses = async () => {
  const subscriptions = [
    {
      type: 'ADDRESS_EVENT',
      attr: {
        chain: 'ethereum-mainnet',
        address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        url: 'https://your-server.com/webhook'
      },
      templateId: 'enriched'
    },
    {
      type: 'INCOMING_FUNGIBLE_TX',
      attr: {
        chain: 'polygon-mainnet',
        address: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
        url: 'https://your-server.com/webhook'
      },
      templateId: 'enriched'
    },
    {
      type: 'INCOMING_NATIVE_TX',
      attr: {
        chain: 'bsc-mainnet',
        address: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
        url: 'https://your-server.com/webhook'
      },
      templateId: 'enriched'
    },
    {
      type: 'ADDRESS_EVENT',
      attr: {
        chain: 'bitcoin-mainnet',
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        url: 'https://your-server.com/webhook'
      }
    },
    {
      type: 'ADDRESS_EVENT',
      attr: {
        chain: 'solana-mainnet',
        address: 'FykfMwA9WNShzPJbbb9DNXsfgDgS3XZzWiFgrVXfWoPJ',
        url: 'https://your-server.com/webhook'
      }
    }
  ];

  const results = [];
  for (const sub of subscriptions) {
    const response = await fetch('https://api.tatum.io/v4/subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'YOUR_API_KEY'
      },
      body: JSON.stringify(sub)
    });
    const data = await response.json();
    results.push({ chain: sub.attr.chain, type: sub.type, id: data.id });
    console.log(`Created ${sub.type} on ${sub.attr.chain}: ${data.id}`);
  }

  return results;
};
```

---

### Template Properties Reference

The following properties are available when creating custom templates or are present in the enriched webhook payload:

| Property | Description |
|----------|-------------|
| `kind` | Type of event (e.g., "transfer") |
| `blockHash` | Hash of the block containing the transaction |
| `blockNumber` | Block number |
| `blockTimestamp` | Block timestamp (Unix) |
| `txId` | Transaction hash/ID |
| `txTimestamp` | Transaction timestamp (Unix) |
| `from` | Sender address |
| `to` | Recipient address |
| `value` | Transfer value (in smallest unit, e.g., wei) |
| `currency` | Native currency symbol (ETH, MATIC, etc.) |
| `contractAddress` | Token contract address (for token transfers) |
| `tokenId` | Token ID (for NFT/ERC-1155 transfers) |
| `logIndex` | Log index within the transaction |
| `tokenMetadata` | Full token metadata object |
| `tokenMetadata.type` | Token type (e.g., "nft", "fungible") |
| `tokenMetadata.symbol` | Token symbol (e.g., "USDT") |
| `tokenMetadata.name` | Token name (e.g., "Tether USD") |
| `tokenMetadata.decimals` | Token decimals |
| `tokenMetadata.uri` | Token metadata URI |
| `subscriptionId` | ID of the subscription that triggered this webhook |
| `subscriptionType` | Type of subscription (e.g., "ADDRESS_EVENT") |
| `type` | Transaction type (legacy: "native" or "token") |
| `address` | Monitored address |
| `counterAddress` | Counter-party address |
| `amount` | Transfer amount (legacy format) |
| `metadataURI` | NFT metadata URI (legacy format) |
| `additionalData` | Additional data (gasUsed, gasPrice, etc.) |
| `topic_0` | Event topic 0 (for CONTRACT_LOG_EVENT) |
| `topic_1` | Event topic 1 |
| `topic_2` | Event topic 2 |
| `topic_3` | Event topic 3 |
| `data` | Event data (for CONTRACT_LOG_EVENT) |

---

## Chain-Specific V3 APIs

These v3 endpoints are **NOT deprecated** — they provide chain-specific operations with no v4 alternative. Use them for TRON, Stellar, Ripple, Cardano, and Algorand-specific functionality.

> **Note on KMS variants**: Most POST (write) endpoints accept two request body variants — one with `fromPrivateKey` (direct signing) and one with `signatureId` (Tatum KMS signing). Only the `fromPrivateKey` variant is shown below. For KMS, replace `fromPrivateKey` with `signatureId` (UUID) and add `from` (sender address) and optionally `index` (derivation index).

---

### TRON Operations

#### GET /v3/tron/info
Get current TRON block information.

**Credits**: 5 per API call

**Parameters**: None

**Example Request**:
```bash
curl -X GET "https://api.tatum.io/v3/tron/info" \
  -H "x-api-key: YOUR_API_KEY"
```

---

#### GET /v3/tron/account/{address}
Get TRON account information including balance, TRC-10/TRC-20 tokens, and bandwidth.

**Credits**: 5 per API call

**Path Parameters**:
- `address` (required): TRON account address in Base58 format
  - Type: string
  - Example: `TGDqQAP5bduoPKVgdbk7fGyW4DwEt3RRn8`

**Example Request**:
```bash
curl -X GET "https://api.tatum.io/v3/tron/account/TGDqQAP5bduoPKVgdbk7fGyW4DwEt3RRn8" \
  -H "x-api-key: YOUR_API_KEY"
```

---

#### GET /v3/tron/trc10/detail/{idOrOwnerAddress}
Get information about a TRC-10 token by its ID or owner address.

**Credits**: 5 per API call

**Path Parameters**:
- `idOrOwnerAddress` (required): The ID of the TRC-10 token or the address of the token's owner
  - Type: string
  - Example: `1000540`

**Example Request**:
```bash
curl -X GET "https://api.tatum.io/v3/tron/trc10/detail/1000540" \
  -H "x-api-key: YOUR_API_KEY"
```

---

#### GET /v3/tron/transaction/account/{address}/trc20
Get TRC-20 transactions for a TRON account. Returns up to 200 transactions per call with pagination.

**Credits**: 5 per API call

**Path Parameters**:
- `address` (required): TRON account address
  - Type: string
  - Example: `TGDqQAP5bduoPKVgdbk7fGyW4DwEt3RRn8`

**Query Parameters**:
- `next` (optional): Pagination fingerprint from the previous response's `next` field
  - Type: string
  - Example: `81d0524acf5967f3b361e03fd7d141ab511791cd7aad7ae406c4c8d408290991`
- `onlyConfirmed` (optional): If true, only confirmed transactions are returned
  - Type: boolean
  - Default: false
- `onlyUnconfirmed` (optional): If true, only unconfirmed transactions are returned
  - Type: boolean
  - Default: false
- `onlyTo` (optional): If true, only transactions to this address are returned
  - Type: boolean
  - Default: false
- `onlyFrom` (optional): If true, only transactions from this address are returned
  - Type: boolean
  - Default: false
- `orderBy` (optional): Order of the returned transactions
  - Type: string
  - Enum: `block_timestamp,asc`, `block_timestamp,desc`
- `minTimestamp` (optional): Minimum block_timestamp (default is 0)
  - Type: number
  - Example: `1674416039000`
- `maxTimestamp` (optional): Maximum block_timestamp (default is now)
  - Type: number
  - Example: `1674416039000`
- `contractAddress` (optional): Filter by specific TRC-20 smart contract
  - Type: string
  - Example: `TVAEYCmc15awaDRAjUZ1kvcHwQQaoPw2CW`

**Example Request**:
```bash
curl -X GET "https://api.tatum.io/v3/tron/transaction/account/TGDqQAP5bduoPKVgdbk7fGyW4DwEt3RRn8/trc20?onlyConfirmed=true&orderBy=block_timestamp,desc" \
  -H "x-api-key: YOUR_API_KEY"
```

---

#### POST /v3/tron/freezeBalance
Freeze TRX to obtain BANDWIDTH or ENERGY resources.

**Credits**: 10 per API call

**Body Parameters**:
- `fromPrivateKey` (required): Private key of the address (64 hex chars)
  - Type: string
  - Example: `842E09EB40D8175979EFB0071B28163E11AED0F14BDD84090A4CEFB936EF5701`
- `resource` (required): Resource to obtain
  - Type: string
  - Enum: `BANDWIDTH`, `ENERGY`
- `amount` (required): Amount to freeze in TRX
  - Type: string
  - Pattern: `^[+]?((\d+(\.\d*)?)|(\.\d+))$`
  - Example: `"100000"`

**Example Request**:
```javascript
const freezeBalance = async () => {
  const response = await fetch('https://api.tatum.io/v3/tron/freezeBalance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY'
    },
    body: JSON.stringify({
      fromPrivateKey: '842E09EB40D8175979EFB0071B28163E11AED0F14BDD84090A4CEFB936EF5701',
      resource: 'ENERGY',
      amount: '100000'
    })
  });
  return response.json(); // { txId: "..." }
};
```

---

#### POST /v3/tron/unfreezeBalance
Unfreeze previously frozen TRX.

**Credits**: 10 per API call

**Body Parameters**: Same as `POST /v3/tron/freezeBalance`
- `fromPrivateKey` (required): Private key of the address (64 hex chars)
- `resource` (required): Resource type — `BANDWIDTH` or `ENERGY`
- `amount` (required): Amount to unfreeze in TRX (string)

---

#### POST /v3/tron/trc10/transaction
Send TRC-10 tokens from one address to another.

**Credits**: 10 per API call

**Body Parameters**:
- `fromPrivateKey` (required): Private key of the sender (64 hex chars)
  - Type: string
- `to` (required): Recipient TRON address in Base58 format (34 chars)
  - Type: string
  - Example: `TYMwiDu22V6XG3yk6W9cTVBz48okKLRczh`
- `tokenId` (required): ID of the TRC-10 token to transfer
  - Type: string
  - Example: `"1000538"`
- `amount` (required): Amount to send
  - Type: string
  - Pattern: `^[+]?((\d+(\.\d*)?)|(\.\d+))$`
  - Example: `"100000"`

---

#### POST /v3/tron/trc20/transaction
Send TRC-20 tokens from one address to another.

**Credits**: 10 per API call

**Body Parameters**:
- `fromPrivateKey` (required): Private key of the sender (64 hex chars)
  - Type: string
- `to` (required): Recipient TRON address in Base58 format (34 chars)
  - Type: string
  - Example: `TYMwiDu22V6XG3yk6W9cTVBz48okKLRczh`
- `tokenAddress` (required): Address of the TRC-20 token contract (34 chars)
  - Type: string
  - Example: `TVAEYCmc15awaDRAjUZ1kvcHwQQaoPw2CW`
- `feeLimit` (required): Fee limit in TRX
  - Type: number
  - Example: `0.01`
- `amount` (required): Amount to send
  - Type: string
  - Example: `"100000"`

---

#### POST /v3/tron/trc10/deploy
Create a TRC-10 token. One TRON account can create only one TRC-10 token.

**Credits**: 10 per API call

**Body Parameters**:
- `fromPrivateKey` (required): Private key of the creator (64 hex chars)
  - Type: string
- `recipient` (required): Recipient address for the created tokens (34 chars)
  - Type: string
  - Example: `TYMwiDu22V6XG3yk6W9cTVBz48okKLRczh`
- `name` (required): Name of the token (1-100 chars)
  - Type: string
  - Example: `"My token"`
- `abbreviation` (required): Abbreviation of the token (1-100 chars)
  - Type: string
  - Example: `"SYM"`
- `description` (required): Description of the token (1-100 chars)
  - Type: string
  - Example: `"My short description"`
- `url` (required): URL of the token (1-100 chars)
  - Type: string
  - Example: `"https://mytoken.com"`
- `totalSupply` (required): Total supply of the tokens
  - Type: number
  - Example: `100000`
- `decimals` (required): Number of decimal places (0-5)
  - Type: number
  - Example: `10`

---

#### POST /v3/tron/trc20/deploy
Create a TRC-20 capped token with a preset total supply limit.

**Credits**: 10 per API call

**Body Parameters**:
- `fromPrivateKey` (required): Private key of the creator (64 hex chars)
  - Type: string
- `recipient` (required): Recipient address for the created tokens (34 chars)
  - Type: string
  - Example: `TYMwiDu22V6XG3yk6W9cTVBz48okKLRczh`
- `name` (required): Name of the token (1-100 chars)
  - Type: string
  - Example: `"My token"`
- `symbol` (required): Symbol of the token (1-100 chars)
  - Type: string
  - Example: `"SYM"`
- `totalSupply` (required): Total supply of the tokens
  - Type: number
  - Example: `100000`
- `decimals` (required): Number of decimal places (0-30)
  - Type: number
  - Example: `10`

---

### Stellar (XLM) Operations

#### GET /v3/xlm/account/{account}
Get Stellar account information including balances, signers, and thresholds.

**Credits**: 5 per API call

**Path Parameters**:
- `account` (required): XLM account address
  - Type: string
  - Example: `GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H`

**Example Request**:
```bash
curl -X GET "https://api.tatum.io/v3/xlm/account/GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H" \
  -H "x-api-key: YOUR_API_KEY"
```

---

#### GET /v3/xlm/ledger/{sequence}
Get Stellar ledger information by sequence number.

**Credits**: 5 per API call

**Path Parameters**:
- `sequence` (required): Sequence number of the ledger
  - Type: string
  - Example: `1`

---

#### GET /v3/xlm/fee
Get the current Stellar transaction fee in stroops (1/10,000,000 of XLM).

**Credits**: 5 per API call

**Parameters**: None

**Example Request**:
```bash
curl -X GET "https://api.tatum.io/v3/xlm/fee" \
  -H "x-api-key: YOUR_API_KEY"
```

---

#### GET /v3/xlm/account
Generate a new Stellar (XLM) account (address + secret). Tatum does not support HD wallets for XLM.

**Credits**: 5 per API call

**Parameters**: None

---

#### POST /v3/xlm/trust
Create, update, or delete a Stellar trust line for custom assets.

**Credits**: 10 per API call

**Body Parameters**:
- `fromAccount` (required): XLM account address
  - Type: string
- `issuerAccount` (required): Blockchain address of the asset issuer
  - Type: string
- `token` (required): Asset name
  - Type: string
- `fromSecret` (required): Secret for account
  - Type: string
- `limit` (optional): Amount of assets permitted over this trust line. `0` = delete trust line. Omit = unlimited
  - Type: string

---

#### POST /v3/xlm/transaction
Send XLM or custom assets from one account to another.

**Credits**: 10 per API call

**Body Parameters** (native XLM):
- `fromAccount` (required): Sender XLM account address
  - Type: string
- `to` (required): Recipient XLM account address
  - Type: string
- `amount` (required): Amount to send in XLM
  - Type: string
- `fromSecret` (required): Secret for sender account
  - Type: string
- `initialize` (optional): Set to true if the destination address needs to be funded for the first time
  - Type: boolean
- `message` (optional): Short message — 28 chars ASCII, 64 chars HEX, or uint64 number
  - Type: string

**Additional Body Parameters for custom asset transfers** (add to above):
- `token` (required): Asset name
  - Type: string
- `issuerAccount` (required): Blockchain address of the asset issuer
  - Type: string

---

#### POST /v3/xlm/broadcast
Broadcast a signed Stellar transaction to the network.

**Credits**: 5 per API call

**Body Parameters**:
- `txData` (required): Raw signed transaction data
  - Type: string
- `signatureId` (optional): ID of prepared payment template for KMS
  - Type: string

---

### Ripple (XRP) Operations

#### GET /v3/xrp/account/{account}
Get XRP account information.

**Credits**: 5 per API call

**Path Parameters**:
- `account` (required): XRP account address
  - Type: string
  - Example: `rDA3DJBUBjA1X3PtLLFAEXxX31oA5nL3QF`

**Example Request**:
```bash
curl -X GET "https://api.tatum.io/v3/xrp/account/rDA3DJBUBjA1X3PtLLFAEXxX31oA5nL3QF" \
  -H "x-api-key: YOUR_API_KEY"
```

---

#### GET /v3/xrp/account/{account}/balance
Get XRP account balance including XRP and other assets.

**Credits**: 5 per API call

**Path Parameters**:
- `account` (required): XRP account address
  - Type: string
  - Example: `rDA3DJBUBjA1X3PtLLFAEXxX31oA5nL3QF`

---

#### GET /v3/xrp/ledger/{i}
Get XRP ledger information by sequence number.

**Credits**: 5 per API call

**Path Parameters**:
- `i` (required): Sequence of XRP ledger
  - Type: number
  - Minimum: 0

---

#### GET /v3/xrp/fee
Get the current XRP transaction fee. Standard fee is available in `drops.base_fee` (default 10 XRP drops).

**Credits**: 5 per API call

**Parameters**: None

**Example Request**:
```bash
curl -X GET "https://api.tatum.io/v3/xrp/fee" \
  -H "x-api-key: YOUR_API_KEY"
```

---

#### GET /v3/xrp/account
Generate a new Ripple (XRP) account (address + secret). Tatum does not support HD wallets for XRP.

**Credits**: 5 per API call

**Parameters**: None

---

#### POST /v3/xrp/trust
Create, update, or delete an XRP trust line for custom assets.

**Credits**: 10 per API call

**Body Parameters**:
- `fromAccount` (required): XRP account address
  - Type: string
- `issuerAccount` (required): Blockchain address of the asset issuer
  - Type: string
- `limit` (required): Amount of assets permitted over this trust line. `0` = delete trust line
  - Type: string
- `token` (required): Asset name (160-bit HEX string, e.g., SHA1)
  - Type: string
- `fromSecret` (required): Secret for account
  - Type: string
- `fee` (optional): Fee in XRP. If omitted, current fee will be calculated
  - Type: string

---

#### POST /v3/xrp/transaction
Send XRP or custom assets from one account to another.

**Credits**: 10 per API call

**Body Parameters** (native XRP):
- `fromAccount` (required): Sender XRP account address
  - Type: string
- `to` (required): Recipient XRP account address
  - Type: string
- `amount` (required): Amount to send in XRP
  - Type: string
- `fromSecret` (required): Secret for sender account
  - Type: string
- `fee` (optional): Fee in XRP. If omitted, current fee will be calculated
  - Type: string
- `sourceTag` (optional): Source tag of sender account
  - Type: number
- `destinationTag` (optional): Destination tag of recipient account
  - Type: number

**Additional Body Parameters for custom asset transfers** (add to above):
- `token` (required): Asset name (160-bit HEX string)
  - Type: string
- `issuerAccount` (required): Blockchain address of the asset issuer
  - Type: string

---

#### POST /v3/xrp/broadcast
Broadcast a signed Ripple transaction to the network.

**Credits**: 5 per API call

**Body Parameters**:
- `txData` (required): Raw signed transaction data
  - Type: string
- `signatureId` (optional): ID of prepared payment template for KMS
  - Type: string

---

### Cardano (ADA) Operations

#### GET /v3/ada/info
Get Cardano blockchain network information.

**Credits**: 1 per API call

**Parameters**: None

**Example Request**:
```bash
curl -X GET "https://api.tatum.io/v3/ada/info" \
  -H "x-api-key: YOUR_API_KEY"
```

---

#### GET /v3/ada/block/{hash}
Get Cardano block detail by block hash or height.

**Credits**: 1 per API call

**Path Parameters**:
- `hash` (required): Block hash or height
  - Type: string
  - Example: `00000000ca231a439a5c0a86a5a5dd6dc1918a8e897b96522fa9499288e70183`

---

#### GET /v3/ada/{address}/utxos
Get Cardano UTXOs (Unspent Transaction Outputs) for an address.

**Credits**: 1 per API call

**Path Parameters**:
- `address` (required): Cardano address
  - Type: string
  - Example: `Ae2tdPwUPEZMmrkRoduJW9w7wRvnTcdeMbw7yyyjwPqo6zuaeJaDEkHUJSz`

---

#### GET /v3/ada/wallet
Generate a BIP44 HD wallet for Cardano (derivation path m/1852'/1815'/0').

**Credits**: 1 per API call

**Query Parameters**:
- `mnemonic` (optional): Mnemonic to use for generation of extended public and private keys
  - Type: string
  - Max length: 500

---

#### POST /v3/ada/wallet/priv
Generate a Cardano private key from mnemonic for a given derivation index.

**Credits**: 1 per API call

**Body Parameters**:
- `mnemonic` (required): Mnemonic to generate private key from
  - Type: string
- `index` (required): Derivation index of private key to generate (0 to 2^31 - 1)
  - Type: number

---

#### POST /v3/ada/broadcast
Broadcast a signed Cardano transaction to the network.

**Credits**: 2 per API call

**Body Parameters**:
- `txData` (required): Signed transaction data
  - Type: string

---

### Algorand (ALGO) Operations

#### GET /v3/algorand/wallet
Generate an Algorand wallet (address, secret, mnemonic).

**Credits**: 1 per API call

**Query Parameters**:
- `mnemonic` (optional): Mnemonic to use for generation
  - Type: string
  - Max length: 500

**Example Request**:
```bash
curl -X GET "https://api.tatum.io/v3/algorand/wallet" \
  -H "x-api-key: YOUR_API_KEY"
```

---

#### GET /v3/algorand/node/indexer/{xApiKey}/{indexerPath}
Proxy endpoint to connect directly to the Algorand Indexer API. Supports dynamic paths.

**Credits**: 1 per API call

**Path Parameters**:
- `xApiKey` (required): Your Tatum API key
  - Type: string
- `indexerPath` (required): Indexer API path (e.g., `v2/accounts`, `v2/transactions`)
  - Type: string
  - Docs: https://developer.algorand.org/docs/rest-apis/indexer/

**Example Request**:
```bash
curl -X GET "https://api.tatum.io/v3/algorand/node/indexer/YOUR_API_KEY/v2/accounts" \
  -H "x-api-key: YOUR_API_KEY"
```

---

#### GET /v3/algorand/node/algod/{xApiKey}/{algodPath}
Proxy endpoint to connect directly to the Algorand Algod API. Supports dynamic paths.

**Credits**: 1 per API call

**Path Parameters**:
- `xApiKey` (required): Your Tatum API key
  - Type: string
- `algodPath` (required): Algod API path (e.g., `v2/accounts/{address}`, `v2/status`)
  - Type: string
  - Docs: https://developer.algorand.org/docs/rest-apis/algod/v2/

---

#### POST /v3/algorand/asset/receive
Enable receiving a specific ASA (Algorand Standard Asset) on an account (opt-in).

**Credits**: 2 per API call

**Body Parameters**:
- `assetId` (required): ASA asset index to enable
  - Type: number
  - Example: `116363571`
- `fromPrivateKey` (required): Private key of the account opting in
  - Type: string
- `fee` (optional): Transaction fee in Algos
  - Type: string
  - Example: `"0.001"`

**Example Request**:
```javascript
const optInToAsset = async () => {
  const response = await fetch('https://api.tatum.io/v3/algorand/asset/receive', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY'
    },
    body: JSON.stringify({
      assetId: 116363571,
      fromPrivateKey: '72TCV5BRQPBMSAFPYO3CPWVDBYWNGAYNMTW5QHENOMQF7I6QLNMJWCJZ7A3V5YKD7QD6ZZPEHG2PV2ZVVEDDO6BCRGXWIL3DIUMSUCI',
      fee: '0.001'
    })
  });
  return response.json(); // { txId: "..." }
};
```

---

*Last Updated: 2026-04-28*
