import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6">
      <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
        Terry Tracker
      </p>
      <h1 className="mt-3 text-4xl font-semibold text-zinc-900">
        Track spending. Fund your wallet. Own your money.
      </h1>
      <p className="mt-4 text-lg text-zinc-600">
        Terry Tracker helps you log expenses, visualize spending by category,
        and top up your wallet with Paystack — built for your fintech portfolio.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/signup"
          className="rounded-lg bg-zinc-900 px-5 py-3 text-white"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-zinc-300 px-5 py-3 text-zinc-900"
        >
          Sign in
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border border-zinc-300 px-5 py-3 text-zinc-900"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
