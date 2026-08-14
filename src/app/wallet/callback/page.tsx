"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AppNav } from "@/components/app-nav";
import { formatNaira } from "@/lib/dashboard/format";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your payment...");
  const [amount, setAmount] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setStatus("error");
      setMessage("Missing payment reference.");
      return;
    }

    async function verifyPayment() {
      const response = await fetch("/api/wallet/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error ?? "Payment verification failed.");
        return;
      }

      setStatus("success");
      setAmount(data.amount ?? null);
      setMessage(
        data.alreadyProcessed
          ? "Payment was already credited to your wallet."
          : "Wallet funded successfully."
      );
    }

    verifyPayment();
  }, [reference]);

  return (
    <div className="mx-auto min-h-screen max-w-lg px-6 py-10">
      <AppNav active="wallet" />
      <div className="mt-12 rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        {status === "loading" && (
          <p className="text-zinc-600">{message}</p>
        )}
        {status === "success" && (
          <>
            <p className="text-lg font-semibold text-emerald-700">Payment confirmed</p>
            {amount && (
              <p className="mt-2 text-3xl font-semibold text-zinc-900">
                +{formatNaira(amount)}
              </p>
            )}
            <p className="mt-3 text-sm text-zinc-600">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <p className="text-lg font-semibold text-red-600">Payment not completed</p>
            <p className="mt-3 text-sm text-zinc-600">{message}</p>
          </>
        )}
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/wallet"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-white"
          >
            Back to wallet
          </Link>
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg border border-zinc-300 px-4 py-2"
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WalletCallbackPage() {
  return (
    <Suspense fallback={<p className="p-10 text-sm text-zinc-600">Loading...</p>}>
      <CallbackContent />
    </Suspense>
  );
}
