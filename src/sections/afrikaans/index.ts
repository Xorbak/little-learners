import type { Game, Section } from '../../types/learning';
import { narrator } from '../../shared/audio/narrator';
import { afrikaansClips, afrikaansItems, afrikaansOrder } from './words';

// Afrikaans words are said with an Afrikaans voice (or Dutch, the closest), unless recorded
narrator.setClipLanguage('af.word.', 'af');

/**
 * Touch the Word: spaced repetition decides everything (see engine/learn-words):
 * new words alone first, then 2, 3 and 4 pictures as she learns words.
 */
const touchWord: Game = {
  id: 'touch-word',
  titleClip: 'af.touch-title',
  icon: '👆',
  levels: [
    {
      id: 'spaced',
      parentLabel: 'Spaced repetition: new words on their own; 2 pictures from 3 learned words, 3 from 6, 4 from 10',
      rounds: 6,
      activity: { kind: 'learn-words', pool: afrikaansOrder, maxLearning: 3, newPerDay: 2 },
    },
  ],
};

/**
 * Afrikaans: a second language, a few words at a time. More games (balloons,
 * match, memory) can use the words she has learned, the same way as the other subjects.
 */
const afrikaans: Section = {
  id: 'afrikaans',
  order: 4.5,
  titleClip: 'af.title',
  icon: '🇿🇦',
  colour: '#fab005',
  items: afrikaansItems,
  clips: {
    'af.title': 'Afrikaans',
    'af.touch-title': 'Touch the word!',
    ...afrikaansClips,
  },
  games: [touchWord],
};

export default afrikaans;
