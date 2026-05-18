"use client";

import { GameCard } from "./Card";
import type { Card } from "@/game-engine/types";
import { cn } from "@/lib/cn";

interface BoardProps {
  vivants: Card[];
  applications: Card[];
  resolvedPairIds: number[];
  selectedIds: string[];
  /** Cards currently flagged as wrong by the validation modal — driven shake + red ring */
  errorIds?: string[];
  onCardClick: (card: Card) => void;
}

/**
 * Gallery-wall board.
 *
 * Two independent grids — Vivant on top, Application below — so the
 * conceptual separation between the two rows survives every viewport:
 *
 *   • mobile (< 640px) : strict 2 cols. A 5-card row (levels 4–5) centers
 *     the trailing odd card across both columns to avoid the visual hole.
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
  errorIds = [],
  onCardClick,
}: BoardProps) {
  const cols = vivants.length; // 4 (levels 1-3) or 5 (levels 4-5)
  const isFive = cols === 5;

  const colsClass = isFive
    ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
    : "grid-cols-2 md:grid-cols-4";

  const renderCards = (cards: Card[]) =>
    cards.map((c, i) => {
      const isTrailingOnMobile = isFive && i === 4;
      return (
        <div
          key={c.id}
          className={cn(
            "w-full",
            // On mobile only, span the last odd card across both columns at
            // half-width and center it — keeps a clean 2-col rhythm without
            // a glaring left-aligned hole on level 4/5.
            isTrailingOnMobile &&
              "col-span-2 mx-auto w-[calc(50%-0.5rem)] sm:col-span-1 sm:w-full sm:mx-0",
          )}
        >
          <GameCard
            card={c}
            selected={selectedIds.includes(c.id)}
            resolved={resolvedPairIds.includes(c.pairId)}
            error={errorIds.includes(c.id)}
            onClick={() => onCardClick(c)}
          />
        </div>
      );
    });

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl",
        // Tighter inter-row rhythm on mobile so 5-pair levels don't push the
        // board past the safe viewport height.
        isFive
          ? "space-y-2.5 sm:space-y-5 md:space-y-7"
          : "space-y-3 sm:space-y-5 md:space-y-7",
      )}
    >
      <div
        className={cn(
          "grid",
          isFive ? "gap-2.5 sm:gap-5 md:gap-7" : "gap-3 sm:gap-5 md:gap-7",
          colsClass,
        )}
      >
        {renderCards(vivants)}
      </div>
      <div
        className={cn(
          "grid",
          isFive ? "gap-2.5 sm:gap-5 md:gap-7" : "gap-3 sm:gap-5 md:gap-7",
          colsClass,
        )}
      >
        {renderCards(applications)}
      </div>
    </div>
  );
}
