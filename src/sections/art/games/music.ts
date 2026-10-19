import type { Game } from '../../../types/learning';

/**
 * Music: a rainbow xylophone. Free play first, then copying tunes, starting
 * very small: one note on three bars with the right bar glowing, then without
 * the glow, then two notes, and only slowly more bars and longer tunes.
 */
export const musicArt: Game = {
  id: 'music',
  titleClip: 'music.title',
  icon: '🎶',
  levels: [
    { id: 'free', parentLabel: 'Free play (🎵 plays Twinkle Twinkle)', rounds: 1, activity: { kind: 'music', pool: [], mode: 'free', bars: 8 } },
    { id: 'one-guided', parentLabel: '1 note, 3 bars, the bar glows', rounds: 4, activity: { kind: 'music', pool: [], mode: 'follow', bars: 3, notes: 1, guide: true } },
    { id: 'one', parentLabel: '1 note, 3 bars', rounds: 4, activity: { kind: 'music', pool: [], mode: 'follow', bars: 3, notes: 1 } },
    { id: 'two-guided', parentLabel: '2 notes, 3 bars, the bars glow', rounds: 4, activity: { kind: 'music', pool: [], mode: 'follow', bars: 3, notes: 2, guide: true } },
    { id: 'two', parentLabel: '2 notes, 3 bars', rounds: 4, activity: { kind: 'music', pool: [], mode: 'follow', bars: 3, notes: 2 } },
    { id: 'two-five', parentLabel: '2 notes, 5 bars', rounds: 4, activity: { kind: 'music', pool: [], mode: 'follow', bars: 5, notes: 2 } },
    { id: 'three', parentLabel: '3 notes, 5 bars', rounds: 4, activity: { kind: 'music', pool: [], mode: 'follow', bars: 5, notes: 3 } },
    { id: 'four', parentLabel: '4 notes, 8 bars', rounds: 4, activity: { kind: 'music', pool: [], mode: 'follow', bars: 8, notes: 4 } },
  ],
};
