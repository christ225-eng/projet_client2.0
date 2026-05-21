"use client";

import { useEffect, useState } from "react";
import { isMuted, setMuted, unlockAudio } from "@/lib/audio";
import { cn } from "@/lib/cn";

/**
 * Discreet mute toggle for the gameplay header. Reads the persisted
 * preference on mount so the icon reflects user choice across sessions.
 */
export function AudioToggle({ className }: { className?: string }) {
  const [muted, setLocalMuted] = useState(false);

  useEffect(() => {
    setLocalMuted(isMuted());
  }, []);

  function toggle() {
    const next = !muted;
    setLocalMuted(next);
    setMuted(next);
    if (!next) unlockAudio();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={muted ? "Activer le son" : "Couper le son"}
      aria-pressed={muted}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-full bg-bone/75 text-graphite backdrop-blur-sm border border-mineral/40 transition-colors hover:bg-bone sm:h-9 sm:w-9",
        className,
      )}
    >
      {muted ? <MutedIcon /> : <SoundIcon />}
    </button>
  );
}

function SoundIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 sm:h-[18px] sm:w-[18px]"
      aria-hidden
    >
      <path d="M4 9 v6 h4 l5 4 V5 L8 9 H4z" />
      <path d="M16 8.5 c1.5 1 1.5 6 0 7" />
      <path d="M18.5 6 c3 2.5 3 9.5 0 12" />
    </svg>
  );
}

function MutedIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 sm:h-[18px] sm:w-[18px]"
      aria-hidden
    >
      <path d="M4 9 v6 h4 l5 4 V5 L8 9 H4z" />
      <path d="M17 9 l5 6 M22 9 l-5 6" />
    </svg>
  );
}
