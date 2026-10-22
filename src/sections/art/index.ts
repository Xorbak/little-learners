import type { Section } from '../../types/learning';
import { pictureClips, pictureItems } from './pictures';
import { paintByNumbersArt } from './games/paintByNumbers';
import { musicArt } from './games/music';
import { bandGame, copyBeatGame, drawGame, listenMusicGame, musicClips, musicItems } from './games/listening';

/**
 * Art section: creative play. Drawing, tracing and music games can join here.
 * Items are pictures, so this section is left out of "What she knows".
 */
const art: Section = {
  id: 'art',
  order: 8,
  titleClip: 'art.title',
  icon: '🖌️',
  colour: '#da77f2',
  items: { ...pictureItems, ...musicItems },
  clips: {
    'art.title': 'Art and music',
    ...pictureClips,
    ...musicClips,
  },
  games: [drawGame, paintByNumbersArt, musicArt, listenMusicGame, copyBeatGame, bandGame],
  trackProgress: false,
};

export default art;
