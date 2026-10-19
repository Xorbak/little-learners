import { progress } from './store';

/**
 * Picks the next item to practise. Items she finds tricky, or hasn't seen yet,
 * come up more often; items she knows well still appear, just less.
 * Avoids asking for the same item twice in a row.
 */
export function pickAdaptive(sectionId: string, pool: string[], previous?: string): string {
  const candidates = pool.length > 1 ? pool.filter((k) => k !== previous) : pool;

  const weights = candidates.map((key) => {
    const s = progress.item(`${sectionId}/${key}`);
    if (!s) return 4; // never seen: introduce it
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

/** Rough mastery label for the parent area */
export function masteryOf(sectionId: string, key: string): 'new' | 'practising' | 'knows' {
  const s = progress.item(`${sectionId}/${key}`);
  if (!s) return 'new';
  return s.correct >= 6 && s.wrong * 3 <= s.correct ? 'knows' : 'practising';
}
