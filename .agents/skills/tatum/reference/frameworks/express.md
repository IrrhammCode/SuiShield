# Express.js Integration Pattern

This document shows how to integrate Tatum API into an Express.js application.

## Project Structure

```
project/
├── package.json
├── .env
├── .env.example
├── src/
│   ├── index.js (or app.js)
│   ├── services/
│   │   └── tatumService.js          # CREATE THIS
│   ├── controllers/
│   │   └── balanceController.js     # CREATE THIS
│   └── routes/
│       └── balance.js                # CREATE THIS
```

## File 1: src/services/tatumService.js

```javascript
const axios = require('axios');

class TatumService {
  constructor() {
    this.apiKey = process.env.TATUM_API_KEY;
    this.baseUrl = 'https://api.tatum.io';

    if (!this.apiKey) {
      throw new Error('TATUM_API_KEY environment variable is required');
    }
  }

  /**
   * Get native balance for an address
   * @param {string} chain - Chain identifier (e.g., 'ethereum-mainnet')
   * @param {string} address - Wallet address
   * @returns {Promise<Object>} Balance information
   */
  async getBalance(chain, address) {
    try {
      const response = await axios.get(`${this.baseUrl}/v4/data/blockchains/balance`, {
        headers: {
          'x-api-key': this.apiKey
        },
        params: {
          chain,
          address
        }
      });

      const { balance, decimals, symbol } = response.data;

      // Convert from smallest unit (wei) to main unit (ETH)
      const balanceFormatted = Number(BigInt(balance)) / (10 ** decimals);

      return {
        address,
        chain,
        balance: balanceFormatted,
        symbol,
        rawBalance: balance
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get token balances (ERC-20, SPL, TRC-20)
   * @param {string} chain - Chain identifier
   * @param {string} address - Wallet address
   * @returns {Promise<Array>} List of token balances
   */
  async getTokenBalances(chain, address) {
    try {
      const response = await axios.get(`${this.baseUrl}/v4/data/balances`, {
        headers: {
          'x-api-key': this.apiKey
        },
        params: {
          addresses: address, // Note: parameter name is "addresses"
          chain
        }
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get NFT balances (ERC-721, ERC-1155)
   * @param {string} chain - Chain identifier
   * @param {string} address - Wallet address
   * @returns {Promise<Array>} List of NFTs
   */
  async getNFTBalances(chain, address) {
    try {
      const response = await axios.get(`${this.baseUrl}/v4/data/nft/balances`, {
        headers: {
          'x-api-key': this.apiKey
        },
        params: {
          address, // Note: parameter name is "address" (singular)
          chain
        }
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get exchange rate for a cryptocurrency
   * @param {string} symbol - Token symbol (e.g., 'ETH', 'BTC')
   * @param {string} baseCurrency - Base currency (e.g., 'USD')
   * @returns {Promise<Object>} Exchange rate information
   */
  async getExchangeRate(symbol, baseCurrency = 'USD') {
    try {
      const response = await axios.get(`${this.baseUrl}/v4/data/rate/symbol`, {
        headers: {
          'x-api-key': this.apiKey
        },
        params: {
          symbol,
          basePair: baseCurrency
        }
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - Axios error
   * @returns {Error} Formatted error
   */
  handleError(error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      switch (status) {
        case 401:
        case 403:
          return new Error('Authentication failed. Please check your API key.');
        case 404:
          return new Error('Resource not found. Please verify the address and chain.');
        case 429:
          return new Error('Rate limit exceeded. Please try again later.');
        default:
          return new Error(`Tatum API error: ${message}`);
      }
    }
    return error;
  }
}

module.exports = new TatumService();
```

## File 2: src/controllers/balanceController.js

```javascript
const tatumService = require('../services/tatumService');

/**
 * Get balance for an address
 */
exports.getBalance = async (req, res) => {
  try {
    const { chain, address } = req.params;

    // Validate parameters
    if (!chain || !address) {
      return res.status(400).json({
        error: 'Chain and address parameters are required'
      });
    }

    const balance = await tatumService.getBalance(chain, address);

    res.json(balance);
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(error.response?.status || 500).json({
      error: error.message
    });
  }
};

/**
 * Get token balances for an address
 */
exports.getTokenBalances = async (req, res) => {
  try {
    const { chain, address } = req.params;

    if (!chain || !address) {
      return res.status(400).json({
        error: 'Chain and address parameters are required'
      });
    }

    const balances = await tatumService.getTokenBalances(chain, address);

    res.json(balances);
  } catch (error) {
    console.error('Error fetching token balances:', error);
    res.status(error.response?.status || 500).json({
      error: error.message
    });
  }
};

/**
 * Get NFT balances for an address
 */
exports.getNFTBalances = async (req, res) => {
  try {
    const { chain, address } = req.params;

    if (!chain || !address) {
      return res.status(400).json({
        error: 'Chain and address parameters are required'
      });
    }

    const nfts = await tatumService.getNFTBalances(chain, address);

    res.json(nfts);
  } catch (error) {
    console.error('Error fetching NFT balances:', error);
    res.status(error.response?.status || 500).json({
      error: error.message
    });
  }
};

/**
 * Get exchange rate
 */
exports.getExchangeRate = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { baseCurrency } = req.query;

    if (!symbol) {
      return res.status(400).json({
        error: 'Symbol parameter is required'
      });
    }

    const rate = await tatumService.getExchangeRate(symbol, baseCurrency);

    res.json(rate);
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    res.status(error.response?.status || 500).json({
      error: error.message
    });
  }
};
```

## File 3: src/routes/balance.js

```javascript
const express = require('express');
const router = express.Router();
const balanceController = require('../controllers/balanceController');

// Get native balance
router.get('/balance/:chain/:address', balanceController.getBalance);

// Get token balances
router.get('/tokens/:chain/:address', balanceController.getTokenBalances);

// Get NFT balances
router.get('/nft/:chain/:address', balanceController.getNFTBalances);

// Get exchange rate
router.get('/price/:symbol', balanceController.getExchangeRate);

module.exports = router;
```

## File 4: src/index.js (UPDATE THIS)

Add the balance routes to your Express app:

```javascript
const express = require('express');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

// Routes
const balanceRoutes = require('./routes/balance'); // ADD THIS
app.use('/api', balanceRoutes); // ADD THIS

// ... rest of your routes ...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## File 5: .env (UPDATE THIS)

Add your Tatum API key:

```env
TATUM_API_KEY=your-api-key-here
PORT=3000
```

## File 6: .env.example (CREATE THIS)

```env
TATUM_API_KEY=
PORT=3000
```

## File 7: package.json (UPDATE DEPENDENCIES)

Install axios if not already present:

```bash
npm install axios dotenv
```

Make sure package.json includes:

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "dotenv": "^16.0.0",
    "express": "^4.18.0"
  }
}
```

## Testing the Integration

### 1. Start the server

```bash
npm start
```

### 2. Test the endpoints

**Get Ethereum balance:**
```bash
curl http://localhost:3000/api/balance/ethereum-mainnet/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Get token balances:**
```bash
curl http://localhost:3000/api/tokens/ethereum-mainnet/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Get NFT balances:**
```bash
curl http://localhost:3000/api/nft/ethereum-mainnet/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Get ETH to USD exchange rate:**
```bash
curl http://localhost:3000/api/price/ETH?baseCurrency=USD
```

## Expected Responses

**Balance:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "chain": "ethereum-mainnet",
  "balance": 1.234567,
  "symbol": "ETH",
  "rawBalance": "1234567000000000000"
}
```

**Exchange Rate:**
```json
{
  "value": 2145.67,
  "currency": "USD"
}
```

## Error Handling

The service includes proper error handling for:
- ✅ Invalid API key (401/403)
- ✅ Resource not found (404)
- ✅ Rate limiting (429)
- ✅ Network errors
- ✅ Invalid parameters

## Chain Normalization

Remember to normalize chain names:
- User says "ethereum" → Use "ethereum-mainnet"
- User says "btc" → Use "bitcoin-mainnet"
- User says "polygon" → Use "polygon-mainnet"

Load `reference/chain_identifiers.json` for complete mappings.

## Integration Checklist

When integrating into an Express.js project:

- [ ] Create `src/services/tatumService.js`
- [ ] Create `src/controllers/balanceController.js`
- [ ] Create `src/routes/balance.js`
- [ ] Update `src/index.js` to register routes
- [ ] Install dependencies: `npm install axios dotenv`
- [ ] Add `TATUM_API_KEY` to `.env`
- [ ] Create `.env.example`
- [ ] Test endpoints with curl
- [ ] Verify error handling works

## Notes

- Always use v4 endpoints for READ operations
- Convert wei to ETH using: `balance / (10 ** decimals)`
- Load API key from environment variables (never hardcode)
- Implement proper error handling
- Normalize chain names before making API calls
