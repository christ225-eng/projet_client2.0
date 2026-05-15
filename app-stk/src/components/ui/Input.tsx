"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, type = "text", ...props }, ref) {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "h-12 w-full rounded-full bg-transparent px-6 text-base text-graphite",
          "placeholder:text-ash/70 outline-none",
          "transition-colors duration-[var(--duration-quick)]",
          "focus-visible:bg-bone/40",
          className,
        )}
        {...props}
      />
    );
  },
);
