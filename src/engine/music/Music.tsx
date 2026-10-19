import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { MusicConfig } from '../../types/learning';
import type { Mechanic, RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { sfx } from '../../shared/audio/sfx';
import { SpeakerButton } from '../../shared/ui/SpeakerButton';
import './music.css';

/**
 * Xylophone.
 * Free: tap any bar; 🎵 plays Twinkle Twinkle with the bars lighting up; ✓ to finish.
 * Follow: the bars play a little tune and light up; she copies it. A wrong bar
 * wobbles and the tune plays again. No sounds are files: notes are made in code.
 */

const COLOURS = ['#f03e3e', '#fd7e14', '#fcc419', '#40c057', '#15aabf', '#4c6ef5', '#ae3ec9', '#e64980'];
const TWINKLE = [0, 0, 4, 4, 5, 5, 4, -1, 3, 3, 2, 2, 1, 1, 0];
const STEP_MS = 520;

function MusicRound({ config, onRoundComplete }: RoundProps<MusicConfig>) {
  const [lit, setLit] = useState<number | null>(null);
  const [wobble, setWobble] = useState<number | null>(null);
  // A short tune; never the same bar twice in a row, so each note is easy to see
  const [tune] = useState(() => {
    const t: number[] = [];
    for (let i = 0; i < (config.notes ?? 3); i++) {
      let n = Math.floor(Math.random() * config.bars);
      while (config.bars > 1 && n === t[i - 1]) n = Math.floor(Math.random() * config.bars);
      t.push(n);
    }
    return t;
  });
  // Short tunes are played slowly
  const stepMs = (config.notes ?? 3) <= 2 ? 900 : STEP_MS;
  const [nextBar, setNextBar] = useState<number | null>(null);
  const [turn, setTurn] = useState<'listen' | 'play' | 'done'>(config.mode === 'follow' ? 'listen' : 'play');
  const progressRef = useRef(0);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  const clearAll = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearAll, []);

  const light = (bar: number) => {
    setLit(bar);
    sfx.note(bar);
    later(() => setLit((l) => (l === bar ? null : l)), 260);
  };

  const playSequence = (seq: number[], then?: () => void) => {
    const step = seq === tune ? stepMs : STEP_MS;
    seq.forEach((bar, i) => {
      if (bar >= 0) later(() => light(bar), i * step);
    });
    if (then) later(then, seq.length * step + 200);
  };

  const listen = () => {
    setTurn('listen');
    setNextBar(null);
    progressRef.current = 0;
    void narrator.say(['music.listen']);
    later(() => playSequence(tune, () => {
      setTurn('play');
      if (config.guide) setNextBar(tune[0]);
      void narrator.say([tune.length === 1 ? 'music.your-turn-one' : 'music.your-turn']);
    }), 1300);
  };

  useEffect(() => {
    if (config.mode === 'follow') listen();
    else void narrator.say(['music.free']);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tap = (bar: number) => {
    if (config.mode === 'free') {
      light(bar);
      return;
    }
    if (turn !== 'play') return;
    if (bar === tune[progressRef.current]) {
      light(bar);
      progressRef.current += 1;
      if (config.guide) setNextBar(progressRef.current < tune.length ? tune[progressRef.current] : null);
      if (progressRef.current === tune.length) {
        setTurn('done');
        later(() => void narrator.say(['music.yes']), 500);
        later(onRoundComplete, 2400);
      }
      return;
    }
    sfx.boing();
    setWobble(bar);
    later(() => setWobble(null), 500);
    later(listen, 700);
  };

  return (
    <div className="mus-round">
      <header className="mus-top">
        <SpeakerButton onPress={config.mode === 'follow' ? listen : () => void narrator.say(['music.free'])} />
        {config.mode === 'free' && (
          <>
            <button
              type="button"
              className="mus-btn"
              onClick={() => {
                clearAll();
                playSequence(TWINKLE);
              }}
              aria-label="Play a song"
            >
              🎵
            </button>
            <button type="button" className="mus-btn mus-btn--done" onClick={() => onRoundComplete()} aria-label="All done">
              ✓
            </button>
          </>
        )}
      </header>
      <div className={`mus-xylo ${turn === 'listen' ? 'mus-xylo--listen' : ''}`}>
        {Array.from({ length: config.bars }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`mus-bar ${lit === i ? 'mus-bar--lit' : ''} ${wobble === i ? 'mus-bar--wobble' : ''} ${nextBar === i && turn === 'play' ? 'mus-bar--next' : ''}`}
            style={{ '--c': COLOURS[i % COLOURS.length], '--len': `${100 - (i * 40) / Math.max(1, config.bars - 1)}%` } as CSSProperties}
            onPointerDown={(e) => {
              e.preventDefault();
              tap(i);
            }}
            aria-label={`Note ${i + 1}`}
          >
            <span className="mus-pin" />
            <span className="mus-pin" />
          </button>
        ))}
      </div>
    </div>
  );
}

export const music: Mechanic<MusicConfig> = {
  Round: MusicRound,
  clips: {
    'music.title': 'Music!',
    'music.free': 'Tap the bars to make music!',
    'music.listen': 'Listen…',
    'music.your-turn': 'Your turn!',
    'music.your-turn-one': 'Your turn! Tap the same one!',
    'music.yes': 'Beautiful music!',
  },
};
