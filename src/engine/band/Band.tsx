import { useEffect, useRef, useState } from 'react';
import type { BandConfig } from '../../types/learning';
import type { Mechanic, RoundProps } from '../types';
import { narrator } from '../../shared/audio/narrator';
import { audioContext } from '../../shared/audio/sfx';
import { playSong, type SongHandle } from '../../shared/audio/music';
import { availableSongs } from '../../app/songs';
import { fx } from '../../shared/fx';
import './band.css';

/**
 * Play Along: a little band (drum, clapping hands, bell, shaker) to play with
 * one of her songs, or with a steady beat when there are no songs yet. No
 * right or wrong: keeping a beat, loud and soft, together (NCF: percussion
 * band, music and movement).
 */

type Pad = { key: string; emoji: string; colour: string; play: (a: AudioContext) => void };

function noiseHit(a: AudioContext, type: BiquadFilterType, freq: number, length: number, volume: number) {
  const t = a.currentTime;
  const n = Math.floor(a.sampleRate * length);
  const buffer = a.createBuffer(1, n, a.sampleRate);
  const d = buffer.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 2;
  const src = a.createBufferSource();
  src.buffer = buffer;
  const f = a.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  const g = a.createGain();
  g.gain.value = volume;
  src.connect(f).connect(g).connect(a.destination);
  src.start(t);
}
function toneHit(a: AudioContext, freq: number, to: number, length: number, volume: number, type: OscillatorType = 'sine') {
  const t = a.currentTime;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(to, t + length);
  g.gain.setValueAtTime(volume, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + length);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + length + 0.02);
}

const PADS: Pad[] = [
  { key: 'drum', emoji: '🥁', colour: '#ff8787', play: (a) => (toneHit(a, 150, 50, 0.35, 0.7), noiseHit(a, 'lowpass', 800, 0.08, 0.4)) },
  { key: 'clap', emoji: '👏', colour: '#ffd43b', play: (a) => [0, 0.012, 0.024].forEach((d) => setTimeout(() => noiseHit(a, 'bandpass', 1500, 0.07, 0.8), d * 1000)) },
  { key: 'bell', emoji: '🔔', colour: '#74c0fc', play: (a) => (toneHit(a, 1320, 1318, 0.9, 0.18), toneHit(a, 2640, 2636, 0.4, 0.05)) },
  { key: 'shaker', emoji: '🎶', colour: '#b2f2bb', play: (a) => noiseHit(a, 'highpass', 5000, 0.14, 0.5) },
];

function BandRound({ config, target, onCorrect, onRoundComplete }: RoundProps<BandConfig>) {
  const [hits, setHits] = useState(0);
  const [lit, setLit] = useState<string | null>(null);
  const song = useRef<SongHandle | null>(null);
  const beat = useRef<number | undefined>(undefined);
  const alive = useRef(true);
  const done = useRef(false);

  const end = async () => {
    if (done.current) return;
    done.current = true;
    song.current?.stop();
    window.clearInterval(beat.current);
    if (!alive.current) return;
    fx.yay(undefined, { stars: 16 });
    onCorrect(target);
    await narrator.say(['band.well-played']);
    if (alive.current) onRoundComplete();
  };

  useEffect(() => {
    void (async () => {
      await narrator.say(['band.hello']);
      if (!alive.current) return;
      const songs = availableSongs();
      const pick = songs.length ? songs[Math.floor(Math.random() * songs.length)] : null;
      song.current = pick ? playSong(pick.key, { onEnd: () => void end() }) : null;
      if (!song.current) {
        // No songs yet: a steady tick to keep time with, then stop
        const a = audioContext();
        let n = 0;
        beat.current = window.setInterval(() => {
          if (a) toneHit(a, n % 4 === 0 ? 880 : 660, n % 4 === 0 ? 878 : 658, 0.05, 0.08);
          n++;
          if (n >= config.seconds * 2) void end();
        }, 500);
      }
    })();
    return () => {
      alive.current = false;
      song.current?.stop();
      window.clearInterval(beat.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hit = (pad: Pad, el: HTMLElement) => {
    const a = audioContext();
    if (a) pad.play(a);
    fx.squash(el, 0.5);
    fx.haptic('tap');
    setLit(pad.key);
    setHits((h) => h + 1);
    window.setTimeout(() => alive.current && setLit((l) => (l === pad.key ? null : l)), 150);
  };

  return (
    <div className="band-round">
      <header className="touch-top band-top">
        <button type="button" className="band-stop" onClick={() => void end()} aria-label="Finish">
          ✓
        </button>
      </header>
      <div className="band-pads">
        {PADS.map((p) => (
          <button
            key={p.key}
            type="button"
            className={`band-pad ${lit === p.key ? 'band-pad--hit' : ''}`}
            style={{ background: p.colour }}
            onPointerDown={(e) => {
              e.preventDefault();
              hit(p, e.currentTarget);
            }}
            aria-label={p.key}
          >
            {p.emoji}
          </button>
        ))}
      </div>
      <div className="band-notes" aria-hidden="true">
        {Array.from({ length: Math.min(hits, 40) }, (_, i) => (
          <span key={i}>♪</span>
        ))}
      </div>
    </div>
  );
}

export const band: Mechanic<BandConfig> = {
  Round: BandRound,
  clips: {
    'band.hello': "Let's play in the band! Play along with the music: tap the drum, clap, ring the bell and shake the shaker!",
    'band.well-played': 'What a band! Well played!',
  },
};
