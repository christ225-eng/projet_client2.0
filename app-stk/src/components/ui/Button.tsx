"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

/**
 * Premium minimal black buttons. The default `primary` and the in-modal
 * `secondary` both render as a deep graphite/black pill with elegant
 * hover (subtle lift + ring) — keeps the whole experience cohesive.
 *
 * `ghost` and `outline` stay light for non-primary affordances (e.g.
 * dismissals, secondary inline actions).
 */
const variantClasses: Record<Variant, string> = {
  primary:
    "bg-graphite text-bone border border-graphite shadow-[0_2px_6px_rgba(0,0,0,0.18),0_12px_28px_rgba(0,0,0,0.18)] hover:bg-black hover:shadow-[0_4px_10px_rgba(0,0,0,0.22),0_18px_42px_rgba(0,0,0,0.25)]",
  secondary:
    "bg-graphite text-bone border border-graphite shadow-[0_2px_6px_rgba(0,0,0,0.22),0_12px_28px_rgba(0,0,0,0.22)] hover:bg-black hover:shadow-[0_4px_10px_rgba(0,0,0,0.28),0_18px_42px_rgba(0,0,0,0.3)]",
  ghost:
    "text-graphite hover:bg-graphite/10",
  outline:
    "bg-transparent text-graphite border border-graphite/80 hover:bg-graphite hover:text-bone",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-8 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "primary", size = "md", type = "button", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight",
          "transition-[background-color,box-shadow,transform,border-color] duration-[var(--duration-quick)] ease-[var(--ease-organic)]",
          "active:scale-[0.985] disabled:opacity-50 disabled:pointer-events-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-graphite/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bone",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);
