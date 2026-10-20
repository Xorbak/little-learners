import { useEffect, useRef, useState } from 'react';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { fx } from '../../shared/fx';
import { progress } from '../../shared/progress/store';
import { Celebration } from '../../shared/ui/Celebration';
import { HomeIcon, RoundButton } from '../../shared/ui/RoundButton';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import type { Navigate } from '../App';
import { missionById } from '../missions';
import { StickerStage } from './StickerStage';
import { Tag, words } from '../../shared/ui/Tag';

/**
 * A mission to do away from the screen ("Find three red things!").
 * She goes and does it; a grown-up holds the tick to say it's done, and she
 * gets a sticker for it.
 */
export function MissionScreen({ navigate, day, fresh }: { navigate: Navigate; day: string; fresh?: boolean }) {
  const entry = progress.mission(day);
  const mission = entry ? missionById(entry.id) : undefined;
  const [done, setDone] = useState(!!entry?.done);
  const [sticker, setSticker] = useState<string | null>(null);
  const [show, setShow] = useState<DOMRect | null>(null);
  const stickerRef = useRef<HTMLButtonElement>(null);

  const tell = () => mission && void narrator.say([fresh ? 'mission.intro' : 'mission.again', `mission.${mission.id}`, 'mission.go']);
  useEffect(() => {
    if (!done) tell();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tick = () => {
    if (!mission || done) return;
    progress.missionDone(day);
    const won = progress.awardSticker(undefined, { mission: mission.id });
    setDone(true);
    setSticker(won);
    sfx.fanfare();
    void narrator.say(['mission.done']);
    window.setTimeout(() => {
      const el = stickerRef.current;
      if (!el) return;
      el.classList.add('sticker-won--landed');
      sfx.thud();
      fx.burstAt(el, 'stars', { count: 12, power: 1.4 });
      fx.shake(1.2);
      fx.haptic(30);
    }, 1150);
  };

  useEffect(() => {
    if (!mission) navigate({ name: 'home' });
  }, [mission, navigate]);
  if (!mission) return null;

  return (
    <main className="screen screen--mission">
      <div className="corner-left">
        <RoundButton label="Home" variant="home" onPress={() => navigate({ name: 'home' })}>
          <HomeIcon />
        </RoundButton>
      </div>
      <header className="mission-top">
        <SpeakerButton onPress={tell} />
        <span className="mission-badge" aria-hidden="true">🔍</span>
      </header>

      <div className={`mission-card ${done ? 'mission-card--done' : ''}`} aria-label={narrator.allClips()[`mission.${mission.id}`]}>
        {mission.picture.map((p, i) => (
          <span key={i} className="mission-pic" style={{ animationDelay: `${0.15 + i * 0.12}s` }}>
            {p}
          </span>
        ))}
        {done && <span className="mission-tick">✓</span>}
      </div>
      <Tag className="tag--line tag--mission">{words(`mission.${mission.id}`)}</Tag>

      {!done && (
        <div className="mission-grownup">
          <MissionHold onHeld={tick} />
        </div>
      )}

      {sticker && (
        <>
          <Celebration big />
          <button
            type="button"
            className="sticker-won"
            ref={stickerRef}
            aria-label="You got a sticker"
            onClick={(e) => {
              sfx.pop();
              setShow(e.currentTarget.getBoundingClientRect());
            }}
          >
            <span className="sticker-won-face" style={show ? { opacity: 0 } : undefined}>
              {sticker}
            </span>
          </button>
        </>
      )}
      {sticker && show && <StickerStage emoji={sticker} from={show} why={progress.stickerWhy(sticker)} onClose={() => setShow(null)} />}
    </main>
  );
}

/** Grown-ups hold the tick for 2 seconds to say the mission is done */
function MissionHold({ onHeld }: { onHeld: () => void }) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const start = () => {
    setHolding(true);
    timer.current = window.setTimeout(() => {
      setHolding(false);
      onHeld();
    }, 2000);
  };
  const cancel = () => {
    setHolding(false);
    window.clearTimeout(timer.current);
  };
  return (
    <button
      type="button"
      className={`mission-hold ${holding ? 'mission-hold--holding' : ''}`}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
      aria-label="Grown-ups: hold to tick the mission"
    >
      <svg viewBox="0 0 36 36" className="mission-hold-ring" aria-hidden="true">
        <circle cx="18" cy="18" r="16" />
      </svg>
      <span className="mission-hold-tick">✓</span>
      <span className="mission-hold-label">Grown-ups: hold</span>
    </button>
  );
}
