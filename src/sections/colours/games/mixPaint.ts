import type { Game } from '../../../types/learning';

/**
 * Mix the Colours: the paint bucket, but she makes new colours by pouring from
 * more than one pipe. The bucket's paint changes colour as it mixes.
 * Recipes live with the colours (items.tsx). Mixing is paint-like (RYB), so
 * blue + yellow really does turn green.
 */
const ryb = ['red', 'yellow', 'blue'];
const lightDark = ['red', 'blue', 'white', 'black'];
const allPaints = ['red', 'yellow', 'blue', 'white', 'black'];

export const mixPaintColours: Game = {
  id: 'mix-paint',
  titleClip: 'mix.title',
  icon: '🌈',
  levels: [
    {
      id: 'recipe-cards',
      parentLabel: 'Recipe cards: orange, green, purple (red + yellow shown)',
      rounds: 3,
      activity: { kind: 'hold-to-fill', mode: 'mix', pool: ['orange', 'green', 'purple'], paints: ryb, hints: true, pipes: 3, fillTo: 'full', fillSeconds: 6 },
    },
    {
      id: 'no-hints',
      parentLabel: 'Orange, green, purple without the recipe',
      rounds: 4,
      activity: { kind: 'hold-to-fill', mode: 'mix', pool: ['orange', 'green', 'purple'], paints: ryb, hints: false, pipes: 3, fillTo: 'full', fillSeconds: 6 },
    },
    {
      id: 'lighter-darker',
      parentLabel: 'Lighter and darker with white and black (pink, grey, light/dark blue)',
      rounds: 4,
      activity: { kind: 'hold-to-fill', mode: 'mix', pool: ['pink', 'grey', 'light-blue', 'dark-blue'], paints: lightDark, hints: true, pipes: 4, fillTo: 'full', fillSeconds: 6 },
    },
    {
      id: 'everything',
      parentLabel: 'Any mixed colour, all five paints, no recipe',
      rounds: 4,
      activity: {
        kind: 'hold-to-fill',
        mode: 'mix',
        pool: ['orange', 'green', 'purple', 'pink', 'grey', 'light-blue', 'brown'],
        paints: allPaints,
        hints: false,
        pipes: 5,
        fillTo: 'full',
        fillSeconds: 6,
      },
    },
    {
      id: 'lab',
      parentLabel: 'Mixing lab: free play, the bucket names what she made',
      rounds: 3,
      activity: { kind: 'hold-to-fill', mode: 'lab', pool: ['orange'], paints: allPaints, pipes: 5, fillTo: 'full', fillSeconds: 6 },
    },
  ],
};
