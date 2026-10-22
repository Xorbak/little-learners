import type { LearningItem } from '../../types/learning';
import { emojiItems } from '../../shared/ui/emojiItems';

/**
 * New words by topic (NCF: a growing vocabulary, new words every day by topic),
 * and the words and sentences for clapping syllables and counting words.
 */

export const PACKS: Record<string, [key: string, emoji: string, name: string, plural?: string][]> = {
  clothes: [
    ['shirt', '👕', 'T-shirt'],
    ['trousers', '👖', 'trousers', 'trousers'],
    ['dress', '👗', 'dress', 'dresses'],
    ['socks', '🧦', 'socks', 'socks'],
    ['shoes', '👟', 'shoes', 'shoes'],
    ['cap', '🧢', 'cap'],
    ['jacket', '🧥', 'jacket'],
    ['scarf', '🧣', 'scarf', 'scarves'],
    ['gloves', '🧤', 'gloves', 'gloves'],
    ['glasses', '👓', 'glasses', 'glasses'],
    ['boots', '🥾', 'boots', 'boots'],
    ['swimsuit', '🩱', 'swimming costume'],
  ],
  food: [
    ['bread', '🍞', 'bread', 'bread'],
    ['egg', '🥚', 'egg'],
    ['cheese', '🧀', 'cheese', 'cheese'],
    ['milk', '🥛', 'milk', 'milk'],
    ['rice', '🍚', 'rice', 'rice'],
    ['carrot', '🥕', 'carrot'],
    ['corn', '🌽', 'mielie'],
    ['potato', '🥔', 'potato', 'potatoes'],
    ['chicken', '🍗', 'chicken', 'chicken'],
    ['porridge', '🥣', 'porridge', 'porridge'],
    ['tomato', '🍅', 'tomato', 'tomatoes'],
    ['sandwich', '🥪', 'sandwich', 'sandwiches'],
  ],
  vehicles: [
    ['car', '🚗', 'car'],
    ['bus', '🚌', 'bus', 'buses'],
    ['taxi', '🚕', 'taxi'],
    ['truck', '🚚', 'truck'],
    ['bike', '🚲', 'bicycle'],
    ['motorbike', '🏍️', 'motorbike'],
    ['train', '🚂', 'train'],
    ['plane', '✈️', 'aeroplane'],
    ['helicopter', '🚁', 'helicopter'],
    ['boat', '⛵', 'boat'],
    ['tractor', '🚜', 'tractor'],
    ['ambulance', '🚑', 'ambulance'],
  ],
  bugs: [
    ['ant', '🐜', 'ant'],
    ['bee', '🐝', 'bee'],
    ['butterfly', '🦋', 'butterfly', 'butterflies'],
    ['ladybird', '🐞', 'ladybird'],
    ['spider', '🕷️', 'spider'],
    ['snail', '🐌', 'snail'],
    ['worm', '🪱', 'worm'],
    ['caterpillar', '🐛', 'caterpillar'],
    ['fly', '🪰', 'fly', 'flies'],
    ['beetle', '🪲', 'beetle'],
    ['cricket', '🦗', 'cricket'],
    ['mosquito', '🦟', 'mosquito', 'mosquitoes'],
  ],
  home: [
    ['bed', '🛏️', 'bed'],
    ['chair', '🪑', 'chair'],
    ['door', '🚪', 'door'],
    ['window', '🪟', 'window'],
    ['bath', '🛁', 'bath'],
    ['toilet', '🚽', 'toilet'],
    ['couch', '🛋️', 'couch', 'couches'],
    ['light', '💡', 'light'],
    ['tv', '📺', 'TV'],
    ['cup', '☕', 'cup'],
    ['spoon', '🥄', 'spoon'],
    ['key', '🔑', 'key'],
  ],
  toys: [
    ['ball', '⚽', 'ball'],
    ['teddy', '🧸', 'teddy', 'teddies'],
    ['kite', '🪁', 'kite'],
    ['blocks', '🧱', 'blocks', 'blocks'],
    ['puzzle', '🧩', 'puzzle'],
    ['crayons', '🖍️', 'crayons', 'crayons'],
    ['book', '📖', 'book'],
    ['balloon', '🎈', 'balloon'],
    ['drum', '🥁', 'drum'],
    ['robot', '🤖', 'robot'],
    ['yoyo', '🪀', 'yo-yo'],
    ['doll', '🪆', 'doll'],
  ],
};

const list = Object.entries(PACKS).flatMap(([pack, words]) => words.map(([key, emoji, name, plural]) => ({ key: `${pack}-${key}`, emoji, name, plural })));
export const { items: wordItems, clips: wordClips } = emojiItems('words', list);
export const packKeys = (...packs: string[]) => packs.flatMap((p) => PACKS[p].map(([k]) => `${p}-${k}`));

// ---------------------------------------------------------------------------
// Clap the syllables. Each part is spelled so the voice says it clearly.
// ---------------------------------------------------------------------------
const SYLLABLES: [key: string, emoji: string, word: string, parts: string[]][] = [
  ['dog', '🐶', 'Dog!', ['dog']],
  ['cat', '🐱', 'Cat!', ['cat']],
  ['sun', '☀️', 'Sun!', ['sun']],
  ['ball', '⚽', 'Ball!', ['ball']],
  ['monkey', '🐵', 'Monkey!', ['mun', 'key']],
  ['apple', '🍎', 'Apple!', ['ap', 'pull']],
  ['tiger', '🐯', 'Tiger!', ['tie', 'gah']],
  ['zebra', '🦓', 'Zebra!', ['zeb', 'ruh']],
  ['rabbit', '🐰', 'Rabbit!', ['rab', 'bit']],
  ['rocket', '🚀', 'Rocket!', ['rock', 'it']],
  ['teddy', '🧸', 'Teddy!', ['ted', 'dee']],
  ['pizza', '🍕', 'Pizza!', ['peet', 'sah']],
  ['elephant', '🐘', 'Elephant!', ['ell', 'uh', 'fant']],
  ['banana', '🍌', 'Banana!', ['buh', 'nah', 'nuh']],
  ['butterfly', '🦋', 'Butterfly!', ['butt', 'er', 'fly']],
  ['dinosaur', '🦕', 'Dinosaur!', ['dye', 'no', 'sore']],
  ['kangaroo', '🦘', 'Kangaroo!', ['kang', 'guh', 'roo']],
  ['strawberry', '🍓', 'Strawberry!', ['straw', 'bear', 'ree']],
  ['octopus', '🐙', 'Octopus!', ['ock', 'toe', 'puss']],
  ['tomato', '🍅', 'Tomato!', ['tuh', 'mah', 'toe']],
  ['watermelon', '🍉', 'Watermelon!', ['wah', 'ter', 'mell', 'un']],
  ['helicopter', '🚁', 'Helicopter!', ['hell', 'ee', 'cop', 'ter']],
  ['caterpillar', '🐛', 'Caterpillar!', ['cat', 'er', 'pill', 'er']],
  ['avocado', '🥑', 'Avocado!', ['ah', 'vuh', 'kah', 'doe']],
];

// ---------------------------------------------------------------------------
// Count the words in a sentence
// ---------------------------------------------------------------------------
const SENTENCES: [key: string, emoji: string, sentence: string][] = [
  ['thank-you', '🙏', 'Thank you.'],
  ['good-night', '🌙', 'Good night.'],
  ['big-dog', '🐕', 'Big dog!'],
  ['like-cake', '🎂', 'I like cake.'],
  ['ducks-swim', '🦆', 'Ducks can swim.'],
  ['look-at-me', '🙋', 'Look at me!'],
  ['sun-is-hot', '☀️', 'The sun is hot.'],
  ['i-can-jump', '🤸', 'I can jump high.'],
  ['cat-sleeps', '😺', 'The cat is sleeping.'],
  ['my-hat', '👒', 'My hat is red.'],
  ['see-bus', '🚌', 'I see a big bus.'],
  ['see-moon', '🌕', 'Can you see the moon?'],
];

const beatItems: Record<string, LearningItem> = {};
const beatClips: Record<string, string> = {};
for (const [key, emoji, word, parts] of SYLLABLES) {
  beatClips[`syl.${key}`] = word;
  parts.forEach((p, i) => (beatClips[`syl.${key}.${i}`] = p));
  beatItems[`syl-${key}`] = {
    key: `syl-${key}`,
    nameClip: `syl.${key}`,
    pluralClip: `syl.${key}`,
    track: false,
    Display: () => null,
    beats: { whole: `syl.${key}`, parts: parts.map((_, i) => `syl.${key}.${i}`), picture: emoji },
  };
}
for (const [key, emoji, sentence] of SENTENCES) {
  const words = sentence.split(' ');
  beatClips[`cw.${key}`] = sentence;
  words.forEach((w, i) => (beatClips[`cw.${key}.${i}`] = w.replace(/[.!?]/g, '')));
  beatItems[`cw-${key}`] = {
    key: `cw-${key}`,
    nameClip: `cw.${key}`,
    pluralClip: `cw.${key}`,
    track: false,
    Display: () => null,
    beats: { whole: `cw.${key}`, parts: words.map((_, i) => `cw.${key}.${i}`), picture: emoji, text: sentence },
  };
}
export { beatItems, beatClips };
export const syllableKeys = (counts: number[]) => SYLLABLES.filter(([, , , p]) => counts.includes(p.length)).map(([k]) => `syl-${k}`);
export const sentenceKeys = (counts: number[]) => SENTENCES.filter(([, , s]) => counts.includes(s.split(' ').length)).map(([k]) => `cw-${k}`);
