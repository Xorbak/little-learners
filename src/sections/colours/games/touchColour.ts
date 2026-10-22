import type { Game } from '../../../types/learning';

const WORDS = { askClip: 'colours.touch', yesClip: 'match.yes-thats', oopsClip: 'match.oops' };

/** Touch the Colour: "Touch red!" Listening for the colour's name, like Touch the Number. */
export const touchColour: Game = {
  id: 'touch-colour',
  titleClip: 'colours.touch-title',
  icon: '👆',
  levels: [
    { id: 'primary-2', parentLabel: 'Red, blue, yellow: pick from 2', rounds: 5, activity: { kind: 'touch-it', pool: ['red', 'blue', 'yellow'], choices: 2, varied: 'none', ...WORDS } },
    { id: 'primary-3', parentLabel: 'Red, blue, yellow: pick from 3', rounds: 5, activity: { kind: 'touch-it', pool: ['red', 'blue', 'yellow'], choices: 3, varied: 'none', ...WORDS } },
    { id: 'six', parentLabel: '+ green, orange, purple: pick from 4', rounds: 6, activity: { kind: 'touch-it', pool: ['red', 'blue', 'yellow', 'green', 'orange', 'purple'], choices: 4, varied: 'none', ...WORDS } },
    { id: 'ten', parentLabel: '+ pink, brown, black, grey: pick from 4', rounds: 6, activity: { kind: 'touch-it', pool: ['red', 'blue', 'yellow', 'green', 'orange', 'purple', 'pink', 'brown', 'black', 'grey'], choices: 4, varied: 'none', ...WORDS } },
    { id: 'light-dark', parentLabel: 'Light blue and dark blue too: pick from 5', rounds: 6, activity: { kind: 'touch-it', pool: ['red', 'blue', 'yellow', 'green', 'orange', 'purple', 'pink', 'brown', 'light-blue', 'dark-blue'], choices: 5, varied: 'none', ...WORDS } },
  ],
};
