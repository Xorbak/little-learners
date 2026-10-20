/**
 * Play-time limits. Grown-ups choose how long a session lasts, how often she
 * stops for an exercise break, and how long she rests before playing again.
 *
 * Only active play counts (the app open and on screen, not the start screen or
 * the grown-ups area, and not the breaks themselves). The clock is saved in its
 * own storage key, so closing and reopening the app doesn't reset it; a long
 * gap (longer than the rest time) starts a fresh session.
 */
import { progress } from './progress/store';

export const PLAY_DEFAULTS = { sessionMin: 20, breakEveryMin: 10, restMin: 60 };
/** restMin value meaning "until tomorrow" */
export const UNTIL_TOMORROW = -1;

export interface PlaySettings {
  /** 0 = no limit */
  sessionMin: number;
  /** 0 = no exercise breaks */
  breakEveryMin: number;
  /** minutes, or UNTIL_TOMORROW */
  restMin: number;
  exercisesOff: string[];
}

interface Clock {
  used: number;
  sinceBreak: number;
  lastActive: number;
  lockedUntil?: number;
  warned?: boolean;
  lastExercises?: string[];
}

export type PlayState = 'ok' | 'soon' | 'break' | 'stop' | 'locked';

const KEY = 'little-learners-clock';
const MIN = 60000;

function fresh(): Clock {
  return { used: 0, sinceBreak: 0, lastActive: Date.now() };
}

function load(): Clock {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...fresh(), ...(JSON.parse(raw) as Clock) } : fresh();
  } catch {
    return fresh();
  }
}

let clock = load();
let lastSave = 0;
function save(now = false) {
  if (!now && Date.now() - lastSave < 5000) return;
  lastSave = Date.now();
  try {
    localStorage.setItem(KEY, JSON.stringify(clock));
  } catch {
    /* storage blocked: limits still work until the app is closed */
  }
}

const listeners = new Set<() => void>();
const changed = () => listeners.forEach((l) => l());

/** Tomorrow at 6 in the morning, local time */
function tomorrowMorning() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(6, 0, 0, 0);
  return d.getTime();
}

export const playClock = {
  settings(): PlaySettings {
    const p = progress.playTime();
    return {
      sessionMin: p.sessionMin ?? PLAY_DEFAULTS.sessionMin,
      breakEveryMin: p.breakEveryMin ?? PLAY_DEFAULTS.breakEveryMin,
      restMin: p.restMin ?? PLAY_DEFAULTS.restMin,
      exercisesOff: p.exercisesOff ?? [],
    };
  },

  /** Count some active play time */
  tick(ms: number) {
    const now = Date.now();
    if (clock.lockedUntil && now >= clock.lockedUntil) {
      clock = fresh();
      save(true);
      changed();
    }
    if (clock.lockedUntil) return;
    // Away for longer than the rest time (or half an hour): a new session
    const { restMin } = this.settings();
    const gap = Math.max(30, restMin === UNTIL_TOMORROW ? 8 * 60 : restMin) * MIN;
    if (now - clock.lastActive > gap) clock = { ...fresh(), lastExercises: clock.lastExercises };
    clock.used += ms;
    clock.sinceBreak += ms;
    clock.lastActive = now;
    save();
  },

  state(): PlayState {
    const now = Date.now();
    if (clock.lockedUntil && now < clock.lockedUntil) return 'locked';
    const { sessionMin, breakEveryMin } = this.settings();
    const left = sessionMin > 0 ? sessionMin * MIN - clock.used : Infinity;
    if (left <= 0) return 'stop';
    // No exercise break in the last minute before the end
    if (breakEveryMin > 0 && clock.sinceBreak >= breakEveryMin * MIN && left > MIN) return 'break';
    if (left <= 2 * MIN && !clock.warned) return 'soon';
    return 'ok';
  },

  markWarned() {
    clock.warned = true;
    save(true);
  },

  breakDone(exercises?: string[]) {
    clock.sinceBreak = 0;
    if (exercises) clock.lastExercises = exercises;
    save(true);
    changed();
  },

  lastExercises(): string[] {
    return clock.lastExercises ?? [];
  },

  /** Time's up: rest before playing again */
  lock() {
    const { restMin } = this.settings();
    clock.lockedUntil = restMin === UNTIL_TOMORROW ? tomorrowMorning() : Date.now() + restMin * MIN;
    save(true);
    changed();
  },

  lockedUntil(): number | undefined {
    return clock.lockedUntil && clock.lockedUntil > Date.now() ? clock.lockedUntil : undefined;
  },

  /** Grown-ups: a few more minutes, or a whole new session */
  unlock(extraMin?: number) {
    const { sessionMin } = this.settings();
    if (extraMin && sessionMin > 0) {
      clock = { ...clock, lockedUntil: undefined, used: Math.max(0, sessionMin - extraMin) * MIN, warned: true };
    } else {
      clock = { ...fresh(), lastExercises: clock.lastExercises };
    }
    save(true);
    changed();
  },

  usedMin(): number {
    return Math.floor(clock.used / MIN);
  },

  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

// ---------------------------------------------------------------------------
// Safe points: moments when a break can start without cutting a game short
// (between rounds, or when she moves to another screen)
// ---------------------------------------------------------------------------
const safeListeners = new Set<() => void>();
export const safePoint = () => safeListeners.forEach((l) => l());
export const onSafePoint = (fn: () => void) => {
  safeListeners.add(fn);
  return () => safeListeners.delete(fn);
};
