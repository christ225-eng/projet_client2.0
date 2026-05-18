"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/motion/Reveal";
import { LEVELS } from "@/data/levels";
import { useGameStore } from "@/stores/gameStore";
import { cn } from "@/lib/cn";

/**
 * Hub des 5 niveaux. A level is unlocked when the previous one is in
 * `completedLevels`. Visual treatment intentionally minimal — we'll
 * iterate once the maquette of this screen is finalised.
 */
export default function LevelsPage() {
  const completed = useGameStore((s) => s.completedLevels);

  function isUnlocked(level: number): boolean {
    if (level === 1) return true;
    return completed.includes(level - 1);
  }

  return (
    <>
      <Header rightSlot={<span className="text-sm tracking-wide text-ash">Niveaux</span>} />

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 md:px-8">
        <Reveal>
          <h1 className="text-2xl font-semibold tracking-tight text-graphite text-center sm:text-3xl md:text-4xl">
            Choisissez un niveau
          </h1>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mt-3 max-w-md text-center text-xs text-ash sm:text-sm">
            5 niveaux progressifs · 22 paires à découvrir
          </p>
        </Reveal>

        <Reveal delay={0.4}>
          <ul className="mt-8 grid w-full max-w-3xl grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {LEVELS.map((lvl) => {
              const unlocked = isUnlocked(lvl.level);
              const done = completed.includes(lvl.level);
              return (
                <li key={lvl.level}>
                  <LevelTile level={lvl.level} pairs={lvl.pairsCount} difficulty={lvl.difficulty} unlocked={unlocked} done={done} />
                </li>
              );
            })}
          </ul>
        </Reveal>
      </main>

      <Footer minimal />
    </>
  );
}

interface LevelTileProps {
  level: number;
  pairs: number;
  difficulty: string;
  unlocked: boolean;
  done: boolean;
}

function LevelTile({ level, pairs, difficulty, unlocked, done }: LevelTileProps) {
  const content = (
    <>
      <span className="text-[10px] uppercase tracking-[0.18em] text-clay sm:text-xs">
        Niveau
      </span>
      <span className="mt-1 block text-2xl font-semibold text-graphite sm:text-3xl">
        {level}
      </span>
      <span className="mt-2 block text-[11px] text-ash sm:mt-3 sm:text-xs">
        {pairs} paires
      </span>
      <span className="mt-0.5 block text-[10px] text-ash/70 sm:mt-1 sm:text-xs">
        {difficulty}
      </span>
      {done ? (
        <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-emerald sm:mt-3 sm:text-xs">
          ✓ terminé
        </span>
      ) : null}
    </>
  );

  const base = cn(
    "block w-full rounded-2xl border bg-bone/70 px-4 py-5 text-left backdrop-blur-sm sm:px-5 sm:py-6",
    "transition-all duration-[var(--duration-base)] ease-[var(--ease-organic)]",
    unlocked
      ? "border-mineral/40 hover:border-clay/60 hover:bg-bone hover:-translate-y-0.5 shadow-[var(--shadow-card)] active:scale-[0.98]"
      : "border-mineral/20 opacity-50 cursor-not-allowed",
  );

  if (!unlocked) {
    return (
      <div className={base} aria-disabled>
        {content}
        <span className="sr-only">Niveau verrouillé</span>
      </div>
    );
  }

  return (
    <Link href={`/play/${level}`} className={base}>
      {content}
    </Link>
  );
}
