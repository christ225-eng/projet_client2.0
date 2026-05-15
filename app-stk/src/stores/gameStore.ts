import { create } from "zustand";
import type { Card } from "@/game-engine/types";

/**
 * Current-level gameplay state. Decoupled from the score store so the
 * gameplay can evolve (final board layout, modal logic, popup) without
 * touching the score contract.
 *
 * `selected` holds up to two cards. When two are selected, the engine
 * runs validation; the outcome determines whether the ValidationModal
 * or the PedagogicPopup opens.
 */
export type ValidationOutcome =
  | { kind: "idle" }
  | { kind: "pending"; a: Card; b: Card }
  | { kind: "success"; pairId: number }
  | { kind: "error"; a: Card; b: Card };

interface GameState {
  currentLevel: 1 | 2 | 3 | 4 | 5;
  /** Pair ids already associated in the current level */
  resolvedPairs: number[];
  selected: Card[];
  outcome: ValidationOutcome;
  /** Levels the player has completed in the current session (for the hub) */
  completedLevels: number[];

  // ── actions ──────────────────────────────────────────────────────────────
  setLevel: (level: 1 | 2 | 3 | 4 | 5) => void;
  selectCard: (card: Card) => void;
  clearSelection: () => void;
  setOutcome: (outcome: ValidationOutcome) => void;
  markPairResolved: (pairId: number) => void;
  completeLevel: (level: number) => void;
  resetLevel: () => void;
  reset: () => void;
}

const initial = {
  currentLevel: 1 as const,
  resolvedPairs: [] as number[],
  selected: [] as Card[],
  outcome: { kind: "idle" } as ValidationOutcome,
  completedLevels: [] as number[],
};

export const useGameStore = create<GameState>((set) => ({
  ...initial,

  setLevel: (level) =>
    set({ currentLevel: level, resolvedPairs: [], selected: [], outcome: { kind: "idle" } }),

  selectCard: (card) =>
    set((s) => {
      // Toggle: clicking an already-selected card deselects it
      if (s.selected.some((c) => c.id === card.id)) {
        return { selected: s.selected.filter((c) => c.id !== card.id) };
      }
      // Max two cards selected at a time
      if (s.selected.length >= 2) return s;
      return { selected: [...s.selected, card] };
    }),

  clearSelection: () => set({ selected: [], outcome: { kind: "idle" } }),

  setOutcome: (outcome) => set({ outcome }),

  markPairResolved: (pairId) =>
    set((s) => ({
      resolvedPairs: s.resolvedPairs.includes(pairId)
        ? s.resolvedPairs
        : [...s.resolvedPairs, pairId],
      selected: [],
      outcome: { kind: "idle" },
    })),

  completeLevel: (level) =>
    set((s) => ({
      completedLevels: s.completedLevels.includes(level)
        ? s.completedLevels
        : [...s.completedLevels, level],
    })),

  resetLevel: () =>
    set({ resolvedPairs: [], selected: [], outcome: { kind: "idle" } }),

  reset: () => set(initial),
}));
