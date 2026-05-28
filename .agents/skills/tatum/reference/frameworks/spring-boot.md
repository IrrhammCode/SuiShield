# Spring Boot Integration Pattern

This document shows how to integrate Tatum API into a Spring Boot application.

## Project Structure

```
project/
├── pom.xml (or build.gradle)
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── yourapp/
│   │   │           ├── Application.java
│   │   │           ├── service/
│   │   │           │   └── TatumService.java          # CREATE THIS
│   │   │           ├── controller/
│   │   │           │   └── BalanceController.java     # CREATE THIS
│   │   │           ├── model/
│   │   │           │   ├── BalanceResponse.java       # CREATE THIS
│   │   │           │   └── ExchangeRateResponse.java  # CREATE THIS
│   │   │           └── config/
│   │   │               └── TatumConfig.java           # CREATE THIS
│   │   └── resources/
│   │       ├── application.properties                 # UPDATE THIS
│   │       └── application-example.properties         # CREATE THIS
```

## File 1: src/main/java/com/yourapp/service/TatumService.java

```java
package com.yourapp.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yourapp.model.BalanceResponse;
import com.yourapp.model.ExchangeRateResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;
import java.util.List;

@Service
public class TatumService {

    @Value("${tatum.api.key}")
    private String apiKey;

    @Value("${tatum.api.base-url:https://api.tatum.io}")
    private String baseUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public TatumService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Get native balance for an address
     *
     * @param chain   Chain identifier (e.g., 'ethereum-mainnet')
     * @param address Wallet address
     * @return Balance information
     */
    public BalanceResponse getBalance(String chain, String address) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(baseUrl + "/v4/data/blockchains/balance")
                    .queryParam("chain", chain)
                    .queryParam("address", address)
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.set("x-api-key", apiKey);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    JsonNode.class
            );

            JsonNode data = response.getBody();
            if (data == null) {
                throw new RuntimeException("Empty response from Tatum API");
            }

            // Convert from smallest unit (wei) to main unit (ETH)
            BigInteger balanceWei = new BigInteger(data.get("balance").asText());
            int decimals = data.get("decimals").asInt();
            BigDecimal balanceFormatted = new BigDecimal(balanceWei)
                    .divide(BigDecimal.TEN.pow(decimals), decimals, RoundingMode.HALF_UP);

            return BalanceResponse.builder()
                    .address(address)
                    .chain(chain)
                    .balance(balanceFormatted)
                    .symbol(data.get("symbol").asText())
                    .rawBalance(data.get("balance").asText())
                    .build();

        } catch (HttpClientErrorException e) {
            throw handleError(e);
        }
    }

    /**
     * Get token balances (ERC-20, SPL, TRC-20)
     *
     * @param chain   Chain identifier
     * @param address Wallet address
     * @return List of token balances
     */
    public List<JsonNode> getTokenBalances(String chain, String address) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(baseUrl + "/v4/data/balances")
                    .queryParam("addresses", address)  // Note: plural "addresses"
                    .queryParam("chain", chain)
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.set("x-api-key", apiKey);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    JsonNode.class
            );

            JsonNode data = response.getBody();
            if (data == null || !data.isArray()) {
                throw new RuntimeException("Invalid response from Tatum API");
            }

            return objectMapper.convertValue(data,
                objectMapper.getTypeFactory().constructCollectionType(List.class, JsonNode.class));

        } catch (HttpClientErrorException e) {
            throw handleError(e);
        }
    }

    /**
     * Get NFT balances (ERC-721, ERC-1155)
     *
     * @param chain   Chain identifier
     * @param address Wallet address
     * @return List of NFTs
     */
    public List<JsonNode> getNFTBalances(String chain, String address) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(baseUrl + "/v4/data/nft/balances")
                    .queryParam("address", address)  // Note: singular "address"
                    .queryParam("chain", chain)
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.set("x-api-key", apiKey);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    JsonNode.class
            );

            JsonNode data = response.getBody();
            if (data == null || !data.isArray()) {
                throw new RuntimeException("Invalid response from Tatum API");
            }

            return objectMapper.convertValue(data,
                objectMapper.getTypeFactory().constructCollectionType(List.class, JsonNode.class));

        } catch (HttpClientErrorException e) {
            throw handleError(e);
        }
    }

    /**
     * Get exchange rate for a cryptocurrency
     *
     * @param symbol       Token symbol (e.g., 'ETH', 'BTC')
     * @param baseCurrency Base currency (e.g., 'USD')
     * @return Exchange rate information
     */
    public ExchangeRateResponse getExchangeRate(String symbol, String baseCurrency) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(baseUrl + "/v4/data/rate/symbol")
                    .queryParam("symbol", symbol)
                    .queryParam("basePair", baseCurrency)
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.set("x-api-key", apiKey);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    JsonNode.class
            );

            JsonNode data = response.getBody();
            if (data == null) {
                throw new RuntimeException("Empty response from Tatum API");
            }

            return ExchangeRateResponse.builder()
                    .value(data.get("value").asDouble())
                    .currency(data.get("currency").asText())
                    .build();

        } catch (HttpClientErrorException e) {
            throw handleError(e);
        }
    }

    /**
     * Handle API errors
     *
     * @param error HttpClientErrorException
     * @return RuntimeException with formatted message
     */
    private RuntimeException handleError(HttpClientErrorException error) {
        HttpStatus status = (HttpStatus) error.getStatusCode();

        String message;
        try {
            JsonNode errorBody = objectMapper.readTree(error.getResponseBodyAsString());
            message = errorBody.has("message") ? errorBody.get("message").asText() : error.getMessage();
        } catch (Exception e) {
            message = error.getMessage();
        }

        if (status == HttpStatus.UNAUTHORIZED || status == HttpStatus.FORBIDDEN) {
            return new RuntimeException("Authentication failed. Please check your API key.");
        } else if (status == HttpStatus.NOT_FOUND) {
            return new RuntimeException("Resource not found. Please verify the address and chain.");
        } else if (status == HttpStatus.TOO_MANY_REQUESTS) {
            return new RuntimeException("Rate limit exceeded. Please try again later.");
        } else {
            return new RuntimeException("Tatum API error: " + message);
        }
    }
}
```

## File 2: src/main/java/com/yourapp/model/BalanceResponse.java

```java
package com.yourapp.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BalanceResponse {
    private String address;
    private String chain;
    private BigDecimal balance;
    private String symbol;

    @JsonProperty("rawBalance")
    private String rawBalance;
}
```

## File 3: src/main/java/com/yourapp/model/ExchangeRateResponse.java

```java
package com.yourapp.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExchangeRateResponse {
    private Double value;
    private String currency;
}
```

## File 4: src/main/java/com/yourapp/controller/BalanceController.java

```java
package com.yourapp.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.yourapp.model.BalanceResponse;
import com.yourapp.model.ExchangeRateResponse;
import com.yourapp.service.TatumService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class BalanceController {

    private final TatumService tatumService;

    public BalanceController(TatumService tatumService) {
        this.tatumService = tatumService;
    }

    /**
     * Get native balance for an address
     *
     * @param chain   Chain identifier
     * @param address Wallet address
     * @return Balance information
     */
    @GetMapping("/balance/{chain}/{address}")
    public ResponseEntity<?> getBalance(
            @PathVariable String chain,
            @PathVariable String address
    ) {
        try {
            // Validate parameters
            if (chain == null || chain.isEmpty() || address == null || address.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(createErrorResponse("Chain and address parameters are required"));
            }

            BalanceResponse balance = tatumService.getBalance(chain, address);
            return ResponseEntity.ok(balance);

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Get token balances for an address
     *
     * @param chain   Chain identifier
     * @param address Wallet address
     * @return List of token balances
     */
    @GetMapping("/tokens/{chain}/{address}")
    public ResponseEntity<?> getTokenBalances(
            @PathVariable String chain,
            @PathVariable String address
    ) {
        try {
            if (chain == null || chain.isEmpty() || address == null || address.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(createErrorResponse("Chain and address parameters are required"));
            }

            List<JsonNode> balances = tatumService.getTokenBalances(chain, address);
            return ResponseEntity.ok(balances);

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Get NFT balances for an address
     *
     * @param chain   Chain identifier
     * @param address Wallet address
     * @return List of NFTs
     */
    @GetMapping("/nft/{chain}/{address}")
    public ResponseEntity<?> getNFTBalances(
            @PathVariable String chain,
            @PathVariable String address
    ) {
        try {
            if (chain == null || chain.isEmpty() || address == null || address.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(createErrorResponse("Chain and address parameters are required"));
            }

            List<JsonNode> nfts = tatumService.getNFTBalances(chain, address);
            return ResponseEntity.ok(nfts);

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Get exchange rate
     *
     * @param symbol       Cryptocurrency symbol
     * @param baseCurrency Base currency (optional, default: USD)
     * @return Exchange rate
     */
    @GetMapping("/price/{symbol}")
    public ResponseEntity<?> getExchangeRate(
            @PathVariable String symbol,
            @RequestParam(required = false, defaultValue = "USD") String baseCurrency
    ) {
        try {
            if (symbol == null || symbol.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body(createErrorResponse("Symbol parameter is required"));
            }

            ExchangeRateResponse rate = tatumService.getExchangeRate(symbol, baseCurrency);
            return ResponseEntity.ok(rate);

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Create error response map
     *
     * @param message Error message
     * @return Error response map
     */
    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return error;
    }
}
```

## File 5: src/main/java/com/yourapp/config/TatumConfig.java

```java
package com.yourapp.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class TatumConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}
```

## File 6: src/main/resources/application.properties (UPDATE THIS)

Add your Tatum API configuration:

```properties
# Tatum API Configuration
tatum.api.key=${TATUM_API_KEY:your-api-key-here}
tatum.api.base-url=https://api.tatum.io

# Server Configuration
server.port=8080
```

## File 7: src/main/resources/application-example.properties (CREATE THIS)

```properties
# Tatum API Configuration
tatum.api.key=
tatum.api.base-url=https://api.tatum.io

# Server Configuration
server.port=8080
```

## File 8: pom.xml (UPDATE DEPENDENCIES)

Add required dependencies:

```xml
<dependencies>
    <!-- Spring Boot Starter Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- Lombok (optional, for @Data, @Builder, etc.) -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>

    <!-- Jackson for JSON processing (usually included with spring-boot-starter-web) -->
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
    </dependency>
</dependencies>
```

Or if using Gradle (build.gradle):

```gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
    implementation 'com.fasterxml.jackson.core:jackson-databind'
}
```

## Testing the Integration

### 1. Set environment variable

```bash
export TATUM_API_KEY=your-api-key-here
```

Or update `application.properties` directly.

### 2. Start the application

```bash
# Using Maven
./mvnw spring-boot:run

# Using Gradle
./gradlew bootRun

# Or run the JAR
java -jar target/yourapp-0.0.1-SNAPSHOT.jar
```

### 3. Test the endpoints

**Get Ethereum balance:**
```bash
curl http://localhost:8080/api/balance/ethereum-mainnet/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Get token balances:**
```bash
curl http://localhost:8080/api/tokens/ethereum-mainnet/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Get NFT balances:**
```bash
curl http://localhost:8080/api/nft/ethereum-mainnet/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Get ETH to USD exchange rate:**
```bash
curl "http://localhost:8080/api/price/ETH?baseCurrency=USD"
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

When integrating into a Spring Boot project:

- [ ] Create `src/main/java/.../service/TatumService.java`
- [ ] Create `src/main/java/.../controller/BalanceController.java`
- [ ] Create `src/main/java/.../model/BalanceResponse.java`
- [ ] Create `src/main/java/.../model/ExchangeRateResponse.java`
- [ ] Create `src/main/java/.../config/TatumConfig.java`
- [ ] Update `src/main/resources/application.properties`
- [ ] Add dependencies to `pom.xml` or `build.gradle`
- [ ] Set `TATUM_API_KEY` environment variable
- [ ] Test endpoints with curl
- [ ] Verify error handling works

## Advanced Features

### WebClient (Reactive Alternative)

For reactive applications, use WebClient instead of RestTemplate:

```java
@Configuration
public class TatumConfig {
    @Bean
    public WebClient webClient() {
        return WebClient.builder()
                .baseUrl("https://api.tatum.io")
                .build();
    }
}

// In TatumService
public Mono<BalanceResponse> getBalanceReactive(String chain, String address) {
    return webClient.get()
            .uri(uriBuilder -> uriBuilder
                    .path("/v4/data/blockchains/balance")
                    .queryParam("chain", chain)
                    .queryParam("address", address)
                    .build())
            .header("x-api-key", apiKey)
            .retrieve()
            .bodyToMono(JsonNode.class)
            .map(this::parseBalanceResponse);
}
```

### Caching

Add caching for exchange rates using Spring Cache:

```java
@Configuration
@EnableCaching
public class CacheConfig {
    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("exchangeRates");
    }
}

// In TatumService
@Cacheable(value = "exchangeRates", key = "#symbol + ':' + #baseCurrency")
public ExchangeRateResponse getExchangeRate(String symbol, String baseCurrency) {
    // ... implementation
}
```

### Async Processing

Enable async processing for webhooks:

```java
@Configuration
@EnableAsync
public class AsyncConfig {
    @Bean
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("webhook-");
        executor.initialize();
        return executor;
    }
}

@Async
public void processWebhook(JsonNode webhookData) {
    // Process webhook asynchronously
}
```

## Notes

- Always use v4 endpoints for READ operations
- Convert wei to ETH using: `balance / (10 ** decimals)`
- Load API key from environment variables or application.properties
- Use BigDecimal for monetary calculations
- Implement proper error handling
- Normalize chain names before making API calls
- Consider using WebClient for reactive applications
- Use Lombok to reduce boilerplate code
