import type { LevelConfig } from "@/game-engine/types";

/**
 * Level configuration — source: Flora Konan, REGLE DES SCORES.docx
 *   44 cartes total · 22 paires · 5 niveaux · difficulté progressive
 */
export const LEVELS: readonly LevelConfig[] = [
  { level: 1, pairsCount: 4, cardsCount: 8, difficulty: "Très faciles" },
  { level: 2, pairsCount: 4, cardsCount: 8, difficulty: "Faciles" },
  { level: 3, pairsCount: 4, cardsCount: 8, difficulty: "Intermédiaires" },
  { level: 4, pairsCount: 5, cardsCount: 10, difficulty: "Difficiles" },
  { level: 5, pairsCount: 5, cardsCount: 10, difficulty: "Très difficiles" },
] as const;

export function getLevelConfig(level: number): LevelConfig | undefined {
  return LEVELS.find((l) => l.level === level);
}
