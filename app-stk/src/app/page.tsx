import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/motion/Reveal";
import { LandingCta } from "@/components/ui/LandingCta";
import { Guide } from "@/components/ui/Guide";

export default function LandingPage() {
  return (
    <>
      <Header />

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center sm:px-8">
        <Reveal delay={0.05}>
          <Guide
            sizeClassName="h-28 w-28 sm:h-36 sm:w-36 md:h-44 md:w-44"
            priority
          />
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mt-6 text-xs sm:text-sm tracking-[0.28em] uppercase text-clay">
            STK architecture
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-graphite">
            Apprendre Du Vivant
          </h1>
        </Reveal>

        <Reveal delay={0.45}>
          <div className="mx-auto mt-6 h-px w-24 bg-clay/40 sm:w-28" aria-hidden />
        </Reveal>

        <Reveal delay={0.6}>
          <p className="mt-7 max-w-md text-sm md:text-base text-ash leading-relaxed">
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
