"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import type { Card } from "@/game-engine/types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface ValidationModalProps {
  open: boolean;
  vivant?: Card;
  application?: Card;
  /** True if the selection forms a correct pair — shown as a soft green check. */
  isCorrect?: boolean;
  explanation?: string;
  /** Called on the single CTA when the pair is correct (validates and advances). */
  onConfirm: () => void;
  /** Called on the single CTA when the pair is wrong (counts as error + clears selection). */
  onRetry: () => void;
}

const easeOrganic = [0.22, 1, 0.36, 1] as const;

/**
 * Contemplative validation modal.
 *
 *   Correct → emerald aura + ✓✓ + pedagogical explanation + "Continuer"
 *   Wrong   → vivid red ring + shake + "Réessayer" (single, centered)
 *
 * The two states are visually distinct so the player understands the outcome
 * at a glance. Children stagger in (cards → check → explanation → CTA).
 */
export function ValidationModal({
  open,
  vivant,
  application,
  isCorrect = false,
  explanation,
  onConfirm,
  onRetry,
}: ValidationModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
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

          {/* Error bloom — subtle red wash behind the dialog when wrong */}
          {!isCorrect ? (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                width: "min(820px, 90vw)",
                height: "min(620px, 80vh)",
                background:
                  "radial-gradient(ellipse, rgba(207,61,44,0.18) 0%, rgba(207,61,44,0.05) 45%, transparent 75%)",
                filter: "blur(30px)",
              }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, ease: easeOrganic }}
            />
          ) : null}

          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              "relative w-full max-w-2xl rounded-2xl bg-surface-modal p-5 sm:p-8 md:rounded-3xl md:p-10",
              isCorrect ? "shadow-[var(--shadow-modal)]" : "ring-error-vivid",
            )}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={
              isCorrect
                ? { opacity: 1, y: 0, scale: 1, x: 0 }
                : {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    x: [0, -10, 10, -7, 6, -3, 0],
                  }
            }
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={
              isCorrect
                ? { duration: 0.55, ease: easeOrganic }
                : {
                    duration: 0.6,
                    ease: [0.36, 0.07, 0.19, 0.97],
                    x: { duration: 0.55 },
                  }
            }
            style={{
              background:
                "linear-gradient(180deg, rgba(179,169,142,1) 0%, rgba(159,148,121,1) 100%)",
            }}
          >
            <motion.div
              className="flex items-center justify-center gap-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease: easeOrganic }}
            >
              {!isCorrect ? (
                <span
                  aria-hidden
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-bone/95 text-[15px] font-bold text-[color:var(--color-error-strong)] shadow-[0_2px_6px_rgba(207,61,44,0.35)]"
                >
                  !
                </span>
              ) : null}
              <h2 className="text-center text-base font-semibold tracking-tight text-bone sm:text-xl md:text-2xl">
                {isCorrect ? "Association juste" : "Mauvaise association"}
              </h2>
            </motion.div>

            <motion.div
              className="mt-5 flex items-center justify-center gap-3 sm:mt-8 sm:gap-6 md:gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: easeOrganic }}
            >
              <CardThumb
                card={application}
                kind="Application"
                delay={0.15}
                state={isCorrect ? "success" : "error"}
              />

              {isCorrect ? (
                <motion.span
                  className="text-2xl sm:text-3xl text-emerald drop-shadow-[0_0_12px_rgba(48,162,128,0.45)]"
                  aria-hidden
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.35, ease: easeOrganic }}
                >
                  ✓✓
                </motion.span>
              ) : (
                <motion.span
                  aria-hidden
                  className="grid h-9 w-9 place-items-center rounded-full bg-bone/95 text-lg font-bold text-[color:var(--color-error-strong)] shadow-[0_2px_8px_rgba(207,61,44,0.35)] sm:h-11 sm:w-11 sm:text-xl"
                  initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.55, delay: 0.3, ease: easeOrganic }}
                >
                  ✕
                </motion.span>
              )}

              <CardThumb
                card={vivant}
                kind="Vivant"
                delay={0.25}
                state={isCorrect ? "success" : "error"}
              />
            </motion.div>

            {/* Labels under each thumb */}
            <motion.div
              className="mx-auto mt-3 flex max-w-xl items-start justify-center gap-3 px-1 text-center text-[10px] uppercase tracking-[0.18em] text-bone/85 sm:mt-5 sm:gap-12 sm:text-xs sm:tracking-[0.22em]"
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
              {isCorrect && explanation ? (
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

              {!isCorrect ? (
                <motion.p
                  key="hint"
                  className="mx-auto mt-5 max-w-xl text-center text-xs leading-relaxed text-bone/90 sm:mt-6 sm:text-sm"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.5, ease: easeOrganic }}
                >
                  Ces deux cartes ne forment pas une paire biomimétique. Observez à
                  nouveau et tentez une autre association.
                </motion.p>
              ) : null}
            </AnimatePresence>

            <motion.div
              className="mt-6 flex justify-center sm:mt-8"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: isCorrect ? 0.7 : 0.6,
                ease: easeOrganic,
              }}
            >
              {isCorrect ? (
                <Button variant="secondary" size="lg" onClick={onConfirm}>
                  Continuer
                </Button>
              ) : (
                <Button variant="secondary" size="lg" onClick={onRetry}>
                  Réessayer
                </Button>
              )}
            </motion.div>
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
  state = "neutral",
}: {
  card?: Card;
  kind: "Vivant" | "Application";
  delay?: number;
  state?: "neutral" | "success" | "error";
}) {
  return (
    <motion.div
      className={cn(
        "relative h-20 w-[28vw] max-w-[9rem] overflow-hidden rounded-xl bg-surface-elevated outline outline-1 -outline-offset-1 outline-mineral/40 sm:h-32 sm:w-40 md:h-36 md:w-44",
        state === "error" && "outline-[color:var(--color-error-strong)]/0",
      )}
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: easeOrganic }}
      style={{
        boxShadow:
          state === "success"
            ? "0 1px 2px rgba(42,39,36,0.06), 0 8px 24px rgba(42,39,36,0.14), 0 0 0 1px rgba(48,162,128,0.22), 0 0 24px rgba(48,162,128,0.15)"
            : state === "error"
              ? "0 0 0 2px rgba(207,61,44,0.85), 0 0 18px rgba(207,61,44,0.30), 0 8px 24px rgba(42,39,36,0.14)"
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
