import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { PlayIcon } from '../../shared/ui/RoundButton';
import { useProgress } from '../../shared/progress/store';
import type { Navigate } from '../App';
import { hasName } from '../name';

/**
 * Browsers only allow sound after a tap, so the app opens with one big play button.
 */
export function StartScreen({ navigate }: { navigate: Navigate }) {
  const saved = useProgress();
  const name = saved.profiles[saved.activeProfileId].name;
  const start = () => {
    sfx.unlock();
    sfx.cheer();
    navigate({ name: 'home' });
    void narrator.say(hasName(name) ? ['shared.hello', 'shared.child-name', 'shared.lets-play'] : ['shared.welcome']);
  };

  return (
    <main className="screen screen--start">
      <h1 className="app-title">
        {'Little Learners'.split('').map((ch, i) => (
          <span key={i} style={{ animationDelay: `${i * 0.06}s` }}>
            {ch === ' ' ? ' ' : ch}
          </span>
        ))}
      </h1>
      {hasName(name) && <p className="start-hello">Hi, {name}!</p>}
      <button type="button" className="start-btn" onClick={start} aria-label="Start">
        <PlayIcon size={88} />
      </button>
    </main>
  );
}
