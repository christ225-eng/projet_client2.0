/**
 * Fisher-Yates shuffle. Returns a new array, leaves input untouched.
 * Used to randomise the Vivant row and Application row independently
 * so that columns never accidentally line up correct pairs.
 */
export function shuffle<T>(arr: readonly T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
