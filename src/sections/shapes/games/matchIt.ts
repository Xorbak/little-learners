import type { Game, MatchWay } from '../../../types/learning';

/** Circle at the top → find something round (🕐) */
const toThing: MatchWay = { show: 'display', pick: 'thing', ask: ['shapes.match-find', '$key:shapes.a'], yes: ['match.yes-the', '$card', 'match.is', '$key:shapes.a'] };
/** 🍕 at the top → what shape is the pizza slice? (triangle) */
const toShape: MatchWay = { show: 'thing', pick: 'display', ask: ['shapes.match-what-shape', '$top'], yes: ['match.yes-the', '$top', 'match.is', '$key:shapes.a'] };

const first = ['circle', 'square', 'triangle'];

/** Match the Shape: a shape and everyday things that shape, both ways round */
export const matchItShapes: Game = {
  id: 'match-it',
  titleClip: 'shapes.match-title',
  icon: '🎯',
  levels: [
    { id: 'first-thing', parentLabel: 'Circle, square, triangle: shape → thing (pick from 2)', rounds: 5, activity: { kind: 'match-it', pool: first, choices: 2, ways: [toThing] } },
    { id: 'first-shape', parentLabel: 'Circle, square, triangle: thing → shape (pick from 3)', rounds: 5, activity: { kind: 'match-it', pool: first, choices: 3, ways: [toShape] } },
    { id: 'first-both', parentLabel: 'Circle, square, triangle: both ways (pick from 3)', rounds: 6, activity: { kind: 'match-it', pool: first, choices: 3, ways: [toThing, toShape] } },
    { id: 'more', parentLabel: '+ rectangle, oval, diamond: both ways (pick from 4)', rounds: 6, activity: { kind: 'match-it', pool: [...first, 'rectangle', 'oval', 'diamond'], choices: 4, ways: [toThing, toShape] } },
  ],
};
