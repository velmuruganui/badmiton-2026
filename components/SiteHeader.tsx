"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UmpireLockButton } from "./UmpireLockButton";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white"
          >
            🏸
          </span>
          <span className="hidden sm:inline">Scoreboard 2026</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/players"
            className={`rounded-full px-3 py-1.5 font-medium ${
              pathname === "/players"
                ? "bg-surface-2 text-strong"
                : "text-muted hover:text-strong"
            }`}
          >
            Players
          </Link>
          <ThemeToggle />
          <UmpireLockButton />
        </nav>
      </div>
    </header>
  );
}
