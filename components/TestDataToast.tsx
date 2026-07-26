"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "badminton:test-data-dismissed";

/**
 * Lightweight notice letting visitors know the scores on display are demo /
 * test data, not an official tournament feed. Shows once per browser session
 * (dismissal is remembered in sessionStorage) and auto-hides after a while.
 */
export function TestDataToast() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY)) return;
    } catch {
      // sessionStorage may be unavailable (private mode) — show anyway.
    }
    setShow(true);
    const timer = setTimeout(() => setShow(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    setShow(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore storage failures
    }
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div
        role="status"
        className="flex items-center gap-3 rounded-full border border-line bg-surface-2 px-4 py-2 text-sm text-strong shadow-lg"
      >
        <span aria-hidden>🧪</span>
        <span>Currently showing test data — scores here aren&apos;t official.</span>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="ml-1 rounded-full px-1.5 text-muted hover:text-strong"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
