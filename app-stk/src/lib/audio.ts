"use client";

/**
 * STK audio identity — premium minimal, biomimicry-inspired, futuristic.
 *
 * Three uploaded references are the SOURCE OF TRUTH for the game's
 * emotional beats; the rest of the sonic identity is built around them:
 *
 *   • /sounds/correct.wav      — bonne paire / fin de niveau
 *   • /sounds/wrong.mp3        — mauvaise paire
 *   • /sounds/leaderboard.wav  — ouverture du leaderboard mondial
 *
 * Around those, a low-volume Web-Audio ambient pad breathes during
 * gameplay, and a barely-audible click pulse triggers on card selection
 * to keep the UI feeling responsive. No arcade, no cartoon — every voice
 * is gentle, slow, contemplative.
 *
 * The existing mute toggle (`isMuted` / `setMuted`) is preserved verbatim
 * so the existing AudioToggle component keeps working untouched.
 */

const MUTE_KEY = "stk-audio-muted";
const VOLUME_KEY = "stk-audio-volume";

// Per-cue master volume so the WAV references and the synth ambient share
// the same loudness language.
const CUE_VOLUME = {
  correct: 0.65,
  wrong: 0.6,
  leaderboard: 0.55,
  click: 0.18,
} as const;

interface SfxAsset {
  src: string;
  pool: HTMLAudioElement[];
  poolSize: number;
  nextIndex: number;
  volume: number;
}

const ASSETS: Record<"correct" | "wrong" | "leaderboard" | "click", SfxAsset> = {
  correct: makeAsset("/sounds/correct.wav", 3, CUE_VOLUME.correct),
  wrong: makeAsset("/sounds/wrong.mp3", 3, CUE_VOLUME.wrong),
  leaderboard: makeAsset("/sounds/leaderboard.wav", 1, CUE_VOLUME.leaderboard),
  click: makeAsset("", 4, CUE_VOLUME.click), // synth — no src
};

function makeAsset(src: string, poolSize: number, volume: number): SfxAsset {
  return { src, pool: [], poolSize, nextIndex: 0, volume };
}

function ensurePool(asset: SfxAsset) {
  if (typeof window === "undefined") return;
  if (!asset.src) return;
  if (asset.pool.length >= asset.poolSize) return;
  while (asset.pool.length < asset.poolSize) {
    const a = new Audio(asset.src);
    a.preload = "auto";
    a.volume = asset.volume;
    a.crossOrigin = "anonymous";
    asset.pool.push(a);
  }
}

/** Eagerly preload all sample assets — call from a user-gesture handler. */
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
  ensureRunning();
}

function playSfx(name: keyof typeof ASSETS) {
  if (typeof window === "undefined") return;
  if (isMuted()) return;
  const asset = ASSETS[name];
  if (!asset.src) return;
  ensurePool(asset);
  if (asset.pool.length === 0) return;

  const slot = asset.pool[asset.nextIndex % asset.pool.length]!;
  asset.nextIndex = (asset.nextIndex + 1) % asset.pool.length;
  try {
    slot.currentTime = 0;
    slot.volume = asset.volume * loadVolume();
    void slot.play().catch(() => undefined); // browsers may reject if no gesture yet
  } catch {
    // ignore
  }
}

// ── Web Audio: ambient pad + ui click ──────────────────────────────────────

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let ambientNodes: {
  osc: OscillatorNode[];
  gain: GainNode;
  lfo: OscillatorNode;
  lfoGain: GainNode;
} | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    masterGain = ctx.createGain();
    masterGain.gain.value = loadVolume();
    masterGain.connect(ctx.destination);
    return ctx;
  } catch {
    return null;
  }
}

function ensureRunning(): AudioContext | null {
  const c = getContext();
  if (!c) return null;
  if (c.state === "suspended") {
    c.resume().catch(() => undefined);
  }
  return c;
}

/** Tiny low-pass blip used on card selection. */
export function playClick(): void {
  if (isMuted()) return;
  const c = ensureRunning();
  if (!c || !masterGain) return;
  const now = c.currentTime;

  const gain = c.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(CUE_VOLUME.click, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 1800;
  lp.Q.value = 0.7;

  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.exponentialRampToValueAtTime(620, now + 0.16);

  osc.connect(lp).connect(gain).connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.22);
}

// ── Public sample triggers ─────────────────────────────────────────────────

export function playCorrect(): void {
  playSfx("correct");
}

export function playWrong(): void {
  playSfx("wrong");
}

export function playLevelComplete(): void {
  // Per spec: the "victoire" cue is the same WAV as bonne paire. Re-using
  // the same sample keeps the audio identity tight without overlapping
  // with a fresh chime that would step on the cue.
  playSfx("correct");
}

export function playLeaderboardOpen(): void {
  playSfx("leaderboard");
}

// ── Ambient drone ──────────────────────────────────────────────────────────

export function startAmbient(): void {
  const c = ensureRunning();
  if (!c || !masterGain || ambientNodes || isMuted()) return;

  const ambientGain = c.createGain();
  ambientGain.gain.setValueAtTime(0, c.currentTime);
  ambientGain.gain.linearRampToValueAtTime(0.06, c.currentTime + 2.5);
  ambientGain.connect(masterGain);

  const lfo = c.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.08;
  const lfoGain = c.createGain();
  lfoGain.gain.value = 0.025;
  lfo.connect(lfoGain).connect(ambientGain.gain);
  lfo.start();

  const freqs = [130.81, 196.0, 261.63, 392.0];
  const oscs = freqs.map((f, i) => {
    const o = c.createOscillator();
    o.type = i === 0 ? "sine" : i === 1 ? "triangle" : "sine";
    o.frequency.value = f;
    o.detune.value = (i - 1.5) * 4;
    return o;
  });

  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 1200;
  lp.Q.value = 0.3;

  oscs.forEach((o) => o.connect(lp));
  lp.connect(ambientGain);
  oscs.forEach((o) => o.start());

  ambientNodes = { osc: oscs, gain: ambientGain, lfo, lfoGain };
}

export function stopAmbient(): void {
  if (!ctx || !ambientNodes) return;
  const now = ctx.currentTime;
  const { osc, gain, lfo } = ambientNodes;
  try {
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.8);
    osc.forEach((o) => o.stop(now + 0.9));
    lfo.stop(now + 0.9);
  } catch {
    // ignore
  }
  ambientNodes = null;
}

/** Resume the context from a user gesture and warm up the sample pool. */
export function unlockAudio(): void {
  ensureRunning();
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
    stopAmbient();
    if (masterGain && ctx) masterGain.gain.setValueAtTime(0, ctx.currentTime);
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
  } else if (masterGain && ctx) {
    masterGain.gain.setValueAtTime(loadVolume(), ctx.currentTime);
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
