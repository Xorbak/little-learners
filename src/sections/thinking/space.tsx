import type { Game, LearningItem, QuizAnswer } from '../../types/learning';
import { Balance, Glass, Pencil, PlaceScene, Pic, Tower, type Place } from '../../shared/ui/scenes';
import { orderItem, pickNew, pickOne, quizItem, shuffle } from '../../shared/quiz';

/**
 * Shape, space and measurement (NCF Exploring mathematics): where things are
 * (on, under, next to, in, behind, in front of), comparing (bigger, longer,
 * taller, full, heavier) and putting things in order of size.
 */

// ---------------------------------------------------------------------------
// Where is it?
// ---------------------------------------------------------------------------
const WHERE_THINGS = [
  { e: '🐱', clip: 'where.cat' },
  { e: '🐶', clip: 'where.dog' },
  { e: '🧸', clip: 'where.teddy' },
  { e: '⚽', clip: 'where.ball' },
  { e: '🐰', clip: 'where.bunny' },
  { e: '🦆', clip: 'where.duck' },
];
const TABLE_PLACES: Place[] = ['on', 'under', 'next-to'];
const BOX_PLACES: Place[] = ['in', 'behind', 'in-front'];

const whereIsIt = quizItem('q-where', (c) => {
  const allowed = (c.modes ?? ['on', 'under']) as Place[];
  const place = pickOne(allowed);
  const group = TABLE_PLACES.includes(place) ? TABLE_PLACES : BOX_PLACES;
  const object = group === TABLE_PLACES ? 'where.the-table' : 'where.the-box';
  const options = group.filter((p) => allowed.includes(p));
  const thing = pickNew('where-thing', WHERE_THINGS);
  const answers: QuizAnswer[] = options.map((p) => ({
    key: p,
    right: p === place,
    says: ['where.that-one-is', `where.${p}`, object],
    View: ({ size }) => <PlaceScene place={p} thing={thing.e} size={size} />,
  }));
  return {
    ask: ['where.touch-the', thing.clip, `where.${place}`, object],
    answers,
    yes: ['pick.yes', 'where.the', thing.clip, 'where.is', `where.${place}`, object],
  };
});

// ---------------------------------------------------------------------------
// Bigger or smaller?
// ---------------------------------------------------------------------------
const SIZE_THINGS = ['🐘', '🧸', '🍎', '🐶', '🌳', '🚗', '🏠', '🦒', '⭐', '🐟'];
const HEAVY_LIGHT: [string, string, string, string][] = [
  ['🐘', 'cmp.elephant', '🐭', 'cmp.mouse'],
  ['🍉', 'cmp.watermelon', '🍒', 'cmp.cherry'],
  ['🧱', 'cmp.brick', '🪶', 'cmp.feather'],
  ['🚗', 'cmp.car', '🎈', 'cmp.balloon'],
  ['🐻', 'cmp.bear', '🐝', 'cmp.bee'],
  ['🎃', 'cmp.pumpkin', '🍃', 'cmp.leaf'],
];

const compare = quizItem('q-compare', (c) => {
  const kind = pickOne(c.modes ?? ['bigger', 'smaller']);
  const three = (c.choices ?? 2) >= 3;
  const ids = ['a', 'b', 'c'];

  // Heavier or lighter: two things on a balance
  if (kind === 'heavier' || kind === 'lighter') {
    const [heavy, heavyClip, light, lightClip] = pickNew('heavy', HEAVY_LIGHT);
    const heavyLeft = Math.random() < 0.5;
    const want = kind === 'heavier';
    return {
      Scene: ({ width, height }) => <Balance left={heavyLeft ? heavy : light} right={heavyLeft ? light : heavy} heavier={heavyLeft ? 'left' : 'right'} width={width} height={height} />,
      ask: [want ? 'cmp.which-heavier' : 'cmp.which-lighter'],
      answers: [
        { key: 'heavy', clip: heavyClip, right: want, View: ({ size }) => <Pic e={heavy} size={size} /> },
        { key: 'light', clip: lightClip, right: !want, View: ({ size }) => <Pic e={light} size={size} /> },
      ],
      yes: ['pick.yes', 'cmp.the', want ? heavyClip : lightClip, 'cmp.is', want ? 'cmp.heavier' : 'cmp.lighter', 'cmp.balance-tips'],
    };
  }

  // The others: two (or three) of the same thing, one much bigger, longer, taller or fuller
  const sizes = three ? shuffle([0.42, 0.7, 1]) : shuffle([0.5, 1]);
  const most = sizes.indexOf(Math.max(...sizes));
  const least = sizes.indexOf(Math.min(...sizes));
  const wantMost = ['bigger', 'longer', 'taller', 'full'].includes(kind);
  const right = wantMost ? most : least;
  const emoji = pickOne(SIZE_THINGS);
  const word = `cmp.${kind}`;
  const opposite: Record<string, string> = { bigger: 'smaller', smaller: 'bigger', longer: 'shorter', shorter: 'longer', taller: 'shorter', short: 'taller', full: 'empty', empty: 'full' };
  const view = (s: number, i: number): QuizAnswer['View'] => {
    if (kind === 'longer' || kind === 'shorter') return ({ size }) => <Pencil length={0.35 + s * 0.6} size={size} colour={['#fcc419', '#ff8787', '#74c0fc'][i]} />;
    if (kind === 'taller' || kind === 'short') return ({ size }) => <Tower n={Math.round(2 + s * 6)} size={size} from={i * 3} />;
    if (kind === 'full' || kind === 'empty') return ({ size }) => <Glass level={s === 1 ? 0.92 : s >= 0.7 ? 0.5 : 0} size={size} drink={['#74c0fc', '#ffa94d', '#ff8787'][i % 3]} />;
    return ({ size }) => <Pic e={emoji} size={size} scale={s} />;
  };
  return {
    ask: [kind === 'full' ? 'cmp.which-full' : kind === 'empty' ? 'cmp.which-empty' : kind === 'short' ? 'cmp.which-shorter' : `cmp.which-${kind}`],
    answers: sizes.map((s, i) => ({ key: ids[i], right: i === right, says: i === right ? undefined : ['cmp.no-that-one-is', `cmp.${opposite[kind] ?? 'smaller'}`], View: view(s, i) })),
    fixedOrder: true,
    yes: ['pick.yes', 'cmp.that-one-is', kind === 'short' ? 'cmp.shorter' : word],
  };
});

// ---------------------------------------------------------------------------
// In order of size: smallest to biggest
// ---------------------------------------------------------------------------
const SIZE_SETS = ['🦆', '🧸', '🐘', '🍎', '⭐', '🏠', '🐻', '🌻'];
const sizeOrder: Record<string, LearningItem> = Object.fromEntries(
  SIZE_SETS.map((emoji, i) => [
    `size-${i}`,
    orderItem(`size-${i}`, {
      askClip: 'cmp.order-ask',
      by: 'size',
      doneClip: 'cmp.order-done',
      steps: [0.38, 0.55, 0.72, 0.88, 1.05].map((scale) => ({ emoji, scale, clip: 'cmp.size-step' })),
    }),
  ]),
);

export const spaceItems: Record<string, LearningItem> = { 'q-where': whereIsIt, 'q-compare': compare, ...sizeOrder };

export const spaceClips = {
  'think.where-title': 'Where is it?',
  'think.compare-title': 'Bigger or smaller?',
  'where.touch-the': 'Touch the',
  'where.cat': 'cat',
  'where.dog': 'dog',
  'where.teddy': 'teddy',
  'where.ball': 'ball',
  'where.bunny': 'bunny',
  'where.duck': 'duck',
  'where.on': 'on',
  'where.under': 'under',
  'where.next-to': 'next to',
  'where.in': 'in',
  'where.behind': 'behind',
  'where.in-front': 'in front of',
  'where.the-table': 'the table!',
  'where.the-box': 'the box!',
  'where.that-one-is': 'Oops! That one is',
  'where.the': 'The',
  'where.is': 'is',
  'cmp.which-bigger': 'Which one is bigger?',
  'cmp.which-smaller': 'Which one is smaller?',
  'cmp.which-longer': 'Which pencil is longer?',
  'cmp.which-shorter': 'Which one is shorter?',
  'cmp.which-taller': 'Which tower is taller?',
  'cmp.which-full': 'Which glass is full?',
  'cmp.which-empty': 'Which glass is empty?',
  'cmp.which-heavier': 'Which one is heavier?',
  'cmp.which-lighter': 'Which one is lighter?',
  'cmp.that-one-is': 'That one is',
  'cmp.no-that-one-is': 'Hmm, that one is',
  'cmp.bigger': 'bigger!',
  'cmp.smaller': 'smaller.',
  'cmp.longer': 'longer!',
  'cmp.shorter': 'shorter!',
  'cmp.taller': 'taller!',
  'cmp.full': 'full!',
  'cmp.empty': 'empty!',
  'cmp.heavier': 'heavier!',
  'cmp.lighter': 'lighter!',
  'cmp.the': 'The',
  'cmp.is': 'is',
  'cmp.balance-tips': 'The heavy side goes down.',
  'cmp.elephant': 'elephant',
  'cmp.mouse': 'mouse',
  'cmp.watermelon': 'watermelon',
  'cmp.cherry': 'cherry',
  'cmp.brick': 'brick',
  'cmp.feather': 'feather',
  'cmp.car': 'car',
  'cmp.balloon': 'balloon',
  'cmp.bear': 'bear',
  'cmp.bee': 'bee',
  'cmp.pumpkin': 'pumpkin',
  'cmp.leaf': 'leaf',
  'cmp.order-ask': 'Put them in order, from the smallest to the biggest!',
  'cmp.order-done': 'From small to big. Well done!',
  'cmp.size-step': 'this one',
};

export const whereGame: Game = {
  id: 'where-is-it',
  titleClip: 'think.where-title',
  icon: '📦',
  levels: [
    { id: 'on-under', parentLabel: 'On or under the table', rounds: 5, activity: { kind: 'pick-it', pool: ['q-where'], modes: ['on', 'under'] } },
    { id: 'next-to', parentLabel: 'On, under, next to', rounds: 6, activity: { kind: 'pick-it', pool: ['q-where'], modes: ['on', 'under', 'next-to'] } },
    { id: 'box', parentLabel: 'In, behind, in front of the box', rounds: 6, activity: { kind: 'pick-it', pool: ['q-where'], modes: ['in', 'behind', 'in-front'] } },
    { id: 'all', parentLabel: 'All six position words', rounds: 6, activity: { kind: 'pick-it', pool: ['q-where'], modes: ['on', 'under', 'next-to', 'in', 'behind', 'in-front'] } },
  ],
};

export const compareGame: Game = {
  id: 'compare',
  titleClip: 'think.compare-title',
  icon: '🐘',
  levels: [
    { id: 'big-small', parentLabel: 'Bigger or smaller (2 to pick from)', rounds: 5, activity: { kind: 'pick-it', pool: ['q-compare'], modes: ['bigger', 'smaller'] } },
    { id: 'long-tall', parentLabel: 'Longer, shorter, taller', rounds: 6, activity: { kind: 'pick-it', pool: ['q-compare'], modes: ['longer', 'shorter', 'taller', 'short'] } },
    { id: 'full-heavy', parentLabel: 'Full, empty, heavier, lighter', rounds: 6, activity: { kind: 'pick-it', pool: ['q-compare'], modes: ['full', 'empty', 'heavier', 'lighter'] } },
    { id: 'order-3', parentLabel: 'Put 3 in order of size', rounds: 3, activity: { kind: 'order', pool: Object.keys(sizeOrder), steps: 3 } },
    { id: 'mixed-3', parentLabel: 'All of them, 3 to pick from', rounds: 6, activity: { kind: 'pick-it', pool: ['q-compare'], choices: 3, modes: ['bigger', 'smaller', 'longer', 'shorter', 'taller', 'full', 'empty', 'heavier', 'lighter'] } },
    { id: 'order-5', parentLabel: 'Put 5 in order of size', rounds: 3, activity: { kind: 'order', pool: Object.keys(sizeOrder), steps: 5 } },
  ],
};
