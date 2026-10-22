import { useEffect, useRef, useState } from 'react';
import type { LearningItem, MakePatternConfig } from '../../types/learning';
import type { Mechanic, RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { fx } from '../../shared/fx';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import '../touch-it/touchIt.css';
import './makePattern.css';

/**
 * Make Your Own Pattern: she taps pictures to build a row. As soon as the row
 * repeats (at least twice round, like 🍎🍌🍎🍌 or 🐶🐶🐱🐶🐶🐱), the row sings and
 * the narrator says the pattern. If the row is full without a pattern: "Can you
 * make it repeat?" and she can take some off.
 */

const MAX = 9;

/** The repeating unit, if the row is a pattern repeated at least twice (and not all the same) */
function patternOf(row: string[]): string[] | null {
  for (let len = 2; len <= 3; len++) {
    if (row.length < len * 2) continue;
    const unit = row.slice(0, len);
    if (new Set(unit).size < 2) continue;
    if (row.every((k, i) => k === unit[i % len])) return unit;
  }
  return null;
}

const shuffle = <T,>(list: T[]): T[] => [...list].sort(() => Math.random() - 0.5);

function MakePatternRound({ config, target, items, onCorrect, onRoundComplete }: RoundProps<MakePatternConfig>) {
  const [choices] = useState<LearningItem[]>(() => [target.key, ...shuffle(config.pool.filter((k) => k !== target.key))].slice(0, config.choices).map((k) => items[k]));
  const [row, setRow] = useState<string[]>([]);
  const [singing, setSinging] = useState<number | null>(null);
  const [made, setMade] = useState(false);
  const alive = useRef(true);
  useEffect(
    () => () => {
      alive.current = false;
    },
    [],
  );
  const ask = () => void narrator.say(['make.hello']);
  useEffect(ask, []);

  const sing = async (list: string[]) => {
    for (let i = 0; i < list.length; i++) {
      if (!alive.current) return;
      setSinging(i);
      sfx.note(choices.findIndex((c) => c.key === list[i]) * 2);
      await new Promise((r) => setTimeout(r, 330));
    }
    setSinging(null);
  };

  const add = (item: LearningItem, el: HTMLElement) => {
    if (made || row.length >= MAX) return;
    const next = [...row, item.key];
    setRow(next);
    sfx.pop();
    fx.squash(el, 0.4);
    const unit = next.length >= 4 && next.length % (patternOf(next)?.length ?? 99) === 0 ? patternOf(next) : null;
    // A pattern, repeated twice or more and ending on a whole repeat
    if (unit && next.length >= unit.length * 2 && (next.length >= 6 || unit.length === 2)) {
      setMade(true);
      onCorrect(target);
      void (async () => {
        await sing(next);
        fx.yay(undefined, { stars: 16 });
        await narrator.say(['make.yes', ...next.map((k) => items[k].nameClip)]);
        await narrator.say(['make.what-next', items[unit[0]].nameClip]);
        if (alive.current) window.setTimeout(onRoundComplete, 400);
      })();
      return;
    }
    if (next.length >= MAX) void narrator.say(['make.full']);
  };

  const takeOff = () => {
    if (made || !row.length) return;
    sfx.flip();
    setRow(row.slice(0, -1));
  };

  const size = Math.min(76, (window.innerWidth - 40) / MAX - 4);
  const big = Math.min(150, (window.innerWidth - 60) / choices.length - 16, window.innerHeight * 0.22);
  return (
    <div className="touch-round">
      <header className="touch-top">
        <SpeakerButton onPress={ask} />
      </header>
      <div className="make-body">
        <div className="make-row" aria-label="Your pattern">
          {Array.from({ length: MAX }, (_, i) => {
            const key = row[i];
            const Item = key ? items[key].Display : null;
            return (
              <span key={i} className={`make-slot ${key ? 'make-slot--full' : ''} ${singing === i ? 'make-slot--sing' : ''}`} style={{ width: size, height: size }}>
                {Item && <Item size={size * 0.8} />}
              </span>
            );
          })}
        </div>
        <button type="button" className="make-back" onClick={takeOff} aria-label="Take one off" disabled={!row.length || made}>
          ↩️
        </button>
        <div className="make-choices">
          {choices.map((c, i) => (
            <button
              key={c.key}
              type="button"
              className="touch-choice make-choice"
              style={{ width: big, height: big, animationDelay: `${i * 0.08}s` }}
              onPointerDown={(e) => {
                e.preventDefault();
                add(c, e.currentTarget);
              }}
              aria-label={narrator.allClips()[c.nameClip]}
            >
              <c.Display size={big * 0.75} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export const makePattern: Mechanic<MakePatternConfig> = {
  Round: MakePatternRound,
  clips: {
    'make.hello': 'Make your own pattern! Tap the pictures to put them in a row, and make it repeat.',
    'make.yes': 'You made a pattern!',
    'make.what-next': 'And what comes next? The',
    'make.full': 'The row is full! Can you make it repeat? Tap the arrow to take some off.',
  },
};
