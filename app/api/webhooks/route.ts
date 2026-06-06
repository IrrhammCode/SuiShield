import { NextRequest, NextResponse } from "next/server";
import {
  createWebhookSubscription,
  deleteWebhookSubscription,
  processWebhookCallback,
  monitorAddress,
  unmonitorAddress,
  getMonitoredAddresses,
  getWebhookStatus,
  checkAddressActivity,
  checkAllAddresses,
  getAddressActivity,
  updateRiskScore,
  type WebhookEventType,
} from "@/lib/tatum-webhooks";

// GET — List monitored addresses, webhook status, and activity
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const address = searchParams.get("address");

    // GET ?action=activity&address=0x...
    if (action === "activity" && address) {
      const limit = parseInt(searchParams.get("limit") || "20");
      const activity = getAddressActivity(address, limit);
      return NextResponse.json({ address, activity });
    }

    // GET ?action=check&address=0x... — force check single address
    if (action === "check" && address) {
      const result = await checkAddressActivity(address);
      return NextResponse.json({ address, ...result });
    }

    // GET ?action=check-all — force check all addresses
    if (action === "check-all") {
      const results = await checkAllAddresses();
      return NextResponse.json({ results });
    }

    // Default: list all monitored + status
    const [monitored, status] = await Promise.all([
      getMonitoredAddresses(),
      getWebhookStatus(),
    ]);

    return NextResponse.json({
      monitored,
      status,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST — Create webhook subscription, add/remove address, update risk
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, address, chain, eventType, callbackUrl, riskScore, label } = body;

    if (!address || typeof address !== "string") {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    switch (action) {
      case "subscribe": {
        const subscription = await createWebhookSubscription(
          address,
          chain || "sui-testnet",
          (eventType || "ADDRESS_TRANSACTION") as WebhookEventType,
          callbackUrl || `${req.nextUrl.origin}/api/webhooks`
        );
        monitorAddress(address, chain || "sui-testnet", riskScore || 50, label);
        return NextResponse.json({
          success: true,
          subscription,
          message: `Now monitoring ${address.slice(0, 10)}...`,
        });
      }

      case "monitor": {
        monitorAddress(address, chain || "sui-testnet", riskScore || 50, label);
        // Do initial check to populate data
        try {
          await checkAddressActivity(address);
        } catch (e) {
          console.warn("Initial activity check failed:", e);
        }
        return NextResponse.json({
          success: true,
          message: `Added ${address.slice(0, 10)}... to monitoring`,
        });
      }

      case "unmonitor": {
        const removed = unmonitorAddress(address);
        return NextResponse.json({
          success: removed,
          message: removed
            ? `Removed ${address.slice(0, 10)}... from monitoring`
            : "Address not found",
        });
      }

      case "update-risk": {
        if (typeof riskScore !== "number") {
          return NextResponse.json({ error: "riskScore is required" }, { status: 400 });
        }
        const updated = updateRiskScore(address, riskScore);
        return NextResponse.json({
          success: updated,
          message: updated ? "Risk score updated" : "Address not found",
        });
      }

      case "check": {
        const result = await checkAddressActivity(address);
        return NextResponse.json({
          success: true,
          address,
          ...result,
        });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE — Remove address from monitoring
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");
    const subscriptionId = searchParams.get("id");

    if (address) {
      const removed = unmonitorAddress(address);
      return NextResponse.json({
        success: removed,
        message: removed ? "Removed from monitoring" : "Address not found",
      });
    }

    if (subscriptionId) {
      await deleteWebhookSubscription(subscriptionId);
      return NextResponse.json({ success: true, message: "Subscription removed" });
    }

    return NextResponse.json(
      { error: "Address or subscription ID is required" },
      { status: 400 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT — Process incoming webhook callback
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const result = processWebhookCallback(body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
