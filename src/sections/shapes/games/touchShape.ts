import type { Game } from '../../../types/learning';

/**
 * Touch the Shape: "Touch the circle!" From the first three shapes to 3D solids.
 * Early levels: every shape the same colour and upright, so only the shape differs.
 * Later: colours, sizes and tilts change, so she learns what makes a shape that shape.
 */
const first = ['circle', 'square', 'triangle'];
const next = [...first, 'rectangle', 'star', 'heart'];
const more = [...next, 'oval', 'diamond', 'semicircle'];
const polygons = ['triangle', 'square', 'pentagon', 'hexagon', 'octagon', 'circle', 'crescent', 'oval'];
const tricky = ['square', 'rectangle', 'trapezium', 'parallelogram', 'diamond', 'cross', 'hexagon', 'octagon'];
const solids = ['sphere', 'cube', 'cylinder', 'cone', 'pyramid'];

export const touchShape: Game = {
  id: 'touch-shape',
  titleClip: 'touch.title',
  icon: '👆',
  levels: [
    { id: 'first-two', parentLabel: 'Circle, square, triangle: pick from 2', rounds: 5, activity: { kind: 'touch-it', pool: first, choices: 2, varied: 'none' } },
    { id: 'first-three', parentLabel: 'Circle, square, triangle: pick from 3', rounds: 5, activity: { kind: 'touch-it', pool: first, choices: 3, varied: 'none' } },
    { id: 'colours', parentLabel: 'Same three, different colours', rounds: 5, activity: { kind: 'touch-it', pool: first, choices: 3, varied: 'colour' } },
    { id: 'star-heart', parentLabel: '+ rectangle, star, heart', rounds: 6, activity: { kind: 'touch-it', pool: next, choices: 4, varied: 'colour' } },
    { id: 'oval-diamond', parentLabel: '+ oval, diamond, half circle (tilted, big and small)', rounds: 6, activity: { kind: 'touch-it', pool: more, choices: 4, varied: 'all' } },
    { id: 'polygons', parentLabel: 'Pentagon, hexagon, octagon, crescent moon', rounds: 6, activity: { kind: 'touch-it', pool: polygons, choices: 4, varied: 'all' } },
    { id: 'tricky', parentLabel: 'Look-alikes: rectangle, trapezium, parallelogram, diamond, cross', rounds: 6, activity: { kind: 'touch-it', pool: tricky, choices: 5, varied: 'all' } },
    { id: 'solids', parentLabel: '3D shapes: sphere, cube, cylinder, cone, pyramid', rounds: 6, activity: { kind: 'touch-it', pool: solids, choices: 4, varied: 'colour' } },
    { id: 'everything', parentLabel: 'Every shape, flat and 3D', rounds: 6, activity: { kind: 'touch-it', pool: [...more, 'pentagon', 'hexagon', 'octagon', 'crescent', 'trapezium', 'parallelogram', 'cross', ...solids], choices: 6, varied: 'all' } },
  ],
};
