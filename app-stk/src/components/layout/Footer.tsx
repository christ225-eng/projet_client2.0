import { cn } from "@/lib/cn";

interface FooterProps {
  /** When true, render only the credit line (used on minimal screens) */
  minimal?: boolean;
  className?: string;
}

export function Footer({ minimal = false, className }: FooterProps) {
  return (
    <footer
      className={cn(
        "relative z-10 flex items-center justify-between px-8 py-6 md:px-12 md:py-8 text-xs text-ash",
        className,
      )}
    >
      <span className="tracking-wide">© STK architecture</span>

      {minimal ? null : (
        <nav className="flex items-center gap-6 md:gap-10">
          <a className="hover:text-graphite transition-colors" href="#">
            Mentions légales
          </a>
          <a className="hover:text-graphite transition-colors" href="#">
            Confidentialités
          </a>
          <a className="hover:text-graphite transition-colors" href="#">
            Contact
          </a>
        </nav>
      )}
    </footer>
  );
}
