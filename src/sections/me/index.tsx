import type { Game, LearningItem, Section, SortSet } from '../../types/learning';
import { EmojiPicture, emojiItems } from '../../shared/ui/emojiItems';
import { Pic } from '../../shared/ui/scenes';
import { orderItem, picAnswer, pickNew, quizItem, shuffle, simpleQuestions } from '../../shared/quiz';
import { ME_QUESTIONS } from '../../engine/about-me/AboutMe';

/**
 * All About Me (NCF Well-being and Identity): her own details, her family,
 * looking after herself (washing hands, brushing teeth, getting dressed),
 * healthy food, staying safe, what to do when…, and days we celebrate.
 */

// ---------------------------------------------------------------------------
// About me and my family
// ---------------------------------------------------------------------------
const meItems: Record<string, LearningItem> = Object.fromEntries(
  Object.keys(ME_QUESTIONS).map((k) => [k, { key: k, nameClip: ME_QUESTIONS[k].ask[0], pluralClip: ME_QUESTIONS[k].ask[0], track: false, Display: () => null }]),
);
const familyItem: LearningItem = { key: 'family', nameClip: 'me.family-title', pluralClip: 'me.family-title', track: false, Display: () => null };

// ---------------------------------------------------------------------------
// Routines, in order
// ---------------------------------------------------------------------------
const ROUTINES: Record<string, { ask: string; done: string; steps: [string, string][] }> = {
  hands: {
    ask: "Let's wash our hands! What do we do first?",
    done: 'Clean hands! Wash them before you eat, and after the toilet.',
    steps: [
      ['💧👐', 'Wet your hands.'],
      ['🧼', 'Put on some soap.'],
      ['🫧', 'Rub, rub, rub, while you sing a little song.'],
      ['💦', 'Rinse off the bubbles.'],
      ['🧻', 'Dry your hands.'],
    ],
  },
  teeth: {
    ask: "Time to brush your teeth! What do we do first?",
    done: 'Sparkly clean teeth! Brush them in the morning and before bed.',
    steps: [
      ['🪥', 'Put a little toothpaste on your toothbrush.'],
      ['😁', 'Brush all your teeth, round and round.'],
      ['👅', 'Brush your tongue too!'],
      ['💦', 'Spit it out.'],
      ['✨', 'All clean! Big smile!'],
    ],
  },
  dressed: {
    ask: "Let's get dressed! What do we put on first?",
    done: 'All dressed, all by yourself!',
    steps: [
      ['🩲', 'Put on your underpants.'],
      ['👕', 'Then your T-shirt.'],
      ['👖', 'Then your trousers.'],
      ['🧦', 'Then your socks.'],
      ['👟', 'And last, your shoes!'],
    ],
  },
  bedtime: {
    ask: "It's bedtime! What do we do first?",
    done: 'Night night! Sleep tight!',
    steps: [
      ['🛁', 'Have a bath.'],
      ['👚', 'Put on your pyjamas.'],
      ['🪥', 'Brush your teeth.'],
      ['📖', 'Read a story.'],
      ['😴', 'Go to sleep.'],
    ],
  },
  road: {
    ask: "Let's cross the road safely! What do we do first?",
    done: 'Safe! Always hold a grown-up’s hand when you cross the road.',
    steps: [
      ['🤝', 'Hold a grown-up’s hand.'],
      ['🛑', 'Stop at the side of the road.'],
      ['👀', 'Look both ways, and listen for cars.'],
      ['🚶', 'When no cars are coming, walk across.'],
    ],
  },
  sandwich: {
    ask: "Let's make a sandwich! What do we do first?",
    done: 'Yum! A sandwich you made yourself!',
    steps: [
      ['🧼', 'Wash your hands.'],
      ['🍞', 'Take two slices of bread.'],
      ['🧈', 'Spread on some butter.'],
      ['🧀', 'Put in some cheese.'],
      ['🥪', 'Put the bread on top. Done!'],
    ],
  },
};
const routineClips: Record<string, string> = {};
const routineItems: Record<string, LearningItem> = {};
for (const [key, r] of Object.entries(ROUTINES)) {
  routineClips[`me.r.${key}`] = r.ask;
  routineClips[`me.r.${key}.done`] = r.done;
  r.steps.forEach(([, words], i) => (routineClips[`me.r.${key}.${i}`] = words));
  routineItems[`routine-${key}`] = orderItem(`routine-${key}`, {
    askClip: `me.r.${key}`,
    doneClip: `me.r.${key}.done`,
    steps: r.steps.map(([emoji], i) => ({ emoji, clip: `me.r.${key}.${i}` })),
  });
}
const routineKeys = Object.keys(routineItems);

// ---------------------------------------------------------------------------
// Sorting: healthy food, plant or animal, safe or not
// ---------------------------------------------------------------------------
const sortSets: Record<string, SortSet> = {
  healthy: {
    askClip: 'me.sort.healthy',
    baskets: [
      { key: 'every', clip: 'me.basket.every', icon: '🥦', colour: '#b2f2bb' },
      { key: 'sometimes', clip: 'me.basket.sometimes', icon: '🍭', colour: '#ffd8a8' },
    ],
    pieces: [
      ...['🥦', '🍎', '🥕', '🍌', '🥛', '🐟', '🥚', '🍇', '🍞', '🍐', '🥒'].map((emoji) => ({ emoji, basket: 'every' })),
      ...['🍭', '🍩', '🍟', '🥤', '🍫', '🍰', '🍦', '🍪', '🍬'].map((emoji) => ({ emoji, basket: 'sometimes' })),
    ],
  },
  'plant-animal': {
    askClip: 'me.sort.plant-animal',
    baskets: [
      { key: 'plant', clip: 'me.basket.plant', icon: '🌱', colour: '#d3f9d8' },
      { key: 'animal', clip: 'me.basket.animal', icon: '🐄', colour: '#fff3bf' },
    ],
    pieces: [
      ...['🍎', '🥕', '🌽', '🍞', '🥔', '🍌', '🥜', '🍅'].map((emoji) => ({ emoji, basket: 'plant' })),
      ...['🥛', '🥚', '🧀', '🍗', '🐟', '🍯'].map((emoji) => ({ emoji, basket: 'animal' })),
    ],
  },
  safe: {
    askClip: 'me.sort.safe',
    baskets: [
      { key: 'safe', clip: 'me.basket.safe', icon: '🧸', colour: '#b2f2bb' },
      { key: 'danger', clip: 'me.basket.danger', icon: '✋', colour: '#ffc9c9' },
    ],
    pieces: [
      ...['🧸', '⚽', '📚', '🖍️', '🎈', '🧩', '🪀', '🧃'].map((emoji) => ({ emoji, basket: 'safe' })),
      ...['🔪', '🔥', '💊', '🔌', '🧪', '🕯️', '⚡', '🪒'].map((emoji) => ({ emoji, basket: 'danger' })),
    ],
  },
};
const sortItems: Record<string, LearningItem> = Object.fromEntries(
  Object.entries(sortSets).map(([key, set]) => [
    `sort-${key}`,
    { key: `sort-${key}`, nameClip: set.askClip, pluralClip: set.askClip, sortSet: set, track: false, Display: ({ size }: { size: number }) => <EmojiPicture emoji={set.baskets.map((b) => b.icon).join('')} size={size / 2} /> },
  ]),
);

// ---------------------------------------------------------------------------
// Where does it come from?
// ---------------------------------------------------------------------------
const SOURCES: [food: string, foodWords: string, from: string, fromWords: string][] = [
  ['🥛', 'Milk', '🐄', 'a cow'],
  ['🥚', 'An egg', '🐔', 'a hen'],
  ['🍯', 'Honey', '🐝', 'bees'],
  ['🍞', 'Bread', '🌾', 'wheat'],
  ['🧶', 'Wool', '🐑', 'a sheep'],
  ['🍎', 'An apple', '🌳', 'a tree'],
  ['🍟', 'Chips', '🥔', 'potatoes'],
  ['🧀', 'Cheese', '🐄', 'milk, from a cow'],
  ['🥜', 'Peanut butter', '🥜', 'peanuts'],
  ['🍫', 'Chocolate', '🫘', 'cocoa beans'],
  ['🍿', 'Popcorn', '🌽', 'mielies'],
];
const sourceClips: Record<string, string> = { 'me.where-from': 'Where does it come from?', 'me.comes-from': 'comes from' };
SOURCES.forEach(([, food, , from], i) => {
  sourceClips[`me.food.${i}`] = food;
  sourceClips[`me.from.${i}`] = from;
});
const whereFrom = quizItem('q-from', (c) => {
  const i = SOURCES.indexOf(pickNew('from', SOURCES));
  const [food, , from] = SOURCES[i];
  const others = shuffle(SOURCES.map((s, j) => [s[2], j] as const).filter(([e, j]) => j !== i && e !== from && e !== food))
    .filter(([e], k, all) => all.findIndex(([x]) => x === e) === k)
    .slice(0, (c.choices ?? 3) - 1);
  return {
    Scene: ({ width, height }) => <Pic e={food} size={Math.min(width, height)} />,
    ask: [`me.food.${i}`, 'me.where-from'],
    answers: [picAnswer('right', from, `me.from.${i}`, true), ...others.map(([e, j]) => picAnswer(`o${j}`, e, `me.from.${j}`))],
    yes: ['pick.yes', `me.food.${i}`, 'me.comes-from', `me.from.${i}`],
  };
});

// ---------------------------------------------------------------------------
// What should I do?
// ---------------------------------------------------------------------------
const { items: whatToDo, clips: whatClips } = simpleQuestions(
  'me.do',
  [
    { key: 'toy', scene: '🧒🏽🧸😠', ask: 'Your friend took your toy. What should you do?', answers: [['🙏', 'Ask nicely to have it back'], ['👊', 'Hit your friend'], ['😱', 'Scream and shout']], yes: 'Ask nicely. And if that doesn’t work, tell a grown-up.' },
    { key: 'cross', scene: '😠', ask: 'You feel very cross. What can you do?', answers: [['🌬️', 'Take big, slow breaths'], ['🧸💥', 'Throw your toys'], ['👊', 'Hit someone']], yes: 'Take big, slow breaths, and tell someone how you feel.' },
    { key: 'pills', scene: '💊', ask: 'You find some pills on the floor. What should you do?', answers: [['🧑🏽', 'Tell a grown-up'], ['👄', 'Eat them'], ['🫳', 'Play with them']], yes: 'Never eat pills. Tell a grown-up straight away.' },
    { key: 'stranger', scene: '🧔🍬', ask: 'Someone you don’t know offers you sweets, and says come with me. What do you do?', answers: [['🙅', 'Say no, and run to your grown-up'], ['🍬', 'Take the sweets'], ['🚶', 'Go with them']], yes: 'Say NO, and go straight to your grown-up.' },
    { key: 'lost', scene: '🏬😟', ask: 'You are lost in the shop. What do you do?', answers: [['👩🏾‍💼', 'Stay still, and ask someone who works there'], ['🏃', 'Run outside'], ['🙈', 'Hide']], yes: 'Stay where you are, and ask a shop helper. Tell them your name, and your grown-up’s phone number.' },
    { key: 'fell', scene: '🧒🏻😭', ask: 'Your friend fell down and is crying. What can you do?', answers: [['🤗', 'Help, and get a grown-up'], ['😂', 'Laugh'], ['🚶', 'Walk away']], yes: 'Be kind! Help your friend, and get a grown-up.' },
    { key: 'eat', scene: '🍽️', ask: 'It’s time to eat. What do you do first?', answers: [['🧼', 'Wash your hands'], ['🐶', 'Pat the dog'], ['📺', 'Watch TV']], yes: 'Wash your hands, to wash the germs away.' },
    { key: 'sneeze', scene: '🤧', ask: 'You need to sneeze! What do you do?', answers: [['💪', 'Sneeze into your elbow'], ['🧑🏽', 'Sneeze on your friend'], ['🍪', 'Sneeze on the food']], yes: 'Sneeze into your elbow, so the germs don’t spread.' },
    { key: 'tidy', scene: '🧸🧱🚗', ask: 'It’s tidy up time. What do you do?', answers: [['📦', 'Pack the toys away'], ['🏃', 'Run away'], ['📺', 'Watch TV']], yes: 'Pack them away. Tidy up, tidy up, everybody tidy up!' },
    { key: 'swing', scene: '🛝', ask: 'You want a turn on the swing, but your friend is on it. What do you do?', answers: [['⏳', 'Wait for your turn'], ['💢', 'Push your friend off'], ['😭', 'Cry and cry']], yes: 'Wait for your turn. Taking turns is fair!' },
    { key: 'fire', scene: '🔥🏠', ask: 'There is a fire! What do you do?', answers: [['🏃‍♀️', 'Get out fast, and shout for a grown-up'], ['🛏️', 'Hide under the bed'], ['🧸', 'Look for your toys']], yes: 'Get out fast, shout for a grown-up, and never go back inside.' },
    { key: 'dog', scene: '🐕', ask: 'A dog you don’t know comes up to you. What do you do?', answers: [['🧍', 'Stand still like a tree'], ['🤚', 'Pull its tail'], ['😱', 'Scream and run']], yes: 'Stand still like a tree, and let a grown-up help. Only pat a dog when its owner says you may.' },
    { key: 'sad-friend', scene: '🧒🏿😢', ask: 'Your friend is sad. What can you do?', answers: [['🤗', 'Give them a hug, or play with them'], ['😝', 'Pull a face at them'], ['🚶', 'Walk away']], yes: 'Be a good friend. Ask if they want a hug, or to play.' },
  ],
  { oops: ['me.do.hmm'] },
);
const safetyKeys = ['pills', 'stranger', 'lost', 'fire', 'dog'];
const kindKeys = ['toy', 'cross', 'fell', 'swing', 'sad-friend', 'tidy'];
const healthKeys = ['eat', 'sneeze'];

// ---------------------------------------------------------------------------
// Days we celebrate
// ---------------------------------------------------------------------------
const DAYS: [key: string, emoji: string, name: string, about: string][] = [
  ['birthday', '🎂', 'a birthday', 'On a birthday, we sing Happy Birthday, and blow out the candles!'],
  ['christmas', '🎄', 'Christmas', 'At Christmas, many families give presents, and eat a big meal together.'],
  ['diwali', '🪔', 'Diwali', 'Diwali is the festival of lights. Families light little lamps, and share sweets.'],
  ['eid', '🌙', 'Eid', 'At Eid, Muslim families dress up, visit each other, and share special food.'],
  ['easter', '🐣', 'Easter', 'At Easter, many families go to church, and some children hunt for chocolate eggs.'],
  ['new-year', '🎆', 'New Year', 'On New Year’s Eve, we stay up late and watch the fireworks!'],
  ['heritage', '🇿🇦', 'Heritage Day', 'On Heritage Day, South Africans celebrate where we come from, with braais, songs and special clothes.'],
  ['hanukkah', '🕎', 'Hanukkah', 'At Hanukkah, Jewish families light candles, one more every night, for eight nights.'],
  ['wedding', '💒', 'a wedding', 'At a wedding, two people get married, and everyone has a party.'],
  ['mothers-day', '💐', 'Mother’s Day', 'On Mother’s Day, we say thank you to our moms, and give them a big hug.'],
];
const dayClips: Record<string, string> = { 'me.which-is': 'Which one is' };
for (const [k, , name, about] of DAYS) {
  dayClips[`me.day.${k}`] = name;
  dayClips[`me.day.${k}.about`] = about;
}
const celebrate = quizItem('q-celebrate', (c) => {
  const [key, emoji] = pickNew('celebrate', DAYS);
  const others = shuffle(DAYS.filter(([k]) => k !== key)).slice(0, (c.choices ?? 3) - 1);
  return {
    ask: ['me.which-is', `me.day.${key}`],
    answers: [picAnswer(key, emoji, `me.day.${key}`, true), ...others.map(([k, e]) => picAnswer(k, e, `me.day.${k}`))],
    yes: ['pick.yes', `me.day.${key}.about`],
  };
});

// ---------------------------------------------------------------------------
// Take turns: Memory with a grown-up
// ---------------------------------------------------------------------------
const { items: cardItems, clips: cardClips } = emojiItems('me.card', [
  { key: 'dog', emoji: '🐶', name: 'dog' },
  { key: 'cat', emoji: '🐱', name: 'cat' },
  { key: 'frog', emoji: '🐸', name: 'frog' },
  { key: 'lion', emoji: '🦁', name: 'lion' },
  { key: 'monkey', emoji: '🐵', name: 'monkey' },
  { key: 'rabbit', emoji: '🐰', name: 'rabbit' },
  { key: 'panda', emoji: '🐼', name: 'panda' },
  { key: 'giraffe', emoji: '🦒', name: 'giraffe' },
]);
for (const item of Object.values(cardItems)) item.track = false;
const cards = Object.keys(cardItems);

// ---------------------------------------------------------------------------
// Games
// ---------------------------------------------------------------------------
const aboutMeGame: Game = {
  id: 'about-me',
  titleClip: 'me.about-title',
  icon: '🙋',
  levels: [
    { id: 'name', parentLabel: 'Her name and surname', rounds: 3, activity: { kind: 'about-me', pool: ['me-name', 'me-surname'] } },
    { id: 'age', parentLabel: '+ how old she is, and her birthday', rounds: 4, activity: { kind: 'about-me', pool: ['me-name', 'me-surname', 'me-age', 'me-birthday'] } },
    { id: 'town', parentLabel: '+ where she lives, her school', rounds: 4, activity: { kind: 'about-me', pool: ['me-name', 'me-age', 'me-town', 'me-school'] } },
    { id: 'address', parentLabel: '+ her street address', rounds: 4, activity: { kind: 'about-me', pool: ['me-surname', 'me-town', 'me-street', 'me-birthday'] } },
    { id: 'phone', parentLabel: '+ a grown-up’s phone number', rounds: 4, activity: { kind: 'about-me', pool: ['me-street', 'me-phone', 'me-surname', 'me-phone'] } },
  ],
};

const familyGame: Game = {
  id: 'family',
  titleClip: 'me.family-title',
  icon: '👨‍👩‍👧',
  levels: [
    { id: 'meet', parentLabel: 'Who is this? (one photo)', rounds: 3, activity: { kind: 'family', pool: ['family'], choices: 1 } },
    { id: 'two', parentLabel: 'Touch Mama! (2 photos)', rounds: 5, activity: { kind: 'family', pool: ['family'], choices: 2 } },
    { id: 'more', parentLabel: '3–4 photos', rounds: 6, activity: { kind: 'family', pool: ['family'], choices: 4 } },
  ],
};

const routinesGame: Game = {
  id: 'routines',
  titleClip: 'me.routines-title',
  icon: '🪥',
  levels: [
    { id: '3', parentLabel: 'Washing hands, teeth, getting dressed… (3 steps)', rounds: 3, activity: { kind: 'order', pool: routineKeys, steps: 3 } },
    { id: '4', parentLabel: '4 steps', rounds: 3, activity: { kind: 'order', pool: routineKeys, steps: 4 } },
    { id: '5', parentLabel: 'All the steps', rounds: 3, activity: { kind: 'order', pool: routineKeys } },
  ],
};

const foodGame: Game = {
  id: 'healthy-food',
  titleClip: 'me.food-title',
  icon: '🥦',
  levels: [
    { id: 'healthy', parentLabel: 'Sort: every day food or sometimes food', rounds: 2, activity: { kind: 'sort', pool: ['sort-healthy'], pieces: 8 } },
    { id: 'from', parentLabel: 'Where does it come from? (milk → cow)', rounds: 5, activity: { kind: 'pick-it', pool: ['q-from'], choices: 3 } },
    { id: 'plant-animal', parentLabel: 'Sort: from a plant or from an animal', rounds: 2, activity: { kind: 'sort', pool: ['sort-plant-animal'], pieces: 8 } },
    { id: 'from-4', parentLabel: 'Where does it come from? (4 to pick from)', rounds: 6, activity: { kind: 'pick-it', pool: ['q-from'], choices: 4 } },
  ],
};

const safeGame: Game = {
  id: 'safety',
  titleClip: 'me.safe-title',
  icon: '⚠️',
  levels: [
    { id: 'sort', parentLabel: 'Sort: safe to play with, or don’t touch', rounds: 2, activity: { kind: 'sort', pool: ['sort-safe'], pieces: 8 } },
    { id: 'what-to-do', parentLabel: 'Pills, strangers, getting lost, fire, dogs: what to do', rounds: 5, activity: { kind: 'pick-it', pool: safetyKeys } },
  ],
};

const whatGame: Game = {
  id: 'what-to-do',
  titleClip: 'me.what-title',
  icon: '🤔',
  levels: [
    { id: 'kind', parentLabel: 'Being kind, taking turns, feeling cross', rounds: 5, activity: { kind: 'pick-it', pool: kindKeys } },
    { id: 'all', parentLabel: '+ germs and staying safe', rounds: 6, activity: { kind: 'pick-it', pool: [...kindKeys, ...healthKeys, ...safetyKeys] } },
  ],
};

const celebrateGame: Game = {
  id: 'celebrate',
  titleClip: 'me.celebrate-title',
  icon: '🎉',
  levels: [
    { id: '2', parentLabel: 'Birthdays, Christmas, Diwali, Eid… (talk about the ones you celebrate)', rounds: 5, activity: { kind: 'pick-it', pool: ['q-celebrate'], choices: 2 } },
    { id: '3', parentLabel: '3 to pick from', rounds: 6, activity: { kind: 'pick-it', pool: ['q-celebrate'], choices: 3 } },
  ],
};

const turnsGame: Game = {
  id: 'take-turns',
  titleClip: 'me.turns-title',
  icon: '👫',
  levels: [
    { id: '2x3', parentLabel: 'Memory with a grown-up, taking turns: 2×3, with a peek', rounds: 2, activity: { kind: 'memory-match', pool: cards, rows: 2, cols: 3, peekSeconds: 3, turns: true } },
    { id: '2x4', parentLabel: 'Taking turns: 2×4', rounds: 2, activity: { kind: 'memory-match', pool: cards, rows: 2, cols: 4, turns: true } },
    { id: '3x4', parentLabel: 'Taking turns: 3×4', rounds: 2, activity: { kind: 'memory-match', pool: cards, rows: 3, cols: 4, turns: true } },
    { id: '4x4', parentLabel: 'Taking turns: 4×4 + stinky pair', rounds: 1, activity: { kind: 'memory-match', pool: cards, rows: 4, cols: 4, stinkyPair: true, turns: true } },
  ],
};

const me: Section = {
  id: 'me',
  order: 5.5,
  titleClip: 'me.title',
  icon: '🙋',
  colour: '#63e6be',
  items: { ...cardItems, ...meItems, family: familyItem, ...routineItems, ...sortItems, 'q-from': whereFrom, ...whatToDo, 'q-celebrate': celebrate },
  clips: {
    'me.title': 'All about me',
    'me.about-title': 'About me',
    'me.family-title': 'My family',
    'me.routines-title': 'Getting ready',
    'me.food-title': 'Healthy food',
    'me.safe-title': 'Safe or not?',
    'me.what-title': 'What should I do?',
    'me.celebrate-title': 'Days we celebrate',
    'me.turns-title': 'Take turns',
    ...cardClips,
    'me.do.hmm': 'Hmm, is that a good idea? Have another think!',
    'me.sort.healthy': 'Food we can eat every day goes in the green basket. Sometimes food, like sweets and chips, goes in the orange basket!',
    'me.sort.plant-animal': 'Does it come from a plant, or from an animal?',
    'me.sort.safe': 'Is it safe to play with? Or is it dangerous? Dangerous things go with the stop hand!',
    'me.basket.every': 'the every day basket',
    'me.basket.sometimes': 'the sometimes basket',
    'me.basket.plant': 'the plant basket',
    'me.basket.animal': 'the animal basket',
    'me.basket.safe': 'the safe basket',
    'me.basket.danger': "the don't touch basket",
    ...routineClips,
    ...sourceClips,
    ...whatClips,
    ...dayClips,
  },
  games: [aboutMeGame, familyGame, routinesGame, foodGame, safeGame, whatGame, turnsGame, celebrateGame],
  trackProgress: false,
};

export default me;
