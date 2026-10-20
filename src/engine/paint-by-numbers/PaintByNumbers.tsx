import { useCallback, useEffect, useRef, useState } from 'react';
import type { ClipId, LearningItem, PaintByNumbersConfig, PaintRegion } from '../../types/learning';
import type { Mechanic, RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { fx } from '../../shared/fx';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import { PictureGallery } from '../../shared/ui/PictureGallery';
import './paintByNumbers.css';

/**
 * Paint by Numbers
 * She taps a paint pot, then taps the parts of the picture that go with it.
 * Each pot has a number; each part shows a colour dot, a number, or both.
 * A wrong part wobbles and says what it needs; nothing is ever lost.
 * Free mode: any colour anywhere, repaint freely, tick button to finish.
 *
 * Numbers are spoken with the Numbers section's clips (numbers.name.3 = "three").
 */

const REMIND_AFTER_MS = 14000;
/** After this many wrong taps in a row, the parts that need her colour pulse */
const HINT_AFTER_MISSES = 2;
/** Colours for free painting */
const FREE_PALETTE: { hex: string; clip: ClipId }[] = [
  { hex: '#f03e3e', clip: 'colours.name.red' },
  { hex: '#fd7e14', clip: 'colours.name.orange' },
  { hex: '#fcc419', clip: 'colours.name.yellow' },
  { hex: '#37b24d', clip: 'colours.name.green' },
  { hex: '#1c7ed6', clip: 'colours.name.blue' },
  { hex: '#9c36b5', clip: 'colours.name.purple' },
  { hex: '#f783ac', clip: 'colours.name.pink' },
  { hex: '#8d5524', clip: 'colours.name.brown' },
  { hex: '#343a40', clip: 'colours.name.black' },
];

interface Pot {
  number: number;
  hex: string;
  clip: ClipId;
}

/** One pot per colour in the picture, numbered in the order the colours first appear */
function potsFor(regions: PaintRegion[]): Pot[] {
  const pots: Pot[] = [];
  for (const r of regions) {
    if (!pots.some((p) => p.hex === r.hex)) pots.push({ number: pots.length + 1, hex: r.hex, clip: r.colourClip });
  }
  return pots;
}

function useFitSize(aspect: number) {
  const measure = useCallback(() => {
    // Landscape phone: the paint pots move to a column on the right
    const sideways = window.innerHeight < 500 && window.innerWidth > window.innerHeight;
    const w = window.innerWidth - 32 - (sideways ? 150 : 0);
    const h = window.innerHeight - (sideways ? 96 : 100 + 140);
    return Math.max(220, Math.min(w, h * aspect, 900));
  }, [aspect]);
  const [width, setWidth] = useState(measure);
  useEffect(() => {
    const update = () => setWidth(measure());
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [measure]);
  return width;
}

/** Remembers the free-paint switch between pictures (until the app is closed) */
let freeChoice = false;

/** The gallery: she picks which picture to paint. Stars mark ones she has finished. */
function Gallery({
  config,
  items,
  timesRight,
  free,
  onFreeChange,
  onPick,
}: RoundProps<PaintByNumbersConfig> & { free: boolean; onFreeChange: (free: boolean) => void; onPick: (item: LearningItem) => void }) {
  const setMode = (next: boolean) => {
    if (next === free) return;
    sfx.pop();
    onFreeChange(next);
    void narrator.say([next ? 'pbn.mode-free' : 'pbn.mode-numbers']);
  };

  const modeSwitch = (
    <div className="pbn-mode" role="radiogroup" aria-label="How to paint">
      <button
        type="button"
        role="radio"
        aria-checked={!free}
        className={`pbn-mode-btn ${!free ? 'pbn-mode-btn--on' : ''}`}
        onClick={() => setMode(false)}
        aria-label="Paint by numbers"
      >
        <span className="pbn-mode-icon">🔢</span>
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={free}
        className={`pbn-mode-btn ${free ? 'pbn-mode-btn--on' : ''}`}
        onClick={() => setMode(true)}
        aria-label="Free painting"
      >
        <span className="pbn-mode-icon">🎨</span>
      </button>
    </div>
  );

  return (
    <PictureGallery
      items={config.pool.map((key) => items[key])}
      askClip="pbn.choose"
      isDone={(item) => timesRight(item) > 0}
      onPick={onPick}
      extra={modeSwitch}
    />
  );
}

function PaintByNumbersRound(props: RoundProps<PaintByNumbersConfig>) {
  const [picked, setPicked] = useState<LearningItem | null>(props.config.choose ? null : props.target);
  const [free, setFree] = useState(() => props.config.free || (props.config.choose ? freeChoice : false));
  const changeFree = (next: boolean) => {
    freeChoice = next;
    setFree(next);
  };
  if (!picked) return <Gallery {...props} free={free} onFreeChange={changeFree} onPick={setPicked} />;
  // The switch overrides the level: free painting ignores the level's hints
  const config: PaintByNumbersConfig = free ? { ...props.config, free: true, hints: 'none' } : { ...props.config, free: false };
  return <Painting {...props} config={config} item={picked} />;
}

function Painting({ config, item, onCorrect, onRoundComplete }: RoundProps<PaintByNumbersConfig> & { item: LearningItem }) {
  const target = item;
  const picture = target.picture!;
  const { regions, Details } = picture;
  const [, , vw, vh] = picture.viewBox.split(' ').map(Number);
  const width = useFitSize(vw / vh);

  const [pots] = useState<Pot[]>(() =>
    config.free ? FREE_PALETTE.map((p, i) => ({ number: i + 1, ...p })) : potsFor(regions),
  );
  const potOf = (hex: string) => pots.find((p) => p.hex === hex)!;

  const [selected, setSelected] = useState<number | null>(null);
  const [painted, setPainted] = useState<(string | null)[]>(() => regions.map(() => null));
  const [wobble, setWobble] = useState<number | null>(null);
  const [hintHex, setHintHex] = useState<string | null>(null);
  const [potsWiggle, setPotsWiggle] = useState(false);
  const [done, setDone] = useState(false);

  const misses = useRef(0);
  const lastTapRef = useRef(0);
  const doneRef = useRef(false);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const sayPrompt = useCallback(() => void narrator.say([config.free ? 'pbn.start-free' : 'pbn.start']), [config.free]);

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

  const finish = () => {
    doneRef.current = true;
    setDone(true);
    setSelected(null);
    onCorrect(target);
    later(() => {
      sfx.fanfare();
      sfx.sparkle();
      fx.burstAt(document.querySelector('.pbn-picture'), 'sparkles', { count: 14, power: 2.5 });
      fx.rain(50);
      void narrator.say(config.free ? ['pbn.free-done'] : ['pbn.you-painted', target.nameClip]);
    }, 400);
    later(onRoundComplete, 2800);
  };

  const pickPot = (i: number) => {
    if (doneRef.current) return;
    lastTapRef.current = Date.now();
    sfx.pop();
    setSelected(i);
    setHintHex(null);
    misses.current = 0;
    const pot = pots[i];
    const showNumber = !config.free && config.hints !== 'colour';
    void narrator.say(showNumber ? ['pbn.number', `numbers.name.${pot.number}`, pot.clip] : [pot.clip]);
  };

  /** A little splat of paint droplets where she tapped */
  const tapPoint = useRef<{ x: number; y: number } | null>(null);
  const splat = (_index: number, hex: string) => {
    const p = tapPoint.current;
    if (p) fx.burst(p.x, p.y, 'droplets', { colour: hex, count: 6, power: 0.45 });
    fx.haptic(8);
  };

  const tapRegion = (index: number) => {
    if (doneRef.current) return;
    lastTapRef.current = Date.now();
    const region = regions[index];

    if (selected === null) {
      sfx.boing();
      setPotsWiggle(true);
      later(() => setPotsWiggle(false), 700);
      void narrator.say(['pbn.pick-first']);
      return;
    }
    const pot = pots[selected];

    if (config.free) {
      sfx.pop();
      splat(index, pot.hex);
      setPainted((list) => list.map((c, i) => (i === index ? pot.hex : c)));
      return;
    }

    if (painted[index]) return;

    if (pot.hex === region.hex) {
      sfx.pop();
      sfx.drip();
      misses.current = 0;
      splat(index, pot.hex);
      const next = painted.map((c, i) => (i === index ? pot.hex : c));
      setPainted(next);
      // This colour is finished: stop hinting it
      if (!regions.some((r, i) => r.hex === pot.hex && !next[i])) setHintHex(null);
      if (next.every(Boolean)) finish();
      return;
    }

    // Wrong colour for this part: wobble and say what it needs
    sfx.boing();
    setWobble(index);
    later(() => setWobble((w) => (w === index ? null : w)), 600);
    const needs = potOf(region.hex);
    void narrator.say(config.hints === 'colour' ? ['pbn.needs', needs.clip] : ['pbn.is-number', `numbers.name.${needs.number}`]);
    misses.current += 1;
    if (misses.current >= HINT_AFTER_MISSES) setHintHex(pot.hex);
  };

  const remaining = (hex: string) => regions.some((r, i) => r.hex === hex && !painted[i]);

  return (
    <div className="pbn-round">
      <header className="pbn-top">
        <SpeakerButton onPress={sayPrompt} />
      </header>

      <div className="pbn-canvas">
        <svg
          viewBox={picture.viewBox}
          width={width}
          height={(width * vh) / vw}
          className={`pbn-picture ${done ? 'pbn-picture--done' : ''}`}
        >
          {regions.map((r, i) => (
            <path
              key={i}
              d={r.d}
              className={`pbn-region ${wobble === i ? 'pbn-region--wobble' : ''} ${hintHex === r.hex && !painted[i] ? 'pbn-region--hint' : ''}`}
              style={{ fill: painted[i] ?? '#ffffff' }}
              onPointerDown={(e) => {
                tapPoint.current = { x: e.clientX, y: e.clientY };
                tapRegion(i);
              }}
            />
          ))}
          {Details && <Details />}
          {!config.free &&
            config.hints !== 'none' &&
            regions.map((r, i) => {
              if (painted[i]) return null;
              const pot = potOf(r.hex);
              const [x, y] = r.label;
              return (
                <g key={i} className="pbn-label" transform={`translate(${x} ${y})`}>
                  {config.hints === 'colour' ? (
                    <circle r="11" fill={r.hex} stroke="#2b2d42" strokeWidth="2" />
                  ) : (
                    <>
                      <circle r="14" fill={config.hints === 'number-and-colour' ? r.hex : '#fff'} stroke="#2b2d42" strokeWidth="2" />
                      <text y="6.5" textAnchor="middle" className={config.hints === 'number-and-colour' ? 'pbn-num pbn-num--on-colour' : 'pbn-num'}>
                        {pot.number}
                      </text>
                    </>
                  )}
                </g>
              );
            })}
        </svg>
      </div>

      <div className={`pbn-palette ${potsWiggle ? 'pbn-palette--wiggle' : ''}`}>
        {pots.map((pot, i) => {
          const finished = !config.free && !remaining(pot.hex);
          return (
            <button
              key={pot.hex}
              type="button"
              className={`pbn-pot ${selected === i ? 'pbn-pot--selected' : ''} ${finished ? 'pbn-pot--finished' : ''}`}
              style={{ background: pot.hex }}
              onClick={() => pickPot(i)}
              aria-label={narrator.allClips()[pot.clip]}
            >
              {!config.free && config.hints !== 'colour' && <span className="pbn-pot-num">{pot.number}</span>}
              {finished && <span className="pbn-pot-tick">✓</span>}
            </button>
          );
        })}
        {config.free && (
          <button type="button" className="pbn-done" onClick={finish} aria-label="All done" disabled={done}>
            ✓
          </button>
        )}
      </div>
    </div>
  );
}

export const paintByNumbers: Mechanic<PaintByNumbersConfig> = {
  Round: PaintByNumbersRound,
  clips: {
    'pbn.title': 'Paint by numbers!',
    'pbn.choose': 'Which picture do you want to paint?',
    'pbn.mode-numbers': 'Paint by numbers!',
    'pbn.mode-free': 'Free painting! Use any colours you like.',
    'pbn.start': 'Pick a paint pot, then tap the picture!',
    'pbn.start-free': 'Paint the picture any colours you like!',
    'pbn.pick-first': 'Pick a colour first!',
    'pbn.needs': 'This one needs',
    'pbn.is-number': 'This one is number',
    'pbn.number': 'Number',
    'pbn.you-painted': 'Beautiful! You painted the',
    'pbn.free-done': 'What a beautiful picture!',
  },
};
