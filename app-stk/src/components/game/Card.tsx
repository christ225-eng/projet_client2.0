"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/cn";
import type { Card as CardType } from "@/game-engine/types";

interface CardProps {
  card: CardType;
  selected?: boolean;
  resolved?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

/**
 * Single play-card.
 *
 *   • aspect-[4/3] keeps source photos' landscape composition.
 *   • A permanent translucent caption pill sits at the bottom — the label
 *     is a separate UI element (never part of the image), with backdrop
 *     blur for legibility over any photo.
 *   • Hover lifts the card and gently zooms the image (1200ms) — slow,
 *     contemplative, not arcade.
 *   • Resolved cards fade + desaturate so the eye moves to the remaining
 *     pairs.
 */
export function GameCard({
  card,
  selected,
  resolved,
  disabled,
  onClick,
}: CardProps) {
  const interactive = !disabled && !resolved;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled || resolved}
      whileHover={interactive ? { y: -4 } : undefined}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      aria-label={card.label}
      aria-pressed={selected}
      className={cn(
        "group relative aspect-[4/3] w-full overflow-hidden rounded-2xl text-left",
        "bg-bone/40 transition-[box-shadow,outline-color] duration-[var(--duration-base)] ease-[var(--ease-organic)]",
        "shadow-[0_2px_4px_rgba(42,39,36,0.04),0_12px_32px_rgba(42,39,36,0.06)]",
        "outline outline-1 -outline-offset-1 outline-mineral/30",
        interactive &&
          "hover:shadow-[0_4px_10px_rgba(42,39,36,0.06),0_22px_56px_rgba(42,39,36,0.12)] hover:outline-clay/40",
        selected &&
          "outline-2 outline-sand/80 shadow-[0_4px_12px_rgba(174,162,135,0.28),0_22px_56px_rgba(42,39,36,0.14)]",
        resolved && "opacity-30 grayscale pointer-events-none",
        disabled && "cursor-not-allowed",
      )}
    >
      {card.imageSrc ? (
        <Image
          src={card.imageSrc}
          alt=""
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
          quality={92}
          className={cn(
            "object-cover object-center",
            "transition-transform duration-[1200ms] ease-[var(--ease-organic)]",
            interactive && "group-hover:scale-[1.035]",
          )}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-[10px] uppercase tracking-[0.3em] text-ash/40">
          {card.kind === "vivant" ? "Vivant" : "Application"}
        </div>
      )}

      {/* Permanent caption pill — separate UI element, never burned into the image */}
      <div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-center">
        <span
          className={cn(
            "inline-block max-w-full truncate rounded-lg px-3 py-1.5",
            "bg-bone/85 backdrop-blur-md",
            "text-[13px] md:text-sm font-medium tracking-tight text-graphite",
            "shadow-[0_1px_2px_rgba(42,39,36,0.06),0_4px_12px_rgba(42,39,36,0.08)]",
            "outline outline-1 -outline-offset-1 outline-mineral/25",
          )}
        >
          {card.label}
        </span>
      </div>
    </motion.button>
  );
}
