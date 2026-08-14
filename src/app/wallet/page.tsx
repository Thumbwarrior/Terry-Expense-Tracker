"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { formatNaira } from "@/lib/dashboard/format";

type WalletTransaction = {
  id: string;
  reference: string;
  amount: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  createdAt: string;
};

export default function WalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState("0");
  const [amount, setAmount] = useState("1000");
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [funding, setFunding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWallet = useCallback(async () => {
    setLoading(true);
    const [meResponse, txResponse] = await Promise.all([
      fetch("/api/auth/me"),
      fetch("/api/wallet/transactions"),
    ]);

    if (meResponse.status === 401) {
      router.push("/login");
      return;
    }

    const meData = meResponse.ok ? await meResponse.json() : { user: null };
    const txData = txResponse.ok ? await txResponse.json() : { transactions: [] };

    setBalance(meData.user?.balance ?? "0");
    setTransactions(txData.transactions ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  async function handleFund(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFunding(true);
    setError(null);

    const response = await fetch("/api/wallet/fund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount) }),
    });

    const data = await response.json();
    setFunding(false);

    if (!response.ok) {
      setError(data.error ?? "Could not start payment");
      return;
    }

    window.location.href = data.authorizationUrl;
  }

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <AppNav active="wallet" />

      <div className="mt-8">
        <h1 className="text-3xl font-semibold text-zinc-900">Fund wallet</h1>
        <p className="mt-2 text-zinc-600">
          Top up via Paystack test checkout. Successful payments credit your balance
          automatically.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-600">Current balance</p>
          <p className="mt-2 text-4xl font-semibold text-emerald-700">
            {formatNaira(balance)}
          </p>
        </div>

        <form
          onSubmit={handleFund}
          className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-medium text-zinc-900">Add money</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Minimum ₦100. Uses Paystack sandbox in test mode.
          </p>
          <label className="mt-4 block text-sm font-medium text-zinc-700">
            Amount (NGN)
          </label>
          <input
            type="number"
            min="100"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={funding}
            className="mt-4 w-full rounded-lg bg-zinc-900 px-4 py-2 text-white disabled:opacity-60"
          >
            {funding ? "Redirecting to Paystack..." : "Pay with Paystack"}
          </button>
        </form>
      </div>

      <section className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-zinc-900">Recent top-ups</h2>
        {loading ? (
          <p className="mt-4 text-sm text-zinc-600">Loading...</p>
        ) : transactions.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600">No wallet transactions yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-zinc-200">
            {transactions.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-zinc-900">{formatNaira(tx.amount)}</p>
                  <p className="text-zinc-500">{tx.reference}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    tx.status === "SUCCESS"
                      ? "bg-emerald-100 text-emerald-800"
                      : tx.status === "PENDING"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {tx.status.toLowerCase()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-6 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600">
        <p className="font-medium text-zinc-800">Paystack test card</p>
        <p className="mt-1">Card: 4084 0840 8408 4081 · Expiry: any future date · CVV: 408 · PIN: 0000 · OTP: 123456</p>
      </div>
    </div>
  );
}
