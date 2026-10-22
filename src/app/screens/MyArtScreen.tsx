import { useEffect, useRef, useState } from 'react';
import { sfx } from '../../shared/audio/sfx';
import { narrator } from '../../shared/audio/narrator';
import { useArt, type Artwork } from '../../shared/art';
import { BackIcon, RoundButton } from '../../shared/ui/RoundButton';
import type { Navigate } from '../App';

/**
 * My Art: her drawings, newest first. Tap one to see it big and hear what she
 * said about it.
 */
export function MyArtScreen({ navigate }: { navigate: Navigate }) {
  const works = [...useArt()].reverse();
  const [open, setOpen] = useState<Artwork | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  useEffect(() => () => audio.current?.pause(), []);
  useEffect(() => {
    void narrator.say(['art.my-art']);
  }, []);

  const play = (w: Artwork) => {
    audio.current?.pause();
    if (!w.voice) return;
    narrator.stop();
    audio.current = new Audio(w.voice);
    void audio.current.play().catch(() => {});
  };

  return (
    <main className="screen screen--scroll myart">
      <div className="corner-left">
        <RoundButton label="Back" variant="home" onPress={() => (open ? setOpen(null) : navigate({ name: 'section', sectionId: 'art' }))}>
          <BackIcon />
        </RoundButton>
      </div>
      {open ? (
        <div className="myart-big">
          <img src={open.image} alt="" />
          <p className="myart-date">{new Date(`${open.date}T12:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          {open.voice && (
            <button type="button" className="myart-play" onClick={() => play(open)} aria-label="Hear what she said">
              🔊
            </button>
          )}
        </div>
      ) : (
        <div className="myart-grid">
          {works.length === 0 && <p className="myart-empty">🖍️</p>}
          {works.map((w) => (
            <button
              key={w.id}
              type="button"
              className="myart-thumb"
              onClick={() => {
                sfx.pop();
                setOpen(w);
                play(w);
              }}
              aria-label={`Drawing from ${w.date}`}
            >
              <img src={w.image} alt="" />
              {w.voice && <span className="myart-has-voice">🔊</span>}
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
