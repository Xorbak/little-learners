import type { Game, MatchWay } from '../../../types/learning';

/** 3 at the top → find the card with three things */
const toAmount: MatchWay = { show: 'numeral', pick: 'amount', ask: ['numbers.match-which-has', '$name'], yes: ['$count', 'match.thats', '$name'] };
/** Three things at the top → find the number 3 */
const toNumeral: MatchWay = { show: 'amount', pick: 'numeral', ask: ['numbers.match-how-many'], yes: ['$count', 'match.thats', '$name'] };

const upTo = (n: number, from = 1) => Array.from({ length: n - from + 1 }, (_, i) => String(i + from));

/**
 * Match the Number: a number and how many, both ways round. The right card is
 * counted out loud, the things lighting up one by one (one-to-one counting).
 */
export const matchItNumbers: Game = {
  id: 'match-it',
  titleClip: 'numbers.match-title',
  icon: '🎯',
  levels: [
    { id: '1-3-amount', parentLabel: '1–3: number → how many (pick from 2)', rounds: 5, activity: { kind: 'match-it', pool: upTo(3), choices: 2, ways: [toAmount] } },
    { id: '1-3-number', parentLabel: '1–3: how many → number (pick from 2)', rounds: 5, activity: { kind: 'match-it', pool: upTo(3), choices: 2, ways: [toNumeral] } },
    { id: '1-5', parentLabel: '1–5, both ways (pick from 3)', rounds: 6, activity: { kind: 'match-it', pool: upTo(5), choices: 3, ways: [toAmount, toNumeral] } },
    { id: '1-10', parentLabel: '1–10, both ways (pick from 3)', rounds: 6, activity: { kind: 'match-it', pool: upTo(10), choices: 3, ways: [toAmount, toNumeral] } },
    { id: '0-10', parentLabel: '0–10 with zero (nothing!), both ways (pick from 4)', rounds: 6, activity: { kind: 'match-it', pool: upTo(10, 0), choices: 4, ways: [toAmount, toNumeral] } },
  ],
};
