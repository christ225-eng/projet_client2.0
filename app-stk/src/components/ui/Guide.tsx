"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/cn";

interface GuideProps {
  size?: number;
  className?: string;
  /** Legacy prop — kept for API compatibility, ignored. */
  imprint?: boolean;
  /** Override `size` with Tailwind sizing classes (responsive). */
  sizeClassName?: string;
  /** Disable the idle float — useful for compact contexts. */
  still?: boolean;
  priority?: boolean;
}

/**
 * Character guide — the friendly host that accompanies the player across
 * onboarding, hints and key transitions. Renders the official illustration
 * with a soft ground shadow + a slow idle float so it feels alive.
 *
 * The source PNG already embeds its circular framing, so we don't add a
 * border or background — we just preserve its proportions inside the
 * sizing box the parent provides.
 */
export function Guide({
  size = 96,
  className,
  sizeClassName,
  still = false,
  priority = false,
}: GuideProps) {
  const float = still ? undefined : { y: [-3, 3, -3] };

  return (
    <motion.div
      role="img"
      aria-label="Personnage guide"
      className={cn("relative shrink-0 select-none", sizeClassName, className)}
      style={sizeClassName ? undefined : { width: size, height: size }}
      animate={float}
      transition={
        still
          ? undefined
          : { duration: 6, repeat: Infinity, ease: "easeInOut" }
      }
    >
      {/* Soft ground shadow — sits below the character, never overlaps it */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute left-1/2 bottom-[-6%] -translate-x-1/2 rounded-full"
        style={{
          width: "62%",
          height: "10%",
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.12) 45%, transparent 75%)",
          filter: "blur(4px)",
        }}
        animate={still ? undefined : { opacity: [0.55, 0.85, 0.55], scaleX: [0.92, 1, 0.92] }}
        transition={
          still
            ? undefined
            : { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }
      />

      <Image
        src="/images/guide/guide.png"
        alt=""
        fill
        sizes="(max-width: 640px) 120px, 200px"
        priority={priority}
        className="object-contain"
        draggable={false}
      />
    </motion.div>
  );
}
