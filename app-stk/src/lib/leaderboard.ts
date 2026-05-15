/**
 * Local-first leaderboard. Scores are persisted to `localStorage` under a
 * single namespaced key — one source of truth for the whole app. The
 * Google Sheets / Apps Script integration described in
 * REGLE DES SCORES.docx is intentionally NOT wired here yet; when it
 * lands, layer it on top via a separate POST that mirrors saved entries
 * to the spreadsheet. For now we never display anything except real
 * games played in this browser.
 *
 * Subscriptions are powered by `useSyncExternalStore` (see page.tsx).
 * Cross-tab updates ride on the browser's native `storage` event;
 * same-tab updates are signalled by a custom `stk-leaderboard-changed`
 * event we dispatch from `saveScore`.
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
const EMPTY: LeaderboardEntry[] = [];

// ── Mutations ──────────────────────────────────────────────────────────────

/** Append an entry. Exact duplicates (same prenom+score+temps+erreurs) are skipped
 *  so an accidental double-call (React strict mode, re-renders) is safe. */
export function saveScore(entry: LeaderboardEntry): void {
  if (typeof window === "undefined") return;
  try {
    const list = loadScores();
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
    // Same-tab listeners only fire on this custom event; cross-tab use
    // the native `storage` event which the browser dispatches for us.
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // ignore quota / parse errors — score loss is preferable to a crash
  }
}

/** Wipe everything — exposed for dev tooling, not used in the UI. */
export function clearScores(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // ignore
  }
}

// ── Reads ──────────────────────────────────────────────────────────────────

/** Read raw entries from storage. Returns [] on parse errors or missing key. */
export function loadScores(): LeaderboardEntry[] {
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

// ── External-store hooks (for useSyncExternalStore) ────────────────────────

let snapshotCache: LeaderboardEntry[] = EMPTY;
let lastRawValue: string | null = null;

/** Compares the raw JSON to a cached copy so React only re-renders when the
 *  underlying data actually changes (referential equality on the array). */
export function getScoresSnapshot(): LeaderboardEntry[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === lastRawValue) return snapshotCache;
  lastRawValue = raw;
  snapshotCache = sortScores(loadScores());
  return snapshotCache;
}

/** Stable empty array for SSR. Returning a fresh `[]` each call would
 *  cause hydration mismatches. */
export function getServerScoresSnapshot(): LeaderboardEntry[] {
  return EMPTY;
}

/** Subscribe to both cross-tab (`storage`) and same-tab (custom) changes. */
export function subscribeToScores(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) onChange();
  };
  window.addEventListener("storage", storageHandler);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", storageHandler);
    window.removeEventListener(CHANGE_EVENT, onChange);
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
