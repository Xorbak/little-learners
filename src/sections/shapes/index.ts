import type { Section } from '../../types/learning';
import { SHAPE_THINGS, shapeClips, shapeItems } from './shapes';
import { touchShape } from './games/touchShape';
import { popBalloonsShapes } from './games/popBalloons';
import { memoryMatchShapes } from './games/memoryMatch';
import { traceShape } from './games/traceShape';
import { matchItShapes } from './games/matchIt';
import { thingClips } from '../../shared/ui/faces';

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
    ...thingClips(SHAPE_THINGS),
    'shapes.match-title': 'Match the shape!',
    'shapes.match-find': 'Find something shaped like',
    'shapes.match-what-shape': 'What shape is the',
  },
  // Every subject has the same first games in the same order: Touch, Balloons, Match, Memory, then its own
  games: [touchShape, popBalloonsShapes, matchItShapes, memoryMatchShapes, traceShape],
};

export default shapes;
