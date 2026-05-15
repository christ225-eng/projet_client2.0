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
 * Gallery-wall board. Two rows — Vivant above, Application below — with
 * generous breathing room between cards so each exhibit can be read on
 * its own. Width is capped so the wall never sprawls on ultra-wide
 * displays.
 */
export function Board({
  vivants,
  applications,
  resolvedPairIds,
  selectedIds,
  onCardClick,
}: BoardProps) {
  const cols = vivants.length; // 4 (levels 1-3) or 5 (levels 4-5)

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl",
        "grid gap-5 md:gap-7",
        cols === 4 ? "grid-cols-4" : "grid-cols-5",
      )}
    >
      {vivants.map((c) => (
        <GameCard
          key={c.id}
          card={c}
          selected={selectedIds.includes(c.id)}
          resolved={resolvedPairIds.includes(c.pairId)}
          onClick={() => onCardClick(c)}
        />
      ))}
      {applications.map((c) => (
        <GameCard
          key={c.id}
          card={c}
          selected={selectedIds.includes(c.id)}
          resolved={resolvedPairIds.includes(c.pairId)}
          onClick={() => onCardClick(c)}
        />
      ))}
    </div>
  );
}
