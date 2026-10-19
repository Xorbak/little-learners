import type { Game } from '../../../types/learning';

/** Memory Match with colour cards. Same ladder as Numbers; see numbers/games/memoryMatch.ts. */
const three = ['red', 'blue', 'yellow'];
const six = ['red', 'blue', 'yellow', 'green', 'orange', 'purple'];
const all = ['red', 'blue', 'yellow', 'green', 'orange', 'purple', 'pink', 'brown'];

export const memoryMatchColours: Game = {
  id: 'memory-match',
  titleClip: 'memory.title',
  icon: '🃏',
  levels: [
    { id: '2x2', parentLabel: '2×2, with a peek', rounds: 3, activity: { kind: 'memory-match', pool: three, rows: 2, cols: 2, peekSeconds: 3 } },
    { id: '2x3', parentLabel: '2×3, with a peek', rounds: 3, activity: { kind: 'memory-match', pool: three, rows: 2, cols: 3, peekSeconds: 3 } },
    { id: '2x4', parentLabel: '2×4', rounds: 3, activity: { kind: 'memory-match', pool: six, rows: 2, cols: 4 } },
    { id: '3x4', parentLabel: '3×4', rounds: 2, activity: { kind: 'memory-match', pool: six, rows: 3, cols: 4 } },
    { id: '4x4', parentLabel: '4×4 + stinky pair', rounds: 2, activity: { kind: 'memory-match', pool: all, rows: 4, cols: 4, stinkyPair: true } },
    { id: '4x5', parentLabel: '4×5 + stinky pair', rounds: 1, activity: { kind: 'memory-match', pool: all, rows: 4, cols: 5, stinkyPair: true } },
    { id: '5x6', parentLabel: '5×6 + stinky pair', rounds: 1, activity: { kind: 'memory-match', pool: all, rows: 5, cols: 6, stinkyPair: true } },
    { id: '6x6', parentLabel: '6×6 + stinky pair', rounds: 1, activity: { kind: 'memory-match', pool: all, rows: 6, cols: 6, stinkyPair: true } },
  ],
};
