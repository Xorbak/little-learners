import { useCallback, useEffect, useRef, useState } from 'react';
import type { LearnWordsConfig, LearningItem } from '../../types/learning';
import type { Mechanic, RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { fx } from '../../shared/fx';
import { today } from '../../shared/progress/store';
import { choicesFor, isKnownWord, isLearned, pickNextWord } from '../../shared/progress/spaced';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import { useChoiceSize } from '../touch-it/TouchIt';
import '../touch-it/touchIt.css';
import './learnWords.css';

/**
 * Learn Words: Touch It for a new language, run by spaced repetition.
 *
 * A new word is always shown on its own: "A new word! Hond. That means dog.
 * Touch the hond!" Words come back on a schedule (spaced.ts): due words first,
 * then a new word (if she isn't still learning several), then practice.
 * How many pictures to choose from grows with what she has learned: one until
 * she has learned 3 words, then 2, then 3 (6 learned), then 4 (10 learned).
 * The other pictures are always words she has already met.
 * Each word's English meaning comes with it the first time and after a mistake.
 */

const REMIND_AFTER_MS = 12000;
let lastWord: string | undefined;

const shuffle = <T,>(list: T[]): T[] => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const en = (item: LearningItem) => `af.en.${item.key}`;

function LearnWordsRound({ config, items, onCorrect, onWrong, onRoundComplete, stats }: RoundProps<LearnWordsConfig>) {
  const [round] = useState(() => {
    const st = (k: string) => stats?.(items[k]);
    const day = today();
    const pick = pickNextWord(config.pool, st, day, { previous: lastWord, maxLearning: config.maxLearning, newPerDay: config.newPerDay });
    lastWord = pick.key;
    const learned = config.pool.filter((k) => isLearned(st(k))).length;
    const known = config.pool.filter((k) => k !== pick.key && isKnownWord(st(k)));
    const count = pick.isNew ? 1 : Math.min(choicesFor(learned), known.length + 1);
    // Other pictures: words she has met, learned ones first
    const others = shuffle(known)
      .sort((a, b) => Number(isLearned(st(b))) - Number(isLearned(st(a))))
      .slice(0, count - 1);
    return { target: items[pick.key], isNew: pick.isNew, choices: shuffle([pick.key, ...others]).map((k) => items[k]), learned };
  });
  const { target, isNew, choices, learned } = round;
  const size = useChoiceSize(choices.length);
  const [found, setFound] = useState(false);
  const [wobble, setWobble] = useState<string | null>(null);
  const [hint, setHint] = useState(false);
  const missed = useRef(false);
  const done = useRef(false);
  const lastTap = useRef(0);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const ask = useCallback(() => void narrator.say(['af.touch', target.nameClip]), [target]);

  useEffect(() => {
    lastTap.current = Date.now();
    void narrator.say(isNew ? ['af.new-word', target.nameClip, 'af.means', en(target), 'af.touch', target.nameClip] : ['af.touch', target.nameClip]);
    const t = window.setInterval(() => {
      if (!done.current && Date.now() - lastTap.current > REMIND_AFTER_MS) {
        lastTap.current = Date.now();
        ask();
      }
    }, 1000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tap = (item: LearningItem, el: HTMLElement) => {
    if (done.current) return;
    lastTap.current = Date.now();
    if (item.key === target.key) {
      done.current = true;
      setFound(true);
      setHint(false);
      sfx.pop();
      fx.yay(el, { jump: 40 });
      // After a mistake, the meaning once more
      void narrator.say(missed.current ? ['af.yes', target.nameClip, 'af.means', en(target)] : ['af.yes', target.nameClip]);
      if (!missed.current) onCorrect(target);
      later(onRoundComplete, 1700);
      return;
    }
    sfx.boing();
    fx.wobble(el);
    setWobble(item.key);
    later(() => setWobble((w) => (w === item.key ? null : w)), 600);
    // Only the first answer counts for spaced repetition
    if (!missed.current) onWrong(target, item);
    missed.current = true;
    setHint(true);
    void narrator.say(['af.oops', item.nameClip, 'af.means', en(item), 'af.touch', target.nameClip]);
  };

  return (
    <div className="touch-round">
      <header className="touch-top">
        <SpeakerButton onPress={ask} />
        <span className="learn-count" aria-label={`${learned} words learned`}>
          ⭐ {learned}
        </span>
      </header>
      {isNew && (
        <div className="learn-new" aria-hidden="true">
          ✨
        </div>
      )}
      <div className="touch-field">
        {choices.map((c, i) => {
          const isTarget = c.key === target.key;
          const classes = [
            'touch-choice',
            'learn-choice',
            wobble === c.key && 'touch-choice--wobble',
            found && isTarget && 'touch-choice--found',
            found && !isTarget && 'touch-choice--fade',
            hint && isTarget && !found && 'touch-choice--hint',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button
              key={c.key}
              type="button"
              className={classes}
              style={{ width: size, height: size, animationDelay: `${i * 0.07}s` }}
              onPointerDown={(e) => {
                e.preventDefault();
                tap(c, e.currentTarget);
              }}
              aria-label={c.word}
            >
              <span className="touch-shape">
                <c.Display size={Math.round(size * 0.78)} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const learnWords: Mechanic<LearnWordsConfig> = {
  Round: LearnWordsRound,
  clips: {
    'af.new-word': 'A new word!',
    'af.means': 'That means',
    'af.touch': 'Touch the',
    'af.yes': 'Yes!',
    'af.oops': "Oops! That's",
  },
};
