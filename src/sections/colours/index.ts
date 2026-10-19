import type { Section } from '../../types/learning';
import { colourClips, colourItems } from './items';
import { popBalloonsColours } from './games/popBalloons';
import { memoryMatchColours } from './games/memoryMatch';
import { paintBucketColours } from './games/paintBucket';
import { mixPaintColours } from './games/mixPaint';

/**
 * Colours section. The paint bucket and colour-mixing games will be added to `games`.
 */
const colours: Section = {
  id: 'colours',
  order: 2,
  titleClip: 'colours.title',
  icon: '🎨',
  colour: '#ff8787',
  items: colourItems,
  clips: {
    'colours.title': 'Colours',
    ...colourClips,
  },
  games: [popBalloonsColours, paintBucketColours, mixPaintColours, memoryMatchColours],
};

export default colours;
