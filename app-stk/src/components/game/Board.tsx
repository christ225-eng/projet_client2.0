"use client";

import { GameCard } from "./Card";
import type { Card } from "@/game-engine/types";
import { cn } from "@/lib/cn";

interface BoardProps {
  vivants: Card[];
  applications: Card[];
  resolvedPairIds: number[];
  selectedIds: string[];
  onCardClick: (card: Card) => void;
}

/**
 * Gallery-wall board.
 *
 * Two independent grids — Vivant on top, Application below — so the
 * conceptual separation between the two rows survives every viewport:
 *
 *   • mobile (< 640px) : 2 cols, the player scrolls if needed
 *   • tablet (≥ 640px) : 3 cols on 5-pair levels, otherwise desktop layout
 *   • desktop (≥ 768px): 4 cols (4-pair) or 5 cols (5-pair)
 *
 * Width is capped so the wall never sprawls on ultra-wide displays.
 */
export function Board({
  vivants,
  applications,
  resolvedPairIds,
  selectedIds,
  onCardClick,
}: BoardProps) {
  const cols = vivants.length; // 4 (levels 1-3) or 5 (levels 4-5)

  const colsClass =
    cols === 4
      ? "grid-cols-2 md:grid-cols-4"
      : "grid-cols-2 sm:grid-cols-3 md:grid-cols-5";

  const renderCards = (cards: Card[]) =>
    cards.map((c) => (
      <GameCard
        key={c.id}
        card={c}
        selected={selectedIds.includes(c.id)}
        resolved={resolvedPairIds.includes(c.pairId)}
        onClick={() => onCardClick(c)}
      />
    ));

  return (
    <div className="mx-auto w-full max-w-6xl space-y-3 sm:space-y-5 md:space-y-7">
      <div className={cn("grid gap-3 sm:gap-5 md:gap-7", colsClass)}>
        {renderCards(vivants)}
      </div>
      <div className={cn("grid gap-3 sm:gap-5 md:gap-7", colsClass)}>
        {renderCards(applications)}
      </div>
    </div>
  );
}
