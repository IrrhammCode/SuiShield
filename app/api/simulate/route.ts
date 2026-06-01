import { NextRequest } from "next/server";
import { simulateTransfer, simulateContractInteraction } from "@/lib/simulate";
import { apiError, apiSuccess, isValidSuiAddress } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, fromAddress, toAddress, amount, contractAddress, functionName } = body;

    if (type === "contract") {
      if (!fromAddress || !contractAddress) {
        return apiError("fromAddress and contractAddress required", 400);
      }
      if (!isValidSuiAddress(fromAddress) || !isValidSuiAddress(contractAddress)) {
        return apiError("Invalid Sui address format", 400);
      }
      const result = await simulateContractInteraction(fromAddress, contractAddress, functionName || "unknown");
      return apiSuccess(result as unknown as Record<string, unknown>);
    }

    // Default: transfer simulation
    if (!fromAddress || !toAddress || !amount) {
      return apiError("fromAddress, toAddress, and amount required", 400);
    }
    if (!isValidSuiAddress(fromAddress) || !isValidSuiAddress(toAddress)) {
      return apiError("Invalid Sui address format", 400);
    }
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return apiError("Amount must be a positive number", 400);
    }

    const result = await simulateTransfer({ fromAddress, toAddress, amount: parseFloat(amount) });
    return apiSuccess(result as unknown as Record<string, unknown>);
  } catch (error: unknown) {
    return apiError(error instanceof Error ? error.message : "Simulation failed", 500);
  }
}
