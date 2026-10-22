import { useEffect } from 'react';
import type { Game, LearningItem, MatchWay, QuizAnswer } from '../../../types/learning';
import { numberItems } from '../characters';
import { Amount } from '../../../shared/ui/faces';
import { Jar, Pic, StoryRow } from '../../../shared/ui/scenes';
import { pickOne, quizItem, rand, shuffle } from '../../../shared/quiz';
import { sfx } from '../../../shared/audio/sfx';

/**
 * More maths for the NCF (Exploring mathematics): fingers for numbers, more or
 * fewer, number stories (one more, one less, adding a few), guess then count,
 * and sharing fairly.
 */

const num = (n: number) => `numbers.name.${n}`;
const COUNTERS = ['🍎', '⭐', '🐞', '🍓', '🐟', '🌸', '🧁', '🐥', '🦋', '🚗', '🍌', '🐸'];

/** Number cards: the right one and its neighbours */
export function numeralAnswers(right: number, count: number, min = 0, max = 10): QuizAnswer[] {
  const others = shuffle(Array.from({ length: max - min + 1 }, (_, i) => i + min).filter((n) => n !== right))
    .sort((a, b) => Math.abs(a - right) - Math.abs(b - right))
    .slice(0, Math.max(0, count - 1));
  return [right, ...others].map((n) => ({
    key: String(n),
    clip: num(n),
    right: n === right,
    View: numberItems[String(n)].faces!.numeral(0).View,
  }));
}

// ---------------------------------------------------------------------------
// More, fewer or the same
// ---------------------------------------------------------------------------
const moreOrFewer = quizItem('q-more', (c) => {
  const modes = c.modes ?? ['more'];
  const close = modes.includes('close');
  const kinds = modes.filter((m) => m === 'more' || m === 'fewer' || m === 'same');
  const kind = pickOne(kinds);
  const min = c.min ?? 1;
  const max = c.max ?? 5;
  let a = rand(min, max);
  let b = a;
  if (kind !== 'same') {
    const gap = close ? 1 : Math.max(2, Math.ceil((max - min) / 2));
    do {
      a = rand(min, max);
      b = rand(min, max);
    } while (Math.abs(a - b) < gap);
  }
  const [emojiA, emojiB] = Math.random() < 0.5 ? [pickOne(COUNTERS), ''] : shuffle(COUNTERS).slice(0, 2);
  const withSame = kinds.includes('same');
  const big = Math.max(a, b);
  const small = Math.min(a, b);
  const answers: QuizAnswer[] = [
    { key: 'left', right: kind === 'more' ? a > b : kind === 'fewer' ? a < b : false, View: ({ size }) => <Amount n={a} size={size} emoji={emojiA} />, says: ['more.look-again'] },
    { key: 'right', right: kind === 'more' ? b > a : kind === 'fewer' ? b < a : false, View: ({ size }) => <Amount n={b} size={size} emoji={emojiB || emojiA} />, says: ['more.look-again'] },
  ];
  if (withSame) answers.push({ key: 'same', clip: 'more.same', right: kind === 'same', View: ({ size }) => <Pic e="🟰" size={size} scale={0.8} />, says: ['more.not-same'] });
  return {
    ask: [kind === 'fewer' ? 'more.which-fewer' : 'more.which-more', ...(withSame ? ['more.or-same'] : [])],
    answers,
    fixedOrder: true,
    yes:
      kind === 'same'
        ? ['pick.yes', 'more.same-yes', num(a), 'more.and', num(b)]
        : kind === 'more'
          ? ['pick.yes', num(big), 'more.is-more-than', num(small)]
          : ['pick.yes', num(small), 'more.is-less-than', num(big)],
  };
});

// ---------------------------------------------------------------------------
// Number stories: one more comes, one goes away, a few more come
// ---------------------------------------------------------------------------
const STORY_THINGS = [
  { e: '🍎', clip: 'ns.apples' },
  { e: '🐦', clip: 'ns.birds' },
  { e: '🦆', clip: 'ns.ducks' },
  { e: '🍪', clip: 'ns.cookies' },
  { e: '🎈', clip: 'ns.balloons' },
  { e: '🐟', clip: 'ns.fish' },
  { e: '🐞', clip: 'ns.ladybirds' },
  { e: '🚗', clip: 'ns.cars' },
];

/** Plays a whoosh when things arrive or leave */
function StoryScene(props: { n: number; arrive: number; leave: number; emoji: string; width: number; height: number; stage: number }) {
  const moved = props.stage >= 2;
  useEffect(() => {
    if (moved) sfx.whoosh(props.arrive > 0);
  }, [moved, props.arrive]);
  return <StoryRow n={props.n} arrive={props.arrive} leave={props.leave} emoji={props.emoji} width={props.width} height={props.height} moved={moved} />;
}

const numberStory = quizItem('q-story', (c) => {
  const kind = pickOne(c.modes ?? ['more']);
  const max = c.max ?? 5;
  const thing = pickOne(STORY_THINGS);
  let n: number;
  let k = 1;
  if (kind === 'less') n = rand(2, max);
  else if (kind === 'add') {
    k = rand(2, Math.min(3, max - 2));
    n = rand(2, max - k);
  } else n = rand(2, max - 1);
  const result = kind === 'less' ? n - 1 : n + k;
  const event = kind === 'less' ? ['ns.one-goes-away'] : kind === 'add' ? [num(k), 'ns.more-come'] : ['ns.one-more-comes'];
  return {
    Scene: ({ width, height, stage }) => <StoryScene n={n} arrive={kind === 'less' ? 0 : k} leave={kind === 'less' ? 1 : 0} emoji={thing.e} width={width} height={height} stage={stage} />,
    tell: [['ns.there-are', num(n), thing.clip], event],
    ask: ['ns.how-many-now'],
    answers: numeralAnswers(result, c.choices ?? 3, 0, 10),
    yes: ['pick.yes', 'ns.now-there-are', num(result)],
    oops: ['ns.count-them'],
  };
});

// ---------------------------------------------------------------------------
// Guess then count: a quick look at the sweet jar. A few, or a lot? Then count them.
// ---------------------------------------------------------------------------
const guessThenCount = quizItem('q-guess', (c) => {
  const lot = Math.random() < 0.5;
  const n = lot ? rand(15, 22) : rand(2, c.max ?? 4);
  const sweet = pickOne(['🍬', '🍭', '🫐', '🍓', '🍒']);
  const count = (c.modes ?? []).includes('count') && !lot;
  return {
    Scene: ({ width, height, stage, solved }) => <Jar n={n} size={Math.min(width, height) * 0.95} sweet={sweet} covered={stage >= 1 && !solved} />,
    tell: [['guess.quick-look']],
    ask: ['guess.few-or-lot'],
    answers: [
      { key: 'few', clip: 'guess.a-few', right: !lot, View: ({ size }) => <Amount n={3} size={size} emoji={sweet} /> },
      { key: 'lot', clip: 'guess.a-lot', right: lot, View: ({ size }) => <Jar n={20} size={size * 0.9} sweet={sweet} /> },
    ],
    fixedOrder: true,
    yes: lot ? ['pick.yes', 'guess.yes-lot'] : ['pick.yes', 'guess.yes-few'],
    then: count
      ? () => ({
          Scene: ({ width, height }) => <Jar n={n} size={Math.min(width, height) * 0.95} sweet={sweet} />,
          ask: ['guess.how-many'],
          answers: numeralAnswers(n, 3, 1, 6),
          yes: ['pick.yes', num(n), 'guess.sweets'],
          oops: ['ns.count-them'],
        })
      : undefined,
  };
});

export const mathsItems: Record<string, LearningItem> = {
  // Sharing has no question; this item just keeps her answers
  'q-share': { key: 'q-share', nameClip: 'numbers.share-title', pluralClip: 'numbers.share-title', track: false, Display: () => null },
  'q-more': moreOrFewer,
  'q-story': numberStory,
  'q-guess': guessThenCount,
};

export const mathsClips = {
  'numbers.fingers-title': 'Fingers',
  'numbers.fingers-how-many': 'How many fingers? Find the number!',
  'numbers.fingers-find': 'Find the hands that show',
  'numbers.more-title': 'More or fewer?',
  'numbers.story-title': 'Number stories',
  'numbers.guess-title': 'Guess, then count',
  'numbers.share-title': 'Share it fairly',
  'more.which-more': 'Which one has more?',
  'more.which-fewer': 'Which one has fewer?',
  'more.or-same': 'Or are they the same?',
  'more.same': 'the same',
  'more.is-more-than': 'is more than',
  'more.is-less-than': 'is less than',
  'more.same-yes': 'They are the same!',
  'more.and': 'and',
  'more.look-again': 'Hmm, look again. Count them!',
  'more.not-same': 'Hmm, are they the same? Count them!',
  'ns.there-are': 'There are',
  'ns.apples': 'apples.',
  'ns.birds': 'birds.',
  'ns.ducks': 'ducks.',
  'ns.cookies': 'cookies.',
  'ns.balloons': 'balloons.',
  'ns.fish': 'fish.',
  'ns.ladybirds': 'ladybirds.',
  'ns.cars': 'cars.',
  'ns.one-more-comes': 'One more comes along!',
  'ns.one-goes-away': 'One goes away!',
  'ns.more-come': 'more come along!',
  'ns.how-many-now': 'How many are there now?',
  'ns.now-there-are': 'Now there are',
  'ns.count-them': "Let's count them. Point to each one!",
  'guess.quick-look': 'Quick! Have a look in the jar!',
  'guess.few-or-lot': 'Were there just a few sweets, or a lot of sweets?',
  'guess.a-few': 'a few',
  'guess.a-lot': 'a lot',
  'guess.yes-lot': 'A lot of sweets!',
  'guess.yes-few': 'Just a few!',
  'guess.how-many': "Now let's count them. How many are there?",
  'guess.sweets': 'sweets!',
};

// ---------------------------------------------------------------------------
// Games
// ---------------------------------------------------------------------------
const upTo = (n: number, from = 1) => Array.from({ length: n - from + 1 }, (_, i) => String(i + from));
const fingersToNumber: MatchWay = { show: 'fingers', pick: 'numeral', ask: ['numbers.fingers-how-many'], yes: ['$count', 'match.thats', '$name'] };
const numberToFingers: MatchWay = { show: 'numeral', pick: 'fingers', ask: ['numbers.fingers-find', '$name'], yes: ['$count', 'match.thats', '$name'] };

export const fingersGame: Game = {
  id: 'fingers',
  titleClip: 'numbers.fingers-title',
  icon: '🖐️',
  levels: [
    { id: '1-3', parentLabel: '1–3 fingers → number (pick from 2)', rounds: 5, activity: { kind: 'match-it', pool: upTo(3), choices: 2, ways: [fingersToNumber] } },
    { id: '1-5', parentLabel: '1–5: fingers → number (pick from 3)', rounds: 6, activity: { kind: 'match-it', pool: upTo(5), choices: 3, ways: [fingersToNumber] } },
    { id: '1-5-both', parentLabel: '1–5, both ways', rounds: 6, activity: { kind: 'match-it', pool: upTo(5), choices: 3, ways: [fingersToNumber, numberToFingers] } },
    { id: '1-10', parentLabel: '1–10 (two hands), both ways', rounds: 6, activity: { kind: 'match-it', pool: upTo(10), choices: 3, ways: [fingersToNumber, numberToFingers] } },
  ],
};

export const moreGame: Game = {
  id: 'more-fewer',
  titleClip: 'numbers.more-title',
  icon: '⚖️',
  levels: [
    { id: 'more-far', parentLabel: 'Which has more? (very different, up to 5)', rounds: 5, activity: { kind: 'pick-it', pool: ['q-more'], max: 5, modes: ['more'] } },
    { id: 'fewer-far', parentLabel: 'More or fewer? (very different, up to 6)', rounds: 6, activity: { kind: 'pick-it', pool: ['q-more'], max: 6, modes: ['more', 'fewer'] } },
    { id: 'same', parentLabel: 'More, fewer or the same?', rounds: 6, activity: { kind: 'pick-it', pool: ['q-more'], max: 6, modes: ['more', 'fewer', 'same'] } },
    { id: 'close', parentLabel: 'Close numbers (one apart), up to 10', rounds: 6, activity: { kind: 'pick-it', pool: ['q-more'], max: 10, modes: ['more', 'fewer', 'same', 'close'] } },
  ],
};

export const storyGame: Game = {
  id: 'number-stories',
  titleClip: 'numbers.story-title',
  icon: '🐦',
  levels: [
    { id: 'one-more', parentLabel: 'One more comes (up to 5)', rounds: 5, activity: { kind: 'pick-it', pool: ['q-story'], max: 5, modes: ['more'], choices: 3 } },
    { id: 'one-less', parentLabel: 'One goes away (up to 5)', rounds: 5, activity: { kind: 'pick-it', pool: ['q-story'], max: 5, modes: ['less'], choices: 3 } },
    { id: 'mixed', parentLabel: 'One more or one less (up to 10)', rounds: 6, activity: { kind: 'pick-it', pool: ['q-story'], max: 9, modes: ['more', 'less'], choices: 3 } },
    { id: 'add', parentLabel: 'Two or three more come (early adding)', rounds: 6, activity: { kind: 'pick-it', pool: ['q-story'], max: 8, modes: ['add', 'more'], choices: 4 } },
  ],
};

export const guessGame: Game = {
  id: 'guess-count',
  titleClip: 'numbers.guess-title',
  icon: '🍬',
  levels: [
    { id: 'few-lot', parentLabel: 'Quick look: a few or a lot?', rounds: 5, activity: { kind: 'pick-it', pool: ['q-guess'], max: 4 } },
    { id: 'count', parentLabel: 'A few or a lot, then count the few', rounds: 5, activity: { kind: 'pick-it', pool: ['q-guess'], max: 5, modes: ['count'] } },
    { id: 'count-6', parentLabel: 'Guess, then count up to 6', rounds: 6, activity: { kind: 'pick-it', pool: ['q-guess'], max: 6, modes: ['count'] } },
  ],
};

export const shareGame: Game = {
  id: 'share',
  titleClip: 'numbers.share-title',
  icon: '🧸',
  levels: [
    { id: '2x2', parentLabel: '2 friends, 4 treats', rounds: 3, activity: { kind: 'share', pool: ['q-share'], friends: [2, 2], each: [2, 2] } },
    { id: '2x3', parentLabel: '2 friends, 4–6 treats', rounds: 3, activity: { kind: 'share', pool: ['q-share'], friends: [2, 2], each: [2, 3] } },
    { id: '3', parentLabel: '3 friends, 6–9 treats', rounds: 3, activity: { kind: 'share', pool: ['q-share'], friends: [3, 3], each: [2, 3] } },
    { id: 'big', parentLabel: '2 or 3 friends, up to 12 treats', rounds: 3, activity: { kind: 'share', pool: ['q-share'], friends: [2, 3], each: [2, 4] } },
  ],
};
