# Tatum Data API v4 - Quick Reference

## All 75 v4 Endpoints

### Blockchains API (12 endpoints)
```
GET  /v4/data/blockchains/balance
GET  /v4/data/blockchains/balance/batch
GET  /v4/data/blockchains/block
GET  /v4/data/blockchains/block/current
GET  /v4/data/blockchains/block/hash
GET  /v4/data/blockchains/mempool
GET  /v4/data/blockchains/transaction
GET  /v4/data/blockchains/transaction/count
GET  /v4/data/blockchains/transaction/internal
GET  /v4/data/blockchains/transaction/history/utxos
POST /v4/data/blockchains/transaction/history/utxos/batch
GET  /v4/data/blockchains/utxo/info
```

### DeFi API (4 endpoints)
```
GET /v4/data/block/time
GET /v4/data/defi/blocks
GET /v4/data/defi/blocks/latest
GET /v4/data/defi/events
```

### Fee Estimation API (1 endpoint)
```
POST /v4/blockchainOperations/gas
```

### Marketplace (18 endpoints)
```
GET /v4/data/marketplace/cryptoslam/chain/trades
GET /v4/data/marketplace/cryptoslam/chain/trades/dna
GET /v4/data/marketplace/cryptoslam/chain/transfers
GET /v4/data/marketplace/cryptoslam/chain/transfers/dna
GET /v4/data/marketplace/cryptoslam/pair/trades
GET /v4/data/marketplace/cryptoslam/pair/trades/dna
GET /v4/data/marketplace/cryptoslam/token/holder/reputation
GET /v4/data/marketplace/cryptoslam/token/price
GET /v4/data/marketplace/cryptoslam/token/price/exotic
GET /v4/data/marketplace/cryptoslam/token/price/exotic/history
GET /v4/data/marketplace/cryptoslam/token/price/history
GET /v4/data/marketplace/cryptoslam/token/trades
GET /v4/data/marketplace/cryptoslam/token/transfers
GET /v4/data/marketplace/cryptoslam/token/transfers/dna
GET /v4/data/marketplace/cryptoslam/wallet/trades
GET /v4/data/marketplace/cryptoslam/wallet/trades/dna
GET /v4/data/marketplace/cryptoslam/wallet/transfers
GET /v4/data/marketplace/cryptoslam/wallet/transfers/dna
```

### Mining API (2 endpoints)
```
GET /v4/data/mining/rewards
GET /v4/data/mining/totalRewards
```

### NFT API (6 endpoints)
```
GET /v4/data/collections
GET /v4/data/metadata
GET /v4/data/multitoken/balances
GET /v4/data/nft/balances
GET /v4/data/owners
GET /v4/data/owners/address
```

### Staking (7 endpoints)
```
GET /v4/data/staking/liquid/current-assets
GET /v4/data/staking/liquid/pools
GET /v4/data/staking/native/current-assets
GET /v4/data/staking/native/current-assets-by-validator
GET /v4/data/staking/native/pools
GET /v4/data/staking/native/rewards
GET /v4/data/staking/native/transactions
```

### Token API (6 endpoints)
```
GET /v4/data/tokens
GET /v4/data/tokens/newest
GET /v4/data/tokens/popular
GET /v4/data/tokens/popular/history
GET /v4/data/tokens/trending
GET /v4/data/transactions/dna
```

### Transactions API (2 endpoints)
```
GET /v4/data/transaction/history
GET /v4/data/transactions/hash
```

### Exchange Rate API (9 endpoints)
```
GET  /v4/data/rate/contract
POST /v4/data/rate/contract/batch
GET  /v4/data/rate/history
GET  /v4/data/rate/price-change
POST /v4/data/rate/price-change/batch
GET  /v4/data/rate/symbol
POST /v4/data/rate/symbol/batch
GET  /v4/data/rate/symbol/OHLCV
GET  /v4/data/rate/symbol/OHLCV/batch
```

### Wallet API (7 endpoints)
```
GET  /v4/data/utxos
POST /v4/data/utxos/batch
GET  /v4/data/wallet/balance/time
GET  /v4/data/wallet/portfolio
GET  /v4/data/wallet/reputation
GET  /v4/data/wallet/reputation/portfolio
GET  /v4/data/wallet/reputation/tokens
```

### Web3 Name Service (1 endpoint)
```
GET /v4/data/ns/name
```

## HTTP Method Distribution

- **GET:** 69 endpoints (92%)
- **POST:** 6 endpoints (8%)

## Top Endpoints by Functionality

### Balance & Portfolio Queries
- `/v4/data/wallet/portfolio` - Complete portfolio (native, fungible, NFT)
- `/v4/data/wallet/balance/time` - Historical balance
- `/v4/data/blockchains/balance` - Native balance
- `/v4/data/blockchains/balance/batch` - Batch balance queries

### NFT Operations
- `/v4/data/nft/balances` - NFT holdings
- `/v4/data/collections` - Collection tokens
- `/v4/data/metadata` - Token metadata
- `/v4/data/owners` - Token owners

### Transaction History
- `/v4/data/transaction/history` - Comprehensive transaction history
- `/v4/data/transactions/hash` - Query by hash
- `/v4/data/blockchains/transaction` - Blockchain transaction
- `/v4/data/blockchains/transaction/internal` - Internal transactions

### Marketplace Data
- `/v4/data/marketplace/cryptoslam/token/trades` - Token trades
- `/v4/data/marketplace/cryptoslam/wallet/trades` - Wallet trades
- `/v4/data/marketplace/cryptoslam/chain/trades` - Chain trades
- DNA variants for advanced filtering

### Reputation & Analytics
- `/v4/data/wallet/reputation` - Wallet reputation (5000 credits)
- `/v4/data/wallet/reputation/portfolio` - Portfolio reputation (10000 credits)
- `/v4/data/wallet/reputation/tokens` - Token-specific reputation (1500 credits)
- `/v4/data/marketplace/cryptoslam/token/holder/reputation` - Holder reputation

### Token Discovery
- `/v4/data/tokens/trending` - Trending tokens
- `/v4/data/tokens/newest` - Newest tokens
- `/v4/data/tokens/popular` - Popular tokens

### Staking
- `/v4/data/staking/native/current-assets` - Current staked assets
- `/v4/data/staking/native/rewards` - Staking rewards
- `/v4/data/staking/liquid/current-assets` - Liquid staking

### Exchange Rates
- `/v4/data/rate/symbol` - Exchange rate by symbol
- `/v4/data/rate/symbol/OHLCV` - OHLCV candle data
- `/v4/data/rate/price-change` - Price changes

## Common Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `chain` | string (enum) | Blockchain identifier | `ethereum-mainnet` |
| `address` / `addresses` | string | Wallet address(es) | `0x...` |
| `tokenAddress` | string | Token contract address | `0x...` |
| `tokenId` | string | Token ID | `123` |
| `blockNumber` | integer | Block number | `16499510` |
| `blockFrom` / `blockTo` | integer | Block range | `16000000` |
| `time` | string | ISO timestamp | `2024-01-01T00:00:00Z` |
| `unix` | integer | Unix timestamp | `1704067200` |
| `pageSize` | integer | Items per page (max 50) | `50` |
| `offset` | integer | Pagination offset | `0` |
| `transactionTypes` | string | Filter by type | `fungible,nft` |
| `excludeMetadata` | boolean | Exclude metadata | `true` |

## Supported Blockchain Networks

### EVM Chains
- Ethereum (mainnet, sepolia, holesky)
- Base (mainnet, sepolia)
- Arbitrum (mainnet, testnet)
- BNB Smart Chain (mainnet, testnet)
- Polygon (mainnet, amoy)
- Optimism (mainnet, testnet)
- Berachain (mainnet)
- Unichain (mainnet, sepolia)
- Monad (mainnet, testnet)
- Celo (mainnet, testnet)
- Chiliz (mainnet)
- Moca Chain (devnet)

### Non-EVM Chains
- Solana (mainnet, devnet)
- Bitcoin (mainnet)
- Tezos (mainnet)
- Algorand (mainnet, testnet)

## Credit Costs (Selected Endpoints)

| Endpoint | Credits | Notes |
|----------|---------|-------|
| Collection queries | 20 | Per API call |
| Metadata queries | 10 | Per API call |
| Portfolio queries | 50 | Per API call |
| NFT balance | 50 | Per API call |
| Transaction history | 20 | Per API call |
| Transaction by hash | 10 | Per API call |
| Historical balance | 100 | Per API call |
| DeFi events | 50 | Per API call |
| Wallet reputation | 5000 | 500 for free tier (cached) |
| Reputation portfolio | 10000 | 1000 for free tier (cached) |
| Reputation tokens | 1500 | 150 for free tier (cached) |

## Example Queries

### Get Wallet Portfolio
```
GET /v4/data/wallet/portfolio?chain=ethereum-mainnet&addresses=0x...&tokenTypes=fungible
```

### Get NFT Collection
```
GET /v4/data/collections?chain=ethereum-mainnet&collectionAddresses=0x...&pageSize=50
```

### Get Transaction History
```
GET /v4/data/transaction/history?chain=ethereum-mainnet&addresses=0x...&transactionTypes=fungible,nft
```

### Get Historical Balance
```
GET /v4/data/wallet/balance/time?chain=ethereum-mainnet&addresses=0x...&blockNumber=16499510
```

### Get Token Metadata
```
GET /v4/data/metadata?chain=ethereum-mainnet&tokenAddress=0x...&tokenIds=1,2,3
```

### Check Token Ownership
```
GET /v4/data/owners/address?chain=ethereum-mainnet&address=0x...&tokenAddress=0x...&tokenId=123
```

### Get Staking Rewards
```
GET /v4/data/staking/native/rewards?chain=solana-mainnet&stakeAddress=...&epochFrom=870
```

### Resolve Domain Name
```
GET /v4/data/ns/name?chain=ethereum-mainnet&name=vitalik.eth
```

## Related Documentation

- **Detailed Parameters:** `api-parameters.md` - Complete parameter details for all endpoints
- **Chain Support:** `endpoint-chain-support.json` - Supported chains per endpoint
- **Chain Identifiers:** `chain_identifiers.json` - Chain name mappings
