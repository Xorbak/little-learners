import type { Section } from '../../types/learning';
import { letterItems, wordClips, wordItems } from './words';
import { flashCardsLetters } from './games/flashCards';
import { touchLetter } from './games/touchLetter';
import { popBalloonsLetters } from './games/popBalloons';
import { memoryMatchLetters } from './games/memoryMatch';

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
    ...wordClips,
  },
  games: [flashCardsLetters, touchLetter, popBalloonsLetters, memoryMatchLetters],
};

export default letters;
