import type { Section } from '../../types/learning';
import { letterItems, wordClips, wordItems } from './words';
import { flashCardsLetters } from './games/flashCards';
import { touchLetter } from './games/touchLetter';
import { popBalloonsLetters } from './games/popBalloons';
import { memoryMatchLetters } from './games/memoryMatch';
import { matchItLetters } from './games/matchIt';

/**
 * Letters and Sounds. Phonics first: flash cards now; find-the-letter, first-sound
 * games, tracing and three-letter words later. Items are words with pictures.
 * "What she knows" shows the letters; flash-card words are left out (track: false).
 */
const letters: Section = {
  id: 'letters',
  order: 4,
  titleClip: 'letters.title',
  icon: 'abc',
  colour: '#ffa94d',
  items: { ...wordItems, ...letterItems },
  clips: {
    'letters.title': 'Letters and sounds',
    'letters.touch-title': 'Touch the letter!',
    'letters.touch-the-letter': 'Touch the letter',
    'letters.yes-letter': "Yes! That's the letter",
    'letters.oops-letter': "Oops! That's the letter",
    'letters.match-title': 'Match the letter!',
    'letters.match-small': 'Find the small',
    'letters.match-big': 'Find the big',
    'letters.match-starts': 'What starts with',
    'letters.match-which': 'Which letter does',
    'letters.match-start': 'start with?',
    'letters.starts-with': 'starts with',
    ...wordClips,
  },
  // Every subject has the same first games in the same order: Touch, Balloons, Match, Memory, then its own
  games: [touchLetter, popBalloonsLetters, matchItLetters, memoryMatchLetters, flashCardsLetters],
};

export default letters;
