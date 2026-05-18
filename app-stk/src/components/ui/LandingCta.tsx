"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { LoadingTransition } from "@/components/motion/LoadingTransition";

interface LandingCtaProps {
  href: string;
  children: React.ReactNode;
  /** How long the loader stays visible before the route push (ms) */
  delayMs?: number;
}

/**
 * Landing-screen CTA that shows the premium loader for ~1.4s before
 * pushing to /pseudo. The loader sits on top of the landing content,
 * fades out at the same time the new route mounts so the player never
 * stares at a blank frame.
 */
export function LandingCta({ href, children, delayMs = 1400 }: LandingCtaProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleClick() {
    if (loading) return;
    setLoading(true);
    // Prefetch is implicit on Link; mirror it here to keep the navigation snappy.
    router.prefetch(href);
    window.setTimeout(() => {
      router.push(href);
    }, delayMs);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="mt-12 inline-flex h-12 items-center rounded-full bg-surface-elevated border border-mineral/60 px-8 text-sm font-medium text-graphite shadow-[var(--shadow-soft)] transition-all duration-[var(--duration-quick)] hover:bg-bone hover:border-clay/60 active:scale-[0.985] disabled:opacity-70 disabled:pointer-events-none"
      >
        {children}
      </button>

      <AnimatePresence>{loading ? <LoadingTransition /> : null}</AnimatePresence>
    </>
  );
}
