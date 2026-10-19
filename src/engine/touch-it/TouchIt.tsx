import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { LearningItem, TouchItConfig } from '../../types/learning';
import type { Mechanic, RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import './touchIt.css';

/**
 * Touch It: "Touch the circle!" A few things sit still on the screen; she taps
 * the one that was named. Listening, not matching: the target is never shown.
 * A wrong tap wobbles and says what it is ("Oops! That's the square"), then asks again.
 * Later levels vary colour, size and tilt so she learns the shape, not the colour.
 */

const REMIND_AFTER_MS = 12000;
const HINT_AFTER_MISSES = 2;
const PALETTE = ['#4dabf7', '#ff6b6b', '#69db7c', '#ffa94d', '#b197fc', '#fcc419', '#f06595', '#38d9a9'];
const SAME_COLOUR = '#4dabf7';

const shuffle = <T,>(list: T[]): T[] => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

interface Choice {
  item: LearningItem;
  colour: string;
  tilt: number;
  scale: number;
}

function dealChoices(config: TouchItConfig, target: LearningItem, items: Record<string, LearningItem>): Choice[] {
  const others = shuffle(config.pool.filter((k) => k !== target.key)).slice(0, config.choices - 1);
  const colours = shuffle(PALETTE);
  return shuffle([target.key, ...others]).map((k, i) => ({
    item: items[k],
    colour: config.varied === 'none' ? SAME_COLOUR : colours[i % colours.length],
    tilt: config.varied === 'all' ? Math.round(Math.random() * 70 - 35) : 0,
    scale: config.varied === 'all' ? 0.72 + Math.random() * 0.28 : 1,
  }));
}

function useChoiceSize(count: number) {
  const measure = useCallback(() => {
    const w = window.innerWidth - 32;
    const h = window.innerHeight - 130;
    const landscape = w >= h;
    const cols = count <= 3 ? (landscape ? count : 1) : landscape ? Math.ceil(count / 2) : 2;
    const rows = Math.ceil(count / cols);
    return Math.floor(Math.min(240, (w - 24 * (cols - 1)) / cols, (h - 24 * (rows - 1)) / rows));
  }, [count]);
  const [size, setSize] = useState(measure);
  useEffect(() => {
    const update = () => setSize(measure());
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [measure]);
  return size;
}

function TouchItRound({ config, target, items, onCorrect, onWrong, onRoundComplete }: RoundProps<TouchItConfig>) {
  const [choices] = useState(() => dealChoices(config, target, items));
  const size = useChoiceSize(choices.length);
  const [wobble, setWobble] = useState<string | null>(null);
  const [found, setFound] = useState(false);
  const [hint, setHint] = useState(false);

  const misses = useRef(0);
  const lastTapRef = useRef(0);
  const doneRef = useRef(false);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const askClip = config.askClip ?? 'touch.touch-the';
  const askWord = config.askWith === 'sound' && target.soundClip ? target.soundClip : target.nameClip;
  const sayPrompt = useCallback(() => void narrator.say([askClip, askWord]), [askClip, askWord]);
  // Animals: after the name, also make the sound ("Yes! That's the cow! Moo!")
  const withSound = (item: LearningItem) => (config.askWith === 'sound' && item.soundClip ? [item.soundClip] : []);

  useEffect(() => {
    lastTapRef.current = Date.now();
    sayPrompt();
    const timer = window.setInterval(() => {
      if (!doneRef.current && Date.now() - lastTapRef.current > REMIND_AFTER_MS) {
        lastTapRef.current = Date.now();
        sayPrompt();
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [sayPrompt]);

  const tap = (choice: Choice) => {
    if (doneRef.current) return;
    lastTapRef.current = Date.now();
    if (choice.item.key === target.key) {
      doneRef.current = true;
      setFound(true);
      setHint(false);
      sfx.pop();
      void narrator.say([config.yesClip ?? 'touch.yes-thats', target.nameClip, ...withSound(target)]);
      onCorrect(target);
      later(onRoundComplete, 1500);
      return;
    }
    sfx.boing();
    setWobble(choice.item.key);
    later(() => setWobble((w) => (w === choice.item.key ? null : w)), 600);
    onWrong(target, choice.item);
    void narrator.say([config.oopsClip ?? 'touch.oops-thats', choice.item.nameClip, ...withSound(choice.item), askClip, askWord]);
    misses.current += 1;
    if (misses.current >= HINT_AFTER_MISSES) setHint(true);
  };

  return (
    <div className="touch-round">
      <header className="touch-top">
        <SpeakerButton onPress={sayPrompt} />
      </header>
      <div className="touch-field">
        {choices.map((c, i) => {
          const Shape = c.item.Plain ?? c.item.Display;
          const isTarget = c.item.key === target.key;
          const classes = [
            'touch-choice',
            wobble === c.item.key && 'touch-choice--wobble',
            found && isTarget && 'touch-choice--found',
            found && !isTarget && 'touch-choice--fade',
            hint && isTarget && !found && 'touch-choice--hint',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button
              key={c.item.key}
              type="button"
              className={classes}
              style={{ width: size, height: size, color: c.colour, animationDelay: `${i * 0.07}s`, '--tilt': `${c.tilt}deg` } as CSSProperties}
              onPointerDown={(e) => {
                e.preventDefault();
                tap(c);
              }}
              aria-label={narrator.allClips()[c.item.nameClip]}
            >
              <span className="touch-shape" style={{ transform: `rotate(${c.tilt}deg) scale(${c.scale})` }}>
                <Shape size={Math.round(size * 0.78)} />
              </span>
              {found && isTarget && (
                <span className="touch-sparkles" aria-hidden="true">
                  {Array.from({ length: 8 }, (_, k) => (
                    <span key={k} className="touch-sparkle" style={{ '--a': `${k * 45}deg` } as CSSProperties} />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const touchIt: Mechanic<TouchItConfig> = {
  Round: TouchItRound,
  clips: {
    'touch.title': 'Touch the shape!',
    'touch.touch-the': 'Touch the',
    'touch.yes-thats': "Yes! That's the",
    'touch.oops-thats': "Oops! That's the",
  },
};
