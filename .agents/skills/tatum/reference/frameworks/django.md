# Django Integration Pattern

This document shows how to integrate Tatum API into a Django application.

## Project Structure

```
project/
├── manage.py
├── requirements.txt
├── .env
├── .env.example
├── myproject/
│   ├── settings.py                    # UPDATE THIS
│   └── urls.py                        # UPDATE THIS
└── myapp/
    ├── services/
    │   └── tatum_service.py           # CREATE THIS
    ├── views.py                       # UPDATE THIS
    └── urls.py                        # UPDATE THIS
```

## File 1: myapp/services/tatum_service.py

```python
import os
import requests
from typing import Dict, List, Any, Optional
from django.conf import settings

class TatumService:
    """Service for interacting with Tatum API"""

    def __init__(self):
        self.api_key = getattr(settings, 'TATUM_API_KEY', None)
        self.base_url = 'https://api.tatum.io'

        if not self.api_key:
            raise ValueError('TATUM_API_KEY setting is required')

    def get_balance(self, chain: str, address: str) -> Dict[str, Any]:
        """
        Get native balance for an address

        Args:
            chain: Chain identifier (e.g., 'ethereum-mainnet')
            address: Wallet address

        Returns:
            Balance information dictionary
        """
        try:
            response = requests.get(
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

        except requests.HTTPError as e:
            raise self._handle_error(e)

    def get_token_balances(self, chain: str, address: str) -> List[Dict[str, Any]]:
        """
        Get token balances (ERC-20, SPL, TRC-20)

        Args:
            chain: Chain identifier
            address: Wallet address

        Returns:
            List of token balances
        """
        try:
            response = requests.get(
                f'{self.base_url}/v4/data/balances',
                headers={'x-api-key': self.api_key},
                params={'addresses': address, 'chain': chain}  # Note: "addresses" parameter
            )
            response.raise_for_status()
            return response.json()

        except requests.HTTPError as e:
            raise self._handle_error(e)

    def get_nft_balances(self, chain: str, address: str) -> List[Dict[str, Any]]:
        """
        Get NFT balances (ERC-721, ERC-1155)

        Args:
            chain: Chain identifier
            address: Wallet address

        Returns:
            List of NFTs
        """
        try:
            response = requests.get(
                f'{self.base_url}/v4/data/nft/balances',
                headers={'x-api-key': self.api_key},
                params={'address': address, 'chain': chain}  # Note: "address" singular
            )
            response.raise_for_status()
            return response.json()

        except requests.HTTPError as e:
            raise self._handle_error(e)

    def get_exchange_rate(self, symbol: str, base_currency: str = 'USD') -> Dict[str, Any]:
        """
        Get exchange rate for a cryptocurrency

        Args:
            symbol: Token symbol (e.g., 'ETH', 'BTC')
            base_currency: Base currency (e.g., 'USD')

        Returns:
            Exchange rate information
        """
        try:
            response = requests.get(
                f'{self.base_url}/v4/data/rate/symbol',
                headers={'x-api-key': self.api_key},
                params={'symbol': symbol, 'basePair': base_currency}
            )
            response.raise_for_status()
            return response.json()

        except requests.HTTPError as e:
            raise self._handle_error(e)

    def _handle_error(self, error: requests.HTTPError) -> Exception:
        """
        Handle API errors

        Args:
            error: requests HTTPError

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

## File 2: myapp/views.py (UPDATE THIS)

```python
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from myapp.services.tatum_service import tatum_service
import logging

logger = logging.getLogger(__name__)

@require_http_methods(["GET"])
def get_balance(request, chain, address):
    """
    Get native balance for an address

    URL: /api/balance/<chain>/<address>/
    """
    try:
        # Validate parameters
        if not chain or not address:
            return JsonResponse(
                {'error': 'Chain and address parameters are required'},
                status=400
            )

        balance = tatum_service.get_balance(chain, address)
        return JsonResponse(balance)

    except ValueError as e:
        logger.error(f'Tatum API error: {str(e)}')
        return JsonResponse({'error': str(e)}, status=400)
    except Exception as e:
        logger.error(f'Unexpected error: {str(e)}')
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_token_balances(request, chain, address):
    """
    Get token balances for an address

    URL: /api/tokens/<chain>/<address>/
    """
    try:
        if not chain or not address:
            return JsonResponse(
                {'error': 'Chain and address parameters are required'},
                status=400
            )

        balances = tatum_service.get_token_balances(chain, address)
        return JsonResponse(balances, safe=False)

    except ValueError as e:
        logger.error(f'Tatum API error: {str(e)}')
        return JsonResponse({'error': str(e)}, status=400)
    except Exception as e:
        logger.error(f'Unexpected error: {str(e)}')
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_nft_balances(request, chain, address):
    """
    Get NFT balances for an address

    URL: /api/nft/<chain>/<address>/
    """
    try:
        if not chain or not address:
            return JsonResponse(
                {'error': 'Chain and address parameters are required'},
                status=400
            )

        nfts = tatum_service.get_nft_balances(chain, address)
        return JsonResponse(nfts, safe=False)

    except ValueError as e:
        logger.error(f'Tatum API error: {str(e)}')
        return JsonResponse({'error': str(e)}, status=400)
    except Exception as e:
        logger.error(f'Unexpected error: {str(e)}')
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_exchange_rate(request, symbol):
    """
    Get exchange rate for a cryptocurrency

    URL: /api/price/<symbol>/?baseCurrency=USD
    """
    try:
        if not symbol:
            return JsonResponse(
                {'error': 'Symbol parameter is required'},
                status=400
            )

        base_currency = request.GET.get('baseCurrency', 'USD')
        rate = tatum_service.get_exchange_rate(symbol, base_currency)
        return JsonResponse(rate)

    except ValueError as e:
        logger.error(f'Tatum API error: {str(e)}')
        return JsonResponse({'error': str(e)}, status=400)
    except Exception as e:
        logger.error(f'Unexpected error: {str(e)}')
        return JsonResponse({'error': str(e)}, status=500)
```

## File 3: myapp/urls.py (UPDATE THIS)

```python
from django.urls import path
from . import views

app_name = 'myapp'

urlpatterns = [
    # ... your existing URL patterns ...

    # ADD THESE TATUM ENDPOINTS
    path('api/balance/<str:chain>/<str:address>/', views.get_balance, name='balance'),
    path('api/tokens/<str:chain>/<str:address>/', views.get_token_balances, name='token_balances'),
    path('api/nft/<str:chain>/<str:address>/', views.get_nft_balances, name='nft_balances'),
    path('api/price/<str:symbol>/', views.get_exchange_rate, name='exchange_rate'),
]
```

## File 4: myproject/urls.py (UPDATE THIS)

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # ADD THIS
    path('', include('myapp.urls')),

    # ... your other URL patterns ...
]
```

## File 5: myproject/settings.py (UPDATE THIS)

Add Tatum API configuration:

```python
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ... existing settings ...

# Tatum API Configuration
TATUM_API_KEY = os.getenv('TATUM_API_KEY')

if not TATUM_API_KEY:
    raise ValueError('TATUM_API_KEY environment variable is required')

# Logging configuration (optional but recommended)
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'myapp': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}
```

## File 6: .env (UPDATE THIS)

```env
TATUM_API_KEY=your-api-key-here
DEBUG=True
SECRET_KEY=your-django-secret-key
```

## File 7: .env.example (CREATE THIS)

```env
TATUM_API_KEY=
DEBUG=True
SECRET_KEY=
```

## File 8: requirements.txt (UPDATE DEPENDENCIES)

```bash
pip install requests python-dotenv
```

Make sure requirements.txt includes:

```
Django>=4.2.0
requests>=2.31.0
python-dotenv>=1.0.0
```

## Testing the Integration

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Set environment variables

Create `.env` file with your Tatum API key, or:

```bash
export TATUM_API_KEY=your-api-key-here
```

### 3. Run migrations (if needed)

```bash
python manage.py migrate
```

### 4. Start the development server

```bash
python manage.py runserver
```

### 5. Test the endpoints

**Get Ethereum balance:**
```bash
curl http://localhost:8000/api/balance/ethereum-mainnet/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/
```

**Get token balances:**
```bash
curl http://localhost:8000/api/tokens/ethereum-mainnet/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/
```

**Get NFT balances:**
```bash
curl http://localhost:8000/api/nft/ethereum-mainnet/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/
```

**Get ETH to USD exchange rate:**
```bash
curl "http://localhost:8000/api/price/ETH/?baseCurrency=USD"
```

## Expected Responses

**Balance:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "chain": "ethereum-mainnet",
  "balance": 1.234567,
  "symbol": "ETH",
  "raw_balance": "1234567000000000000"
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
  "error": "Authentication failed. Please check your API key."
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

When integrating into a Django project:

- [ ] Create `myapp/services/` directory
- [ ] Create `myapp/services/tatum_service.py`
- [ ] Update `myapp/views.py` with view functions
- [ ] Update `myapp/urls.py` with URL patterns
- [ ] Update `myproject/urls.py` to include app URLs
- [ ] Update `myproject/settings.py` with TATUM_API_KEY
- [ ] Install dependencies: `pip install requests python-dotenv`
- [ ] Add `TATUM_API_KEY` to `.env`
- [ ] Create `.env.example`
- [ ] Test endpoints with curl
- [ ] Verify error handling works

## Advanced Features

### Class-Based Views

For more complex applications, use class-based views:

```python
from django.views import View
from django.http import JsonResponse
from myapp.services.tatum_service import tatum_service

class BalanceView(View):
    def get(self, request, chain, address):
        try:
            balance = tatum_service.get_balance(chain, address)
            return JsonResponse(balance)
        except ValueError as e:
            return JsonResponse({'error': str(e)}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

# In urls.py
path('api/balance/<str:chain>/<str:address>/', BalanceView.as_view(), name='balance'),
```

### Django REST Framework

For REST API with serializers and validation:

```python
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from myapp.services.tatum_service import tatum_service

@api_view(['GET'])
def get_balance(request, chain, address):
    try:
        balance = tatum_service.get_balance(chain, address)
        return Response(balance, status=status.HTTP_200_OK)
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

### Caching

Add caching for exchange rates using Django's cache framework:

```python
from django.core.cache import cache

def get_exchange_rate_cached(symbol: str, base_currency: str = 'USD') -> Dict[str, Any]:
    cache_key = f'rate:{symbol}:{base_currency}'
    cached_rate = cache.get(cache_key)

    if cached_rate:
        return cached_rate

    rate = tatum_service.get_exchange_rate(symbol, base_currency)
    cache.set(cache_key, rate, 300)  # Cache for 5 minutes
    return rate
```

### Async Views (Django 4.1+)

For async support:

```python
import httpx
from django.http import JsonResponse

async def get_balance_async(request, chain, address):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                'https://api.tatum.io/v4/data/blockchains/balance',
                headers={'x-api-key': settings.TATUM_API_KEY},
                params={'chain': chain, 'address': address}
            )
            response.raise_for_status()
            data = response.json()

            balance_raw = int(data['balance'])
            decimals = data['decimals']
            balance_formatted = balance_raw / (10 ** decimals)

            return JsonResponse({
                'address': address,
                'chain': chain,
                'balance': balance_formatted,
                'symbol': data['symbol']
            })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
```

### Middleware for Authentication

Add custom middleware for API key validation:

```python
# middleware.py
class TatumAPIKeyMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith('/api/'):
            api_key = request.headers.get('X-API-Key')
            if not api_key:
                return JsonResponse({'error': 'API key required'}, status=401)
            # Validate API key here

        response = self.get_response(request)
        return response

# In settings.py
MIDDLEWARE = [
    # ... other middleware ...
    'myapp.middleware.TatumAPIKeyMiddleware',
]
```

## Notes

- Always use v4 endpoints for READ operations
- Convert wei to ETH using: `balance / (10 ** decimals)`
- Load API key from environment variables (never hardcode)
- Use `safe=False` when returning lists in JsonResponse
- Implement proper logging for debugging
- Normalize chain names before making API calls
- Consider using Django REST Framework for advanced APIs
- Use async views for better performance (Django 4.1+)
