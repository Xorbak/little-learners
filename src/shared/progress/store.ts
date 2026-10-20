import { useSyncExternalStore } from 'react';
import type { VoiceSettings } from '../audio/narrator';

/**
 * Everything the app remembers, saved in the browser (localStorage).
 *
 * Bump SCHEMA_VERSION and add a step to `migrate` whenever the shape changes,
 * so her progress survives updates.
 */

const STORAGE_KEY = 'little-learners';
const SCHEMA_VERSION = 1;

export interface ItemStats {
  correct: number;
  wrong: number;
  lastSeen: number;
}

export interface GameProgress {
  /** Index of the level she plays next */
  currentLevel: number;
  /** Highest level index she has finished */
  bestCompleted: number;
  timesPlayed: number;
  /** Rounds played towards the current level in short sessions (Today's lessons) */
  roundsDone?: number;
}

export interface ChildProfile {
  id: string;
  name: string;
  /** keyed by "sectionId/gameId" */
  games: Record<string, GameProgress>;
  /** keyed by "sectionId/itemKey" */
  items: Record<string, ItemStats>;
  /** How she said she felt, newest last (kept to the last 60) */
  feelings?: { date: string; feeling: string }[];
  /** Stickers she has earned (emoji), in the order she got them */
  stickers?: string[];
  /** Why she got each sticker (the latest time she got it) */
  stickerWhy?: Record<string, StickerWhy>;
  /** Off-screen missions, by day (YYYY-MM-DD) */
  missions?: Record<string, { id: string; done?: boolean }>;
  /** Today's lessons: which steps are done, per day (kept for two weeks) */
  daily?: Record<string, { done: string[]; trophy?: boolean }>;
}

/** Everything a sticker can be. She collects new ones first; once she has them all, repeats are fine. */
export const STICKERS = [
  '🦄', '🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧',
  '🐤', '🦉', '🐝', '🦋', '🐞', '🐢', '🐙', '🐳', '🐬', '🐠', '🦕', '🦖', '🐲', '🌈', '⭐', '🌟',
  '🌸', '🌻', '🍓', '🍉', '🍩', '🍦', '🧁', '🍭', '🎈', '🎁', '🎀', '👑', '🚀', '🚂', '🚒', '🚁',
  '⚽', '🎨', '🎵', '🧸', '🪁', '🏰', '🌙', '☀️', '🍄', '🐳', '🦒', '🦓',
].filter((s, i, all) => all.indexOf(s) === i);
export const TROPHY = '🏆';

/** What she did to earn a sticker */
export interface StickerWhy {
  /** YYYY-MM-DD */
  date: string;
  /** The game she finished a level of */
  sectionId?: string;
  gameId?: string;
  /** All of Today's lessons (trophies) */
  today?: boolean;
  /** A mission done away from the screen */
  mission?: string;
}

export interface SavedData {
  version: number;
  activeProfileId: string;
  profiles: Record<string, ChildProfile>;
  voice: VoiceSettings;
  /** Farts and other silly noises. Missing means on (older saves don't have it). */
  sillySounds?: boolean;
  /** Less motion (no screen shake, fewer particles). Missing means: follow the device setting. */
  lessMotion?: boolean;
  /** Words under the pictures for grown-ups (missing = on) */
  showLabels?: boolean;
  /** Play-time limits chosen by grown-ups (missing values use the defaults in shared/playtime.ts) */
  playTime?: { sessionMin?: number; breakEveryMin?: number; restMin?: number; exercisesOff?: string[] };
}

/** Today's date as YYYY-MM-DD in local time */
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function fresh(): SavedData {
  return {
    version: SCHEMA_VERSION,
    activeProfileId: 'child-1',
    profiles: { 'child-1': { id: 'child-1', name: 'My little one', games: {}, items: {} } },
    voice: { rate: 0.85, pitch: 1.1 },
  };
}

function migrate(data: SavedData): SavedData {
  // Future: if (data.version === 1) { ...convert...; data.version = 2; }
  return data;
}

function load(): SavedData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fresh();
    return migrate(JSON.parse(raw) as SavedData);
  } catch {
    return fresh();
  }
}

let data = load();
const listeners = new Set<() => void>();

function commit(next: SavedData) {
  data = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or blocked (private browsing): keep playing, just don't save
  }
  listeners.forEach((l) => l());
}

function updateProfile(change: (p: ChildProfile) => ChildProfile) {
  const profile = data.profiles[data.activeProfileId];
  commit({ ...data, profiles: { ...data.profiles, [profile.id]: change(profile) } });
}

const emptyGame: GameProgress = { currentLevel: 0, bestCompleted: -1, timesPlayed: 0 };

export const progress = {
  get: () => data,

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  profile(): ChildProfile {
    return data.profiles[data.activeProfileId];
  },

  game(key: string): GameProgress {
    return this.profile().games[key] ?? emptyGame;
  },

  item(key: string): ItemStats | undefined {
    return this.profile().items[key];
  },

  recordAnswer(itemKey: string, wasCorrect: boolean) {
    updateProfile((p) => {
      const s = p.items[itemKey] ?? { correct: 0, wrong: 0, lastSeen: 0 };
      return {
        ...p,
        items: {
          ...p.items,
          [itemKey]: {
            correct: s.correct + (wasCorrect ? 1 : 0),
            wrong: s.wrong + (wasCorrect ? 0 : 1),
            lastSeen: Date.now(),
          },
        },
      };
    });
  },

  /** Returns true when finishing this level unlocked the next one */
  completeLevel(gameKey: string, levelIndex: number, levelCount: number): boolean {
    const g = this.game(gameKey);
    const unlocked = levelIndex === g.currentLevel && levelIndex + 1 < levelCount;
    updateProfile((p) => ({
      ...p,
      games: {
        ...p.games,
        [gameKey]: {
          currentLevel: unlocked ? levelIndex + 1 : g.currentLevel,
          bestCompleted: Math.max(g.bestCompleted, levelIndex),
          timesPlayed: g.timesPlayed + 1,
          roundsDone: 0,
        },
      },
    }));
    return unlocked;
  },

  /**
   * A short session (Today's lessons) played `rounds` rounds of a level.
   * When the rounds add up to the whole level, it counts as finishing it.
   */
  addRounds(gameKey: string, rounds: number, levelRounds: number, levelIndex: number, levelCount: number): { completed: boolean; unlocked: boolean } {
    const g = this.game(gameKey);
    const total = (g.roundsDone ?? 0) + rounds;
    if (total >= levelRounds) return { completed: true, unlocked: this.completeLevel(gameKey, levelIndex, levelCount) };
    updateProfile((p) => ({ ...p, games: { ...p.games, [gameKey]: { ...g, roundsDone: total } } }));
    return { completed: false, unlocked: false };
  },

  /** Gives her a sticker (a new one if there are any left) and returns it */
  stickerWhy(sticker: string): StickerWhy | undefined {
    return this.profile().stickerWhy?.[sticker];
  },

  awardSticker(sticker?: string, why?: Omit<StickerWhy, 'date'>): string {
    const have = new Set(this.profile().stickers ?? []);
    const fresh = STICKERS.filter((s) => !have.has(s));
    const pick = sticker ?? (fresh.length ? fresh : STICKERS)[Math.floor(Math.random() * (fresh.length || STICKERS.length))];
    updateProfile((p) => ({
      ...p,
      stickers: [...(p.stickers ?? []), pick],
      stickerWhy: { ...(p.stickerWhy ?? {}), [pick]: { date: today(), ...why } },
    }));
    return pick;
  },

  dailyDone(): string[] {
    return this.profile().daily?.[today()]?.done ?? [];
  },

  /** Marks a step of Today's lessons as done. Returns true the first time all `required` steps are done. */
  markDaily(stepId: string, required: string[]): boolean {
    const day = today();
    const entry = this.profile().daily?.[day] ?? { done: [] };
    const done = entry.done.includes(stepId) ? entry.done : [...entry.done, stepId];
    const allDone = required.every((r) => done.includes(r));
    const trophyNow = allDone && !entry.trophy;
    updateProfile((p) => {
      // Keep two weeks of history
      const keep = Object.fromEntries(Object.entries(p.daily ?? {}).sort(([a], [b]) => (a < b ? 1 : -1)).slice(0, 13));
      return { ...p, daily: { ...keep, [day]: { done, trophy: entry.trophy || allDone } } };
    });
    return trophyNow;
  },

  /** The mission for a day (set when Today's lessons are finished) */
  mission(day = today()): { id: string; done?: boolean } | undefined {
    return this.profile().missions?.[day];
  },

  /** The most recent mission not done yet (today or the day before) */
  openMission(): { day: string; id: string } | undefined {
    const all = Object.entries(this.profile().missions ?? {}).sort(([a], [b]) => (a < b ? 1 : -1));
    const [day, m] = all[0] ?? [];
    if (!day || !m || m.done) return undefined;
    const ageDays = (Date.parse(today()) - Date.parse(day)) / 86400000;
    return ageDays <= 1 ? { day, id: m.id } : undefined;
  },

  setMission(id: string) {
    const day = today();
    if (this.profile().missions?.[day]) return;
    updateProfile((p) => {
      const keep = Object.fromEntries(Object.entries(p.missions ?? {}).sort(([a], [b]) => (a < b ? 1 : -1)).slice(0, 13));
      return { ...p, missions: { ...keep, [day]: { id } } };
    });
  },

  /** A grown-up ticked the mission off */
  missionDone(day: string) {
    updateProfile((p) => {
      const m = p.missions?.[day];
      return m ? { ...p, missions: { ...p.missions, [day]: { ...m, done: true } } } : p;
    });
  },

  setName(name: string) {
    updateProfile((p) => ({ ...p, name }));
  },

  /** Parent area: choose which level a game starts on */
  setLevel(gameKey: string, levelIndex: number) {
    const g = this.game(gameKey);
    updateProfile((p) => ({ ...p, games: { ...p.games, [gameKey]: { ...g, currentLevel: levelIndex } } }));
  },

  setVoice(voice: SavedData['voice']) {
    commit({ ...data, voice });
  },

  sillySounds(): boolean {
    return data.sillySounds !== false;
  },

  setSillySounds(on: boolean) {
    commit({ ...data, sillySounds: on });
  },

  showLabels(): boolean {
    return data.showLabels !== false;
  },

  setShowLabels(on: boolean) {
    commit({ ...data, showLabels: on });
  },

  playTime(): NonNullable<SavedData['playTime']> {
    return data.playTime ?? {};
  },

  setPlayTime(change: Partial<NonNullable<SavedData['playTime']>>) {
    commit({ ...data, playTime: { ...data.playTime, ...change } });
  },

  /** undefined = not chosen (follow the device's reduce-motion setting) */
  lessMotion(): boolean | undefined {
    return data.lessMotion;
  },

  setLessMotion(on: boolean) {
    commit({ ...data, lessMotion: on });
  },

  logFeeling(feeling: string) {
    updateProfile((p) => ({ ...p, feelings: [...(p.feelings ?? []), { date: today(), feeling }].slice(-60) }));
  },

  resetProfile() {
    updateProfile((p) => ({ ...p, games: {}, items: {} }));
  },
};

/** React hook: re-renders when saved data changes */
export function useProgress(): SavedData {
  return useSyncExternalStore(progress.subscribe, progress.get);
}
