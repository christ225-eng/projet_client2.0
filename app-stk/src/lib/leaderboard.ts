/**
 * Global leaderboard client — Supabase-backed.
 *
 * Reads and writes go straight to the `public.leaderboard` Supabase table
 * via the browser client (anon key). Real-time updates ride the
 * `postgres_changes` channel so every player sees new entries appear live.
 *
 * No localStorage as the primary source any more — we only use it as a
 * short-lived hydration hint so the first paint after a refresh shows
 * something familiar while the network round-trip lands. The authoritative
 * snapshot is always the server.
 *
 * If the env vars are absent (e.g. local dev without Supabase), reads
 * return an empty list and writes are no-ops — the UI still mounts.
 */

import { getBrowserSupabase, LEADERBOARD_TABLE } from "./supabaseClient";

export interface LeaderboardEntry {
  prenom: string;
  score: number;
  /** Total elapsed seconds across the 5 levels */
  temps: number;
  /** Cumulative wrong-pair count */
  erreurs: number;
  /** dd/mm/yyyy formatted in French locale */
  date: string;
}

interface DbRow {
  prenom: string;
  score: number;
  temps: number;
  erreurs: number;
  created_at: string;
}

const HYDRATION_CACHE_KEY = "stk-leaderboard-cache-v2";
const CHANGE_EVENT = "stk-leaderboard-changed";
const MAX_PSEUDO_LEN = 24;
const MAX_SCORE = 22 * 500; // 11_000
const MIN_TIME = 30;
const MAX_TIME = 4 * 3600;
const MAX_ERRORS = 1000;
const RECENT_DEDUP_KEY = "stk-leaderboard-recent";
const RECENT_DEDUP_TTL_MS = 5 * 60 * 1000;
const EMPTY: LeaderboardEntry[] = [];

let snapshotCache: LeaderboardEntry[] = EMPTY;
let snapshotKey = "";
let didHydrate = false;

// ── Snapshot helpers ───────────────────────────────────────────────────────

function rowToEntry(row: DbRow): LeaderboardEntry {
  return {
    prenom: row.prenom,
    score: row.score,
    temps: row.temps,
    erreurs: row.erreurs,
    date: new Date(row.created_at).toLocaleDateString("fr-FR"),
  };
}

/** Best score first; tiebreakers — fastest time, then fewest errors. */
export function sortScores(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return entries.slice().sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.temps !== b.temps) return a.temps - b.temps;
    return a.erreurs - b.erreurs;
  });
}

function serialize(entries: LeaderboardEntry[]): string {
  return entries
    .map((e) => `${e.prenom}|${e.score}|${e.temps}|${e.erreurs}|${e.date}`)
    .join("§");
}

function setSnapshot(entries: LeaderboardEntry[]): boolean {
  const key = serialize(entries);
  if (key === snapshotKey) return false;
  snapshotCache = entries;
  snapshotKey = key;
  return true;
}

// ── Hydration cache (paint-quick only) ─────────────────────────────────────

function hydrateFromLocal(): void {
  if (didHydrate || typeof window === "undefined") return;
  didHydrate = true;
  try {
    const raw = window.localStorage.getItem(HYDRATION_CACHE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return;
    const valid = parsed.filter(isValidEntry);
    setSnapshot(sortScores(valid));
  } catch {
    // ignore — purely a paint optimisation
  }
}

function persistHydration(entries: LeaderboardEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    // Cap the cache so a viral leaderboard doesn't bloat storage
    const capped = entries.slice(0, 100);
    window.localStorage.setItem(HYDRATION_CACHE_KEY, JSON.stringify(capped));
  } catch {
    // ignore quota errors
  }
}

// ── Anti-spam dedup (same tuple within 5 min) ──────────────────────────────

function isRecentDuplicate(entry: LeaderboardEntry): boolean {
  if (typeof window === "undefined") return false;
  try {
    const now = Date.now();
    const raw = window.localStorage.getItem(RECENT_DEDUP_KEY);
    const list = raw ? (JSON.parse(raw) as Array<{ key: string; t: number }>) : [];
    const key = `${entry.prenom}|${entry.score}|${entry.temps}|${entry.erreurs}`;
    const fresh = list.filter((x) => now - x.t < RECENT_DEDUP_TTL_MS);
    if (fresh.some((x) => x.key === key)) return true;
    fresh.push({ key, t: now });
    window.localStorage.setItem(RECENT_DEDUP_KEY, JSON.stringify(fresh));
    return false;
  } catch {
    return false;
  }
}

// ── Validation ─────────────────────────────────────────────────────────────

function isPlausible(entry: LeaderboardEntry): boolean {
  if (typeof entry.prenom !== "string") return false;
  const prenom = entry.prenom.trim();
  if (prenom.length === 0 || prenom.length > MAX_PSEUDO_LEN) return false;
  if (!Number.isFinite(entry.score) || entry.score < 0 || entry.score > MAX_SCORE) return false;
  if (!Number.isFinite(entry.temps) || entry.temps < MIN_TIME || entry.temps > MAX_TIME) return false;
  if (!Number.isFinite(entry.erreurs) || entry.erreurs < 0 || entry.erreurs > MAX_ERRORS) return false;
  return true;
}

// ── Mutations ──────────────────────────────────────────────────────────────

/** Submit a finished-game score to the global leaderboard. */
export async function saveScore(entry: LeaderboardEntry): Promise<void> {
  if (typeof window === "undefined") return;
  if (!isPlausible(entry)) return;
  if (isRecentDuplicate(entry)) return;

  const supabase = getBrowserSupabase();
  if (!supabase) return; // no backend — silently no-op

  const payload = {
    prenom: entry.prenom.trim().slice(0, MAX_PSEUDO_LEN),
    score: Math.floor(entry.score),
    temps: Math.floor(entry.temps),
    erreurs: Math.floor(entry.erreurs),
  };

  try {
    const { error } = await supabase.from(LEADERBOARD_TABLE).insert([payload]);
    if (error) {
      // Surface error in console for debugging; UI remains responsive.
      // eslint-disable-next-line no-console
      console.warn("[leaderboard] insert failed:", error.message);
      return;
    }
    // Optimistically refresh — realtime will also push the change.
    await refreshFromServer();
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[leaderboard] insert threw:", e);
  }
}

// ── Reads ──────────────────────────────────────────────────────────────────

let fetchInFlight: Promise<LeaderboardEntry[]> | null = null;

async function refreshFromServer(): Promise<LeaderboardEntry[]> {
  if (fetchInFlight) return fetchInFlight;
  fetchInFlight = (async () => {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setSnapshot(EMPTY);
      return EMPTY;
    }
    try {
      const { data, error } = await supabase
        .from(LEADERBOARD_TABLE)
        .select("prenom, score, temps, erreurs, created_at")
        .order("score", { ascending: false })
        .order("temps", { ascending: true })
        .order("erreurs", { ascending: true })
        .limit(100);
      if (error) {
        // eslint-disable-next-line no-console
        console.warn("[leaderboard] read failed:", error.message);
        return snapshotCache;
      }
      const entries = (data ?? []).map((row) => rowToEntry(row as DbRow));
      const sorted = sortScores(entries);
      if (setSnapshot(sorted)) persistHydration(sorted);
      return sorted;
    } finally {
      fetchInFlight = null;
    }
  })();
  return fetchInFlight;
}

/**
 * Resolve the player's exact global rank — even when they're not in the
 * top 100. Returns null if the pseudo has no entry at all.
 *
 * Strategy: pick the player's best row (highest score), then count how
 * many rows beat it on the (score, temps, erreurs) tiebreaker tuple.
 */
export async function fetchPlayerRank(pseudo: string): Promise<{
  rank: number;
  best: LeaderboardEntry;
} | null> {
  const supabase = getBrowserSupabase();
  if (!supabase) return null;
  const trimmed = pseudo.trim();
  if (trimmed.length === 0) return null;

  const { data: bestRows, error: bestErr } = await supabase
    .from(LEADERBOARD_TABLE)
    .select("prenom, score, temps, erreurs, created_at")
    .eq("prenom", trimmed)
    .order("score", { ascending: false })
    .order("temps", { ascending: true })
    .order("erreurs", { ascending: true })
    .limit(1);
  if (bestErr || !bestRows || bestRows.length === 0) return null;
  const best = rowToEntry(bestRows[0] as DbRow);

  // Strictly better tuples: score > best.score, OR score==best.score and
  // temps < best.temps, OR same score+time but erreurs < best.erreurs.
  const { count: betterScore } = await supabase
    .from(LEADERBOARD_TABLE)
    .select("id", { count: "exact", head: true })
    .gt("score", best.score);
  const { count: sameScoreFaster } = await supabase
    .from(LEADERBOARD_TABLE)
    .select("id", { count: "exact", head: true })
    .eq("score", best.score)
    .lt("temps", best.temps);
  const { count: sameScoreTimeFewerErr } = await supabase
    .from(LEADERBOARD_TABLE)
    .select("id", { count: "exact", head: true })
    .eq("score", best.score)
    .eq("temps", best.temps)
    .lt("erreurs", best.erreurs);

  const ahead =
    (betterScore ?? 0) + (sameScoreFaster ?? 0) + (sameScoreTimeFewerErr ?? 0);
  return { rank: ahead + 1, best };
}

// ── External-store hooks (for useSyncExternalStore) ────────────────────────

export function getScoresSnapshot(): LeaderboardEntry[] {
  if (!didHydrate) hydrateFromLocal();
  return snapshotCache;
}

/** Stable empty array for SSR. */
export function getServerScoresSnapshot(): LeaderboardEntry[] {
  return EMPTY;
}

/** Subscribe to same-tab events + Supabase realtime postgres_changes. */
export function subscribeToScores(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  // Initial fetch
  void refreshFromServer().then(() => onChange());

  // Same-tab refresh nudges (e.g. after saveScore)
  const localHandler = () => {
    void refreshFromServer().then(() => onChange());
  };
  window.addEventListener(CHANGE_EVENT, localHandler);

  // Supabase realtime — every player gets new rows pushed
  const supabase = getBrowserSupabase();
  let unsubscribeRealtime: (() => void) | null = null;
  if (supabase) {
    const channel = supabase
      .channel("leaderboard-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: LEADERBOARD_TABLE },
        () => {
          void refreshFromServer().then(() => onChange());
        },
      )
      .subscribe();
    unsubscribeRealtime = () => {
      void supabase.removeChannel(channel);
    };
  }

  return () => {
    window.removeEventListener(CHANGE_EVENT, localHandler);
    if (unsubscribeRealtime) unsubscribeRealtime();
  };
}

/** Backwards-compatible export — wipes the hydration cache only. */
export function clearScores(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(HYDRATION_CACHE_KEY);
    window.localStorage.removeItem(RECENT_DEDUP_KEY);
    snapshotCache = EMPTY;
    snapshotKey = "";
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // ignore
  }
}

function isValidEntry(value: unknown): value is LeaderboardEntry {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.prenom === "string" &&
    typeof r.score === "number" &&
    typeof r.temps === "number" &&
    typeof r.erreurs === "number" &&
    typeof r.date === "string"
  );
}
