/**
 * Global leaderboard client.
 *
 * Reads and writes go through `/api/leaderboard`, which is backed by
 * Supabase server-side. When the backend isn't configured (or fails),
 * we transparently fall back to localStorage so the UI keeps working.
 *
 * Subscriptions are powered by `useSyncExternalStore` (see page.tsx).
 * Same-tab updates are signalled by a custom `stk-leaderboard-changed`
 * event we dispatch from `saveScore`. Cross-tab updates over the network
 * are picked up via periodic polling every 8 seconds while the
 * leaderboard view is mounted.
 */

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

const STORAGE_KEY = "stk-leaderboard-v1";
const CHANGE_EVENT = "stk-leaderboard-changed";
const POLL_INTERVAL_MS = 8_000;
const EMPTY: LeaderboardEntry[] = [];

let snapshotCache: LeaderboardEntry[] = EMPTY;
let snapshotKey = ""; // cheap equality signal
let fetchInFlight: Promise<LeaderboardEntry[]> | null = null;

// ── Mutations ──────────────────────────────────────────────────────────────

/** Submit a finished-game score to the global leaderboard.
 *
 * Always optimistically appends to localStorage so the UI updates
 * instantly. If the server accepts the write, we also refresh the cache
 * from the authoritative remote ordering.
 */
export async function saveScore(entry: LeaderboardEntry): Promise<void> {
  if (typeof window === "undefined") return;

  // 1) optimistic local write
  appendLocal(entry);
  window.dispatchEvent(new Event(CHANGE_EVENT));

  // 2) authoritative remote write
  try {
    const res = await fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prenom: entry.prenom,
        score: entry.score,
        temps: entry.temps,
        erreurs: entry.erreurs,
      }),
      keepalive: true,
    });
    if (!res.ok) return;
    // 3) refresh authoritative snapshot
    await refreshFromServer();
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Offline / no backend — local copy already saved
  }
}

/** Wipe local storage. Server data is untouched. */
export function clearScores(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    snapshotCache = EMPTY;
    snapshotKey = "";
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // ignore
  }
}

// ── Reads ──────────────────────────────────────────────────────────────────

function appendLocal(entry: LeaderboardEntry) {
  try {
    const list = loadLocal();
    const exists = list.some(
      (e) =>
        e.prenom === entry.prenom &&
        e.score === entry.score &&
        e.temps === entry.temps &&
        e.erreurs === entry.erreurs,
    );
    if (exists) return;
    const next = [...list, entry];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // quota/parse errors — score loss preferable to a crash
  }
}

function loadLocal(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidEntry);
  } catch {
    return [];
  }
}

/** Best score first; tiebreakers — fastest time, then fewest errors. */
export function sortScores(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return entries.slice().sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.temps !== b.temps) return a.temps - b.temps;
    return a.erreurs - b.erreurs;
  });
}

async function refreshFromServer(): Promise<LeaderboardEntry[]> {
  if (fetchInFlight) return fetchInFlight;
  fetchInFlight = (async () => {
    try {
      const res = await fetch("/api/leaderboard", { cache: "no-store" });
      if (!res.ok) throw new Error("leaderboard fetch failed");
      const json = (await res.json()) as { entries?: LeaderboardEntry[] };
      const remote = Array.isArray(json.entries) ? json.entries.filter(isValidEntry) : [];
      // Merge server with any local-only entries the server doesn't know about
      // (e.g. submissions made while the backend was offline).
      const local = loadLocal();
      const merged = mergeUnique(remote, local);
      const sorted = sortScores(merged);
      const key = serialize(sorted);
      if (key !== snapshotKey) {
        snapshotCache = sorted;
        snapshotKey = key;
      }
      return sorted;
    } catch {
      const local = sortScores(loadLocal());
      const key = serialize(local);
      if (key !== snapshotKey) {
        snapshotCache = local;
        snapshotKey = key;
      }
      return local;
    } finally {
      fetchInFlight = null;
    }
  })();
  return fetchInFlight;
}

function mergeUnique(
  primary: LeaderboardEntry[],
  secondary: LeaderboardEntry[],
): LeaderboardEntry[] {
  const seen = new Set<string>();
  const key = (e: LeaderboardEntry) =>
    `${e.prenom}|${e.score}|${e.temps}|${e.erreurs}`;
  const result: LeaderboardEntry[] = [];
  for (const e of primary) {
    if (seen.has(key(e))) continue;
    seen.add(key(e));
    result.push(e);
  }
  for (const e of secondary) {
    if (seen.has(key(e))) continue;
    seen.add(key(e));
    result.push(e);
  }
  return result;
}

function serialize(entries: LeaderboardEntry[]): string {
  return entries
    .map((e) => `${e.prenom}|${e.score}|${e.temps}|${e.erreurs}|${e.date}`)
    .join("§");
}

// ── External-store hooks (for useSyncExternalStore) ────────────────────────

export function getScoresSnapshot(): LeaderboardEntry[] {
  return snapshotCache;
}

/** Stable empty array for SSR. */
export function getServerScoresSnapshot(): LeaderboardEntry[] {
  return EMPTY;
}

/** Subscribe to same-tab events + remote polling while the view is open. */
export function subscribeToScores(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  // Initial fetch — guarantees the first render shows real data once it lands
  void refreshFromServer().then(() => onChange());

  const interval = window.setInterval(() => {
    void refreshFromServer().then(() => onChange());
  }, POLL_INTERVAL_MS);

  const localHandler = () => {
    // Local copy changed — re-derive the snapshot synchronously
    const local = sortScores(loadLocal());
    const merged = mergeUnique(snapshotCache, local);
    const sorted = sortScores(merged);
    const key = serialize(sorted);
    if (key !== snapshotKey) {
      snapshotCache = sorted;
      snapshotKey = key;
      onChange();
    }
  };
  window.addEventListener(CHANGE_EVENT, localHandler);

  // Cross-tab local storage sync
  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) localHandler();
  };
  window.addEventListener("storage", storageHandler);

  return () => {
    window.clearInterval(interval);
    window.removeEventListener(CHANGE_EVENT, localHandler);
    window.removeEventListener("storage", storageHandler);
  };
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
