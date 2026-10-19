import type { Game } from '../../../types/learning';

/**
 * Pop the Balloons: number recognition.
 * Numbers are introduced a few at a time. Look-alike pairs (6/9, 2/5, 1/7)
 * are kept apart at first, then practised side by side in the last level.
 * The first levels keep the balloons still so she can learn to tap before they float.
 * Add a level by adding an entry to this list.
 */
export const popBalloonsNumbers: Game = {
  id: 'pop-balloons',
  titleClip: 'pop.title',
  icon: '🎈',
  levels: [
    {
      id: 'still-1-2-3',
      parentLabel: 'Still balloons: 1–3 (learn to tap)',
      rounds: 4,
      activity: { kind: 'pop-balloons', pool: ['1', '2', '3'], targetsPerRound: 3, balloonsOnScreen: 5, riseSeconds: 14, still: true },
    },
    {
      id: 'still-1-5',
      parentLabel: 'Still balloons: 1–5',
      rounds: 5,
      activity: { kind: 'pop-balloons', pool: ['1', '2', '3', '4', '5'], targetsPerRound: 3, balloonsOnScreen: 6, riseSeconds: 13, still: true },
    },
    {
      id: 'meet-1-2-3',
      parentLabel: 'Numbers 1–3',
      rounds: 4,
      activity: { kind: 'pop-balloons', pool: ['1', '2', '3'], targetsPerRound: 3, balloonsOnScreen: 5, riseSeconds: 14 },
    },
    {
      id: 'up-to-5',
      parentLabel: 'Numbers 1–5',
      rounds: 5,
      activity: { kind: 'pop-balloons', pool: ['1', '2', '3', '4', '5'], targetsPerRound: 3, balloonsOnScreen: 6, riseSeconds: 13 },
    },
    {
      id: 'up-to-7',
      parentLabel: 'Numbers 1–7 (no 9 yet)',
      rounds: 5,
      activity: { kind: 'pop-balloons', pool: ['1', '2', '3', '4', '5', '6', '7'], targetsPerRound: 3, balloonsOnScreen: 6, riseSeconds: 12 },
    },
    {
      id: 'up-to-10',
      parentLabel: 'Numbers 0–10',
      rounds: 6,
      activity: {
        kind: 'pop-balloons',
        pool: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        targetsPerRound: 4,
        balloonsOnScreen: 7,
        riseSeconds: 11,
      },
    },
    {
      id: 'look-alikes',
      parentLabel: 'Tricky look-alikes: 6/9, 2/5, 1/7',
      rounds: 6,
      activity: { kind: 'pop-balloons', pool: ['6', '9', '2', '5', '1', '7'], targetsPerRound: 4, balloonsOnScreen: 7, riseSeconds: 11 },
    },
  ],
};
