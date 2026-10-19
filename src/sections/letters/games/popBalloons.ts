import type { Game } from '../../../types/learning';
import { lettersFor } from '../words';

/** Pop the Balloons with letters: "Pop all the sss!" Still balloons first. */
export const popBalloonsLetters: Game = {
  id: 'pop-balloons',
  titleClip: 'pop.title',
  icon: '🎈',
  levels: [
    { id: 'still-sat', parentLabel: 'Still balloons: s a t', rounds: 4, activity: { kind: 'pop-balloons', pool: lettersFor('sat'), targetsPerRound: 3, balloonsOnScreen: 5, riseSeconds: 14, still: true } },
    { id: 'still-satpin', parentLabel: 'Still balloons: s a t p i n', rounds: 5, activity: { kind: 'pop-balloons', pool: lettersFor('satpin'), targetsPerRound: 3, balloonsOnScreen: 6, riseSeconds: 13, still: true } },
    { id: 'float-satpin', parentLabel: 'Floating: s a t p i n', rounds: 5, activity: { kind: 'pop-balloons', pool: lettersFor('satpin'), targetsPerRound: 3, balloonsOnScreen: 6, riseSeconds: 13 } },
    { id: 'float-more', parentLabel: 'Floating: + m d g o c k', rounds: 6, activity: { kind: 'pop-balloons', pool: lettersFor('satpinmdgock'), targetsPerRound: 4, balloonsOnScreen: 7, riseSeconds: 12 } },
  ],
};
