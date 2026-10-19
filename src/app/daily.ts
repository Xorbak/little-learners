import { findSection } from './registry';

/**
 * Today's lessons: a little of everything, in a set order.
 * The game for each subject rotates day by day, so she meets all of them over a week.
 * Each stop is short (2 rounds); those rounds count towards her levels.
 */

export interface DailyStep {
  id: string;
  sectionId: string;
  gameId: string;
  rounds: number;
  /** Fun extra at the end; not needed to finish the day */
  treat?: boolean;
}

const SUBJECTS = ['numbers', 'colours', 'shapes', 'letters', 'world', 'thinking'];
/** Games left out of the daily rotation (free play and long-form games) */
const SKIP = new Set(['colours/mix-paint', 'numbers/memory-match', 'colours/memory-match', 'shapes/memory-match', 'letters/memory-match']);

const dayNumber = () => {
  const now = new Date();
  return Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
};

export function todaysPlan(): DailyStep[] {
  const day = dayNumber();
  const steps: DailyStep[] = [];
  if (findSection('feelings')) steps.push({ id: 'feelings/check-in', sectionId: 'feelings', gameId: 'check-in', rounds: 1 });
  SUBJECTS.forEach((sectionId, i) => {
    const section = findSection(sectionId);
    if (!section) return;
    const games = section.games.filter((g) => !SKIP.has(`${sectionId}/${g.id}`));
    const game = games[(day + i) % games.length];
    steps.push({ id: `${sectionId}/${game.id}`, sectionId, gameId: game.id, rounds: game.id === 'sort' || game.id === 'puzzle' ? 1 : 2 });
  });
  const art = findSection('art');
  if (art) {
    const game = art.games[day % art.games.length];
    steps.push({ id: `art/${game.id}`, sectionId: 'art', gameId: game.id, rounds: 1, treat: true });
  }
  return steps;
}

export const requiredSteps = (plan: DailyStep[]) => plan.filter((s) => !s.treat).map((s) => s.id);
