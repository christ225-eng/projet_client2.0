import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/motion/Reveal";

export default function LandingPage() {
  return (
    <>
      <Header />

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 text-center">
        <Reveal delay={0.1}>
          <p className="text-sm tracking-[0.28em] uppercase text-clay">
            STK architecture
          </p>
        </Reveal>

        <Reveal delay={0.25}>
          <h1 className="mt-6 text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-graphite">
            Apprendre Du Vivant
          </h1>
        </Reveal>

        <Reveal delay={0.45}>
          <div className="mx-auto mt-6 h-px w-28 bg-clay/40" aria-hidden />
        </Reveal>

        <Reveal delay={0.6}>
          <p className="mt-8 max-w-md text-sm md:text-base text-ash leading-relaxed">
            Explorez les liens entre le vivant et les innovations humaines.
          </p>
        </Reveal>

        <Reveal delay={0.85}>
          <Link
            href="/pseudo"
            className="mt-12 inline-flex h-12 items-center rounded-full bg-surface-elevated border border-mineral/60 px-8 text-sm font-medium text-graphite shadow-[var(--shadow-soft)] transition-all duration-[var(--duration-quick)] hover:bg-bone hover:border-clay/60 active:scale-[0.985]"
          >
            Lancez l&apos;experience
          </Link>
        </Reveal>
      </main>

      <Footer />
    </>
  );
}
