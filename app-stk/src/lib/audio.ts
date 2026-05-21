"use client";

/**
 * STK audio identity — premium minimal, biomimicry-inspired.
 *
 * SCOPE — strictly event-driven, no ambient background loops, no UI clicks.
 *
 *   • playCorrect()      → bonne paire / fin de niveau   (correct.wav)
 *   • playWrong()        → mauvaise paire                (wrong.mp3)
 *   • playLeaderboardOpen() → ouverture du classement   (leaderboard.wav)
 *
 * The existing mute toggle (`isMuted` / `setMuted`) is preserved verbatim
 * so the AudioToggle UI keeps working unchanged.
 */

const MUTE_KEY = "stk-audio-muted";
const VOLUME_KEY = "stk-audio-volume";

const CUE_VOLUME = {
  correct: 0.65,
  wrong: 0.6,
  leaderboard: 0.55,
} as const;

interface SfxAsset {
  src: string;
  pool: HTMLAudioElement[];
  poolSize: number;
  nextIndex: number;
  volume: number;
}

const ASSETS: Record<"correct" | "wrong" | "leaderboard", SfxAsset> = {
  correct: makeAsset("/sounds/correct.wav", 3, CUE_VOLUME.correct),
  wrong: makeAsset("/sounds/wrong.mp3", 3, CUE_VOLUME.wrong),
  leaderboard: makeAsset("/sounds/leaderboard.wav", 1, CUE_VOLUME.leaderboard),
};

function makeAsset(src: string, poolSize: number, volume: number): SfxAsset {
  return { src, pool: [], poolSize, nextIndex: 0, volume };
}

function ensurePool(asset: SfxAsset) {
  if (typeof window === "undefined") return;
  if (asset.pool.length >= asset.poolSize) return;
  while (asset.pool.length < asset.poolSize) {
    const a = new Audio(asset.src);
    a.preload = "auto";
    a.volume = asset.volume;
    a.crossOrigin = "anonymous";
    asset.pool.push(a);
  }
}

/** Eagerly preload all SFX — call from a user-gesture handler. */
export function preloadAudio(): void {
  Object.values(ASSETS).forEach((asset) => {
    ensurePool(asset);
    asset.pool.forEach((a) => {
      try {
        a.load();
      } catch {
        // ignore — some browsers throw when load() is called repeatedly
      }
    });
  });
}

function playSfx(name: keyof typeof ASSETS) {
  if (typeof window === "undefined") return;
  if (isMuted()) return;
  const asset = ASSETS[name];
  ensurePool(asset);
  if (asset.pool.length === 0) return;

  const slot = asset.pool[asset.nextIndex % asset.pool.length]!;
  asset.nextIndex = (asset.nextIndex + 1) % asset.pool.length;
  try {
    slot.currentTime = 0;
    slot.volume = asset.volume * loadVolume();
    void slot.play().catch(() => undefined);
  } catch {
    // ignore
  }
}

// ── Public triggers ────────────────────────────────────────────────────────

export function playCorrect(): void {
  playSfx("correct");
}

export function playWrong(): void {
  playSfx("wrong");
}

export function playLeaderboardOpen(): void {
  playSfx("leaderboard");
}

/** Idempotent unlock — call from a user gesture to warm up the pool. */
export function unlockAudio(): void {
  preloadAudio();
}

// ── Mute + volume ──────────────────────────────────────────────────────────

export function isMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    // ignore
  }
  if (muted) {
    Object.values(ASSETS).forEach((asset) =>
      asset.pool.forEach((a) => {
        try {
          a.pause();
          a.currentTime = 0;
        } catch {
          // ignore
        }
      }),
    );
  }
}

function loadVolume(): number {
  if (typeof window === "undefined") return 0.7;
  if (isMuted()) return 0;
  try {
    const raw = window.localStorage.getItem(VOLUME_KEY);
    const v = raw === null ? 0.7 : Number(raw);
    if (!Number.isFinite(v)) return 0.7;
    return Math.min(1, Math.max(0, v));
  } catch {
    return 0.7;
  }
}
