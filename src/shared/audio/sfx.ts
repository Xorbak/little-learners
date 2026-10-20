/**
 * Little sound effects made in code, so there are no sound files to manage.
 * Browsers only allow sound after the first tap, which the start screen provides.
 */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, duration: number, type: OscillatorType, volume = 0.2) {
  const a = audio();
  if (!a) return;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, a.currentTime + start);
  gain.gain.setValueAtTime(volume, a.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(0.001, a.currentTime + start + duration);
  osc.connect(gain).connect(a.destination);
  osc.start(a.currentTime + start);
  osc.stop(a.currentTime + start + duration);
}

/** A burst of filtered noise (the building block for thuds, snaps and whooshes) */
function noise(opts: { length: number; type: BiquadFilterType; freq: number; freqEnd?: number; q?: number; volume: number; decay?: number; at?: number }) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + (opts.at ?? 0);
  const length = Math.floor(a.sampleRate * opts.length);
  const buffer = a.createBuffer(1, length, a.sampleRate);
  const data = buffer.getChannelData(0);
  const decay = opts.decay ?? 2;
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay;
  const source = a.createBufferSource();
  const filter = a.createBiquadFilter();
  filter.type = opts.type;
  filter.frequency.setValueAtTime(opts.freq, t);
  if (opts.freqEnd) filter.frequency.exponentialRampToValueAtTime(opts.freqEnd, t + opts.length);
  filter.Q.value = opts.q ?? 1;
  const gain = a.createGain();
  gain.gain.value = opts.volume;
  source.buffer = buffer;
  source.connect(filter).connect(gain).connect(a.destination);
  source.start(t);
}

/** A pitch sweep (sine unless told otherwise) */
function sweep(from: number, to: number, length: number, volume: number, type: OscillatorType = 'sine', at = 0) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + at;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(to, t + length);
  gain.gain.setValueAtTime(0.001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, t + length);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + length + 0.02);
}

export const sfx = {
  /** Call from the first tap to allow sound */
  unlock() {
    audio();
  },

  pop() {
    const a = audio();
    if (!a) return;
    const length = Math.floor(a.sampleRate * 0.12);
    const buffer = a.createBuffer(1, length, a.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3;
    const source = a.createBufferSource();
    const filter = a.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2500;
    const gain = a.createGain();
    gain.gain.value = 0.6;
    source.buffer = buffer;
    source.connect(filter).connect(gain).connect(a.destination);
    source.start();
  },

  /** Gentle, friendly "boing" for a wrong tap: never harsh */
  boing() {
    const a = audio();
    if (!a) return;
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, a.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, a.currentTime + 0.25);
    gain.gain.setValueAtTime(0.18, a.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.3);
    osc.connect(gain).connect(a.destination);
    osc.start();
    osc.stop(a.currentTime + 0.3);
  },

  /**
   * A silly raspberry. 'pfft' is short and soft (a mismatch), 'squeak' is a high
   * little toot, 'big' is the long trumpeting one for the stinky pair.
   */
  fart(kind: 'pfft' | 'squeak' | 'big' = 'pfft') {
    const a = audio();
    if (!a) return;
    const t = a.currentTime;
    const shape = {
      pfft: { length: 0.45, start: 150, end: 85, flutter: 28, volume: 0.35 },
      squeak: { length: 0.35, start: 330, end: 230, flutter: 40, volume: 0.22 },
      big: { length: 1.4, start: 120, end: 70, flutter: 22, volume: 0.4 },
    }[kind];
    const end = t + shape.length;

    // The buzzy "brrr": a low sawtooth whose pitch flutters quickly
    const osc = a.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(shape.start, t);
    if (kind === 'big') {
      // Wobbly trumpet: up, down, up, then fade off
      osc.frequency.linearRampToValueAtTime(shape.start * 1.3, t + 0.35);
      osc.frequency.linearRampToValueAtTime(shape.start * 0.85, t + 0.7);
      osc.frequency.linearRampToValueAtTime(shape.start * 1.15, t + 1.0);
    }
    osc.frequency.exponentialRampToValueAtTime(shape.end, end);

    const flutter = a.createOscillator();
    const flutterDepth = a.createGain();
    flutter.frequency.setValueAtTime(shape.flutter, t);
    flutter.frequency.linearRampToValueAtTime(shape.flutter * 0.6, end);
    flutterDepth.gain.value = shape.start * 0.35;
    flutter.connect(flutterDepth).connect(osc.frequency);

    // Soften it so it sounds squishy rather than electronic
    const filter = a.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(kind === 'squeak' ? 1400 : 700, t);
    filter.Q.value = 4;

    const gain = a.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(shape.volume, t + 0.03);
    gain.gain.setValueAtTime(shape.volume, end - shape.length * 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, end);

    osc.connect(filter).connect(gain).connect(a.destination);
    osc.start(t);
    flutter.start(t);
    osc.stop(end);
    flutter.stop(end);

    // A breathy puff at the start: the "pf" of "pfft"
    const puffLength = Math.floor(a.sampleRate * 0.12);
    const buffer = a.createBuffer(1, puffLength, a.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < puffLength; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / puffLength) ** 2;
    const puff = a.createBufferSource();
    const puffFilter = a.createBiquadFilter();
    puffFilter.type = 'bandpass';
    puffFilter.frequency.value = 900;
    const puffGain = a.createGain();
    puffGain.gain.value = shape.volume * 0.5;
    puff.buffer = buffer;
    puff.connect(puffFilter).connect(puffGain).connect(a.destination);
    puff.start(t);
  },

  /** Crunchy nom: two quick bites */
  munch() {
    const a = audio();
    if (!a) return;
    [0, 0.16].forEach((start) => {
      const length = Math.floor(a.sampleRate * 0.09);
      const buffer = a.createBuffer(1, length, a.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 1.5;
      const source = a.createBufferSource();
      const filter = a.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1600 + Math.random() * 600;
      filter.Q.value = 1.2;
      const gain = a.createGain();
      gain.gain.value = 0.5;
      source.buffer = buffer;
      source.connect(filter).connect(gain).connect(a.destination);
      source.start(a.currentTime + start);
    });
  },

  /** A big silly burp */
  burp() {
    const a = audio();
    if (!a) return;
    const t = a.currentTime;
    const osc = a.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(95, t);
    osc.frequency.linearRampToValueAtTime(75, t + 0.3);
    osc.frequency.linearRampToValueAtTime(60, t + 0.7);
    const flutter = a.createOscillator();
    const depth = a.createGain();
    flutter.frequency.value = 14;
    depth.gain.value = 18;
    flutter.connect(depth).connect(osc.frequency);
    // A vowel-ish "uurp"
    const formant = a.createBiquadFilter();
    formant.type = 'bandpass';
    formant.frequency.setValueAtTime(500, t);
    formant.frequency.linearRampToValueAtTime(350, t + 0.7);
    formant.Q.value = 3;
    const gain = a.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(0.9, t + 0.05);
    gain.gain.setValueAtTime(0.9, t + 0.45);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);
    osc.connect(formant).connect(gain).connect(a.destination);
    osc.start(t);
    flutter.start(t);
    osc.stop(t + 0.75);
    flutter.stop(t + 0.75);
  },

  /** One "glug" of paint; the pitch rises as the bucket fills, like filling a bottle */
  glug(level = 0) {
    const a = audio();
    if (!a) return;
    const t = a.currentTime;
    const base = 180 + level * 260;
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(base, t);
    osc.frequency.exponentialRampToValueAtTime(base * 1.8, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(base * 0.9, t + 0.16);
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(gain).connect(a.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  },

  /** A wet splash */
  splash() {
    const a = audio();
    if (!a) return;
    const length = Math.floor(a.sampleRate * 0.7);
    const buffer = a.createBuffer(1, length, a.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp((-5 * i) / length);
    const source = a.createBufferSource();
    const filter = a.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, a.currentTime);
    filter.frequency.exponentialRampToValueAtTime(400, a.currentTime + 0.7);
    const gain = a.createGain();
    gain.gain.value = 0.55;
    source.buffer = buffer;
    source.connect(filter).connect(gain).connect(a.destination);
    source.start();
  },

  /** A bright xylophone note. `step` counts notes up the scale from middle C (0 = C4). */
  note(step: number, length = 0.9) {
    const a = audio();
    if (!a) return;
    const scale = [0, 2, 4, 5, 7, 9, 11];
    const semis = 12 * Math.floor(step / 7) + scale[((step % 7) + 7) % 7];
    const f = 261.63 * 2 ** (semis / 12);
    const t = a.currentTime;
    [1, 4].forEach((h, i) => {
      const osc = a.createOscillator();
      const gain = a.createGain();
      osc.type = i === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(f * h, t);
      gain.gain.setValueAtTime(i === 0 ? 0.32 : 0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (i === 0 ? length : 0.25));
      osc.connect(gain).connect(a.destination);
      osc.start(t);
      osc.stop(t + length);
    });
  },

  /** Card turning over */
  flip() {
    const a = audio();
    if (!a) return;
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, a.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, a.currentTime + 0.08);
    gain.gain.setValueAtTime(0.12, a.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.12);
    osc.connect(gain).connect(a.destination);
    osc.start();
    osc.stop(a.currentTime + 0.12);
  },

  /** Cardboard "thunk": a puzzle piece dropping into place */
  thunk() {
    sweep(150, 55, 0.14, 0.5);
    noise({ length: 0.08, type: 'lowpass', freq: 900, volume: 0.5, decay: 3 });
  },

  /** Rubber snap: layered on top of a balloon pop */
  snap() {
    noise({ length: 0.05, type: 'highpass', freq: 2500, volume: 0.35, decay: 2 });
    sweep(1400, 260, 0.06, 0.12, 'triangle');
  },

  /** Soft whoosh of something moving fast */
  whoosh(up = true) {
    noise({ length: 0.28, type: 'bandpass', freq: up ? 400 : 1600, freqEnd: up ? 1800 : 350, q: 1.4, volume: 0.28, decay: 0.8 });
  },

  /** Little twinkle for sparkles and matches */
  sparkle() {
    [2093, 2637, 3136, 4186].forEach((f, i) => tone(f, i * 0.05, 0.18, 'triangle', 0.05));
  },

  /** A water drip / droplet blip */
  drip() {
    sweep(700, 1500, 0.07, 0.15);
  },

  /** A light tap (pressing tiles and buttons) */
  tap() {
    sweep(520, 300, 0.05, 0.08, 'triangle');
  },

  /** A soft landing thud (stickers slapping on, things landing) */
  thud() {
    sweep(110, 45, 0.18, 0.55);
    noise({ length: 0.06, type: 'lowpass', freq: 500, volume: 0.35, decay: 3 });
  },

  cheer() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.35, 'triangle', 0.15));
  },

  fanfare() {
    [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.4, 'triangle', 0.15));
  },
};
