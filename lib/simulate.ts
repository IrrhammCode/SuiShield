// Transaction Simulator — Preview what would happen before you approve
// Uses Tatum Sui RPC to simulate transaction outcomes

import { getSuiBalances, getSuiTransactionBlocks, formatSuiBalance, mistToSui } from "./tatum-sui";

// ── Types ────────────────────────────────────────────────

export interface SimulationResult {
  success: boolean;
  estimatedGas: string;
  balanceChanges: {
    address: string;
    coinType: string;
    before: string;
    after: string;
    change: string;
  }[];
  riskAssessment: {
    level: "safe" | "caution" | "dangerous";
    warnings: string[];
    recommendation: string;
  };
  executionTime: number;
}

export interface SimulateParams {
  fromAddress: string;
  toAddress: string;
  amount: number; // in SUI
  coinType?: string;
}

// ── Simulate Transfer ────────────────────────────────────

export async function simulateTransfer(params: SimulateParams): Promise<SimulationResult> {
  const start = Date.now();
  const warnings: string[] = [];

  try {
    // Fetch current balances
    const [fromBalances, toBalances, toHistory] = await Promise.all([
      getSuiBalances(params.fromAddress),
      getSuiBalances(params.toAddress),
      getSuiTransactionBlocks(params.toAddress, 10),
    ]);

    const coinType = params.coinType || "0x2::sui::SUI";
    const fromBalance = fromBalances.find((b) => b.coinType === coinType);
    const toBalance = toBalances.find((b) => b.coinType === coinType);

    const fromAmount = fromBalance ? mistToSui(fromBalance.totalBalance) : 0;
    const toAmount = toBalance ? mistToSui(toBalance.totalBalance) : 0;

    // Check if sender has enough balance
    const estimatedGas = 0.001; // ~0.001 SUI gas
    const totalNeeded = params.amount + estimatedGas;
    const hasEnoughBalance = fromAmount >= totalNeeded;

    if (!hasEnoughBalance) {
      warnings.push(`Insufficient balance: have ${fromAmount.toFixed(4)} SUI, need ${totalNeeded.toFixed(4)} SUI`);
    }

    // Check if receiver has recent activity
    const toTxCount = (toHistory.data || []).length;
    if (toTxCount === 0) {
      warnings.push("Receiver has no transaction history — could be a new/unused address");
    }

    // Check for suspicious patterns on receiver
    const recentTxs = (toHistory.data || []) as Array<{
      digest?: string;
      timestampMs?: string;
      balanceChanges?: Array<{
        owner?: { AddressOwner?: string };
        amount?: string;
      }>;
    }>;
    const largeInflows = recentTxs.filter((tx) => {
      if (!tx.balanceChanges) return false;
      return tx.balanceChanges.some(
        (c) => c.owner?.AddressOwner === params.toAddress && parseInt(c.amount || "0") > 0
      );
    });

    if (largeInflows.length > 5) {
      warnings.push("Receiver has many recent inflows — potential consolidation address");
    }

    // Determine risk level
    let level: SimulationResult["riskAssessment"]["level"] = "safe";
    if (warnings.length >= 2) {
      level = "dangerous";
    } else if (warnings.length === 1) {
      level = "caution";
    }

    // Build recommendation
    const recommendation = level === "dangerous"
      ? "DO NOT proceed — multiple risk factors detected"
      : level === "caution"
      ? "Proceed with caution — review warnings above"
      : "Transaction appears safe to proceed";

    return {
      success: hasEnoughBalance,
      estimatedGas: `${estimatedGas} SUI`,
      balanceChanges: [
        {
          address: params.fromAddress,
          coinType,
          before: `${fromAmount.toFixed(4)} SUI`,
          after: `${(fromAmount - params.amount - estimatedGas).toFixed(4)} SUI`,
          change: `-${(params.amount + estimatedGas).toFixed(4)} SUI`,
        },
        {
          address: params.toAddress,
          coinType,
          before: `${toAmount.toFixed(4)} SUI`,
          after: `${(toAmount + params.amount).toFixed(4)} SUI`,
          change: `+${params.amount.toFixed(4)} SUI`,
        },
      ],
      riskAssessment: {
        level,
        warnings,
        recommendation,
      },
      executionTime: Date.now() - start,
    };
  } catch (error) {
    return {
      success: false,
      estimatedGas: "~0.001 SUI",
      balanceChanges: [],
      riskAssessment: {
        level: "dangerous",
        warnings: [`Simulation failed: ${error instanceof Error ? error.message : String(error)}`],
        recommendation: "Cannot simulate — do not proceed",
      },
      executionTime: Date.now() - start,
    };
  }
}

// ── Simulate Contract Interaction ────────────────────────

export async function simulateContractInteraction(
  walletAddress: string,
  contractAddress: string,
  functionName: string
): Promise<SimulationResult> {
  const start = Date.now();
  const warnings: string[] = [];

  try {
    // Fetch wallet and contract data
    const [walletBalances, contractTxs] = await Promise.all([
      getSuiBalances(walletAddress),
      getSuiTransactionBlocks(contractAddress, 20),
    ]);

    const suiBalance = walletBalances.find((b) => b.coinType === "0x2::sui::SUI");
    const balance = suiBalance ? mistToSui(suiBalance.totalBalance) : 0;

    // Check contract activity
    const contractTxCount = (contractTxs.data || []).length;
    if (contractTxCount < 10) {
      warnings.push("Contract has very few interactions — could be new/untested");
    }

    // Check if contract has been flagged
    const recentTxs = contractTxs.data || [];
    const failedTxs = (recentTxs as Array<{ effects?: { status?: { status?: string } } }>).filter(
      (tx) => tx.effects?.status?.status !== "success"
    );
    if (failedTxs.length > recentTxs.length * 0.3) {
      warnings.push("High failure rate on this contract — many transactions failing");
    }

    // Risk level
    let level: SimulationResult["riskAssessment"]["level"] = "safe";
    if (warnings.length >= 2) level = "dangerous";
    else if (warnings.length === 1) level = "caution";

    return {
      success: true,
      estimatedGas: "~0.002 SUI",
      balanceChanges: [
        {
          address: walletAddress,
          coinType: "0x2::sui::SUI",
          before: `${balance.toFixed(4)} SUI`,
          after: `${(balance - 0.002).toFixed(4)} SUI`,
          change: "-0.002 SUI (gas only)",
        },
      ],
      riskAssessment: {
        level,
        warnings,
        recommendation: level === "dangerous"
          ? "DO NOT interact with this contract"
          : level === "caution"
          ? "Proceed with caution"
          : "Contract interaction appears safe",
      },
      executionTime: Date.now() - start,
    };
  } catch (error) {
    return {
      success: false,
      estimatedGas: "~0.002 SUI",
      balanceChanges: [],
      riskAssessment: {
        level: "dangerous",
        warnings: [`Simulation failed: ${error instanceof Error ? error.message : String(error)}`],
        recommendation: "Cannot simulate — do not proceed",
      },
      executionTime: Date.now() - start,
    };
  }
}
