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

const easeOrganic = [0.22, 1, 0.36, 1] as const;

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

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-6 text-center sm:px-8 sm:py-8">
        <Reveal>
          <h1 className="text-3xl font-semibold tracking-tight text-graphite sm:text-4xl md:text-5xl">
            Comment jouer&nbsp;?
          </h1>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mt-3 max-w-md text-sm text-ash sm:mt-4 sm:text-base">
            Trois étapes pour explorer le vivant.
          </p>
        </Reveal>

        <div className="relative mt-10 w-full max-w-2xl sm:mt-14">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.index}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.55, ease: easeOrganic }}
              className="flex items-center gap-4 rounded-3xl bg-bone/90 p-4 text-left backdrop-blur-md sm:gap-5 sm:p-5"
              style={{
                boxShadow:
                  "0 1px 2px rgba(42,39,36,0.04), 0 16px 40px rgba(42,39,36,0.08)",
              }}
            >
              <Guide sizeClassName="h-12 w-12 sm:h-16 sm:w-16" />

              <div className="flex-1 min-w-0">
                <p className="text-[10px] tracking-[0.24em] uppercase text-clay">
                  Étape {current.index} / {STEPS.length}
                </p>
                <p className="mt-1 text-base font-semibold tracking-tight text-graphite sm:text-lg">
                  {current.title}
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ash sm:mt-2 sm:text-sm">
                  {current.body}
                </p>
              </div>

              <motion.button
                type="button"
                onClick={next}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.25, ease: easeOrganic }}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-elevated border border-mineral/60 transition-colors hover:bg-bone hover:border-clay/60 sm:h-11 sm:w-11"
                aria-label={isLast ? "Commencer le jeu" : "Étape suivante"}
              >
                <span aria-hidden className="text-graphite">
                  {isLast ? "✓" : "→"}
                </span>
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
                  className="h-1.5 rounded-full bg-clay"
                  animate={{
                    width: active ? 32 : 6,
                    opacity: done || active ? 1 : 0.35,
                  }}
                  transition={{ duration: 0.5, ease: easeOrganic }}
                  aria-hidden
                />
              );
            })}
          </div>
        </div>
      </main>

      <Footer minimal />
    </>
  );
}
