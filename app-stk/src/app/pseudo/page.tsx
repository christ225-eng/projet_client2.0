"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/motion/Reveal";
import { Input } from "@/components/ui/Input";
import { Guide } from "@/components/ui/Guide";
import { usePlayerStore } from "@/stores/playerStore";

export default function PseudoPage() {
  const router = useRouter();
  const setPseudo = usePlayerStore((s) => s.setPseudo);
  const [value, setValue] = useState("");
  const canSubmit = value.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setPseudo(value.trim());
    router.push("/intro");
  }

  return (
    <>
      <Header />

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-8">
        <Reveal delay={0.05}>
          <p className="mb-8 text-center text-xs tracking-[0.28em] uppercase text-clay">
            Bienvenue dans l&apos;exploration
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <motion.form
            onSubmit={handleSubmit}
            className="flex w-full max-w-xl items-center gap-4 rounded-full bg-bone/85 px-4 py-3 backdrop-blur-md"
            style={{
              boxShadow:
                "0 1px 2px rgba(42,39,36,0.04), 0 16px 40px rgba(42,39,36,0.08)",
            }}
            animate={canSubmit ? { scale: 1.005 } : { scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Guide size={56} />

            <Input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Entrez votre pseudo"
              maxLength={24}
              className="text-center"
              aria-label="Entrez votre pseudo"
            />

            <motion.button
              type="submit"
              disabled={!canSubmit}
              whileHover={canSubmit ? { scale: 1.05 } : undefined}
              whileTap={canSubmit ? { scale: 0.95 } : undefined}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-surface-elevated border border-mineral/60 transition-colors hover:bg-bone hover:border-clay/60 disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Continuer"
            >
              <span aria-hidden className="text-graphite">→</span>
            </motion.button>
          </motion.form>
        </Reveal>

        <Reveal delay={0.5}>
          <p className="mt-6 text-center text-xs text-ash/70">
            Votre pseudo sera utilisé pour le classement final.
          </p>
        </Reveal>
      </main>

      <Footer minimal />
    </>
  );
}
