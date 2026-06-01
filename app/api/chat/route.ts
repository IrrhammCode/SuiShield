import { NextResponse } from "next/server";
import { runAgent } from "@/lib/agent/agent";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, history, walletAddress } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const response = await runAgent(
      message,
      walletAddress || undefined,
      history || []
    );

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Agent API error:", error);
    return NextResponse.json(
      {
        content: `I encountered an error processing your request: ${(error instanceof Error ? error.message : String(error))}. Please try again.`,
        sources: [],
        toolsUsed: [],
        agentSteps: [],
      },
      { status: 500 }
    );
  }
}
