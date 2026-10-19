import type { Game } from '../../../types/learning';

/** Touch the Number: "Touch the three!" Look-alikes (6/9, 2/5, 1/7) only meet in the last level. */
export const touchNumber: Game = {
  id: 'touch-number',
  titleClip: 'numbers.touch-title',
  icon: '👆',
  levels: [
    { id: '1-3-from-2', parentLabel: '1–3: pick from 2', rounds: 5, activity: { kind: 'touch-it', pool: ['1', '2', '3'], choices: 2, varied: 'none' } },
    { id: '1-3', parentLabel: '1–3: pick from 3', rounds: 5, activity: { kind: 'touch-it', pool: ['1', '2', '3'], choices: 3, varied: 'colour' } },
    { id: '1-5', parentLabel: '1–5', rounds: 6, activity: { kind: 'touch-it', pool: ['1', '2', '3', '4', '5'], choices: 4, varied: 'colour' } },
    { id: '0-10', parentLabel: '0–10 (9 waits for the look-alikes)', rounds: 6, activity: { kind: 'touch-it', pool: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '10'], choices: 4, varied: 'all' } },
    { id: 'look-alikes', parentLabel: 'Look-alikes: 6/9, 2/5, 1/7', rounds: 6, activity: { kind: 'touch-it', pool: ['6', '9', '2', '5', '1', '7'], choices: 4, varied: 'colour' } },
  ],
};
