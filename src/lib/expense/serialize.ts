import type { Expense } from "@/generated/prisma/client";

export function toPublicExpense(expense: Expense) {
  return {
    id: expense.id,
    title: expense.title,
    amount: expense.amount.toString(),
    category: expense.category,
    date: expense.date.toISOString().slice(0, 10),
    description: expense.description,
    createdAt: expense.createdAt.toISOString(),
    updatedAt: expense.updatedAt.toISOString(),
  };
}
