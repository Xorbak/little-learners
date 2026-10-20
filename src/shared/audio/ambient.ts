/**
 * Calm music, made in code. Each calm theme has its own key, instrument and
 * background sound:
 *   stars      music box over soft chords (C)
 *   leaves     plucked guitar-ish notes and a soft wind (G)
 *   ocean      slow bells, deep chords, waves that swell as she breathes in (D)
 *   rain       soft electric piano and rain (F)
 *   fireflies  little marimba notes and crickets (A)
 * Notes come from a pentatonic scale, so nothing ever clashes. Chords change
 * once per breath. setBreath(0–1) lets sounds follow the breathing guide.
 */
import { audioContext } from './sfx';

export type AmbientTheme = 'stars' | 'leaves' | 'ocean' | 'rain' | 'fireflies';

interface ThemeSound {
  /** Pentatonic scale for the melody (MIDI notes) */
  scale: number[];
  /** Chords (MIDI notes), one per breath */
  chords: number[][];
  step: number;
  density: number;
  instrument: 'musicBox' | 'pluck' | 'bell' | 'epiano' | 'marimba';
  bed: 'none' | 'wind' | 'waves' | 'rain' | 'night';
  padLevel: number;
}

const pent = (root: number, octaves: number[]) => octaves.flatMap((o) => [0, 2, 4, 7, 9].map((i) => root + 12 * o + i));

const THEMES: Record<AmbientTheme, ThemeSound> = {
  stars: { scale: pent(72, [0, 1]), chords: [[48, 55, 64, 71], [45, 52, 60, 67], [41, 48, 57, 64], [43, 50, 59, 62]], step: 0.9, density: 0.55, instrument: 'musicBox', bed: 'none', padLevel: 0.05 },
  leaves: { scale: pent(67, [-1, 0]), chords: [[43, 50, 59, 62], [40, 47, 55, 59], [36, 43, 52, 55], [38, 45, 54, 57]], step: 0.75, density: 0.5, instrument: 'pluck', bed: 'wind', padLevel: 0.04 },
  ocean: { scale: pent(62, [0, 1]), chords: [[38, 45, 54, 57], [35, 42, 50, 54], [31, 38, 47, 50], [33, 40, 49, 52]], step: 1.4, density: 0.38, instrument: 'bell', bed: 'waves', padLevel: 0.055 },
  rain: { scale: pent(65, [0, 1]), chords: [[41, 48, 57, 64], [38, 45, 53, 60], [34, 41, 50, 57], [36, 43, 52, 55]], step: 1.1, density: 0.45, instrument: 'epiano', bed: 'rain', padLevel: 0.04 },
  fireflies: { scale: pent(69, [0, 1]), chords: [[45, 52, 61, 64], [42, 49, 57, 61], [38, 45, 54, 57], [40, 47, 56, 59]], step: 0.6, density: 0.38, instrument: 'marimba', bed: 'night', padLevel: 0.045 },
};

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

export interface Ambient {
  stop: () => void;
  setBreath: (v: number) => void;
  setMusic: (on: boolean) => void;
}

export function startAmbient(theme: AmbientTheme, breathSeconds: number): Ambient | null {
  const ctx = audioContext();
  if (!ctx) return null;
  const sound = THEMES[theme];
  const now = ctx.currentTime;
  const nodes: AudioScheduledSourceNode[] = [];

  // Output: gentle compressor, master fade-in, a big soft reverb
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -20;
  comp.ratio.value = 3;
  comp.connect(ctx.destination);
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(1, now + 3);
  master.connect(comp);
  const music = ctx.createGain();
  music.connect(master);
  const reverb = ctx.createConvolver();
  reverb.buffer = impulse(ctx, 3.8);
  const wet = ctx.createGain();
  wet.gain.value = 0.5;
  reverb.connect(wet).connect(music);
  const dry = ctx.createGain();
  dry.gain.value = 0.65;
  dry.connect(music);
  const out = (node: AudioNode) => {
    node.connect(dry);
    node.connect(reverb);
  };

  // ---- Instruments ----
  const env = (t: number, peak: number, attack: number, decay: number) => {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    return g;
  };
  const osc = (type: OscillatorType, f: number, t: number, stop: number, dest: AudioNode, detune = 0) => {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = f;
    o.detune.value = detune;
    o.connect(dest);
    o.start(t);
    o.stop(stop);
    return o;
  };

  const play = (midi: number, t: number) => {
    const f = hz(midi);
    switch (sound.instrument) {
      case 'musicBox': {
        const g1 = env(t, 0.09, 0.005, 2.6);
        out(g1);
        osc('sine', f, t, t + 2.7, g1);
        const g2 = env(t, 0.025, 0.005, 1.1);
        out(g2);
        osc('sine', f * 2, t, t + 1.2, g2);
        const g3 = env(t, 0.012, 0.003, 0.5);
        out(g3);
        osc('sine', f * 3.01, t, t + 0.6, g3);
        break;
      }
      case 'pluck': {
        const g = env(t, 0.1, 0.004, 1.8);
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(2600, t);
        lp.frequency.exponentialRampToValueAtTime(450, t + 0.7);
        lp.connect(g);
        out(g);
        osc('triangle', f, t, t + 1.9, lp);
        osc('sawtooth', f, t, t + 1.9, lp, 4);
        break;
      }
      case 'bell': {
        const g1 = env(t, 0.07, 0.02, 4);
        out(g1);
        osc('sine', f, t, t + 4.1, g1);
        const g2 = env(t, 0.018, 0.02, 2.2);
        out(g2);
        osc('sine', f * 2.76, t, t + 2.3, g2);
        break;
      }
      case 'epiano': {
        const g = env(t, 0.08, 0.008, 3);
        out(g);
        const carrier = osc('sine', f, t, t + 3.1, g);
        const mod = ctx.createOscillator();
        mod.frequency.value = f;
        const index = ctx.createGain();
        index.gain.setValueAtTime(f * 1.4, t);
        index.gain.exponentialRampToValueAtTime(f * 0.05, t + 1.2);
        mod.connect(index).connect(carrier.frequency);
        mod.start(t);
        mod.stop(t + 3.1);
        break;
      }
      case 'marimba': {
        const g1 = env(t, 0.09, 0.003, 0.9);
        out(g1);
        osc('sine', f, t, t + 1, g1);
        const g2 = env(t, 0.03, 0.002, 0.18);
        out(g2);
        osc('sine', f * 4, t, t + 0.25, g2);
        break;
      }
    }
  };

  // ---- Soft chords, one per breath ----
  const padFilter = ctx.createBiquadFilter();
  padFilter.type = 'lowpass';
  padFilter.frequency.value = 900;
  padFilter.Q.value = 0.4;
  out(padFilter);
  const chordAt = (chord: number[], t: number, len: number) => {
    for (const n of chord) {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(sound.padLevel, t + 2.5);
      g.gain.setValueAtTime(sound.padLevel, t + len - 0.5);
      g.gain.exponentialRampToValueAtTime(0.0001, t + len + 3);
      g.connect(padFilter);
      osc('triangle', hz(n), t, t + len + 3.1, g, -5);
      osc('sine', hz(n), t, t + len + 3.1, g, 6);
    }
  };

  // ---- Background sound ----
  let bedGain: GainNode | null = null;
  let bedFilter: BiquadFilterNode | null = null;
  if (sound.bed !== 'none') {
    const src = ctx.createBufferSource();
    src.buffer = noise(ctx, 4, sound.bed === 'waves' || sound.bed === 'wind' ? 'brown' : 'pink');
    src.loop = true;
    bedFilter = ctx.createBiquadFilter();
    bedGain = ctx.createGain();
    if (sound.bed === 'waves') {
      bedFilter.type = 'lowpass';
      bedFilter.frequency.value = 600;
      bedGain.gain.value = 0.08;
    } else if (sound.bed === 'wind') {
      bedFilter.type = 'bandpass';
      bedFilter.frequency.value = 500;
      bedFilter.Q.value = 0.8;
      bedGain.gain.value = 0.05;
    } else if (sound.bed === 'rain') {
      bedFilter.type = 'highpass';
      bedFilter.frequency.value = 1100;
      bedGain.gain.value = 0.09;
    } else {
      bedFilter.type = 'bandpass';
      bedFilter.frequency.value = 2500;
      bedFilter.Q.value = 0.5;
      bedGain.gain.value = 0.012;
    }
    src.connect(bedFilter).connect(bedGain).connect(master);
    src.start(now);
    nodes.push(src);
  }

  // Little extras: raindrops plinking, crickets chirping
  const extra = (t: number) => {
    if (sound.bed === 'rain' && Math.random() < 0.5) {
      const g = env(t, 0.03, 0.002, 0.08);
      g.connect(master);
      const o = osc('sine', 1800 + Math.random() * 1600, t, t + 0.1, g);
      o.frequency.exponentialRampToValueAtTime(900, t + 0.08);
    }
    if (sound.bed === 'night' && Math.random() < 0.18) {
      const f = 4300 + Math.random() * 300;
      for (let i = 0; i < 3; i++) {
        const g = env(t + i * 0.07, 0.012, 0.005, 0.04);
        g.connect(master);
        osc('sine', f, t + i * 0.07, t + i * 0.07 + 0.06, g);
      }
    }
  };

  // ---- Scheduler ----
  let next = now + 0.8;
  let chordNext = now + 0.2;
  let chordIndex = 0;
  let degree = Math.floor(sound.scale.length / 2);
  let extraNext = now + 0.5;
  const timer = window.setInterval(() => {
    const ahead = ctx.currentTime + 0.6;
    while (chordNext < ahead) {
      chordAt(sound.chords[chordIndex % sound.chords.length], chordNext, breathSeconds);
      chordIndex++;
      chordNext += breathSeconds;
    }
    while (next < ahead) {
      if (Math.random() < sound.density) {
        degree = Math.max(0, Math.min(sound.scale.length - 1, degree + [-2, -1, -1, 1, 1, 2, 0][Math.floor(Math.random() * 7)]));
        play(sound.scale[degree], next + Math.random() * 0.04);
      }
      next += sound.step * (Math.random() < 0.2 ? 2 : 1);
    }
    while (extraNext < ahead) {
      extra(extraNext);
      extraNext += 0.25 + Math.random() * 0.3;
    }
  }, 200);

  let musicOn = true;
  return {
    setBreath(v: number) {
      if (!bedGain) return;
      const t = ctx.currentTime;
      // Waves and wind swell as she breathes in
      if (sound.bed === 'waves') bedGain.gain.setTargetAtTime(0.03 + 0.13 * v, t, 0.25);
      if (sound.bed === 'wind') {
        bedGain.gain.setTargetAtTime(0.025 + 0.05 * v, t, 0.3);
        bedFilter?.frequency.setTargetAtTime(350 + 450 * v, t, 0.3);
      }
    },
    setMusic(on: boolean) {
      musicOn = on;
      music.gain.setTargetAtTime(musicOn ? 1 : 0.0001, ctx.currentTime, 0.4);
    },
    stop() {
      window.clearInterval(timer);
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
      window.setTimeout(() => {
        nodes.forEach((n) => {
          try {
            n.stop();
          } catch {
            /* already stopped */
          }
        });
        master.disconnect();
        comp.disconnect();
      }, 1400);
    },
  };
}

/** A soft, long reverb tail */
function impulse(ctx: AudioContext, seconds: number) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
  }
  return buf;
}

/** Pink-ish or brown-ish noise for background sounds */
function noise(ctx: AudioContext, seconds: number, colour: 'pink' | 'brown') {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    if (colour === 'brown') {
      last = (last + 0.02 * white) / 1.02;
      d[i] = last * 3.5;
    } else {
      b0 = 0.99765 * b0 + white * 0.099046;
      b1 = 0.963 * b1 + white * 0.2965164;
      b2 = 0.57 * b2 + white * 1.0526913;
      d[i] = (b0 + b1 + b2 + white * 0.1848) * 0.12;
    }
  }
  // Fade the loop's ends together so it doesn't click
  const fade = Math.floor(ctx.sampleRate * 0.05);
  for (let i = 0; i < fade; i++) {
    const k = i / fade;
    d[i] *= k;
    d[len - 1 - i] *= k;
  }
  return buf;
}
