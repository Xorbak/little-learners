import { audioContext } from './sfx';

/**
 * Sounds around us: a phone, the doorbell, a car hooting, rain…
 *
 * Each one is made in code, so they work straight away. A real recording is
 * better: drop it in src/sounds/<name>.mp3 (e.g. src/sounds/doorbell.mp3) and
 * it is used instead. Free recordings: freesound.org or pixabay.com/sound-effects.
 */

const files = import.meta.glob('../../sounds/*.{mp3,m4a,wav,ogg,webm}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const recordings: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) recordings[(path.split('/').pop() ?? '').replace(/\.[^.]+$/, '')] = url;

export const EVERYDAY_SOUNDS = ['phone', 'doorbell', 'car-horn', 'siren', 'clock', 'rain', 'drum', 'bike-bell', 'train', 'knock', 'thunder', 'tap', 'bird', 'snore', 'kettle'] as const;
export type EverydaySound = (typeof EVERYDAY_SOUNDS)[number];

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function osc(a: AudioContext, opts: { type: OscillatorType; freq: number; at: number; length: number; volume: number; to?: number; attack?: number; filter?: number }) {
  const t = a.currentTime + opts.at;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = opts.type;
  o.frequency.setValueAtTime(opts.freq, t);
  if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, t + opts.length);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(opts.volume, t + (opts.attack ?? 0.01));
  g.gain.exponentialRampToValueAtTime(0.0001, t + opts.length);
  let node: AudioNode = o;
  if (opts.filter) {
    const f = a.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = opts.filter;
    o.connect(f);
    node = f;
  }
  node.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + opts.length + 0.05);
  return o;
}

/** Filtered noise with a gain shape over time ([seconds, level] points) */
function noise(a: AudioContext, opts: { at: number; length: number; type: BiquadFilterType; freq: number; q?: number; shape: [number, number][] }) {
  const t = a.currentTime + opts.at;
  const n = Math.floor(a.sampleRate * opts.length);
  const buffer = a.createBuffer(1, n, a.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buffer;
  const f = a.createBiquadFilter();
  f.type = opts.type;
  f.frequency.value = opts.freq;
  f.Q.value = opts.q ?? 1;
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  for (const [time, level] of opts.shape) g.gain.linearRampToValueAtTime(level, t + time);
  src.connect(f).connect(g).connect(a.destination);
  src.start(t);
  src.stop(t + opts.length);
}

/** Makes the sound; returns how long it lasts (ms) */
function synth(a: AudioContext, key: EverydaySound): number {
  switch (key) {
    case 'phone': {
      // Two rings, each a fast warble of two notes
      for (const start of [0, 1.1]) {
        for (let i = 0; i < 16; i++) {
          osc(a, { type: 'sine', freq: i % 2 ? 480 : 440, at: start + i * 0.05, length: 0.05, volume: 0.18, attack: 0.003 });
          osc(a, { type: 'sine', freq: i % 2 ? 960 : 880, at: start + i * 0.05, length: 0.05, volume: 0.06, attack: 0.003 });
        }
      }
      return 2000;
    }
    case 'doorbell':
      osc(a, { type: 'sine', freq: 659, at: 0, length: 1.2, volume: 0.3 });
      osc(a, { type: 'sine', freq: 1318, at: 0, length: 0.5, volume: 0.06 });
      osc(a, { type: 'sine', freq: 523, at: 0.7, length: 1.6, volume: 0.3 });
      osc(a, { type: 'sine', freq: 1046, at: 0.7, length: 0.6, volume: 0.06 });
      return 2300;
    case 'car-horn':
      for (const at of [0, 0.38]) {
        osc(a, { type: 'square', freq: 350, at, length: 0.28, volume: 0.12, filter: 1400, attack: 0.02 });
        osc(a, { type: 'square', freq: 440, at, length: 0.28, volume: 0.12, filter: 1400, attack: 0.02 });
      }
      return 800;
    case 'siren': {
      const t = a.currentTime;
      const o = a.createOscillator();
      const g = a.createGain();
      o.type = 'triangle';
      for (let i = 0; i < 4; i++) {
        o.frequency.setValueAtTime(i % 2 ? 950 : 700, t + i * 0.6);
        o.frequency.linearRampToValueAtTime(i % 2 ? 700 : 950, t + i * 0.6 + 0.55);
      }
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.25, t + 0.05);
      g.gain.setValueAtTime(0.25, t + 2.3);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);
      o.connect(g).connect(a.destination);
      o.start(t);
      o.stop(t + 2.5);
      return 2500;
    }
    case 'clock':
      for (let i = 0; i < 6; i++) noise(a, { at: i * 0.42, length: 0.04, type: 'bandpass', freq: i % 2 ? 1500 : 2400, q: 6, shape: [[0.002, 0.9], [0.04, 0]] });
      return 2500;
    case 'rain':
      noise(a, { at: 0, length: 3, type: 'bandpass', freq: 2500, q: 0.6, shape: [[0.6, 0.35], [2.4, 0.35], [3, 0]] });
      for (let i = 0; i < 40; i++) noise(a, { at: Math.random() * 2.8, length: 0.02, type: 'highpass', freq: 3000, shape: [[0.002, 0.5 * Math.random()], [0.02, 0]] });
      return 3000;
    case 'drum':
      for (const at of [0, 0.4, 0.8, 1.0]) {
        osc(a, { type: 'sine', freq: 140, to: 50, at, length: 0.35, volume: 0.6, attack: 0.003 });
        noise(a, { at, length: 0.08, type: 'lowpass', freq: 900, shape: [[0.003, 0.4], [0.08, 0]] });
      }
      return 1400;
    case 'bike-bell':
      for (const start of [0, 0.5]) {
        for (let i = 0; i < 3; i++) {
          osc(a, { type: 'sine', freq: 2100, at: start + i * 0.06, length: 0.5, volume: 0.12, attack: 0.002 });
          osc(a, { type: 'sine', freq: 2750, at: start + i * 0.06, length: 0.35, volume: 0.08, attack: 0.002 });
        }
      }
      return 1200;
    case 'train':
      for (const at of [0, 0.75]) for (const f of [520, 650, 780]) osc(a, { type: 'sawtooth', freq: f, at, length: 0.6, volume: 0.07, filter: 1600, attack: 0.08 });
      return 1500;
    case 'knock':
      for (const at of [0, 0.22, 0.44]) {
        noise(a, { at, length: 0.09, type: 'lowpass', freq: 500, shape: [[0.003, 1], [0.09, 0]] });
        osc(a, { type: 'sine', freq: 190, to: 120, at, length: 0.1, volume: 0.35, attack: 0.002 });
      }
      return 900;
    case 'thunder':
      noise(a, { at: 0, length: 3.2, type: 'lowpass', freq: 180, shape: [[0.08, 1], [0.5, 0.5], [0.9, 0.9], [1.8, 0.45], [3.2, 0]] });
      noise(a, { at: 0, length: 0.4, type: 'lowpass', freq: 1200, shape: [[0.02, 0.6], [0.4, 0]] });
      return 3200;
    case 'tap':
      noise(a, { at: 0, length: 2.6, type: 'bandpass', freq: 1100, q: 1.5, shape: [[0.15, 0.5], [2.3, 0.5], [2.6, 0]] });
      for (let i = 0; i < 30; i++) osc(a, { type: 'sine', freq: 600 + Math.random() * 900, at: Math.random() * 2.4, length: 0.05, volume: 0.05 });
      return 2600;
    case 'bird':
      for (const start of [0, 1]) for (let i = 0; i < 4; i++) osc(a, { type: 'sine', freq: 2800, to: 4400, at: start + i * 0.13, length: 0.09, volume: 0.15, attack: 0.005 });
      return 1700;
    case 'snore':
      noise(a, { at: 0, length: 1.3, type: 'lowpass', freq: 260, q: 4, shape: [[0.9, 0.9], [1.3, 0]] });
      osc(a, { type: 'sawtooth', freq: 70, at: 0, length: 1.3, volume: 0.06, filter: 300, attack: 0.8 });
      noise(a, { at: 1.5, length: 1.1, type: 'bandpass', freq: 1800, q: 2, shape: [[0.5, 0.12], [1.1, 0]] });
      return 2700;
    case 'kettle': {
      const t = a.currentTime;
      const o = a.createOscillator();
      const g = a.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(1300, t);
      o.frequency.exponentialRampToValueAtTime(2100, t + 1.5);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.8);
      g.gain.setValueAtTime(0.12, t + 2.2);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);
      o.connect(g).connect(a.destination);
      o.start(t);
      o.stop(t + 2.6);
      noise(a, { at: 0, length: 2.5, type: 'highpass', freq: 3000, shape: [[1, 0.08], [2.5, 0]] });
      return 2600;
    }
  }
}

let playing: HTMLAudioElement | null = null;

/** Play a sound around us; resolves when it has finished */
export async function playEveryday(key: EverydaySound): Promise<void> {
  playing?.pause();
  const file = recordings[key];
  if (file) {
    await new Promise<void>((resolve) => {
      const audio = new Audio(file);
      playing = audio;
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      audio.onpause = () => resolve();
      audio.play().catch(() => resolve());
      // Long recordings: stop after 4 seconds
      setTimeout(() => {
        if (playing === audio) audio.pause();
      }, 4000);
    });
    return;
  }
  const a = audioContext();
  if (!a) return;
  await wait(synth(a, key));
}

export const hasEverydayRecording = (key: string) => key in recordings;
