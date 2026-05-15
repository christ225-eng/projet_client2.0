"use client";

import { motion, type MotionProps, type Variants } from "framer-motion";
import { fadeUp } from "@/lib/motion";

interface RevealProps extends MotionProps {
  as?: keyof typeof motion;
  children: React.ReactNode;
  className?: string;
  /** Skip mounting from the hidden state — useful for SSR-rendered hero content */
  immediate?: boolean;
  delay?: number;
  variants?: Variants;
}

/**
 * SSR-safe reveal primitive. When `immediate` is true the content renders
 * already-visible, avoiding the opacity:0-blocked-frame bug from the
 * previous prototype.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  immediate = false,
  variants = fadeUp,
  ...rest
}: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={immediate ? false : "hidden"}
      animate="visible"
      variants={variants}
      transition={{ delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
