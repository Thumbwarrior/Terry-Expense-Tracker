import { prisma } from "@/lib/db";

export async function getOwnedExpense(userId: string, expenseId: string) {
  return prisma.expense.findFirst({
    where: { id: expenseId, userId },
  });
}
