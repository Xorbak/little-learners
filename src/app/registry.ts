import type { Section } from '../types/learning';
import { mechanics } from '../engine';
import { narrator } from '../shared/audio/narrator';
import { sharedClips } from '../shared/audio/sharedClips';
import { stickerClips } from './stickers';
import { exerciseClips } from './exercises';
import { guardClips } from './guardClips';
import { missionClips } from './missions';
import { calmClips } from './calm/themes';

/**
 * Finds every section automatically: any folder in src/sections with an index.ts
 * that default-exports a Section appears on the home screen. Nothing else to edit.
 */
const found = import.meta.glob<{ default: Section }>('../sections/*/index.ts', { eager: true });

export const sections: Section[] = Object.values(found)
  .map((m) => m.default)
  .filter((s) => s.games.length > 0)
  .sort((a, b) => a.order - b.order);

export function findSection(id: string): Section | undefined {
  return sections.find((s) => s.id === id);
}

export const gameKey = (sectionId: string, gameId: string) => `${sectionId}/${gameId}`;

// Give the narrator every clip in the app
narrator.registerClips(sharedClips);
narrator.registerClips(stickerClips);
narrator.registerClips(exerciseClips);
narrator.registerClips(guardClips);
narrator.registerClips(missionClips);
narrator.registerClips(calmClips);
for (const m of Object.values(mechanics)) narrator.registerClips(m.clips);
for (const s of sections) narrator.registerClips(s.clips);
