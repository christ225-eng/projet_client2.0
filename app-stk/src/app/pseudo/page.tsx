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

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 sm:px-8">
        <Reveal delay={0.05}>
          <p className="mb-7 text-center text-[10px] tracking-[0.32em] uppercase text-clay sm:mb-8 sm:text-xs">
            Bienvenue
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <motion.form
            onSubmit={handleSubmit}
            className="flex w-full max-w-xl items-center gap-2.5 rounded-full bg-bone/85 px-2.5 py-2 backdrop-blur-md sm:gap-4 sm:px-4 sm:py-3"
            style={{
              boxShadow:
                "0 1px 2px rgba(42,39,36,0.04), 0 16px 40px rgba(42,39,36,0.08)",
            }}
            animate={canSubmit ? { scale: 1.005 } : { scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Guide sizeClassName="h-10 w-10 sm:h-14 sm:w-14" />

            <Input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Entrez votre pseudo"
              maxLength={24}
              className="min-w-0 h-11 px-2 text-[15px] sm:h-12 sm:px-4 sm:text-base"
              aria-label="Entrez votre pseudo"
            />

            <motion.button
              type="submit"
              disabled={!canSubmit}
              whileHover={canSubmit ? { scale: 1.05 } : undefined}
              whileTap={canSubmit ? { scale: 0.95 } : undefined}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-graphite text-bone shadow-[0_2px_6px_rgba(0,0,0,0.22),0_10px_22px_rgba(0,0,0,0.24)] transition-colors hover:bg-black disabled:opacity-40 disabled:pointer-events-none sm:h-12 sm:w-12"
              aria-label="Continuer"
            >
              <span aria-hidden>→</span>
            </motion.button>
          </motion.form>
        </Reveal>

        <Reveal delay={0.5}>
          <p className="mt-6 max-w-xs text-center text-[11px] leading-relaxed text-ash/70 sm:max-w-none sm:text-xs">
            Votre pseudo sera utilisé pour le classement final.
          </p>
        </Reveal>
      </main>

      <Footer minimal />
    </>
  );
}
