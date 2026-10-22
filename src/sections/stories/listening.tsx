import type { ClipId, LearningItem, QuizAnswer } from '../../types/learning';
import { Pic } from '../../shared/ui/scenes';
import { picAnswer, pickNew, pickOne, quizItem, shuffle, textAnswer } from '../../shared/quiz';
import { EVERYDAY_SOUNDS, playEveryday, type EverydaySound } from '../../shared/audio/everyday';
import { progress } from '../../shared/progress/store';
import { hasName } from '../../app/name';

/**
 * Listening and early reading (NCF Communication): rhymes, sounds around us,
 * remembering a list in order, finding her written name, signs around us.
 */

const clips: Record<string, string> = {};

// ---------------------------------------------------------------------------
// Rhyme time
// ---------------------------------------------------------------------------
const RHYMES: [string, string, string, string][] = [
  ['cat', '🐱', 'hat', '👒'],
  ['dog', '🐶', 'frog', '🐸'],
  ['bee', '🐝', 'tree', '🌳'],
  ['car', '🚗', 'star', '⭐'],
  ['cake', '🎂', 'snake', '🐍'],
  ['mouse', '🐭', 'house', '🏠'],
  ['bear', '🐻', 'chair', '🪑'],
  ['fox', '🦊', 'box', '📦'],
  ['goat', '🐐', 'boat', '⛵'],
  ['moon', '🌙', 'spoon', '🥄'],
  ['sock', '🧦', 'clock', '⏰'],
  ['fish', '🐟', 'dish', '🍽️'],
  ['whale', '🐳', 'snail', '🐌'],
  ['rain', '🌧️', 'train', '🚂'],
  ['nose', '👃', 'rose', '🌹'],
  ['bed', '🛏️', 'bread', '🍞'],
  ['bell', '🔔', 'shell', '🐚'],
  ['cone', '🍦', 'phone', '📱'],
  ['hen', '🐔', 'ten', '🔟'],
  ['bug', '🐛', 'mug', '☕'],
];
const RHYME_WORDS = RHYMES.flatMap(([a, ea, b, eb]) => [
  [a, ea],
  [b, eb],
]);
for (const [w] of RHYME_WORDS) {
  clips[`rhyme.w.${w}`] = w;
  clips[`rhyme.q.${w}`] = `${w}?`;
  clips[`rhyme.x.${w}`] = `${w},`;
}
Object.assign(clips, {
  'rhyme.what-rhymes': 'What rhymes with',
  'rhyme.or': 'or',
  'rhyme.they-rhyme': 'they rhyme!',
  'rhyme.hmm': 'Hmm.',
  'rhyme.dont-rhyme': "they don't rhyme. Listen again.",
});

const rhyme = quizItem('q-rhyme', (c) => {
  const pair = pickNew('rhyme', RHYMES);
  const flip = Math.random() < 0.5;
  const [word, wordEmoji, right, rightEmoji] = flip ? [pair[2], pair[3], pair[0], pair[1]] : pair;
  const others = shuffle(RHYMES.filter((p) => p !== pair))
    .slice(0, (c.choices ?? 3) - 1)
    .map((p) => (Math.random() < 0.5 ? [p[0], p[1]] : [p[2], p[3]]));
  const list = shuffle([[right, rightEmoji], ...others]);
  const answers: QuizAnswer[] = list.map(([w, e]) => ({
    ...picAnswer(w, e, `rhyme.w.${w}`, w === right),
    says: ['rhyme.hmm', `rhyme.x.${word}`, `rhyme.x.${w}`, 'rhyme.dont-rhyme'],
  }));
  return {
    Scene: ({ width, height }) => <Pic e={wordEmoji} size={Math.min(width, height)} />,
    ask: ['rhyme.what-rhymes', `rhyme.q.${word}`, ...list.flatMap(([w], i) => (i === list.length - 1 ? ['rhyme.or', `rhyme.q.${w}`] : [`rhyme.q.${w}`]))],
    answers,
    fixedOrder: true,
    yes: ['pick.yes', `rhyme.x.${word}`, `rhyme.x.${right}`, 'rhyme.they-rhyme'],
  };
});

// ---------------------------------------------------------------------------
// Sounds around us
// ---------------------------------------------------------------------------
const SOUND_PICTURES: Record<EverydaySound, [string, string]> = {
  phone: ['📱', 'a phone ringing'],
  doorbell: ['🔔', 'the doorbell'],
  'car-horn': ['🚗', 'a car hooting'],
  siren: ['🚓', 'a police car'],
  clock: ['⏰', 'a clock ticking'],
  rain: ['🌧️', 'the rain'],
  drum: ['🥁', 'a drum'],
  'bike-bell': ['🚲', 'a bicycle bell'],
  train: ['🚂', 'a train'],
  knock: ['🚪', 'someone knocking on the door'],
  thunder: ['⛈️', 'thunder'],
  tap: ['🚰', 'water from the tap'],
  bird: ['🐦', 'a bird singing'],
  snore: ['😴', 'someone snoring'],
  kettle: ['🫖', 'the kettle'],
};
for (const [k, [, words]] of Object.entries(SOUND_PICTURES)) clips[`sound.n.${k}`] = words;
Object.assign(clips, {
  'sound.listen': 'Listen! What makes this sound?',
  'sound.listen-again': 'Listen again!',
  'sound.its': "Yes! It's",
});
export const EASY_SOUNDS: EverydaySound[] = ['phone', 'doorbell', 'drum', 'bird', 'rain', 'car-horn'];
export const MORE_SOUNDS: EverydaySound[] = [...EASY_SOUNDS, 'clock', 'siren', 'train', 'knock'];

const sounds = quizItem('q-sound', (c) => {
  const pool = (c.modes as EverydaySound[] | undefined) ?? [...EVERYDAY_SOUNDS];
  const key = pickNew('sound', pool);
  const others = shuffle(pool.filter((k) => k !== key)).slice(0, (c.choices ?? 3) - 1);
  return {
    Scene: ({ width, height }) => <Pic e="👂" size={Math.min(width, height) * 0.8} style={{ animation: 'fx-bob 1.4s ease-in-out infinite' }} />,
    ask: ['sound.listen'],
    sound: () => playEveryday(key),
    answers: [key, ...others].map((k) => ({ ...picAnswer(k, SOUND_PICTURES[k][0], `sound.n.${k}`, k === key), says: ['pick.oops', `sound.n.${k}`, 'sound.listen-again'] })),
    yes: ['sound.its', `sound.n.${key}`],
  };
});

// ---------------------------------------------------------------------------
// Listen and touch, in order: "Touch the cat, then the ball!"
// ---------------------------------------------------------------------------
const LIST_THINGS: [string, string][] = [
  ['cat', '🐱'],
  ['dog', '🐶'],
  ['ball', '⚽'],
  ['car', '🚗'],
  ['apple', '🍎'],
  ['fish', '🐟'],
  ['star', '⭐'],
  ['house', '🏠'],
  ['tree', '🌳'],
  ['shoe', '👟'],
  ['duck', '🦆'],
  ['moon', '🌙'],
  ['cake', '🎂'],
  ['boat', '⛵'],
  ['flower', '🌸'],
  ['banana', '🍌'],
];
for (const [k] of LIST_THINGS) {
  clips[`listen.n.${k}`] = `${k},`;
  clips[`listen.say.${k}`] = k;
}
Object.assign(clips, {
  'listen.touch-the': 'Touch the',
  'listen.then-the': 'then the',
  'listen.yes': 'Yes! You remembered them all!',
  'listen.oops': 'Oops! Listen again.',
});

const listenInOrder = quizItem('q-listen', (c) => {
  const many = c.max ?? 2;
  const picks = shuffle(LIST_THINGS).slice(0, Math.max(many + 1, c.choices ?? many + 2));
  const targets = picks.slice(0, many);
  const ask: ClipId[] = targets.flatMap(([k], i) => [i === 0 ? 'listen.touch-the' : 'listen.then-the', `listen.n.${k}`]);
  return {
    ask,
    answers: shuffle(picks).map(([k, e]) => ({ ...picAnswer(k, e, `listen.say.${k}`, targets.findIndex(([t]) => t === k) + 1 || undefined), says: ['listen.oops'] })),
    fixedOrder: true,
    inOrder: true,
    yes: ['listen.yes'],
  };
});

// ---------------------------------------------------------------------------
// Find my name
// ---------------------------------------------------------------------------
const NAMES = ['Thabo', 'Lindiwe', 'Sipho', 'Emma', 'Liam', 'Zara', 'Pieter', 'Ayanda', 'Noah', 'Lerato', 'Ben', 'Anya', 'Kagiso', 'Lily', 'Musa', 'Ella', 'Jacob', 'Naledi', 'Max', 'Zoe', 'Mia', 'Amir', 'Precious', 'Tom'];
for (const n of NAMES) clips[`name.n.${n.toLowerCase()}`] = n;
Object.assign(clips, {
  'name.find-yours': 'Find your name! Which one says',
  'name.find': 'Which name says',
  'name.that-says': 'That says',
  'name.oops': 'Oops! That one says',
  'name.ask-grown-up': 'Ask a grown-up to type your name, and then you can find it!',
});

const findMyName = quizItem('q-name', (c) => {
  const own = progress.profile().name;
  const mine = hasName(own) ? own.trim() : '';
  const target = mine || pickOne(NAMES);
  const clip = mine ? 'shared.child-name' : `name.n.${target.toLowerCase()}`;
  const first = target[0].toUpperCase();
  const same = (c.modes ?? []).includes('same-letter');
  const pool = NAMES.filter((n) => n.toLowerCase() !== target.toLowerCase());
  const tricky = pool.filter((n) => n[0].toUpperCase() === first);
  const different = shuffle(pool.filter((n) => n[0].toUpperCase() !== first));
  const count = (c.choices ?? 2) - 1;
  const others = same && tricky.length ? [pickOne(tricky), ...different].slice(0, count) : different.slice(0, count);
  return {
    ask: mine ? ['name.find-yours', clip] : ['name.find', clip],
    answers: [textAnswer('me', target, true, clip), ...others.map((n) => ({ ...textAnswer(n, n, false, `name.n.${n.toLowerCase()}`), says: ['name.oops', `name.n.${n.toLowerCase()}`] }))],
    yes: ['pick.yes', 'name.that-says', clip],
  };
});

// ---------------------------------------------------------------------------
// Signs around us
// ---------------------------------------------------------------------------
function ExitSign({ size }: { size: number }) {
  return (
    <span className="sign-exit" style={{ fontSize: size * 0.2, padding: `${size * 0.05}px ${size * 0.08}px` }}>
      🏃 EXIT
    </span>
  );
}

interface Sign {
  key: string;
  emoji?: string;
  name: string;
  means: string;
}
const SIGNS: Sign[] = [
  { key: 'stop', emoji: '🛑', name: 'the STOP sign', means: 'STOP! It means stop, look, and listen.' },
  { key: 'toilet', emoji: '🚻', name: 'the toilet sign', means: 'This is where the toilets are.' },
  { key: 'traffic-light', emoji: '🚦', name: 'the traffic light', means: 'Red means stop. Green means go.' },
  { key: 'no-entry', emoji: '⛔', name: 'the no entry sign', means: "No entry! Don't go in here." },
  { key: 'crossing', emoji: '🚸', name: 'the children crossing sign', means: 'Children cross the road here, so cars must go slowly.' },
  { key: 'hospital', emoji: '🏥', name: 'the hospital', means: 'The hospital, where doctors and nurses help people who are sick or hurt.' },
  { key: 'exit', name: 'the way out sign', means: 'EXIT! This is the way out.' },
  { key: 'poison', emoji: '☠️', name: 'the danger sign', means: "Danger! Poison! Don't touch it, and tell a grown-up." },
  { key: 'warning', emoji: '⚠️', name: 'the be careful sign', means: 'Be careful! Something here could hurt you.' },
  { key: 'electric', emoji: '⚡', name: 'the electricity sign', means: 'Danger! Electricity! Never touch it.' },
  { key: 'recycle', emoji: '♻️', name: 'the recycling sign', means: 'Recycling! Bottles, tins and paper go here, to be made into new things.' },
  { key: 'wheelchair', emoji: '♿', name: 'the wheelchair sign', means: 'This place is kept for people in wheelchairs.' },
  { key: 'bus-stop', emoji: '🚏', name: 'the bus stop', means: 'Wait here for the bus.' },
  { key: 'no-smoking', emoji: '🚭', name: 'the no smoking sign', means: 'No smoking here.' },
];
for (const s of SIGNS) {
  clips[`sign.n.${s.key}`] = s.name;
  clips[`sign.m.${s.key}`] = s.means;
}
Object.assign(clips, { 'sign.find': 'Find' });
export const SIGN_LEVELS = {
  first: ['stop', 'toilet', 'traffic-light'],
  more: ['stop', 'toilet', 'traffic-light', 'no-entry', 'crossing', 'hospital', 'exit'],
  danger: ['poison', 'warning', 'electric', 'no-entry', 'stop'],
  all: SIGNS.map((s) => s.key),
};

const signs = quizItem('q-sign', (c) => {
  const pool = SIGNS.filter((s) => (c.modes ?? SIGN_LEVELS.all).includes(s.key));
  const sign = pickNew('sign', pool);
  const others = shuffle(pool.filter((s) => s !== sign)).slice(0, (c.choices ?? 3) - 1);
  return {
    ask: ['sign.find', `sign.n.${sign.key}`],
    answers: [sign, ...others].map((s) => ({
      key: s.key,
      clip: `sign.n.${s.key}`,
      right: s === sign,
      View: s.emoji ? ({ size }: { size: number }) => <Pic e={s.emoji!} size={size} /> : ExitSign,
    })),
    yes: ['pick.yes', `sign.m.${sign.key}`],
  };
});

export const listeningItems: Record<string, LearningItem> = {
  'q-rhyme': rhyme,
  'q-sound': sounds,
  'q-listen': listenInOrder,
  'q-name': findMyName,
  'q-sign': signs,
};
export const listeningClips = clips;
