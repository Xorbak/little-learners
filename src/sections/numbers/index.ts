import type { Section } from '../../types/learning';
import { numberClips, numberItems } from './characters';
import { popBalloonsNumbers } from './games/popBalloons';
import { memoryMatchNumbers } from './games/memoryMatch';
import { feedMeNumbers } from './games/feedMe';
import { touchNumber } from './games/touchNumber';
import { matchItNumbers } from './games/matchIt';
import { fingersGame, guessGame, mathsClips, mathsItems, moreGame, shareGame, storyGame } from './games/maths';

/**
 * Numbers section. Add new games (Feed Me, Peekaboo, Trace...) to `games`.
 */
const numbers: Section = {
  id: 'numbers',
  order: 1,
  titleClip: 'numbers.title',
  icon: '123',
  colour: '#4dabf7',
  items: { ...numberItems, ...mathsItems },
  clips: {
    'numbers.title': 'Numbers',
    'numbers.touch-title': 'Touch the number!',
    'numbers.match-title': 'Match the number!',
    'numbers.match-which-has': 'Which card has',
    'numbers.match-how-many': 'How many are there? Find the number!',
    ...numberClips,
    ...mathsClips,
  },
  // Every subject has the same first games in the same order: Touch, Balloons, Match, Memory, then its own
  games: [touchNumber, popBalloonsNumbers, matchItNumbers, memoryMatchNumbers, feedMeNumbers, fingersGame, moreGame, storyGame, guessGame, shareGame],
};

export default numbers;
