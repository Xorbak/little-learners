import type { Game, MatchWay } from '../../../types/learning';
import { lettersFor } from '../words';

const bigToSmall: MatchWay = { show: 'upper', pick: 'lower', ask: ['letters.match-small', '$name'], yes: ['match.yes-thats', '$name'] };
const smallToBig: MatchWay = { show: 'lower', pick: 'upper', ask: ['letters.match-big', '$name'], yes: ['match.yes-thats', '$name'] };
/** s at the top → find the picture that starts with s (sun) */
const toPicture: MatchWay = { show: 'lower', pick: 'picture', ask: ['letters.match-starts', '$name'], yes: ['match.yes', '$card', 'letters.starts-with', '$name'] };
/** 🐱 at the top → find the letter it starts with (c) */
const toLetter: MatchWay = { show: 'picture', pick: 'lower', ask: ['letters.match-which', '$top', 'letters.match-start'], yes: ['match.yes', '$top', 'letters.starts-with', '$name'] };

/** Match the Letter: capital and small letter, and first sounds (letter ↔ picture). Same letter order as the other letter games. */
export const matchItLetters: Game = {
  id: 'match-it',
  titleClip: 'letters.match-title',
  icon: '🎯',
  levels: [
    { id: 'sat-case', parentLabel: 's a t: capital → small (pick from 2)', rounds: 5, activity: { kind: 'match-it', pool: lettersFor('sat'), choices: 2, ways: [bigToSmall] } },
    { id: 'satpin-case', parentLabel: 's a t p i n: capital ↔ small (pick from 3)', rounds: 6, activity: { kind: 'match-it', pool: lettersFor('satpin'), choices: 3, ways: [bigToSmall, smallToBig] } },
    { id: 'satpin-sounds', parentLabel: 's a t p i n: first sounds, letter ↔ picture (pick from 3)', rounds: 6, activity: { kind: 'match-it', pool: lettersFor('satpin'), choices: 3, ways: [toPicture, toLetter] } },
    { id: 'mdgock', parentLabel: '+ m d g o c k: everything (pick from 3)', rounds: 6, activity: { kind: 'match-it', pool: lettersFor('satpinmdgock'), choices: 3, ways: [bigToSmall, smallToBig, toPicture, toLetter] } },
    { id: 'all', parentLabel: 'All the letters: everything (pick from 4)', rounds: 6, activity: { kind: 'match-it', pool: lettersFor('abcdefghijklmnopqrstuvwyz'), choices: 4, ways: [bigToSmall, smallToBig, toPicture, toLetter] } },
  ],
};
