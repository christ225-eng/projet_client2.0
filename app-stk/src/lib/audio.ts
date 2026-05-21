"use client";

/**
 * Self-contained audio engine for STK — Web Audio synthesis (no asset
 * files). Generates four signals:
 *
 *   • playCorrect()        — bright two-note chime (success)
 *   • playWrong()           — soft dampened minor third (error)
 *   • playLevelComplete()  — ascending arpeggio (celebration)
 *   • startAmbient() / stopAmbient() — slow organic drone (background loop)
 *
 * Browsers require a user gesture before audio can play. We lazily create
 * the AudioContext on the first invocation and resume it inside the
 * triggering event handler — so the very first sound is silent if it
 * happens before any click, but every subsequent call works.
 *
 * The engine respects a user-controlled mute flag persisted to
 * localStorage so the preference survives reloads.
 */

const MUTE_KEY = "stk-audio-muted";
const VOLUME_KEY = "stk-audio-volume";

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let ambientNodes: { osc: OscillatorNode[]; gain: GainNode; lfo: OscillatorNode; lfoGain: GainNode } | null =
  null;

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
    // Best-effort resume — only succeeds inside a user gesture
    c.resume().catch(() => undefined);
  }
  return c;
}

// ── Mute / volume preferences ──────────────────────────────────────────────

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
  } else if (masterGain && ctx) {
    masterGain.gain.setValueAtTime(loadVolume(), ctx.currentTime);
  }
}

function loadVolume(): number {
  if (typeof window === "undefined") return 0.6;
  if (isMuted()) return 0;
  try {
    const raw = window.localStorage.getItem(VOLUME_KEY);
    const v = raw === null ? 0.6 : Number(raw);
    if (!Number.isFinite(v)) return 0.6;
    return Math.min(1, Math.max(0, v));
  } catch {
    return 0.6;
  }
}

// ── One-shot effects ───────────────────────────────────────────────────────

/** Bright two-note major chime. */
export function playCorrect(): void {
  const c = ensureRunning();
  if (!c || !masterGain || isMuted()) return;

  const now = c.currentTime;
  playChime(c, masterGain, [659.25, 987.77], now, 0.28); // E5 → B5
}

/** Soft dampened minor third. */
export function playWrong(): void {
  const c = ensureRunning();
  if (!c || !masterGain || isMuted()) return;

  const now = c.currentTime;
  // A4 and the minor third — descending, low-passed, gentle
  const gain = c.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  filter.Q.value = 0.7;

  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(392, now); // G4
  osc.frequency.exponentialRampToValueAtTime(311, now + 0.45); // Eb4

  osc.connect(filter).connect(gain).connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.6);
}

/** Ascending arpeggio celebrating a level completion. */
export function playLevelComplete(): void {
  const c = ensureRunning();
  if (!c || !masterGain || isMuted()) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  const start = c.currentTime;
  notes.forEach((freq, i) => {
    playChime(c, masterGain!, [freq], start + i * 0.11, 0.22, 0.34);
  });
}

function playChime(
  c: AudioContext,
  out: GainNode,
  freqs: number[],
  startAt: number,
  duration = 0.3,
  peak = 0.28,
) {
  freqs.forEach((freq, i) => {
    const offset = i * 0.06;
    const t = startAt + offset;

    const gain = c.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(peak, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);

    // Add a soft harmonic for warmth
    const harm = c.createOscillator();
    harm.type = "triangle";
    harm.frequency.setValueAtTime(freq * 2, t);
    const harmGain = c.createGain();
    harmGain.gain.setValueAtTime(0, t);
    harmGain.gain.linearRampToValueAtTime(peak * 0.18, t + 0.012);
    harmGain.gain.exponentialRampToValueAtTime(0.0001, t + duration * 0.9);

    osc.connect(gain).connect(out);
    harm.connect(harmGain).connect(out);
    osc.start(t);
    harm.start(t);
    osc.stop(t + duration + 0.05);
    harm.stop(t + duration + 0.05);
  });
}

// ── Ambient background loop ────────────────────────────────────────────────

export function startAmbient(): void {
  const c = ensureRunning();
  if (!c || !masterGain || ambientNodes || isMuted()) return;

  const ambientGain = c.createGain();
  ambientGain.gain.setValueAtTime(0, c.currentTime);
  ambientGain.gain.linearRampToValueAtTime(0.08, c.currentTime + 2.5);
  ambientGain.connect(masterGain);

  // Slow LFO that modulates the ambient gain — gentle "breathing"
  const lfo = c.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.08; // very slow
  const lfoGain = c.createGain();
  lfoGain.gain.value = 0.03;
  lfo.connect(lfoGain).connect(ambientGain.gain);
  lfo.start();

  // Pad: a major-ninth voicing centered around C3 — quiet, low-passed
  const freqs = [130.81, 196.0, 261.63, 392.0]; // C3, G3, C4, G4
  const oscs = freqs.map((f, i) => {
    const o = c.createOscillator();
    o.type = i === 0 ? "sine" : i === 1 ? "triangle" : "sine";
    o.frequency.value = f;
    // tiny detune per voice for chorus
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
    // ignore — context might be closed
  }
  ambientNodes = null;
}

/** Force a context resume — call from a user gesture before kicking ambient. */
export function unlockAudio(): void {
  ensureRunning();
}
