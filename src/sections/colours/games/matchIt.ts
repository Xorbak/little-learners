import type { Game, MatchWay } from '../../../types/learning';

/** Red at the top → find something red (🍓) */
const toThing: MatchWay = { show: 'display', pick: 'thing', ask: ['colours.match-find', '$name'], yes: ['match.yes-the', '$card', 'match.is', '$name'] };
/** 🍌 at the top → what colour is the banana? (yellow) */
const toColour: MatchWay = { show: 'thing', pick: 'display', ask: ['colours.match-what-colour', '$top'], yes: ['match.yes-the', '$top', 'match.is', '$name'] };

const primary = ['red', 'blue', 'yellow'];

/** Match the Colour: a colour and things that are that colour, both ways round */
export const matchItColours: Game = {
  id: 'match-it',
  titleClip: 'colours.match-title',
  icon: '🎯',
  levels: [
    { id: 'primary-thing', parentLabel: 'Red, blue, yellow: colour → thing (pick from 2)', rounds: 5, activity: { kind: 'match-it', pool: primary, choices: 2, ways: [toThing] } },
    { id: 'primary-colour', parentLabel: 'Red, blue, yellow: thing → colour (pick from 3)', rounds: 5, activity: { kind: 'match-it', pool: primary, choices: 3, ways: [toColour] } },
    { id: 'six', parentLabel: '+ green, orange: both ways (pick from 3)', rounds: 6, activity: { kind: 'match-it', pool: [...primary, 'green', 'orange'], choices: 3, ways: [toThing, toColour] } },
    { id: 'eight', parentLabel: '+ purple, pink, brown: both ways (pick from 4)', rounds: 6, activity: { kind: 'match-it', pool: [...primary, 'green', 'orange', 'purple', 'pink', 'brown'], choices: 4, ways: [toThing, toColour] } },
  ],
};
