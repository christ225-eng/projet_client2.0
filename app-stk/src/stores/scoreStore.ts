import { create } from "zustand";

/**
 * Global score-tracking store.
 *
 * Contract (Flora Konan, REGLE DES SCORES.docx):
 *  • Timer starts when the player clicks "Jouer" / "Commencez le Jeu"
 *  • Timer never resets between levels
 *  • Timer stops when the LAST pair of level 5 is validated
 *  • Errors accumulate across all 5 levels, never reset
 *  • The numeric score is computed ONCE at the end of level 5
 *  • The score must NOT be displayed during gameplay
 *
 * The store holds raw state (startedAt + endedAt + errorCount + foundPairs).
 * Derived values (elapsed seconds, final score) are computed by selectors
 * or helpers — never stored — so we never desync.
 */
interface ScoreState {
  /** ms timestamp when "Jouer" was clicked; null while idle */
  startedAt: number | null;
  /** ms timestamp when the last pair of level 5 was validated */
  endedAt: number | null;
  /** Cumulative error count across all levels */
  errors: number;
  /** Cumulative count of successfully associated pairs (0..22) */
  pairsFound: number;

  // ── actions ──────────────────────────────────────────────────────────────
  startTimer: () => void;
  endTimer: () => void;
  incrementErrors: () => void;
  registerPairFound: () => void;
  reset: () => void;
}

export const useScoreStore = create<ScoreState>((set, get) => ({
  startedAt: null,
  endedAt: null,
  errors: 0,
  pairsFound: 0,

  startTimer: () => {
    if (get().startedAt !== null) return; // idempotent
    set({ startedAt: Date.now(), endedAt: null });
  },

  endTimer: () => {
    if (get().endedAt !== null) return; // idempotent — last pair guard
    set({ endedAt: Date.now() });
  },

  incrementErrors: () => set((s) => ({ errors: s.errors + 1 })),

  registerPairFound: () => set((s) => ({ pairsFound: s.pairsFound + 1 })),

  reset: () =>
    set({ startedAt: null, endedAt: null, errors: 0, pairsFound: 0 }),
}));

/** Elapsed seconds between start and end (or now, if still running). */
export function getElapsedSeconds(state: ScoreState, now: number = Date.now()): number {
  if (state.startedAt === null) return 0;
  const end = state.endedAt ?? now;
  return Math.floor((end - state.startedAt) / 1000);
}
