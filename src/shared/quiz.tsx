import type { ClipId, LearningItem, OrderSet, QuizAnswer } from '../types/learning';
import { Pic } from './ui/scenes';

/**
 * Helpers for making Pick It questions and Put In Order sets.
 */

export const rand = (from: number, to: number) => from + Math.floor(Math.random() * (to - from + 1));
export const pickOne = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];
export function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** A question item: what the target of a Pick It round is (not shown in "What she knows") */
export function quizItem(key: string, quiz: NonNullable<LearningItem['quiz']>, nameClip = 'pick.yes'): LearningItem {
  return { key, nameClip, pluralClip: nameClip, track: false, Display: () => null, quiz };
}

/** An item to put in order */
export function orderItem(key: string, orderSet: OrderSet): LearningItem {
  return {
    key,
    nameClip: orderSet.askClip,
    pluralClip: orderSet.askClip,
    track: false,
    orderSet,
    Display: ({ size }) => <Pic e={orderSet.steps.map((s) => s.emoji).join('')} size={size / 3} />,
  };
}

/** An answer card showing an emoji */
export const picAnswer = (key: string, emoji: string, clip?: ClipId, right?: boolean | number, scale?: number): QuizAnswer => ({
  key,
  clip,
  right,
  View: ({ size }) => <Pic e={emoji} size={size} scale={scale} />,
});

/** An answer card with writing on it (names, words) */
export const textAnswer = (key: string, text: string, right?: boolean, clip?: ClipId): QuizAnswer => ({
  key,
  clip,
  right,
  View: ({ size }) => (
    <span className="pick-text" style={{ fontSize: Math.min(size * 0.34, (size * 1.6) / Math.max(3, text.length)) }}>
      {text}
    </span>
  ),
});

/**
 * A simple fixed question: something to look at, a question, and answers
 * (the first is right). Makes clips from the words given.
 */
export interface SimpleQuestion {
  key: string;
  /** Picture at the top (emoji) */
  scene?: string;
  /** The question, in words */
  ask: string;
  /** Answers: [emoji, words]; the first is right */
  answers: [string, string][];
  /** Said when right (after "Yes!") */
  yes?: string;
}

export function simpleQuestions(prefix: string, list: SimpleQuestion[]) {
  const items: Record<string, LearningItem> = {};
  const clips: Record<string, string> = {};
  for (const q of list) {
    const id = `${prefix}.${q.key}`;
    clips[`${id}.ask`] = q.ask;
    if (q.yes) clips[`${id}.yes`] = q.yes;
    q.answers.forEach(([, words], i) => (clips[`${id}.a${i}`] = words));
    items[q.key] = quizItem(
      q.key,
      () => ({
        Scene: q.scene ? ({ width, height }) => <Pic e={q.scene!} size={Math.min(width, height)} scale={q.scene!.length > 2 ? 0.7 : 1} /> : undefined,
        ask: [`${id}.ask`],
        answers: q.answers.map(([emoji], i) => picAnswer(`a${i}`, emoji, `${id}.a${i}`, i === 0)),
        yes: q.yes ? ['pick.yes', `${id}.yes`] : ['pick.yes', `${id}.a0`],
      }),
      `${id}.ask`,
    );
  }
  return { items, clips };
}
