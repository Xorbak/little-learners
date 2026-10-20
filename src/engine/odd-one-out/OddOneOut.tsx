import { useEffect, useRef, useState } from 'react';
import type { LearningItem, OddOneOutConfig } from '../../types/learning';
import type { Mechanic, RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { fx } from '../../shared/fx';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import '../touch-it/touchIt.css';

/**
 * Odd One Out: three things that belong together and one that doesn't.
 * "Which one doesn't belong?" Right: "Yes! The car! The others are all fruit."
 */

const shuffle = <T,>(list: T[]): T[] => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function deal(config: OddOneOutConfig, target: LearningItem, items: Record<string, LearningItem>) {
  // The target is the odd one; the others come from one other group
  const pool = config.pool.map((k) => items[k]);
  const groups = [...new Set(pool.map((i) => i.group!.key))].filter((g) => g !== target.group!.key && pool.filter((i) => i.group!.key === g).length >= config.choices - 1);
  const g = groups[Math.floor(Math.random() * groups.length)];
  const same = shuffle(pool.filter((i) => i.group!.key === g)).slice(0, config.choices - 1);
  return { odd: target, groupClip: same[0].group!.clip, all: shuffle([target, ...same]) };
}

function OddRound({ config, target, items, onCorrect, onWrong, onRoundComplete }: RoundProps<OddOneOutConfig>) {
  const [d] = useState(() => deal(config, target, items));
  const [wobble, setWobble] = useState<string | null>(null);
  const [found, setFound] = useState(false);
  const [hint, setHint] = useState(false);
  const misses = useRef(0);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const ask = () => void narrator.say(['odd.which']);
  useEffect(ask, []);

  const size = Math.floor(Math.min(200, (window.innerWidth - 50) / 2, (window.innerHeight - 170) / 2));

  const tap = (item: LearningItem, el?: HTMLElement) => {
    if (found) return;
    if (item.key === d.odd.key) {
      setFound(true);
      sfx.pop();
      fx.yay(el, { jump: 40 });
      void narrator.say(['odd.yes', d.odd.nameClip, 'odd.others-are', d.groupClip]);
      onCorrect(target);
      later(onRoundComplete, 3200);
      return;
    }
    sfx.boing();
    setWobble(item.key);
    later(() => setWobble(null), 600);
    onWrong(target, item);
    void narrator.say(['odd.look-again']);
    misses.current += 1;
    if (misses.current >= 2) setHint(true);
  };

  return (
    <div className="touch-round">
      <header className="touch-top">
        <SpeakerButton onPress={ask} />
      </header>
      <div className="touch-field">
        {d.all.map((item, i) => {
          const isOdd = item.key === d.odd.key;
          return (
            <button
              key={item.key}
              type="button"
              className={['touch-choice', wobble === item.key && 'touch-choice--wobble', found && isOdd && 'touch-choice--found', found && !isOdd && 'touch-choice--fade', hint && isOdd && !found && 'touch-choice--hint']
                .filter(Boolean)
                .join(' ')}
              style={{ width: size, height: size, animationDelay: `${i * 0.07}s` }}
              onClick={(e) => tap(item, e.currentTarget)}
              aria-label={narrator.allClips()[item.nameClip]}
            >
              <item.Display size={Math.round(size * 0.8)} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const oddOneOut: Mechanic<OddOneOutConfig> = {
  Round: OddRound,
  clips: {
    'odd.title': 'Odd one out!',
    'odd.which': "Which one doesn't belong?",
    'odd.yes': 'Yes! The',
    'odd.others-are': "doesn't belong! The others are all",
    'odd.look-again': 'Hmm, that one goes with the others. Look again!',
  },
};
