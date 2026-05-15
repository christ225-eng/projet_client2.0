import Link from "next/link";
import { cn } from "@/lib/cn";

interface HeaderProps {
  /** Right-hand slot — e.g. level progress badge during gameplay */
  rightSlot?: React.ReactNode;
  /** Optional centre slot — search/info icon on the gameplay screen */
  centerSlot?: React.ReactNode;
  className?: string;
}

export function Header({ rightSlot, centerSlot, className }: HeaderProps) {
  return (
    <header
      className={cn(
        "relative z-10 flex items-center justify-between gap-2",
        "px-4 py-4 sm:px-8 sm:py-6 md:px-12 md:py-8",
        className,
      )}
    >
      <Link
        href="/"
        className="font-semibold tracking-[0.18em] text-graphite text-sm md:text-base hover:text-clay transition-colors"
      >
        STK
      </Link>

      {centerSlot ? (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {centerSlot}
        </div>
      ) : null}

      <div className="min-w-0 text-xs sm:text-sm text-ash">{rightSlot}</div>
    </header>
  );
}
