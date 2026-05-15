"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface GuideProps {
  size?: number;
  className?: string;
  /** Toggle the inner spiral imprint — set false when the guide is purely decorative */
  imprint?: boolean;
}

/**
 * Biomimetic guide — an ambient pearlescent orb that breathes and gently
 * floats. Stands in for a richer character/3D model later. Pure CSS +
 * inline gradients + framer-motion (transform / opacity only), no heavy
 * deps. Lightweight enough to drop in inline alongside text.
 *
 * The orb composites three layers:
 *   1. Outer pulsing aura (emerald glow)
 *   2. Pearl body (cream / sand radial gradient with inset shadow)
 *   3. Top-left highlight reflection
 *   4. Subtle spiral imprint — drifts in micro-rotation
 *
 * All loops are slow (4-9s) so the orb feels alive without becoming busy.
 */
export function Guide({ size = 56, className, imprint = true }: GuideProps) {
  return (
    <motion.div
      role="img"
      aria-label="Guide biomimétique"
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
      animate={{ y: [-2, 2, -2] }}
      transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Outer pulsing aura */}
      <motion.span
        aria-hidden
        className="absolute -inset-[18%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(48,162,128,0.22) 0%, rgba(48,162,128,0.06) 45%, transparent 70%)",
        }}
        animate={{ opacity: [0.4, 0.85, 0.4], scale: [0.92, 1.06, 0.92] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Pearl body */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 28%, rgba(255,255,255,0.92) 0%, rgba(246,241,230,0.7) 30%, rgba(174,162,135,0.55) 65%, rgba(140,125,98,0.65) 100%)",
          boxShadow:
            "inset 0 1px 2px rgba(255,255,255,0.55), inset 0 -2px 5px rgba(42,39,36,0.18), 0 6px 18px rgba(42,39,36,0.14)",
        }}
      />

      {/* Top-left specular highlight */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse 55% 42% at 32% 26%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 60%)",
        }}
      />

      {imprint ? (
        <motion.svg
          viewBox="0 0 24 24"
          aria-hidden
          className="absolute left-1/2 top-1/2"
          style={{
            width: "42%",
            height: "42%",
            transform: "translate(-50%, -50%)",
          }}
          fill="none"
          stroke="rgba(48, 162, 128, 0.78)"
          strokeWidth="1.4"
          strokeLinecap="round"
          animate={{ rotate: [-4, 4, -4] }}
          transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Fibonacci-ish imprint */}
          <path d="M12 5 Q 18 8 17 13 Q 16 17 12 16 Q 9 15 10 12 Q 11 10 13 11" />
        </motion.svg>
      ) : null}
    </motion.div>
  );
}
