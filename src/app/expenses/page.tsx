"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { AppNav } from "@/components/app-nav";
import { formatCategoryLabel, formatNaira } from "@/lib/dashboard/format";
import {
  EXPENSE_CATEGORIES,
  type ExpenseCategoryValue,
} from "@/lib/validations/expense";

type Expense = {
  id: string;
  title: string;
  amount: string;
  category: ExpenseCategoryValue;
  date: string;
  description: string | null;
};

const emptyForm = {
  title: "",
  amount: "",
  category: "FOOD" as ExpenseCategoryValue,
  date: new Date().toISOString().slice(0, 10),
  description: "",
};

function formatCategory(category: ExpenseCategoryValue) {
  return formatCategoryLabel(category);
}

export default function ExpensesPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/expenses");
    if (response.status === 401) {
      router.push("/login");
      return;
    }
    const data = await response.json();
    setExpenses(data.expenses ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError(null);
  }

  function startEdit(expense: Expense) {
    setEditingId(expense.id);
    setForm({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      description: expense.description ?? "",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title: form.title,
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
      description: form.description || undefined,
    };

    const response = await fetch(
      editingId ? `/api/expenses/${editingId}` : "/api/expenses",
      {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(data.error ?? "Could not save expense");
      return;
    }

    resetForm();
    await loadExpenses();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this expense?")) return;

    const response = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Could not delete expense");
      return;
    }

    if (editingId === id) resetForm();
    await loadExpenses();
  }

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <AppNav active="expenses" />

      <div className="mt-8">
        <h1 className="text-2xl font-semibold text-zinc-900">Expenses</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Add, edit, and delete your spending records.{" "}
          <Link href="/dashboard" className="font-medium text-zinc-900 underline">
            View dashboard
          </Link>
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-medium text-zinc-900">
          {editingId ? "Edit expense" : "Add expense"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-zinc-700">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">Amount</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">Category</label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value as ExpenseCategoryValue,
                })
              }
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            >
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {formatCategory(category)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-zinc-700">
              Description (optional)
            </label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : editingId ? "Update expense" : "Add expense"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-zinc-300 px-4 py-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <section className="mt-8">
        <h2 className="text-lg font-medium text-zinc-900">Your expenses</h2>
        {loading ? (
          <p className="mt-4 text-sm text-zinc-600">Loading...</p>
        ) : expenses.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600">No expenses yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
            {expenses.map((expense) => (
              <li
                key={expense.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-zinc-900">{expense.title}</p>
                  <p className="text-sm text-zinc-600">
                    {formatCategory(expense.category)} · {expense.date}
                  </p>
                  {expense.description && (
                    <p className="mt-1 text-sm text-zinc-500">{expense.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-zinc-900">
                    {formatNaira(expense.amount)}
                  </span>
                  <button
                    onClick={() => startEdit(expense)}
                    className="text-sm text-zinc-700 underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="text-sm text-red-600 underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
