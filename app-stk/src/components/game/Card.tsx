"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/cn";
import type { Card as CardType } from "@/game-engine/types";

interface CardProps {
  card: CardType;
  selected?: boolean;
  resolved?: boolean;
  /** When true, the card flashes red + shakes — used while the wrong-pair modal is open */
  error?: boolean;
  /** When true, the card gets a soft pulsing emerald ring — suggests this pair */
  hint?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

/**
 * Single play-card.
 */
export function GameCard({
  card,
  selected,
  resolved,
  error,
  hint,
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
      whileTap={interactive ? { scale: 0.97 } : undefined}
      animate={
        selected
          ? { scale: 1.035, y: -2 }
          : hint && !error
            ? { scale: [1, 1.015, 1] }
            : { scale: 1, y: 0 }
      }
      transition={
        hint && !selected && !error
          ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
      }
      aria-label={card.label}
      aria-pressed={selected}
      className={cn(
        "group relative aspect-[4/3] w-full overflow-hidden rounded-xl md:rounded-2xl text-left",
        "bg-bone/40 transition-[box-shadow,outline-color] duration-[var(--duration-base)] ease-[var(--ease-organic)]",
        "shadow-[0_2px_4px_rgba(42,39,36,0.04),0_12px_32px_rgba(42,39,36,0.06)]",
        "outline outline-1 -outline-offset-1 outline-mineral/30",
        interactive &&
          "hover:shadow-[0_4px_10px_rgba(42,39,36,0.06),0_22px_56px_rgba(42,39,36,0.12)] hover:outline-clay/40",
        selected && !error && "ring-selected outline-emerald/0",
        error && "ring-error-card animate-shake-soft outline-error/0",
        hint && !selected && !error && "ring-hint outline-emerald/0",
        resolved && "opacity-30 grayscale pointer-events-none",
        disabled && "cursor-not-allowed",
      )}
    >
      {card.imageSrc ? (
        <Image
          src={card.imageSrc}
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 22vw"
          quality={92}
          className={cn(
            "object-cover object-center",
            "transition-transform duration-[1200ms] ease-[var(--ease-organic)]",
            interactive && "group-hover:scale-[1.035]",
            selected && "scale-[1.05]",
          )}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-[10px] uppercase tracking-[0.3em] text-ash/40">
          {card.kind === "vivant" ? "Vivant" : "Application"}
        </div>
      )}

      {/* Permanent caption pill — separate UI element, never burned into the image */}
      <div className="pointer-events-none absolute inset-x-2 sm:inset-x-3 bottom-2 sm:bottom-3 flex justify-center">
        <span
          className={cn(
            "inline-block max-w-full rounded-md sm:rounded-lg",
            "px-2 py-1 sm:px-3 sm:py-1.5",
            "bg-bone/90 backdrop-blur-md",
            "text-[11px] leading-tight sm:text-[13px] md:text-sm font-medium tracking-tight text-graphite",
            "shadow-[0_1px_2px_rgba(42,39,36,0.06),0_4px_12px_rgba(42,39,36,0.08)]",
            "outline outline-1 -outline-offset-1 outline-mineral/25",
            "line-clamp-2 text-center transition-colors duration-[var(--duration-quick)]",
            selected && "bg-emerald/95 text-bone outline-emerald/40",
          )}
        >
          {card.label}
        </span>
      </div>
    </motion.button>
  );
}
