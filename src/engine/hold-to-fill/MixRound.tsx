import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import type { ClipId, HoldToFillConfig, LearningItem } from '../../types/learning';
import type { RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { progress } from '../../shared/progress/store';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import { Bucket, type BucketMood } from './Bucket';
import { checkRecipe, mixColour, nearestColour, type Amounts } from './mixing';

/**
 * Colour mixing in the paint bucket.
 * 'mix': "Let's make orange!" She pours from several pipes; the paint in the
 *        bucket changes colour as it mixes. When it's full she lets go and the
 *        bucket checks: orange? Hooray. Otherwise it says what she made and
 *        which paints orange needs, then tips out for another go.
 * 'lab': free play. Whatever she mixes, the narrator names it.
 */

const REMIND_AFTER_MS = 12000;
const SLIDE_MS = 280;
const GLUG_EVERY_MS = 300;
const ZONE = { lo: 0.8, shout: 0.68, over: 1.0 };

const colourOf = (item: LearningItem) => item.hex ?? item.balloonColour ?? '#868e96';

export function MixRound({ config, target, items, onCorrect, onWrong, onRoundComplete }: RoundProps<HoldToFillConfig>) {
  const lab = config.mode === 'lab';
  const pipes = (config.paints ?? ['red', 'yellow', 'blue']).map((k) => items[k]);
  // Anything she could make: the paints themselves plus every colour with a recipe
  // made only from these paints
  const [namable] = useState(() =>
    Object.values(items).filter((i) => (i.recipe ?? [i.key]).every((k) => config.paints?.includes(k) ?? true)),
  );

  const [amounts, setAmounts] = useState<Amounts>({});
  const [held, setHeld] = useState<number | null>(null);
  const [pouring, setPouring] = useState(false);
  const [mood, setMood] = useState<BucketMood>('happy');
  const [bucketAt, setBucketAt] = useState(() => Math.floor(pipes.length / 2));

  const amountsRef = useRef<Amounts>({});
  const heldRef = useRef<number | null>(null);
  const busyRef = useRef(false);
  const shoutedRef = useRef(false);
  const lastTapRef = useRef(0);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const level = Object.values(amounts).reduce((s, v) => s + v, 0);
  const grab = (index: number | null) => {
    heldRef.current = index;
    setHeld(index);
  };
  const setBoth = (a: Amounts) => {
    amountsRef.current = a;
    setAmounts(a);
  };
  const total = () => Object.values(amountsRef.current).reduce((s, v) => s + v, 0);

  const recipe = useMemo(() => target.recipe ?? [target.key], [target]);
  const recipeWords = useCallback((): ClipId[] => {
    const names = recipe.map((k) => items[k].nameClip);
    return names.flatMap((n, i) => (i === 0 ? [n] : i === names.length - 1 ? ['mix.and', n] : [n]));
  }, [recipe, items]);

  const sayPrompt = useCallback(() => {
    if (lab) void narrator.say(['mix.lab']);
    else void narrator.say(config.hints ? ['mix.make', target.nameClip, 'mix.use', ...recipeWords()] : ['mix.make', target.nameClip]);
  }, [lab, config.hints, target.nameClip, recipeWords]);

  useEffect(() => {
    lastTapRef.current = Date.now();
    sayPrompt();
    const timer = window.setInterval(() => {
      if (!busyRef.current && heldRef.current === null && Date.now() - lastTapRef.current > REMIND_AFTER_MS) {
        lastTapRef.current = Date.now();
        sayPrompt();
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [sayPrompt]);

  const emptyAndRetry = (delay: number) => {
    later(() => {
      setMood('tip');
      if (progress.sillySounds()) sfx.fart('pfft');
    }, delay);
    later(() => {
      setBoth({});
      shoutedRef.current = false;
    }, delay + 500);
    later(() => {
      setMood('happy');
      busyRef.current = false;
      lastTapRef.current = Date.now();
    }, delay + 1300);
  };

  const overflow = () => {
    busyRef.current = true;
    grab(null);
    setPouring(false);
    setMood('splash');
    sfx.splash();
    void narrator.say(['paint.splash', 'paint.again']);
    emptyAndRetry(2000);
  };

  /** Bucket is full enough and she let go: what did she make? */
  const judge = () => {
    busyRef.current = true;
    const made = nearestColour(amountsRef.current, namable);

    if (lab) {
      setMood('proud');
      void narrator.say(['mix.you-made', made.nameClip, 'mix.wow']);
      later(onRoundComplete, 2600);
      return;
    }

    const result = checkRecipe(amountsRef.current, target);
    if (result.ok) {
      setMood('proud');
      void narrator.say(['mix.you-made', target.nameClip, 'mix.hooray']);
      onCorrect(target);
      later(onRoundComplete, 2400);
      return;
    }

    // Not quite: say what she made and what it needs, then a fresh bucket
    setMood('oops');
    onWrong(target, made);
    const phrase: ClipId[] = made.key === target.key ? ['mix.nearly'] : ['mix.you-made', made.nameClip];
    void narrator.say([...phrase, 'mix.to-make', target.nameClip, 'mix.we-need', ...recipeWords()]);
    emptyAndRetry(4200);
  };

  // Paint flows from the pipe she's holding
  useEffect(() => {
    if (held === null) return;
    const key = pipes[held].key;
    let frame = 0;
    let last = 0;
    let lastGlug = 0;
    const start = window.setTimeout(() => {
      if (busyRef.current) return;
      setPouring(true);
      last = performance.now();
      const step = (now: number) => {
        if (busyRef.current) return;
        const add = (now - last) / 1000 / config.fillSeconds;
        last = now;
        const next = { ...amountsRef.current, [key]: (amountsRef.current[key] ?? 0) + add };
        setBoth(next);
        const t = total();
        if (now - lastGlug > GLUG_EVERY_MS) {
          lastGlug = now;
          sfx.glug(t);
        }
        if (!shoutedRef.current && t >= ZONE.shout) {
          shoutedRef.current = true;
          setMood('shout');
          void narrator.say(['paint.stop']);
        }
        if (t >= ZONE.over) {
          overflow();
          return;
        }
        frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    }, SLIDE_MS);
    return () => {
      window.clearTimeout(start);
      cancelAnimationFrame(frame);
    };
    // Only restart when she grabs a different pipe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [held]);

  const press = (e: ReactPointerEvent, index: number) => {
    if (busyRef.current) return;
    // Keep following the finger even if it slides off (some browsers refuse; that's fine)
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* tap still works */
    }
    lastTapRef.current = Date.now();
    setBucketAt(index);
    grab(index);
  };

  const release = () => {
    if (heldRef.current === null) return;
    grab(null);
    setPouring(false);
    lastTapRef.current = Date.now();
    // Letting go early is fine: she's probably switching to another pipe
    if (!busyRef.current && total() >= ZONE.lo) judge();
  };

  const bucketLeft = `${((bucketAt + 0.5) / pipes.length) * 100}%`;

  return (
    <div className="fill-round">
      <header className="fill-top">
        <SpeakerButton onPress={sayPrompt} />
        {lab ? (
          <div className="mix-card" aria-label="Mix anything">
            {pipes.map((p, i) => (
              <span key={p.key} className="mix-card-part">
                {i > 0 && <span className="mix-sign">+</span>}
                <p.Display size={38} />
              </span>
            ))}
            <span className="mix-sign">=</span>
            <span className="mix-question">?</span>
          </div>
        ) : (
          <div className="mix-card" aria-label="Make this colour">
            {recipe.map((k, i) => {
              const Paint = items[k].Display;
              return (
                <span key={k} className="mix-card-part">
                  {i > 0 && <span className="mix-sign">+</span>}
                  {config.hints ? <Paint size={52} /> : <span className="mix-question">?</span>}
                </span>
              );
            })}
            <span className="mix-sign">=</span>
            <target.Display size={72} />
          </div>
        )}
      </header>

      <div className="fill-pipes" style={{ '--n': pipes.length } as CSSProperties}>
        {pipes.map((item, i) => (
          <button
            key={item.key}
            type="button"
            className={`fill-pipe ${held === i ? 'fill-pipe--held' : ''} ${item.key === 'white' ? 'fill-pipe--light' : ''}`}
            style={{ '--paint': colourOf(item) } as CSSProperties}
            onPointerDown={(e) => press(e, i)}
            onPointerUp={release}
            onPointerCancel={release}
            onLostPointerCapture={release}
            onContextMenu={(e) => e.preventDefault()}
            aria-label={narrator.allClips()[item.nameClip]}
          >
            <span className="fill-pipe-body" />
            <span className="fill-pipe-valve" />
            <span className="fill-pipe-nozzle" />
          </button>
        ))}
      </div>

      <div className="fill-gap">
        {pouring && held !== null && (
          <span className="fill-stream" style={{ left: bucketLeft, background: colourOf(pipes[held]) }} />
        )}
      </div>

      <div className="fill-floor">
        <div className="fill-bucket-slot" style={{ left: bucketLeft }}>
          <Bucket level={Math.min(1, level)} colour={mixColour(amounts)} mood={mood} halfLine={false} />
        </div>
      </div>
    </div>
  );
}

export const mixClips = {
  'mix.title': 'Mix the colours!',
  'mix.make': "Let's make",
  'mix.use': 'Use',
  'mix.and': 'and',
  'mix.you-made': 'Ooh! You made',
  'mix.hooray': 'Hooray!',
  'mix.wow': 'Wow!',
  'mix.nearly': 'Nearly!',
  'mix.to-make': 'To make',
  'mix.we-need': 'we need',
  'mix.lab': 'Mix any colours you like! What will you make?',
};
