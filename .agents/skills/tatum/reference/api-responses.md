# Tatum API - Response Body Reference

Response schemas for all Tatum API endpoints, extracted from the OpenAPI specifications. For request parameters, see [api-parameters.md](api-parameters.md).

**Base URL**: `https://api.tatum.io`

**Authentication**: All endpoints require an API key passed via the `x-api-key` header.

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
- [Webhook Payloads](#webhook-payloads)
- [Chain-Specific V3 APIs](#chain-specific-v3-apis)

---

## Exchange Rate APIs

### GET /v4/data/rate/symbol

**Response Body**:
```json
{
  "id": "BTC",
  "value": "45000.50",
  "basePair": "USD",
  "timestamp": 1572031674384,
  "source": "fixer.io"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Currency symbol (e.g., "BTC", "ETH") |
| `value` | string | FIAT value of the asset in the given base pair |
| `basePair` | string | Target fiat currency |
| `timestamp` | number | Date of rate validity in UTC (milliseconds) |
| `source` | string | Source of the exchange rate (e.g., "fixer.io") |

---

### POST /v4/data/rate/symbol/batch

**Response Body**: Array of exchange rate objects, each with a `batchId` for correlation.
```json
[
  {
    "batchId": "1",
    "symbol": "BTC",
    "basePair": "USD",
    "value": "45000.50",
    "timestamp": 1572031674384,
    "source": "fixer.io"
  },
  {
    "batchId": "2",
    "symbol": "ETH",
    "basePair": "USD",
    "value": "3200.75",
    "timestamp": 1572031674384,
    "source": "fixer.io"
  }
]

```

| Field | Type | Description |
|-------|------|-------------|
| `batchId` | string | Identifier matching the request pair |
| `symbol` | string | Currency symbol |
| `basePair` | string | Target fiat currency |
| `value` | string | FIAT value of the asset |
| `timestamp` | number | Date of rate validity in UTC (milliseconds) |
| `source` | string | Source of the exchange rate |

---

### GET /v4/data/rate/contract

**Response Body**: Same structure as `GET /v4/data/rate/symbol`.
```json
{
  "id": "USDT",
  "value": "1.00",
  "basePair": "USD",
  "timestamp": 1572031674384,
  "source": "fixer.io"
}
```

---

### POST /v4/data/rate/contract/batch

**Response Body**: Same structure as `POST /v4/data/rate/symbol/batch` — array with `batchId`.

---

### GET /v4/data/rate/price-change

**Response Body**:
```json
{
  "symbol": "BTC",
  "basePair": "USDT",
  "open": "45000.50",
  "close": "46500.75",
  "openTime": 1704067200000,
  "closeTime": 1704153600000,
  "absoluteChange": "1500.25",
  "percentageChange": 3.33
}
```

| Field | Type | Description |
|-------|------|-------------|
| `symbol` | string | Base symbol of the trading pair |
| `basePair` | string | Quote asset of the trading pair |
| `open` | string | Opening price at the start of the time range |
| `close` | string | Closing price at the end of the time range |
| `openTime` | number | Opening time (Unix ms) |
| `closeTime` | number | Closing time (Unix ms) |
| `absoluteChange` | string | Absolute price change (close - open) |
| `percentageChange` | number | Percentage price change |

---

### POST /v4/data/rate/price-change/batch

**Response Body**: Array of price change objects, each with a `batchId`.
```json
[
  {
    "batchId": "1",
    "symbol": "BTC",
    "basePair": "USDT",
    "open": "45000.50",
    "close": "46500.75",
    "openTime": 1704067200000,
    "closeTime": 1704153600000,
    "absoluteChange": "1500.25",
    "percentageChange": 3.33
  }
]
```

---

### GET /v4/data/rate/symbol/OHLCV

**Response Body**: Array of OHLCV candlestick data points.
```json
[
  {
    "timestamp": 1704067200000,
    "open": "45000.50",
    "high": "46800.00",
    "low": "44500.00",
    "close": "46500.75",
    "volume": "12345.678"
  }
]
```

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | number | Candle start time (Unix ms) |
| `open` | string | Opening price |
| `high` | string | Highest price in the period |
| `low` | string | Lowest price in the period |
| `close` | string | Closing price |
| `volume` | string | Trading volume |

---

### GET /v4/data/rate/symbol/OHLCV/batch

**Response Body**: Array of OHLCV responses, each with a `batchId`.

---

### GET /v4/data/rate/history

**Response Body**: Array of historical exchange rate data points.
```json
[
  {
    "timestamp": 1704067200000,
    "value": "45000.50"
  }
]
```

---

## Wallet APIs

### GET /v4/data/wallet/portfolio

**Response Body**: Array of portfolio items (native, fungible, or NFT).

**Native Token Entry**:
```json
{
  "chain": "ethereum-mainnet",
  "type": "native",
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "balance": "1500000000000000000",
  "denominatedBalance": "1.5",
  "decimals": 18
}
```

**Fungible Token Entry**:
```json
{
  "chain": "ethereum-mainnet",
  "type": "fungible",
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "balance": "1000000",
  "denominatedBalance": "1.0",
  "decimals": 6,
  "tokenAddress": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
}
```

**NFT Entry**:
```json
{
  "chain": "ethereum-mainnet",
  "type": "nft",
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "balance": "1",
  "tokenAddress": "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
  "tokenId": "1234",
  "metadataURI": "ipfs://QmXFpaS3S7CkLZvihLFA9JbawKdqhjg8dJeDkPntmkD2Pc",
  "metadata": {
    "name": "Bored Ape #1234",
    "image": "ipfs://QmRRPWG96cmgTn2qSzjwr2qvfNEuhunv6FNeMFGa9bx6mQ"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `chain` | string | Blockchain identifier |
| `type` | string | Token type: `native`, `fungible`, or `nft` |
| `address` | string | Wallet address |
| `balance` | string | Raw balance (in smallest unit) |
| `denominatedBalance` | string | Human-readable balance (native/fungible only) |
| `decimals` | number | Decimal places (native/fungible only) |
| `tokenAddress` | string | Token contract address (fungible/nft only) |
| `tokenId` | string | Token ID (nft only) |
| `metadataURI` | string | Metadata URI (nft only) |
| `metadata` | object | Token metadata (nft only) |

---

### GET /v4/data/wallet/balance/time

**Response Body**: Array of balance snapshots over time.
```json
[
  {
    "timestamp": 1704067200000,
    "balance": "1500000000000000000"
  }
]
```

---

### GET /v4/data/wallet/reputation

**Response Body**: Wallet reputation score.
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "reputation": 85
}
```

---

### GET /v4/data/wallet/reputation/portfolio

**Response Body**: Portfolio with reputation data.

---

### GET /v4/data/wallet/reputation/tokens

**Response Body**: Tokens with reputation scores.

---

## Transaction APIs

### GET /v4/data/blockchains/transaction

Returns different response structures based on chain type.

**Response Body (EVM chains — Ethereum, Polygon, BSC, etc.)**:
```json
{
  "hash": "0x7b3b0bc2c72b7e6b8a2c8af8d77c6f6b2c14a8f6c3f7d8e9b1e2d3c4b5a6f7d8",
  "blockNumber": 18500000,
  "from": "0x8ba1f109551bd432803012645ac136ddd64dba72",
  "to": "0x4bbeEB066eD09B7AEd07bF39EEe0460DFa261520",
  "value": "10000000000000000",
  "gas": 21000,
  "gasPrice": "20000000000",
  "nonce": 42,
  "transactionIndex": 5,
  "input": "0x",
  "type": 2,
  "status": true,
  "gasUsed": 21000,
  "effectiveGasPrice": 18000000000,
  "contractAddress": null,
  "fee": "378000000000000",
  "logs": [
    {
      "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "topics": ["0xddf252ad..."],
      "data": "0x000000...",
      "blockNumber": 18500000,
      "transactionHash": "0x7b3b0bc...",
      "logIndex": 0,
      "removed": false,
      "blockTimestamp": "1699123456"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `hash` | string | Transaction hash |
| `blockNumber` | integer | Block number |
| `from` | string | Sender address |
| `to` | string/null | Recipient address (null for contract creation) |
| `value` | string | Value in wei |
| `gas` | integer | Gas limit |
| `gasPrice` | string | Gas price in wei |
| `nonce` | integer | Sender's nonce |
| `transactionIndex` | integer | Position in block |
| `input` | string | Input data (hex) |
| `type` | integer | Tx type (0=legacy, 1=EIP-2930, 2=EIP-1559) |
| `status` | boolean | true if successful |
| `gasUsed` | integer | Actual gas used |
| `effectiveGasPrice` | integer | Effective gas price |
| `contractAddress` | string/null | Created contract address |
| `fee` | string/null | Fee paid in native units |
| `logs` | array | Event logs |

**Response Body (UTXO chains — Bitcoin, Litecoin, Dogecoin)**:
```json
{
  "hash": "7912175f3f46da95075248a147efdd00cf86d1a018e1609800e22187e65ccd92",
  "blockNumber": 937056,
  "block": "00000000000000000000bdbfedb6b9e3e521fa404007a84dfc4e681a6a6e927d",
  "fee": 726,
  "index": 1586,
  "time": 1771321646,
  "size": 223,
  "vsize": 142,
  "weight": 565,
  "version": 2,
  "locktime": 0,
  "inputs": [
    {
      "prevout": {
        "hash": "abc123...",
        "index": 0
      },
      "sequence": 4294967295,
      "script": "...",
      "address": "bc1q...",
      "coin": {
        "version": 2,
        "height": 937050,
        "value": 50000,
        "script": "...",
        "address": "bc1q...",
        "coinbase": false
      }
    }
  ],
  "outputs": [
    {
      "value": 40000,
      "script": "...",
      "address": "bc1q..."
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `hash` | string | Transaction hash (txid) |
| `blockNumber` | integer | Block height |
| `block` | string | Block hash |
| `fee` | integer | Transaction fee in satoshis |
| `index` | integer | Transaction index in block |
| `time` | integer | Block timestamp (Unix seconds) |
| `size` | integer | Transaction size in bytes |
| `vsize` | integer | Virtual size in bytes |
| `weight` | integer | Transaction weight |
| `inputs` | array | Transaction inputs (with prevout, coin) |
| `outputs` | array | Transaction outputs (value, script, address) |

---

### GET /v4/data/blockchains/transaction/internal

**Response Body**: Array of internal transactions (EVM chains only).
```json
[
  {
    "blockNumber": "83142718",
    "timeStamp": "1771405460",
    "hash": "0x8f6e3eafec46b4136071829e312ccd1c21fca3ac262acc08cb2dd44d95428986",
    "from": "0x278d858f05b94576c1e6f73285886876ff6ef8d2",
    "to": "0x67366782805870060151383f4bbff9dab53e5cd6",
    "value": "227496880059990000000",
    "contractAddress": "",
    "input": "",
    "type": "call",
    "gas": "462306",
    "gasUsed": "1273",
    "traceId": "0_1_1_1_1_1",
    "isError": "0",
    "errCode": ""
  }
]
```

| Field | Type | Description |
|-------|------|-------------|
| `blockNumber` | string | Block number |
| `timeStamp` | string | Block timestamp (Unix seconds) |
| `hash` | string | Transaction hash |
| `from` | string | Sender address |
| `to` | string | Recipient address |
| `value` | string | Value in wei |
| `type` | string | Call type (e.g., "call", "delegatecall") |
| `gas` | string | Gas provided |
| `gasUsed` | string | Gas consumed |
| `traceId` | string | Trace ID in call tree |
| `isError` | string | "0" for success, "1" for error |
| `errCode` | string | Error code if failed |

---

### GET /v4/data/transaction/history

**Response Body**: Paginated array of decoded transaction events.
```json
[
  {
    "chain": "ethereum-mainnet",
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "blockNumber": 18500000,
    "timestamp": 1699123456,
    "txHash": "0x7b3b0bc...",
    "txIndex": 5,
    "logIndex": 0,
    "decoded": {
      "label": "Transfer",
      "type": "FungibleTransfer",
      "subtype": "ERC20",
      "from": "0x742d35Cc...",
      "to": "0xb7d49e5a...",
      "decimals": 6,
      "value": "1000000"
    },
    "raw": {
      "topic_0": "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      "topic_1": "0x000000...",
      "topic_2": "0x000000...",
      "data": "0x000000..."
    }
  }
]
```

---

### GET /v4/data/transactions/hash

**Response Body**: Same structure as `GET /v4/data/blockchains/transaction` — returns EVM or UTXO transaction object based on chain.

---

### GET /v4/data/transactions/dna

**Response Body**: Transaction DNA/fingerprint data.

---

### GET /v4/data/blockchains/transaction/count

**Response Body**:
```json
{
  "count": 42
}
```

| Field | Type | Description |
|-------|------|-------------|
| `count` | integer | Number of transactions (nonce for EVM chains) |

---

### GET /v4/data/blockchains/transaction/history/utxos

**Response Body**: Array of UTXO transaction history objects. Same structure as UTXO transaction response above.

---

### POST /v4/data/blockchains/transaction/history/utxos/batch

**Response Body**: Array of UTXO transaction history for multiple addresses.

---

## Token APIs

### GET /v4/data/tokens

**Response Body**: Array of fungible token balances.
```json
[
  {
    "chain": "ethereum-mainnet",
    "type": "fungible",
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "balance": "1000000",
    "denominatedBalance": "1.0",
    "decimals": 6,
    "tokenAddress": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "lastUpdatedBlockNumber": 18500000
  }
]
```

| Field | Type | Description |
|-------|------|-------------|
| `chain` | string | Blockchain identifier |
| `type` | string | Always "fungible" |
| `address` | string | Wallet address |
| `balance` | string | Raw balance in smallest unit |
| `denominatedBalance` | string | Human-readable balance |
| `decimals` | number | Decimal places |
| `tokenAddress` | string | Token contract address |
| `lastUpdatedBlockNumber` | integer | Last block when balance changed |

---

### GET /v4/data/tokens/trending

**Response Body**:
```json
{
  "data": [
    {
      "rank": 1,
      "name": "Example Token",
      "symbol": "EXMPL",
      "tokenAddress": "0x1111111111111111111111111111111111111111",
      "chain": "ethereum-mainnet",
      "type": "fungible",
      "fdv": 123456789.12,
      "liquidity": 2345678.9,
      "priceUSD": 1.2345,
      "priceChanges": {
        "5m": 1.1,
        "15m": 2.3,
        "1h": -0.5,
        "3h": 4.2,
        "6h": 9.9,
        "1d": 12.5
      },
      "firstMint": "2025-08-03T23:47:47Z"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `rank` | integer | Position in trending list (1 = most trending) |
| `name` | string | Token name |
| `symbol` | string | Token symbol |
| `tokenAddress` | string | Contract address |
| `chain` | string | Blockchain |
| `type` | string | Token type |
| `fdv` | number | Fully diluted valuation in USD |
| `liquidity` | number | On-chain liquidity in USD |
| `priceUSD` | number | Current price in USD |
| `priceChanges` | object | Price changes across timeframes (5m, 15m, 1h, 3h, 6h, 1d) |
| `firstMint` | string | First mint timestamp (ISO 8601) |

---

### GET /v4/data/tokens/newest

**Response Body**: Same structure as `GET /v4/data/tokens/trending`.

---

### GET /v4/data/tokens/popular

**Response Body**: Same structure as `GET /v4/data/tokens/trending`.

---

### GET /v4/data/tokens/popular/history

**Response Body**: Historical popular token data with timestamps.

---

## NFT APIs

### GET /v4/data/nft/balances

**Response Body**: Array of NFT balance objects with metadata.
```json
[
  {
    "contractAddress": "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
    "balances": ["1234", "5678"],
    "metadata": [
      {
        "tokenId": "1234",
        "url": "ipfs://QmXFpaS3S7CkLZvihLFA9JbawKdqhjg8dJeDkPntmkD2Pc",
        "metadata": {
          "name": "Bored Ape #1234",
          "description": "A unique Bored Ape",
          "image": "ipfs://QmRRPWG96cmgTn2qSzjwr2qvfNEuhunv6FNeMFGa9bx6mQ",
          "attributes": [
            {"trait_type": "Background", "value": "Blue"},
            {"trait_type": "Fur", "value": "Dark Brown"}
          ]
        }
      }
    ]
  }
]
```

| Field | Type | Description |
|-------|------|-------------|
| `contractAddress` | string | NFT contract address (Algorand: asset ID) |
| `balances` | array[string] | Array of token IDs owned |
| `metadata` | array | Metadata for each token |
| `metadata[].tokenId` | string | Token ID |
| `metadata[].url` | string | Metadata URI (often IPFS) |
| `metadata[].metadata` | object | Parsed metadata (name, description, image, attributes) |
| `supply` | number | (Algorand only) Fractions in fractional NFT |
| `decimals` | number | (Algorand only) Decimal places |

---

### GET /v4/data/multitoken/balances

**Response Body**: Array of ERC-1155 multitoken balances.
```json
[
  {
    "contractAddress": "0x1234...",
    "balances": [
      {
        "tokenId": "1",
        "amount": "100"
      }
    ],
    "metadata": [
      {
        "tokenId": "1",
        "url": "https://api.example.com/metadata/1",
        "metadata": {
          "name": "Game Item #1",
          "image": "https://example.com/image.png"
        }
      }
    ]
  }
]
```

---

### GET /v4/data/collections

**Response Body**: Array of collection token data with metadata.
```json
[
  {
    "contractAddress": "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
    "tokenId": "1234",
    "tokenType": "nft",
    "metadata": {
      "name": "Bored Ape #1234",
      "image": "ipfs://QmRRPWG96cmgTn2qSzjwr2qvfNEuhunv6FNeMFGa9bx6mQ",
      "attributes": []
    }
  }
]
```

---

### GET /v4/data/metadata

**Response Body**: Token metadata object.
```json
{
  "name": "Bored Ape #1234",
  "description": "A unique digital collectible",
  "image": "ipfs://QmRRPWG96cmgTn2qSzjwr2qvfNEuhunv6FNeMFGa9bx6mQ",
  "attributes": [
    {"trait_type": "Background", "value": "Blue"},
    {"trait_type": "Fur", "value": "Dark Brown"}
  ]
}
```

---

### GET /v4/data/owners

**Response Body**: Array of token owners.
```json
[
  {
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "balance": "1"
  }
]
```

---

### GET /v4/data/owners/address

**Response Body**: Ownership check for a specific address.

---

## Blockchain APIs

### GET /v4/data/blockchains/block/current

**Response Body**:
```json
{
  "blockNumber": 18500000
}
```

---

### GET /v4/data/blockchains/block

Returns different structures based on chain type.

**Response Body (EVM chains)**:
```json
{
  "hash": "0x25b4ef2c43f1fffc1efa7d7b21069dfa70917a87fd6e46d8ff02dc9242b0da3a",
  "number": 24475922,
  "parentHash": "0xefa8d8861c803f97a0eac153adfb4da796cbdd084310895fbc74dd70a585198f",
  "timestamp": 1771323719,
  "gasUsed": 20126114,
  "gasLimit": 60000000,
  "miner": "0x4838b106fce9647bdf1e7877bf73ce8b0bad5f97",
  "size": 93801,
  "difficulty": "0",
  "baseFeePerGas": "0x26c8b97",
  "transactions": []
}
```

| Field | Type | Description |
|-------|------|-------------|
| `hash` | string | Block hash |
| `number` | integer | Block number |
| `parentHash` | string | Parent block hash |
| `timestamp` | integer | Block timestamp (Unix seconds) |
| `gasUsed` | integer | Total gas used |
| `gasLimit` | integer | Block gas limit |
| `miner` | string | Miner/validator address |
| `size` | integer | Block size in bytes |
| `baseFeePerGas` | string | Base fee per gas (EIP-1559) |
| `transactions` | array | Transaction objects |

**Response Body (UTXO chains)**:
```json
{
  "hash": "00000000000000000001b29653de48d09ac74976734681c9aa660136a35d348b",
  "height": 937061,
  "time": 1771322796,
  "size": 1759585,
  "weight": 3993592,
  "bits": 386022526,
  "nonce": 4071332163,
  "prevBlock": "0000000000000000000239eedc8f375530ab78f2e3cdd5db7fb80246b6dfe3cb",
  "merkleRoot": "17589be1f8c5e103e2cbb03b6537edae3e24a6bcf91d47182b673c7390c6b219",
  "nTx": 3553,
  "txs": []
}
```

| Field | Type | Description |
|-------|------|-------------|
| `hash` | string | Block hash |
| `height` | integer | Block height |
| `time` | integer | Block timestamp (Unix seconds) |
| `size` | integer | Block size in bytes |
| `weight` | integer | Block weight |
| `nonce` | integer | Block nonce |
| `prevBlock` | string | Previous block hash |
| `merkleRoot` | string | Merkle root hash |
| `nTx` | integer | Number of transactions |
| `txs` | array | Transaction objects |

---

### GET /v4/data/blockchains/block/hash

**Response Body**: Block object by hash. Same structure as `GET /v4/data/blockchains/block`.

---

### GET /v4/data/blockchains/balance

Returns different structures based on chain type.

**Response Body (Non-UTXO chains — Ethereum, Polygon, Solana, etc.)**:
```json
{
  "balance": "0.1234"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `balance` | string | Native balance as string |

**Response Body (UTXO chains — Bitcoin, Litecoin, Dogecoin)**:
```json
{
  "balance": "100000",
  "incoming": "150000",
  "outgoing": "30000",
  "incomingPending": "5000",
  "outgoingPending": "15000"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `balance` | string | Calculated balance (incoming - outgoing - pending) |
| `incoming` | string | Confirmed incoming sum |
| `outgoing` | string | Confirmed outgoing sum |
| `incomingPending` | string | Pending incoming sum |
| `outgoingPending` | string | Pending outgoing sum |

---

### GET /v4/data/blockchains/balance/batch

**Response Body**: Array of balance objects with `address` field.

**Non-UTXO chains**:
```json
[
  {
    "address": "0x8ba1f109551bd432803012645ac136ddd64dba72",
    "balance": "0.1234"
  }
]
```

**UTXO chains**:
```json
[
  {
    "address": "bc1q...",
    "balance": "100000",
    "incoming": "150000",
    "outgoing": "30000",
    "incomingPending": "5000",
    "outgoingPending": "15000"
  }
]
```

---

### GET /v4/data/blockchains/utxo/info

**Response Body**: UTXO information for a specific transaction output.

---

### GET /v4/data/blockchains/mempool

**Response Body**: Array of mempool transactions (Bitcoin, Litecoin, Dogecoin only).

---

### GET /v4/data/utxos

**Response Body**: Array of UTXOs for an address.
```json
[
  {
    "txHash": "7912175f3f46da95075248a147efdd00cf86d1a018e1609800e22187e65ccd92",
    "index": 0,
    "value": 50000,
    "address": "bc1q..."
  }
]
```

---

### POST /v4/data/utxos/batch

**Response Body**: Array of UTXOs for multiple addresses.

---

## DeFi APIs

### GET /v4/data/defi/events

**Response Body**: Array of decoded DeFi protocol events.
```json
[
  {
    "chain": "ethereum-mainnet",
    "address": "0x742d35Cc...",
    "blockNumber": 18500000,
    "timestamp": 1699123456,
    "txHash": "0x7b3b0bc...",
    "txIndex": 5,
    "logIndex": 0,
    "decoded": {
      "label": "Transfer",
      "type": "FungibleTransfer",
      "subtype": "ERC20",
      "from": "0x742d35Cc...",
      "to": "0xb7d49e5a...",
      "decimals": 6,
      "value": "1000000"
    },
    "raw": {
      "topic_0": "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      "topic_1": "0x000000...",
      "topic_2": "0x000000...",
      "data": "0x000000..."
    }
  }
]
```

**Decoded Event Types**:

| Type | Fields | Description |
|------|--------|-------------|
| `FungibleTransfer` | from, to, decimals, value | ERC-20 token transfer |
| `StablecoinTransfer` | from, to, decimals, value | Stablecoin transfer |
| `NftTransfer` | from, to, tokenId | ERC-721 NFT transfer |
| `MultitokenTransferSingle` | from, to, multitokenId, multitokenValue | ERC-1155 single transfer |
| `MultitokenTransferBatch` | from, to, multitokenIds, multitokenValues | ERC-1155 batch transfer |
| `UniswapTradeV2` | from, to, token0, token1, amount0In, amount1In, amount0Out, amount1Out | Uniswap V2 swap |
| `UniswapTradeV3` | from, to, token0, token1, amount0, amount1, sqrtPriceX96, liquidity, tick | Uniswap V3 swap |

---

### GET /v4/data/defi/blocks

**Response Body**: DeFi events grouped by block.

---

### GET /v4/data/defi/blocks/latest

**Response Body**: Latest block DeFi events.

---

## Staking APIs

### GET /v4/data/staking/native/current-assets

**Response Body**: Array of current staked assets.

**Ethereum**:
```json
[
  {
    "txHash": "0xabc123...",
    "blockNumber": 21000000,
    "timestamp": 1757552548,
    "epoch": 847,
    "type": "stake",
    "amount": "32.0",
    "withdrawalAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f2EE05",
    "validatorIndex": 123456,
    "validatorPubkey": "0x8d41e4bb3f1f6da0c9986c9cf0f36eb5c3e4c5e6..."
  }
]
```

**Solana**:
```json
[
  {
    "txHash": "5JFC47k33cDR6cwAJXnusHiBmf2mSDwQ3WGUicv1vPXBzyWzXNg4r6SZS7sRk8o2...",
    "blockNumber": 366007894,
    "timestamp": 1757552548,
    "epoch": 847,
    "type": "stake",
    "amount": "64598.00228288",
    "stakeAddress": "8JMUtSoHS3h28tL7AJHP1SbXfhfeZSnpJ1hWZNCMSw9G",
    "validatorAddress": "RuBYsjLeJYtWXbabcxPbNcbbFXQvMLrJGutpcqVRomz"
  }
]
```

| Field | Type | Description |
|-------|------|-------------|
| `txHash` | string | Transaction hash |
| `blockNumber` | number | Block number (Solana: slot) |
| `timestamp` | number | Unix timestamp |
| `epoch` | number | Beacon chain epoch (ETH) or Solana epoch |
| `type` | string | Type: create, stake, unstake, withdraw, split |
| `amount` | string | Amount in ETH or SOL |
| `validatorIndex` | number | (ETH only) Beacon validator index |
| `validatorPubkey` | string | (ETH only) BLS public key |
| `withdrawalAddress` | string | (ETH only) Withdrawal address |
| `stakeAddress` | string | (SOL only) Stake account address |
| `validatorAddress` | string | (SOL only) Validator vote account |

---

### GET /v4/data/staking/native/current-assets-by-validator

**Response Body**: Same structure as current-assets, grouped by validator.

---

### GET /v4/data/staking/native/rewards

**Response Body**: Array of staking reward entries.

---

### GET /v4/data/staking/native/transactions

**Response Body**: Array of staking transactions. Same schema as current-assets.

---

### GET /v4/data/staking/native/pools

**Response Body**: Array of staking pools/validators.

**Solana pools**:
```json
[
  {
    "identity": "5iJDEVRi1nMLwKAWhYbEokZnvBAe15rgFaHGkggVEP9z",
    "voteIdentity": "RuBYsjLeJYtWXbabcxPbNcbbFXQvMLrJGutpcqVRomz",
    "activatedStake": "123456789000000000",
    "active": true,
    "commission": 5,
    "name": "My Validator",
    "website": "https://myvalidator.com",
    "skipRate": 0.05,
    "voteSuccess": 99.9,
    "uptime": 99.95,
    "stakingApy": 7.2,
    "totalApy": 7.2,
    "epoch": 873
  }
]
```

---

### GET /v4/data/staking/liquid/current-assets

**Response Body**: Array of liquid staking positions.

**Ethereum**:
```json
[
  {
    "protocol": "Lido",
    "symbol": "stETH",
    "underlying": "ETH",
    "contractAddress": "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
    "balance": "1.5"
  }
]
```

**Solana**:
```json
[
  {
    "protocol": "Marinade",
    "symbol": "mSOL",
    "underlying": "SOL",
    "mintAddress": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
    "balance": "100.5"
  }
]
```

| Field | Type | Description |
|-------|------|-------------|
| `protocol` | string | Protocol name (e.g., "Lido", "Marinade") |
| `symbol` | string | Liquid staking token symbol |
| `underlying` | string | Underlying asset (ETH or SOL) |
| `contractAddress` | string | (ETH) Token contract address |
| `mintAddress` | string | (SOL) Token mint address |
| `balance` | string | Human-readable balance |

---

### GET /v4/data/staking/liquid/pools

**Response Body**: Array of liquid staking pools.
```json
[
  {
    "protocol": "Lido",
    "underlying": "ETH",
    "symbols": ["stETH", "wstETH"],
    "contractAddresses": ["0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84"],
    "apy": 3.5,
    "apyBase": 3.2,
    "apyBase7d": 3.3,
    "apyBase30d": 3.4,
    "tvlUsd": 15000000000,
    "rank": 1
  }
]
```

| Field | Type | Description |
|-------|------|-------------|
| `protocol` | string | Protocol name |
| `underlying` | string | Underlying asset |
| `symbols` | array[string] | Liquid staking token symbols |
| `contractAddresses` | array[string] | (ETH) Token contract addresses |
| `mintAddresses` | array[string] | (SOL) Token mint addresses |
| `apy` | number/null | Current APY |
| `apyBase` | number/null | Base APY |
| `apyBase7d` | number/null | 7-day average APY |
| `apyBase30d` | number/null | 30-day average APY |
| `tvlUsd` | number/null | Total value locked in USD |
| `rank` | integer | Pool rank |

---

## Mining APIs

### GET /v4/data/mining/rewards

**Response Body**: Array of mining reward entries (Bitcoin, Litecoin, Dogecoin).
```json
[
  {
    "blockNumber": 900000,
    "txHash": "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
    "index": 0,
    "value": 6.25,
    "valueAsString": "6.25",
    "address": "bc1qwzrryqr3ja8w7hnja2spmkgfdcgvqwp5swz4af4ngsjecfz0w0pqud7k38",
    "chain": "bitcoin-mainnet"
  }
]
```

| Field | Type | Description |
|-------|------|-------------|
| `blockNumber` | number | Block where reward was mined |
| `txHash` | string | Coinbase transaction hash |
| `index` | number | Output index (vout) |
| `value` | number | Reward in BTC/LTC/DOGE |
| `valueAsString` | string | Reward as string |
| `address` | string | Miner address |
| `chain` | string | Blockchain identifier |

---

### GET /v4/data/mining/totalRewards

**Response Body**:
```json
{
  "value": 312.5,
  "valueAsString": "312.5",
  "address": "bc1qwzrryqr3ja8w7hnja2spmkgfdcgvqwp5swz4af4ngsjecfz0w0pqud7k38",
  "chain": "bitcoin-mainnet"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `value` | number | Total mining rewards |
| `valueAsString` | string | Total as string |
| `address` | string | Miner address |
| `chain` | string | Blockchain identifier |

---

## Marketplace APIs

### GET /v4/data/marketplace/cryptoslam/token/price

**Response Body**: NFT token pricing data from CryptoSlam.
```json
{
  "contractAddress": "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
  "tokenId": "1234",
  "chain": "ethereum-mainnet",
  "priceUSD": 50000.00,
  "priceNative": 25.5,
  "lastSaleTimestamp": 1699123456
}
```

---

### GET /v4/data/marketplace/cryptoslam/token/price/history

**Response Body**: Array of historical NFT price data points.

---

### GET /v4/data/marketplace/cryptoslam/token/price/exotic

**Response Body**: Exotic NFT pricing data.

---

### GET /v4/data/marketplace/cryptoslam/token/price/exotic/history

**Response Body**: Historical exotic pricing data.

---

### GET /v4/data/marketplace/cryptoslam/token/trades

**Response Body**: Array of NFT trade events.
```json
[
  {
    "contractAddress": "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
    "tokenId": "1234",
    "chain": "ethereum-mainnet",
    "from": "0x742d35Cc...",
    "to": "0xb7d49e5a...",
    "priceUSD": 50000.00,
    "priceNative": 25.5,
    "timestamp": 1699123456,
    "txHash": "0x7b3b0bc..."
  }
]
```

---

### GET /v4/data/marketplace/cryptoslam/token/transfers

**Response Body**: Array of NFT transfer events.

---

### GET /v4/data/marketplace/cryptoslam/token/transfers/dna

**Response Body**: Transfer DNA/fingerprint data.

---

### GET /v4/data/marketplace/cryptoslam/token/holder/reputation

**Response Body**: Token holder reputation data.

---

### GET /v4/data/marketplace/cryptoslam/chain/trades

**Response Body**: Array of trade events for an entire chain.

---

### GET /v4/data/marketplace/cryptoslam/chain/trades/dna

**Response Body**: Chain-level trade DNA data.

---

### GET /v4/data/marketplace/cryptoslam/chain/transfers

**Response Body**: Array of transfer events for an entire chain.

---

### GET /v4/data/marketplace/cryptoslam/chain/transfers/dna

**Response Body**: Chain-level transfer DNA data.

---

### GET /v4/data/marketplace/cryptoslam/wallet/trades

**Response Body**: Array of wallet-level trade events.

---

### GET /v4/data/marketplace/cryptoslam/wallet/trades/dna

**Response Body**: Wallet trade DNA data.

---

### GET /v4/data/marketplace/cryptoslam/wallet/transfers

**Response Body**: Array of wallet-level transfer events.

---

### GET /v4/data/marketplace/cryptoslam/wallet/transfers/dna

**Response Body**: Wallet transfer DNA data.

---

### GET /v4/data/marketplace/cryptoslam/pair/trades

**Response Body**: Array of pair-level trade events.

---

### GET /v4/data/marketplace/cryptoslam/pair/trades/dna

**Response Body**: Pair trade DNA data.

---

## Fee Estimation APIs

### POST /v4/blockchainOperations/gas

Returns different structures based on chain type.

**Response Body (EVM chains)**:
```json
{
  "gasPrice": "10000000000",
  "gasLimit": "21000"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `gasPrice` | string | Estimated gas price in wei |
| `gasLimit` | string | Gas units needed for the transaction |

**Response Body (All chains — fee tiers)**:
```json
{
  "fast": 14766927339,
  "medium": 13333333333,
  "slow": 12953333333,
  "baseFee": 12657357496,
  "time": "2022-12-08T08:42:04.518Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `fast` | number | Fast acceptance fee (EVM: gas price in wei; BTC: fee per byte) |
| `medium` | number | Medium acceptance fee |
| `slow` | number | Slow acceptance fee |
| `baseFee` | number | (EVM only) Minimum fee for block inclusion |
| `time` | string | Last recalculation time (ISO 8601) |

---

## Web3 Name Service APIs

### GET /v4/data/ns/name

**Response Body**: Array of name resolution results.
```json
[
  {
    "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "chain": "ethereum-mainnet",
    "name": "vitalik.eth",
    "resolved": true
  }
]
```

| Field | Type | Description |
|-------|------|-------------|
| `address` | string | Resolved wallet address |
| `chain` | string | Blockchain |
| `name` | string | Domain name (e.g., "vitalik.eth") |
| `resolved` | boolean | Whether resolution succeeded |

---

### GET /v4/data/block/time

**Response Body**: Block time data.

---

## Notification/Subscription APIs

### POST /v4/subscription

**Response Body**:
```json
{
  "id": "7c21ed165e294db78b95f0f1"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Created subscription ID |

---

### GET /v4/subscription

**Response Body**: Array of subscription objects.
```json
[
  {
    "type": "ADDRESS_EVENT",
    "id": "7c21ed165e294db78b95f0f1",
    "attr": {
      "address": "FykfMwA9WNShzPJbbb9DNXsfgDgS3XZzWiFgrVXfWoPJ",
      "chain": "solana-mainnet",
      "url": "https://your-server.com/webhook",
      "conditions": []
    },
    "note": "Monitor Solana wallet"
  }
]
```

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Subscription type (ADDRESS_EVENT, INCOMING_NATIVE_TX, etc.) |
| `id` | string | Subscription ID |
| `attr.address` | string | Monitored blockchain address |
| `attr.chain` | string | Blockchain |
| `attr.url` | string | Webhook delivery URL |
| `attr.conditions` | array | Optional filtering conditions |
| `note` | string | Optional description |

---

### PUT /v4/subscription

**Response**: 204 No Content (empty body)

Used to enable HMAC webhook verification.

---

### DELETE /v4/subscription

**Response**: 204 No Content (empty body)

---

### GET /v4/subscription/count

**Response Body**:
```json
{
  "count": 42
}
```

---

### PUT /v4/subscription/{id}

**Response**: 204 No Content (empty body)

Used to update a specific subscription.

---

### DELETE /v4/subscription/{id}

**Response**: 204 No Content (empty body)

---

### PUT /v4/subscription/batch

**Response**: 204 No Content (empty body)

Used to update multiple subscriptions at once.

---

### GET /v4/subscription/webhook

**Response Body**: Array of executed webhook objects.
```json
[
  {
    "id": "7c21ed165e294db78b95f0f1",
    "type": "ADDRESS_EVENT",
    "subscriptionId": "7c21ed165e294db78b95f0f1",
    "url": "https://your-server.com/webhook",
    "data": {
      "kind": "transfer",
      "blockHash": "0x1234...",
      "blockNumber": 18500000,
      "blockTimestamp": 1699123456,
      "txId": "0xabcdef...",
      "from": "0x742d35Cc...",
      "to": "0x8ba1f109...",
      "value": "1000000000000000000",
      "subscriptionId": "7c21ed165e294db78b95f0f1",
      "subscriptionType": "ADDRESS_EVENT"
    },
    "timestamp": 1653320900353,
    "retryCount": 0,
    "failed": false,
    "response": {
      "code": 200,
      "data": "OK",
      "networkError": false
    }
  }
]
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Webhook execution ID |
| `type` | string | Subscription type |
| `subscriptionId` | string | Source subscription ID |
| `url` | string | Webhook delivery URL |
| `data` | object | Webhook payload data |
| `timestamp` | number | Execution time (ms since epoch) |
| `retryCount` | number | Number of retry attempts |
| `failed` | boolean | Whether delivery failed |
| `response.code` | number | HTTP response code from your server |
| `response.data` | string | Response body from your server |
| `response.networkError` | boolean | Whether error was network-related |

---

### GET /v4/subscription/webhook/count

**Response Body**:
```json
{
  "count": 156
}
```

---

### POST /v4/subscription/template

**Response Body**:
```json
{
  "id": "7c21ed165e294db78b95f0f1"
}
```

---

### GET /v4/subscription/template

**Response Body**: Array of notification templates.

**JSON template**:
```json
[
  {
    "id": "7c21ed165e294db78b95f0f1",
    "format": "json",
    "keys": {
      "from": "from",
      "to": "to",
      "value": "value",
      "txId": "txId"
    }
  }
]
```

**String template**:
```json
[
  {
    "id": "custom-string-template",
    "format": "string",
    "message": "{{from}} sent {{value}} {{tokenMetadata.symbol}} to {{to}}"
  }
]
```

**Available template variables**: kind, blockHash, blockNumber, blockTimestamp, txId, txTimestamp, from, to, value, currency, contractAddress, tokenId, logIndex, tokenMetadata, tokenMetadata.type, tokenMetadata.symbol, tokenMetadata.name, tokenMetadata.decimals, tokenMetadata.uri, subscriptionId, subscriptionType, type, address, counterAddress, amount, metadataURI, additionalData, topic_0, topic_1, topic_2, topic_3, data

---

### GET /v4/subscription/template/default

**Response Body**:
```json
{
  "templateId": "enriched"
}
```

---

### PUT /v4/subscription/template/default

**Response**: 204 No Content (empty body)

---

### PUT /v4/subscription/template/{id}

**Response**: 204 No Content (empty body)

---

### DELETE /v4/subscription/template/{id}

**Response**: 204 No Content (empty body)

---

## Webhook Payloads

When Tatum fires a webhook event, it sends a POST request to your URL. The payload structure depends on the template used.

### Enriched Template Payload (Default)

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
    "contractAddress": "0xA0b86a33E...",
    "tokenId": "12345",
    "tokenMetadata": {
      "type": "fungible",
      "decimals": 18,
      "symbol": "ETH",
      "name": "Ethereum"
    },
    "subscriptionId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "subscriptionType": "ADDRESS_EVENT"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `data.kind` | string | Transaction type (e.g., "transfer") |
| `data.blockHash` | string | Block hash |
| `data.blockNumber` | number | Block number |
| `data.blockTimestamp` | number | Block timestamp (seconds) |
| `data.txId` | string | Transaction hash |
| `data.currency` | string | Currency name |
| `data.from` | string | Sender address |
| `data.to` | string | Recipient address |
| `data.value` | string | Amount in smallest unit |
| `data.contractAddress` | string | Token contract address (if applicable) |
| `data.tokenId` | string | Token ID (for NFTs) |
| `data.tokenMetadata` | object | Token metadata (type, decimals, symbol, name, uri) |
| `data.subscriptionId` | string | Source subscription ID |
| `data.subscriptionType` | string | Subscription type |

### Contract Log Event Payload

```json
{
  "txId": "0xc98307f09ed527d5cff8305e8f65226b790e3317ded10b9e58f6f07286dcf8f1",
  "contractAddress": "0x55a2430e32dcebc3649120f26f917d1f0686f74c",
  "blockNumber": 32447538,
  "topic_0": "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
  "topic_1": "0x000000000000000000000000a91ab7d77892a559d2a95baaf1d748fc97c65d29",
  "topic_2": "0x0000000000000000000000009b08288c3be4f62bbf8d1c20ac9c5e6f9467d8b7",
  "topic_3": null,
  "logIndex": 45,
  "data": "0x...",
  "subscriptionId": "...",
  "subscriptionType": "CONTRACT_ADDRESS_LOG_EVENT"
}
```

### HMAC Verification

When HMAC is enabled via `PUT /v4/subscription`, the webhook includes an `x-payload-hash` header. To verify:

```javascript
const crypto = require('crypto');

function verifyWebhook(body, secret, headerHash) {
  const jsonString = JSON.stringify(body);
  const hash = crypto.createHmac('sha512', secret).update(jsonString).digest('base64');
  return hash === headerHash;
}

// Usage in webhook handler:
const isValid = verifyWebhook(req.body, hmacSecret, req.headers['x-payload-hash']);
```

---

## Chain-Specific V3 APIs

### TRON

#### GET /v3/tron/account/{address}

**Response Body**:
```json
{
  "address": "TGDqQAP5bduoPKVgdbk7fGyW4DwEt3RRn8",
  "balance": 2342342,
  "trc10": [
    {"key": "TEST_TRC_10", "value": 123}
  ],
  "trc20": [
    {"contractAddress": "TRkuKAxmWZ4G74MvZnFpoosQZsfvtNpmwH", "balance": 30958}
  ],
  "createTime": 1602848895000,
  "freeNetUsage": 1000,
  "freeNetLimit": 1500,
  "bandwidth": 1500,
  "netUsage": 5000,
  "netLimit": 5000,
  "assetIssuedId": "1003475",
  "assetIssuedName": 100
}
```

| Field | Type | Description |
|-------|------|-------------|
| `address` | string | Account address |
| `balance` | number | TRX balance in SUN (1 TRX = 1,000,000 SUN) |
| `trc10` | array | TRC-10 token balances (key/value pairs) |
| `trc20` | array | TRC-20 token balances (contractAddress/balance pairs) |
| `createTime` | number | Account creation date (UTC ms) |
| `freeNetUsage` | number | Free bandwidth used |
| `freeNetLimit` | number | Free bandwidth limit |
| `bandwidth` | number | Remaining bandwidth |

---

#### GET /v3/tron/trc10/detail/{idOrOwnerAddress}

**Response Body**:
```json
{
  "ownerAddress": "41d2803f9c22aa429d71554c9427e97ffedcec17c7",
  "name": "My token",
  "abbr": "SYM",
  "description": "My short description",
  "url": "https://mytoken.com",
  "totalSupply": 100000,
  "precision": 10,
  "id": 1000540
}
```

---

#### GET /v3/tron/transaction/account/{address}/trc20

**Response Body**: Array of TRC-20 transactions.
```json
[
  {
    "txID": "24dd2f121a24516f22df78adf1ccc32119e3edb7760297f76a925b879f2baa98",
    "from": "TPn72oEg7WPaffgNBf62vGx8G1s4chx2fp",
    "to": "TJyhbP1bQfo8tLPxEVjaka9gh2qkN7MvD3",
    "value": "1800",
    "type": "Transfer",
    "tokenInfo": {
      "symbol": "USDT",
      "address": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
      "decimals": 6,
      "name": "Tether USD"
    }
  }
]
```

---

#### GET /v3/tron/info

**Response Body**:
```json
{
  "blockNumber": 26585295,
  "hash": "000000000195a8cfe2ea4ca60ce921b30e95980a96c6bb1da4a35aa03da9c5a8",
  "testnet": false
}
```

| Field | Type | Description |
|-------|------|-------------|
| `blockNumber` | number | Current block height |
| `hash` | string | Current block hash |
| `testnet` | boolean | Whether mainnet or Shasta testnet |

---

#### POST /v3/tron/freezeBalance

**Response Body**:
```json
{
  "txId": "1234567890abcdef..."
}
```

| Field | Type | Description |
|-------|------|-------------|
| `txId` | string | Transaction hash (or `signatureId` if using KMS) |

---

#### POST /v3/tron/unfreezeBalance

**Response Body**: Same as `POST /v3/tron/freezeBalance` — returns `{ txId }` or `{ signatureId }`.

---

#### POST /v3/tron/trc10/deploy

**Response Body**: Same as freeze — returns `{ txId }` or `{ signatureId }`.

---

#### POST /v3/tron/trc20/deploy

**Response Body**: Same as freeze — returns `{ txId }` or `{ signatureId }`.

---

#### POST /v3/tron/trc10/transaction

**Response Body**: Same as freeze — returns `{ txId }` or `{ signatureId }`.

---

#### POST /v3/tron/trc20/transaction

**Response Body**: Same as freeze — returns `{ txId }` or `{ signatureId }`.

---

#### POST /v3/tron/wallet

**Response Body**:
```json
{
  "mnemonic": "urge pulp usage sister evidence arrest palm math please chief egg abuse",
  "xpub": "0244b3f40c6e570ae0032f6d7be87737a6c4e5314a4a1a82e22d0460a0d0cd794936c61f0c80dc74ace4cd04690d4eeb1aa6555883be006e1748306faa7ed3a26a"
}
```

---

### Stellar (XLM)

#### GET /v3/xlm/account/{account}

**Response Body**:
```json
{
  "id": "GBAF6NXN3DHSF357QBZLTBNWUTABKUODJXJYYE32ZDKA2QBM2H33IK6O",
  "account_id": "GBAF6NXN3DHSF357QBZLTBNWUTABKUODJXJYYE32ZDKA2QBM2H33IK6O",
  "sequence": "73014444032",
  "subentry_count": 2,
  "last_modified_ledger": 17000000,
  "thresholds": {
    "low_threshold": 0,
    "med_threshold": 0,
    "high_threshold": 0
  },
  "flags": {
    "auth_required": false,
    "auth_revocable": false,
    "auth_immutable": false
  },
  "balances": [
    {
      "balance": "100.0000000",
      "asset_type": "native"
    },
    {
      "balance": "50.0000000",
      "limit": "1000.0000000",
      "asset_type": "credit_alphanum4",
      "asset_code": "USDC",
      "asset_issuer": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
    }
  ],
  "signers": [
    {
      "weight": 1,
      "key": "GBAF6NXN3DHSF357QBZLTBNWUTABKUODJXJYYE32ZDKA2QBM2H33IK6O",
      "type": "ed25519_public_key"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `account_id` | string | Public key (base32) |
| `sequence` | string | Current sequence number |
| `balances` | array | Asset balances |
| `balances[].balance` | string | Balance amount |
| `balances[].asset_type` | string | "native", "credit_alphanum4", or "credit_alphanum12" |
| `balances[].asset_code` | string | Asset code (for non-native) |
| `balances[].asset_issuer` | string | Issuer address (for non-native) |

---

#### GET /v3/xlm/ledger/{sequence}

**Response Body**:
```json
{
  "id": "abcdef123456...",
  "sequence": 17000000,
  "hash": "abcdef123456...",
  "closed_at": "2024-01-15T12:00:00Z",
  "total_coins": "105443902087.3472865",
  "fee_pool": "1805172.1581587",
  "base_fee_in_stroops": 100,
  "base_reserve_in_stroops": 5000000,
  "max_tx_set_size": 1000,
  "protocol_version": 19
}
```

---

#### POST /v3/xlm/account

**Response Body**:
```json
{
  "address": "GBAF6NXN3DHSF357QBZLTBNWUTABKUODJXJYYE32ZDKA2QBM2H33IK6O",
  "secret": "SCZANGBA5YHTNYVVV3C7CAZMCLXPJLBTG3LZPSTMFG7IOVLAO7OFRGIA"
}
```

---

#### POST /v3/xlm/trust

**Response Body**:
```json
{
  "txId": "749e4f8933221b9942ef38a02856803f379789ec8d971f1f60535db70135673e"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `txId` | string | Transaction hash (or `signatureId` if using KMS) |

---

#### POST /v3/xlm/transaction

**Response Body**: Same as trust — returns `{ txId }` or `{ signatureId }`.

---

#### GET /v3/xlm/fee

**Response Body**:
```json
100
```

Returns a single number — the current fee in stroops (1 XLM = 10,000,000 stroops).

---

#### POST /v3/xlm/broadcast

**Response Body**:
```json
{
  "txId": "749e4f8933221b9942ef38a02856803f379789ec8d971f1f60535db70135673e"
}
```

---

### Ripple (XRP)

#### GET /v3/xrp/account/{account}

**Response Body**:
```json
{
  "account_data": {
    "Account": "rN7n3473SaZBCG4dFL83w7p1W9cgZw7PfM",
    "Balance": "5000000000",
    "Flags": 0,
    "LedgerEntryType": "AccountRoot",
    "OwnerCount": 3,
    "PreviousTxnID": "abc123...",
    "PreviousTxnLgrSeq": 73000000,
    "Sequence": 42,
    "index": "abc123..."
  },
  "ledger_current_index": 73000001,
  "validated": true
}
```

| Field | Type | Description |
|-------|------|-------------|
| `account_data.Account` | string | Account address |
| `account_data.Balance` | string | XRP balance in drops (1 XRP = 1,000,000 drops) |
| `account_data.Sequence` | number | Next valid transaction sequence |
| `account_data.OwnerCount` | number | Number of owned ledger objects |
| `validated` | boolean | Whether data is from validated ledger |

---

#### GET /v3/xrp/account/{account}/balance

**Response Body**:
```json
{
  "balance": "5000000000",
  "assets": [
    {
      "balance": "100.5",
      "currency": "USD"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `balance` | string | XRP balance in drops |
| `assets` | array | Non-XRP asset balances |
| `assets[].balance` | string | Asset balance |
| `assets[].currency` | string | Asset identifier |

---

#### GET /v3/xrp/ledger/{index}

**Response Body**:
```json
{
  "ledger": {
    "accepted": true,
    "account_hash": "abc123def456...",
    "close_flags": 0,
    "close_time": 1609980816,
    "close_time_human": "2021-01-07T00:53:36Z",
    "close_time_resolution": 10,
    "closed": true,
    "ledger_hash": "000000001E962F695F02A05B...",
    "ledger_index": "12345678",
    "parent_close_time": 1609980806,
    "parent_hash": "000000001D962F695F02A05B...",
    "total_coins": "100000000000000000",
    "transaction_hash": "abc123def456..."
  },
  "ledger_hash": "000000001E962F695F02A05B...",
  "ledger_index": 12345678,
  "validated": true
}
```

| Field | Type | Description |
|-------|------|-------------|
| `ledger.close_time` | number | Ledger close time (Ripple epoch seconds) |
| `ledger.close_time_human` | string | Human-readable close time |
| `ledger.ledger_index` | string | Ledger sequence number |
| `ledger.total_coins` | string | Total XRP in drops |
| `validated` | boolean | Whether from validated ledger |

---

#### POST /v3/xrp/account

**Response Body**:
```json
{
  "address": "rDA3DJBUBjA1X3PtLLFAEXxX31oA5nL3QF",
  "secret": "snJnaS4BWxNP71tCi7PFRvavfTvWC"
}
```

---

#### POST /v3/xrp/trust

**Response Body**:
```json
{
  "txId": "1A32A054B04AC9D6814710DDCA416E72C4CD2D78D6C3DFC06CC9369CC4F6B250"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `txId` | string | Transaction hash (or `signatureId` if using KMS) |

---

#### POST /v3/xrp/transaction

**Response Body**: Same as trust — returns `{ txId }` or `{ signatureId }`.

---

#### POST /v3/xrp/broadcast

**Response Body**:
```json
{
  "txId": "1A32A054B04AC9D6814710DDCA416E72C4CD2D78D6C3DFC06CC9369CC4F6B250"
}
```

---

#### GET /v3/xrp/fee

**Response Body**:
```json
{
  "current_ledger_size": "50",
  "current_queue_size": "10",
  "drops": {
    "base_fee": "10",
    "median_fee": "5000",
    "minimum_fee": "10",
    "open_ledger_fee": "10"
  },
  "expected_ledger_size": "1000",
  "ledger_current_index": 73000000,
  "levels": {
    "median_level": "128000",
    "minimum_level": "256",
    "open_ledger_level": "256",
    "reference_level": "256"
  },
  "max_queue_size": "2000"
}
```

---

### Cardano (ADA)

#### GET /v3/ada/info

**Response Body**:
```json
{
  "testnet": "false",
  "tip": {
    "number": 9500000,
    "slotNo": 105000000,
    "epoch": {
      "number": 450
    }
  }
}
```

---

#### GET /v3/ada/block/{hash}

**Response Body**:
```json
{
  "hash": "abc123...",
  "number": 9500000,
  "epochNo": 450,
  "slotNo": 105000000,
  "forgedAt": "2024-01-15T12:00:00Z",
  "transactions": []
}
```

---

#### GET /v3/ada/transaction/{hash}

**Response Body**:
```json
{
  "hash": "abc123...",
  "fee": "0.17",
  "block": {
    "number": 9500000,
    "hash": "def456..."
  },
  "inputs": [
    {
      "txHash": "prev123...",
      "value": "5000000",
      "address": "addr1q..."
    }
  ],
  "outputs": [
    {
      "value": "3000000",
      "index": 0,
      "txHash": "abc123...",
      "address": "addr1q..."
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `hash` | string | Transaction hash |
| `fee` | string | Fee in ADA |
| `inputs` | array | Transaction inputs |
| `inputs[].value` | string | Value in Lovelace (1 ADA = 1,000,000 Lovelace) |
| `outputs` | array | Transaction outputs (AdaUTXO objects) |
| `outputs[].value` | string | Value in ADA |

---

#### POST /v3/ada/wallet

**Response Body**:
```json
{
  "mnemonic": "urge pulp usage sister evidence arrest palm math please chief egg abuse",
  "xpub": "30e96a57be6235c686da968c1860f69d1871a692b29626b7ebb923aff8c6731cb9fef3a26b7eba8a07653483d06427d0c07966c5f81c69a7925d714530bedb1ef..."
}
```

| Field | Type | Description |
|-------|------|-------------|
| `mnemonic` | string | Generated 24-word mnemonic |
| `xpub` | string | Extended public key (BIP44 derivation) |

---

#### POST /v3/ada/wallet/priv

**Response Body**:
```json
{
  "key": "a]4d2803f9c22aa429d71554c9427e97ffedcec17c7..."
}
```

| Field | Type | Description |
|-------|------|-------------|
| `key` | string | Generated private key |

---

#### GET /v3/ada/{address}/utxos

**Response Body**: Array of UTXOs.
```json
[
  {
    "value": "5.0",
    "index": 0,
    "txHash": "abc123...",
    "address": "addr1q..."
  }
]
```

---

#### POST /v3/ada/broadcast

**Response Body**:
```json
{
  "txId": "1451692ebbfbea1a2d2ec6fe6782596b6aa2e46c0589d04c406f491b5b46bc6a"
}
```

---

### Algorand

#### GET /v3/algorand/node/indexer/{xApiKey}/{path}

**Response Body**: Proxied response from the Algorand Indexer API. Structure varies based on the path queried.

```json
{
  "id": "HNIQ76UTJYPOLZP5FWODYABBJPYPGJNEM2QEJSMDMQRWEKHEYJHQ",
  "confirmedRound": 16775567,
  "fee": 0.001,
  "sender": "U6QEM4KM7KKGCLH4FELZBGJEVVSF556ELXHUOZC4ESPFS4O4V4VQXKQRXQ",
  "txType": "pay"
}
```

---

#### GET /v3/algorand/node/algod/{xApiKey}/{path}

**Response Body**: Proxied response from the Algorand Algod API. Structure varies based on the path queried.

```json
{
  "genesisHash": "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
  "genesisId": "testnet-v1.0",
  "round": 16775567,
  "timestamp": 1632167753
}
```

---

#### POST /v3/algorand/asset/receive

**Response Body**:
```json
{
  "txId": "GTNOIDCIHZLESKNQPJXOXE476ODYDNNQBA3N2Q75MYQ4SI4XL5SA",
  "assetIndex": 87751984,
  "confirmed": false,
  "failed": false
}
```

| Field | Type | Description |
|-------|------|-------------|
| `txId` | string | Transaction hash |
| `assetIndex` | number | Index of the ASA asset |
| `confirmed` | boolean | Whether confirmed within 5 rounds |
| `failed` | boolean | Whether broadcast but failed during signing |

---

#### POST /v3/algorand/wallet

**Response Body**:
```json
{
  "address": "NTAESFCB3WOD7SAOL42KSPVARLB3JFA3MNX3AESWHYVT2RMYDVZI6YLG4Y",
  "secret": "NBYMCVEEDFYV3TPWVRE6APE7PKHUJD4XAKXCKNCLKGUXOC3LFNJGZQCJCRA53HB7ZAHF6NFJH2QIVQ5USQNWG35QCJLD4KZ5IWMB24Q",
  "mnemonic": "work syrup plug fluid moon regret wolf visa muffin supply erode lemon absurd voyage plastic blade baby stable burger glue dynamic expire cabin abandon pilot"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `address` | string | Algorand account address (58 chars) |
| `secret` | string | Secret key (103 chars) |
| `mnemonic` | string | 25-word mnemonic phrase |
