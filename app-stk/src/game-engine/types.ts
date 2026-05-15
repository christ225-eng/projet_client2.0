/**
 * Game-engine types — pure data, no React dependency.
 * The engine knows nothing about the UI layer.
 */

export type CardKind = "vivant" | "application";

/** A single card belonging to a biomimetic pair. */
export interface Card {
  /** Stable id, used for selection state and React keys */
  id: string;
  /** Pair this card belongs to (1..22) */
  pairId: number;
  /** Vivant side or Application side */
  kind: CardKind;
  /** Display label shown on the card */
  label: string;
  /** Path relative to /public — null until the image asset is mapped */
  imageSrc: string | null;
}

/**
 * A biomimetic pair — the editorial unit of the game.
 * The pedagogical text appears in the popup after a successful association.
 */
export interface Pair {
  id: number;
  level: 1 | 2 | 3 | 4 | 5;
  vivant: Omit<Card, "pairId" | "kind">;
  application: Omit<Card, "pairId" | "kind">;
  /** Pedagogical explanation shown on success (see PDF Règles du jeu) */
  explanation: string;
}

export interface LevelConfig {
  level: 1 | 2 | 3 | 4 | 5;
  pairsCount: 4 | 5;
  cardsCount: 8 | 10;
  /** Difficulty label from the game-rules PDF */
  difficulty: "Très faciles" | "Faciles" | "Intermédiaires" | "Difficiles" | "Très difficiles";
}

export const TOTAL_PAIRS = 22 as const;
export const TOTAL_LEVELS = 5 as const;
