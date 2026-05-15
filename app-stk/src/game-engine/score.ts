import { TOTAL_PAIRS } from "./types";

/**
 * Final score formula — applied ONCE at the end of level 5.
 * Source: REGLE DES SCORES.docx (Flora Konan, Mai 2026)
 *
 *   score = (paires × 500) − (erreurs × 150) − (temps_secondes × 2)
 *   final = max(0, score)
 *
 * Never run during gameplay — the player must not see a numeric score
 * before completing the 5th level.
 */
export function calculateFinalScore(params: {
  pairs: number;
  errors: number;
  seconds: number;
}): number {
  const raw = params.pairs * 500 - params.errors * 150 - params.seconds * 2;
  return Math.max(0, raw);
}

/** Convenience: score given that all 22 pairs have been found. */
export function calculateEndOfGameScore(params: {
  errors: number;
  seconds: number;
}): number {
  return calculateFinalScore({ pairs: TOTAL_PAIRS, ...params });
}

/** Format seconds as mm:ss for the leaderboard. */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
