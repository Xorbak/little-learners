import type { ClipTable } from '../types/learning';
import type { StickerAction } from './stickers';

/**
 * Movement breaks in Today's lessons: get up and move like an animal while the
 * narrator counts. Gross motor, listening and counting together, and a break
 * from sitting. `demo` is how the animal shows the move first; `beat` is the
 * little move it makes on every count.
 */
export type MoveBeat = 'jump' | 'stomp' | 'sway' | 'stretch' | 'shake' | 'balance';

export interface Move {
  key: string;
  emoji: string;
  demo: StickerAction;
  beat: MoveBeat;
  count: number;
  /** What to do */
  says: string;
  /** Praise when the count is done */
  well: string;
}

export const MOVES: Move[] = [
  { key: 'frog', emoji: '🐸', demo: 'leap', beat: 'jump', count: 5, says: 'Hop like a frog! Crouch down low, and jump!', well: 'Great hopping!' },
  { key: 'dinosaur', emoji: '🦖', demo: 'stomp', beat: 'stomp', count: 6, says: 'Stomp like a dinosaur! Big, heavy feet!', well: 'What big stomps!' },
  { key: 'giraffe', emoji: '🦒', demo: 'stretch', beat: 'stretch', count: 5, says: 'Reach up tall like a giraffe! Stretch your arms up high, then touch your toes!', well: 'So tall!' },
  { key: 'penguin', emoji: '🐧', demo: 'waddle', beat: 'sway', count: 6, says: 'Waddle like a penguin! Arms down by your sides!', well: 'Waddle, waddle! Well done!' },
  { key: 'bunny', emoji: '🐰', demo: 'hop', beat: 'jump', count: 5, says: 'Jump like a bunny! Little bouncy jumps!', well: 'Bouncy bunny!' },
  { key: 'bee', emoji: '🐝', demo: 'buzz', beat: 'shake', count: 6, says: 'Flap your arms and buzz like a bee!', well: 'Bzzz! Busy bee!' },
  { key: 'monkey', emoji: '🐵', demo: 'swing', beat: 'sway', count: 6, says: 'Swing your arms like a monkey!', well: 'Ooh ooh, aah aah! Well done!' },
  { key: 'star', emoji: '⭐', demo: 'sparkle', beat: 'jump', count: 5, says: 'Star jumps! Jump your arms and legs out wide, then back in!', well: 'Super star jumps!' },
  { key: 'flamingo', emoji: '🦩', demo: 'wiggle', beat: 'balance', count: 5, says: 'Stand on one leg like a flamingo! Can you keep still?', well: 'Good balancing!' },
  { key: 'puppy', emoji: '🐶', demo: 'wiggle', beat: 'shake', count: 5, says: 'Shake, shake, shake like a wet puppy!', well: 'All dry! Woof!' },
  { key: 'crab', emoji: '🦀', demo: 'crawl', beat: 'sway', count: 6, says: 'Walk sideways like a crab! Snap your claws!', well: 'Snap snap! Clever crab!' },
  { key: 'rocket', emoji: '🚀', demo: 'blast', beat: 'jump', count: 5, says: 'Crouch down small like a rocket, and blast off with a big jump!', well: 'Blast off! Amazing!' },
];

/** Two different moves for a break, changing day by day */
export function movesFor(day: number, n: number): [Move, Move] {
  const i = (day * 2 + n * 5) % MOVES.length;
  const j = (i + 1 + ((day + n) % (MOVES.length - 1))) % MOVES.length;
  return [MOVES[i], MOVES[j === i ? (i + 1) % MOVES.length : j]];
}

export const moveClips: ClipTable = {
  'move.title': 'Move!',
  'move.time': 'Time to move! Stand up!',
  'move.ready': "Ready? Let's count!",
  'move.all-done': 'Well done! You can sit down now.',
  ...Object.fromEntries(MOVES.flatMap((m) => [
    [`move.${m.key}`, m.says],
    [`move.well.${m.key}`, m.well],
  ])),
};
