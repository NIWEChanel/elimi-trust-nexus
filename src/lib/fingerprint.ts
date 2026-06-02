import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const KEY = "elimi-fp";

export function getFingerprint(): string {
  if (typeof window === "undefined") return "ssr";
  let fp = localStorage.getItem(KEY);
  if (!fp) {
    fp = crypto.randomUUID();
    localStorage.setItem(KEY, fp);
  }
  return fp;
}

/**
 * Returns a Supabase client that attaches the device fingerprint as the
 * `x-fingerprint` header. RLS policies on `favorites` require this header
 * to match the row's fingerprint for insert/delete.
 */
export function favoritesClient() {
  const fp = getFingerprint();
  const url = import.meta.env.VITE_SUPABASE_URL as string;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-fingerprint": fp } },
  });
}
