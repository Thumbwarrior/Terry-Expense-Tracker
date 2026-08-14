import { prisma } from "@/lib/db";
import { verifyPaystackTransaction } from "@/lib/paystack/client";

export type WalletCreditResult =
  | { ok: true; alreadyProcessed: boolean; userId: string; amount: string }
  | { ok: false; reason: "not_found" | "not_owned" | "failed" | "invalid_amount" };

export async function completeWalletTopUp(
  reference: string,
  expectedUserId?: string
): Promise<WalletCreditResult> {
  const verification = await verifyPaystackTransaction(reference);

  if (!verification.status || !verification.data) {
    return { ok: false, reason: "failed" };
  }

  const { data } = verification;

  if (data.status !== "success") {
    await prisma.walletTransaction.updateMany({
      where: { reference, status: "PENDING" },
      data: { status: "FAILED" },
    });
    return { ok: false, reason: "failed" };
  }

  return prisma.$transaction(async (tx) => {
    const walletTx = await tx.walletTransaction.findUnique({
      where: { reference },
    });

    if (!walletTx) {
      return { ok: false as const, reason: "not_found" as const };
    }

    if (expectedUserId && walletTx.userId !== expectedUserId) {
      return { ok: false as const, reason: "not_owned" as const };
    }

    if (walletTx.amountKobo !== data.amount) {
      await tx.walletTransaction.update({
        where: { id: walletTx.id },
        data: { status: "FAILED" },
      });
      return { ok: false as const, reason: "invalid_amount" as const };
    }

    if (walletTx.status === "SUCCESS") {
      return {
        ok: true as const,
        alreadyProcessed: true,
        userId: walletTx.userId,
        amount: walletTx.amount.toString(),
      };
    }

    await tx.walletTransaction.update({
      where: { id: walletTx.id },
      data: {
        status: "SUCCESS",
        paystackRef: String(data.id),
      },
    });

    await tx.user.update({
      where: { id: walletTx.userId },
      data: {
        balance: { increment: walletTx.amount },
      },
    });

    return {
      ok: true as const,
      alreadyProcessed: false,
      userId: walletTx.userId,
      amount: walletTx.amount.toString(),
    };
  });
}

export function createWalletReference(userId: string) {
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  return `wallet_${userId.slice(0, 8)}_${suffix}`;
}
