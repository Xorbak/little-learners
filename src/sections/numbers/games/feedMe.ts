import type { Game } from '../../../types/learning';

/**
 * Feed Me: counting out an amount to match a numeral.
 * Dots under the numeral help at first and fade out per number once she knows it.
 * From level 3 she decides when she's done by pressing "Here you go!".
 * Every level mixes in other animals' food (wrongFood), so she has to pick the right one, not just grab.
 * Still to come: an early-adding level ("Bunny ate 2, wants 1 more").
 */
const oneToFive = ['1', '2', '3', '4', '5'];
const oneToTen = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export const feedMeNumbers: Game = {
  id: 'feed-me',
  titleClip: 'feed.title',
  icon: '🐰',
  levels: [
    {
      id: 'dots-1-3',
      parentLabel: '1–3 with dots, stops by itself, 2 other foods',
      rounds: 4,
      activity: { kind: 'feed-me', pool: ['1', '2', '3'], dots: 'always', autoComplete: true, extraFood: 2, wrongFood: 2 },
    },
    {
      id: 'dots-1-5',
      parentLabel: '1–5, dots until she knows each number, 3 other foods',
      rounds: 5,
      activity: { kind: 'feed-me', pool: oneToFive, dots: 'until-known', autoComplete: true, extraFood: 2, wrongFood: 3 },
    },
    {
      id: 'here-you-go-1-5',
      parentLabel: '1–5, numeral only, she presses "Here you go!", 3 other foods',
      rounds: 5,
      activity: { kind: 'feed-me', pool: oneToFive, dots: 'never', autoComplete: false, extraFood: 2, wrongFood: 3 },
    },
    {
      id: 'up-to-10',
      parentLabel: '1–10, "Here you go!", 4 other foods',
      rounds: 5,
      activity: { kind: 'feed-me', pool: oneToTen, dots: 'never', autoComplete: false, extraFood: 3, wrongFood: 4 },
    },
    {
      id: 'wrong-foods',
      parentLabel: '1–10 with lots of other foods (6)',
      rounds: 5,
      activity: { kind: 'feed-me', pool: oneToTen, dots: 'never', autoComplete: false, extraFood: 2, wrongFood: 6 },
    },
    {
      id: 'two-foods',
      parentLabel: 'Two foods at once (1–3 of each), 3 other foods',
      rounds: 4,
      activity: { kind: 'feed-me', pool: ['1', '2', '3'], dots: 'never', autoComplete: false, extraFood: 1, secondFoodPool: ['1', '2', '3'], wrongFood: 3 },
    },
  ],
};
