import { NextRequest } from "next/server";
import { runAgent } from "@/lib/agent/agent";
import { apiError, apiSuccess, withTimeout } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history, walletAddress } = body;

    if (!message || typeof message !== "string") {
      return apiError("Message is required", 400);
    }

    if (message.length > 10000) {
      return apiError("Message too long. Maximum 10,000 characters.", 400);
    }

    const response = await withTimeout(
      runAgent(message, walletAddress || undefined, history || []),
      60000
    );

    return apiSuccess(response as unknown as Record<string, unknown>);
  } catch (error: unknown) {
    console.error("Agent API error:", error);

    if (error instanceof Error && error.message.includes("Timeout")) {
      return apiSuccess({
        content: "The analysis took too long. Please try a simpler query.",
        sources: [],
        toolsUsed: [],
        agentSteps: [],
      } as unknown as Record<string, unknown>);
    }

    return apiSuccess({
      content: `Error: ${error instanceof Error ? error.message : String(error)}. Please try again.`,
      sources: [],
      toolsUsed: [],
      agentSteps: [],
    } as unknown as Record<string, unknown>);
  }
}
