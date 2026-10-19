import type { Game } from '../../../types/learning';

/** Memory Match with shape cards (same mechanic as Numbers and Colours). */
const first = ['circle', 'square', 'triangle'];
const six = ['circle', 'square', 'triangle', 'rectangle', 'star', 'heart'];
const lots = [...six, 'oval', 'diamond', 'semicircle', 'pentagon', 'hexagon', 'octagon', 'crescent'];

export const memoryMatchShapes: Game = {
  id: 'memory-match',
  titleClip: 'memory.title',
  icon: '🃏',
  levels: [
    { id: '2x2', parentLabel: '2×2, with a peek', rounds: 3, activity: { kind: 'memory-match', pool: first, rows: 2, cols: 2, peekSeconds: 3 } },
    { id: '2x3', parentLabel: '2×3, with a peek', rounds: 3, activity: { kind: 'memory-match', pool: first, rows: 2, cols: 3, peekSeconds: 3 } },
    { id: '2x4', parentLabel: '2×4', rounds: 3, activity: { kind: 'memory-match', pool: six, rows: 2, cols: 4 } },
    { id: '3x4', parentLabel: '3×4', rounds: 2, activity: { kind: 'memory-match', pool: six, rows: 3, cols: 4 } },
    { id: '4x4', parentLabel: '4×4 + stinky pair', rounds: 2, activity: { kind: 'memory-match', pool: lots, rows: 4, cols: 4, stinkyPair: true } },
    { id: '5x6', parentLabel: '5×6 + stinky pair', rounds: 1, activity: { kind: 'memory-match', pool: lots, rows: 5, cols: 6, stinkyPair: true } },
  ],
};
