import type { Game } from '../../../types/learning';
import { lettersFor } from '../words';

/** Memory Match with letter cards. */
export const memoryMatchLetters: Game = {
  id: 'memory-match',
  titleClip: 'memory.title',
  icon: '🃏',
  levels: [
    { id: '2x2', parentLabel: '2×2, with a peek', rounds: 3, activity: { kind: 'memory-match', pool: lettersFor('sat'), rows: 2, cols: 2, peekSeconds: 3 } },
    { id: '2x3', parentLabel: '2×3, with a peek', rounds: 3, activity: { kind: 'memory-match', pool: lettersFor('satpin'), rows: 2, cols: 3, peekSeconds: 3 } },
    { id: '2x4', parentLabel: '2×4', rounds: 3, activity: { kind: 'memory-match', pool: lettersFor('satpin'), rows: 2, cols: 4 } },
    { id: '3x4', parentLabel: '3×4', rounds: 2, activity: { kind: 'memory-match', pool: lettersFor('satpinmdgock'), rows: 3, cols: 4 } },
    { id: '4x4', parentLabel: '4×4 + stinky pair', rounds: 2, activity: { kind: 'memory-match', pool: lettersFor('satpinmdgockeurhbfl'), rows: 4, cols: 4, stinkyPair: true } },
  ],
};
