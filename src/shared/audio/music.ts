import { audioContext, sfx } from './sfx';
import { narrator } from './narrator';
import { haptic } from '../haptics';

/**
 * Songs and background music from src/music/ (made with Suno; names and what
 * each is for are in src/music/README.md). Only the files that are there are
 * used: without them everything works as before (music made in code, the
 * fanfare sound, quiet menus).
 *
 *   setBed('bg-home')        background music for where she is (one at a time, looped
 *                            with a crossfade, quieter while the narrator talks)
 *   playLoop('calm-stars')   any track looped until stopped (the calm corner)
 *   playSong('song-count')   a song from start to end (background music waits)
 *   fanfare()                the level-done jingle (or the fanfare sound without one)
 *
 * Tracks are fetched whole and played through Web Audio, so they can start without a
 * tap (iPhones), loop without a gap, and the offline cache keeps a copy once played.
 */

const files = import.meta.glob('../../music/*.{mp3,m4a,ogg,wav}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const urls: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) {
  urls[(path.split('/').pop() ?? '').replace(/\.[^.]+$/, '').toLowerCase()] = url;
}

/** Is this track in src/music? */
export const hasTrack = (name: string) => name in urls;
/** Every track in src/music */
export const trackNames = () => Object.keys(urls).sort();

// ---------------------------------------------------------------------------
// Loading (a few decoded tracks are kept; long songs are big once decoded)
// ---------------------------------------------------------------------------
const loading = new Map<string, Promise<AudioBuffer | null>>();
const decoded = new Map<string, AudioBuffer>();
const KEEP = 3;

function load(name: string): Promise<AudioBuffer | null> {
  const ctx = audioContext();
  if (!ctx || !urls[name]) return Promise.resolve(null);
  const ready = decoded.get(name);
  if (ready) {
    // Most recently used goes to the end
    decoded.delete(name);
    decoded.set(name, ready);
    return Promise.resolve(ready);
  }
  let p = loading.get(name);
  if (!p) {
    p = fetch(urls[name])
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.arrayBuffer();
      })
      .then((bytes) => ctx.decodeAudioData(bytes))
      .then((buffer) => {
        decoded.set(name, buffer);
        while (decoded.size > KEEP) decoded.delete(decoded.keys().next().value as string);
        return buffer;
      })
      .catch(() => null)
      .finally(() => loading.delete(name));
    loading.set(name, p);
  }
  return p;
}

// ---------------------------------------------------------------------------
// Output: one master volume (silent while the app is hidden), quieter while the narrator talks
// ---------------------------------------------------------------------------
let master: GainNode | null = null;
function output() {
  const ctx = audioContext();
  if (!ctx) return null;
  if (!master) {
    master = ctx.createGain();
    master.connect(ctx.destination);
    document.addEventListener('visibilitychange', () => {
      master?.gain.setTargetAtTime(document.visibilityState === 'visible' ? 1 : 0, ctx.currentTime, 0.15);
    });
  }
  return { ctx, master };
}

let speaking = false;
/** Everything looping now (background music, the calm corner's music) */
const loops = new Set<{ update: () => void }>();
const updateLoops = () => loops.forEach((l) => l.update());
narrator.onSpeaking((on) => {
  speaking = on;
  updateLoops();
  song?.update();
});

// ---------------------------------------------------------------------------
// Loops: a track over and over (crossfading from its end to its start)
// ---------------------------------------------------------------------------
export interface LoopHandle {
  /** New volume (0–1), and the volume while the narrator talks */
  setLevel: (level: number, duck?: number) => void;
  stop: (fade?: number) => void;
}

/** Where each looped track was, so coming back carries on instead of starting over */
const resumeAt = new Map<string, number>();
const XF = 4;

/**
 * Loop a track until stopped: quieter while the narrator talks, silent while a song
 * plays. Returns null when the track isn't in src/music; `onFail` if it can't be
 * loaded (offline and never played before).
 */
export function playLoop(name: string, opts: { level?: number; duck?: number; onFail?: () => void } = {}): LoopHandle | null {
  if (!urls[name]) return null;
  let level = opts.level ?? 0.3;
  let duck = opts.duck ?? level * 0.35;
  let stopped = false;
  let running: { update: () => void; stop: (fade: number) => void } | null = null;
  void load(name).then((buffer) => {
    if (stopped) return;
    if (!buffer) {
      opts.onFail?.();
      return;
    }
    running = startLoop(name, buffer, () => (speaking ? duck : level));
  });
  return {
    setLevel(l, d) {
      level = l;
      duck = d ?? l * 0.35;
      running?.update();
    },
    stop(fade = 1.2) {
      stopped = true;
      running?.stop(fade);
    },
  };
}

function startLoop(name: string, buffer: AudioBuffer, volume: () => number) {
  const { ctx, master: out } = output()!;
  const gain = ctx.createGain();
  gain.gain.value = 0.0001;
  gain.connect(out);
  const xf = Math.min(XF, buffer.duration / 4);
  let alive = true;
  let timer = 0;
  let current: { when: number; from: number } | null = null;
  const parts: AudioBufferSourceNode[] = [];

  const startPart = (when: number, from: number, fadeIn: boolean) => {
    if (buffer.duration - from < xf * 2) from = 0;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const g = ctx.createGain();
    src.connect(g).connect(gain);
    g.gain.setValueAtTime(fadeIn ? 0.0001 : 1, when);
    if (fadeIn) g.gain.linearRampToValueAtTime(1, when + xf);
    src.start(when, from);
    parts.push(src);
    src.onended = () => {
      parts.splice(parts.indexOf(src), 1);
      g.disconnect();
    };
    current = { when, from };
    const next = when + buffer.duration - from - xf;
    timer = window.setTimeout(
      () => {
        if (!alive) return;
        const at = Math.max(ctx.currentTime + 0.05, next);
        g.gain.setValueAtTime(1, at);
        g.gain.linearRampToValueAtTime(0.0001, at + xf);
        startPart(at, 0, true);
      },
      Math.max(0, (next - ctx.currentTime - 0.5) * 1000),
    );
  };
  startPart(ctx.currentTime + 0.05, resumeAt.get(name) ?? 0, false);

  const target = () => Math.max(0.0001, song ? 0 : volume());
  const loop = {
    update() {
      if (alive) gain.gain.setTargetAtTime(target(), ctx.currentTime, speaking ? 0.12 : 0.5);
    },
    stop(fade: number) {
      if (!alive) return;
      alive = false;
      loops.delete(loop);
      window.clearTimeout(timer);
      if (current) resumeAt.set(name, (current.from + Math.max(0, ctx.currentTime - current.when)) % buffer.duration);
      const t = ctx.currentTime;
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), t);
      gain.gain.linearRampToValueAtTime(0.0001, t + fade);
      window.setTimeout(() => {
        parts.forEach((s) => {
          try {
            s.stop();
          } catch {
            /* already stopped */
          }
        });
        gain.disconnect();
      }, fade * 1000 + 100);
    },
  };
  loops.add(loop);
  gain.gain.setTargetAtTime(target(), ctx.currentTime, 0.6);
  return loop;
}

// ---------------------------------------------------------------------------
// Background music ("bed"): one at a time, for where she is
// ---------------------------------------------------------------------------
const BED_LEVEL = 0.3;
let bed: { name: string; handle: LoopHandle | null } | null = null;
let backgroundOn = true;

/** Grown-ups' setting: background music on menus and in some games */
export function setBackgroundMusic(on: boolean) {
  backgroundOn = on;
  if (!on) setBed(null);
}

/** The background music for where she is now (null: none). Safe to call often. */
export function setBed(name: string | null) {
  if (name && (!urls[name] || !backgroundOn)) name = null;
  if ((bed?.name ?? null) === name) return;
  bed?.handle?.stop(1.2);
  bed = name ? { name, handle: playLoop(name, { level: BED_LEVEL }) } : null;
}

// ---------------------------------------------------------------------------
// Songs: start to end, background music waits
// ---------------------------------------------------------------------------
interface Playing {
  name: string;
  update: () => void;
  stop: (fade?: number) => void;
}

let song: Playing | null = null;

export interface SongHandle {
  stop: () => void;
}

/**
 * Play a song once. `onEnd` when it finishes (not when stopped). Returns null when
 * the song isn't in src/music. Background music fades out while it plays.
 */
export function playSong(name: string, opts: { level?: number; duck?: number; onEnd?: () => void; onStart?: () => void } = {}): SongHandle | null {
  if (!urls[name]) return null;
  song?.stop();
  let stopped = false;
  let playing: Playing | null = null;
  void load(name).then((buffer) => {
    if (stopped || !buffer) return;
    const { ctx, master: out } = output()!;
    const level = opts.level ?? 0.9;
    const duck = opts.duck ?? level;
    const gain = ctx.createGain();
    gain.gain.value = speaking ? duck : level;
    gain.connect(out);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(gain);
    src.start();
    let alive = true;
    playing = {
      name,
      update: () => alive && gain.gain.setTargetAtTime(speaking ? duck : level, ctx.currentTime, 0.15),
      stop(fade = 0.6) {
        if (!alive) return;
        alive = false;
        const t = ctx.currentTime;
        gain.gain.cancelScheduledValues(t);
        gain.gain.setValueAtTime(gain.gain.value, t);
        gain.gain.linearRampToValueAtTime(0.0001, t + fade);
        window.setTimeout(() => {
          try {
            src.stop();
          } catch {
            /* already stopped */
          }
          gain.disconnect();
        }, fade * 1000 + 100);
        if (song === playing) {
          song = null;
          updateLoops();
        }
      },
    };
    src.onended = () => {
      if (!alive) return;
      alive = false;
      gain.disconnect();
      if (song === playing) {
        song = null;
        updateLoops();
      }
      opts.onEnd?.();
    };
    song = playing;
    updateLoops();
    opts.onStart?.();
  });
  return {
    stop() {
      stopped = true;
      playing?.stop();
    },
  };
}

/** Stop whatever song is playing */
export function stopSong() {
  song?.stop();
}

// ---------------------------------------------------------------------------
// The big "well done" moment
// ---------------------------------------------------------------------------
let lastFanfare = 0;

/** A level or picture finished: the jingle from src/music if there is one, else the fanfare sound */
export function fanfare() {
  const jingle = 'jingle-win';
  if (!urls[jingle]) {
    sfx.fanfare();
    return;
  }
  // Two finishes at once (the picture and the level): one jingle
  if (Date.now() - lastFanfare < 4000) return;
  lastFanfare = Date.now();
  if (decoded.has(jingle)) {
    haptic('big-win');
    playSong(jingle, { level: 0.75, duck: 0.4 });
  } else {
    // Not loaded yet (the first time): the fanfare sound now, the jingle next time
    sfx.fanfare();
    void load(jingle);
  }
}

/** Get the jingle ready (call once sound is allowed) */
export function preloadMusic() {
  if (urls['jingle-win']) void load('jingle-win');
}
