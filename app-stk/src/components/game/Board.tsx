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
  /** Cards subtly highlighted to suggest a pair — soft pulse, never intrusive */
  hintIds?: string[];
  onCardClick: (card: Card) => void;
}

/**
 * Gallery-wall board.
 *
 * Two independent grids — Vivant on top, Application below — so the
 * conceptual separation between the two rows survives every viewport.
 *
 * Layout strategy:
 *   • mobile (< 640px): strict 2 cols ALWAYS, including 5-pair levels.
 *     For odd-count rows we DO NOT center a solo card — instead we let the
 *     5th card sit naturally at the start of a new row (still col-1) and
 *     pair it with a hidden phantom so the grid keeps perfect alignment.
 *   • tablet (≥ 640px): 3 cols on 5-pair levels, 2 cols on 4-pair.
 *   • desktop (≥ 768px): 4 cols (4-pair) or 5 cols (5-pair).
 */
export function Board({
  vivants,
  applications,
  resolvedPairIds,
  selectedIds,
  errorIds = [],
  hintIds = [],
  onCardClick,
}: BoardProps) {
  const cols = vivants.length; // 4 (levels 1-3) or 5 (levels 4-5)
  const isFive = cols === 5;

  // 2 cols on mobile (always) → 3 cols on tablet for 5-pair → 4/5 desktop
  const colsClass = isFive
    ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
    : "grid-cols-2 md:grid-cols-4";

  const renderCards = (cards: Card[]) => (
    <>
      {cards.map((c) => (
        <div key={c.id} className="w-full">
          <GameCard
            card={c}
            selected={selectedIds.includes(c.id)}
            resolved={resolvedPairIds.includes(c.pairId)}
            error={errorIds.includes(c.id)}
            hint={hintIds.includes(c.id)}
            onClick={() => onCardClick(c)}
          />
        </div>
      ))}
      {/* Phantom slot keeps mobile 2-col grid perfectly aligned when the row
          count is odd (5-pair levels). Hidden from breakpoints that aren't
          two-up. */}
      {isFive ? (
        <div
          aria-hidden
          className="invisible w-full sm:hidden"
        >
          {/* Match a real card's vertical footprint so the row heights align */}
          <div className="aspect-[4/3] w-full" />
        </div>
      ) : null}
    </>
  );

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl",
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
