import { useEffect, useRef, useState } from 'react';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { fanfare } from '../../shared/audio/music';
import { fx } from '../../shared/fx';
import { haptic } from '../../shared/haptics';
import { PlayIcon, RoundButton } from '../../shared/ui/RoundButton';
import type { ClipId } from '../../types/learning';
import type { Exercise, MoveBeat } from '../exercises';
import { KidFigure, kidBeat, kidBeatMs } from './KidFigure';
import { perform } from './StickerStage';
import { Tag } from '../../shared/ui/Tag';

/**
 * Runs a few exercises: each is shown first (the drawn kid or the animal does
 * it), then done together while the narrator counts, pausing on each number so
 * she has time to move. Used by Today's movement breaks and play-time breaks.
 */
export function ExerciseRun({
  exercises,
  outroClip = 'move.all-done',
  doneLabel,
  onDone,
  force = false,
}: {
  exercises: Exercise[];
  outroClip?: ClipId;
  doneLabel: string;
  onDone: () => void;
  /** Speak even while the narrator is kept quiet for the screen underneath */
  force?: boolean;
}) {
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<'show' | 'count' | 'done'>('show');
  const actorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Per run, so React's development double-start doesn't count twice
    const alive = { current: true };
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const say = async (clips: ClipId[]) => {
      if (alive.current) await narrator.say(clips, { force });
    };

    void (async () => {
      await wait(400);
      await say(['move.time']);
      for (let m = 0; m < exercises.length && alive.current; m++) {
        const ex = exercises[m];
        setCurrent(m);
        setCount(0);
        setPhase('show');
        await wait(350);
        // Show how it's done
        const el = actorRef.current;
        if (el && ex.kid) {
          kidBeat(el, ex.kid);
          later(() => kidBeat(actorRef.current, ex.kid!), kidBeatMs(ex.kid) + 150);
        } else if (el && ex.demo) perform(ex.demo, el, later);
        await say([`move.${ex.key}`]);
        await wait(500);
        await say(['move.ready']);
        setPhase('count');
        for (let i = 1; i <= ex.count && alive.current; i++) {
          setCount(i);
          beat(ex, actorRef.current);
          haptic('count');
          await say([`numbers.name.${i}`]);
          // Time to actually do the move before the next number
          const pause = { jump: 750, stomp: 750, stretch: 900, balance: 900, sway: 600, shake: 550 }[ex.beat];
          await wait(ex.kid ? Math.max(pause, kidBeatMs(ex.kid) - 300) : pause);
        }
        if (!alive.current) return;
        sfx.sparkle();
        fx.burstAt(actorRef.current, 'stars', { count: 10, power: 1.3 });
        await say([`move.well.${ex.key}`]);
        await wait(500);
      }
      if (!alive.current) return;
      setPhase('done');
      fanfare();
      fx.rain(40);
      await say([outroClip]);
    })();

    return () => {
      alive.current = false;
      timers.forEach(window.clearTimeout);
    };
  }, [exercises, force, outroClip]);

  const ex = exercises[current];

  return (
    <>
      <div className="move-stage">
        <div
          ref={actorRef}
          className={`move-actor ${ex.kid ? 'move-actor--kid' : ''} ${ex.kid === 'wheelbarrow' ? 'move-actor--wide' : ''} ${phase === 'done' ? 'move-actor--done' : ''}`}
          key={ex.key}
          aria-label={narrator.allClips()[`move.${ex.key}`]}
        >
          {ex.kid ? <KidFigure pose={ex.kid} /> : ex.emoji}
          {ex.grownUp && (
            <span className="move-grownup" aria-label="With a grown-up">
              🤝
            </span>
          )}
        </div>
      </div>
      <Tag className="tag--line tag--exercise">{ex.says}</Tag>
      <div className="move-count" aria-label={`${count} of ${ex.count}`}>
        {Array.from({ length: ex.count }, (_, i) => (
          <span key={`${ex.key}-${i}`} className={`move-dot ${i < count ? 'move-dot--on' : ''}`}>
            {i < count ? i + 1 : ''}
          </span>
        ))}
      </div>
      <div className="move-bottom">
        {phase === 'done' && (
          <RoundButton
            label={doneLabel}
            variant="play"
            className="round-btn--huge"
            onPress={() => {
              narrator.stop();
              onDone();
            }}
          >
            <PlayIcon size={72} />
          </RoundButton>
        )}
      </div>
    </>
  );
}

/** The little move on each count */
function beat(ex: Exercise, el: HTMLElement | null) {
  if (!el) return;
  if (ex.kid) {
    kidBeat(el, ex.kid);
  } else {
    const frames: Record<MoveBeat, Keyframe[]> = {
      jump: [
        { transform: 'translateY(0) scale(1.15, 0.85)' },
        { transform: 'translateY(-14vh) scale(0.92, 1.1)', offset: 0.45 },
        { transform: 'translateY(0) scale(1.15, 0.85)', offset: 0.85 },
        { transform: 'none' },
      ],
      stomp: [
        { transform: 'translateY(0) rotate(0)' },
        { transform: 'translateY(-5vh) rotate(8deg)', offset: 0.4 },
        { transform: 'translateY(0) scale(1.12, 0.88)', offset: 0.75 },
        { transform: 'none' },
      ],
      sway: [
        { transform: 'rotate(0) translateX(0)' },
        { transform: 'rotate(-12deg) translateX(-4vw)', offset: 0.35 },
        { transform: 'rotate(12deg) translateX(4vw)', offset: 0.75 },
        { transform: 'none' },
      ],
      stretch: [
        { transform: 'scale(1)' },
        { transform: 'scale(0.85, 1.5)', offset: 0.45 },
        { transform: 'scale(1.1, 0.85)', offset: 0.8 },
        { transform: 'none' },
      ],
      shake: [
        { transform: 'rotate(0)' },
        { transform: 'rotate(-14deg)', offset: 0.2 },
        { transform: 'rotate(14deg)', offset: 0.4 },
        { transform: 'rotate(-10deg)', offset: 0.6 },
        { transform: 'rotate(8deg)', offset: 0.8 },
        { transform: 'none' },
      ],
      balance: [
        { transform: 'rotate(0)' },
        { transform: 'rotate(-4deg)', offset: 0.3 },
        { transform: 'rotate(3deg)', offset: 0.7 },
        { transform: 'none' },
      ],
    };
    el.getAnimations().forEach((a) => a.cancel());
    el.style.transformOrigin = '50% 100%';
    el.animate(frames[ex.beat], { duration: 650, easing: 'ease-in-out' });
  }
  if (ex.beat === 'jump' || ex.beat === 'stomp') {
    window.setTimeout(() => {
      const r = el.getBoundingClientRect();
      fx.burst(r.left + r.width / 2, r.bottom - r.height * 0.05, 'dust', { count: ex.beat === 'stomp' ? 8 : 4 });
      if (ex.beat === 'stomp') fx.shake(0.6);
      sfx.tap();
    }, 520);
  }
}
