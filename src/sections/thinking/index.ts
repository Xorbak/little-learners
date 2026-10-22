import type { Game, LearningItem, Section, SortSet } from '../../types/learning';
import { EmojiPicture, emojiItems } from '../../shared/ui/emojiItems';
import { createElement } from 'react';
import { picturesIn } from '../../shared/pictures';
import { compareGame, spaceClips, spaceItems, whereGame } from './space';
import { riddleClips, riddleGame, riddleItems } from './riddles';

/**
 * Thinking skills: sorting, patterns and odd one out.
 * Things are grouped (fruit, animals, things that go, clothes, toys) for odd-one-out
 * and patterns; sorting has its own sets of baskets below.
 */
const { items: things, clips: thingClips } = emojiItems(
  'think',
  [
    { key: 'apple', emoji: '🍎', name: 'apple', group: 'fruit' },
    { key: 'banana', emoji: '🍌', name: 'banana', group: 'fruit' },
    { key: 'grapes', emoji: '🍇', name: 'grapes', plural: 'grapes', group: 'fruit' },
    { key: 'strawberry', emoji: '🍓', name: 'strawberry', plural: 'strawberries', group: 'fruit' },
    { key: 'orange', emoji: '🍊', name: 'orange', group: 'fruit' },
    { key: 'pear', emoji: '🍐', name: 'pear', group: 'fruit' },
    { key: 'watermelon', emoji: '🍉', name: 'watermelon', group: 'fruit' },
    { key: 'dog', emoji: '🐶', name: 'dog', group: 'animals' },
    { key: 'cat', emoji: '🐱', name: 'cat', group: 'animals' },
    { key: 'cow', emoji: '🐮', name: 'cow', group: 'animals' },
    { key: 'pig', emoji: '🐷', name: 'pig', group: 'animals' },
    { key: 'rabbit', emoji: '🐰', name: 'rabbit', group: 'animals' },
    { key: 'frog', emoji: '🐸', name: 'frog', group: 'animals' },
    { key: 'lion', emoji: '🦁', name: 'lion', group: 'animals' },
    { key: 'car', emoji: '🚗', name: 'car', group: 'vehicles' },
    { key: 'bus', emoji: '🚌', name: 'bus', plural: 'buses', group: 'vehicles' },
    { key: 'train', emoji: '🚂', name: 'train', group: 'vehicles' },
    { key: 'plane', emoji: '✈️', name: 'aeroplane', group: 'vehicles' },
    { key: 'boat', emoji: '⛵', name: 'boat', group: 'vehicles' },
    { key: 'bike', emoji: '🚲', name: 'bike', group: 'vehicles' },
    { key: 'tractor', emoji: '🚜', name: 'tractor', group: 'vehicles' },
    { key: 'sock', emoji: '🧦', name: 'sock', group: 'clothes' },
    { key: 'shoe', emoji: '👟', name: 'shoe', group: 'clothes' },
    { key: 'dress', emoji: '👗', name: 'dress', plural: 'dresses', group: 'clothes' },
    { key: 'shirt', emoji: '👕', name: 'T-shirt', group: 'clothes' },
    { key: 'hat', emoji: '👒', name: 'hat', group: 'clothes' },
    { key: 'coat', emoji: '🧥', name: 'coat', group: 'clothes' },
    { key: 'ball', emoji: '⚽', name: 'ball', group: 'toys' },
    { key: 'teddy', emoji: '🧸', name: 'teddy', plural: 'teddies', group: 'toys' },
    { key: 'kite', emoji: '🪁', name: 'kite', group: 'toys' },
    { key: 'yoyo', emoji: '🪀', name: 'yo-yo', group: 'toys' },
    { key: 'doll', emoji: '🪆', name: 'doll', group: 'toys' },
    { key: 'blocks', emoji: '🧱', name: 'blocks', plural: 'blocks', group: 'toys' },
  ],
  { fruit: 'fruit', animals: 'animals', vehicles: 'things that go', clothes: 'clothes', toys: 'toys' },
);
for (const item of Object.values(things)) item.track = false;

const keysIn = (...groups: string[]) => Object.values(things).filter((i) => groups.includes(i.group!.key)).map((i) => i.key);

// ---------------------------------------------------------------------------
// Sorting sets
// ---------------------------------------------------------------------------
const sortSets: Record<string, SortSet> = {
  'red-blue': {
    askClip: 'sort.ask.red-blue',
    baskets: [
      { key: 'red', clip: 'sort.basket.red', icon: '❤️', colour: '#ff8787' },
      { key: 'blue', clip: 'sort.basket.blue', icon: '💙', colour: '#74c0fc' },
    ],
    pieces: [
      ...['🍎', '🍓', '🚗', '🐞', '🌹', '🍒'].map((emoji) => ({ emoji, basket: 'red' })),
      ...['🐳', '🧢', '💧', '🫐', '👖', '🦋'].map((emoji) => ({ emoji, basket: 'blue' })),
    ],
  },
  'big-small': {
    askClip: 'sort.ask.big-small',
    baskets: [
      { key: 'big', clip: 'sort.basket.big', icon: '🐘', scale: 1.3 },
      { key: 'small', clip: 'sort.basket.small', icon: '🐭', scale: 0.7 },
    ],
    pieces: ['🐶', '🍎', '🚗', '⚽', '🐱', '🌼', '🧸', '🍌'].flatMap((emoji) => [
      { emoji, basket: 'big', scale: 1.15 },
      { emoji, basket: 'small', scale: 0.55 },
    ]),
  },
  'animals-food': {
    askClip: 'sort.ask.animals-food',
    baskets: [
      { key: 'animals', clip: 'sort.basket.animals', icon: '🐾', colour: '#b2f2bb' },
      { key: 'food', clip: 'sort.basket.food', icon: '🍽️', colour: '#ffe8cc' },
    ],
    pieces: [
      ...['🐶', '🐱', '🐮', '🐷', '🐰', '🐸', '🐵'].map((emoji) => ({ emoji, basket: 'animals' })),
      ...['🍎', '🍌', '🍕', '🧀', '🥕', '🍪', '🍞'].map((emoji) => ({ emoji, basket: 'food' })),
    ],
  },
  'land-sea': {
    askClip: 'sort.ask.land-sea',
    baskets: [
      { key: 'land', clip: 'sort.basket.land', icon: '🌳', colour: '#c3fae8' },
      { key: 'sea', clip: 'sort.basket.sea', icon: '🌊', colour: '#a5d8ff' },
    ],
    pieces: [
      ...['🐶', '🐮', '🦁', '🐘', '🐴', '🐰'].map((emoji) => ({ emoji, basket: 'land' })),
      ...['🐟', '🐳', '🐙', '🦀', '🦈', '🐬'].map((emoji) => ({ emoji, basket: 'sea' })),
    ],
  },
  'three-colours': {
    askClip: 'sort.ask.three-colours',
    baskets: [
      { key: 'red', clip: 'sort.basket.red', icon: '❤️', colour: '#ff8787' },
      { key: 'blue', clip: 'sort.basket.blue', icon: '💙', colour: '#74c0fc' },
      { key: 'yellow', clip: 'sort.basket.yellow', icon: '💛', colour: '#ffe066' },
    ],
    pieces: [
      ...['🍎', '🍓', '🚗', '🐞', '🌹'].map((emoji) => ({ emoji, basket: 'red' })),
      ...['🐳', '🧢', '💧', '🫐', '👖'].map((emoji) => ({ emoji, basket: 'blue' })),
      ...['🍌', '🌻', '⭐', '🐤', '🧀'].map((emoji) => ({ emoji, basket: 'yellow' })),
    ],
  },
};

const sortItems: Record<string, LearningItem> = Object.fromEntries(
  Object.entries(sortSets).map(([key, set]) => [
    `sort-${key}`,
    {
      key: `sort-${key}`,
      nameClip: set.askClip,
      pluralClip: set.askClip,
      sortSet: set,
      track: false,
      Display: ({ size }: { size: number }) => createElement(EmojiPicture, { emoji: set.baskets.map((b) => b.icon).join(''), size: size / 2 }),
    },
  ]),
);

// ---------------------------------------------------------------------------
// Games
// ---------------------------------------------------------------------------
const sortGame: Game = {
  id: 'sort',
  titleClip: 'sort.title',
  icon: '🧺',
  levels: [
    { id: 'red-blue', parentLabel: 'Red and blue', rounds: 2, activity: { kind: 'sort', pool: ['sort-red-blue'], pieces: 6 } },
    { id: 'big-small', parentLabel: 'Big and little', rounds: 2, activity: { kind: 'sort', pool: ['sort-big-small'], pieces: 6 } },
    { id: 'animals-food', parentLabel: 'Animals and food', rounds: 2, activity: { kind: 'sort', pool: ['sort-animals-food'], pieces: 8 } },
    { id: 'land-sea', parentLabel: 'Land and sea animals', rounds: 2, activity: { kind: 'sort', pool: ['sort-land-sea'], pieces: 8 } },
    { id: 'three-colours', parentLabel: 'Red, blue and yellow', rounds: 2, activity: { kind: 'sort', pool: ['sort-three-colours'], pieces: 9 } },
    { id: 'mixed', parentLabel: 'All the sorting games', rounds: 3, activity: { kind: 'sort', pool: Object.keys(sortItems), pieces: 8 } },
  ],
};

const patternGame: Game = {
  id: 'pattern',
  titleClip: 'pattern.title',
  icon: '🔁',
  levels: [
    { id: 'ab-fruit', parentLabel: 'AB patterns (🍎🍌🍎🍌), 2 answers', rounds: 5, activity: { kind: 'pattern', pool: keysIn('fruit'), types: ['AB'], choices: 2 } },
    { id: 'ab', parentLabel: 'AB patterns, 3 answers', rounds: 5, activity: { kind: 'pattern', pool: keysIn('fruit', 'animals'), types: ['AB'], choices: 3 } },
    { id: 'aab-abb', parentLabel: 'AAB and ABB patterns', rounds: 6, activity: { kind: 'pattern', pool: keysIn('fruit', 'animals', 'toys'), types: ['AB', 'AAB', 'ABB'], choices: 3 } },
    { id: 'abc', parentLabel: 'ABC patterns', rounds: 6, activity: { kind: 'pattern', pool: keysIn('fruit', 'animals', 'vehicles', 'toys'), types: ['AB', 'AAB', 'ABB', 'ABC'], choices: 3 } },
  ],
};

/** Make your own pattern (free, but it has to repeat) */
const makeGame: Game = {
  id: 'make-pattern',
  titleClip: 'think.make-title',
  icon: '🍎',
  levels: [
    { id: 'two', parentLabel: 'Make a pattern with 2 things to choose from', rounds: 3, activity: { kind: 'make-pattern', pool: keysIn('fruit', 'animals'), choices: 2 } },
    { id: 'three', parentLabel: 'Make a pattern with 3 things to choose from', rounds: 3, activity: { kind: 'make-pattern', pool: keysIn('fruit', 'animals', 'toys'), choices: 3 } },
  ],
};

const oddGame: Game = {
  id: 'odd-one-out',
  titleClip: 'odd.title',
  icon: '🤔',
  levels: [
    { id: 'fruit-animals', parentLabel: 'Fruit and animals (very different)', rounds: 5, activity: { kind: 'odd-one-out', pool: keysIn('fruit', 'animals', 'vehicles'), choices: 4 } },
    { id: 'more', parentLabel: '+ clothes and toys', rounds: 6, activity: { kind: 'odd-one-out', pool: keysIn('fruit', 'animals', 'vehicles', 'clothes', 'toys'), choices: 4 } },
  ],
};

// ---------------------------------------------------------------------------
// Puzzles: every picture in src/pictures/puzzles/ becomes a puzzle
// ---------------------------------------------------------------------------
const puzzleItems: Record<string, LearningItem> = {};
const puzzleClips: Record<string, string> = {};
for (const { name, url } of picturesIn('puzzles')) {
  const key = `puzzle-${name}`;
  const words = name.replace(/[-_]+/g, ' ');
  puzzleClips[`puzzle.name.${name}`] = words;
  puzzleItems[key] = {
    key,
    nameClip: `puzzle.name.${name}`,
    pluralClip: `puzzle.name.${name}`,
    photo: url,
    track: false,
    Display: ({ size }: { size: number }) =>
      createElement('img', { src: url, alt: '', style: { width: size, height: size, objectFit: 'cover', borderRadius: 12 } }),
  };
}
const puzzles = Object.keys(puzzleItems);

const puzzleGame: Game = {
  id: 'puzzle',
  titleClip: 'puzzle.title',
  icon: '🧩',
  levels: [
    { id: '4', parentLabel: '4 pieces, picture shown faintly', rounds: 2, activity: { kind: 'jigsaw', pool: puzzles, cols: 2, rows: 2, ghost: true, choose: true } },
    { id: '6', parentLabel: '6 pieces, picture shown faintly', rounds: 2, activity: { kind: 'jigsaw', pool: puzzles, cols: 3, rows: 2, ghost: true, choose: true } },
    { id: '8', parentLabel: '8 pieces, picture shown faintly', rounds: 2, activity: { kind: 'jigsaw', pool: puzzles, cols: 4, rows: 2, ghost: true, choose: true } },
    { id: '12', parentLabel: '12 pieces, picture shown faintly', rounds: 1, activity: { kind: 'jigsaw', pool: puzzles, cols: 4, rows: 3, ghost: true, choose: true } },
    { id: '12-plain', parentLabel: '12 pieces, outlines only', rounds: 1, activity: { kind: 'jigsaw', pool: puzzles, cols: 4, rows: 3, ghost: false, choose: true } },
    { id: '15', parentLabel: '15 pieces', rounds: 1, activity: { kind: 'jigsaw', pool: puzzles, cols: 5, rows: 3, ghost: false, choose: true } },
    { id: '20', parentLabel: '20 pieces', rounds: 1, activity: { kind: 'jigsaw', pool: puzzles, cols: 5, rows: 4, ghost: false, choose: true } },
    { id: '24', parentLabel: '24 pieces', rounds: 1, activity: { kind: 'jigsaw', pool: puzzles, cols: 6, rows: 4, ghost: false, choose: true } },
  ],
};

/** Wait for It: waiting before tapping (for the excited tapper). Traffic light first, then go/no-go with the sleeping bear. */
const waitGame: Game = {
  id: 'wait-for-it',
  titleClip: 'think.wait-title',
  icon: '🚦',
  levels: [
    { id: 'green-light', parentLabel: 'Traffic light: short waits (1½–3 s), 4 hops', rounds: 2, activity: { kind: 'wait-for-it', pool: [], mode: 'light', wait: [1.5, 3], taps: 4 } },
    { id: 'longer', parentLabel: 'Traffic light: longer waits (3–6 s), 5 hops', rounds: 2, activity: { kind: 'wait-for-it', pool: [], mode: 'light', wait: [3, 6], taps: 5 } },
    { id: 'teases', parentLabel: 'Traffic light: amber sometimes goes back to red', rounds: 2, activity: { kind: 'wait-for-it', pool: [], mode: 'light', wait: [2, 5], taps: 5, teases: true } },
    { id: 'bear', parentLabel: "Bunnies, but don't wake the sleeping bear", rounds: 2, activity: { kind: 'wait-for-it', pool: [], mode: 'bear', wait: [0.8, 1.8], taps: 6, bearChance: 0.3 } },
    { id: 'bear-fast', parentLabel: 'Bunnies and bear, quicker, more bears', rounds: 2, activity: { kind: 'wait-for-it', pool: [], mode: 'bear', wait: [0.5, 1.2], taps: 8, bearChance: 0.4 } },
  ],
};

const thinking: Section = {
  id: 'thinking',
  order: 7,
  titleClip: 'think.title',
  icon: '🧩',
  colour: '#748ffc',
  items: { ...things, ...sortItems, ...puzzleItems, ...spaceItems, ...riddleItems },
  clips: {
    ...thingClips,
    ...puzzleClips,
    ...spaceClips,
    ...riddleClips,
    'think.make-title': 'Make a pattern',
    'think.title': 'Thinking',
    'think.wait-title': 'Wait for it!',
    'sort.ask.red-blue': 'Put the red things in the red basket, and the blue things in the blue basket!',
    'sort.ask.big-small': 'Big things go with the big elephant. Little things go with the little mouse!',
    'sort.ask.animals-food': 'Animals go in the paw basket. Food goes in the plate basket!',
    'sort.ask.land-sea': 'Who lives on land, and who lives in the sea?',
    'sort.ask.three-colours': 'Red things, blue things and yellow things. Put them in the right baskets!',
    'sort.basket.red': 'the red basket',
    'sort.basket.blue': 'the blue basket',
    'sort.basket.yellow': 'the yellow basket',
    'sort.basket.big': 'the big basket',
    'sort.basket.small': 'the little basket',
    'sort.basket.animals': 'the animal basket',
    'sort.basket.food': 'the food basket',
    'sort.basket.land': 'the land basket',
    'sort.basket.sea': 'the sea basket',
  },
  games: [...(puzzles.length ? [puzzleGame] : []), sortGame, patternGame, makeGame, oddGame, riddleGame, waitGame, whereGame, compareGame],
  trackProgress: false,
};

export default thinking;
