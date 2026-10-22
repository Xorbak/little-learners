import type { Game, LearningItem } from '../../types/learning';
import { Pic } from '../../shared/ui/scenes';
import { orderItem, picAnswer, pickNew, quizItem, shuffle, simpleQuestions } from '../../shared/quiz';

/**
 * More of the world (NCF Knowledge and understanding of the world): baby
 * animals and where animals live, people who help us, places, dressing for the
 * weather, our senses, what pets need, life cycles, and time (morning or night,
 * my day, growing up).
 */

const clips: Record<string, string> = {};

// ---------------------------------------------------------------------------
// Baby animals: "A baby cow is called a calf. Touch the calf!"
// ---------------------------------------------------------------------------
const BABIES: [key: string, mother: string, motherName: string, baby: string, babyName: string, babyScale: number][] = [
  ['cow', '🐄', 'cow', '🐄', 'calf', 0.55],
  ['sheep', '🐑', 'sheep', '🐑', 'lamb', 0.55],
  ['horse', '🐎', 'horse', '🐎', 'foal', 0.55],
  ['dog', '🐕', 'dog', '🐶', 'puppy', 0.6],
  ['cat', '🐈', 'cat', '🐱', 'kitten', 0.6],
  ['hen', '🐔', 'hen', '🐥', 'chick', 0.8],
  ['duck', '🦆', 'duck', '🦆', 'duckling', 0.5],
  ['pig', '🐖', 'pig', '🐷', 'piglet', 0.55],
  ['kangaroo', '🦘', 'kangaroo', '🦘', 'joey', 0.5],
  ['lion', '🦁', 'lion', '🦁', 'cub', 0.55],
  ['goat', '🐐', 'goat', '🐐', 'kid', 0.55],
  ['butterfly', '🦋', 'butterfly', '🐛', 'caterpillar', 0.8],
];
for (const [k, , mother, , baby] of BABIES) {
  clips[`wb.m.${k}`] = mother;
  clips[`wb.b.${k}`] = baby;
}
Object.assign(clips, { 'wb.a-baby': 'A baby', 'wb.is-called-a': 'is called a', 'wb.touch-the': 'Touch the', 'wb.oops-a': 'Oops! A', 'wb.is-a-baby': 'is a baby' });

const babyAnimals = quizItem('q-babies', (c) => {
  const pick = pickNew('baby', BABIES);
  const [key, mother, , baby, , scale] = pick;
  const others = shuffle(BABIES.filter((b) => b !== pick)).slice(0, (c.choices ?? 3) - 1);
  const teach = (c.modes ?? []).includes('teach');
  return {
    Scene: teach
      ? ({ width, height }) => (
          <span className="pic" style={{ fontSize: Math.min(height * 0.6, width * 0.3), whiteSpace: 'nowrap' }}>
            {mother}
            <span style={{ fontSize: `${scale}em` }}>{baby}</span>
          </span>
        )
      : undefined,
    tell: teach ? [['wb.a-baby', `wb.m.${key}`, 'wb.is-called-a', `wb.b.${key}`]] : undefined,
    ask: ['wb.touch-the', `wb.b.${key}`],
    answers: [pick, ...others].map(([k, , , e, , s]) => ({ ...picAnswer(k, e, `wb.b.${k}`, k === key, s * 1.4), says: ['wb.oops-a', `wb.b.${k}`, 'wb.is-a-baby', `wb.m.${k}`] })),
    yes: ['pick.yes', 'wb.a-baby', `wb.m.${key}`, 'wb.is-called-a', `wb.b.${key}`],
  };
});

// ---------------------------------------------------------------------------
// Where do animals live?
// ---------------------------------------------------------------------------
const HOMES: [animal: string, animalName: string, home: string, homeName: string][] = [
  ['🐦', 'bird', '🪺', 'in a nest'],
  ['🕷️', 'spider', '🕸️', 'in a web'],
  ['🐟', 'fish', '🌊', 'in the water'],
  ['🐒', 'monkey', '🌴', 'in the trees'],
  ['🐰', 'rabbit', '🕳️', 'in a burrow, under the ground'],
  ['🐝', 'bee', '🍯', 'in a beehive'],
  ['🐌', 'snail', '🐚', 'in its shell'],
  ['🐧', 'penguin', '🧊', 'on the ice'],
  ['🐻', 'bear', '🪨', 'in a cave'],
  ['🐄', 'cow', '🚜', 'on a farm'],
  ['🐫', 'camel', '🏜️', 'in the desert'],
  ['🐸', 'frog', '💧', 'in a pond'],
];
HOMES.forEach(([, a, , h], i) => {
  clips[`wh.a.${i}`] = a;
  clips[`wh.h.${i}`] = h;
});
Object.assign(clips, { 'wh.where-does': 'Where does a', 'wh.live': 'live?', 'wh.lives': 'lives', 'wh.yes-a': 'Yes! A' });
const animalHomes = quizItem('q-homes', (c) => {
  const pick = pickNew('home', HOMES);
  const i = HOMES.indexOf(pick);
  const others = shuffle(HOMES.filter((h) => h !== pick)).slice(0, (c.choices ?? 3) - 1);
  return {
    Scene: ({ width, height }) => <Pic e={pick[0]} size={Math.min(width, height)} />,
    ask: ['wh.where-does', `wh.a.${i}`, 'wh.live'],
    answers: [pick, ...others].map((h) => picAnswer(`h${HOMES.indexOf(h)}`, h[2], `wh.h.${HOMES.indexOf(h)}`, h === pick)),
    yes: ['wh.yes-a', `wh.a.${i}`, 'wh.lives', `wh.h.${i}`],
  };
});

// ---------------------------------------------------------------------------
// Who helps us? (people with lots of different skin tones), and what they use
// ---------------------------------------------------------------------------
const HELPERS: [key: string, person: string, name: string, does: string, tool: string, toolName: string][] = [
  ['doctor', '🧑🏾‍⚕️', 'a doctor', 'helps us when we are sick?', '🩺', 'a stethoscope, to listen to your heart'],
  ['firefighter', '🧑🏽‍🚒', 'a firefighter', 'puts out fires?', '🚒', 'a fire engine'],
  ['police', '👮🏿‍♀️', 'a police officer', 'keeps us safe, and helps when we are lost?', '🚓', 'a police car'],
  ['teacher', '🧑🏻‍🏫', 'a teacher', 'helps us learn at school?', '📚', 'books'],
  ['farmer', '🧑🏾‍🌾', 'a farmer', 'grows our food?', '🚜', 'a tractor'],
  ['cook', '👩🏽‍🍳', 'a cook', 'makes food in a restaurant?', '🍳', 'a frying pan'],
  ['builder', '👷🏾‍♂️', 'a builder', 'builds houses?', '🧱', 'bricks'],
  ['mechanic', '🧑🏿‍🔧', 'a mechanic', 'fixes cars?', '🔧', 'a spanner'],
  ['pilot', '🧑🏼‍✈️', 'a pilot', 'flies an aeroplane?', '✈️', 'an aeroplane'],
  ['vet', '👩🏻‍⚕️', 'a vet', 'looks after sick animals?', '🐶', 'animals'],
  ['hairdresser', '💇🏽', 'a hairdresser', 'cuts our hair?', '✂️', 'scissors'],
  ['post', '🧑🏾‍💼', 'a post person', 'brings letters and parcels?', '✉️', 'letters'],
];
for (const [k, , name, does, , toolName] of HELPERS) {
  clips[`help.n.${k}`] = name;
  clips[`help.d.${k}`] = does;
  clips[`help.t.${k}`] = toolName;
}
Object.assign(clips, { 'help.who': 'Who', 'help.uses': 'What does', 'help.use': 'use?', 'help.yes-it-is': "Yes! It's", 'help.uses-a': 'uses' });
const whoHelps = quizItem('q-helpers', (c) => {
  const tools = (c.modes ?? []).includes('tools');
  const pick = pickNew('helper', HELPERS);
  const [key, person, , , tool] = pick;
  const others = shuffle(HELPERS.filter((h) => h !== pick)).slice(0, (c.choices ?? 3) - 1);
  if (tools) {
    return {
      Scene: ({ width, height }) => <Pic e={person} size={Math.min(width, height)} />,
      ask: ['help.uses', `help.n.${key}`, 'help.use'],
      answers: [pick, ...others].map(([k, , , , t]) => picAnswer(k, t, `help.t.${k}`, k === key)),
      yes: ['pick.yes', `help.n.${key}`, 'help.uses-a', `help.t.${key}`],
    };
  }
  return {
    Scene: ({ width, height }) => <Pic e={tool} size={Math.min(width, height) * 0.8} />,
    ask: ['help.who', `help.d.${key}`],
    answers: [pick, ...others].map(([k, p]) => picAnswer(k, p, `help.n.${k}`, k === key)),
    yes: ['help.yes-it-is', `help.n.${key}`],
  };
});

// ---------------------------------------------------------------------------
// Places, dressing for the weather, senses, pets, morning or night
// ---------------------------------------------------------------------------
const { items: placeItems, clips: placeClips } = simpleQuestions('wp', [
  { key: 'shop', scene: '🛒', ask: 'Where do we go to buy food?', answers: [['🏪', 'the shop'], ['🏥', 'the hospital'], ['🏫', 'school']], yes: 'The shop!' },
  { key: 'hospital', scene: '🤒', ask: 'Where do we go when we are very sick?', answers: [['🏥', 'the hospital'], ['🏖️', 'the beach'], ['🏪', 'the shop']], yes: 'The hospital, where doctors and nurses help us.' },
  { key: 'beach', scene: '🏊', ask: 'Where do we swim in the sea, and build sandcastles?', answers: [['🏖️', 'the beach'], ['🏫', 'school'], ['⛽', 'the petrol station']], yes: 'The beach!' },
  { key: 'school', scene: '🎒', ask: 'Where do we go to learn and play with friends?', answers: [['🏫', 'school'], ['🏥', 'the hospital'], ['🛫', 'the airport']], yes: 'School!' },
  { key: 'petrol', scene: '🚗', ask: 'Where do we fill the car with petrol?', answers: [['⛽', 'the petrol station'], ['🏠', 'home'], ['🏖️', 'the beach']], yes: 'The petrol station!' },
  { key: 'airport', scene: '✈️', ask: 'Where do we go to get on an aeroplane?', answers: [['🛫', 'the airport'], ['🏪', 'the shop'], ['🛝', 'the park']], yes: 'The airport!' },
  { key: 'home', scene: '🛏️', ask: 'Where do we sleep at night?', answers: [['🏠', 'at home'], ['⛽', 'the petrol station'], ['🏫', 'school']], yes: 'At home, in our beds.' },
  { key: 'park', scene: '🛝', ask: 'Where can we play on the swings and slides?', answers: [['🏞️', 'the park'], ['🏥', 'the hospital'], ['🏦', 'the bank']], yes: 'The park!' },
  { key: 'library', scene: '📚', ask: 'Where can we borrow books?', answers: [['🏛️', 'the library'], ['⛽', 'the petrol station'], ['🏖️', 'the beach']], yes: 'The library!' },
  { key: 'farm', scene: '🐄', ask: 'Where do cows, sheep and pigs live?', answers: [['🚜', 'on a farm'], ['🏫', 'at school'], ['🏪', 'in the shop']], yes: 'On a farm!' },
]);
const { items: weatherItems, clips: weatherClips } = simpleQuestions('ww', [
  { key: 'rain', scene: '🌧️', ask: 'It’s raining! What should you wear?', answers: [['🧥☂️', 'a raincoat and an umbrella'], ['🩱', 'a swimming costume'], ['🕶️', 'sunglasses']], yes: 'A raincoat, and an umbrella, to stay dry!' },
  { key: 'hot', scene: '☀️', ask: 'It’s hot and sunny! What should you wear?', answers: [['👒🧴', 'a sun hat and sunscreen'], ['🧣🧤', 'a scarf and gloves'], ['🥾', 'big boots']], yes: 'A sun hat, and sunscreen, so you don’t get burnt!' },
  { key: 'cold', scene: '❄️', ask: 'Brrr! It’s very cold! What should you wear?', answers: [['🧥🧣', 'a warm jacket and a scarf'], ['🩳', 'shorts'], ['🩱', 'a swimming costume']], yes: 'A warm jacket, and a scarf!' },
  { key: 'beach', scene: '🏖️', ask: 'We are going swimming at the beach! What should you wear?', answers: [['🩱', 'a swimming costume'], ['🧥', 'a big coat'], ['🥾', 'boots']], yes: 'A swimming costume! And don’t forget your sunscreen.' },
  { key: 'puddles', scene: '💦', ask: 'You want to jump in puddles! What should you wear on your feet?', answers: [['🥾', 'boots'], ['🩴', 'slippers'], ['🧦', 'just socks']], yes: 'Boots! Splish splash!' },
  { key: 'night', scene: '🌙', ask: 'It’s bedtime! What do you wear?', answers: [['👚', 'pyjamas'], ['🧥', 'a raincoat'], ['🩱', 'a swimming costume']], yes: 'Pyjamas! Night night!' },
]);
const { items: senseItems, clips: senseClips } = simpleQuestions('ws', [
  { key: 'hear', scene: '🎵', ask: 'What do you use to hear music?', answers: [['👂', 'your ears'], ['👃', 'your nose'], ['🦶', 'your feet']], yes: 'Your ears! You hear with your ears.' },
  { key: 'smell', scene: '🌸', ask: 'What do you use to smell a flower?', answers: [['👃', 'your nose'], ['👂', 'your ears'], ['✋', 'your hands']], yes: 'Your nose! Sniff, sniff!' },
  { key: 'see', scene: '🌈', ask: 'What do you use to see a rainbow?', answers: [['👀', 'your eyes'], ['👅', 'your tongue'], ['👂', 'your ears']], yes: 'Your eyes! You see with your eyes.' },
  { key: 'taste', scene: '🍦', ask: 'What do you use to taste ice cream?', answers: [['👅', 'your tongue'], ['👀', 'your eyes'], ['🦶', 'your feet']], yes: 'Your tongue! Yum!' },
  { key: 'touch', scene: '🧸', ask: 'What do you use to feel if teddy is soft?', answers: [['✋', 'your hands'], ['👃', 'your nose'], ['👂', 'your ears']], yes: 'Your hands! You feel things when you touch them.' },
  { key: 'bird', scene: '🐦', ask: 'You hear a bird singing. What are you using?', answers: [['👂', 'your ears'], ['👅', 'your tongue'], ['✋', 'your hands']], yes: 'Your ears!' },
  { key: 'lemon', scene: '🍋', ask: 'A lemon tastes sour! What do you taste it with?', answers: [['👅', 'your tongue'], ['👂', 'your ears'], ['👀', 'your eyes']], yes: 'Your tongue! Ooh, sour!' },
  { key: 'stars', scene: '⭐', ask: 'What do you use to look at the stars at night?', answers: [['👀', 'your eyes'], ['👃', 'your nose'], ['🦶', 'your feet']], yes: 'Your eyes!' },
]);
const { items: petItems, clips: petClips } = simpleQuestions('wpet', [
  { key: 'drink', scene: '🐶', ask: 'What does a puppy need to drink every day?', answers: [['💧', 'clean water'], ['🥤', 'cool drink'], ['☕', 'tea']], yes: 'Clean water! Every day.' },
  { key: 'fish', scene: '🐠', ask: 'Where does a pet fish live?', answers: [['🫙', 'in a tank of water'], ['🛏️', 'in a bed'], ['📦', 'in a box']], yes: 'In a tank of water.' },
  { key: 'walk', scene: '🐕', ask: 'What does a dog need, to stay happy and strong?', answers: [['🦮', 'a walk'], ['📺', 'TV'], ['🍭', 'sweets']], yes: 'Walks and play!' },
  { key: 'cat-food', scene: '🐱', ask: 'What does a cat like to eat?', answers: [['🐟', 'fish'], ['🍭', 'sweets'], ['🍕', 'pizza']], yes: 'Cat food, like fish!' },
  { key: 'rabbit', scene: '🐰', ask: 'What does a rabbit like to eat?', answers: [['🥕', 'carrots and grass'], ['🍗', 'chicken'], ['🍩', 'doughnuts']], yes: 'Carrots, and grass and hay!' },
  { key: 'gentle', scene: '🐈', ask: 'How should you touch a cat?', answers: [['🤚', 'gently, with a soft hand'], ['✊', 'squeeze it tight'], ['🦶', 'with your foot']], yes: 'Gently, with a soft hand.' },
]);
const { items: timeItems, clips: timeClips } = simpleQuestions('wt', [
  { key: 'breakfast', scene: '🥣', ask: 'When do we eat breakfast? In the morning, or at night?', answers: [['🌅', 'in the morning'], ['🌙', 'at night']], yes: 'In the morning!' },
  { key: 'stars', scene: '⭐', ask: 'When can we see the stars? In the daytime, or at night?', answers: [['🌙', 'at night'], ['☀️', 'in the daytime']], yes: 'At night!' },
  { key: 'sleep', scene: '😴', ask: 'When do we go to sleep in our beds? In the daytime, or at night?', answers: [['🌙', 'at night'], ['☀️', 'in the daytime']], yes: 'At night!' },
  { key: 'sunrise', scene: '🐓', ask: 'When does the sun come up, and the rooster crow? In the morning, or at night?', answers: [['🌅', 'in the morning'], ['🌙', 'at night']], yes: 'In the morning! Cock-a-doodle-doo!' },
  { key: 'moon', scene: '🦉', ask: 'When do owls fly, and the moon shine? In the daytime, or at night?', answers: [['🌙', 'at night'], ['☀️', 'in the daytime']], yes: 'At night! Hoo hoo!' },
  { key: 'school', scene: '🎒', ask: 'When do we go to school? In the morning, or at night?', answers: [['🌅', 'in the morning'], ['🌙', 'at night']], yes: 'In the morning!' },
  { key: 'pyjamas', scene: '👚', ask: 'When do we put on our pyjamas? In the morning, or at night?', answers: [['🌙', 'at night'], ['🌅', 'in the morning']], yes: 'At night, before bed!' },
  { key: 'picnic', scene: '🧺', ask: 'When do we have a picnic in the park? In the daytime, or at night?', answers: [['☀️', 'in the daytime'], ['🌙', 'at night']], yes: 'In the daytime, when it’s sunny!' },
]);

// ---------------------------------------------------------------------------
// In order: life cycles, my day, growing up
// ---------------------------------------------------------------------------
const CYCLES: Record<string, { ask: string; done: string; steps: [string, string][] }> = {
  chicken: {
    ask: 'How does a chicken grow? Put the pictures in order!',
    done: 'An egg, a chick, and a big hen!',
    steps: [
      ['🥚', 'An egg.'],
      ['🐣', 'The chick hatches out of the egg.'],
      ['🐥', 'A fluffy little chick.'],
      ['🐔', 'A big hen!'],
    ],
  },
  butterfly: {
    ask: 'How does a butterfly grow? Put the pictures in order!',
    done: 'An egg, a caterpillar, a chrysalis, and a beautiful butterfly!',
    steps: [
      ['🍃', 'A tiny egg on a leaf.'],
      ['🐛', 'A hungry caterpillar comes out.'],
      ['🍃💤', 'It makes a chrysalis, and sleeps inside.'],
      ['🦋', 'Out comes a butterfly!'],
    ],
  },
  plant: {
    ask: 'How does a seed grow into a flower? Put the pictures in order!',
    done: 'A seed, a little shoot, a plant, and a flower!',
    steps: [
      ['🌰', 'A seed in the soil.'],
      ['🌱', 'A little shoot pops up.'],
      ['🌿', 'It grows bigger and bigger.'],
      ['🌻', 'A big flower!'],
    ],
  },
  frog: {
    ask: 'How does a frog grow? Put the pictures in order!',
    done: 'Frog eggs, a tadpole, a froglet, and a frog!',
    steps: [
      ['🫧', 'Frog eggs in the pond.'],
      ['🐟', 'A tadpole, swimming with its tail.'],
      ['🦎', 'It grows legs!'],
      ['🐸', 'A frog! Ribbit!'],
    ],
  },
  people: {
    ask: 'How do people grow? From little to big. Put them in order!',
    done: 'A baby, a child, a grown-up, and a granny!',
    steps: [
      ['👶🏽', 'A baby.'],
      ['🧒🏽', 'A child, like you!'],
      ['🧑🏽', 'A grown-up.'],
      ['👵🏽', 'A granny or a grandpa.'],
    ],
  },
  day: {
    ask: 'What happens in your day? Put the pictures in order, from morning to night!',
    done: 'Morning, afternoon, and night!',
    steps: [
      ['🌅', 'In the morning, the sun comes up and you wake up.'],
      ['🥣', 'You eat breakfast.'],
      ['🏫', 'You go to school.'],
      ['🛝', 'In the afternoon, you play.'],
      ['🛁', 'In the evening, you have a bath.'],
      ['🌙', 'At night, you go to sleep.'],
    ],
  },
};
const cycleItems: Record<string, LearningItem> = {};
for (const [key, c] of Object.entries(CYCLES)) {
  clips[`wc.${key}`] = c.ask;
  clips[`wc.${key}.done`] = c.done;
  c.steps.forEach(([, words], i) => (clips[`wc.${key}.${i}`] = words));
  cycleItems[`cycle-${key}`] = orderItem(`cycle-${key}`, { askClip: `wc.${key}`, doneClip: `wc.${key}.done`, steps: c.steps.map(([emoji], i) => ({ emoji, clip: `wc.${key}.${i}` })) });
}

export const moreWorldItems: Record<string, LearningItem> = {
  'q-babies': babyAnimals,
  'q-homes': animalHomes,
  'q-helpers': whoHelps,
  ...placeItems,
  ...weatherItems,
  ...senseItems,
  ...petItems,
  ...timeItems,
  ...cycleItems,
};
export const moreWorldClips = { ...clips, ...placeClips, ...weatherClips, ...senseClips, ...petClips, ...timeClips };

// ---------------------------------------------------------------------------
// Games
// ---------------------------------------------------------------------------
const k = (items: Record<string, unknown>) => Object.keys(items);

export const babiesGame: Game = {
  id: 'babies',
  titleClip: 'world.babies-title',
  icon: '🐥',
  levels: [
    { id: 'teach', parentLabel: 'Baby animals: shown first (a baby cow is a calf)', rounds: 6, activity: { kind: 'pick-it', pool: ['q-babies'], choices: 2, modes: ['teach'] } },
    { id: '3', parentLabel: 'Baby animals, 3 to pick from', rounds: 6, activity: { kind: 'pick-it', pool: ['q-babies'], choices: 3 } },
    { id: 'homes', parentLabel: 'Where do animals live?', rounds: 6, activity: { kind: 'pick-it', pool: ['q-homes'], choices: 3 } },
    { id: 'pets', parentLabel: 'What do pets need?', rounds: 5, activity: { kind: 'pick-it', pool: k(petItems) } },
  ],
};

export const helpersGame: Game = {
  id: 'helpers',
  titleClip: 'world.helpers-title',
  icon: '🧑🏾‍🚒',
  levels: [
    { id: 'who', parentLabel: 'Who helps us? (doctor, firefighter, police…)', rounds: 6, activity: { kind: 'pick-it', pool: ['q-helpers'], choices: 3 } },
    { id: 'tools', parentLabel: 'What do they use?', rounds: 6, activity: { kind: 'pick-it', pool: ['q-helpers'], choices: 3, modes: ['tools'] } },
    { id: 'places', parentLabel: 'Places: shop, hospital, school, park…', rounds: 6, activity: { kind: 'pick-it', pool: k(placeItems) } },
  ],
};

export const dressGame: Game = {
  id: 'dress-weather',
  titleClip: 'world.dress-title',
  icon: '☂️',
  levels: [{ id: 'all', parentLabel: 'What to wear for the weather', rounds: 6, activity: { kind: 'pick-it', pool: k(weatherItems) } }],
};

export const sensesGame: Game = {
  id: 'senses',
  titleClip: 'world.senses-title',
  icon: '👃',
  levels: [{ id: 'all', parentLabel: 'Seeing, hearing, smelling, tasting, touching', rounds: 6, activity: { kind: 'pick-it', pool: k(senseItems) } }],
};

export const growGame: Game = {
  id: 'grow',
  titleClip: 'world.grow-title',
  icon: '🌱',
  levels: [
    { id: 'cycles-3', parentLabel: 'How things grow, in order (3 pictures)', rounds: 3, activity: { kind: 'order', pool: ['cycle-chicken', 'cycle-plant', 'cycle-people', 'cycle-butterfly'], steps: 3 } },
    { id: 'cycles-4', parentLabel: 'Life cycles: chicken, butterfly, frog, seed, people', rounds: 3, activity: { kind: 'order', pool: ['cycle-chicken', 'cycle-plant', 'cycle-people', 'cycle-butterfly', 'cycle-frog'] } },
  ],
};

export const timeGame: Game = {
  id: 'time',
  titleClip: 'world.time-title',
  icon: '🌅',
  levels: [
    { id: 'morning-night', parentLabel: 'Morning or night? Day or night?', rounds: 6, activity: { kind: 'pick-it', pool: k(timeItems) } },
    { id: 'my-day-3', parentLabel: 'My day in order (3 pictures)', rounds: 3, activity: { kind: 'order', pool: ['cycle-day'], steps: 3 } },
    { id: 'my-day', parentLabel: 'My day in order, morning to night (6 pictures)', rounds: 3, activity: { kind: 'order', pool: ['cycle-day'] } },
  ],
};

