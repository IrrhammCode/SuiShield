import { TatumSDK, Network } from "@tatumio/tatum";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TatumInstance = any;

// Cache Tatum instances per chain
const instances = new Map<string, TatumInstance>();

async function getTatum(network: Network) {
  const key = network;
  if (!instances.has(key)) {
    const instance = await TatumSDK.init({
      network,
      ...(process.env.TATUM_API_KEY ? { apiKey: process.env.TATUM_API_KEY } : {}),
    });
    instances.set(key, instance);
  }
  return instances.get(key);
}

// ── Chain mapping ──────────────────────────────────────────
const CHAIN_MAP: Record<string, Network> = {
  ethereum: Network.ETHEREUM,
  eth: Network.ETHEREUM,
  bitcoin: Network.BITCOIN,
  btc: Network.BITCOIN,
  bsc: Network.BINANCE_SMART_CHAIN,
  bnb: Network.BINANCE_SMART_CHAIN,
  polygon: Network.POLYGON,
  matic: Network.POLYGON,
  arbitrum: Network.ARBITRUM_ONE,
  optimism: Network.OPTIMISM,
  avalanche: Network.AVALANCHE_C,
  avax: Network.AVALANCHE_C,
  solana: Network.SOLANA,
};

function resolveChain(chain: string): Network {
  return CHAIN_MAP[chain.toLowerCase()] || Network.ETHEREUM;
}

// ── Public API ─────────────────────────────────────────────

export async function getAddressBalance(chain: string, address: string) {
  const network = resolveChain(chain);
  const tatum = await getTatum(network);
  const balance = await tatum.address.getBalance({
    addresses: [address],
  });
  return balance;
}

export async function getAddressTransactions(
  chain: string,
  address: string,
  opts?: { pageSize?: number; page?: number }
) {
  const network = resolveChain(chain);
  const tatum = await getTatum(network);
  const txs = await tatum.address.getTransactions({
    address,
    pageSize: opts?.pageSize ?? 10,
    page: opts?.page ?? 1,
  });
  return txs;
}

export async function getCurrentRate(currency: string, basePair = "USD") {
  const tatum = await getTatum(Network.ETHEREUM);
  const rate = await tatum.rates.getCurrentRate(currency, basePair);
  return rate;
}

export async function getBlockNumber(chain: string) {
  const network = resolveChain(chain);
  const tatum = await getTatum(network);
  if (typeof tatum.rpc.blockNumber === 'function') {
    return await tatum.rpc.blockNumber();
  } else if (typeof tatum.rpc.getBlockCount === 'function') {
    const res = await tatum.rpc.getBlockCount();
    return res.result;
  }
  throw new Error(`Block number query not supported natively for ${chain}`);
}

export async function getGasPrice(chain: string) {
  const network = resolveChain(chain);
  const tatum = await getTatum(network);
  if (typeof tatum.rpc.gasPrice === 'function') {
    return await tatum.rpc.gasPrice();
  }
  throw new Error(`Gas price query is only available for EVM-compatible chains (not ${chain}). For Bitcoin, please query network fee estimates instead.`);
}

export async function getTransactionByHash(chain: string, txHash: string) {
  const network = resolveChain(chain);
  const tatum = await getTatum(network);
  if (typeof tatum.rpc.getTransactionByHash === 'function') {
    return await tatum.rpc.getTransactionByHash(txHash);
  } else if (typeof tatum.rpc.getRawTransaction === 'function') {
    const res = await tatum.rpc.getRawTransaction(txHash, true);
    return res.result;
  }
  throw new Error(`getTransactionByHash not supported directly for ${chain}`);
}

export async function getBlockByNumber(chain: string, blockNumber: string | number) {
  const network = resolveChain(chain);
  const tatum = await getTatum(network);
  if (typeof tatum.rpc.getBlockByNumber === 'function') {
    return await tatum.rpc.getBlockByNumber(blockNumber);
  } else if (typeof tatum.rpc.getBlockHash === 'function' && typeof tatum.rpc.getBlock === 'function') {
    const hashRes = await tatum.rpc.getBlockHash(Number(blockNumber));
    if (hashRes.result) {
      const blockRes = await tatum.rpc.getBlock(hashRes.result, 2);
      return blockRes.result;
    }
  }
  throw new Error(`getBlockByNumber not supported directly for ${chain}`);
}
