#!/bin/bash
# ═══════════════════════════════════════════════════════════
# SuiShield — Deploy to Sui Testnet
# ═══════════════════════════════════════════════════════════

set -e

echo "🚀 SuiShield — Deploy to Sui Testnet"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if sui CLI is installed
if ! command -v sui &> /dev/null; then
    echo "❌ Sui CLI not found. Install it with: brew install sui"
    exit 1
fi

echo "✅ Sui CLI found: $(sui --version)"

# Check active address
ADDRESS=$(sui client active-address 2>/dev/null)
if [ -z "$ADDRESS" ]; then
    echo "❌ No active Sui address. Run: sui client"
    exit 1
fi
echo "📍 Active address: $ADDRESS"

# Check balance
echo "💰 Checking balance..."
GAS_OUTPUT=$(sui client gas 2>&1)
if echo "$GAS_OUTPUT" | grep -q "No gas coins"; then
    echo "❌ No gas coins. Get testnet SUI from: https://faucet.sui.io"
    echo "   Or run: sui client faucet"
    echo ""
    echo "   Your address: $ADDRESS"
    exit 1
fi
echo "✅ Gas coins available"

# Build the contract
echo ""
echo "🔨 Building contract..."
cd "$(dirname "$0")/../move"
sui move build 2>&1
echo "✅ Contract built successfully"

# Deploy
echo ""
echo "📦 Deploying to testnet..."
DEPLOY_OUTPUT=$(sui client publish --gas-budget 100000000 2>&1)
echo "$DEPLOY_OUTPUT"

# Extract package ID
PACKAGE_ID=$(echo "$DEPLOY_OUTPUT" | grep -A1 "Published Objects" | grep "PackageID" | awk '{print $NF}' | tr -d '[:space:]')
if [ -z "$PACKAGE_ID" ]; then
    # Try alternative extraction
    PACKAGE_ID=$(echo "$DEPLOY_OUTPUT" | grep "packageId" | head -1 | awk '{print $NF}' | tr -d '[:space:]' | tr -d '"')
fi

# Extract registry object ID (TrustLayer shared object)
REGISTRY_ID=$(echo "$DEPLOY_OUTPUT" | grep -B2 "TrustLayer" | grep "ObjectId" | awk '{print $NF}' | tr -d '[:space:]')
if [ -z "$REGISTRY_ID" ]; then
    # Try alternative extraction
    REGISTRY_ID=$(echo "$DEPLOY_OUTPUT" | grep -A5 "Created" | grep "0x" | head -1 | awk '{print $NF}' | tr -d '[:space:]')
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -n "$PACKAGE_ID" ]; then
    echo "📦 Package ID: $PACKAGE_ID"
    echo ""
    echo "Add this to your .env.local:"
    echo "NEXT_PUBLIC_SUI_SHIELD_PACKAGE=$PACKAGE_ID"
else
    echo "⚠️  Could not extract Package ID. Check the output above."
fi

if [ -n "$REGISTRY_ID" ]; then
    echo "🏛️  Registry ID: $REGISTRY_ID"
    echo ""
    echo "Add this to your .env.local:"
    echo "NEXT_PUBLIC_SUI_SHIELD_REGISTRY=$REGISTRY_ID"
else
    echo "⚠️  Could not extract Registry ID. Check the output above."
    echo "   Look for 'TrustLayer' in the Created Objects section."
fi

echo ""
echo "📝 Next steps:"
echo "   1. Update .env.local with the IDs above"
echo "   2. Restart your Next.js dev server: npm run dev"
echo "   3. Test the contract integration"
echo ""
echo "🔍 Verify on SuiScan: https://suiscan.xyz/testnet"
