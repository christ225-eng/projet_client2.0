"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Pair, Card } from "@/game-engine/types";
import { validateSelection } from "@/game-engine/validation";
import { shuffle } from "@/game-engine/shuffle";
import { calculateEndOfGameScore } from "@/game-engine/score";
import { useGameStore } from "@/stores/gameStore";
import { useScoreStore, getElapsedSeconds } from "@/stores/scoreStore";
import { usePlayerStore } from "@/stores/playerStore";
import { saveScore } from "@/lib/leaderboard";
import {
  playCorrect,
  playWrong,
  playLevelComplete,
  startAmbient,
  stopAmbient,
  unlockAudio,
} from "@/lib/audio";
import { ValidationModal } from "@/components/game/ValidationModal";
import { Button } from "@/components/ui/Button";
import { AudioToggle } from "@/components/ui/AudioToggle";

/**
 * Board is rendered client-only. The shuffle in PlayClient uses
 * `Math.random()`, which would produce different orders during SSR and
 * hydration and break React's tree reconciliation (cards mis-aligned,
 * wrong cards getting marked as "resolved"). Skipping SSR for the board
 * is cleaner than seeded shuffles or post-mount setState dances.
 */
const Board = dynamic(
  () => import("@/components/game/Board").then((m) => ({ default: m.Board })),
  {
    ssr: false,
    loading: () => <BoardSkeleton />,
  },
);

function BoardSkeleton() {
  return (
    <div
      className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4 md:gap-7"
      aria-busy
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[4/3] w-full animate-pulse rounded-xl bg-bone/40 outline outline-1 -outline-offset-1 outline-mineral/20 md:rounded-2xl"
        />
      ))}
    </div>
  );
}

interface PlayClientProps {
  level: 1 | 2 | 3 | 4 | 5;
  pairsCount: number;
  pairs: readonly Pair[];
}

const easeOrganic = [0.22, 1, 0.36, 1] as const;

// Hint triggers — generous so the help feels invited, not pushed
const HINT_INACTIVITY_MS = 14_000;
const HINT_ERROR_THRESHOLD = 3;

export function PlayClient({ level, pairsCount, pairs }: PlayClientProps) {
  const router = useRouter();
  const {
    setLevel,
    selected,
    resolvedPairs,
    selectCard,
    clearSelection,
    markPairResolved,
    completeLevel,
  } = useGameStore();
  const { incrementErrors, registerPairFound, endTimer } = useScoreStore();

  // Sync the store with the URL-driven level
  useEffect(() => {
    setLevel(level);
  }, [level, setLevel]);

  // Build & shuffle the two rows once per level
  const { vivants, applications } = useMemo(() => {
    const v = pairs.map<Card>((p) => ({ ...p.vivant, pairId: p.id, kind: "vivant" }));
    const a = pairs.map<Card>((p) => ({ ...p.application, pairId: p.id, kind: "application" }));
    return { vivants: shuffle(v), applications: shuffle(a) };
  }, [pairs]);

  // Derive the modal payload purely from the selection — no setState in effect
  const pendingSelection = useMemo(() => {
    if (selected.length !== 2) return null;
    const [a, b] = selected as [Card, Card];
    const pairId = validateSelection(a, b);
    const pair = pairId === null ? undefined : pairs.find((p) => p.id === pairId);
    return {
      a,
      b,
      correct: pairId !== null,
      explanation: pair?.explanation,
    };
  }, [selected, pairs]);

  const finished = resolvedPairs.length === pairsCount;

  // ── Audio side-effects ────────────────────────────────────────────────────
  useEffect(() => {
    unlockAudio();
    startAmbient();
    return () => stopAmbient();
  }, []);

  // Modal results — play correct/wrong on transition (open → outcome known)
  const lastFxKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (!pendingSelection) {
      lastFxKeyRef.current = null;
      return;
    }
    const key = `${pendingSelection.a.id}|${pendingSelection.b.id}|${pendingSelection.correct ? "ok" : "ko"}`;
    if (lastFxKeyRef.current === key) return;
    lastFxKeyRef.current = key;
    if (pendingSelection.correct) playCorrect();
    else playWrong();
  }, [pendingSelection]);

  // End-of-level / end-of-game side-effects.
  useEffect(() => {
    if (!finished) return;
    completeLevel(level);
    playLevelComplete();

    if (level !== 5) return;
    endTimer();
    stopAmbient();

    const score = useScoreStore.getState();
    const pseudo = usePlayerStore.getState().pseudo;
    const seconds = getElapsedSeconds(score);
    const finalScore = calculateEndOfGameScore({
      errors: score.errors,
      seconds,
    });

    if (pseudo) {
      saveScore({
        prenom: pseudo,
        score: finalScore,
        temps: seconds,
        erreurs: score.errors,
        date: new Date().toLocaleDateString("fr-FR"),
      });
    }
  }, [finished, level, completeLevel, endTimer]);

  // ── Hint system ──────────────────────────────────────────────────────────
  // Suggests a yet-unsolved pair after a stretch of inactivity OR a streak
  // of wrong attempts. Hint clears as soon as the player interacts again.
  const [hintPairId, setHintPairId] = useState<number | null>(null);
  const errorStreakRef = useRef(0);
  const lastInteractionRef = useRef<number>(Date.now());
  const modalOpen = pendingSelection !== null;

  function pickRandomUnresolvedPair(): number | null {
    const remaining = pairs.filter((p) => !resolvedPairs.includes(p.id));
    if (remaining.length === 0) return null;
    return remaining[Math.floor(Math.random() * remaining.length)]!.id;
  }

  // Schedule an inactivity hint
  useEffect(() => {
    if (finished || modalOpen) return;
    lastInteractionRef.current = Date.now();
    const timer = window.setTimeout(() => {
      setHintPairId((current) => current ?? pickRandomUnresolvedPair());
    }, HINT_INACTIVITY_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.length, resolvedPairs.length, finished, modalOpen]);

  // Clear the hint when the player engages
  useEffect(() => {
    if (selected.length > 0) setHintPairId(null);
  }, [selected.length]);

  function handleConfirm() {
    if (!pendingSelection?.correct) return;
    errorStreakRef.current = 0;
    markPairResolved(pendingSelection.a.pairId);
    registerPairFound();
  }

  function handleRetry() {
    if (pendingSelection && !pendingSelection.correct) {
      incrementErrors();
      errorStreakRef.current += 1;
      if (errorStreakRef.current >= HINT_ERROR_THRESHOLD) {
        setHintPairId(pickRandomUnresolvedPair());
        errorStreakRef.current = 0;
      }
    }
    clearSelection();
  }

  function nextLevel() {
    if (level === 5) {
      router.push("/leaderboard");
      return;
    }
    router.push(`/play/${level + 1}`);
  }

  const modalVivant = pendingSelection
    ? pendingSelection.a.kind === "vivant"
      ? pendingSelection.a
      : pendingSelection.b
    : undefined;
  const modalApplication = pendingSelection
    ? pendingSelection.a.kind === "application"
      ? pendingSelection.a
      : pendingSelection.b
    : undefined;

  const hintIds = useMemo<string[]>(() => {
    if (hintPairId === null) return [];
    const v = vivants.find((c) => c.pairId === hintPairId)?.id;
    const a = applications.find((c) => c.pairId === hintPairId)?.id;
    return [v, a].filter((x): x is string => Boolean(x));
  }, [hintPairId, vivants, applications]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 sm:mb-6">
        <motion.span
          className="inline-flex items-center rounded-full bg-bone/75 px-3 py-1 text-xs font-medium text-graphite backdrop-blur-sm border border-mineral/40 sm:px-4 sm:py-1.5 sm:text-sm"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: easeOrganic }}
        >
          Niveau {level}
        </motion.span>

        <div className="flex items-center gap-2">
          <AudioToggle />
          {/* Per spec: this is a PAIR counter, NOT a numeric score */}
          <motion.span
            className="inline-flex items-center rounded-full bg-bone/75 px-3 py-1 text-xs text-ash backdrop-blur-sm border border-mineral/40 sm:px-4 sm:py-1.5 sm:text-sm"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: easeOrganic }}
          >
            Paires&nbsp;:
            <span className="ml-1 font-semibold text-graphite tabular-nums">
              {resolvedPairs.length}/{pairsCount}
            </span>
          </motion.span>
        </div>
      </div>

      <motion.h2
        className="mb-4 text-center text-sm font-medium leading-snug text-graphite sm:mb-6 sm:text-base md:mb-7 md:text-lg"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1, ease: easeOrganic }}
      >
        Associez les éléments du vivant à leurs applications humaines
      </motion.h2>

      <Board
        vivants={vivants}
        applications={applications}
        resolvedPairIds={resolvedPairs}
        selectedIds={selected.map((c) => c.id)}
        errorIds={
          pendingSelection && !pendingSelection.correct
            ? [pendingSelection.a.id, pendingSelection.b.id]
            : []
        }
        hintIds={hintIds}
        onCardClick={selectCard}
      />

      <ValidationModal
        open={pendingSelection !== null}
        vivant={modalVivant}
        application={modalApplication}
        isCorrect={pendingSelection?.correct}
        explanation={pendingSelection?.correct ? pendingSelection.explanation : undefined}
        onConfirm={handleConfirm}
        onRetry={handleRetry}
      />

      <AnimatePresence>
        {finished ? <VictoryOverlay level={level} onNext={nextLevel} /> : null}
      </AnimatePresence>
    </>
  );
}

function VictoryOverlay({ level, onNext }: { level: number; onNext: () => void }) {
  const isFinal = level === 5;

  return (
    <motion.div
      key="finish"
      className="fixed inset-0 z-40 flex flex-col items-center justify-center px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: easeOrganic }}
    >
      {/* Layered backdrop blur + ivory wash */}
      <motion.div
        aria-hidden
        className="absolute inset-0 backdrop-blur-md"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(246,241,230,0.85) 0%, rgba(246,241,230,0.55) 55%, rgba(246,241,230,0.25) 100%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: easeOrganic }}
      />

      {/* Subtle sand/emerald bloom behind the headline */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          width: "min(70vw, 900px)",
          height: "min(50vh, 500px)",
          background:
            "radial-gradient(ellipse, rgba(174,162,135,0.25) 0%, rgba(48,162,128,0.10) 35%, transparent 70%)",
          filter: "blur(40px)",
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.1, ease: easeOrganic }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <motion.p
          className="text-xs tracking-[0.32em] uppercase text-clay"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: easeOrganic }}
        >
          {isFinal ? "Exploration complète" : `Niveau ${level} terminé`}
        </motion.p>

        <motion.span
          className="mt-3 text-6xl font-bold tracking-tight text-graphite md:text-7xl lg:text-8xl"
          style={{
            filter: "drop-shadow(0 6px 28px rgba(42,39,36,0.18))",
            letterSpacing: "-0.04em",
          }}
          initial={{ opacity: 0, scale: 0.92, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: easeOrganic }}
        >
          GAGNÉ&nbsp;!
        </motion.span>

        <motion.p
          className="mt-5 max-w-md text-center text-sm text-graphite/90 leading-relaxed"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.65, ease: easeOrganic }}
        >
          {isFinal
            ? "Vous avez parcouru les 22 paires biomimétiques. Découvrez votre classement."
            : `Toutes les paires du niveau ${level} ont été associées.`}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.85, ease: easeOrganic }}
        >
          <Button variant="primary" size="lg" className="mt-8" onClick={onNext}>
            {isFinal ? "Voir le classement" : "Passer au niveau suivant"}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
