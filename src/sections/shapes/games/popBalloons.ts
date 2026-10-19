import type { Game } from '../../../types/learning';

/** Pop the Balloons with shapes on them. Still balloons first, then floating. */
const first = ['circle', 'square', 'triangle'];
const six = ['circle', 'square', 'triangle', 'rectangle', 'star', 'heart'];

export const popBalloonsShapes: Game = {
  id: 'pop-balloons',
  titleClip: 'pop.title',
  icon: '🎈',
  levels: [
    { id: 'still-first', parentLabel: 'Still balloons: circle, square, triangle', rounds: 4, activity: { kind: 'pop-balloons', pool: first, targetsPerRound: 3, balloonsOnScreen: 5, riseSeconds: 14, still: true } },
    { id: 'still-six', parentLabel: 'Still balloons: six shapes', rounds: 5, activity: { kind: 'pop-balloons', pool: six, targetsPerRound: 3, balloonsOnScreen: 6, riseSeconds: 13, still: true } },
    { id: 'float-first', parentLabel: 'Floating: circle, square, triangle', rounds: 5, activity: { kind: 'pop-balloons', pool: first, targetsPerRound: 3, balloonsOnScreen: 6, riseSeconds: 13 } },
    { id: 'float-six', parentLabel: 'Floating: six shapes', rounds: 6, activity: { kind: 'pop-balloons', pool: six, targetsPerRound: 4, balloonsOnScreen: 7, riseSeconds: 12 } },
  ],
};
