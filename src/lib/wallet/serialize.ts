import type { WalletTransaction } from "@/generated/prisma/client";

export function toPublicWalletTransaction(transaction: WalletTransaction) {
  return {
    id: transaction.id,
    reference: transaction.reference,
    amount: transaction.amount.toString(),
    status: transaction.status,
    createdAt: transaction.createdAt.toISOString(),
  };
}
