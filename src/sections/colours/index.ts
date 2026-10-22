import type { Section } from '../../types/learning';
import { COLOUR_THINGS, colourClips, colourItems } from './items';
import { popBalloonsColours } from './games/popBalloons';
import { memoryMatchColours } from './games/memoryMatch';
import { paintBucketColours } from './games/paintBucket';
import { mixPaintColours } from './games/mixPaint';
import { touchColour } from './games/touchColour';
import { matchItColours } from './games/matchIt';
import { thingClips } from '../../shared/ui/faces';

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
    ...thingClips(COLOUR_THINGS),
    'colours.touch-title': 'Touch the colour!',
    'colours.touch': 'Touch',
    'colours.match-title': 'Match the colour!',
    'colours.match-find': 'Find something',
    'colours.match-what-colour': 'What colour is the',
  },
  // Every subject has the same first games in the same order: Touch, Balloons, Match, Memory, then its own
  games: [touchColour, popBalloonsColours, matchItColours, memoryMatchColours, paintBucketColours, mixPaintColours],
};

export default colours;
