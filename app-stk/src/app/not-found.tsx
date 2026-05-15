import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 text-center">
        <p className="text-sm tracking-[0.28em] uppercase text-clay">404</p>
        <h1 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-graphite">
          Cette page n&apos;existe pas
        </h1>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center rounded-full bg-surface-elevated border border-mineral/60 px-6 text-sm font-medium text-graphite shadow-[var(--shadow-soft)] hover:bg-bone hover:border-clay/60"
        >
          Retour à l&apos;accueil
        </Link>
      </main>
      <Footer minimal />
    </>
  );
}
