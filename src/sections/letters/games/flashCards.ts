import type { Game } from '../../../types/learning';
import { wordsFor } from '../words';

/**
 * Phonics flash cards, in the usual teaching order: s a t p i n first.
 * Each deck is 5 cards; finishing the decks in a level moves her to the next letters.
 */
export const flashCardsLetters: Game = {
  id: 'flash-cards',
  titleClip: 'cards.title',
  icon: '🃏',
  levels: [
    { id: 'satpin', parentLabel: 's a t p i n', rounds: 3, activity: { kind: 'flash-cards', pool: wordsFor('satpin'), cardsPerDeck: 5 } },
    { id: 'mdgock', parentLabel: 'm d g o c k', rounds: 3, activity: { kind: 'flash-cards', pool: wordsFor('mdgock'), cardsPerDeck: 5 } },
    { id: 'eurhbfl', parentLabel: 'e u r h b f l', rounds: 3, activity: { kind: 'flash-cards', pool: wordsFor('eurhbfl'), cardsPerDeck: 5 } },
    { id: 'jvwyzq', parentLabel: 'j v w y z q', rounds: 2, activity: { kind: 'flash-cards', pool: wordsFor('jvwyzq'), cardsPerDeck: 5 } },
    { id: 'all', parentLabel: 'All the letters, mixed', rounds: 3, activity: { kind: 'flash-cards', pool: wordsFor('abcdefghijklmnopqrstuvwxyz'), cardsPerDeck: 6 } },
  ],
};
