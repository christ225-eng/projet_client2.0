"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  // Maquette: white pill with subtle border + soft shadow — premium, not flashy
  primary:
    "bg-surface-elevated text-graphite border border-mineral/60 shadow-[var(--shadow-soft)] hover:bg-bone hover:border-clay/60",
  // Brand sand (#AEA287) — used for the main modal CTA "Valider"
  secondary:
    "bg-sand text-bone border border-sand hover:bg-clay hover:border-clay",
  ghost: "text-graphite hover:bg-fog/60",
  outline:
    "bg-transparent text-graphite border border-mineral/70 hover:border-clay hover:bg-bone/40",
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
          "transition-[background,border-color,color,transform] duration-[var(--duration-quick)] ease-[var(--ease-organic)]",
          "active:scale-[0.985] disabled:opacity-50 disabled:pointer-events-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bone",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);
