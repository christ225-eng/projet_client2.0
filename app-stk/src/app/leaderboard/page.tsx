"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import {
  fetchPlayerRank,
  getScoresSnapshot,
  getServerScoresSnapshot,
  subscribeToScores,
  type LeaderboardEntry,
} from "@/lib/leaderboard";
import { playLeaderboardOpen, unlockAudio } from "@/lib/audio";
import { formatDuration } from "@/game-engine/score";
import { usePlayerStore } from "@/stores/playerStore";
import { cn } from "@/lib/cn";

const easeOrganic = [0.22, 1, 0.36, 1] as const;

/**
 * Final scoreboard — backed by Supabase. The list updates live thanks to
 * the realtime postgres_changes channel wired in `lib/leaderboard.ts`.
 *
 * Tiebreakers (lib/leaderboard.ts → sortScores): score desc → time asc →
 * errors asc.
 *
 * The player's rank is shown in two ways:
 *   • if they're inside the top 100 we highlight their row in the list,
 *   • we also fetch their exact global rank via `fetchPlayerRank`, which
 *     works even when they're outside the top 100.
 */
export default function LeaderboardPage() {
  const pseudo = usePlayerStore((s) => s.pseudo);
  const entries = useSyncExternalStore(
    subscribeToScores,
    getScoresSnapshot,
    getServerScoresSnapshot,
  );

  // Player highlight: the BEST (highest-scoring) entry matching the
  // current pseudo within the visible top 100.
  const myIndexInList = pseudo
    ? entries.findIndex((e) => e.prenom === pseudo)
    : -1;

  // Exact global rank — resolved via a dedicated query so it works past
  // the top-100 window we display. Re-runs when entries (and therefore
  // potentially the player's rank) change.
  const [playerRank, setPlayerRank] = useState<{
    rank: number;
    best: LeaderboardEntry;
  } | null>(null);

  useEffect(() => {
    if (!pseudo) {
      setPlayerRank(null);
      return;
    }
    let cancelled = false;
    void fetchPlayerRank(pseudo).then((res) => {
      if (!cancelled) setPlayerRank(res);
    });
    return () => {
      cancelled = true;
    };
  }, [pseudo, entries.length]);

  // Leaderboard opening cue — one-shot at mount; tries to play right away,
  // but most browsers will need a prior gesture (the click that navigated
  // here from /play/5) which already unlocked the audio context.
  useEffect(() => {
    unlockAudio();
    playLeaderboardOpen();
  }, []);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  const isEmpty = entries.length === 0;

  return (
    <>
      <Header rightSlot={<LevelsBadge />} />

      <main className="relative z-10 flex flex-1 flex-col items-center px-4 pb-10 pt-2 sm:px-6 sm:pb-12 sm:pt-4 md:px-8">
        <Reveal>
          <p className="text-[11px] tracking-[0.32em] uppercase text-clay">
            Tous niveaux complétés
          </p>
        </Reveal>

        {playerRank ? (
          <Reveal delay={0.1}>
            <PlayerRankBadge
              rank={playerRank.rank}
              entry={playerRank.best}
            />
          </Reveal>
        ) : null}

        {isEmpty ? (
          <Reveal delay={0.15}>
            <EmptyLeaderboard />
          </Reveal>
        ) : (
          <>
            <Reveal delay={0.2}>
              <Podium top3={top3} myIndex={myIndexInList} />
            </Reveal>

            <Reveal delay={0.45}>
              <RankList
                rest={rest}
                myIndex={myIndexInList}
                startRank={4}
              />
            </Reveal>
          </>
        )}

        <Reveal delay={0.65}>
          <Link href="/" className="mt-12 inline-block">
            <Button variant="primary" size="lg">
              Retour à l&apos;accueil
            </Button>
          </Link>
        </Reveal>
      </main>

      <Footer minimal />
    </>
  );
}

// ── Player rank badge — visible even when outside the top 100 ──────────────

function PlayerRankBadge({
  rank,
  entry,
}: {
  rank: number;
  entry: LeaderboardEntry;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: easeOrganic }}
      className="mt-5 inline-flex items-center gap-3 rounded-full bg-graphite px-4 py-2 text-bone backdrop-blur-sm sm:gap-4 sm:px-5 sm:py-2.5"
      style={{
        boxShadow:
          "0 2px 6px rgba(0,0,0,0.22), 0 16px 36px rgba(0,0,0,0.22)",
      }}
    >
      <span className="text-[10px] tracking-[0.24em] uppercase text-bone/70 sm:text-xs">
        Votre rang
      </span>
      <span className="text-xl font-semibold tabular-nums sm:text-2xl">
        #{rank}
      </span>
      <span aria-hidden className="h-4 w-px bg-bone/30" />
      <span className="text-sm font-semibold tabular-nums sm:text-base">
        {entry.score.toLocaleString("fr-FR")}
      </span>
      <span className="text-[11px] tabular-nums text-bone/70 sm:text-xs">
        {formatDuration(entry.temps)} · {entry.erreurs} err.
      </span>
    </motion.div>
  );
}

// ── Header rightSlot — completion counter, mirrors gameplay's pair pill ────

function LevelsBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-bone/75 px-3 py-1 text-xs text-ash backdrop-blur-sm border border-mineral/40 sm:px-4 sm:py-1.5 sm:text-sm">
      Niveaux&nbsp;:
      <span className="ml-1 font-semibold text-graphite tabular-nums">5/5</span>
    </span>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────

function EmptyLeaderboard() {
  return (
    <motion.div
      className="mt-10 flex w-full max-w-md flex-col items-center rounded-3xl bg-bone/75 px-6 py-10 text-center backdrop-blur-md sm:mt-12 sm:px-8 sm:py-14"
      style={{
        boxShadow:
          "0 1px 2px rgba(42,39,36,0.04), 0 16px 40px rgba(42,39,36,0.10)",
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: easeOrganic }}
    >
      <span
        aria-hidden
        className="grid h-12 w-12 place-items-center rounded-full bg-emerald/10 text-emerald sm:h-14 sm:w-14"
      >
        <LeafIcon className="h-6 w-6 sm:h-7 sm:w-7" />
      </span>
      <h2 className="mt-4 text-base font-semibold tracking-tight text-graphite sm:mt-5 sm:text-lg">
        Aucun score pour le moment
      </h2>
      <p className="mt-2 max-w-xs text-xs leading-relaxed text-ash sm:text-sm">
        Soyez le premier à compléter les 5 niveaux pour rejoindre le
        classement.
      </p>
      <Link href="/pseudo" className="mt-6 inline-block">
        <Button variant="secondary" size="md">
          Commencer une partie
        </Button>
      </Link>
    </motion.div>
  );
}

// ── Podium ─────────────────────────────────────────────────────────────────

function Podium({
  top3,
  myIndex,
}: {
  top3: LeaderboardEntry[];
  myIndex: number;
}) {
  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  return (
    <div className="mb-10 mt-8 flex w-full max-w-xl items-end justify-center gap-2 sm:mb-12 sm:mt-10 sm:gap-3 md:gap-4">
      {second ? (
        <PodiumCard rank={2} entry={second} isMe={myIndex === 1} delay={0.1} />
      ) : (
        <PodiumSlot rank={2} />
      )}
      {first ? (
        <PodiumCard
          rank={1}
          entry={first}
          isMe={myIndex === 0}
          emphasized
          delay={0.2}
        />
      ) : (
        <PodiumSlot rank={1} emphasized />
      )}
      {third ? (
        <PodiumCard rank={3} entry={third} isMe={myIndex === 2} delay={0.3} />
      ) : (
        <PodiumSlot rank={3} />
      )}
    </div>
  );
}

function PodiumCard({
  rank,
  entry,
  isMe,
  emphasized = false,
  delay = 0,
}: {
  rank: 1 | 2 | 3;
  entry: LeaderboardEntry;
  isMe: boolean;
  emphasized?: boolean;
  delay?: number;
}) {
  const rankLabel = rank === 1 ? "1st" : rank === 2 ? "2nd" : "3rd";

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: emphasized ? -14 : 0 }}
      transition={{ duration: 0.7, delay, ease: easeOrganic }}
      className={cn(
        "relative flex w-[31vw] max-w-[9rem] flex-col items-center rounded-2xl px-2 text-center sm:w-28 sm:px-3 md:w-36",
        emphasized ? "py-5 sm:py-6 md:py-7" : "py-4 sm:py-5",
        emphasized
          ? "bg-emerald text-bone"
          : "bg-bone/85 text-graphite backdrop-blur-md",
        isMe && !emphasized && "outline outline-2 -outline-offset-1 outline-emerald/60",
      )}
      style={{
        boxShadow: emphasized
          ? "0 6px 14px rgba(48,162,128,0.20), 0 28px 56px rgba(48,162,128,0.30), inset 0 1px 0 rgba(255,255,255,0.18)"
          : "0 1px 2px rgba(42,39,36,0.05), 0 14px 32px rgba(42,39,36,0.10)",
      }}
    >
      <span
        className={cn(
          "inline-flex h-6 items-center rounded-full px-2.5 text-[10px] font-semibold tracking-wide sm:h-7 sm:px-3 sm:text-[11px]",
          emphasized
            ? "bg-bone/95 text-emerald"
            : "bg-surface-elevated text-clay outline outline-1 -outline-offset-1 outline-mineral/40",
        )}
      >
        {rankLabel}
      </span>

      <p
        className={cn(
          "mt-3 text-[9px] tracking-[0.22em] uppercase truncate max-w-full sm:mt-4 sm:text-[10px]",
          emphasized ? "text-bone/80" : "text-clay",
        )}
      >
        {isMe ? "Vous" : entry.prenom}
      </p>

      <p
        className={cn(
          "mt-2 text-lg font-semibold tabular-nums sm:text-xl md:text-2xl",
          emphasized ? "text-bone" : "text-graphite",
        )}
      >
        {entry.score.toLocaleString("fr-FR")}
      </p>

      <div
        className={cn(
          "mt-2 inline-flex items-center gap-1 text-[10px] sm:mt-3 sm:gap-1.5 sm:text-[11px]",
          emphasized ? "text-bone/85" : "text-ash",
        )}
      >
        <ClockIcon className="h-3 w-3" />
        <span className="tabular-nums">{formatDuration(entry.temps)}</span>
      </div>
    </motion.div>
  );
}

function PodiumSlot({
  rank,
  emphasized = false,
}: {
  rank: 1 | 2 | 3;
  emphasized?: boolean;
}) {
  const rankLabel = rank === 1 ? "1st" : rank === 2 ? "2nd" : "3rd";
  return (
    <div
      className={cn(
        "flex w-[31vw] max-w-[9rem] flex-col items-center rounded-2xl border border-dashed border-mineral/40 bg-bone/30 px-2 text-center sm:w-28 sm:px-3 md:w-36",
        emphasized ? "py-5 -translate-y-3 sm:py-6 md:py-7" : "py-4 sm:py-5",
      )}
      aria-hidden
    >
      <span className="inline-flex h-6 items-center rounded-full bg-surface-elevated px-2.5 text-[10px] font-semibold tracking-wide text-clay/70 sm:h-7 sm:px-3 sm:text-[11px]">
        {rankLabel}
      </span>
      <p className="mt-3 text-[9px] tracking-[0.22em] uppercase text-clay/50 sm:mt-4 sm:text-[10px]">
        —
      </p>
      <p className="mt-2 text-lg font-semibold tabular-nums text-clay/35 sm:text-xl">
        --
      </p>
      <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-clay/40 sm:mt-3 sm:gap-1.5 sm:text-[11px]">
        <ClockIcon className="h-3 w-3" />
        <span className="tabular-nums">--:--</span>
      </div>
    </div>
  );
}

// ── List below the podium ──────────────────────────────────────────────────

function RankList({
  rest,
  myIndex,
  startRank,
}: {
  rest: LeaderboardEntry[];
  myIndex: number;
  startRank: number;
}) {
  if (rest.length === 0) return null;

  return (
    <ul className="w-full max-w-xl space-y-2.5">
      {rest.map((entry, i) => {
        const absoluteIndex = i + (startRank - 1);
        const isMe = absoluteIndex === myIndex;
        return (
          <RankRow
            key={`${entry.prenom}-${entry.score}-${entry.temps}-${i}`}
            rank={startRank + i}
            entry={entry}
            isMe={isMe}
            delay={Math.min(i * 0.05, 0.4)}
          />
        );
      })}
    </ul>
  );
}

function RankRow({
  rank,
  entry,
  isMe,
  delay = 0,
}: {
  rank: number;
  entry: LeaderboardEntry;
  isMe: boolean;
  delay?: number;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay, ease: easeOrganic }}
      className={cn(
        "relative flex items-center gap-2.5 rounded-2xl px-2.5 py-2 backdrop-blur-sm sm:gap-3 sm:px-3 sm:py-2.5 md:gap-4",
        isMe
          ? "bg-emerald/10 outline outline-2 -outline-offset-1 outline-emerald/55"
          : "bg-bone/70",
      )}
      style={{
        boxShadow: isMe
          ? "0 2px 6px rgba(48,162,128,0.14), 0 10px 28px rgba(48,162,128,0.18)"
          : "0 1px 2px rgba(42,39,36,0.04), 0 4px 12px rgba(42,39,36,0.06)",
      }}
    >
      <RankBadge rank={rank} isMe={isMe} />
      <Avatar name={entry.prenom} isMe={isMe} />

      <span
        className={cn(
          "flex-1 truncate text-[13px] tracking-tight sm:text-sm",
          isMe ? "font-semibold text-graphite" : "text-graphite/90",
        )}
      >
        {isMe ? "Vous" : entry.prenom}
      </span>

      <div className="flex flex-col items-end shrink-0">
        <span className="text-sm font-semibold text-clay tabular-nums sm:text-base md:text-lg">
          {entry.score.toLocaleString("fr-FR")}
        </span>
        <span className="mt-0.5 text-[10px] text-ash tabular-nums sm:text-[11px]">
          {formatDuration(entry.temps)} ·&nbsp;
          {entry.erreurs} err.
        </span>
      </div>
    </motion.li>
  );
}

function RankBadge({ rank, isMe }: { rank: number; isMe: boolean }) {
  return (
    <span
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-semibold text-bone tabular-nums sm:h-10 sm:w-10 sm:text-sm",
        isMe ? "bg-emerald" : "bg-clay",
      )}
      style={
        isMe
          ? { boxShadow: "0 2px 6px rgba(48,162,128,0.28)" }
          : { boxShadow: "0 2px 4px rgba(140,125,98,0.20)" }
      }
      aria-label={`Rang ${rank}`}
    >
      {rank}
    </span>
  );
}

function Avatar({ name, isMe }: { name: string; isMe: boolean }) {
  const initial = (name?.trim() || "?")[0]?.toUpperCase() ?? "?";
  return (
    <span
      className={cn(
        "hidden h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold sm:grid",
        isMe ? "bg-emerald/20 text-emerald" : "bg-mineral/30 text-graphite",
      )}
      aria-hidden
    >
      {initial}
    </span>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  );
}

function LeafIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M5 20 C 5 12, 12 5, 20 5 C 20 13, 13 20, 5 20 Z" />
      <path d="M5 20 L 14 11" />
    </svg>
  );
}
