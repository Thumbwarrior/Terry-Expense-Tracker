"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppNav } from "@/components/app-nav";
import { SpendingCharts } from "@/components/spending-charts";
import {
  formatCategoryLabel,
  formatNaira,
  type DashboardSummary,
} from "@/lib/dashboard/format";
import { currentMonthRange } from "@/lib/dashboard/period";

type UserProfile = {
  name: string;
  balance: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const defaultRange = useMemo(() => currentMonthRange(), []);
  const [range, setRange] = useState(defaultRange);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      from: range.from,
      to: range.to,
    });

    const [summaryResponse, meResponse] = await Promise.all([
      fetch(`/api/dashboard/summary?${params.toString()}`),
      fetch("/api/auth/me"),
    ]);

    if (summaryResponse.status === 401 || meResponse.status === 401) {
      router.push("/login");
      return;
    }

    if (!summaryResponse.ok) {
      const data = await summaryResponse.json();
      setError(data.error ?? "Could not load dashboard");
      setLoading(false);
      return;
    }

    const summaryData = await summaryResponse.json();
    const meData = meResponse.ok ? await meResponse.json() : { user: null };

    setSummary(summaryData);
    setUser(
      meData.user
        ? { name: meData.user.name, balance: meData.user.balance }
        : null
    );
    setLoading(false);
  }, [range.from, range.to, router]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const topCategory = summary?.byCategory.reduce<(typeof summary.byCategory)[0] | null>(
    (best, row) => {
      if (!best || Number(row.total) > Number(best.total)) return row;
      return best;
    },
    null
  );

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <AppNav active="dashboard" />

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">
            {user ? `Hi, ${user.name.split(" ")[0]}` : "Dashboard"}
          </h1>
          <p className="mt-2 text-zinc-600">
            See where your money goes and track spending by category.
          </p>
        </div>

        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            loadDashboard();
          }}
        >
          <div>
            <label className="block text-sm font-medium text-zinc-700">From</label>
            <input
              type="date"
              value={range.from}
              onChange={(event) =>
                setRange((current) => ({ ...current, from: event.target.value }))
              }
              className="mt-1 rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">To</label>
            <input
              type="date"
              value={range.to}
              onChange={(event) =>
                setRange((current) => ({ ...current, to: event.target.value }))
              }
              className="mt-1 rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-white"
          >
            Apply
          </button>
        </form>
      </div>

      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="mt-8 text-sm text-zinc-600">Loading dashboard...</p>
      ) : summary ? (
        <>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-zinc-600">Total spent</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-900">
                {formatNaira(summary.total)}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-zinc-600">Expenses logged</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-900">
                {summary.expenseCount}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-zinc-600">Wallet balance</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-700">
                {formatNaira(user?.balance ?? "0")}
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Top category:{" "}
                {topCategory
                  ? `${formatCategoryLabel(topCategory.category)} (${formatNaira(topCategory.total)})`
                  : "None yet"}
              </p>
              <Link
                href="/wallet"
                className="mt-3 inline-block text-sm font-medium text-emerald-700 underline"
              >
                Fund wallet
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <SpendingCharts data={summary.byCategory} />
          </div>

          <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-medium text-zinc-900">Category breakdown</h2>
              <Link href="/expenses" className="text-sm font-medium text-zinc-900 underline">
                Manage expenses
              </Link>
            </div>
            {summary.byCategory.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-600">
                No expenses in this date range.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-zinc-200">
                {summary.byCategory
                  .slice()
                  .sort((a, b) => Number(b.total) - Number(a.total))
                  .map((row) => (
                    <li
                      key={row.category}
                      className="flex items-center justify-between py-3 text-sm"
                    >
                      <span className="text-zinc-700">
                        {formatCategoryLabel(row.category)} · {row.count} expenses
                      </span>
                      <span className="font-medium text-zinc-900">
                        {formatNaira(row.total)}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
