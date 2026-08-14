"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type NavPage = "dashboard" | "expenses" | "wallet";

const links: { href: string; label: string; key: NavPage }[] = [
  { href: "/dashboard", label: "Dashboard", key: "dashboard" },
  { href: "/expenses", label: "Expenses", key: "expenses" },
  { href: "/wallet", label: "Wallet", key: "wallet" },
];

export function AppNav({ active }: { active: NavPage }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Terry Tracker
        </p>
        <nav className="mt-3 flex flex-wrap gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm ${
                active === link.key
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-300 text-zinc-700"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <button
        onClick={handleLogout}
        className="self-start rounded-lg border border-zinc-300 px-3 py-2 text-sm"
      >
        Log out
      </button>
    </header>
  );
}
