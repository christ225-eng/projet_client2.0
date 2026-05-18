"use client";

import { motion } from "framer-motion";
import { Guide } from "@/components/ui/Guide";

interface LoadingTransitionProps {
  /** Short label shown beneath the orb */
  label?: string;
}

const easeOrganic = [0.22, 1, 0.36, 1] as const;

/**
 * Premium mini-loader rendered between the landing and the pseudo screen.
 * Lives ~1.4s — long enough to breathe, short enough not to block. The
 * caller controls the mount/unmount inside an <AnimatePresence>.
 *
 * Visual language stays in line with the rest of the experience: bone
 * surface, soft sand glow, organic guide orb. No spinners, no progress bar.
 */
export function LoadingTransition({ label = "Préparation de l'exploration" }: LoadingTransitionProps) {
  return (
    <motion.div
      key="loader"
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: easeOrganic }}
    >
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(246,241,230,0.94) 0%, rgba(246,241,230,0.78) 60%, rgba(246,241,230,0.65) 100%)",
          backdropFilter: "blur(14px) saturate(112%)",
          WebkitBackdropFilter: "blur(14px) saturate(112%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: easeOrganic }}
      />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          width: "min(70vw, 520px)",
          height: "min(60vh, 420px)",
          background:
            "radial-gradient(ellipse, rgba(48,162,128,0.18) 0%, rgba(174,162,135,0.12) 45%, transparent 78%)",
          filter: "blur(28px)",
        }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: easeOrganic }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: easeOrganic }}
      >
        <Guide size={96} />

        <motion.span
          className="mt-7 text-[11px] tracking-[0.32em] uppercase text-clay"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          {label}
        </motion.span>

        {/* Three dots breathing in sequence — organic, never spinning */}
        <div className="mt-4 flex items-center gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-clay/70"
              animate={{ opacity: [0.25, 1, 0.25], scale: [0.9, 1.1, 0.9] }}
              transition={{
                duration: 1.4,
                delay: i * 0.18,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
