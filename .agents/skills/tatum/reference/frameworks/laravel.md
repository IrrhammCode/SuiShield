# Laravel Integration Pattern

This document shows how to integrate Tatum API into a Laravel application.

## Project Structure

```
project/
├── composer.json                      # UPDATE DEPENDENCIES
├── .env                               # UPDATE THIS
├── .env.example                       # UPDATE THIS
├── config/
│   └── tatum.php                      # CREATE THIS
├── app/
│   ├── Services/
│   │   └── TatumService.php           # CREATE THIS
│   ├── Http/
│   │   └── Controllers/
│   │       └── BalanceController.php  # CREATE THIS
│   └── Models/                        # Optional DTOs
└── routes/
    └── api.php                        # UPDATE THIS
```

## File 1: app/Services/TatumService.php

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class TatumService
{
    private string $apiKey;
    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('tatum.api_key');
        $this->baseUrl = config('tatum.base_url', 'https://api.tatum.io');

        if (empty($this->apiKey)) {
            throw new Exception('TATUM_API_KEY environment variable is required');
        }
    }

    /**
     * Get native balance for an address
     *
     * @param string $chain Chain identifier (e.g., 'ethereum-mainnet')
     * @param string $address Wallet address
     * @return array Balance information
     * @throws Exception
     */
    public function getBalance(string $chain, string $address): array
    {
        try {
            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey
            ])->get("{$this->baseUrl}/v4/data/blockchains/balance", [
                'chain' => $chain,
                'address' => $address
            ]);

            if ($response->failed()) {
                throw $this->handleError($response);
            }

            $data = $response->json();

            // Convert from smallest unit (wei) to main unit (ETH)
            $balanceRaw = $data['balance'];
            $decimals = $data['decimals'];
            $balanceFormatted = bcdiv($balanceRaw, bcpow('10', (string)$decimals), $decimals);

            return [
                'address' => $address,
                'chain' => $chain,
                'balance' => (float)$balanceFormatted,
                'symbol' => $data['symbol'],
                'raw_balance' => $balanceRaw
            ];

        } catch (Exception $e) {
            Log::error('Tatum API error in getBalance', [
                'chain' => $chain,
                'address' => $address,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Get token balances (ERC-20, SPL, TRC-20)
     *
     * @param string $chain Chain identifier
     * @param string $address Wallet address
     * @return array List of token balances
     * @throws Exception
     */
    public function getTokenBalances(string $chain, string $address): array
    {
        try {
            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey
            ])->get("{$this->baseUrl}/v4/data/balances", [
                'addresses' => $address,  // Note: plural "addresses"
                'chain' => $chain
            ]);

            if ($response->failed()) {
                throw $this->handleError($response);
            }

            return $response->json();

        } catch (Exception $e) {
            Log::error('Tatum API error in getTokenBalances', [
                'chain' => $chain,
                'address' => $address,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Get NFT balances (ERC-721, ERC-1155)
     *
     * @param string $chain Chain identifier
     * @param string $address Wallet address
     * @return array List of NFTs
     * @throws Exception
     */
    public function getNFTBalances(string $chain, string $address): array
    {
        try {
            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey
            ])->get("{$this->baseUrl}/v4/data/nft/balances", [
                'address' => $address,  // Note: singular "address"
                'chain' => $chain
            ]);

            if ($response->failed()) {
                throw $this->handleError($response);
            }

            return $response->json();

        } catch (Exception $e) {
            Log::error('Tatum API error in getNFTBalances', [
                'chain' => $chain,
                'address' => $address,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Get exchange rate for a cryptocurrency
     *
     * @param string $symbol Token symbol (e.g., 'ETH', 'BTC')
     * @param string $baseCurrency Base currency (e.g., 'USD')
     * @return array Exchange rate information
     * @throws Exception
     */
    public function getExchangeRate(string $symbol, string $baseCurrency = 'USD'): array
    {
        try {
            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey
            ])->get("{$this->baseUrl}/v4/data/rate/symbol", [
                'symbol' => $symbol,
                'basePair' => $baseCurrency
            ]);

            if ($response->failed()) {
                throw $this->handleError($response);
            }

            return $response->json();

        } catch (Exception $e) {
            Log::error('Tatum API error in getExchangeRate', [
                'symbol' => $symbol,
                'baseCurrency' => $baseCurrency,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Handle API errors
     *
     * @param \Illuminate\Http\Client\Response $response
     * @return Exception
     */
    private function handleError($response): Exception
    {
        $status = $response->status();
        $body = $response->json();
        $message = $body['message'] ?? $response->body();

        switch ($status) {
            case 401:
            case 403:
                return new Exception('Authentication failed. Please check your API key.');
            case 404:
                return new Exception('Resource not found. Please verify the address and chain.');
            case 429:
                return new Exception('Rate limit exceeded. Please try again later.');
            default:
                return new Exception("Tatum API error: {$message}");
        }
    }
}
```

## File 2: app/Http/Controllers/BalanceController.php

```php
<?php

namespace App\Http\Controllers;

use App\Services\TatumService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Exception;

class BalanceController extends Controller
{
    private TatumService $tatumService;

    public function __construct(TatumService $tatumService)
    {
        $this->tatumService = $tatumService;
    }

    /**
     * Get native balance for an address
     *
     * @param string $chain
     * @param string $address
     * @return JsonResponse
     */
    public function getBalance(string $chain, string $address): JsonResponse
    {
        try {
            // Validate parameters
            if (empty($chain) || empty($address)) {
                return response()->json([
                    'error' => 'Chain and address parameters are required'
                ], 400);
            }

            $balance = $this->tatumService->getBalance($chain, $address);

            return response()->json($balance);

        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get token balances for an address
     *
     * @param string $chain
     * @param string $address
     * @return JsonResponse
     */
    public function getTokenBalances(string $chain, string $address): JsonResponse
    {
        try {
            if (empty($chain) || empty($address)) {
                return response()->json([
                    'error' => 'Chain and address parameters are required'
                ], 400);
            }

            $balances = $this->tatumService->getTokenBalances($chain, $address);

            return response()->json($balances);

        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get NFT balances for an address
     *
     * @param string $chain
     * @param string $address
     * @return JsonResponse
     */
    public function getNFTBalances(string $chain, string $address): JsonResponse
    {
        try {
            if (empty($chain) || empty($address)) {
                return response()->json([
                    'error' => 'Chain and address parameters are required'
                ], 400);
            }

            $nfts = $this->tatumService->getNFTBalances($chain, $address);

            return response()->json($nfts);

        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get exchange rate
     *
     * @param Request $request
     * @param string $symbol
     * @return JsonResponse
     */
    public function getExchangeRate(Request $request, string $symbol): JsonResponse
    {
        try {
            if (empty($symbol)) {
                return response()->json([
                    'error' => 'Symbol parameter is required'
                ], 400);
            }

            $baseCurrency = $request->query('baseCurrency', 'USD');
            $rate = $this->tatumService->getExchangeRate($symbol, $baseCurrency);

            return response()->json($rate);

        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
```

## File 3: config/tatum.php (CREATE THIS)

```php
<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Tatum API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Tatum blockchain API integration
    |
    */

    'api_key' => env('TATUM_API_KEY'),

    'base_url' => env('TATUM_BASE_URL', 'https://api.tatum.io'),
];
```

## File 4: routes/api.php (UPDATE THIS)

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BalanceController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ADD THESE TATUM ENDPOINTS
Route::prefix('api')->group(function () {
    Route::get('/balance/{chain}/{address}', [BalanceController::class, 'getBalance']);
    Route::get('/tokens/{chain}/{address}', [BalanceController::class, 'getTokenBalances']);
    Route::get('/nft/{chain}/{address}', [BalanceController::class, 'getNFTBalances']);
    Route::get('/price/{symbol}', [BalanceController::class, 'getExchangeRate']);
});

// ... your other routes ...
```

## File 5: .env (UPDATE THIS)

```env
TATUM_API_KEY=your-api-key-here
TATUM_BASE_URL=https://api.tatum.io
```

## File 6: .env.example (UPDATE THIS)

```env
TATUM_API_KEY=
TATUM_BASE_URL=https://api.tatum.io
```

## File 7: composer.json (UPDATE DEPENDENCIES)

Laravel's HTTP client is built-in (Laravel 7+), but ensure you have:

```bash
composer require guzzlehttp/guzzle
```

The `composer.json` should include:

```json
{
    "require": {
        "php": "^8.1",
        "guzzlehttp/guzzle": "^7.5",
        "laravel/framework": "^10.0"
    }
}
```

## Testing the Integration

### 1. Install dependencies

```bash
composer install
```

### 2. Set environment variable

Add your Tatum API key to `.env`:

```env
TATUM_API_KEY=your-api-key-here
```

### 3. Clear config cache

```bash
php artisan config:clear
php artisan cache:clear
```

### 4. Start the development server

```bash
php artisan serve
```

### 5. Test the endpoints

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

When integrating into a Laravel project:

- [ ] Create `config/tatum.php`
- [ ] Create `app/Services/TatumService.php`
- [ ] Create `app/Http/Controllers/BalanceController.php`
- [ ] Update `routes/api.php`
- [ ] Install dependencies: `composer require guzzlehttp/guzzle`
- [ ] Add `TATUM_API_KEY` to `.env`
- [ ] Update `.env.example`
- [ ] Clear config cache: `php artisan config:clear`
- [ ] Test endpoints with curl
- [ ] Verify error handling works

## Advanced Features

### Service Provider

Register TatumService as a singleton in `app/Providers/AppServiceProvider.php`:

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\TatumService;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(TatumService::class, function ($app) {
            return new TatumService();
        });
    }

    public function boot(): void
    {
        //
    }
}
```

### Request Validation

Create form requests for validation:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BalanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'chain' => 'required|string',
            'address' => 'required|string|min:26'
        ];
    }

    public function prepareForValidation()
    {
        $this->merge([
            'chain' => $this->route('chain'),
            'address' => $this->route('address'),
        ]);
    }
}

// In controller
public function getBalance(BalanceRequest $request, string $chain, string $address): JsonResponse
{
    $validated = $request->validated();
    $balance = $this->tatumService->getBalance($validated['chain'], $validated['address']);
    return response()->json($balance);
}
```

### Caching

Add caching for exchange rates using Laravel's cache:

```php
use Illuminate\Support\Facades\Cache;

public function getExchangeRate(string $symbol, string $baseCurrency = 'USD'): array
{
    $cacheKey = "rate:{$symbol}:{$baseCurrency}";

    return Cache::remember($cacheKey, 300, function () use ($symbol, $baseCurrency) {
        $response = Http::withHeaders([
            'x-api-key' => $this->apiKey
        ])->get("{$this->baseUrl}/v4/data/rate/symbol", [
            'symbol' => $symbol,
            'basePair' => $baseCurrency
        ]);

        if ($response->failed()) {
            throw $this->handleError($response);
        }

        return $response->json();
    });
}
```

### API Resources

Create API resources for consistent response formatting:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BalanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'address' => $this['address'],
            'chain' => $this['chain'],
            'balance' => $this['balance'],
            'symbol' => $this['symbol'],
            'rawBalance' => $this['raw_balance'],
            'timestamp' => now()->toIso8601String(),
        ];
    }
}

// In controller
return new BalanceResource($balance);
```

### Rate Limiting

Add rate limiting to protect your endpoints:

```php
// In routes/api.php
Route::middleware(['throttle:60,1'])->prefix('api')->group(function () {
    Route::get('/balance/{chain}/{address}', [BalanceController::class, 'getBalance']);
    // ... other routes
});
```

### Queue Jobs for Webhooks

Process webhook notifications asynchronously:

```php
<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(private array $webhookData)
    {
    }

    public function handle(): void
    {
        // Process webhook data
        \Log::info('Processing webhook', $this->webhookData);
    }
}

// In controller
ProcessWebhook::dispatch($request->all());
```

### Middleware for API Authentication

Create custom middleware for API key validation:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ValidateApiKey
{
    public function handle(Request $request, Closure $next)
    {
        $apiKey = $request->header('X-API-Key');

        if (!$apiKey || $apiKey !== config('app.api_key')) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $next($request);
    }
}

// Register in app/Http/Kernel.php
protected $routeMiddleware = [
    // ...
    'api.key' => \App\Http\Middleware\ValidateApiKey::class,
];

// Use in routes
Route::middleware(['api.key'])->group(function () {
    // ... protected routes
});
```

## Notes

- Always use v4 endpoints for READ operations
- Convert wei to ETH using BCMath: `bcdiv($balance, bcpow('10', $decimals), $decimals)`
- Load API key from environment variables (never hardcode)
- Use Laravel's built-in HTTP client for simplicity
- Implement proper logging for debugging
- Normalize chain names before making API calls
- Use service providers for singleton services
- Add validation using Form Requests
- Cache expensive operations like exchange rates
- Use queues for async processing (webhooks)
