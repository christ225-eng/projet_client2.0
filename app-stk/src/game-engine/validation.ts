import type { Card } from "./types";

/**
 * A selection is valid when one Vivant and one Application card belong to
 * the same pair. Returns the pair id when correct, null otherwise.
 */
export function validateSelection(a: Card, b: Card): number | null {
  if (a.kind === b.kind) return null;
  if (a.pairId !== b.pairId) return null;
  return a.pairId;
}
