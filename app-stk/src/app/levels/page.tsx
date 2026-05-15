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

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-8">
        <Reveal>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-graphite text-center">
            Choisissez un niveau
          </h1>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mt-3 max-w-md text-center text-sm text-ash">
            5 niveaux progressifs · 22 paires à découvrir
          </p>
        </Reveal>

        <Reveal delay={0.4}>
          <ul className="mt-12 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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
      <span className="text-xs uppercase tracking-[0.18em] text-clay">Niveau</span>
      <span className="mt-1 block text-3xl font-semibold text-graphite">{level}</span>
      <span className="mt-3 block text-xs text-ash">{pairs} paires</span>
      <span className="mt-1 block text-xs text-ash/70">{difficulty}</span>
      {done ? (
        <span className="mt-3 inline-flex items-center gap-1 text-xs text-emerald">
          ✓ terminé
        </span>
      ) : null}
    </>
  );

  const base = cn(
    "block w-full rounded-2xl border bg-bone/70 px-5 py-6 text-left backdrop-blur-sm",
    "transition-all duration-[var(--duration-base)] ease-[var(--ease-organic)]",
    unlocked
      ? "border-mineral/40 hover:border-clay/60 hover:bg-bone shadow-[var(--shadow-card)]"
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
