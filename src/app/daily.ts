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
  /** A movement break (get up and move), not a game */
  move?: number;
}

/** Every day: numbers, stories and Afrikaans (spaced repetition needs a little every day) */
const CORE = ['numbers', 'stories', 'afrikaans'];
/** Four of these each day, taking turns (each comes up four days out of six) */
const ROTATE = ['colours', 'shapes', 'world', 'me', 'thinking', 'letters'];
const subjectsFor = (day: number) => {
  const r = Array.from({ length: 4 }, (_, i) => ROTATE[(day + i) % ROTATE.length]);
  return [CORE[0], r[0], r[1], CORE[1], r[2], CORE[2], r[3]];
};
/** Games left out of the daily rotation (free play and long-form games) */
const SKIP = new Set(['colours/mix-paint', 'numbers/memory-match', 'colours/memory-match', 'shapes/memory-match', 'letters/memory-match', 'me/take-turns', 'me/about-me', 'me/family']);

/** Games where one round is already a good little session */
const ONE_ROUND = new Set(['sort', 'puzzle', 'story-time', 'share']);

export const dayNumber = () => {
  const now = new Date();
  return Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
};

export function todaysPlan(): DailyStep[] {
  const day = dayNumber();
  const steps: DailyStep[] = [];
  if (findSection('feelings')) steps.push({ id: 'feelings/check-in', sectionId: 'feelings', gameId: 'check-in', rounds: 1 });
  let subjects = 0;
  const SUBJECTS = subjectsFor(day);
  SUBJECTS.forEach((sectionId, i) => {
    const section = findSection(sectionId);
    if (!section) return;
    const games = section.games.filter((g) => !SKIP.has(`${sectionId}/${g.id}`));
    const game = games[(day + i) % games.length];
    steps.push({ id: `${sectionId}/${game.id}`, sectionId, gameId: game.id, rounds: ONE_ROUND.has(game.id) ? 1 : sectionId === 'afrikaans' ? 4 : 2 });
    // A movement break after every two subjects (not at the very end)
    subjects++;
    if (subjects % 2 === 0 && subjects < SUBJECTS.length) {
      const n = subjects / 2;
      steps.push({ id: `move/${n}`, sectionId: '', gameId: '', rounds: 0, move: n });
    }
  });
  const art = findSection('art');
  if (art) {
    const game = art.games[day % art.games.length];
    steps.push({ id: `art/${game.id}`, sectionId: 'art', gameId: game.id, rounds: 1, treat: true });
  }
  return steps;
}

export const requiredSteps = (plan: DailyStep[]) => plan.filter((s) => !s.treat).map((s) => s.id);
