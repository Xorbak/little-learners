import { useEffect, useRef, useState } from 'react';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { fx } from '../../shared/fx';
import { BackIcon, PlayIcon, RoundButton } from '../../shared/ui/RoundButton';
import type { ClipId } from '../../types/learning';
import type { Navigate } from '../App';
import { dayNumber } from '../daily';
import { movesFor, type Move, type MoveBeat } from '../moves';
import { perform } from './StickerStage';

/**
 * Movement break (part of Today's lessons): two animal moves, each shown by the
 * animal and then done together while the narrator counts. About half a minute
 * of getting up and moving between games.
 */
export function MoveBreak({ navigate, stepId, n }: { navigate: Navigate; stepId: string; n: number }) {
  const [moves] = useState(() => movesFor(dayNumber(), n));
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
      if (alive.current) await narrator.say(clips);
    };

    void (async () => {
      await wait(400);
      await say(['move.time']);
      for (let m = 0; m < moves.length && alive.current; m++) {
        const move = moves[m];
        setCurrent(m);
        setCount(0);
        setPhase('show');
        await wait(300);
        // The animal shows the move
        if (actorRef.current) perform(move.demo, actorRef.current, later);
        await say([`move.${move.key}`]);
        await wait(600);
        await say(['move.ready']);
        setPhase('count');
        for (let i = 1; i <= move.count && alive.current; i++) {
          setCount(i);
          beat(move, actorRef.current);
          await say([`numbers.name.${i}`]);
          // Time to actually do the move before the next number
          await wait({ jump: 750, stomp: 750, stretch: 900, balance: 900, sway: 550, shake: 550 }[move.beat]);
        }
        if (!alive.current) return;
        sfx.sparkle();
        fx.burstAt(actorRef.current, 'stars', { count: 10, power: 1.3 });
        await say([`move.well.${move.key}`]);
        await wait(500);
      }
      if (!alive.current) return;
      setPhase('done');
      sfx.fanfare();
      fx.rain(40);
      await say(['move.all-done']);
    })();

    return () => {
      alive.current = false;
      timers.forEach(window.clearTimeout);
    };
  }, [moves]);

  const move = moves[current];

  return (
    <main className="screen screen--move">
      <div className="corner-left">
        <RoundButton label="Back" variant="home" onPress={() => navigate({ name: 'today' })}>
          <BackIcon />
        </RoundButton>
      </div>
      <header className="move-top">
        <span className="move-badge" aria-hidden="true">🤸</span>
      </header>
      <div className="move-stage">
        <div ref={actorRef} className={`move-actor ${phase === 'done' ? 'move-actor--done' : ''}`} key={move.key} aria-label={narrator.allClips()[`move.${move.key}`]}>
          {move.emoji}
        </div>
      </div>
      <div className="move-count" aria-label={`${count} of ${move.count}`}>
        {Array.from({ length: move.count }, (_, i) => (
          <span key={`${move.key}-${i}`} className={`move-dot ${i < count ? 'move-dot--on' : ''}`}>
            {i < count ? i + 1 : ''}
          </span>
        ))}
      </div>
      <div className="move-bottom">
        {phase === 'done' && (
          <RoundButton
            label="Back to today"
            variant="play"
            className="round-btn--huge"
            onPress={() => {
              narrator.stop();
              navigate({ name: 'today', justFinished: stepId });
            }}
          >
            <PlayIcon size={72} />
          </RoundButton>
        )}
      </div>
    </main>
  );
}

/** The little move the animal makes on each count */
function beat(move: Move, el: HTMLElement | null) {
  if (!el) return;
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
  el.animate(frames[move.beat], { duration: 650, easing: 'ease-in-out' });
  if (move.beat === 'jump' || move.beat === 'stomp') {
    window.setTimeout(() => {
      const r = el.getBoundingClientRect();
      fx.burst(r.left + r.width / 2, r.bottom - r.height * 0.1, 'dust', { count: move.beat === 'stomp' ? 8 : 4 });
      if (move.beat === 'stomp') fx.shake(0.6);
      sfx.tap();
    }, 520);
  }
}
