import type { Section } from '../../types/learning';
import { numberClips, numberItems } from './characters';
import { popBalloonsNumbers } from './games/popBalloons';
import { memoryMatchNumbers } from './games/memoryMatch';
import { feedMeNumbers } from './games/feedMe';
import { touchNumber } from './games/touchNumber';

/**
 * Numbers section. Add new games (Feed Me, Peekaboo, Trace...) to `games`.
 */
const numbers: Section = {
  id: 'numbers',
  order: 1,
  titleClip: 'numbers.title',
  icon: '123',
  colour: '#4dabf7',
  items: numberItems,
  clips: {
    'numbers.title': 'Numbers',
    'numbers.touch-title': 'Touch the number!',
    ...numberClips,
  },
  games: [touchNumber, popBalloonsNumbers, feedMeNumbers, memoryMatchNumbers],
};

export default numbers;
