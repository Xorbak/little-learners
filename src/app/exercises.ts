import type { ClipTable } from '../types/learning';
import type { StickerAction } from './stickers';

/**
 * Exercises for movement breaks (Today's lessons) and play-time exercise breaks.
 * Human moves are shown by a little drawn kid (KidFigure.tsx); animal moves by
 * the animal itself. The narrator explains, the figure shows it, then counts
 * along while she does it.
 */
export type MoveBeat = 'jump' | 'stomp' | 'sway' | 'stretch' | 'shake' | 'balance';
export type KidPose = 'jacks' | 'run' | 'march' | 'toes' | 'hop' | 'twirl' | 'tiptoe' | 'wheelbarrow';

export interface Exercise {
  key: string;
  /** The drawn kid doing it, or an animal emoji */
  kid?: KidPose;
  emoji?: string;
  /** Animal: how it shows the move first */
  demo?: StickerAction;
  /** The little move on every count */
  beat: MoveBeat;
  count: number;
  /** Needs a grown-up to help */
  grownUp?: boolean;
  /** Picture for the grown-ups' list */
  icon: string;
  name: string;
  says: string;
  well: string;
}

export const EXERCISES: Exercise[] = [
  // The little kid
  { key: 'jumping-jacks', kid: 'jacks', beat: 'jump', count: 10, icon: '🤸', name: 'Jumping jacks', says: 'Jumping jacks! Jump your arms and legs out wide, then back together!', well: 'Brilliant jumping jacks!' },
  { key: 'run', kid: 'run', beat: 'jump', count: 10, icon: '🏃', name: 'Run on the spot', says: 'Run on the spot! Fast, fast feet!', well: 'Zoom! What a runner!' },
  { key: 'march', kid: 'march', beat: 'stomp', count: 10, icon: '🥁', name: 'Marching', says: 'March like a soldier! Knees up high, and swing your arms!', well: 'Left, right! Well marched!' },
  { key: 'toes', kid: 'toes', beat: 'stretch', count: 5, icon: '🙆', name: 'Reach up, touch your toes', says: 'Reach up to the sky, then bend down and touch your toes!', well: 'Super stretching!' },
  { key: 'hop-one-foot', kid: 'hop', beat: 'jump', count: 6, icon: '🦶', name: 'Hop on one foot', says: 'Hop on one foot! Arms out to help you balance!', well: 'Hoppity hop! Well done!' },
  { key: 'twirl', kid: 'twirl', beat: 'balance', count: 3, icon: '💃', name: 'Twirl around', says: 'Twirl around like a ballerina! Slowly, round and round.', well: 'Beautiful twirling!' },
  { key: 'tiptoe', kid: 'tiptoe', beat: 'balance', count: 8, icon: '🐭', name: 'Tiptoe walk', says: 'Walk on your tiptoes, as quiet as a mouse!', well: 'Shh! So quiet!' },
  { key: 'wheelbarrow', kid: 'wheelbarrow', beat: 'sway', count: 8, grownUp: true, icon: '🛞', name: 'Wheelbarrow walk (with a grown-up)', says: 'Wheelbarrow walk! Ask a grown-up to hold your legs, and walk on your hands!', well: 'Wheelbarrow champion!' },
  // Animals
  { key: 'bunny-hops', emoji: '🐰', demo: 'hop', beat: 'jump', count: 6, icon: '🐰', name: 'Bunny hops', says: 'Bunny hops! Put your hands up like ears, and hop, hop, hop!', well: 'Bouncy bunny!' },
  { key: 'froggy-hops', emoji: '🐸', demo: 'leap', beat: 'jump', count: 5, icon: '🐸', name: 'Froggy hops', says: 'Froggy hops! Squat down low, hands on the floor, and jump up high!', well: 'Ribbit! Great froggy hops!' },
  { key: 'bear-crawl', emoji: '🐻', demo: 'crawl', beat: 'sway', count: 8, icon: '🐻', name: 'Bear crawl', says: 'Bear crawl! Hands and feet on the floor, and walk like a big bear!', well: 'Grrr! Strong bear!' },
  { key: 'crab-walk', emoji: '🦀', demo: 'crawl', beat: 'sway', count: 6, icon: '🦀', name: 'Crab walk', says: 'Crab walk! Sit down, hands behind you, lift your tummy up, and walk sideways!', well: 'Snap snap! Clever crab!' },
  { key: 'kangaroo', emoji: '🦘', demo: 'leap', beat: 'jump', count: 5, icon: '🦘', name: 'Kangaroo jumps', says: 'Jump like a kangaroo! Big jumps forward!', well: 'Boing! Big kangaroo jumps!' },
  { key: 'elephant', emoji: '🐘', demo: 'stomp', beat: 'stomp', count: 6, icon: '🐘', name: 'Elephant stomps', says: 'Stomp like an elephant, and swing your arm like a trunk!', well: 'What a big elephant!' },
  { key: 'dinosaur', emoji: '🦖', demo: 'stomp', beat: 'stomp', count: 6, icon: '🦖', name: 'Dinosaur stomps', says: 'Stomp like a dinosaur! Big, heavy feet!', well: 'What big stomps!' },
  { key: 'flamingo', emoji: '🦩', demo: 'wiggle', beat: 'balance', count: 5, icon: '🦩', name: 'Flamingo balance', says: 'Stand on one leg like a flamingo! Can you keep still?', well: 'Good balancing!' },
  { key: 'penguin', emoji: '🐧', demo: 'waddle', beat: 'sway', count: 6, icon: '🐧', name: 'Penguin waddle', says: 'Waddle like a penguin! Arms down by your sides!', well: 'Waddle, waddle! Well done!' },
  { key: 'bee', emoji: '🐝', demo: 'buzz', beat: 'shake', count: 6, icon: '🐝', name: 'Busy bee', says: 'Flap your arms and buzz like a bee!', well: 'Bzzz! Busy bee!' },
  { key: 'puppy', emoji: '🐶', demo: 'wiggle', beat: 'shake', count: 5, icon: '🐶', name: 'Wet puppy shake', says: 'Shake, shake, shake like a wet puppy!', well: 'All dry! Woof!' },
  { key: 'monkey', emoji: '🐵', demo: 'swing', beat: 'sway', count: 6, icon: '🐵', name: 'Monkey arms', says: 'Swing your arms like a monkey!', well: 'Ooh ooh, aah aah! Well done!' },
  { key: 'giraffe', emoji: '🦒', demo: 'stretch', beat: 'stretch', count: 5, icon: '🦒', name: 'Giraffe stretch', says: 'Reach up tall like a giraffe! Stretch your arms up high!', well: 'So tall!' },
  { key: 'snake', emoji: '🐍', demo: 'crawl', beat: 'sway', count: 6, icon: '🐍', name: 'Snake wiggle', says: 'Lie on your tummy and wiggle like a snake! Sssss!', well: 'Sssssuper snake!' },
  { key: 'rocket', emoji: '🚀', demo: 'blast', beat: 'jump', count: 5, icon: '🚀', name: 'Rocket jumps', says: 'Crouch down small like a rocket, and blast off with a big jump!', well: 'Blast off! Amazing!' },
];

export const exerciseByKey = (key: string) => EXERCISES.find((e) => e.key === key);

/** Today's movement breaks: two exercises she can do alone, changing day by day */
export function exercisesForToday(day: number, n: number): Exercise[] {
  const solo = EXERCISES.filter((e) => !e.grownUp);
  const i = (day * 3 + n * 7) % solo.length;
  let j = (i + 5 + ((day + n) % 7)) % solo.length;
  if (j === i) j = (i + 1) % solo.length;
  return [solo[i], solo[j]];
}

/** Play-time breaks: n exercises from the ones grown-ups allowed, not the ones done last time */
export function pickExercises(allowed: string[], n: number, avoid: string[] = []): Exercise[] {
  let pool = EXERCISES.filter((e) => allowed.includes(e.key));
  if (!pool.length) pool = EXERCISES.filter((e) => !e.grownUp);
  const fresh = pool.filter((e) => !avoid.includes(e.key));
  const from = fresh.length >= n ? fresh : pool;
  const picks = [...from].sort(() => Math.random() - 0.5).slice(0, n);
  // One kid move and one animal move when possible, for variety
  const kid = picks.find((e) => e.kid);
  const animal = from.find((e) => e.emoji && !picks.includes(e));
  if (n === 2 && picks.every((e) => e.kid) && animal) picks[1] = animal;
  else if (n === 2 && !kid) {
    const k = from.find((e) => e.kid && !picks.includes(e));
    if (k) picks[1] = k;
  }
  return picks;
}

export const exerciseClips: ClipTable = {
  'move.title': 'Move!',
  'move.time': 'Time to move! Stand up!',
  'move.ready': "Ready? Let's count!",
  'move.all-done': 'Well done! You can sit down now.',
  'move.back-to-play': 'Well done! Now you can play again.',
  ...Object.fromEntries(
    EXERCISES.flatMap((e) => [
      [`move.${e.key}`, e.says],
      [`move.well.${e.key}`, e.well],
    ]),
  ),
};
