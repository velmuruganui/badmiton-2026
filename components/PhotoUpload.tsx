"use client";

import { useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { getSupabase, AVATAR_BUCKET, isSupabaseEnabled } from "@/lib/supabase";
import { playerId as makePlayerId } from "@/lib/tournament-data";
import { Avatar } from "./Avatar";

const OUTPUT = 256;

/** Load, center-crop to a square and downscale an image file. */
async function toSquare(file: File): Promise<{ blob: Blob; dataUrl: string }> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT;
  canvas.height = OUTPUT;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, OUTPUT, OUTPUT);
  bitmap.close();

  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b as Blob), "image/jpeg", 0.85),
  );
  return { blob, dataUrl };
}

export function PhotoUpload({
  categorySlug,
  name,
}: {
  categorySlug: string;
  name: string;
}) {
  const { setAvatar } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const id = makePlayerId(categorySlug, name);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { blob, dataUrl } = await toSquare(file);

      if (isSupabaseEnabled) {
        const supabase = getSupabase();
        if (supabase) {
          const path = `${categorySlug}/${encodeURIComponent(name)}-${Date.now()}.jpg`;
          const { error: upErr } = await supabase.storage
            .from(AVATAR_BUCKET)
            .upload(path, blob, { contentType: "image/jpeg", upsert: true });
          if (upErr) throw upErr;
          const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
          setAvatar(id, data.publicUrl);
        }
      } else {
        // Local mode: persist the resized data URL directly.
        setAvatar(id, dataUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Avatar categorySlug={categorySlug} name={name} size="lg" />
      <div className="min-w-0">
        <p className="truncate font-medium">{name}</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="mt-1 rounded-md border border-line bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted hover:text-white disabled:opacity-50"
        >
          {busy ? "Uploading…" : "Add / change photo"}
        </button>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFile}
        />
      </div>
    </div>
  );
}
