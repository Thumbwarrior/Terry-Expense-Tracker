import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthError, requireAuth } from "@/lib/auth/require-auth";
import { toPublicExpense } from "@/lib/expense/serialize";
import {
  createExpenseSchema,
  EXPENSE_CATEGORIES,
  type ExpenseCategoryValue,
} from "@/lib/validations/expense";
import type { ExpenseCategory } from "@/generated/prisma/client";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (category && !EXPENSE_CATEGORIES.includes(category as ExpenseCategoryValue)) {
    return NextResponse.json({ error: "Invalid category filter" }, { status: 400 });
  }

  if (from && Number.isNaN(Date.parse(from))) {
    return NextResponse.json({ error: "Invalid from date" }, { status: 400 });
  }

  if (to && Number.isNaN(Date.parse(to))) {
    return NextResponse.json({ error: "Invalid to date" }, { status: 400 });
  }

  const expenses = await prisma.expense.findMany({
    where: {
      userId: auth.userId,
      ...(category ? { category: category as ExpenseCategory } : {}),
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({
    expenses: expenses.map(toPublicExpense),
  });
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const parsed = createExpenseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, amount, category, date, description } = parsed.data;

    const expense = await prisma.expense.create({
      data: {
        userId: auth.userId,
        title,
        amount,
        category,
        date: new Date(date),
        description,
      },
    });

    return NextResponse.json(
      { expense: toPublicExpense(expense) },
      { status: 201 }
    );
  } catch (error) {
    console.error("[expenses POST]", error);
    return NextResponse.json(
      { error: "Something went wrong while creating the expense" },
      { status: 500 }
    );
  }
}
