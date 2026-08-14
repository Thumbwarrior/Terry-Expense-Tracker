import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthError, requireAuth } from "@/lib/auth/require-auth";
import { toPublicWalletTransaction } from "@/lib/wallet/serialize";

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const transactions = await prisma.walletTransaction.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    transactions: transactions.map(toPublicWalletTransaction),
  });
}
