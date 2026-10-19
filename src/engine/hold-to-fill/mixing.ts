import type { LearningItem } from '../../types/learning';

/**
 * Mixing like paint, not like light. Averaging screen colours turns blue + yellow
 * into grey; real paint makes green. This uses the red-yellow-blue colour cube
 * (Gossett & Chen) for the colourful paints, then blends in white and black.
 *
 * Paint keys understood here: red, yellow, blue, white, black.
 */

export type Amounts = Record<string, number>;
type RGB = [number, number, number];

// Corners of the RYB cube: what you get with none/full of each of red, yellow, blue
const C000: RGB = [1, 1, 1]; //            nothing (white paper)
const C100: RGB = [1, 0, 0]; //            red
const C010: RGB = [1, 1, 0]; //            yellow
const C001: RGB = [0.163, 0.373, 0.6]; //  blue
const C110: RGB = [1, 0.5, 0]; //          red + yellow = orange
const C101: RGB = [0.5, 0, 0.5]; //        red + blue = purple
const C011: RGB = [0, 0.66, 0.2]; //       yellow + blue = green
const C111: RGB = [0.5, 0.3, 0.12]; //     all three = brown
const WHITE: RGB = [1, 1, 1];
const BLACK: RGB = [0.13, 0.13, 0.15];

function ryb(r: number, y: number, b: number): RGB {
  const out: RGB = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    out[i] =
      C000[i] * (1 - r) * (1 - y) * (1 - b) +
      C100[i] * r * (1 - y) * (1 - b) +
      C010[i] * (1 - r) * y * (1 - b) +
      C001[i] * (1 - r) * (1 - y) * b +
      C110[i] * r * y * (1 - b) +
      C101[i] * r * (1 - y) * b +
      C011[i] * (1 - r) * y * b +
      C111[i] * r * y * b;
  }
  return out;
}

const total = (a: Amounts) => Object.values(a).reduce((s, v) => s + v, 0);

/** The colour of the paint in the bucket */
export function mixColour(a: Amounts): string {
  const sum = total(a);
  if (sum <= 0) return '#e9ecef';
  const r = a.red ?? 0;
  const y = a.yellow ?? 0;
  const b = a.blue ?? 0;
  const colourful = r + y + b;
  const strongest = Math.max(r, y, b);
  const hue = strongest > 0 ? ryb(r / strongest, y / strongest, b / strongest) : WHITE;
  const parts: [RGB, number][] = [
    [hue, colourful / sum],
    [WHITE, (a.white ?? 0) / sum],
    [BLACK, (a.black ?? 0) / sum],
  ];
  const rgb = [0, 1, 2].map((i) => parts.reduce((s, [c, w]) => s + c[i] * w, 0));
  return `rgb(${rgb.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255)).join(',')})`;
}

/** Each paint's share of the bucket, 0..1 */
export function shares(a: Amounts): Amounts {
  const sum = total(a) || 1;
  return Object.fromEntries(Object.entries(a).map(([k, v]) => [k, v / sum]));
}

const recipeOf = (item: LearningItem): string[] => item.recipe ?? [item.key];

function recipeShares(item: LearningItem): Amounts {
  const keys = recipeOf(item);
  return Object.fromEntries(keys.map((k) => [k, 1 / keys.length]));
}

/** Which named colour is this mix closest to? */
export function nearestColour(a: Amounts, candidates: LearningItem[]): LearningItem {
  const mine = shares(a);
  let best = candidates[0];
  let bestDistance = Infinity;
  for (const item of candidates) {
    const theirs = recipeShares(item);
    const keys = new Set([...Object.keys(mine), ...Object.keys(theirs)]);
    let d = 0;
    keys.forEach((k) => (d += Math.abs((mine[k] ?? 0) - (theirs[k] ?? 0))));
    if (d < bestDistance) {
      bestDistance = d;
      best = item;
    }
  }
  return best;
}

/**
 * Did she make it? Generous on purpose: each paint in the recipe needs a fair
 * share (a quarter for two-paint colours), and only a dribble of anything else.
 */
export function checkRecipe(a: Amounts, target: LearningItem): { ok: boolean; missing?: string } {
  const mine = shares(a);
  const keys = recipeOf(target);
  const need = keys.length === 1 ? 0.85 : keys.length === 2 ? 0.25 : 0.15;
  const missing = keys.find((k) => (mine[k] ?? 0) < need);
  const extra = Object.entries(mine)
    .filter(([k]) => !keys.includes(k))
    .reduce((s, [, v]) => s + v, 0);
  return { ok: !missing && extra <= 0.12, missing };
}
