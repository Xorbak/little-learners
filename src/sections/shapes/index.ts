import type { Section } from '../../types/learning';
import { shapeClips, shapeItems } from './shapes';
import { touchShape } from './games/touchShape';
import { popBalloonsShapes } from './games/popBalloons';
import { memoryMatchShapes } from './games/memoryMatch';
import { traceShape } from './games/traceShape';

/**
 * Shapes: from circle, square and triangle up to hexagons, parallelograms and
 * 3D solids. Touch the Shape teaches the names; balloons and memory reuse them.
 */
const shapes: Section = {
  id: 'shapes',
  order: 3,
  titleClip: 'shapes.title',
  icon: '🔺',
  colour: '#38d9a9',
  items: shapeItems,
  clips: {
    'shapes.title': 'Shapes',
    ...shapeClips,
  },
  games: [touchShape, traceShape, popBalloonsShapes, memoryMatchShapes],
};

export default shapes;
