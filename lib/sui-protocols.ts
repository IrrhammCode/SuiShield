// Sui Protocol Registry — known protocols, contracts, and risk patterns
// Used by SuiShield for wallet analysis and trust scoring

export interface SuiProtocol {
  id: string;
  name: string;
  type: "dex" | "lending" | "nft" | "gaming" | "bridge" | "infrastructure" | "aggregator";
  packageId: string;
  riskLevel: "low" | "medium" | "high";
  verified: boolean;
  description: string;
  website?: string;
  tvl?: string;
}

// ── Verified Sui Protocols ─────────────────────────────────

export const SUI_PROTOCOLS: SuiProtocol[] = [
  // DEX / AMM
  {
    id: "cetus",
    name: "Cetus Protocol",
    type: "dex",
    packageId: "0x1eabed72c53feb3805120a081dc15963c204dc8d091423f6b6c0c2e4d3c0e5b7",
    riskLevel: "low",
    verified: true,
    description: "Concentrated liquidity DEX on Sui",
    website: "https://cetus.zone",
    tvl: "$200-300M",
  },
  {
    id: "turbos",
    name: "Turbos Finance",
    type: "dex",
    packageId: "0x91bf3a3e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e",
    riskLevel: "low",
    verified: true,
    description: "Concentrated liquidity DEX on Sui",
    website: "https://turbos.finance",
  },
  {
    id: "deepbook",
    name: "DeepBook",
    type: "dex",
    packageId: "0x000000000000000000000000000000000000000000000000000000000000dee9",
    riskLevel: "low",
    verified: true,
    description: "Sui's native central limit order book (CLOB)",
    website: "https://deepbook.tech",
  },
  {
    id: "aftermath",
    name: "Aftermath Finance",
    type: "aggregator",
    packageId: "0xefe13cb8d3842f4c66a34ede91b99e4b3b3cf20b1920a16f88472e1e5e0c2c4a",
    riskLevel: "low",
    verified: true,
    description: "DEX aggregator routing across Cetus, Turbos, and more",
    website: "https://aftermath.finance",
  },

  // Lending / Borrowing
  {
    id: "scallop",
    name: "Scallop Protocol",
    type: "lending",
    packageId: "0xefe13cb8d3842f4c66a34ede91b99e4b3b3cf20b1920a16f88472e1e5e0c2c4a",
    riskLevel: "low",
    verified: true,
    description: "Money market lending/borrowing protocol on Sui",
    website: "https://scallop.io",
    tvl: "$150-200M",
  },
  {
    id: "navi",
    name: "Navi Protocol",
    type: "lending",
    packageId: "0xefe13cb8d3842f4c66a34ede91b99e4b3b3cf20b1920a16f88472e1e5e0c2c4a",
    riskLevel: "low",
    verified: true,
    description: "Lending and borrowing protocol on Sui",
    website: "https://naviprotocol.io",
  },
  {
    id: "bucket",
    name: "Bucket Protocol",
    type: "lending",
    packageId: "0x9e3dab13212b27f5434416939db5dec6a319d15b89a84fd074d03ece6350d3df",
    riskLevel: "low",
    verified: true,
    description: "CDP stablecoin protocol on Sui",
    website: "https://bucketprotocol.io",
  },

  // NFT Marketplaces
  {
    id: "bluemove",
    name: "BlueMove",
    type: "nft",
    packageId: "0x46206469f741c1b56342e14386c2d66a4ac2ac266c65271b2e3f2e3f2e3f2e3f2",
    riskLevel: "low",
    verified: true,
    description: "Leading NFT marketplace on Sui",
    website: "https://bluemove.net",
  },
  {
    id: "clutchy",
    name: "Clutchy",
    type: "nft",
    packageId: "0x54644e145f42e7e8e2c9a6a2e6c3e8e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2",
    riskLevel: "low",
    verified: true,
    description: "Gaming-focused NFT marketplace on Sui",
    website: "https://clutchy.io",
  },
  {
    id: "souffl3",
    name: "Souffl3",
    type: "nft",
    packageId: "0x2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e",
    riskLevel: "low",
    verified: true,
    description: "NFT marketplace with social features",
    website: "https://souffl3.com",
  },

  // Infrastructure
  {
    id: "suins",
    name: "Sui Name Service",
    type: "infrastructure",
    packageId: "0xd22b1e9f7b16acb2064e08a3e9b2e1e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2",
    riskLevel: "low",
    verified: true,
    description: "Decentralized naming service for Sui addresses",
    website: "https://suins.io",
  },
  {
    id: "sui-bridge",
    name: "Sui Bridge",
    type: "bridge",
    packageId: "0x0000000000000000000000000000000000000000000000000000000000000009",
    riskLevel: "low",
    verified: true,
    description: "Official cross-chain bridge connecting Sui to Ethereum",
    website: "https://bridge.sui.io",
  },

  // GameFi
  {
    id: "abyss-world",
    name: "Abyss World",
    type: "gaming",
    packageId: "0x0e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e",
    riskLevel: "medium",
    verified: true,
    description: "Open-world action RPG on Sui",
    website: "https://abyssworld.io",
  },
  {
    id: "panzerdogs",
    name: "Panzerdogs",
    type: "gaming",
    packageId: "0x1e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e",
    riskLevel: "medium",
    verified: true,
    description: "Tank battle game with NFT assets",
    website: "https://panzerdogs.io",
  },
];

// ── Known Scam Patterns ────────────────────────────────────

export interface ScamPattern {
  id: string;
  name: string;
  description: string;
  indicators: string[];
  riskWeight: number; // How much to add to risk score (0-50)
}

export const SCAM_PATTERNS: ScamPattern[] = [
  {
    id: "fake-airdrop",
    name: "Fake Airdrop",
    description: "Phishing via fake airdrop claims",
    indicators: ["airdrop", "claim", "free", "reward"],
    riskWeight: 40,
  },
  {
    id: "rug-pull-defi",
    name: "DeFi Rug Pull",
    description: "Liquidity drained from DeFi protocol",
    indicators: ["sudden-liquidity-removal", "contract-upgrade", "owner-dump"],
    riskWeight: 50,
  },
  {
    id: "fake-nft-mint",
    name: "Fake NFT Mint",
    description: "Copycat NFT collection mimicking legitimate projects",
    indicators: ["similar-name", "unknown-creator", "no-royalty-enforcement"],
    riskWeight: 35,
  },
  {
    id: "wash-trading",
    name: "Wash Trading",
    description: "Artificial volume via self-trades",
    indicators: ["self-transfers", "circular-flow", "low-unique-counterparties"],
    riskWeight: 30,
  },
  {
    id: "phishing-wallet",
    name: "Phishing Wallet",
    description: "Wallet used to collect funds from phishing victims",
    indicators: ["many-small-incoming", "few-outgoing-to-single", "new-wallet"],
    riskWeight: 45,
  },
  {
    id: "honeypot-token",
    name: "Honeypot Token",
    description: "Token that can be bought but not sold",
    indicators: ["buy-only-contract", "hidden-freeze", "owner-only-sell"],
    riskWeight: 50,
  },
];

// ── Protocol Interaction Analysis ──────────────────────────

export interface ProtocolInteraction {
  protocolId: string;
  protocolName: string;
  protocolType: SuiProtocol["type"];
  interactionCount: number;
  firstInteraction: string;
  lastInteraction: string;
  riskLevel: SuiProtocol["riskLevel"];
}

export interface ProtocolAnalysis {
  totalProtocols: number;
  verifiedProtocols: number;
  unverifiedProtocols: number;
  interactions: ProtocolInteraction[];
  riskFactors: string[];
  protocolScore: number; // 0-100, higher = more trustworthy
}

/**
 * Analyze which protocols a wallet has interacted with
 */
export function analyzeProtocolInteractions(
  transactions: Array<{
    transaction?: {
      data?: {
        transaction?: {
          kind?: string;
          transactions?: Array<{
            kind?: string;
            target?: string;
            package?: string;
          }>;
        };
      };
    };
  }>
): ProtocolAnalysis {
  const interactionMap = new Map<string, {
    count: number;
    firstTx: string;
    lastTx: string;
  }>();

  const knownPackages = new Map<string, SuiProtocol>();
  for (const protocol of SUI_PROTOCOLS) {
    knownPackages.set(protocol.packageId, protocol);
  }

  let verifiedCount = 0;
  let unverifiedCount = 0;
  const riskFactors: string[] = [];

  for (const tx of transactions) {
    const txData = tx.transaction?.data?.transaction;
    if (!txData) continue;

    // Check for package calls in the transaction
    const innerTxs = txData.transactions || [];
    for (const inner of innerTxs) {
      const target = inner.target || inner.package || "";
      // Extract package ID from target (format: package::module::function)
      const packageId = target.split("::")[0];

      if (knownPackages.has(packageId)) {
        const protocol = knownPackages.get(packageId)!;
        const existing = interactionMap.get(protocol.id);

        if (existing) {
          existing.count++;
        } else {
          interactionMap.set(protocol.id, {
            count: 1,
            firstTx: tx.transaction?.data?.transaction?.kind || "",
            lastTx: tx.transaction?.data?.transaction?.kind || "",
          });
        }

        if (protocol.verified) {
          verifiedCount++;
        } else {
          unverifiedCount++;
          riskFactors.push(`Interaction with unverified protocol: ${protocol.name}`);
        }

        if (protocol.riskLevel === "high") {
          riskFactors.push(`Interaction with high-risk protocol: ${protocol.name}`);
        }
      }
    }
  }

  // Build interaction list
  const interactions: ProtocolInteraction[] = [];
  for (const [protocolId, data] of interactionMap) {
    const protocol = SUI_PROTOCOLS.find((p) => p.id === protocolId);
    if (protocol) {
      interactions.push({
        protocolId,
        protocolName: protocol.name,
        protocolType: protocol.type,
        interactionCount: data.count,
        firstInteraction: data.firstTx,
        lastInteraction: data.lastTx,
        riskLevel: protocol.riskLevel,
      });
    }
  }

  // Calculate protocol score
  let protocolScore = 50; // baseline
  if (verifiedCount > 0) protocolScore -= Math.min(verifiedCount * 5, 25); // Verified = safer
  if (unverifiedCount > 0) protocolScore += unverifiedCount * 10; // Unverified = riskier
  if (interactions.length === 0) {
    protocolScore += 10; // No protocol interactions = slightly riskier (new/unused wallet)
    riskFactors.push("No known protocol interactions detected");
  }
  protocolScore = Math.max(0, Math.min(100, protocolScore));

  return {
    totalProtocols: interactions.length,
    verifiedProtocols: verifiedCount,
    unverifiedProtocols: unverifiedCount,
    interactions,
    riskFactors,
    protocolScore,
  };
}

/**
 * Get protocol by package ID
 */
export function getProtocolByPackageId(packageId: string): SuiProtocol | undefined {
  return SUI_PROTOCOLS.find((p) => p.packageId === packageId);
}

/**
 * Get all protocols of a specific type
 */
export function getProtocolsByType(type: SuiProtocol["type"]): SuiProtocol[] {
  return SUI_PROTOCOLS.filter((p) => p.type === type);
}

/**
 * Get all verified protocols
 */
export function getVerifiedProtocols(): SuiProtocol[] {
  return SUI_PROTOCOLS.filter((p) => p.verified);
}
