"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import type { Card } from "@/game-engine/types";
import { Button } from "@/components/ui/Button";

interface ValidationModalProps {
  open: boolean;
  vivant?: Card;
  application?: Card;
  /** True if the selection forms a correct pair — shown as a soft green check. */
  isCorrect?: boolean;
  explanation?: string;
  onValidate: () => void;
  onRetry: () => void;
  onCancel: () => void;
}

const easeOrganic = [0.22, 1, 0.36, 1] as const;

/**
 * Contemplative validation modal. Replaces the aggressive reset of the
 * previous prototype. The two selected cards stay visible inside the
 * modal, the background dim is light, the wrong-pair ring is discreet.
 *
 *   Mode A — correct: emerald aura + ✓✓ + pedagogical explanation
 *   Mode B — wrong:   soft red ring + "Réessayer / Annuler"
 *
 * Children stagger in (cards → check → explanation → CTA) so the eye
 * follows the comprehension flow rather than being hit by everything at
 * once.
 */
export function ValidationModal({
  open,
  vivant,
  application,
  isCorrect = false,
  explanation,
  onValidate,
  onRetry,
  onCancel,
}: ValidationModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: easeOrganic }}
        >
          {/* Background dim — keeps the organic bg + cards visible */}
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-graphite/15 backdrop-blur-[6px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Success bloom — soft emerald aura behind the dialog when correct */}
          {isCorrect ? (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                width: "min(820px, 90vw)",
                height: "min(620px, 80vh)",
                background:
                  "radial-gradient(ellipse, rgba(48,162,128,0.22) 0%, rgba(174,162,135,0.08) 45%, transparent 75%)",
                filter: "blur(30px)",
              }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.7, ease: easeOrganic }}
            />
          ) : null}

          <motion.div
            role="dialog"
            aria-modal="true"
            className={`relative w-full max-w-2xl rounded-2xl bg-surface-modal p-6 sm:p-8 md:rounded-3xl md:p-10 ${
              isCorrect ? "shadow-[var(--shadow-modal)]" : "ring-error-soft"
            }`}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.55, ease: easeOrganic }}
            style={{
              background:
                "linear-gradient(180deg, rgba(179,169,142,1) 0%, rgba(159,148,121,1) 100%)",
            }}
          >
            <motion.h2
              className="text-center text-lg font-semibold tracking-tight text-bone sm:text-xl md:text-2xl"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease: easeOrganic }}
            >
              {isCorrect ? "Association juste" : "Vérifiez votre association"}
            </motion.h2>

            <motion.div
              className="mt-6 flex items-center justify-center gap-3 sm:mt-8 sm:gap-6 md:gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: easeOrganic }}
            >
              <CardThumb card={application} kind="Application" delay={0.15} highlight={isCorrect} />

              <motion.span
                className={`text-2xl sm:text-3xl ${
                  isCorrect ? "text-emerald drop-shadow-[0_0_12px_rgba(48,162,128,0.45)]" : "text-bone/50"
                }`}
                aria-hidden
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.35, ease: easeOrganic }}
              >
                ✓✓
              </motion.span>

              <CardThumb card={vivant} kind="Vivant" delay={0.25} highlight={isCorrect} />
            </motion.div>

            {/* Labels under each thumb */}
            <motion.div
              className="mx-auto mt-4 flex max-w-xl items-start justify-center gap-3 px-1 text-center text-[10px] uppercase tracking-[0.18em] text-bone/85 sm:mt-5 sm:gap-12 sm:text-xs sm:tracking-[0.22em]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.45, ease: easeOrganic }}
            >
              <span className="w-[28vw] max-w-[9rem] leading-snug sm:w-32 md:w-36">
                {application?.label ?? "Application"}
              </span>
              <span className="invisible">✓</span>
              <span className="w-[28vw] max-w-[9rem] leading-snug sm:w-32 md:w-36">
                {vivant?.label ?? "Vivant"}
              </span>
            </motion.div>

            <AnimatePresence>
              {explanation ? (
                <motion.p
                  key="explanation"
                  className="mx-auto mt-5 max-w-xl text-center text-xs leading-relaxed text-bone/95 sm:mt-6 sm:text-sm"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.55, ease: easeOrganic }}
                >
                  {explanation}
                </motion.p>
              ) : null}
            </AnimatePresence>

            <motion.div
              className="mt-6 flex justify-center sm:mt-8"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: explanation ? 0.7 : 0.5,
                ease: easeOrganic,
              }}
            >
              <Button variant="secondary" size="lg" onClick={onValidate}>
                {isCorrect ? "Continuer" : "Valider"}
              </Button>
            </motion.div>

            {!isCorrect ? (
              <motion.div
                className="mt-6 flex flex-wrap justify-end gap-2 sm:mt-8 sm:gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6, ease: easeOrganic }}
              >
                <Button variant="outline" onClick={onRetry}>
                  Réessayer
                </Button>
                <Button variant="ghost" onClick={onCancel}>
                  Annuler
                </Button>
              </motion.div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function CardThumb({
  card,
  kind,
  delay = 0,
  highlight = false,
}: {
  card?: Card;
  kind: "Vivant" | "Application";
  delay?: number;
  highlight?: boolean;
}) {
  return (
    <motion.div
      className="relative h-20 w-[28vw] max-w-[9rem] overflow-hidden rounded-xl bg-surface-elevated outline outline-1 -outline-offset-1 outline-mineral/40 sm:h-32 sm:w-40 md:h-36 md:w-44"
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: easeOrganic }}
      style={{
        boxShadow: highlight
          ? "0 1px 2px rgba(42,39,36,0.06), 0 8px 24px rgba(42,39,36,0.14), 0 0 0 1px rgba(48,162,128,0.22), 0 0 24px rgba(48,162,128,0.15)"
          : "0 1px 2px rgba(42,39,36,0.06), 0 8px 24px rgba(42,39,36,0.10)",
      }}
    >
      {card?.imageSrc ? (
        <Image
          src={card.imageSrc}
          alt={card.label}
          fill
          sizes="(max-width: 640px) 30vw, (max-width: 768px) 160px, 176px"
          quality={92}
          className="object-cover object-center"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-[10px] uppercase tracking-[0.3em] text-ash/40">
          {kind}
        </div>
      )}
    </motion.div>
  );
}
