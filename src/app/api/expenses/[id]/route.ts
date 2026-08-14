import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthError, requireAuth } from "@/lib/auth/require-auth";
import { getOwnedExpense } from "@/lib/expense/queries";
import { toPublicExpense } from "@/lib/expense/serialize";
import { updateExpenseSchema } from "@/lib/validations/expense";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = await context.params;
  const expense = await getOwnedExpense(auth.userId, id);

  if (!expense) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  return NextResponse.json({ expense: toPublicExpense(expense) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = await context.params;
  const existing = await getOwnedExpense(auth.userId, id);

  if (!existing) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsed = updateExpenseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json(
        { error: "No fields provided to update" },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(parsed.data.date ? { date: new Date(parsed.data.date) } : {}),
      },
    });

    return NextResponse.json({ expense: toPublicExpense(expense) });
  } catch (error) {
    console.error("[expenses PATCH]", error);
    return NextResponse.json(
      { error: "Something went wrong while updating the expense" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = await context.params;
  const existing = await getOwnedExpense(auth.userId, id);

  if (!existing) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  await prisma.expense.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
