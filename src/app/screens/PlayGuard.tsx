import { useEffect, useMemo, useState } from 'react';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { playClock } from '../../shared/playtime';
import { HoldButton } from '../../shared/ui/HoldButton';
import { EXERCISES, pickExercises } from '../exercises';
import { MISSIONS } from '../missions';
import { ExerciseRun } from './ExerciseRun';

/**
 * Screens that cover whatever she is playing when play time says so:
 * an exercise break (every few minutes), or "time for a break" when the
 * session is over (locked until the rest time is up or a grown-up unlocks it).
 * The game underneath stays where it was and its narrator is kept quiet.
 */

/** Exercise break: two exercises, then back to the game */
export function PlayBreak({ onDone }: { onDone: (keys: string[]) => void }) {
  const exercises = useMemo(() => {
    const { exercisesOff } = playClock.settings();
    const allowed = EXERCISES.map((e) => e.key).filter((k) => !exercisesOff.includes(k));
    return pickExercises(allowed, 2, playClock.lastExercises());
  }, []);
  return (
    <div className="guard guard--break" role="dialog" aria-label="Movement break">
      <header className="move-top">
        <span className="move-badge" aria-hidden="true">🤸</span>
      </header>
      <ExerciseRun exercises={exercises} force outroClip="move.back-to-play" doneLabel="Back to playing" onDone={() => onDone(exercises.map((e) => e.key))} />
    </div>
  );
}

/** Time's up: rest now. Only a grown-up (or the clock) can open it again. */
export function TimeUp({ fresh, onUnlocked }: { fresh: boolean; onUnlocked: () => void }) {
  const [idea] = useState(() => MISSIONS[Math.floor(Math.random() * MISSIONS.length)]);
  const [grownUp, setGrownUp] = useState(false);
  const until = playClock.lockedUntil();

  useEffect(() => {
    sfx.cheer();
    void narrator.say(fresh ? ['guard.stop', 'guard.idea', `mission.${idea.id}`] : ['guard.resting'], { force: true });
  }, [fresh, idea.id]);

  // When the rest time is over, open up again by itself
  useEffect(() => {
    if (!until) return;
    const t = window.setInterval(() => {
      if (!playClock.lockedUntil()) {
        window.clearInterval(t);
        onUnlocked();
      }
    }, 5000);
    return () => window.clearInterval(t);
  }, [until, onUnlocked]);

  const unlock = (extra?: number) => {
    playClock.unlock(extra);
    sfx.pop();
    void narrator.say(['guard.unlocked'], { force: true });
    onUnlocked();
  };

  const time = until
    ? new Date(until).toDateString() === new Date().toDateString()
      ? new Date(until).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      : `tomorrow, ${new Date(until).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`
    : '';

  return (
    <div className="guard guard--rest" role="dialog" aria-label="Time for a break">
      <div className="corner-right">
        <HoldButton onHeld={() => setGrownUp(true)} />
      </div>
      <div className="rest-sky" aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => (
          <span key={i} className="rest-star" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 60}%`, animationDelay: `${(i % 7) * 0.4}s` }}>
            ✦
          </span>
        ))}
      </div>
      <div className="rest-owl" aria-hidden="true">
        🦉<span className="rest-zzz">z z z</span>
      </div>
      <button type="button" className="rest-idea" onClick={() => void narrator.say(['guard.idea', `mission.${idea.id}`], { force: true })} aria-label="An idea for what to do">
        {idea.picture.map((p, i) => (
          <span key={i}>{p}</span>
        ))}
      </button>
      {time && <p className="rest-time">Play time again at {time}</p>}

      {grownUp && (
        <div className="rest-panel" role="dialog" aria-label="Grown-ups">
          <p>Played {playClock.usedMin()} min this session.</p>
          <div className="rest-panel-buttons">
            <button type="button" className="parent-btn" onClick={() => unlock(5)}>
              5 more minutes
            </button>
            <button type="button" className="parent-btn" onClick={() => unlock(15)}>
              15 more minutes
            </button>
            <button type="button" className="parent-btn" onClick={() => unlock()}>
              New session
            </button>
            <button type="button" className="parent-btn parent-btn--small" onClick={() => setGrownUp(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
