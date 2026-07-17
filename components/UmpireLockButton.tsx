"use client";

import { useRef, useState } from "react";
import { useUmpire } from "@/lib/umpire";

export function UmpireLockButton() {
  const { isUmpire, unlock, lock } = useUmpire();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  function open() {
    setPin("");
    setError(false);
    dialogRef.current?.showModal();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (unlock(pin)) {
      dialogRef.current?.close();
    } else {
      setError(true);
    }
  }

  if (isUmpire) {
    return (
      <button
        onClick={lock}
        className="inline-flex items-center gap-1.5 rounded-full border border-brand/50 bg-brand/15 px-3 py-1.5 text-sm font-medium text-brand"
      >
        <span aria-hidden>●</span> Umpire · lock
      </button>
    );
  }

  return (
    <>
      <button
        onClick={open}
        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 py-1.5 text-sm font-medium text-muted hover:text-white"
      >
        <span aria-hidden>🔒</span> View only
      </button>

      <dialog
        ref={dialogRef}
        className="m-auto w-[90vw] max-w-sm rounded-2xl border border-line bg-surface p-0 text-white backdrop:bg-black/60"
      >
        <form onSubmit={submit} className="p-5">
          <h2 className="text-lg font-semibold">Enter umpire PIN</h2>
          <p className="mt-1 text-sm text-muted">
            Unlock scoring controls for this device.
          </p>
          <input
            autoFocus
            inputMode="numeric"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError(false);
            }}
            placeholder="PIN"
            className={`mt-4 w-full rounded-lg border bg-surface-2 px-3 py-2 text-lg tabular outline-none ${
              error ? "border-red-500" : "border-line focus:border-brand"
            }`}
          />
          {error && (
            <p className="mt-2 text-sm text-red-400">Incorrect PIN, try again.</p>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="rounded-lg px-4 py-2 text-sm text-muted hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-ink"
            >
              Unlock
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
