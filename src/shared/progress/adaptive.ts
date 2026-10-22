import { progress, today } from './store';
import { isDue, isLearned, LEARNED_BOX, TOP_BOX } from './spaced';

/**
 * Picks the next item to practise, using spaced repetition (spaced.ts) in every
 * subject: things that are due today come first (the ones she knows least
 * first), new things are brought in, things she is still learning come up
 * often, and things she has learned only now and then, until they are due again.
 * Avoids asking for the same item twice in a row.
 */
export function pickAdaptive(sectionId: string, pool: string[], previous?: string): string {
  const candidates = pool.length > 1 ? pool.filter((k) => k !== previous) : pool;
  const day = today();

  const weights = candidates.map((key) => {
    const s = progress.item(`${sectionId}/${key}`);
    if (!s) return 4; // never seen: introduce it
    if (isDue(s, day)) return 6 + (TOP_BOX - (s.box ?? 1)); // due today: lower boxes first
    if (isLearned(s) && s.day !== day) return 0.5; // learned and not due: now and then
    const unsure = Math.max(0, 4 - (s.correct - s.wrong * 2));
    return 1 + unsure;
  });

  let roll = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < candidates.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

/**
 * Rough mastery label for the parent area. With spaced repetition, "knows" means
 * right on at least three different days (box 3 or more).
 */
export function masteryOf(sectionId: string, key: string): 'new' | 'practising' | 'knows' {
  const s = progress.item(`${sectionId}/${key}`);
  if (!s) return 'new';
  // Learned on three different days; or (from before spaced repetition) right lots of times
  if ((s.box ?? 0) >= LEARNED_BOX) return 'knows';
  return s.correct >= 6 && s.wrong * 3 <= s.correct ? 'knows' : 'practising';
}
