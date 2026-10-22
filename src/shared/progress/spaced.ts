import type { ItemStats } from './store';

/**
 * Spaced repetition, in "boxes" (the Leitner system).
 *
 * A word starts in box 1 the day she first meets it. Each later DAY she gets it
 * right it moves up a box, and waits longer before it comes back:
 *   box 1: again in the same session    box 4: 4 days
 *   box 2: tomorrow                      box 5: a week
 *   box 3: in 2 days                     box 6: 2 weeks
 * Getting it right twice on the same day doesn't move it twice: the spacing is
 * what makes it stick. Getting it wrong moves it down a box and brings it back
 * today. A word is "learned" from box 3: right on three different days.
 */
export const INTERVAL_DAYS = [0, 0, 1, 2, 4, 7, 14];
export const TOP_BOX = INTERVAL_DAYS.length - 1;
export const LEARNED_BOX = 3;

/** 'YYYY-MM-DD' plus n days */
export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number);
  const date = new Date(y, m - 1, d + n);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** The spaced-repetition part of an item after an answer */
export function srNext(s: ItemStats | undefined, correct: boolean, day: string): Pick<ItemStats, 'box' | 'due' | 'day' | 'intro'> {
  const box = s?.box ?? 0;
  const intro = s?.intro ?? day;
  if (!correct) {
    const down = Math.max(1, box - 1);
    return { box: down, due: day, day, intro };
  }
  if (box === 0) return { box: 1, due: day, day, intro };
  // Already moved up today (or met today): stays put
  if (s?.day === day) return { box, due: s.due ?? day, day, intro };
  const up = Math.min(TOP_BOX, box + 1);
  return { box: up, due: addDays(day, INTERVAL_DAYS[up]), day, intro };
}

export const isLearned = (s: ItemStats | undefined) => (s?.box ?? 0) >= LEARNED_BOX;
export const isKnownWord = (s: ItemStats | undefined) => (s?.box ?? 0) >= 1;
/** Due for practice today (and not practised yet today) */
export const isDue = (s: ItemStats | undefined, day: string) => !!s?.box && s.day !== day && (s.due ?? day) <= day;

/** How many to choose from: one at first, more as she learns words (3 learned → 2, 6 → 3, 10 → 4) */
export function choicesFor(learned: number): number {
  if (learned < 3) return 1;
  if (learned < 6) return 2;
  if (learned < 10) return 3;
  return 4;
}

/**
 * Which word next: words that are due first (lowest box first), then a new word
 * (if she isn't still learning several and hasn't met too many new ones today),
 * then more practice of words she is learning. Never the same word twice in a row.
 */
export function pickNextWord(
  pool: string[],
  stats: (key: string) => ItemStats | undefined,
  day: string,
  opts: { previous?: string; maxLearning: number; newPerDay: number },
): { key: string; isNew: boolean } {
  const notPrev = (k: string) => k !== opts.previous;
  const known = pool.filter((k) => isKnownWord(stats(k)));
  const due = known.filter((k) => isDue(stats(k), day) && notPrev(k)).sort((a, b) => (stats(a)!.box ?? 0) - (stats(b)!.box ?? 0));
  if (due.length) return { key: due[0], isNew: false };

  const learning = known.filter((k) => !isLearned(stats(k)));
  const newToday = known.filter((k) => stats(k)?.intro === day).length;
  const fresh = pool.find((k) => !isKnownWord(stats(k)));
  if (fresh && learning.length < opts.maxLearning && newToday < opts.newPerDay) return { key: fresh, isNew: true };

  // More practice: words still being learned come up most, learned ones now and then
  const options = known.filter(notPrev);
  if (!options.length) return fresh ? { key: fresh, isNew: true } : { key: known[0] ?? pool[0], isNew: !known.length };
  const weights = options.map((k) => (isLearned(stats(k)) ? 1 : 4));
  let roll = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < options.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return { key: options[i], isNew: false };
  }
  return { key: options[options.length - 1], isNew: false };
}
