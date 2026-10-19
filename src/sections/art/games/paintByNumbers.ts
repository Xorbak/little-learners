import type { Game } from '../../../types/learning';
import { allPictures } from '../pictures';

/**
 * Paint by Numbers: pick a paint pot, tap the parts that go with it.
 * Starts with colour dots (match colour to colour), then numbers on colours,
 * then numbers only (match the numeral on the part to the numbered pot),
 * Every level opens the gallery so she picks the picture; the 🔢 / 🎨 switch at the top
 * of the gallery turns on free painting (any colour anywhere) for the next picture.
 */
export const paintByNumbersArt: Game = {
  id: 'paint-by-numbers',
  titleClip: 'pbn.title',
  icon: '🖍️',
  levels: [
    { id: 'colour-dots', parentLabel: 'Colour dots: match the colour', rounds: 2, activity: { kind: 'paint-by-numbers', pool: allPictures, choose: true, hints: 'colour' } },
    { id: 'numbers-on-colours', parentLabel: 'Numbers on coloured dots', rounds: 2, activity: { kind: 'paint-by-numbers', pool: allPictures, choose: true, hints: 'number-and-colour' } },
    { id: 'numbers-only', parentLabel: 'Numbers only (1–7)', rounds: 2, activity: { kind: 'paint-by-numbers', pool: allPictures, choose: true, hints: 'number' } },
  ],
};
