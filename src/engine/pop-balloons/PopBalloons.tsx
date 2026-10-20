import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LearningItem, PopBalloonsConfig } from '../../types/learning';
import type { Mechanic, RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import { fx } from '../../shared/fx';
import { Balloon, type BalloonState } from './Balloon';
import './popBalloons.css';

/**
 * Pop the Balloons
 * "Pop all the threes!" Balloons float up; she pops the ones that match.
 * Works with any items: numbers, colours, letters, shapes.
 */

// Balloons get random colours so she has to look at the number, not the colour.
const PALETTE = ['#ff6b6b', '#4dabf7', '#ffd43b', '#69db7c', '#b197fc', '#ffa94d', '#f783ac', '#38d9a9'];
const REMIND_AFTER_MS = 12000;

let nextId = 1;

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeBalloon(item: LearningItem, lane: number, phase: number, riseSeconds: number): BalloonState {
  const duration = riseSeconds * (0.85 + Math.random() * 0.3);
  return {
    id: nextId++,
    itemKey: item.key,
    lane,
    colour: item.balloonColour ?? PALETTE[Math.floor(Math.random() * PALETTE.length)],
    duration,
    delay: -duration * phase,
    status: 'flying',
  };
}

function PopBalloonsRound({ config, target, items, onCorrect, onWrong, onRoundComplete }: RoundProps<PopBalloonsConfig>) {
  const distractorKeys = useMemo(() => config.pool.filter((k) => k !== target.key), [config.pool, target.key]);
  const randomDistractor = useCallback(
    () => items[distractorKeys[Math.floor(Math.random() * distractorKeys.length)]],
    [items, distractorKeys],
  );

  const [layout] = useState(() => {
    const width = Math.min(window.innerWidth, 1200);
    if (config.still) {
      // Two neat rows that fit on screen
      const n = config.balloonsOnScreen;
      const lanes = n > 3 ? Math.ceil(n / 2) : n;
      const rows = Math.ceil(n / lanes);
      const fieldHeight = window.innerHeight - 150;
      const size = Math.max(90, Math.min(160, (width / lanes) * 0.7, fieldHeight / rows / 1.6));
      return { lanes, size };
    }
    const lanes = Math.max(2, Math.min(config.balloonsOnScreen, Math.floor(width / 130)));
    const size = Math.max(90, Math.min(150, (width / lanes) * 0.8));
    return { lanes, size };
  });

  const [balloons, setBalloons] = useState<BalloonState[]>(() => {
    const picks: LearningItem[] = [
      ...Array.from({ length: config.targetsPerRound }, () => target),
      ...Array.from({ length: Math.max(0, config.balloonsOnScreen - config.targetsPerRound) }, randomDistractor),
    ];
    // Spread balloons evenly up the screen, in a random order (not a staircase)
    const n = picks.length;
    const phases = shuffle(Array.from({ length: n }, (_, i) => 0.08 + (0.8 * i) / n));
    return shuffle(picks).map((item, i) => {
      const b = makeBalloon(item, i % layout.lanes, phases[i] + Math.random() * 0.05, config.riseSeconds);
      return config.still ? { ...b, row: Math.floor(i / layout.lanes) } : b;
    });
  });

  const [popped, setPopped] = useState(0);
  const finished = popped >= config.targetsPerRound;
  const lastTapRef = useRef(0);

  const sayPrompt = useCallback(() => {
    void narrator.say(['pop.pop-all-the', target.pluralClip]);
  }, [target.pluralClip]);

  // Ask at the start, and gently remind her if nothing is tapped for a while
  useEffect(() => {
    lastTapRef.current = Date.now();
    sayPrompt();
    const timer = window.setInterval(() => {
      if (Date.now() - lastTapRef.current > REMIND_AFTER_MS) {
        lastTapRef.current = Date.now();
        sayPrompt();
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [sayPrompt]);

  useEffect(() => {
    if (!finished) return;
    const t = window.setTimeout(onRoundComplete, 900);
    return () => window.clearTimeout(t);
  }, [finished, onRoundComplete]);

  const setStatus = (id: number, status: BalloonState['status']) =>
    setBalloons((list) => list.map((b) => (b.id === id ? { ...b, status } : b)));

  const targetRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);

  /** The pop itself: shards of rubber in the balloon's colour, a flash ring, a few stars */
  const burstBalloon = (balloon: BalloonState, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + (r.height * 52) / 150;
    sfx.pop();
    sfx.snap();
    fx.ring(x, y, '#fff', r.width / 110);
    fx.burst(x, y, 'shards', { colour: balloon.colour, count: 14, power: r.width / 120 });
    fx.burst(x, y, 'stars', { count: 5 });
    fx.shake(0.6);
    fx.haptic('right');
    // The blast pushes the neighbours a little
    el.closest('.pop-field')
      ?.querySelectorAll('.balloon-body')
      .forEach((other) => other !== el && fx.nudge(other, x, y, 24));
  };

  const handleTap = (balloon: BalloonState, el: HTMLElement) => {
    if (balloon.status !== 'flying' || finished) return;
    lastTapRef.current = Date.now();
    const item = items[balloon.itemKey];

    if (item.key === target.key) {
      void narrator.say([item.nameClip]);
      // Anticipation: a quick squish, then it bursts
      const dot = popped;
      setStatus(balloon.id, 'squish');
      window.setTimeout(() => {
        burstBalloon(balloon, el);
        setStatus(balloon.id, 'popped');
        fx.jump(targetRef.current, 22);
        fx.pop(counterRef.current?.children[dot]);
      }, 70);
      setPopped((p) => p + 1);
      onCorrect(item);
      // Replace it with a fresh balloon floating in from the bottom
      window.setTimeout(() => {
        setBalloons((list) =>
          list.map((b) =>
            b.id === balloon.id ? { ...makeBalloon(randomDistractor(), b.lane, 0, config.riseSeconds), row: b.row } : b,
          ),
        );
      }, 900);
    } else {
      sfx.boing();
      void narrator.say(['shared.thats', item.nameClip]);
      setStatus(balloon.id, 'wobble');
      onWrong(target, item);
      window.setTimeout(() => setStatus(balloon.id, 'flying'), 600);
    }
  };

  return (
    <div className="pop-round">
      <header className="pop-prompt">
        <SpeakerButton onPress={sayPrompt} />
        <div className="pop-target" ref={targetRef} aria-label="Find this one">
          <target.Display size={84} />
        </div>
        <div className="pop-counter" ref={counterRef} aria-label={`${popped} of ${config.targetsPerRound} popped`}>
          {Array.from({ length: config.targetsPerRound }, (_, i) => (
            <span key={i} className={`pop-dot ${i < popped ? 'pop-dot--done' : ''}`} />
          ))}
        </div>
      </header>

      <div className="pop-field">
        {balloons.map((b) => {
          const item = items[b.itemKey];
          // Still mode: centre a shorter last row; nudge each a little so it doesn't look like a grid
          const rowCount = config.still ? balloons.filter((o) => o.row === b.row).length : layout.lanes;
          const nudge = config.still ? ((b.id * 37) % 9) - 4 : 0;
          return (
            <Balloon
              key={b.id}
              balloon={b}
              left={`${((b.lane + 0.5) / rowCount) * 100}%`}
              top={config.still ? `calc(${6 + (b.row ?? 0) * 48}% + ${nudge * 3}px)` : undefined}
              size={layout.size}
              Label={item.BalloonLabel}
              onTap={(el) => handleTap(b, el)}
            />
          );
        })}
      </div>
    </div>
  );
}

export const popBalloons: Mechanic<PopBalloonsConfig> = {
  Round: PopBalloonsRound,
  clips: {
    'pop.title': 'Pop the balloons!',
    'pop.pop-all-the': 'Pop all the',
  },
};
