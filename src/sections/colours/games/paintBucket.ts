import type { Game } from '../../../types/learning';

/**
 * Paint Bucket: hold the right pipe, let go when the bucket shouts "Stop!".
 * Level 1 has one pipe, so it's only about stopping on cue.
 * Colour mixing (red + yellow = orange) comes later as its own levels.
 */
const primary = ['red', 'blue', 'yellow'];
const six = ['red', 'blue', 'yellow', 'green', 'orange', 'purple'];
const all = ['red', 'blue', 'yellow', 'green', 'orange', 'purple', 'pink', 'brown'];

export const paintBucketColours: Game = {
  id: 'paint-bucket',
  titleClip: 'paint.title',
  icon: '🪣',
  levels: [
    { id: 'one-pipe', parentLabel: 'One pipe: just stop on "Stop!"', rounds: 4, activity: { kind: 'hold-to-fill', pool: primary, pipes: 1, fillTo: 'full', fillSeconds: 6 } },
    { id: 'two-pipes', parentLabel: 'Two pipes: pick the colour', rounds: 5, activity: { kind: 'hold-to-fill', pool: primary, pipes: 2, fillTo: 'full', fillSeconds: 6 } },
    { id: 'three-pipes', parentLabel: 'Three pipes, six colours', rounds: 5, activity: { kind: 'hold-to-fill', pool: six, pipes: 3, fillTo: 'full', fillSeconds: 5 } },
    { id: 'four-pipes', parentLabel: 'Four pipes, all colours', rounds: 5, activity: { kind: 'hold-to-fill', pool: all, pipes: 4, fillTo: 'full', fillSeconds: 5 } },
    { id: 'half-way', parentLabel: 'Fill to the halfway line', rounds: 5, activity: { kind: 'hold-to-fill', pool: six, pipes: 3, fillTo: 'half', fillSeconds: 6 } },
  ],
};
