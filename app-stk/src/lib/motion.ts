import type { Variants, Transition } from "framer-motion";

/**
 * Motion primitives — slow, organic, contemplative.
 * All variants are SSR-safe: when `initial={false}` is passed, no opacity-0
 * frame ever reaches the DOM, avoiding the blocked-render bug from the
 * previous prototype.
 */

export const easeOrganic = [0.22, 1, 0.36, 1] as const;
export const easeBreath = [0.4, 0, 0.2, 1] as const;

export const breath: Transition = {
  duration: 0.6,
  ease: easeOrganic,
};

export const slowBreath: Transition = {
  duration: 1.2,
  ease: easeOrganic,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: breath },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: breath },
};

export const scaleReveal: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: breath },
};

/** Staggered children — for revealing onboarding steps or card grids */
export const stagger = (delayChildren = 0.1, staggerChildren = 0.08) => ({
  visible: { transition: { delayChildren, staggerChildren } },
});
