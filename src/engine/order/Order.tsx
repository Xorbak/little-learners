import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { OrderConfig, OrderStep } from '../../types/learning';
import type { Mechanic, RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { fx } from '../../shared/fx';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import '../touch-it/touchIt.css';
import './order.css';

/**
 * Put In Order: pictures of the steps of something (washing hands, a seed
 * growing, a story, smallest to biggest) are mixed up at the bottom. She taps
 * the one that comes first, then the next… each one jumps up into its place.
 * A wrong one wobbles ("Not yet! What comes first?"). At the end the narrator
 * goes through them in order while each lights up: "First… then… and last…".
 */

const REMIND_AFTER_MS = 14000;
/** Between the smallest and the biggest (each different, so none gets skipped as a repeat) */
const SIZE_WORDS = ['order.bigger', 'order.bigger-still', 'order.even-bigger'];
const HINT_AFTER_MISSES = 2;

const shuffle = <T,>(list: T[]): T[] => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  // Never already in order (that would be no puzzle)
  if (a.length > 1 && a.every((x, i) => i === 0 || x > a[i - 1])) [a[0], a[1]] = [a[1], a[0]];
  return a;
};

/** At most `max` steps, keeping the first and the last, spread evenly */
function pickSteps(steps: OrderStep[], max?: number): OrderStep[] {
  if (!max || steps.length <= max) return steps;
  const out: OrderStep[] = [];
  for (let i = 0; i < max; i++) out.push(steps[Math.round((i * (steps.length - 1)) / (max - 1))]);
  return out;
}

function useSizes(n: number, cardsLeft: number) {
  const measure = useCallback(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const small = W <= 600 || H <= 500;
    const gap = small ? 10 : 16;
    const w = W - 32;
    const h = H - (small ? 76 : 92) - (small ? 24 : 40);
    const landscape = w > h;
    const slot = Math.floor(Math.min(160, (w - gap * (n - 1)) / n, h * 0.4));
    const cols = landscape ? cardsLeft : Math.min(cardsLeft, 3);
    const rows = Math.ceil(cardsLeft / cols);
    const card = Math.floor(Math.min(170, (w - gap * (cols - 1)) / cols, (h - slot - 36 - gap * (rows - 1)) / rows));
    return { slot, card, gap };
  }, [n, cardsLeft]);
  const [sizes, setSizes] = useState(measure);
  useEffect(() => {
    const update = () => setSizes(measure());
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [measure]);
  return sizes;
}

function StepPicture({ step, size }: { step: OrderStep; size: number }) {
  return (
    <span className="order-pic" style={{ fontSize: size * 0.62 * (step.scale ?? 1) }} aria-hidden="true">
      {step.emoji}
    </span>
  );
}

function OrderRound({ config, target, onCorrect, onWrong, onRoundComplete }: RoundProps<OrderConfig>) {
  const set = target.orderSet!;
  const bySize = set.by === 'size';
  const [steps] = useState(() => pickSteps(set.steps, config.steps));
  const [start] = useState(() => Math.max(0, Math.min(config.placed ?? 0, steps.length - 2)));
  const [cards] = useState(() => shuffle(steps.map((_, i) => i).filter((i) => i >= start)));
  const [filled, setFilled] = useState(start);
  const [wobble, setWobble] = useState<number | null>(null);
  const [hint, setHint] = useState(false);
  const [lit, setLit] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const sizes = useSizes(steps.length, cards.length);

  const misses = useRef(0);
  const missed = useRef(false);
  const lastTap = useRef(Date.now());
  const done = useRef(false);
  const alive = useRef(true);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(
    () => () => {
      alive.current = false;
      timers.current.forEach(window.clearTimeout);
    },
    [],
  );

  const prompt = useCallback(
    (n: number) => (n === 0 ? (bySize ? 'order.find-smallest' : 'order.what-first') : n === steps.length - 1 ? 'order.what-last' : 'order.what-next'),
    [bySize, steps.length],
  );
  const filledRef = useRef(filled);
  filledRef.current = filled;
  const ask = useCallback(() => {
    lastTap.current = Date.now();
    void narrator.say(filledRef.current === start ? [set.askClip, ...(start > 0 ? [prompt(start)] : [])] : [prompt(filledRef.current)]);
  }, [set.askClip, start, prompt]);

  useEffect(() => {
    ask();
    const t = window.setInterval(() => {
      if (!done.current && Date.now() - lastTap.current > REMIND_AFTER_MS && !narrator.isSpeaking()) ask();
    }, 1000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Goes through the steps in order, each lighting up as it is said */
  const retell = async () => {
    await narrator.idle();
    for (let k = 0; k < steps.length; k++) {
      if (!alive.current) return;
      setLit(k);
      const word = bySize ? (k === 0 ? 'order.smallest' : k === steps.length - 1 ? 'order.biggest' : SIZE_WORDS[k - 1]) : k === 0 ? 'order.first' : k === steps.length - 1 ? 'order.last' : 'order.then';
      sfx.note(k);
      await narrator.say(bySize ? [word] : [word, steps[k].clip]);
    }
    if (!alive.current) return;
    setLit(null);
    setFinished(true);
    fx.yay(undefined);
    if (set.doneClip) await narrator.say([set.doneClip]);
    if (alive.current) later(onRoundComplete, 400);
  };

  const tap = (i: number, el: HTMLElement) => {
    if (done.current || i < filled) return;
    lastTap.current = Date.now();
    if (i === filled) {
      const next = filled + 1;
      setFilled(next);
      setHint(false);
      misses.current = 0;
      sfx.pop();
      fx.haptic('tap');
      if (next === steps.length) {
        done.current = true;
        if (!missed.current) onCorrect(target);
        void retell();
      } else if (!bySize) void narrator.say([steps[i].clip]);
      return;
    }
    sfx.boing();
    fx.wobble(el);
    setWobble(i);
    later(() => setWobble((w) => (w === i ? null : w)), 600);
    if (!missed.current) onWrong(target, target);
    missed.current = true;
    misses.current += 1;
    if (misses.current >= HINT_AFTER_MISSES) setHint(true);
    void narrator.say(['order.not-yet', prompt(filled)]);
  };

  return (
    <div className="touch-round order-round">
      <header className="touch-top">
        <SpeakerButton onPress={ask} />
      </header>
      <div className="order-body">
        <div className="order-slots" style={{ gap: sizes.gap }}>
          {steps.map((step, k) => (
            <div
              key={k}
              className={['order-slot', k < filled && 'order-slot--filled', k === filled - 1 && !done.current && 'order-slot--new', lit === k && 'order-slot--lit', finished && 'order-slot--done']
                .filter(Boolean)
                .join(' ')}
              style={{ width: sizes.slot, height: sizes.slot, animationDelay: finished ? `${k * 0.08}s` : undefined } as CSSProperties}
            >
              {k < filled ? <StepPicture step={step} size={sizes.slot} /> : <span className="order-slot-num">{k + 1}</span>}
              {k < filled && <span className="order-slot-badge">{k + 1}</span>}
            </div>
          ))}
        </div>
        <div className="order-cards" style={{ gap: sizes.gap }}>
          {cards.map((i, n) => (
            <button
              key={i}
              type="button"
              className={['touch-choice', 'order-card', i < filled && 'order-card--gone', wobble === i && 'touch-choice--wobble', hint && i === filled && 'touch-choice--hint']
                .filter(Boolean)
                .join(' ')}
              style={{ width: sizes.card, height: sizes.card, animationDelay: `${n * 0.07}s` }}
              onPointerDown={(e) => {
                e.preventDefault();
                tap(i, e.currentTarget);
              }}
              aria-label={narrator.allClips()[steps[i].clip] ?? steps[i].emoji}
              data-step={i}
            >
              <StepPicture step={steps[i]} size={sizes.card} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export const order: Mechanic<OrderConfig> = {
  Round: OrderRound,
  clips: {
    'order.what-first': 'What comes first?',
    'order.what-next': 'What comes next?',
    'order.what-last': 'And what comes last?',
    'order.find-smallest': 'Find the smallest one!',
    'order.not-yet': 'Not yet!',
    'order.first': 'First,',
    'order.then': 'then,',
    'order.last': 'and last,',
    'order.smallest': 'Small,',
    'order.bigger': 'bigger,',
    'order.bigger-still': 'bigger still,',
    'order.even-bigger': 'even bigger,',
    'order.biggest': 'biggest!',
  },
};
