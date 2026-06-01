import { NextRequest, NextResponse } from "next/server";
import {
  createWebhookSubscription,
  getActiveSubscriptions,
  deleteWebhookSubscription,
  processWebhookCallback,
  monitorAddress,
  getMonitoredAddresses,
  getWebhookStatus,
  type WebhookEventType,
} from "@/lib/tatum-webhooks";

// GET — List monitored addresses and webhook status
export async function GET() {
  try {
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

// POST — Create webhook subscription or add address to monitor
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, address, chain, eventType, callbackUrl } = body;

    if (!address || typeof address !== "string") {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    switch (action) {
      case "subscribe": {
        // Create Tatum webhook subscription
        const subscription = await createWebhookSubscription(
          address,
          chain || "sui-testnet",
          (eventType || "ADDRESS_TRANSACTION") as WebhookEventType,
          callbackUrl || `${req.nextUrl.origin}/api/webhooks`
        );

        // Also track locally
        monitorAddress(address, chain || "sui-testnet", 50);

        return NextResponse.json({
          success: true,
          subscription,
          message: `Now monitoring ${address.slice(0, 10)}...`,
        });
      }

      case "monitor": {
        // Add to local monitoring only (no webhook)
        monitorAddress(address, chain || "sui-testnet", body.riskScore || 50);

        return NextResponse.json({
          success: true,
          message: `Added ${address.slice(0, 10)}... to local monitoring`,
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

// DELETE — Remove webhook subscription
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subscriptionId = searchParams.get("id");

    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 });
    }

    await deleteWebhookSubscription(subscriptionId);

    return NextResponse.json({
      success: true,
      message: "Subscription removed",
    });
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
