import { useEffect, useRef, useState } from 'react';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { fanfare } from '../../shared/audio/music';
import { progress, today, TROPHY, useProgress } from '../../shared/progress/store';
import { Celebration } from '../../shared/ui/Celebration';
import { HomeIcon, PlayIcon, RoundButton } from '../../shared/ui/RoundButton';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import type { Navigate } from '../App';
import { dayNumber, requiredSteps, todaysPlan } from '../daily';
import { missionFor } from '../missions';
import { findSection } from '../registry';
import { Tag, words } from '../../shared/ui/Tag';

/**
 * Today's lessons: a trail of stops, one per subject. A tick on each one she has
 * done today; the big play button starts the next. All done: a gold trophy sticker.
 */
export function TodayScreen({ navigate, justFinished }: { navigate: Navigate; justFinished?: string }) {
  useProgress(); // re-render when steps are marked done
  const [plan] = useState(todaysPlan);
  const done = progress.dailyDone();
  const next = plan.find((s) => !done.includes(s.id) && !s.treat) ?? plan.find((s) => !done.includes(s.id));
  const allDone = requiredSteps(plan).every((id) => done.includes(id));
  const [trophy, setTrophy] = useState(false);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const mission = progress.mission();

  useEffect(() => {
    if (justFinished) {
      const first = progress.markDaily(justFinished, requiredSteps(plan));
      if (first) {
        progress.awardSticker(TROPHY, { today: true });
        progress.setMission(missionFor(dayNumber()).id);
        setTrophy(true);
        fanfare();
        // Trophy, then a mission to do away from the screen
        void (async () => {
          await narrator.say(['today.all-done', 'mission.time']);
          await new Promise((r) => setTimeout(r, 600));
          if (alive.current) navigate({ name: 'mission', day: today(), fresh: true });
        })();
        return;
      }
    }
    void narrator.say(allDone ? ['today.all-done-again'] : done.length || justFinished ? ['today.next'] : ['today.hello']);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const play = (stepId: string) => {
    const step = plan.find((s) => s.id === stepId)!;
    sfx.pop();
    if (step.move) {
      navigate({ name: 'move', stepId: step.id, n: step.move });
      return;
    }
    navigate({ name: 'play', sectionId: step.sectionId, gameId: step.gameId, daily: { stepId: step.id, rounds: step.rounds } });
  };

  return (
    <main className="screen screen--today">
      <div className="corner-left">
        <RoundButton label="Home" variant="home" onPress={() => navigate({ name: 'home' })}>
          <HomeIcon />
        </RoundButton>
      </div>
      <header className="today-top">
        <SpeakerButton onPress={() => void narrator.say(allDone ? ['today.all-done-again'] : ['today.hello'])} />
        <span className="today-sun" aria-hidden="true">☀️</span>
      </header>

      <ol className="today-trail">
        {plan.map((step, i) => {
          const isDone = done.includes(step.id);
          const isNext = next?.id === step.id;
          if (step.move) {
            return (
              <li key={step.id} className="today-stop" style={{ animationDelay: `${i * 0.05}s` }}>
                <button
                  type="button"
                  data-step={step.id}
                  className={`today-step today-step--move ${isDone ? 'today-step--done' : ''} ${isNext ? 'today-step--next' : ''}`}
                  onClick={() => play(step.id)}
                  aria-label={`${narrator.allClips()['move.title']}${isDone ? ' (done)' : ''}`}
                >
                  <span className="today-step-icon">🤸</span>
                  {isDone && <span className="today-tick">✓</span>}
                </button>
                <Tag className="tag--step">{words('move.title')}</Tag>
              </li>
            );
          }
          const section = findSection(step.sectionId)!;
          const game = section.games.find((g) => g.id === step.gameId)!;
          return (
            <li key={step.id} className="today-stop" style={{ animationDelay: `${i * 0.05}s` }}>
              <button
                type="button"
                data-step={step.id}
                className={`today-step ${isDone ? 'today-step--done' : ''} ${isNext ? 'today-step--next' : ''} ${step.treat ? 'today-step--treat' : ''}`}
                style={{ background: section.colour }}
                onClick={() => play(step.id)}
                aria-label={`${narrator.allClips()[section.titleClip]}: ${narrator.allClips()[game.titleClip]}${isDone ? ' (done)' : ''}`}
              >
                <span className="today-step-icon">{game.icon}</span>
                {isDone && <span className="today-tick">✓</span>}
              </button>
              <Tag className="tag--step">{words(game.titleClip)}</Tag>
            </li>
          );
        })}
      </ol>

      <div className="today-bottom">
        {next && !allDone ? (
          <RoundButton label="Play the next one" variant="play" className="round-btn--huge" onPress={() => play(next.id)}>
            <PlayIcon size={64} />
          </RoundButton>
        ) : (
          <>
            <span className="today-trophy" aria-label="All done today">
              {TROPHY}
            </span>
            {mission && (
              <button
                type="button"
                className={`mission-btn ${mission.done ? 'mission-btn--done' : ''}`}
                onClick={() => {
                  sfx.pop();
                  navigate({ name: 'mission', day: today() });
                }}
                aria-label={narrator.allClips()['mission.title']}
              >
                🔍{mission.done && <span className="today-tick">✓</span>}
              </button>
            )}
          </>
        )}
      </div>

      {trophy && <Celebration big />}
    </main>
  );
}
