import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { LearningItem, PatternConfig } from '../../types/learning';
import type { Mechanic, RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { fx } from '../../shared/fx';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import './pattern.css';

/**
 * What Comes Next? A row like 🍎🍌🍎🍌❓ and a few answers below.
 * Right: the gap fills and the whole row "sings" (each one hops with a note),
 * so she hears the pattern too. Wrong: "Let's look again!" and the row sings
 * as a hint; after two misses the right answer glows.
 */

const shuffle = <T,>(list: T[]): T[] => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const UNITS: Record<PatternConfig['types'][number], number[]> = {
  AB: [0, 1],
  AAB: [0, 0, 1],
  ABB: [0, 1, 1],
  ABC: [0, 1, 2],
};

function build(config: PatternConfig, target: LearningItem, items: Record<string, LearningItem>) {
  const type = config.types[Math.floor(Math.random() * config.types.length)];
  const unit = UNITS[type];
  const kinds = Math.max(...unit) + 1;
  const parts = [target.key, ...shuffle(config.pool.filter((k) => k !== target.key))].slice(0, kinds);
  // Show the unit twice, then stop partway through the third time
  const into = Math.floor(Math.random() * unit.length);
  const shown = [...unit, ...unit, ...unit.slice(0, into)].map((i) => parts[i]);
  const answer = parts[unit[into]];
  const wrong = shuffle([...parts.filter((k) => k !== answer), ...shuffle(config.pool.filter((k) => !parts.includes(k)))]);
  const choices = shuffle([answer, ...wrong.slice(0, config.choices - 1)]).map((k) => items[k]);
  return { shown: shown.map((k) => items[k]), answer: items[answer], choices, noteOf: (key: string) => parts.indexOf(key) * 2 };
}

function PatternRound({ config, target, items, onRoundComplete }: RoundProps<PatternConfig>) {
  const [p] = useState(() => build(config, target, items));
  const [filled, setFilled] = useState(false);
  const [singing, setSinging] = useState<number | null>(null);
  const [wobble, setWobble] = useState<string | null>(null);
  const [hint, setHint] = useState(false);
  const misses = useRef(0);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const row = filled ? [...p.shown, p.answer] : p.shown;

  /** Each one hops in turn with its own note */
  const sing = (list: LearningItem[]) => {
    list.forEach((item, i) =>
      later(() => {
        setSinging(i);
        sfx.note(p.noteOf(item.key), 0.5);
      }, i * 380),
    );
    later(() => setSinging(null), list.length * 380 + 200);
  };

  useEffect(() => {
    void narrator.say(['pattern.what-next']);
    later(() => sing(p.shown), 1600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choose = (item: LearningItem, el?: HTMLElement) => {
    if (filled) return;
    if (item.key === p.answer.key) {
      sfx.pop();
      fx.burstAt(el, 'stars', { count: 6 });
      fx.haptic(12);
      setFilled(true);
      setHint(false);
      void narrator.say(['pattern.yes']);
      later(() => sing([...p.shown, p.answer]), 700);
      later(onRoundComplete, 700 + (p.shown.length + 1) * 380 + 900);
      return;
    }
    sfx.boing();
    setWobble(item.key);
    later(() => setWobble(null), 600);
    void narrator.say(['pattern.look-again']);
    later(() => sing(p.shown), 1300);
    misses.current += 1;
    if (misses.current >= 2) setHint(true);
  };

  return (
    <div className="pat-round">
      <header className="pat-top">
        <SpeakerButton
          onPress={() => {
            void narrator.say(['pattern.what-next']);
            later(() => sing(p.shown), 1400);
          }}
        />
      </header>
      <div className="pat-row" style={{ '--slots': p.shown.length + 1 } as CSSProperties}>
        {row.map((item, i) => (
          <span key={i} className={`pat-slot ${singing === i ? 'pat-slot--sing' : ''} ${filled && i === row.length - 1 ? 'pat-slot--new' : ''}`}>
            <item.Display size={64} />
          </span>
        ))}
        {!filled && <span className="pat-slot pat-slot--gap">?</span>}
      </div>
      <div className="pat-choices">
        {p.choices.map((c) => (
          <button
            key={c.key}
            type="button"
            className={`pat-choice ${wobble === c.key ? 'pat-choice--wobble' : ''} ${hint && c.key === p.answer.key ? 'pat-choice--hint' : ''} ${filled && c.key === p.answer.key ? 'pat-choice--used' : ''}`}
            onClick={(e) => choose(c, e.currentTarget)}
            aria-label={narrator.allClips()[c.nameClip]}
          >
            <c.Display size={80} />
          </button>
        ))}
      </div>
    </div>
  );
}

export const pattern: Mechanic<PatternConfig> = {
  Round: PatternRound,
  clips: {
    'pattern.title': 'What comes next?',
    'pattern.what-next': 'What comes next?',
    'pattern.yes': 'Yes! You finished the pattern!',
    'pattern.look-again': "Hmm, let's look again.",
  },
};
