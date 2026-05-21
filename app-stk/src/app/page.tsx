import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/motion/Reveal";
import { LandingCta } from "@/components/ui/LandingCta";

export default function LandingPage() {
  return (
    <>
      <Header />

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center sm:px-8">
        <Reveal delay={0.1}>
          <p className="text-xs sm:text-sm tracking-[0.28em] uppercase text-clay">
            STK architecture
          </p>
        </Reveal>

        <Reveal delay={0.25}>
          <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-graphite">
            Apprendre Du Vivant
          </h1>
        </Reveal>

        <Reveal delay={0.45}>
          <div className="mx-auto mt-6 h-px w-24 bg-clay/40 sm:w-28" aria-hidden />
        </Reveal>

        <Reveal delay={0.6}>
          <p className="mt-8 max-w-md text-sm md:text-base text-ash leading-relaxed">
            Explorez les liens entre le vivant et les innovations humaines.
          </p>
        </Reveal>

        <Reveal delay={0.85}>
          <LandingCta href="/pseudo">Lancez l&apos;experience</LandingCta>
        </Reveal>
      </main>

      <Footer />
    </>
  );
}
