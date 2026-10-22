import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { HoldButton } from '../../shared/ui/HoldButton';
import { progress, useProgress } from '../../shared/progress/store';
import { requiredSteps, todaysPlan } from '../daily';
import type { Navigate } from '../App';
import { sections } from '../registry';
import { Tag, words } from '../../shared/ui/Tag';

export function HomeScreen({ navigate }: { navigate: Navigate }) {
  useProgress();
  const required = requiredSteps(todaysPlan());
  const done = progress.dailyDone().filter((id) => required.includes(id)).length;
  /** A mission from Today's lessons that isn't ticked off yet */
  const open = progress.openMission();

  return (
    <main className="screen screen--scroll screen--home">
      <div className="corner-left">
        <button
          type="button"
          className="book-btn"
          onClick={() => {
            sfx.pop();
            navigate({ name: 'stickers' });
          }}
          aria-label="Sticker book"
        >
          📒
        </button>
        {open && (
          <button
            type="button"
            className="mission-btn mission-btn--home"
            onClick={() => {
              sfx.pop();
              navigate({ name: 'mission', day: open.day });
            }}
            aria-label="Your mission"
          >
            🔍
          </button>
        )}
      </div>
      <div className="corner-right">
        <HoldButton onHeld={() => navigate({ name: 'parent' })} />
      </div>

      <div className="tile-grid tile-grid--home">
        <button
          type="button"
          className="tile tile--today"
          onClick={() => {
            sfx.pop();
            navigate({ name: 'today' });
          }}
          aria-label={narrator.allClips()['today.title']}
        >
          <span className="tile-icon">☀️</span>
          <Tag>{words('today.title')}</Tag>
          <span className="today-dots" aria-hidden="true">
            {required.map((id, i) => (
              <span key={id} className={`today-dot ${i < done ? 'today-dot--done' : ''}`} />
            ))}
          </span>
        </button>
        {sections.map((section, i) => (
          <button
            key={section.id}
            type="button"
            className="tile"
            style={{ background: section.colour, animationDelay: `${i * 0.08}s` }}
            onClick={() => {
              sfx.pop();
              navigate({ name: 'section', sectionId: section.id });
              void narrator.say([section.titleClip]);
            }}
            aria-label={narrator.allClips()[section.titleClip]}
          >
            <span className="tile-icon">{section.icon}</span>
            <Tag>{words(section.titleClip)}</Tag>
          </button>
        ))}
        <button
          type="button"
          className="tile tile--calm"
          style={{ animationDelay: `${sections.length * 0.08}s` }}
          onClick={() => {
            sfx.pop();
            navigate({ name: 'calm' });
          }}
          aria-label={narrator.allClips()['calm.title']}
        >
          <span className="tile-icon">🌙</span>
          <Tag>{words('calm.title')}</Tag>
        </button>
      </div>
    </main>
  );
}
