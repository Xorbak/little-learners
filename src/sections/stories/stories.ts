import type { LearningItem, Story } from '../../types/learning';
import { orderItem } from '../../shared/quiz';

/**
 * Short picture stories (NCF Communication: listening, remembering a story,
 * what happens next, putting a story in order). Each page is one picture and
 * a sentence or two; the words light up as they are read.
 *
 * To add a story: add an entry below. Pages are [pictures, words]; questions
 * have the right answer first; `next` is what really happens first, then two
 * other ideas (any guess is fine).
 */

interface StoryData {
  key: string;
  title: string;
  cover: string;
  pages: [string, string][];
  questions: { ask: string; answers: [string, string][] }[];
  next: [string, string][];
}

const STORIES: StoryData[] = [
  {
    key: 'hen',
    title: 'Little Hen and the Seeds',
    cover: '🐔🌾',
    pages: [
      ['🐔🌰', 'Little Hen found some seeds. Who will help me plant them?'],
      ['🐶🐱🦆', 'Not me, said Dog. Not me, said Cat. Not me, said Duck.'],
      ['🐔🌱💧', 'So Little Hen planted the seeds all by herself, and watered them every day.'],
      ['🌾🌾🍞', 'The seeds grew into tall wheat. Little Hen made flour, and baked some bread.'],
      ['🐔🐥🍞', 'Who will help me eat the bread? Me! said Dog, Cat and Duck. No, said Little Hen. My chicks and I will eat it!'],
    ],
    questions: [
      { ask: 'Who found the seeds?', answers: [['🐔', 'Little Hen'], ['🐶', 'Dog'], ['🦆', 'Duck']] },
      { ask: 'What did Little Hen bake?', answers: [['🍞', 'bread'], ['🎂', 'a cake'], ['🍕', 'a pizza']] },
      { ask: 'What did the seeds grow into?', answers: [['🌾', 'wheat'], ['🌻', 'flowers'], ['🍎', 'apples']] },
    ],
    next: [
      ['🐔🐥🍞', 'Little Hen and her chicks eat the bread'],
      ['🐶🐱🍞', 'Dog and Cat eat the bread'],
      ['🦆🍞🌊', 'Duck takes the bread to the pond'],
    ],
  },
  {
    key: 'zebra',
    title: "Zebra's Hat",
    cover: '🦓👒',
    pages: [
      ['🦓👒💨', 'Zebra had a lovely straw hat. One windy day, whoosh! The wind blew it away.'],
      ['🦓🦒', 'Have you seen my hat? Zebra asked Giraffe. No, said Giraffe. Let’s look up high!'],
      ['🦓🐘💧', 'Have you seen my hat? Zebra asked Elephant. No, said Elephant. Let’s look in the water!'],
      ['🌳🐒👒', 'Then Monkey shouted from the tree. Here it is! Your hat is stuck in my tree!'],
      ['🦓👒😊', 'Thank you, Monkey! said Zebra. And he held on to his hat, all the way home.'],
    ],
    questions: [
      { ask: 'Who lost a hat?', answers: [['🦓', 'Zebra'], ['🦒', 'Giraffe'], ['🐘', 'Elephant']] },
      { ask: 'Where was the hat?', answers: [['🌳', 'in a tree'], ['💧', 'in the water'], ['🏠', 'in a house']] },
      { ask: 'Who found the hat?', answers: [['🐒', 'Monkey'], ['🦒', 'Giraffe'], ['🐘', 'Elephant']] },
    ],
    next: [
      ['🦓👒😊', 'Zebra gets his hat back'],
      ['🐒👒', 'Monkey keeps the hat'],
      ['💨👒', 'The wind blows it away again'],
    ],
  },
  {
    key: 'beach',
    title: 'Thabo at the Beach',
    cover: '👦🏾🏖️',
    pages: [
      ['👦🏾👵🏾🏖️', 'Thabo went to the beach with Gogo. The sand was warm, and the sea was blue.'],
      ['👦🏾🏰', 'Thabo built a big sandcastle, with a flag on top.'],
      ['🌊🏰', 'Then a big wave came. Splash! The sandcastle fell down.'],
      ['👦🏾😢👵🏾', 'Thabo felt sad. Don’t worry, said Gogo. Let’s build it again, together.'],
      ['👦🏾👵🏾🏰🍦', 'They built an even bigger sandcastle, far away from the waves. Then they had ice cream!'],
    ],
    questions: [
      { ask: 'Who went to the beach with Thabo?', answers: [['👵🏾', 'Gogo'], ['🐶', 'his dog'], ['👮🏽', 'a police officer']] },
      { ask: 'What knocked the sandcastle down?', answers: [['🌊', 'a wave'], ['🐕', 'a dog'], ['🦀', 'a crab']] },
      { ask: 'How did Thabo feel when it fell down?', answers: [['😢', 'sad'], ['😊', 'happy'], ['😴', 'sleepy']] },
    ],
    next: [
      ['🏰🍦', 'They build it again, and have ice cream'],
      ['🏠', 'They go home'],
      ['🎣', 'They go fishing'],
    ],
  },
  {
    key: 'rain',
    title: 'Lindiwe’s Rainy Day',
    cover: '👧🏿☔',
    pages: [
      ['👧🏿🌧️', 'Lindiwe wanted to play outside, but it was raining. Pitter, patter, pitter, patter.'],
      ['👧🏿🛋️🧸', 'So she made a cosy den with blankets and cushions. Teddy came too.'],
      ['👧🏿📖🧸', 'In the den, she read a book to Teddy, and they had a little snack.'],
      ['☀️🌈', 'Then the rain stopped, and the sun came out. Look! A rainbow!'],
      ['👧🏿🥾💦', 'Lindiwe put on her boots, and jumped in all the puddles. Splish, splash!'],
    ],
    questions: [
      { ask: 'What was the weather like?', answers: [['🌧️', 'rainy'], ['☀️', 'sunny'], ['❄️', 'snowy']] },
      { ask: 'Who came into the den?', answers: [['🧸', 'Teddy'], ['🐶', 'a dog'], ['🐱', 'a cat']] },
      { ask: 'What came out after the rain?', answers: [['🌈', 'a rainbow'], ['🌙', 'the moon'], ['⭐', 'the stars']] },
    ],
    next: [
      ['👧🏿🥾💦', 'She jumps in the puddles'],
      ['👧🏿🛏️', 'She goes to bed'],
      ['👧🏿🏊🏿', 'She goes swimming'],
    ],
  },
  {
    key: 'seed',
    title: 'Sipho’s Sunflower',
    cover: '👦🏽🌻',
    pages: [
      ['👦🏽🌰', 'Sipho had a tiny seed. He put it in the soil, in a little pot.'],
      ['💧☀️', 'Every day he gave it water, and the sun kept it warm.'],
      ['🌱', 'One morning, a little green shoot popped up! Hello, little plant!'],
      ['🌿🐝', 'It grew, and grew, and grew. A bee came to visit.'],
      ['👦🏽🌻', 'Now it was a big, yellow sunflower, even taller than Sipho!'],
    ],
    questions: [
      { ask: 'What did Sipho plant?', answers: [['🌰', 'a seed'], ['🍎', 'an apple'], ['🧸', 'a teddy']] },
      { ask: 'What does a plant need?', answers: [['💧', 'water'], ['🍦', 'ice cream'], ['🎈', 'a balloon']] },
      { ask: 'What did the seed grow into?', answers: [['🌻', 'a sunflower'], ['🌵', 'a cactus'], ['🍄', 'a mushroom']] },
    ],
    next: [
      ['👦🏽🌻', 'It grows into a big sunflower'],
      ['🌵', 'It grows into a cactus'],
      ['🍄', 'It grows into a mushroom'],
    ],
  },
];

export const storyItems: Record<string, LearningItem> = {};
export const retellItems: Record<string, LearningItem> = {};
export const storyClips: Record<string, string> = {};

for (const s of STORIES) {
  const id = `stories.${s.key}`;
  storyClips[`${id}.title`] = s.title;
  s.pages.forEach(([, words], i) => (storyClips[`${id}.p${i}`] = words));
  s.questions.forEach((q, i) => {
    storyClips[`${id}.q${i}`] = q.ask;
    q.answers.forEach(([, words], j) => (storyClips[`${id}.q${i}.a${j}`] = words));
  });
  s.next.forEach(([, words], i) => (storyClips[`${id}.next${i}`] = words));
  const story: Story = {
    title: `${id}.title`,
    cover: s.cover,
    pages: s.pages.map(([scene], i) => ({ scene, clip: `${id}.p${i}` })),
    questions: s.questions.map((q, i) => ({ ask: `${id}.q${i}`, answers: q.answers.map(([emoji], j) => ({ emoji, clip: `${id}.q${i}.a${j}` })) })),
    next: s.next.map(([emoji], i) => ({ emoji, clip: `${id}.next${i}` })),
  };
  storyItems[`story-${s.key}`] = { key: `story-${s.key}`, nameClip: `${id}.title`, pluralClip: `${id}.title`, track: false, story, Display: () => null };
  // Retell: the story's pictures to put in order
  storyClips[`${id}.retell`] = `Do you remember ${s.title}? Put the pictures in order!`;
  retellItems[`retell-${s.key}`] = orderItem(`retell-${s.key}`, {
    askClip: `${id}.retell`,
    steps: s.pages.map(([emoji], i) => ({ emoji, clip: `${id}.p${i}` })),
    doneClip: 'story.the-end',
    quiet: true,
  });
}

export const storyKeys = Object.keys(storyItems);
export const retellKeys = Object.keys(retellItems);
