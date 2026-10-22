import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { playSong, type SongHandle } from '../../shared/audio/music';
import { fx } from '../../shared/fx';
import { BackIcon, RoundButton } from '../../shared/ui/RoundButton';
import { Tag, words } from '../../shared/ui/Tag';
import type { Navigate } from '../App';
import { availableSongs, type Song } from '../songs';

const COLOURS = ['#ff8787', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#b197fc'];

/**
 * Sing along: pick one of the songs in src/music; its picture bounces in time and
 * the words are shown so a grown-up can sing along. Then back to the list.
 */
export function SongsScreen({ navigate }: { navigate: Navigate }) {
  const songs = availableSongs();
  const [song, setSong] = useState<Song | null>(null);
  const again = useRef(false);

  useEffect(() => {
    if (!song) void narrator.say([again.current ? 'songs.again' : 'songs.choose']);
  }, [song]);

  if (song)
    return (
      <SongPlaying
        song={song}
        onEnd={() => {
          again.current = true;
          setSong(null);
        }}
      />
    );

  return (
    <main className="screen screen--scroll screen--songs">
      <div className="corner-left">
        <RoundButton label="Back" variant="home" onPress={() => navigate({ name: 'section', sectionId: 'art' })}>
          <BackIcon />
        </RoundButton>
      </div>
      <header className="calm-top">
        <span className="songs-title" aria-hidden="true">
          🎤
        </span>
      </header>
      <div className="calm-picks">
        {songs.map((s, i) => (
          <button
            key={s.key}
            type="button"
            className="calm-pick song-pick"
            style={{ background: COLOURS[i % COLOURS.length], animationDelay: `${i * 0.07}s` }}
            onClick={() => {
              sfx.pop();
              setSong(s);
            }}
            aria-label={s.name}
          >
            <span className="calm-pick-icon">{s.icon}</span>
            <Tag>{words(`song.${s.key}`)}</Tag>
          </button>
        ))}
      </div>
    </main>
  );
}

function SongPlaying({ song, onEnd }: { song: Song; onEnd: () => void }) {
  const [started, setStarted] = useState(false);
  const iconRef = useRef<HTMLSpanElement>(null);
  const handle = useRef<SongHandle | null>(null);

  useEffect(() => {
    narrator.stop();
    handle.current = playSong(song.key, {
      level: 0.95,
      onStart: () => setStarted(true),
      onEnd,
    });
    return () => handle.current?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song.key]);

  // Little notes float up now and then
  useEffect(() => {
    if (!started) return;
    const t = window.setInterval(() => fx.burstAt(iconRef.current, 'sparkles', { count: 3, power: 0.7 }), (60 / song.bpm) * 4000);
    return () => window.clearInterval(t);
  }, [started, song.bpm]);

  return (
    <main className="screen screen--songs screen--song-playing" style={{ '--beat': `${(60 / song.bpm).toFixed(3)}s` } as CSSProperties}>
      <div className="corner-left">
        <RoundButton
          label="Stop"
          variant="home"
          onPress={() => {
            handle.current?.stop();
            onEnd();
          }}
        >
          <BackIcon />
        </RoundButton>
      </div>
      <div className="song-stage">
        <span ref={iconRef} className={`song-icon ${started ? 'song-icon--dancing' : 'song-icon--waiting'}`} aria-hidden="true">
          {song.icon}
        </span>
        <span className="song-notes" aria-hidden="true">
          {started && ['🎵', '🎶', '🎵'].map((n, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.9}s` }}>
              {n}
            </span>
          ))}
        </span>
      </div>
      <div className="song-words" aria-label={`Words of ${song.name}`}>
        <p className="song-words-title">{song.name}</p>
        {song.words.split('\n\n').map((verse, i) => (
          <p key={i}>
            {verse.split('\n').map((line, j) => (
              <span key={j}>
                {line}
                <br />
              </span>
            ))}
          </p>
        ))}
      </div>
    </main>
  );
}
