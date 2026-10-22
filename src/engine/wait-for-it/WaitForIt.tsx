import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { WaitForItConfig } from '../../types/learning';
import type { Mechanic, RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { fx } from '../../shared/fx';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import './waitForIt.css';

/**
 * Wait for It: practising waiting before tapping (for the excited tapper).
 *
 * 'light': a traffic light and a frog. Red means wait, amber means get ready,
 *   green means go: tap the frog and it hops. Tapping too soon never scores,
 *   it just starts the waiting again ("Red means wait").
 *   With `teases`, the light sometimes goes amber and back to red.
 * 'bear': bunnies pop out of their holes; tap them. Sometimes it's the
 *   sleeping bear instead: leave him be ("Good! You let the bear sleep").
 *   Not tapping is praised as much as tapping.
 */

type Light = 'red' | 'amber' | 'green';
const between = ([a, b]: [number, number]) => (a + Math.random() * (b - a)) * 1000;

function Stars({ have, need }: { have: number; need: number }) {
  return (
    <div className="wait-stars" aria-label={`${have} of ${need}`}>
      {Array.from({ length: need }, (_, i) => (
        <span key={i} className={`wait-star ${i < have ? 'wait-star--on' : ''}`}>
          ★
        </span>
      ))}
    </div>
  );
}

function useTimers() {
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);
  return {
    later: (fn: () => void, ms: number) => {
      const t = window.setTimeout(fn, ms);
      timers.current.push(t);
      return t;
    },
    clear: () => {
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
    },
  };
}

// ---------------------------------------------------------------------------
// Traffic light
// ---------------------------------------------------------------------------
function LightRound({ config, onRoundComplete }: RoundProps<WaitForItConfig>) {
  const [light, setLight] = useState<Light>('red');
  const [hops, setHops] = useState(0);
  const [shake, setShake] = useState(0);
  const frogRef = useRef<HTMLButtonElement>(null);
  const lightRef = useRef(light);
  lightRef.current = light;
  const finished = useRef(false);
  const { later, clear } = useTimers();

  /** Red, then (after waiting) amber, then green. Teases go amber and back. */
  const cycle = (first = false) => {
    clear();
    setLight('red');
    later(() => {
      setLight('amber');
      if (config.teases && !first && Math.random() < 0.35) {
        later(() => {
          void narrator.say(['wait.not-yet']);
          cycle();
        }, 900);
        return;
      }
      later(() => {
        setLight('green');
        sfx.sparkle();
        void narrator.say(['wait.go']);
        // Waiting a long time on green: remind her
        later(() => lightRef.current === 'green' && void narrator.say(['wait.go-tap']), 6000);
      }, 900 + Math.random() * 400);
    }, between(config.wait));
  };

  useEffect(() => {
    void narrator.say(['wait.light-intro']).then(() => {
      if (!finished.current) cycle(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tap = () => {
    if (finished.current) return;
    if (lightRef.current === 'green') {
      const n = hops + 1;
      setHops(n);
      sfx.pop();
      fx.jump(frogRef.current, 60);
      fx.burstAt(frogRef.current, 'stars', { count: 8 });
      fx.haptic('right');
      if (n >= config.taps) {
        finished.current = true;
        clear();
        setLight('green');
        void narrator.say(['wait.well-waited']);
        later(onRoundComplete, 1400);
        return;
      }
      void narrator.say([n % 2 ? 'wait.well-waited' : 'wait.hop']);
      later(() => cycle(), 900);
      return;
    }
    // Too soon: nothing scores, the waiting starts again
    sfx.boing();
    fx.wobble(frogRef.current);
    fx.haptic('oops');
    setShake((s) => s + 1);
    void narrator.say([lightRef.current === 'amber' ? 'wait.amber-soon' : 'wait.too-soon']);
    cycle();
  };

  return (
    <div className="wait-round">
      <header className="wait-top">
        <SpeakerButton onPress={() => void narrator.say(['wait.light-intro'])} />
        <Stars have={hops} need={config.taps} />
      </header>
      <div className="wait-stage">
        <div key={shake} className={`wait-light wait-light--${light} ${shake ? 'wait-light--shake' : ''}`} aria-label={`The light is ${light}`}>
          <span className="wait-lamp wait-lamp--red" />
          <span className="wait-lamp wait-lamp--amber" />
          <span className="wait-lamp wait-lamp--green" />
        </div>
        <button
          ref={frogRef}
          type="button"
          className={`wait-frog wait-frog--${light}`}
          onPointerDown={(e) => {
            e.preventDefault();
            tap();
          }}
          aria-label="The frog"
        >
          <span className="wait-pad" aria-hidden="true" />
          <span className="wait-frog-face" aria-hidden="true">
            🐸
          </span>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bunnies and the sleeping bear
// ---------------------------------------------------------------------------
type Critter = { hole: number; kind: 'bunny' | 'bear'; id: number; state: 'up' | 'got' | 'woke' };
const HOLES = 3;

function BearRound({ config, onRoundComplete }: RoundProps<WaitForItConfig>) {
  const [critter, setCritter] = useState<Critter | null>(null);
  const [got, setGot] = useState(0);
  const critterRef = useRef(critter);
  critterRef.current = critter;
  const finished = useRef(false);
  const bears = useRef(0);
  const nextId = useRef(1);
  const { later } = useTimers();

  const popUp = () => {
    if (finished.current) return;
    // The bear comes now and then, but never twice in a row
    const last = critterRef.current?.kind;
    const bear = last !== 'bear' && Math.random() < (config.bearChance ?? 0.3);
    const hole = Math.floor(Math.random() * HOLES);
    const c: Critter = { hole, kind: bear ? 'bear' : 'bunny', id: nextId.current++, state: 'up' };
    setCritter(c);
    if (bear) bears.current++;
    later(() => {
      const now = critterRef.current;
      if (now?.id !== c.id) return;
      // The bear went back down without being woken: well done
      if (c.kind === 'bear' && now.state === 'up') {
        void narrator.say(['wait.bear-slept']);
        fx.haptic('right');
      }
      setCritter(null);
      later(popUp, between(config.wait));
    }, c.kind === 'bear' ? 2600 : 1900);
  };

  useEffect(() => {
    void narrator.say(['wait.bear-intro']).then(() => later(popUp, 600));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tap = (el: HTMLElement) => {
    const c = critterRef.current;
    if (!c || c.state !== 'up' || finished.current) return;
    if (c.kind === 'bunny') {
      const n = got + 1;
      setGot(n);
      setCritter({ ...c, state: 'got' });
      sfx.pop();
      fx.burstAt(el, 'stars', { count: 8 });
      fx.haptic('pop');
      if (n >= config.taps) {
        finished.current = true;
        void narrator.say(['wait.all-bunnies']);
        later(onRoundComplete, 1400);
      }
      return;
    }
    // Woke the bear: a grumpy yawn, nothing lost
    setCritter({ ...c, state: 'woke' });
    sfx.boing();
    fx.wobble(el);
    fx.haptic('oops');
    void narrator.say(['wait.bear-woke']);
  };

  return (
    <div className="wait-round">
      <header className="wait-top">
        <SpeakerButton onPress={() => void narrator.say(['wait.bear-intro'])} />
        <Stars have={got} need={config.taps} />
      </header>
      <div className="wait-meadow">
        {Array.from({ length: HOLES }, (_, i) => {
          const here = critter?.hole === i ? critter : null;
          return (
            <div key={i} className="wait-hole-wrap">
              {here && (
                <button
                  key={here.id}
                  type="button"
                  className={`wait-critter wait-critter--${here.kind} wait-critter--${here.state}`}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    tap(e.currentTarget);
                  }}
                  aria-label={here.kind === 'bunny' ? 'Bunny' : 'Sleeping bear'}
                >
                  <span className="wait-critter-face">{here.kind === 'bunny' ? '🐰' : here.state === 'woke' ? '🐻' : '🐻'}</span>
                  {here.kind === 'bear' && here.state === 'up' && <span className="wait-zzz">💤</span>}
                  {here.kind === 'bear' && here.state === 'woke' && <span className="wait-zzz">❗</span>}
                </button>
              )}
              <span className="wait-hole" style={{ '--i': i } as CSSProperties} aria-hidden="true" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WaitForItRound(props: RoundProps<WaitForItConfig>) {
  return props.config.mode === 'bear' ? <BearRound {...props} /> : <LightRound {...props} />;
}

export const waitForIt: Mechanic<WaitForItConfig> = {
  Round: WaitForItRound,
  clips: {
    'wait.light-intro': 'Wait for the green light. Then tap the frog!',
    'wait.go': 'Green! Go!',
    'wait.go-tap': "It's green! Tap the frog!",
    'wait.not-yet': 'Not yet…',
    'wait.too-soon': 'Oops, too soon! Red means wait.',
    'wait.amber-soon': 'Not yet! Wait for green.',
    'wait.well-waited': 'Well waited!',
    'wait.hop': 'Hop!',
    'wait.bear-intro': "Tap the bunnies. But shh… don't wake the sleeping bear!",
    'wait.bear-woke': 'Oh! You woke the bear. Shh, let him sleep.',
    'wait.bear-slept': 'Good! You let the bear sleep.',
    'wait.all-bunnies': 'You got all the bunnies!',
  },
};
