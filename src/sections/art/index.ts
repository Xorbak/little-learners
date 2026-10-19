import type { Section } from '../../types/learning';
import { pictureClips, pictureItems } from './pictures';
import { paintByNumbersArt } from './games/paintByNumbers';
import { musicArt } from './games/music';

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
  items: pictureItems,
  clips: {
    'art.title': 'Art and music',
    ...pictureClips,
  },
  games: [paintByNumbersArt, musicArt],
  trackProgress: false,
};

export default art;
