import type { Game } from '../../../types/learning';

/** Pop the Balloons: the same mechanic as Numbers, with colours as the content. Still balloons first. */
export const popBalloonsColours: Game = {
  id: 'pop-balloons',
  titleClip: 'pop.title',
  icon: '🎈',
  levels: [
    {
      id: 'still-primary',
      parentLabel: 'Still balloons: red, blue, yellow (learn to tap)',
      rounds: 4,
      activity: { kind: 'pop-balloons', pool: ['red', 'blue', 'yellow'], targetsPerRound: 3, balloonsOnScreen: 5, riseSeconds: 14, still: true },
    },
    {
      id: 'still-six',
      parentLabel: 'Still balloons: six colours',
      rounds: 5,
      activity: {
        kind: 'pop-balloons',
        pool: ['red', 'blue', 'yellow', 'green', 'orange', 'purple'],
        targetsPerRound: 3,
        balloonsOnScreen: 6,
        riseSeconds: 13,
        still: true,
      },
    },
    {
      id: 'primary',
      parentLabel: 'Red, blue, yellow',
      rounds: 4,
      activity: { kind: 'pop-balloons', pool: ['red', 'blue', 'yellow'], targetsPerRound: 3, balloonsOnScreen: 5, riseSeconds: 14 },
    },
    {
      id: 'six-colours',
      parentLabel: '+ green, orange, purple',
      rounds: 5,
      activity: {
        kind: 'pop-balloons',
        pool: ['red', 'blue', 'yellow', 'green', 'orange', 'purple'],
        targetsPerRound: 3,
        balloonsOnScreen: 6,
        riseSeconds: 13,
      },
    },
    {
      id: 'all-colours',
      parentLabel: '+ pink, brown',
      rounds: 5,
      activity: {
        kind: 'pop-balloons',
        pool: ['red', 'blue', 'yellow', 'green', 'orange', 'purple', 'pink', 'brown'],
        targetsPerRound: 4,
        balloonsOnScreen: 7,
        riseSeconds: 12,
      },
    },
  ],
};
