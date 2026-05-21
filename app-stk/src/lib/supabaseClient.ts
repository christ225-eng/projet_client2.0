"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase client — talks directly to the project's REST and
 * Realtime APIs with the public anon key. RLS policies on the
 * `leaderboard` table enforce all access rules; nothing sensitive ever
 * lives here.
 *
 * Required environment variables (set in Vercel):
 *   NEXT_PUBLIC_SUPABASE_URL        — https://<projet>.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY   — anon key (safe to expose)
 *
 * Required SQL (run once in Supabase SQL editor):
 *
 *   create table if not exists public.leaderboard (
 *     id uuid primary key default gen_random_uuid(),
 *     pseudo text not null,
 *     score integer not null,
 *     temps integer not null,
 *     erreurs integer not null,
 *     created_at timestamptz not null default now(),
 *     check (char_length(pseudo) between 1 and 24),
 *     check (score >= 0 and score <= 11000),
 *     check (temps >= 30 and temps <= 14400),
 *     check (erreurs >= 0 and erreurs <= 1000)
 *   );
 *   create index if not exists leaderboard_score_idx
 *     on public.leaderboard (score desc, temps asc, erreurs asc);
 *
 *   alter table public.leaderboard enable row level security;
 *
 *   drop policy if exists "leaderboard read public" on public.leaderboard;
 *   create policy "leaderboard read public"
 *     on public.leaderboard for select using (true);
 *
 *   drop policy if exists "leaderboard insert public" on public.leaderboard;
 *   create policy "leaderboard insert public"
 *     on public.leaderboard for insert with check (true);
 *
 *   alter publication supabase_realtime add table public.leaderboard;
 *
 * If you previously ran the SQL with a `prenom` column, rename it:
 *
 *   alter table public.leaderboard rename column prenom to pseudo;
 */

let cached: SupabaseClient | null | undefined = undefined;

export function getBrowserSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  if (typeof window === "undefined") {
    cached = null;
    return null;
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    // eslint-disable-next-line no-console
    console.warn(
      "[stk-leaderboard] Supabase env vars missing — leaderboard will stay empty.",
      { hasUrl: Boolean(url), hasKey: Boolean(key) },
    );
    cached = null;
    return null;
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { params: { eventsPerSecond: 4 } },
  });
  return cached;
}

export const LEADERBOARD_TABLE = "leaderboard";
