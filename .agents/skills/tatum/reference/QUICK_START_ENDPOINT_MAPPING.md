# Quick Start - Endpoint Chain Support Mapping

## File Location
```
.claude/skills/tatum/reference/endpoint-chain-support.json
```

## Quick Examples

### 1. Load the mapping
```javascript
const fs = require('fs');
const mapping = JSON.parse(fs.readFileSync('endpoint-chain-support.json'));
```

### 2. Check if an endpoint supports a chain
```javascript
const endpoint = 'GET /v4/data/nft/balances';
const chain = 'polygon-mainnet';
const isSupported = mapping.endpoints[endpoint].supportedChains.includes(chain);
console.log(`Supports ${chain}: ${isSupported}`); // true
```

### 3. Get all chains for an endpoint
```javascript
const endpoint = 'GET /v4/data/wallet/portfolio';
const chains = mapping.endpoints[endpoint].supportedChains;
console.log(`Supported chains (${chains.length}):`, chains);
// Output: 24 chains including ethereum-mainnet, solana-mainnet, etc.
```

### 4. Find all endpoints for a specific chain
```javascript
const chain = 'solana-mainnet';
const endpoints = Object.entries(mapping.endpoints)
  .filter(([_, info]) => info.supportedChains.includes(chain))
  .map(([endpoint, info]) => ({
    endpoint,
    category: info.category,
    summary: info.summary
  }));
console.log(`Endpoints supporting ${chain}:`, endpoints.length);
```

### 5. Get endpoints by category
```javascript
const category = 'NFT API';
const endpoints = mapping.categories[category];
console.log(`${category} endpoints:`, endpoints);
// Output: ['GET /v4/data/collections', 'GET /v4/data/metadata', ...]
```

### 6. Filter by chain type
```javascript
const chainType = 'EVM-only';
const endpoints = mapping.chainTypes[chainType];
console.log(`${chainType} endpoints (${endpoints.length}):`, endpoints);
// Output: 34 endpoints that only support EVM chains
```

### 7. Get all available chains
```javascript
const allChains = mapping.allSupportedChains;
console.log(`Total chains: ${allChains.length}`);
console.log('All chains:', allChains);
// Output: 78 unique blockchain identifiers
```

### 8. Validate user input
```javascript
function isValidChainForEndpoint(endpoint, chain) {
  const endpointInfo = mapping.endpoints[endpoint];
  if (!endpointInfo) {
    return { valid: false, error: 'Invalid endpoint' };
  }
  
  const isSupported = endpointInfo.supportedChains.includes(chain);
  if (!isSupported) {
    return {
      valid: false,
      error: `Chain ${chain} not supported. Valid chains: ${endpointInfo.supportedChains.join(', ')}`
    };
  }
  
  return { valid: true };
}

// Usage
const result = isValidChainForEndpoint('GET /v4/data/nft/balances', 'bitcoin-mainnet');
console.log(result); // { valid: false, error: 'Chain bitcoin-mainnet not supported...' }
```

### 9. Get endpoint metadata
```javascript
const endpoint = 'GET /v4/data/collections';
const info = mapping.endpoints[endpoint];
console.log({
  method: info.method,
  totalChains: info.totalChains,
  chainType: info.chainType,
  category: info.category,
  summary: info.summary,
  operationId: info.operationId
});
```

### 10. Find most versatile endpoints
```javascript
const sortedByChainCount = Object.entries(mapping.endpoints)
  .sort((a, b) => b[1].totalChains - a[1].totalChains)
  .slice(0, 5);

console.log('Top 5 endpoints by chain support:');
sortedByChainCount.forEach(([endpoint, info]) => {
  console.log(`${endpoint}: ${info.totalChains} chains`);
});
```

## Common Use Cases

### Validate API Request
```javascript
function validateRequest(endpoint, params) {
  const endpointInfo = mapping.endpoints[endpoint];
  
  if (!endpointInfo) {
    throw new Error(`Unknown endpoint: ${endpoint}`);
  }
  
  if (params.chain && !endpointInfo.supportedChains.includes(params.chain)) {
    throw new Error(
      `Chain ${params.chain} not supported for ${endpoint}. ` +
      `Supported chains: ${endpointInfo.supportedChains.join(', ')}`
    );
  }
  
  return true;
}
```

### Get Suggested Chains
```javascript
function getSuggestedChains(endpoint, preferredType = 'mainnet') {
  const info = mapping.endpoints[endpoint];
  if (!info) return [];
  
  return info.supportedChains.filter(chain => 
    preferredType === 'mainnet' ? chain.includes('mainnet') : chain.includes('testnet')
  );
}

const mainnets = getSuggestedChains('GET /v4/data/nft/balances', 'mainnet');
console.log('Suggested mainnets:', mainnets);
```

### Build Chain Selector UI
```javascript
function getChainOptionsForEndpoint(endpoint) {
  const info = mapping.endpoints[endpoint];
  if (!info) return [];
  
  return info.supportedChains.map(chain => ({
    value: chain,
    label: chain.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    type: info.chainType
  }));
}
```

## Data Structure Reference

```json
{
  "metadata": {
    "totalEndpoints": 74,
    "totalCategories": 11,
    "totalUniqueChains": 78,
    "generatedAt": "2026-04-17",
    "source": "core-api/libs/api/data-api/src/lib/openapi.yaml"
  },
  "endpoints": {
    "GET /v4/data/endpoint": {
      "method": "GET",
      "supportedChains": ["ethereum-mainnet", ...],
      "chainEnumSchema": "ChainEnumName",
      "chainType": "EVM-only",
      "category": "Category Name",
      "totalChains": 10,
      "summary": "Description",
      "operationId": "OperationId"
    }
  },
  "categories": {
    "NFT API": ["GET /v4/data/collections", ...]
  },
  "chainTypes": {
    "EVM-only": ["GET /v4/data/metadata", ...]
  },
  "allSupportedChains": ["ethereum-mainnet", ...]
}
```

## Chain Type Categories

- **EVM-only**: Only EVM-compatible chains (Ethereum, BSC, Polygon, etc.)
- **EVM + Other**: EVM chains + non-EVM (Solana, Tezos, etc.)
- **EVM + UTXO**: EVM chains + UTXO-based (Bitcoin, Litecoin, etc.)
- **UTXO-only**: Only UTXO-based chains
- **Multiple chains**: Various chain types
- **Single chain**: Chain-agnostic (e.g., exchange rate by symbol)
- **Solana-only**: Only Solana network

## Stats at a Glance

- **Total Endpoints**: 74
- **Total Chains**: 78
- **Categories**: 11
- **Largest Category**: Marketplace (18 endpoints)
- **Most Common Type**: EVM-only (34 endpoints)
- **Widest Support**: Blockchains API (up to 69 chains per endpoint)

## Full Documentation

For complete documentation, see:
- `ENDPOINT_CHAIN_MAPPING_README.md` - Detailed reference
- `ENDPOINT_CHAIN_MAPPING_SUMMARY.md` - High-level overview
