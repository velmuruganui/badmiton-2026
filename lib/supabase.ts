import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Whether real Supabase credentials are configured. When false, the app runs
 * fully client-side with localStorage persistence so it still works offline /
 * without a backend (great for a quick local demo).
 */
export const isSupabaseEnabled = Boolean(url && anonKey);

export const AVATAR_BUCKET = "avatars";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseEnabled) return null;
  if (!client) {
    client = createClient(url as string, anonKey as string, {
      realtime: { params: { eventsPerSecond: 10 } },
    });
  }
  return client;
}
