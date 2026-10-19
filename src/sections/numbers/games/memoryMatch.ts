import type { Game } from '../../../types/learning';

/**
 * Memory Match: turn over two cards, find two the same.
 * Small boards start with a peek at every card; bigger boards hide a bonus stinky pair.
 * Every board size is just a level entry, so adding a bigger one is one more line.
 * Rounds = boards to clear before the level counts as done (fewer as boards grow).
 */
const small = ['1', '2', '3', '4', '5'];
const all = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export const memoryMatchNumbers: Game = {
  id: 'memory-match',
  titleClip: 'memory.title',
  icon: '🃏',
  levels: [
    { id: '2x2', parentLabel: '2×2, with a peek (1–5)', rounds: 3, activity: { kind: 'memory-match', pool: small, rows: 2, cols: 2, peekSeconds: 3 } },
    { id: '2x3', parentLabel: '2×3, with a peek (1–5)', rounds: 3, activity: { kind: 'memory-match', pool: small, rows: 2, cols: 3, peekSeconds: 3 } },
    { id: '2x4', parentLabel: '2×4 (1–5)', rounds: 3, activity: { kind: 'memory-match', pool: small, rows: 2, cols: 4 } },
    { id: '3x4', parentLabel: '3×4 (0–10)', rounds: 2, activity: { kind: 'memory-match', pool: all, rows: 3, cols: 4 } },
    { id: '4x4', parentLabel: '4×4 + stinky pair', rounds: 2, activity: { kind: 'memory-match', pool: all, rows: 4, cols: 4, stinkyPair: true } },
    { id: '4x5', parentLabel: '4×5 + stinky pair', rounds: 1, activity: { kind: 'memory-match', pool: all, rows: 4, cols: 5, stinkyPair: true } },
    { id: '5x6', parentLabel: '5×6 + stinky pair', rounds: 1, activity: { kind: 'memory-match', pool: all, rows: 5, cols: 6, stinkyPair: true } },
    { id: '6x6', parentLabel: '6×6 + stinky pair', rounds: 1, activity: { kind: 'memory-match', pool: all, rows: 6, cols: 6, stinkyPair: true } },
  ],
};
