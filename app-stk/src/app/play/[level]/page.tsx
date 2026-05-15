import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LEVELS } from "@/data/levels";
import { getPairsForLevel } from "@/data/pairs";
import { PlayClient } from "./PlayClient";

interface PageParams {
  params: Promise<{ level: string }>;
}

/**
 * Gameplay route — the board layout is intentionally a skeleton.
 * Per the brief, the final board design isn't locked yet, so we wire
 * the data + state plumbing and leave room for the definitive UI.
 */
export default async function PlayLevelPage({ params }: PageParams) {
  const { level: levelParam } = await params;
  const level = Number(levelParam);

  const config = LEVELS.find((l) => l.level === level);
  if (!config) notFound();

  const pairs = getPairsForLevel(level);

  return (
    <>
      <Header
        centerSlot={
          <span
            aria-hidden
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-mineral/40 bg-bone/70 text-graphite/70 text-xs"
          >
            ⌕
          </span>
        }
      />

      <main className="relative z-10 flex flex-1 flex-col px-8 pb-8">
        <PlayClient level={config.level} pairsCount={config.pairsCount} pairs={pairs} />
      </main>

      <Footer minimal />
    </>
  );
}

export function generateStaticParams() {
  return LEVELS.map((l) => ({ level: String(l.level) }));
}
