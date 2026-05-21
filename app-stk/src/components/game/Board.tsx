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
 * Layout strategy:
 *   • Levels 1–3 (4 pairs) and tablet/desktop for ALL levels:
 *     two stacked grids — vivants on top, applications below.
 *
 *   • Levels 4–5 (5 pairs) on MOBILE ONLY:
 *     a single 2-column grid with vivants in col 1 and applications in col 2,
 *     five rows tall. This guarantees:
 *       - exactly 2 columns
 *       - 5 cards left + 5 cards right
 *       - perfect symmetry (no phantom slot, no centered solo card)
 *       - same card sizes as the other levels
 *
 * On tablet/desktop the larger viewport keeps the conceptual top/bottom
 * separation (vivants vs applications) so the gameplay reads the same as
 * on 4-pair levels.
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
  const cols = vivants.length; // 4 (levels 1–3) or 5 (levels 4–5)
  const isFive = cols === 5;

  const cardProps = (c: Card) => ({
    card: c,
    selected: selectedIds.includes(c.id),
    resolved: resolvedPairIds.includes(c.pairId),
    error: errorIds.includes(c.id),
    hint: hintIds.includes(c.id),
    onClick: () => onCardClick(c),
  });

  const renderRow = (cards: Card[]) =>
    cards.map((c) => (
      <div key={c.id} className="w-full">
        <GameCard {...cardProps(c)} />
      </div>
    ));

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* MOBILE LAYOUT for 5-pair levels — single 5×2 grid */}
      {isFive ? (
        <div
          className="grid gap-2.5 grid-cols-2 sm:hidden"
          style={{ gridTemplateRows: "repeat(5, minmax(0, 1fr))" }}
        >
          {/* Interleave so col 1 = vivants[i], col 2 = applications[i] for each row */}
          {vivants.map((v, i) => {
            const a = applications[i];
            return (
              <div key={`row-${i}`} className="contents">
                <div className="w-full">
                  <GameCard {...cardProps(v)} />
                </div>
                {a ? (
                  <div className="w-full">
                    <GameCard {...cardProps(a)} />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* TABLET + DESKTOP (and mobile for 4-pair levels) — two stacked grids */}
      <div
        className={cn(
          isFive
            ? "hidden sm:block sm:space-y-5 md:space-y-7"
            : "space-y-3 sm:space-y-5 md:space-y-7",
        )}
      >
        <div
          className={cn(
            "grid",
            isFive
              ? "gap-5 md:gap-7 sm:grid-cols-3 md:grid-cols-5"
              : "gap-3 sm:gap-5 md:gap-7 grid-cols-2 md:grid-cols-4",
          )}
        >
          {renderRow(vivants)}
        </div>
        <div
          className={cn(
            "grid",
            isFive
              ? "gap-5 md:gap-7 sm:grid-cols-3 md:grid-cols-5"
              : "gap-3 sm:gap-5 md:gap-7 grid-cols-2 md:grid-cols-4",
          )}
        >
          {renderRow(applications)}
        </div>
      </div>
    </div>
  );
}
