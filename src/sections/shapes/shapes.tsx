import { thingFace, type Thing } from '../../shared/ui/faces';
import type { ReactNode } from 'react';
import type { LearningItem } from '../../types/learning';

/**
 * Every shape, from the first three to 3D solids. Each is drawn in a 100×100 box
 * filled with CSS currentColor, so games can recolour it (Plain), and also has
 * its own friendly colour (Display) for games like Memory Match.
 */

const regular = (sides: number, r = 46, cx = 50, cy = 50, turn = -90) =>
  Array.from({ length: sides }, (_, i) => {
    const a = ((turn + (360 / sides) * i) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');

const star = (() => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 47 : 20;
    const a = ((-90 + 36 * i) * Math.PI) / 180;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(1)},${(53 + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
})();

/** Shading laid over a 3D shape: light from the top left */
const light = 'rgba(255, 255, 255, 0.38)';
const shade = 'rgba(0, 0, 0, 0.22)';
const edge = { stroke: 'rgba(0, 0, 0, 0.28)', strokeWidth: 3, strokeLinejoin: 'round' as const };

export const shapeList: { key: string; name: string; plural: string; colour: string; draw: ReactNode }[] = [
  // The first three
  { key: 'circle', name: 'circle', plural: 'circles', colour: '#4dabf7', draw: <circle cx="50" cy="50" r="45" {...edge} /> },
  { key: 'square', name: 'square', plural: 'squares', colour: '#ff6b6b', draw: <rect x="8" y="8" width="84" height="84" rx="3" {...edge} /> },
  { key: 'triangle', name: 'triangle', plural: 'triangles', colour: '#69db7c', draw: <polygon points="50,7 95,90 5,90" {...edge} /> },
  // Next
  { key: 'rectangle', name: 'rectangle', plural: 'rectangles', colour: '#ffa94d', draw: <rect x="3" y="24" width="94" height="52" rx="3" {...edge} /> },
  { key: 'star', name: 'star', plural: 'stars', colour: '#fcc419', draw: <polygon points={star} {...edge} /> },
  {
    key: 'heart',
    name: 'heart',
    plural: 'hearts',
    colour: '#f06595',
    draw: <path d="M50 90 C22 70 4 52 4 32 C4 17 15 7 29 7 C39 7 46 13 50 21 C54 13 61 7 71 7 C85 7 96 17 96 32 C96 52 78 70 50 90 Z" {...edge} />,
  },
  { key: 'oval', name: 'oval', plural: 'ovals', colour: '#b197fc', draw: <ellipse cx="50" cy="50" rx="46" ry="30" {...edge} /> },
  { key: 'diamond', name: 'diamond', plural: 'diamonds', colour: '#38d9a9', draw: <polygon points="50,3 88,50 50,97 12,50" {...edge} /> },
  { key: 'semicircle', name: 'half circle', plural: 'half circles', colour: '#74c0fc', draw: <path d="M4 70 A46 46 0 0 1 96 70 Z" {...edge} /> },
  // Polygons and the moon
  { key: 'pentagon', name: 'pentagon', plural: 'pentagons', colour: '#ff8787', draw: <polygon points={regular(5, 47, 50, 53)} {...edge} /> },
  { key: 'hexagon', name: 'hexagon', plural: 'hexagons', colour: '#ffd43b', draw: <polygon points={regular(6, 47, 50, 50, 0)} {...edge} /> },
  { key: 'octagon', name: 'octagon', plural: 'octagons', colour: '#e03131', draw: <polygon points={regular(8, 47, 50, 50, -67.5)} {...edge} /> },
  { key: 'crescent', name: 'crescent moon', plural: 'crescent moons', colour: '#fab005', draw: <path d="M64 6 A45 45 0 1 0 64 94 A37 37 0 1 1 64 6 Z" {...edge} /> },
  // Trickier flat shapes
  { key: 'trapezium', name: 'trapezium', plural: 'trapeziums', colour: '#20c997', draw: <polygon points="28,22 72,22 97,80 3,80" {...edge} /> },
  { key: 'parallelogram', name: 'parallelogram', plural: 'parallelograms', colour: '#845ef7', draw: <polygon points="28,22 97,22 72,80 3,80" {...edge} /> },
  { key: 'cross', name: 'cross', plural: 'crosses', colour: '#f76707', draw: <path d="M35 5 H65 V35 H95 V65 H65 V95 H35 V65 H5 V35 H35 Z" {...edge} /> },
  // 3D shapes
  {
    key: 'sphere',
    name: 'sphere',
    plural: 'spheres',
    colour: '#339af0',
    draw: (
      <>
        {/* Same id in every sphere is fine: the definitions are identical */}
        <defs>
          <radialGradient id="shape-sphere-glow" cx="36%" cy="32%" r="72%">
            <stop offset="0" stopColor="#fff" stopOpacity="0.6" />
            <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.7" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.32" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="45" {...edge} />
        <circle cx="50" cy="50" r="45" fill="url(#shape-sphere-glow)" />
      </>
    ),
  },
  {
    key: 'cube',
    name: 'cube',
    plural: 'cubes',
    colour: '#ff922b',
    draw: (
      <>
        <polygon points="10,34 64,34 64,92 10,92" {...edge} />
        <polygon points="10,34 34,10 88,10 64,34" {...edge} />
        <polygon points="10,34 34,10 88,10 64,34" fill={light} />
        <polygon points="64,34 88,10 88,68 64,92" {...edge} />
        <polygon points="64,34 88,10 88,68 64,92" fill={shade} />
      </>
    ),
  },
  {
    key: 'cylinder',
    name: 'cylinder',
    plural: 'cylinders',
    colour: '#51cf66',
    draw: (
      <>
        <path d="M20 18 V82 A30 11 0 0 0 80 82 V18 Z" {...edge} />
        <path d="M58 18 V93 A30 11 0 0 0 80 82 V18 Z" fill={shade} />
        <ellipse cx="50" cy="18" rx="30" ry="11" {...edge} />
        <ellipse cx="50" cy="18" rx="30" ry="11" fill={light} />
      </>
    ),
  },
  {
    key: 'cone',
    name: 'cone',
    plural: 'cones',
    colour: '#f783ac',
    draw: (
      <>
        <path d="M50 5 L84 82 A34 12 0 0 1 16 82 Z" {...edge} />
        <path d="M50 5 L84 82 A34 12 0 0 1 58 93 Z" fill={shade} />
      </>
    ),
  },
  {
    key: 'pyramid',
    name: 'pyramid',
    plural: 'pyramids',
    colour: '#fcc419',
    draw: (
      <>
        <polygon points="50,5 8,80 56,94" {...edge} />
        <polygon points="50,5 8,80 56,94" fill={light} />
        <polygon points="50,5 56,94 93,74" {...edge} />
        <polygon points="50,5 56,94 93,74" fill={shade} />
      </>
    ),
  },
];

function ShapeSvg({ draw, size }: { draw: ReactNode; size: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="currentColor" aria-hidden="true" style={{ overflow: 'visible' }}>
      {draw}
    </svg>
  );
}

/** Everyday things with a clear shape, for Match It ("What shape is the clock?") */
export const SHAPE_THINGS: Record<string, Thing[]> = {
  circle: [
    { emoji: '🕐', clip: 'things.clock' },
    { emoji: '🍪', clip: 'things.biscuit' },
    { emoji: '🍩', clip: 'things.doughnut' },
  ],
  square: [
    { emoji: '🪟', clip: 'things.window' },
    { emoji: '🎁', clip: 'things.present' },
    { emoji: '🧇', clip: 'things.waffle' },
  ],
  triangle: [
    { emoji: '🍕', clip: 'things.pizza-slice' },
    { emoji: '⛺', clip: 'things.tent' },
    { emoji: '🧀', clip: 'things.cheese' },
  ],
  rectangle: [
    { emoji: '🚪', clip: 'things.door' },
    { emoji: '📱', clip: 'things.phone' },
    { emoji: '📺', clip: 'things.tv' },
  ],
  oval: [
    { emoji: '🥚', clip: 'things.egg' },
    { emoji: '🏉', clip: 'things.rugby-ball' },
  ],
  diamond: [{ emoji: '🪁', clip: 'things.kite' }],
};

export const shapeItems: Record<string, LearningItem> = Object.fromEntries(
  shapeList.map(({ key, colour, draw }) => [
    key,
    {
      key,
      nameClip: `shapes.name.${key}`,
      pluralClip: `shapes.plural.${key}`,
      Plain: ({ size }: { size: number }) => <ShapeSvg draw={draw} size={size} />,
      Display: ({ size }: { size: number }) => (
        <span style={{ color: colour, display: 'inline-flex' }}>
          <ShapeSvg draw={draw} size={size} />
        </span>
      ),
      // Match It: a thing that is this shape
      ...(SHAPE_THINGS[key] ? { faces: { thing: thingFace(SHAPE_THINGS[key]) } } : {}),
      // White shape on a balloon
      BalloonLabel: ({ size }: { size: number }) => (
        <span style={{ color: '#fff', display: 'inline-flex', filter: 'drop-shadow(0 2px 0 rgba(0,0,0,0.25))' }}>
          <ShapeSvg draw={draw} size={size * 0.85} />
        </span>
      ),
    } satisfies LearningItem,
  ]),
);

export const shapeClips = Object.fromEntries(
  shapeList.flatMap(({ key, name, plural }) => [
    [`shapes.name.${key}`, name],
    [`shapes.plural.${key}`, plural],
    [`shapes.a.${key}`, `${/^[aeiou]/.test(name) ? 'an' : 'a'} ${name}`],
  ]),
);
