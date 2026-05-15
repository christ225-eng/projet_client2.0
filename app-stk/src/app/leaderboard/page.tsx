"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import {
  getScoresSnapshot,
  getServerScoresSnapshot,
  subscribeToScores,
  type LeaderboardEntry,
} from "@/lib/leaderboard";
import { formatDuration } from "@/game-engine/score";
import { usePlayerStore } from "@/stores/playerStore";
import { cn } from "@/lib/cn";

const easeOrganic = [0.22, 1, 0.36, 1] as const;

/**
 * Final scoreboard, modelled on Maquettes/Score.png. Only real, completed
 * runs (level 5 finished) are shown — they were persisted in
 * `localStorage` by PlayClient at the end of the 5th level. No mock,
 * seeded, or demo data is rendered anywhere.
 *
 * Tiebreakers (lib/leaderboard.ts → sortScores): score desc → time asc →
 * errors asc.
 *
 * Cross-tab sync: another browser tab finishing a game broadcasts a
 * `storage` event, which we listen to here so the list refreshes live.
 */
export default function LeaderboardPage() {
  const pseudo = usePlayerStore((s) => s.pseudo);
  const entries = useSyncExternalStore(
    subscribeToScores,
    getScoresSnapshot,
    getServerScoresSnapshot,
  );

  // Player highlight: the BEST (highest-scoring) entry matching the
  // current pseudo. `entries` is already sorted score-desc, so the first
  // match is also the highest rank — a friendlier highlight than the
  // "most recent" run when a player has multiple completions.
  const myIndexInList = pseudo
    ? entries.findIndex((e) => e.prenom === pseudo)
    : -1;

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  const isEmpty = entries.length === 0;

  return (
    <>
      <Header rightSlot={<LevelsBadge />} />

      <main className="relative z-10 flex flex-1 flex-col items-center px-6 md:px-8 pb-12 pt-4">
        <Reveal>
          <p className="text-[11px] tracking-[0.32em] uppercase text-clay">
            Tous niveaux complétés
          </p>
        </Reveal>

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

// ── Header rightSlot — completion counter, mirrors gameplay's pair pill ────

function LevelsBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-bone/75 px-4 py-1.5 text-sm text-ash backdrop-blur-sm border border-mineral/40">
      Niveaux&nbsp;:
      <span className="ml-1 font-semibold text-graphite tabular-nums">5/5</span>
    </span>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────

function EmptyLeaderboard() {
  return (
    <motion.div
      className="mt-12 flex w-full max-w-md flex-col items-center rounded-3xl bg-bone/75 px-8 py-14 text-center backdrop-blur-md"
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
        className="grid h-14 w-14 place-items-center rounded-full bg-emerald/10 text-emerald"
      >
        <LeafIcon className="h-7 w-7" />
      </span>
      <h2 className="mt-5 text-lg font-semibold tracking-tight text-graphite">
        Aucun score pour le moment
      </h2>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-ash">
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
    <div className="mt-10 mb-12 flex w-full max-w-xl items-end justify-center gap-3 md:gap-4">
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
        "relative flex w-28 md:w-36 flex-col items-center rounded-2xl px-3 text-center",
        emphasized ? "py-7" : "py-5",
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
          "inline-flex h-7 items-center rounded-full px-3 text-[11px] font-semibold tracking-wide",
          emphasized
            ? "bg-bone/95 text-emerald"
            : "bg-surface-elevated text-clay outline outline-1 -outline-offset-1 outline-mineral/40",
        )}
      >
        {rankLabel}
      </span>

      <p
        className={cn(
          "mt-4 text-[10px] tracking-[0.22em] uppercase truncate max-w-full",
          emphasized ? "text-bone/80" : "text-clay",
        )}
      >
        {isMe ? "Vous" : entry.prenom}
      </p>

      <p
        className={cn(
          "mt-2 text-xl md:text-2xl font-semibold tabular-nums",
          emphasized ? "text-bone" : "text-graphite",
        )}
      >
        {entry.score.toLocaleString("fr-FR")}
      </p>

      <div
        className={cn(
          "mt-3 inline-flex items-center gap-1.5 text-[11px]",
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
        "flex w-28 md:w-36 flex-col items-center rounded-2xl border border-dashed border-mineral/40 bg-bone/30 px-3 text-center",
        emphasized ? "py-7 -translate-y-3.5" : "py-5",
      )}
      aria-hidden
    >
      <span className="inline-flex h-7 items-center rounded-full bg-surface-elevated px-3 text-[11px] font-semibold tracking-wide text-clay/70">
        {rankLabel}
      </span>
      <p className="mt-4 text-[10px] tracking-[0.22em] uppercase text-clay/50">
        —
      </p>
      <p className="mt-2 text-xl font-semibold tabular-nums text-clay/35">
        --
      </p>
      <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-clay/40">
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
        "relative flex items-center gap-3 md:gap-4 rounded-2xl px-3 py-2.5 backdrop-blur-sm",
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
          "flex-1 truncate text-sm tracking-tight",
          isMe ? "font-semibold text-graphite" : "text-graphite/90",
        )}
      >
        {isMe ? "Vous" : entry.prenom}
      </span>

      <div className="flex flex-col items-end shrink-0">
        <span className="text-base md:text-lg font-semibold text-clay tabular-nums">
          {entry.score.toLocaleString("fr-FR")}
        </span>
        <span className="mt-0.5 text-[11px] text-ash tabular-nums">
          {formatDuration(entry.temps)} ·&nbsp;
          {entry.erreurs} erreur{entry.erreurs > 1 ? "s" : ""}
        </span>
      </div>
    </motion.li>
  );
}

function RankBadge({ rank, isMe }: { rank: number; isMe: boolean }) {
  return (
    <span
      className={cn(
        "grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-semibold text-bone tabular-nums",
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
        "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold",
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
