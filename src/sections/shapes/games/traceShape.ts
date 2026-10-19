import type { Game } from '../../../types/learning';

/**
 * Trace the Shape: follow the dashed line round the shape. Done when the two
 * ends of her line meet; scored out of 10. Flat shapes only (3D ones aren't one outline).
 */
export const traceShape: Game = {
  id: 'trace-shape',
  titleClip: 'trace.title',
  icon: '✏️',
  levels: [
    { id: 'first', parentLabel: 'Circle, square, triangle', rounds: 3, activity: { kind: 'trace', pool: ['circle', 'square', 'triangle'] } },
    { id: 'next', parentLabel: 'Rectangle, oval, diamond, heart, half circle', rounds: 4, activity: { kind: 'trace', pool: ['rectangle', 'oval', 'diamond', 'heart', 'semicircle'] } },
    { id: 'corners', parentLabel: 'Star, pentagon, hexagon, octagon', rounds: 4, activity: { kind: 'trace', pool: ['star', 'pentagon', 'hexagon', 'octagon'] } },
    { id: 'tricky', parentLabel: 'Crescent moon, cross, trapezium, parallelogram', rounds: 4, activity: { kind: 'trace', pool: ['crescent', 'cross', 'trapezium', 'parallelogram'] } },
  ],
};
