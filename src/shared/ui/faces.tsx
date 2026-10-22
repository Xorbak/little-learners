import type { CSSProperties } from 'react';
import type { Face } from '../../types/learning';
import './faces.css';

/**
 * Faces for Match It: other ways of showing an item (see LearningItem.faces).
 */

/** Things to count: the same one on every card in a round (the seed picks it) */
const COUNTERS = ['🍎', '⭐', '🐞', '🍓', '🐟', '🌸', '🧁', '🐥', '🦋', '🚗'];

/** Where the things sit (fractions of the card): dice patterns up to 6, then two rows of five */
function spots(n: number): [number, number][] {
  const L = 0.22;
  const C = 0.5;
  const R = 0.78;
  switch (n) {
    case 0:
      return [];
    case 1:
      return [[C, C]];
    case 2:
      return [[L, L], [R, R]];
    case 3:
      return [[L, L], [C, C], [R, R]];
    case 4:
      return [[L, L], [R, L], [L, R], [R, R]];
    case 5:
      return [[L, L], [R, L], [C, C], [L, R], [R, R]];
    case 6:
      return [[L, L], [R, L], [L, C], [R, C], [L, R], [R, R]];
    default: {
      // Like a ten-frame: fill the top row of five first
      const out: [number, number][] = [];
      for (let i = 0; i < n; i++) out.push([0.12 + (i % 5) * 0.19, i < 5 ? 0.33 : 0.67]);
      return out;
    }
  }
}

/** A group of n things, e.g. 🍎🍎🍎. `counting`: the first ones light up as they are counted. */
export function Amount({ n, size, emoji, counting = 0 }: { n: number; size: number; emoji: string; counting?: number }) {
  const big = n <= 6;
  const each = size * (big ? (n <= 4 ? 0.3 : 0.24) : 0.15);
  return (
    <span className="amount" style={{ width: size, height: size } as CSSProperties} aria-hidden="true">
      {n === 0 && <span className="amount-none" style={{ width: size * 0.5, height: size * 0.5 }} />}
      {spots(n).map(([x, y], i) => (
        <span
          key={i}
          className={`amount-thing ${i < counting ? 'amount-thing--counted' : ''}`}
          style={{ left: `${x * 100}%`, top: `${y * 100}%`, fontSize: each }}
        >
          {emoji}
          {i < counting && i === counting - 1 && <span className="amount-num">{i + 1}</span>}
        </span>
      ))}
    </span>
  );
}

/** Face: n things to count */
export const amountFace =
  (n: number): Face =>
  (seed) => {
    const emoji = COUNTERS[seed % COUNTERS.length];
    return { View: ({ size, counting }) => <Amount n={n} size={size} emoji={emoji} counting={counting} /> };
  };

/** A picture of a thing (an emoji), with what it's called */
export interface Thing {
  emoji: string;
  /** Clip with its name, e.g. 'things.banana' ("banana") */
  clip: string;
}

/** Face: one of these things (the seed picks which) */
export const thingFace =
  (things: Thing[]): Face =>
  (seed) => {
    const thing = things[seed % things.length];
    return {
      clip: thing.clip,
      View: ({ size }) => (
        <span className="thing" style={{ fontSize: size * 0.62 }} aria-hidden="true">
          {thing.emoji}
        </span>
      ),
    };
  };

/** Names of the things used on cards (registered by the sections that use them) */
export const thingClips = (list: Record<string, Thing[]>) =>
  Object.fromEntries(
    Object.values(list)
      .flat()
      .map((t) => [t.clip, t.clip.replace(/^things\./, '').replace(/-/g, ' ')]),
  );
