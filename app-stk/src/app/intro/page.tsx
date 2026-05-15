"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/motion/Reveal";
import { Guide } from "@/components/ui/Guide";
import { useScoreStore } from "@/stores/scoreStore";

interface Step {
  index: number;
  title: string;
  body: string;
}

const STEPS: readonly Step[] = [
  {
    index: 1,
    title: "Observez",
    body: "Toutes les cartes sont visibles. Prenez le temps d'explorer les éléments du vivant et les innovations humaines.",
  },
  {
    index: 2,
    title: "Associez",
    body: "Cliquez sur 2 cartes pour les associer. Trouvez les liens biomimétiques entre la nature et l'innovation.",
  },
  {
    index: 3,
    title: "Comprenez",
    body: "Découvrez comment la nature inspire nos solutions architecturales et techniques.",
  },
];

export default function IntroPage() {
  const router = useRouter();
  const startTimer = useScoreStore((s) => s.startTimer);
  const [step, setStep] = useState(0);

  const current = STEPS[step]!;
  const isLast = step === STEPS.length - 1;

  function next() {
    if (isLast) {
      startTimer();
      router.push("/levels");
      return;
    }
    setStep((s) => s + 1);
  }

  return (
    <>
      <Header />

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 text-center">
        <Reveal>
          <p className="mb-3 text-xs tracking-[0.28em] uppercase text-clay">
            Onboarding
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-graphite">
            Comment jouer&nbsp;?
          </h1>
        </Reveal>

        <div className="relative mt-16 w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.index}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-5 rounded-3xl bg-bone/85 px-5 py-5 text-left backdrop-blur-md"
              style={{
                boxShadow:
                  "0 1px 2px rgba(42,39,36,0.04), 0 16px 40px rgba(42,39,36,0.08)",
              }}
            >
              <Guide size={64} />

              <div className="flex-1">
                <p className="text-[10px] tracking-[0.24em] uppercase text-clay">
                  Étape {current.index} / {STEPS.length}
                </p>
                <p className="mt-1 text-base md:text-lg font-semibold tracking-tight text-graphite">
                  {current.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ash">
                  {current.body}
                </p>
              </div>

              <motion.button
                type="button"
                onClick={next}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface-elevated border border-mineral/60 transition-colors hover:bg-bone hover:border-clay/60"
                aria-label={isLast ? "Commencer le jeu" : "Étape suivante"}
              >
                <span aria-hidden className="text-graphite">→</span>
              </motion.button>
            </motion.div>
          </AnimatePresence>

          {/* Step indicator — soft pebbles */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {STEPS.map((s) => {
              const active = s.index - 1 === step;
              const done = s.index - 1 < step;
              return (
                <motion.span
                  key={s.index}
                  className="h-1.5 rounded-full"
                  animate={{
                    width: active ? 32 : 6,
                    opacity: done || active ? 1 : 0.35,
                    backgroundColor: active || done ? "var(--color-clay)" : "var(--color-clay)",
                  }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  aria-hidden
                />
              );
            })}
          </div>
        </div>

        <AnimatePresence>
          {isLast ? (
            <motion.button
              key="cta"
              type="button"
              onClick={next}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="mt-10 inline-flex h-12 items-center rounded-full bg-surface-elevated border border-mineral/60 px-8 text-sm font-medium text-graphite hover:bg-bone hover:border-clay/60"
              style={{
                boxShadow:
                  "0 1px 2px rgba(42,39,36,0.04), 0 8px 24px rgba(42,39,36,0.08)",
              }}
            >
              Commencez le Jeu
            </motion.button>
          ) : null}
        </AnimatePresence>
      </main>

      <Footer minimal />
    </>
  );
}
