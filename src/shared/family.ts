import { useSyncExternalStore } from 'react';

/**
 * Family photos, added by a grown-up in the grown-ups area ("Mama", "Gogo"…),
 * for the My Family game. Kept on this phone only (small pictures, in the browser).
 */
export interface FamilyMember {
  id: string;
  /** What she calls them: "Mama", "Gogo", "Uncle Sam" */
  name: string;
  /** A small square photo (data URL) */
  photo: string;
}

export const FAMILY_KEY = 'little-learners-family';

function load(): FamilyMember[] {
  try {
    const raw = localStorage.getItem(FAMILY_KEY);
    return raw ? (JSON.parse(raw) as FamilyMember[]) : [];
  } catch {
    return [];
  }
}

let members = load();
const listeners = new Set<() => void>();

function save(next: FamilyMember[]): string | null {
  try {
    localStorage.setItem(FAMILY_KEY, JSON.stringify(next));
  } catch {
    return 'There is no more room on this phone for photos. Remove one first.';
  }
  members = next;
  listeners.forEach((l) => l());
  return null;
}

export const family = {
  all: () => members,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  /** Returns an error message, or null when saved */
  add(name: string, photo: string): string | null {
    return save([...members, { id: `f${Date.now().toString(36)}`, name: name.trim(), photo }]);
  },
  rename(id: string, name: string) {
    save(members.map((m) => (m.id === id ? { ...m, name: name.trim() } : m)));
  },
  remove(id: string) {
    save(members.filter((m) => m.id !== id));
  },
};

export function useFamily(): FamilyMember[] {
  return useSyncExternalStore(family.subscribe, family.all);
}

/** Clip id for a family member's name */
export const familyClip = (m: FamilyMember) => `fam.n.${m.id}`;

/** Shrinks a photo from the camera to a small square (so lots fit on the phone) */
export function squarePhoto(file: File, size = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('no canvas'));
      // The middle of the photo (faces are usually there; a little higher for portraits)
      const sx = (img.width - side) / 2;
      const sy = img.height > img.width ? (img.height - side) * 0.3 : (img.height - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('not a picture'));
    };
    img.src = url;
  });
}
