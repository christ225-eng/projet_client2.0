/**
 * Global leaderboard client — Supabase-backed.
 *
 * Schema (column names must match exactly the SQL run in Supabase):
 *   - pseudo       text
 *   - score        integer
 *   - temps        integer
 *   - erreurs      integer
 *   - created_at   timestamptz
 *
 * Diagnostic logs are prefixed with `[stk-leaderboard]` so the user can
 * tail the browser devtools and confirm the round-trips are landing as
 * expected. Logs only describe what the page itself can already see —
 * the anon key is never printed.
 */

import { getBrowserSupabase, LEADERBOARD_TABLE } from "./supabaseClient";

export interface LeaderboardEntry {
  pseudo: string;
  score: number;
  /** Total elapsed seconds across the 5 levels */
  temps: number;
  /** Cumulative wrong-pair count */
  erreurs: number;
  /** dd/mm/yyyy formatted in French locale */
  date: string;
}

interface DbRow {
  pseudo: string;
  score: number;
  temps: number;
  erreurs: number;
  created_at: string;
}

const HYDRATION_CACHE_KEY = "stk-leaderboard-cache-v3";
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

// ── Helpers ────────────────────────────────────────────────────────────────

function rowToEntry(row: DbRow): LeaderboardEntry {
  return {
    pseudo: row.pseudo,
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
    .map((e) => `${e.pseudo}|${e.score}|${e.temps}|${e.erreurs}|${e.date}`)
    .join("§");
}

function setSnapshot(entries: LeaderboardEntry[]): boolean {
  const key = serialize(entries);
  if (key === snapshotKey) return false;
  snapshotCache = entries;
  snapshotKey = key;
  return true;
}

// ── Hydration cache (paint hint only) ──────────────────────────────────────

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
    const key = `${entry.pseudo}|${entry.score}|${entry.temps}|${entry.erreurs}`;
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
  if (typeof entry.pseudo !== "string") return false;
  const pseudo = entry.pseudo.trim();
  if (pseudo.length === 0 || pseudo.length > MAX_PSEUDO_LEN) return false;
  if (!Number.isFinite(entry.score) || entry.score < 0 || entry.score > MAX_SCORE) return false;
  if (!Number.isFinite(entry.temps) || entry.temps < MIN_TIME || entry.temps > MAX_TIME) return false;
  if (!Number.isFinite(entry.erreurs) || entry.erreurs < 0 || entry.erreurs > MAX_ERRORS) return false;
  return true;
}

// ── Mutations ──────────────────────────────────────────────────────────────

/** Submit a finished-game score to the global leaderboard. */
export async function saveScore(entry: LeaderboardEntry): Promise<void> {
  if (typeof window === "undefined") return;

  if (!isPlausible(entry)) {
    // eslint-disable-next-line no-console
    console.warn("[stk-leaderboard] score rejected by client validation:", entry);
    return;
  }
  if (isRecentDuplicate(entry)) {
    // eslint-disable-next-line no-console
    console.warn("[stk-leaderboard] duplicate score skipped (same tuple within 5 min):", entry);
    return;
  }

  const supabase = getBrowserSupabase();
  if (!supabase) {
    // eslint-disable-next-line no-console
    console.warn("[stk-leaderboard] no Supabase client — score NOT saved.");
    return;
  }

  const payload = {
    pseudo: entry.pseudo.trim().slice(0, MAX_PSEUDO_LEN),
    score: Math.floor(entry.score),
    temps: Math.floor(entry.temps),
    erreurs: Math.floor(entry.erreurs),
  };

  // eslint-disable-next-line no-console
  console.log("[stk-leaderboard] inserting score →", payload);

  try {
    const { data, error, status } = await supabase
      .from(LEADERBOARD_TABLE)
      .insert([payload])
      .select();
    // eslint-disable-next-line no-console
    console.log("[stk-leaderboard] insert response:", { status, data, error });
    if (error) {
      // eslint-disable-next-line no-console
      console.error("[stk-leaderboard] insert failed:", error.message, error);
      return;
    }
    await refreshFromServer();
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[stk-leaderboard] insert threw:", e);
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
      const { data, error, status } = await supabase
        .from(LEADERBOARD_TABLE)
        .select("pseudo, score, temps, erreurs, created_at")
        .order("score", { ascending: false })
        .order("temps", { ascending: true })
        .order("erreurs", { ascending: true })
        .limit(100);
      // eslint-disable-next-line no-console
      console.log(
        "[stk-leaderboard] fetched leaderboard:",
        { status, count: data?.length ?? 0, hasError: Boolean(error) },
      );
      if (error) {
        // eslint-disable-next-line no-console
        console.error("[stk-leaderboard] read failed:", error.message, error);
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
    .select("pseudo, score, temps, erreurs, created_at")
    .eq("pseudo", trimmed)
    .order("score", { ascending: false })
    .order("temps", { ascending: true })
    .order("erreurs", { ascending: true })
    .limit(1);
  if (bestErr) {
    // eslint-disable-next-line no-console
    console.error("[stk-leaderboard] best-row lookup failed:", bestErr.message);
    return null;
  }
  if (!bestRows || bestRows.length === 0) return null;
  const best = rowToEntry(bestRows[0] as DbRow);

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

  void refreshFromServer().then(() => onChange());

  const localHandler = () => {
    void refreshFromServer().then(() => onChange());
  };
  window.addEventListener(CHANGE_EVENT, localHandler);

  const supabase = getBrowserSupabase();
  let unsubscribeRealtime: (() => void) | null = null;
  if (supabase) {
    const channel = supabase
      .channel("leaderboard-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: LEADERBOARD_TABLE },
        () => {
          // eslint-disable-next-line no-console
          console.log("[stk-leaderboard] realtime INSERT received → refreshing");
          void refreshFromServer().then(() => onChange());
        },
      )
      .subscribe((status) => {
        // eslint-disable-next-line no-console
        console.log("[stk-leaderboard] realtime channel status:", status);
      });
    unsubscribeRealtime = () => {
      void supabase.removeChannel(channel);
    };
  }

  return () => {
    window.removeEventListener(CHANGE_EVENT, localHandler);
    if (unsubscribeRealtime) unsubscribeRealtime();
  };
}

/** Wipes the local hydration cache only. */
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
    typeof r.pseudo === "string" &&
    typeof r.score === "number" &&
    typeof r.temps === "number" &&
    typeof r.erreurs === "number" &&
    typeof r.date === "string"
  );
}
