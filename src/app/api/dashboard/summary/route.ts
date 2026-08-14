import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthError, requireAuth } from "@/lib/auth/require-auth";
import type { DashboardSummary } from "@/lib/dashboard/format";
import {
  currentMonthRange,
  parseDateInput,
  toDateInputValue,
} from "@/lib/dashboard/period";
import { EXPENSE_CATEGORIES } from "@/lib/validations/expense";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const defaults = currentMonthRange();
  const fromInput = searchParams.get("from") ?? defaults.from;
  const toInput = searchParams.get("to") ?? defaults.to;

  const fromDate = parseDateInput(fromInput);
  const toDate = parseDateInput(toInput);

  if (!fromDate || !toDate) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }

  if (fromDate > toDate) {
    return NextResponse.json(
      { error: "'from' date must be before 'to' date" },
      { status: 400 }
    );
  }

  const grouped = await prisma.expense.groupBy({
    by: ["category"],
    where: {
      userId: auth.userId,
      date: {
        gte: fromDate,
        lte: toDate,
      },
    },
    _sum: { amount: true },
    _count: { _all: true },
  });

  const totalsByCategory = new Map(
    grouped.map((row) => [
      row.category,
      {
        total: row._sum.amount ?? 0,
        count: row._count._all,
      },
    ])
  );

  let totalSpent = 0;
  let expenseCount = 0;

  const byCategory = EXPENSE_CATEGORIES.map((category) => {
    const row = totalsByCategory.get(category);
    const total = row ? Number(row.total) : 0;
    const count = row?.count ?? 0;
    totalSpent += total;
    expenseCount += count;

    return {
      category,
      total: total.toFixed(2),
      count,
    };
  }).filter((row) => row.count > 0);

  const summary: DashboardSummary = {
    total: totalSpent.toFixed(2),
    expenseCount,
    byCategory,
    period: {
      from: toDateInputValue(fromDate),
      to: toDateInputValue(toDate),
    },
  };

  return NextResponse.json(summary);
}
