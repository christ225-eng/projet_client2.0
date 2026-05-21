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
      <Header />

      <main className="relative z-10 flex flex-1 flex-col justify-center px-3 pb-4 sm:px-6 sm:pb-6 md:px-8 md:pb-4">
        <PlayClient level={config.level} pairsCount={config.pairsCount} pairs={pairs} />
      </main>

      <Footer minimal />
    </>
  );
}

export function generateStaticParams() {
  return LEVELS.map((l) => ({ level: String(l.level) }));
}
