import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client. Uses the SERVICE_ROLE_KEY which never leaks
 * to the browser — only API route handlers import this module.
 *
 * When the env vars are absent the helpers below return null so the rest
 * of the stack can fall back to localStorage and the UI keeps working in
 * isolation (e.g. local dev without a Supabase project yet).
 *
 * Required env vars (set in Vercel project settings):
 *   SUPABASE_URL                  — https://<project>.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY     — server-only, never expose to client
 *
 * Expected table (SQL to run in Supabase SQL Editor):
 *
 *   create table public.leaderboard (
 *     id uuid primary key default gen_random_uuid(),
 *     prenom text not null,
 *     score integer not null,
 *     temps integer not null,
 *     erreurs integer not null,
 *     created_at timestamptz not null default now()
 *   );
 *   create index leaderboard_score_idx
 *     on public.leaderboard (score desc, temps asc, erreurs asc);
 *   alter table public.leaderboard enable row level security;
 *   -- (no public policies — service-role bypasses RLS for our API routes)
 */

let cached: SupabaseClient | null | undefined = undefined;

export function getServerSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    cached = null;
    return null;
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "public" },
  });
  return cached;
}

export const LEADERBOARD_TABLE = "leaderboard";
