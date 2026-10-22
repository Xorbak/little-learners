import { useSyncExternalStore } from 'react';

/**
 * Her drawings ("My art"), each with what she said about it (a short recording),
 * kept on this phone. The newest 24 are kept.
 */
export interface Artwork {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  /** The picture (JPEG data URL) */
  image: string;
  /** "Tell me about your picture" (audio data URL), if she recorded one */
  voice?: string;
}

export const ART_KEY = 'little-learners-art';
const KEEP = 24;

function load(): Artwork[] {
  try {
    return JSON.parse(localStorage.getItem(ART_KEY) ?? '[]') as Artwork[];
  } catch {
    return [];
  }
}

let works = load();
const listeners = new Set<() => void>();

function save(next: Artwork[]) {
  // If the phone is full, drop the oldest until it fits
  let list = next.slice(-KEEP);
  for (;;) {
    try {
      localStorage.setItem(ART_KEY, JSON.stringify(list));
      break;
    } catch {
      if (list.length <= 1) return;
      list = list.slice(1);
    }
  }
  works = list;
  listeners.forEach((l) => l());
}

export const art = {
  all: () => works,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  add(work: Omit<Artwork, 'id'>): string {
    const id = `a${Date.now().toString(36)}`;
    save([...works, { ...work, id }]);
    return id;
  },
  setVoice(id: string, voice: string) {
    save(works.map((w) => (w.id === id ? { ...w, voice } : w)));
  },
  remove(id: string) {
    save(works.filter((w) => w.id !== id));
  },
};

export function useArt(): Artwork[] {
  return useSyncExternalStore(art.subscribe, art.all);
}

export const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
