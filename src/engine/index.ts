import type { ActivityConfig } from '../types/learning';
import type { Mechanic } from './types';
import { popBalloons } from './pop-balloons/PopBalloons';
import { memoryMatch } from './memory-match/MemoryMatch';
import { feedMe } from './feed-me/FeedMe';
import { holdToFill } from './hold-to-fill/HoldToFill';
import { paintByNumbers } from './paint-by-numbers/PaintByNumbers';
import { flashCards } from './flash-cards/FlashCards';
import { touchIt } from './touch-it/TouchIt';
import { checkIn } from './check-in/CheckIn';
import { sort } from './sort/Sort';
import { pattern } from './pattern/Pattern';
import { oddOneOut } from './odd-one-out/OddOneOut';
import { music } from './music/Music';
import { trace } from './trace/Trace';
import { jigsaw } from './jigsaw/Jigsaw';

/**
 * Every game mechanic, keyed by its activity `kind`.
 * TypeScript makes sure each kind in ActivityConfig has exactly one mechanic here.
 *
 * To add a mechanic (e.g. 'feed-me', 'hold-to-fill'):
 *  1. add its config type to the ActivityConfig union in src/types/learning.ts
 *  2. build it in src/engine/<name>/
 *  3. register it below
 */
export const mechanics: { [K in ActivityConfig['kind']]: Mechanic<Extract<ActivityConfig, { kind: K }>> } = {
  'pop-balloons': popBalloons,
  'memory-match': memoryMatch,
  'feed-me': feedMe,
  'hold-to-fill': holdToFill,
  'paint-by-numbers': paintByNumbers,
  'flash-cards': flashCards,
  'touch-it': touchIt,
  'check-in': checkIn,
  sort,
  pattern,
  'odd-one-out': oddOneOut,
  music,
  trace,
  jigsaw,
};

export function mechanicFor<C extends ActivityConfig>(config: C): Mechanic<C> {
  return mechanics[config.kind] as unknown as Mechanic<C>;
}
