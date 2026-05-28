# FastAPI Integration Pattern

This document shows how to integrate Tatum API into a FastAPI application.

## Project Structure

```
project/
├── pyproject.toml (or requirements.txt)
├── .env
├── .env.example
├── app/
│   ├── main.py
│   ├── services/
│   │   └── tatum_service.py          # CREATE THIS
│   ├── routers/
│   │   └── balance.py                # CREATE THIS
│   └── models/
│       └── balance.py                # CREATE THIS
```

## File 1: app/services/tatum_service.py

```python
import os
import httpx
from typing import Dict, List, Any, Optional

class TatumService:
    def __init__(self):
        self.api_key = os.getenv('TATUM_API_KEY')
        self.base_url = 'https://api.tatum.io'

        if not self.api_key:
            raise ValueError('TATUM_API_KEY environment variable is required')

    async def get_balance(self, chain: str, address: str) -> Dict[str, Any]:
        """
        Get native balance for an address

        Args:
            chain: Chain identifier (e.g., 'ethereum-mainnet')
            address: Wallet address

        Returns:
            Balance information dictionary
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f'{self.base_url}/v4/data/blockchains/balance',
                    headers={'x-api-key': self.api_key},
                    params={'chain': chain, 'address': address}
                )
                response.raise_for_status()
                data = response.json()

                # Convert from smallest unit (wei) to main unit (ETH)
                balance_raw = int(data['balance'])
                decimals = data['decimals']
                balance_formatted = balance_raw / (10 ** decimals)

                return {
                    'address': address,
                    'chain': chain,
                    'balance': balance_formatted,
                    'symbol': data['symbol'],
                    'raw_balance': data['balance']
                }
            except httpx.HTTPStatusError as e:
                raise self._handle_error(e)

    async def get_token_balances(self, chain: str, address: str) -> List[Dict[str, Any]]:
        """
        Get token balances (ERC-20, SPL, TRC-20)

        Args:
            chain: Chain identifier
            address: Wallet address

        Returns:
            List of token balances
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f'{self.base_url}/v4/data/balances',
                    headers={'x-api-key': self.api_key},
                    params={'addresses': address, 'chain': chain}  # Note: "addresses" parameter
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                raise self._handle_error(e)

    async def get_nft_balances(self, chain: str, address: str) -> List[Dict[str, Any]]:
        """
        Get NFT balances (ERC-721, ERC-1155)

        Args:
            chain: Chain identifier
            address: Wallet address

        Returns:
            List of NFTs
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f'{self.base_url}/v4/data/nft/balances',
                    headers={'x-api-key': self.api_key},
                    params={'address': address, 'chain': chain}  # Note: "address" singular
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                raise self._handle_error(e)

    async def get_exchange_rate(self, symbol: str, base_currency: str = 'USD') -> Dict[str, Any]:
        """
        Get exchange rate for a cryptocurrency

        Args:
            symbol: Token symbol (e.g., 'ETH', 'BTC')
            base_currency: Base currency (e.g., 'USD')

        Returns:
            Exchange rate information
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f'{self.base_url}/v4/data/rate/symbol',
                    headers={'x-api-key': self.api_key},
                    params={'symbol': symbol, 'basePair': base_currency}
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                raise self._handle_error(e)

    def _handle_error(self, error: httpx.HTTPStatusError) -> Exception:
        """
        Handle API errors

        Args:
            error: httpx HTTPStatusError

        Returns:
            Formatted exception
        """
        status = error.response.status_code

        try:
            message = error.response.json().get('message', str(error))
        except:
            message = str(error)

        if status in (401, 403):
            return ValueError('Authentication failed. Please check your API key.')
        elif status == 404:
            return ValueError('Resource not found. Please verify the address and chain.')
        elif status == 429:
            return ValueError('Rate limit exceeded. Please try again later.')
        else:
            return ValueError(f'Tatum API error: {message}')

# Create singleton instance
tatum_service = TatumService()
```

## File 2: app/models/balance.py

```python
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class BalanceResponse(BaseModel):
    """Response model for native balance"""
    address: str
    chain: str
    balance: float
    symbol: str
    raw_balance: str = Field(alias='rawBalance')

    class Config:
        populate_by_name = True

class ExchangeRateResponse(BaseModel):
    """Response model for exchange rate"""
    value: float
    currency: str

class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
```

## File 3: app/routers/balance.py

```python
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any
from app.services.tatum_service import tatum_service
from app.models.balance import BalanceResponse, ExchangeRateResponse, ErrorResponse

router = APIRouter(prefix="/api", tags=["balance"])

@router.get(
    "/balance/{chain}/{address}",
    response_model=BalanceResponse,
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    },
    summary="Get native balance",
    description="Get native cryptocurrency balance for a wallet address"
)
async def get_balance(
    chain: str,
    address: str
):
    """
    Get balance for an address on a specific blockchain

    - **chain**: Chain identifier (e.g., 'ethereum-mainnet', 'bitcoin-mainnet')
    - **address**: Wallet address
    """
    try:
        balance = await tatum_service.get_balance(chain, address)
        return balance
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get(
    "/tokens/{chain}/{address}",
    response_model=List[Dict[str, Any]],
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    },
    summary="Get token balances",
    description="Get ERC-20/SPL/TRC-20 token balances for a wallet address"
)
async def get_token_balances(
    chain: str,
    address: str
):
    """
    Get token balances for an address on a specific blockchain

    - **chain**: Chain identifier (e.g., 'ethereum-mainnet', 'polygon-mainnet')
    - **address**: Wallet address
    """
    try:
        balances = await tatum_service.get_token_balances(chain, address)
        return balances
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get(
    "/nft/{chain}/{address}",
    response_model=List[Dict[str, Any]],
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    },
    summary="Get NFT balances",
    description="Get NFT (ERC-721/ERC-1155) balances for a wallet address"
)
async def get_nft_balances(
    chain: str,
    address: str
):
    """
    Get NFT balances for an address on a specific blockchain

    - **chain**: Chain identifier (e.g., 'ethereum-mainnet', 'polygon-mainnet')
    - **address**: Wallet address
    """
    try:
        nfts = await tatum_service.get_nft_balances(chain, address)
        return nfts
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get(
    "/price/{symbol}",
    response_model=ExchangeRateResponse,
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    },
    summary="Get exchange rate",
    description="Get current exchange rate for a cryptocurrency"
)
async def get_exchange_rate(
    symbol: str,
    base_currency: str = Query(default='USD', alias='baseCurrency')
):
    """
    Get exchange rate for a cryptocurrency

    - **symbol**: Cryptocurrency symbol (e.g., 'ETH', 'BTC')
    - **base_currency**: Base currency for conversion (default: 'USD')
    """
    try:
        rate = await tatum_service.get_exchange_rate(symbol, base_currency)
        return rate
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## File 4: app/main.py (UPDATE THIS)

Add the balance router to your FastAPI app:

```python
from fastapi import FastAPI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="My Crypto App",
    description="Application with Tatum blockchain integration",
    version="1.0.0"
)

# Import and include the balance router
from app.routers import balance  # ADD THIS
app.include_router(balance.router)  # ADD THIS

# ... rest of your routers ...

@app.get("/")
async def root():
    return {"message": "Welcome to My Crypto App"}
```

## File 5: .env (UPDATE THIS)

Add your Tatum API key:

```env
TATUM_API_KEY=your-api-key-here
```

## File 6: .env.example (CREATE THIS)

```env
TATUM_API_KEY=
```

## File 7: requirements.txt (UPDATE DEPENDENCIES)

Install httpx and python-dotenv:

```bash
pip install httpx python-dotenv
```

Make sure requirements.txt includes:

```
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
httpx>=0.25.0
python-dotenv>=1.0.0
pydantic>=2.0.0
```

Or if using pyproject.toml:

```toml
[tool.poetry.dependencies]
python = "^3.9"
fastapi = "^0.104.0"
uvicorn = {extras = ["standard"], version = "^0.24.0"}
httpx = "^0.25.0"
python-dotenv = "^1.0.0"
pydantic = "^2.0.0"
```

## Testing the Integration

### 1. Start the server

```bash
# Using uvicorn directly
uvicorn app.main:app --reload

# Or if you have a start script
python -m uvicorn app.main:app --reload
```

### 2. Test the endpoints

**Get Ethereum balance:**
```bash
curl http://localhost:8000/api/balance/ethereum-mainnet/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Get token balances:**
```bash
curl http://localhost:8000/api/tokens/ethereum-mainnet/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Get NFT balances:**
```bash
curl http://localhost:8000/api/nft/ethereum-mainnet/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Get ETH to USD exchange rate:**
```bash
curl "http://localhost:8000/api/price/ETH?baseCurrency=USD"
```

### 3. Access interactive docs

FastAPI provides automatic interactive documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

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

**Error Response:**
```json
{
  "detail": "Authentication failed. Please check your API key."
}
```

## Error Handling

The service includes proper error handling for:
- ✅ Invalid API key (401/403) → "Authentication failed"
- ✅ Resource not found (404) → "Resource not found"
- ✅ Rate limiting (429) → "Rate limit exceeded"
- ✅ Network errors → Generic error message
- ✅ Invalid parameters → HTTPException with 400 status

## Chain Normalization

Remember to normalize chain names:
- User says "ethereum" → Use "ethereum-mainnet"
- User says "btc" → Use "bitcoin-mainnet"
- User says "polygon" → Use "polygon-mainnet"

Load `reference/chain_identifiers.json` for complete mappings.

## Integration Checklist

When integrating into a FastAPI project:

- [ ] Create `app/services/tatum_service.py`
- [ ] Create `app/models/balance.py`
- [ ] Create `app/routers/balance.py`
- [ ] Update `app/main.py` to include router
- [ ] Install dependencies: `pip install httpx python-dotenv`
- [ ] Add `TATUM_API_KEY` to `.env`
- [ ] Create `.env.example`
- [ ] Test endpoints via curl or interactive docs
- [ ] Verify error handling works

## Advanced Features

### Dependency Injection

You can use FastAPI's dependency injection for the service:

```python
from fastapi import Depends

def get_tatum_service():
    return tatum_service

@router.get("/balance/{chain}/{address}")
async def get_balance(
    chain: str,
    address: str,
    service: TatumService = Depends(get_tatum_service)
):
    return await service.get_balance(chain, address)
```

### Caching

Add caching for exchange rates using `functools.lru_cache`:

```python
from functools import lru_cache
from datetime import datetime, timedelta

class CachedTatumService(TatumService):
    def __init__(self):
        super().__init__()
        self._rate_cache = {}
        self._cache_duration = timedelta(minutes=5)

    async def get_exchange_rate(self, symbol: str, base_currency: str = 'USD'):
        cache_key = f"{symbol}:{base_currency}"
        now = datetime.now()

        if cache_key in self._rate_cache:
            cached_time, cached_value = self._rate_cache[cache_key]
            if now - cached_time < self._cache_duration:
                return cached_value

        rate = await super().get_exchange_rate(symbol, base_currency)
        self._rate_cache[cache_key] = (now, rate)
        return rate
```

### Background Tasks

Process webhook notifications in the background:

```python
from fastapi import BackgroundTasks

def process_webhook(data: dict):
    # Process webhook data
    print(f"Processing webhook: {data}")

@router.post("/webhooks/handler")
async def handle_webhook(
    data: dict,
    background_tasks: BackgroundTasks
):
    background_tasks.add_task(process_webhook, data)
    return {"status": "received"}
```

## Notes

- Always use v4 endpoints for READ operations
- Convert wei to ETH using: `balance / (10 ** decimals)`
- Load API key from environment variables (never hardcode)
- Implement proper error handling with HTTPException
- Normalize chain names before making API calls
- Use async/await for all HTTP operations
- FastAPI automatically generates OpenAPI documentation
- Use Pydantic models for request/response validation
