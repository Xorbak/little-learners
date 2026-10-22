import type { Game, LearningItem } from '../../types/learning';
import { picAnswer, pickNew, quizItem, shuffle } from '../../shared/quiz';
import { Pic } from '../../shared/ui/scenes';

/**
 * Guess What I Am: riddles, one clue at a time (NCF Creativity: problem solving,
 * "Guess what this is?"). Each clue makes it easier; a wrong guess gets the next clue.
 */

const RIDDLES: [key: string, emoji: string, name: string, clues: [string, string, string], others: [string, string][]][] = [
  ['apple', '🍎', 'an apple', ['I am round.', 'I am red, or green.', 'I am a fruit, and I grow on a tree. Crunch!'], [['🍌', 'a banana'], ['⚽', 'a ball'], ['🍅', 'a tomato']]],
  ['cat', '🐱', 'a cat', ['I have four legs, and a tail.', 'I like to drink milk, and I purr.', 'I say meow!'], [['🐶', 'a dog'], ['🐮', 'a cow'], ['🐔', 'a hen']]],
  ['sun', '☀️', 'the sun', ['I am up in the sky.', 'I am yellow, and very hot.', 'I come up in the morning, and make it light.'], [['🌙', 'the moon'], ['☁️', 'a cloud'], ['⭐', 'a star']]],
  ['fish', '🐟', 'a fish', ['I live in the water.', 'I have fins, and a tail.', 'I can’t walk, but I can swim!'], [['🦆', 'a duck'], ['🐸', 'a frog'], ['🐢', 'a turtle']]],
  ['banana', '🍌', 'a banana', ['I am a fruit.', 'I am long, and yellow.', 'Monkeys love to eat me!'], [['🍎', 'an apple'], ['🌽', 'a mielie'], ['🍋', 'a lemon']]],
  ['car', '🚗', 'a car', ['I have four wheels.', 'I go brrrm on the road.', 'A grown-up drives me, and you sit in a car seat.'], [['🚲', 'a bicycle'], ['✈️', 'an aeroplane'], ['⛵', 'a boat']]],
  ['elephant', '🐘', 'an elephant', ['I am a very big animal.', 'I am grey, with big ears.', 'I have a long trunk!'], [['🦏', 'a rhino'], ['🦛', 'a hippo'], ['🦒', 'a giraffe']]],
  ['umbrella', '☂️', 'an umbrella', ['You hold me in your hand.', 'You open me up when it rains.', 'I keep you dry!'], [['🧤', 'gloves'], ['👒', 'a hat'], ['🧥', 'a coat']]],
  ['moon', '🌙', 'the moon', ['I am up in the sky.', 'You see me at night.', 'Sometimes I am round, and sometimes I am a thin smile.'], [['☀️', 'the sun'], ['⭐', 'a star'], ['☁️', 'a cloud']]],
  ['bee', '🐝', 'a bee', ['I can fly.', 'I am yellow and black, and I buzz.', 'I make honey!'], [['🦋', 'a butterfly'], ['🐞', 'a ladybird'], ['🐦', 'a bird']]],
  ['toothbrush', '🪥', 'a toothbrush', ['You use me every day.', 'I live in the bathroom.', 'I help keep your teeth clean!'], [['🧼', 'soap'], ['🥄', 'a spoon'], ['🧸', 'a teddy']]],
  ['ice-cream', '🍦', 'ice cream', ['I am cold.', 'I am sweet, and I melt in the sun.', 'You lick me on a hot day!'], [['🧊', 'ice'], ['🍰', 'cake'], ['🍭', 'a lollipop']]],
  ['giraffe', '🦒', 'a giraffe', ['I am an animal with four long legs.', 'I have spots.', 'I have a very, very long neck!'], [['🦓', 'a zebra'], ['🐆', 'a leopard'], ['🐘', 'an elephant']]],
  ['bed', '🛏️', 'a bed', ['I am in your bedroom.', 'I have a pillow and a blanket.', 'You sleep on me at night!'], [['🪑', 'a chair'], ['🛁', 'a bath'], ['🚪', 'a door']]],
];

const clips: Record<string, string> = {
  'riddle.listen': 'Listen to my clues, and guess what I am!',
  'riddle.what-am-i': 'What am I?',
  'riddle.yes': "Yes! I'm",
  'think.riddles-title': 'Guess what I am',
};
for (const [key, , name, cl, others] of RIDDLES) {
  clips[`riddle.n.${key}`] = name;
  cl.forEach((c, i) => (clips[`riddle.${key}.${i}`] = c));
  others.forEach(([, n], i) => (clips[`riddle.${key}.o${i}`] = n));
}

const riddle = quizItem('q-riddle', (c) => {
  const pick = pickNew('riddle', RIDDLES);
  const [key, emoji, , cl, others] = pick;
  return {
    Scene: ({ width, height }) => <Pic e="❓" size={Math.min(width, height) * 0.7} style={{ animation: 'fx-bob 1.4s ease-in-out infinite' }} />,
    tell: [['riddle.listen']],
    clues: cl.map((_, i) => [`riddle.${key}.${i}`]),
    ask: ['riddle.what-am-i'],
    answers: [picAnswer(key, emoji, `riddle.n.${key}`, true), ...shuffle(others.map(([e], i) => picAnswer(`o${i}`, e, `riddle.${key}.o${i}`))).slice(0, (c.choices ?? 3) - 1)],
    yes: ['riddle.yes', `riddle.n.${key}`],
  };
});

export const riddleItems: Record<string, LearningItem> = { 'q-riddle': riddle };
export const riddleClips = clips;

export const riddleGame: Game = {
  id: 'riddles',
  titleClip: 'think.riddles-title',
  icon: '❓',
  levels: [
    { id: '2', parentLabel: 'Riddles: clue by clue, 2 to pick from', rounds: 5, activity: { kind: 'pick-it', pool: ['q-riddle'], choices: 2 } },
    { id: '3', parentLabel: '3 to pick from', rounds: 6, activity: { kind: 'pick-it', pool: ['q-riddle'], choices: 3 } },
    { id: '4', parentLabel: '4 to pick from', rounds: 6, activity: { kind: 'pick-it', pool: ['q-riddle'], choices: 4 } },
  ],
};
