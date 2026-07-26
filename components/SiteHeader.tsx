"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UmpireLockButton } from "./UmpireLockButton";
import { ThemeToggle } from "./ThemeToggle";
import { ConnectionBadge } from "./ConnectionBadge";

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-lg"
            style={{
              background: "var(--logo-bg)",
              color: "var(--logo-racket)",
            }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <defs>
                <clipPath id="racketHead">
                  <ellipse cx="12" cy="8" rx="6" ry="7" />
                </clipPath>
              </defs>
              <g transform="rotate(-40 12 12)">
                <g
                  clipPath="url(#racketHead)"
                  stroke="#ffffff"
                  strokeWidth="0.6"
                  opacity="0.85"
                >
                  <line x1="8" y1="1.5" x2="8" y2="14.5" />
                  <line x1="10" y1="1.5" x2="10" y2="14.5" />
                  <line x1="12" y1="1.5" x2="12" y2="14.5" />
                  <line x1="14" y1="1.5" x2="14" y2="14.5" />
                  <line x1="16" y1="1.5" x2="16" y2="14.5" />
                  <line x1="5.5" y1="4" x2="18.5" y2="4" />
                  <line x1="5.5" y1="6" x2="18.5" y2="6" />
                  <line x1="5.5" y1="8" x2="18.5" y2="8" />
                  <line x1="5.5" y1="10" x2="18.5" y2="10" />
                  <line x1="5.5" y1="12" x2="18.5" y2="12" />
                </g>
                <ellipse
                  cx="12"
                  cy="8"
                  rx="6"
                  ry="7"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M12 15 L12 22"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <g stroke="#012a38" strokeWidth="0.5" strokeLinejoin="round">
                  <path d="M10 5.4 L14 5.4 L12.9 9 L11.1 9 Z" fill="#ffffff" />
                  <circle cx="12" cy="9.6" r="1.3" fill="#ffffff" />
                </g>
              </g>
            </svg>
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
          <Link
            href="/winners"
            className={`rounded-full px-3 py-1.5 font-medium ${
              pathname === "/winners"
                ? "bg-surface-2 text-strong"
                : "text-muted hover:text-strong"
            }`}
          >
            Winners
          </Link>

          <ConnectionBadge />
          <UmpireLockButton />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
