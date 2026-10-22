import type { Game, Section } from '../../types/learning';
import { retellItems, retellKeys, storyClips, storyItems, storyKeys } from './stories';
import { listeningClips, listeningItems, EASY_SOUNDS, MORE_SOUNDS, SIGN_LEVELS } from './listening';
import { beatClips, beatItems, packKeys, sentenceKeys, syllableKeys, wordClips, wordItems } from './words';
import './stories.css';

/**
 * Stories and sounds (NCF Communication): listening, stories, rhymes,
 * syllables, sounds around us, early reading (her name, signs) and new words.
 */

const storyTime: Game = {
  id: 'story-time',
  titleClip: 'stories.story-title',
  icon: '📖',
  levels: [
    { id: 'listen', parentLabel: 'Listen to a story, then 1 question', rounds: 2, activity: { kind: 'story', pool: storyKeys, questions: 1 } },
    { id: 'listen-2', parentLabel: 'A story, then 2 questions', rounds: 2, activity: { kind: 'story', pool: storyKeys, questions: 2 } },
    { id: 'guess', parentLabel: 'What happens next? (before the last page)', rounds: 2, activity: { kind: 'story', pool: storyKeys, questions: 1, guessNext: true } },
    { id: 'retell-3', parentLabel: 'Put a story in order (3 pictures)', rounds: 2, activity: { kind: 'order', pool: retellKeys, steps: 3 } },
    { id: 'questions-3', parentLabel: 'A story: what happens next, then 3 questions', rounds: 2, activity: { kind: 'story', pool: storyKeys, questions: 3, guessNext: true } },
    { id: 'retell-5', parentLabel: 'Put a whole story in order (5 pictures)', rounds: 2, activity: { kind: 'order', pool: retellKeys } },
  ],
};

const rhymeTime: Game = {
  id: 'rhyme',
  titleClip: 'stories.rhyme-title',
  icon: '👒',
  levels: [
    { id: '2', parentLabel: 'What rhymes with cat? (2 to pick from)', rounds: 5, activity: { kind: 'pick-it', pool: ['q-rhyme'], choices: 2 } },
    { id: '3', parentLabel: '3 to pick from', rounds: 6, activity: { kind: 'pick-it', pool: ['q-rhyme'], choices: 3 } },
    { id: '4', parentLabel: '4 to pick from', rounds: 6, activity: { kind: 'pick-it', pool: ['q-rhyme'], choices: 4 } },
  ],
};

const clapIt: Game = {
  id: 'clap',
  titleClip: 'stories.clap-title',
  icon: '🥁',
  levels: [
    { id: 'show-1-2', parentLabel: 'Words with 1–2 beats; shown first, each tap says a beat', rounds: 5, activity: { kind: 'beats', pool: syllableKeys([1, 2]), mode: 'syllables', demo: true, guide: true } },
    { id: 'show-2-3', parentLabel: '2–3 beats (el-e-phant), shown first', rounds: 5, activity: { kind: 'beats', pool: syllableKeys([2, 3]), mode: 'syllables', demo: true, guide: true } },
    { id: 'guide', parentLabel: '1–3 beats, each tap says a beat', rounds: 6, activity: { kind: 'beats', pool: syllableKeys([1, 2, 3]), mode: 'syllables', guide: true } },
    { id: 'alone', parentLabel: '1–4 beats on her own (she says it, the drum counts)', rounds: 6, activity: { kind: 'beats', pool: syllableKeys([1, 2, 3, 4]), mode: 'syllables' } },
  ],
};

const sounds: Game = {
  id: 'sounds',
  titleClip: 'stories.sounds-title',
  icon: '👂',
  levels: [
    { id: 'easy', parentLabel: 'Phone, doorbell, drum, bird, rain, car', rounds: 5, activity: { kind: 'pick-it', pool: ['q-sound'], choices: 3, modes: EASY_SOUNDS } },
    { id: 'more', parentLabel: '+ clock, siren, train, knock', rounds: 6, activity: { kind: 'pick-it', pool: ['q-sound'], choices: 3, modes: MORE_SOUNDS } },
    { id: 'all', parentLabel: 'All 15 sounds, 4 to pick from', rounds: 6, activity: { kind: 'pick-it', pool: ['q-sound'], choices: 4 } },
  ],
};

const listenOrder: Game = {
  id: 'listen-order',
  titleClip: 'stories.listen-title',
  icon: '🐱',
  levels: [
    { id: '2-of-3', parentLabel: 'Remember 2 things, in order (3 pictures)', rounds: 5, activity: { kind: 'pick-it', pool: ['q-listen'], max: 2, choices: 3 } },
    { id: '2-of-4', parentLabel: 'Remember 2 things (4 pictures)', rounds: 5, activity: { kind: 'pick-it', pool: ['q-listen'], max: 2, choices: 4 } },
    { id: '3-of-5', parentLabel: 'Remember 3 things (5 pictures)', rounds: 6, activity: { kind: 'pick-it', pool: ['q-listen'], max: 3, choices: 5 } },
    { id: '4-of-6', parentLabel: 'Remember 4 things (6 pictures)', rounds: 6, activity: { kind: 'pick-it', pool: ['q-listen'], max: 4, choices: 6 } },
  ],
};

const countWords: Game = {
  id: 'count-words',
  titleClip: 'stories.words-title',
  icon: '💬',
  levels: [
    { id: 'show', parentLabel: '2–3 words, shown first, each tap says a word', rounds: 5, activity: { kind: 'beats', pool: sentenceKeys([2, 3]), mode: 'words', demo: true, guide: true } },
    { id: 'guide', parentLabel: '2–4 words, each tap says a word', rounds: 6, activity: { kind: 'beats', pool: sentenceKeys([2, 3, 4]), mode: 'words', guide: true } },
    { id: 'alone', parentLabel: '2–5 words on her own', rounds: 6, activity: { kind: 'beats', pool: sentenceKeys([2, 3, 4, 5]), mode: 'words' } },
  ],
};

const findName: Game = {
  id: 'find-name',
  titleClip: 'stories.name-title',
  icon: '🏷️',
  levels: [
    { id: '2', parentLabel: 'Her name or one other (different first letter)', rounds: 5, activity: { kind: 'pick-it', pool: ['q-name'], choices: 2 } },
    { id: '3', parentLabel: 'Her name among 3', rounds: 5, activity: { kind: 'pick-it', pool: ['q-name'], choices: 3 } },
    { id: 'same-letter', parentLabel: 'Among 4, one starting with the same letter', rounds: 6, activity: { kind: 'pick-it', pool: ['q-name'], choices: 4, modes: ['same-letter'] } },
  ],
};

const touchWords = (pack: string, label: string, choices: number) => ({ id: pack, parentLabel: label, rounds: 6, activity: { kind: 'touch-it' as const, pool: packKeys(pack), choices, varied: 'none' as const } });
const newWords: Game = {
  id: 'new-words',
  titleClip: 'stories.new-words-title',
  icon: '🧦',
  levels: [
    touchWords('clothes', 'Clothes', 3),
    touchWords('food', 'Food', 3),
    touchWords('vehicles', 'Things that go', 4),
    touchWords('bugs', 'Bugs and insects', 4),
    touchWords('home', 'At home', 4),
    touchWords('toys', 'Toys', 4),
  ],
};

const sayIt: Game = {
  id: 'say-it',
  titleClip: 'stories.say-title',
  icon: '🎤',
  levels: [
    { id: 'clothes-food', parentLabel: 'Say it: clothes and food (records her voice)', rounds: 4, activity: { kind: 'say-it', pool: packKeys('clothes', 'food') } },
    { id: 'go-bugs', parentLabel: 'Things that go and bugs', rounds: 4, activity: { kind: 'say-it', pool: packKeys('vehicles', 'bugs') } },
    { id: 'home-toys', parentLabel: 'At home and toys', rounds: 4, activity: { kind: 'say-it', pool: packKeys('home', 'toys') } },
  ],
};

const signs: Game = {
  id: 'signs',
  titleClip: 'stories.signs-title',
  icon: '🛑',
  levels: [
    { id: 'first', parentLabel: 'STOP, toilets, traffic light', rounds: 5, activity: { kind: 'pick-it', pool: ['q-sign'], choices: 2, modes: SIGN_LEVELS.first } },
    { id: 'more', parentLabel: '+ no entry, crossing, hospital, exit', rounds: 6, activity: { kind: 'pick-it', pool: ['q-sign'], choices: 3, modes: SIGN_LEVELS.more } },
    { id: 'danger', parentLabel: 'Danger signs: poison, careful, electricity', rounds: 6, activity: { kind: 'pick-it', pool: ['q-sign'], choices: 3, modes: SIGN_LEVELS.danger } },
    { id: 'all', parentLabel: 'All 14 signs', rounds: 6, activity: { kind: 'pick-it', pool: ['q-sign'], choices: 4 } },
  ],
};

const stories: Section = {
  id: 'stories',
  order: 4.2,
  titleClip: 'stories.title',
  icon: '📖',
  colour: '#ff8787',
  items: { ...storyItems, ...retellItems, ...listeningItems, ...beatItems, ...wordItems },
  clips: {
    'stories.title': 'Stories and sounds',
    'stories.story-title': 'Story time',
    'stories.rhyme-title': 'Rhyme time',
    'stories.clap-title': 'Clap it!',
    'stories.sounds-title': "What's that sound?",
    'stories.listen-title': 'Listen and touch',
    'stories.words-title': 'Count the words',
    'stories.name-title': 'Find my name',
    'stories.new-words-title': 'New words',
    'stories.say-title': 'Say it!',
    'stories.signs-title': 'Signs',
    ...storyClips,
    ...listeningClips,
    ...beatClips,
    ...wordClips,
  },
  games: [storyTime, rhymeTime, clapIt, sounds, listenOrder, countWords, findName, newWords, sayIt, signs],
};

export default stories;
