import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import type { ClipId, HoldToFillConfig, LearningItem } from '../../types/learning';
import type { Mechanic, RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { progress } from '../../shared/progress/store';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import { Bucket, type BucketMood } from './Bucket';
import { Stream } from './Stream';
import { fx } from '../../shared/fx';
import { MixRound, mixClips } from './MixRound';
import './holdToFill.css';

/**
 * Paint Bucket (hold to fill)
 * "Let's fill the bucket with blue!" She presses and holds the right pipe; paint
 * pours and the bucket fills. Near the top the bucket shouts "Stop! Stop! Stop!"
 * and she lets go. Teaches colours, listening and stopping on cue.
 *
 * Nothing is ever lost: let go too early and she just holds again; too much
 * is a funny splash and a fresh bucket; the wrong colour tips out.
 * Reusable later for "fill 3 cups" style games.
 */

const REMIND_AFTER_MS = 12000;
/** Time for the bucket to slide under the pipe before paint flows */
const SLIDE_MS = 280;
const GLUG_EVERY_MS = 300;

/** Where she should let go, when the bucket starts shouting, and when it's too much */
const ZONES = {
  full: { lo: 0.8, hi: 1.0, shout: 0.68, over: 1.0 },
  half: { lo: 0.4, hi: 0.62, shout: 0.3, over: 0.72 },
} as const;

const shuffle = <T,>(list: T[]): T[] => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const colourOf = (item: LearningItem) => item.hex ?? item.balloonColour ?? '#868e96';

function PourRound({ config, target, items, onCorrect, onWrong, onRoundComplete }: RoundProps<HoldToFillConfig>) {
  const zone = ZONES[config.fillTo];

  const [pipes] = useState(() => {
    const others = shuffle(config.pool.filter((k) => k !== target.key)).slice(0, Math.max(0, config.pipes - 1));
    return shuffle([target.key, ...others]).map((k) => items[k]);
  });

  const [level, setLevel] = useState(0);
  const [paint, setPaint] = useState(colourOf(target));
  const [held, setHeld] = useState<number | null>(null);
  const [pouring, setPouring] = useState(false);
  const [mood, setMood] = useState<BucketMood>('happy');
  const [bucketAt, setBucketAt] = useState(() => Math.floor(pipes.length / 2));

  const levelRef = useRef(0);
  const roundRef = useRef<HTMLDivElement>(null);
  /** The colour of the stream (kept after she lets go, while its tail falls) */
  const [streamColour, setStreamColour] = useState('transparent');
  /** Mirrors `held` so pointerup + lostpointercapture (which fire together) only release once */
  const heldRef = useRef<number | null>(null);
  const grab = (index: number | null) => {
    heldRef.current = index;
    setHeld(index);
  };
  const busyRef = useRef(false);
  const shoutedRef = useRef(false);
  const lastTapRef = useRef(0);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const prompt = useCallback(
    (): ClipId[] => [config.fillTo === 'half' ? 'paint.fill-half' : 'paint.fill-with', target.nameClip],
    [config.fillTo, target.nameClip],
  );
  const sayPrompt = useCallback(() => {
    void narrator.say(config.pipes === 1 ? [...prompt(), 'paint.hold'] : prompt());
  }, [config.pipes, prompt]);

  useEffect(() => {
    lastTapRef.current = Date.now();
    sayPrompt();
    const timer = window.setInterval(() => {
      if (!busyRef.current && Date.now() - lastTapRef.current > REMIND_AFTER_MS) {
        lastTapRef.current = Date.now();
        sayPrompt();
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [sayPrompt]);

  const setLevelBoth = (v: number) => {
    levelRef.current = v;
    setLevel(v);
  };

  /** Empty the bucket and get ready to go again */
  const emptyAndRetry = (delay: number) => {
    later(() => {
      setMood('tip');
      if (progress.sillySounds()) sfx.fart('pfft');
    }, delay);
    later(() => {
      setLevelBoth(0);
      setPaint(colourOf(target));
      shoutedRef.current = false;
    }, delay + 500);
    later(() => {
      setMood('happy');
      busyRef.current = false;
      lastTapRef.current = Date.now();
    }, delay + 1300);
  };

  const success = () => {
    busyRef.current = true;
    setMood('proud');
    void narrator.say(['paint.just-right']);
    sfx.sparkle();
    fx.burstAt(roundRef.current?.querySelector('.bucket'), 'stars', { count: 10 });
    fx.haptic('right');
    if (config.pipes > 1) onCorrect(target);
    later(onRoundComplete, 1800);
  };

  const overflow = () => {
    busyRef.current = true;
    grab(null);
    setPouring(false);
    setMood('splash');
    sfx.splash();
    void narrator.say(config.fillTo === 'half' ? ['paint.past-line', 'paint.again'] : ['paint.splash', 'paint.again']);
    emptyAndRetry(2000);
  };

  const wrongColour = (item: LearningItem) => {
    busyRef.current = true;
    grab(null);
    setPouring(false);
    // A splash of the wrong colour goes in, then the bucket tips it out
    setPaint(colourOf(item));
    setLevelBoth(Math.max(levelRef.current, 0.15));
    setMood('oops');
    sfx.splash();
    void narrator.say(['paint.oops-thats', item.nameClip]);
    onWrong(target, item);
    emptyAndRetry(1400);
  };

  // Paint flows while she holds a pipe
  useEffect(() => {
    if (held === null) return;
    const item = pipes[held];
    let frame = 0;
    let last = 0;
    let lastGlug = 0;

    const start = window.setTimeout(() => {
      if (busyRef.current) return;
      if (item.key !== target.key) {
        wrongColour(item);
        return;
      }
      setPouring(true);
      last = performance.now();
      const step = (now: number) => {
        if (busyRef.current) return;
        const next = Math.min(1, levelRef.current + (now - last) / 1000 / config.fillSeconds);
        last = now;
        setLevelBoth(next);
        if (now - lastGlug > GLUG_EVERY_MS) {
          lastGlug = now;
          sfx.glug(next);
        }
        if (!shoutedRef.current && next >= zone.shout) {
          shoutedRef.current = true;
          setMood('shout');
          void narrator.say(['paint.stop']);
        }
        if (next >= zone.over) {
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
    setStreamColour(colourOf(pipes[index]));
    grab(index);
  };

  const release = () => {
    if (heldRef.current === null) return;
    grab(null);
    setPouring(false);
    lastTapRef.current = Date.now();
    if (busyRef.current) return;
    const v = levelRef.current;
    if (v >= zone.lo && v <= zone.hi) {
      success();
    } else if (v > 0.05 && v < zone.lo) {
      void narrator.say(['paint.more']);
      if (!shoutedRef.current) setMood('happy');
    }
  };

  const bucketLeft = `${((bucketAt + 0.5) / pipes.length) * 100}%`;

  return (
    <div className="fill-round" ref={roundRef}>
      <header className="fill-top">
        <SpeakerButton onPress={sayPrompt} />
        <div className="fill-target" aria-label="This colour">
          <target.Display size={64} />
        </div>
      </header>

      <div className="fill-pipes" style={{ '--n': pipes.length } as CSSProperties}>
        {pipes.map((item, i) => (
          <button
            key={item.key}
            type="button"
            className={`fill-pipe ${held === i ? 'fill-pipe--held' : ''}`}
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

      <div className="fill-gap" />
      <Stream rootRef={roundRef} active={pouring} colour={streamColour} level={() => levelRef.current} />

      <div className="fill-floor">
        <div className="fill-bucket-slot" style={{ left: bucketLeft }}>
          <Bucket level={level} colour={paint} mood={mood} halfLine={config.fillTo === 'half'} pouring={pouring} at={bucketAt} />
        </div>
      </div>
    </div>
  );
}

/** Plain pouring, or mixing (see MixRound.tsx) */
function HoldToFillRound(props: RoundProps<HoldToFillConfig>) {
  return props.config.mode === 'mix' || props.config.mode === 'lab' ? <MixRound {...props} /> : <PourRound {...props} />;
}

export const holdToFill: Mechanic<HoldToFillConfig> = {
  Round: HoldToFillRound,
  clips: {
    ...mixClips,
    'paint.title': 'Paint bucket!',
    'paint.fill-with': "Let's fill the bucket with",
    'paint.fill-half': 'Fill the bucket up to the line with',
    'paint.hold': 'Press and hold the pipe!',
    'paint.stop': 'Stop! Stop! Stop!',
    'paint.just-right': 'Yay! You stopped just right!',
    'paint.more': 'A little bit more!',
    'paint.splash': 'Whoa! Splish splash! Too much!',
    'paint.past-line': 'Oops! Past the line!',
    'paint.again': "Let's try again!",
    'paint.oops-thats': "Oops! That's",
  },
};
