import type { Game, Section } from '../../types/learning';
import { emojiItems } from '../../shared/ui/emojiItems';

/**
 * Feelings: names for how we feel. "Who is happy?" and a daily check-in
 * ("How do you feel today?") with a kind reply. Each face's `sound` is that reply;
 * faces in the 'calm' group get three slow breaths together.
 */
const { items, clips } = emojiItems('feel', [
  { key: 'happy', emoji: '😊', name: 'Happy!', sound: "Yay! I'm happy too!" },
  { key: 'sad', emoji: '😢', name: 'Sad.', sound: "Oh, that's OK. Everyone feels sad sometimes. Here's a big hug." },
  { key: 'cross', emoji: '😠', name: 'Cross.', sound: "Grrr! It's OK to feel cross. Let's take some big breaths together.", group: 'calm' },
  { key: 'scared', emoji: '😨', name: 'Scared.', sound: "It's OK. You are safe. Let's be brave and breathe together.", group: 'calm' },
  { key: 'sleepy', emoji: '😴', name: 'Sleepy.', sound: 'Yaaawn! Maybe a little rest soon. Snuggle time!' },
  { key: 'silly', emoji: '🤪', name: 'Silly!', sound: "Hee hee! Let's be silly! Wiggle wiggle!" },
  { key: 'surprised', emoji: '😲', name: 'Surprised!', sound: 'Ooh! What a surprise!' },
  { key: 'excited', emoji: '🤩', name: 'Excited!', sound: "Woohoo! Let's have fun!" },
]);

// Plain names for the "Who is happy?" game (the check-in names above have punctuation)
const faceNames = Object.fromEntries(Object.keys(items).map((k) => [`feel.face.${k}`, k]));
for (const k of Object.keys(items)) items[k] = { ...items[k], nameClip: `feel.face.${k}`, soundClip: undefined };

/** The check-in uses the same faces but says the feeling and a reply */
const checkInItems = Object.fromEntries(
  Object.entries(items).map(([k, item]) => [`checkin-${k}`, { ...item, key: `checkin-${k}`, nameClip: `feel.name.${k}`, soundClip: `feel.sound.${k}`, track: false, group: k === 'cross' || k === 'scared' ? { key: 'calm', clip: '' } : undefined }]),
);

const checkInGame: Game = {
  id: 'check-in',
  titleClip: 'feel.check-in-title',
  icon: '💛',
  levels: [{ id: 'check-in', parentLabel: 'How do you feel today?', rounds: 1, activity: { kind: 'check-in', pool: ['happy', 'sad', 'cross', 'scared', 'sleepy', 'silly'].map((k) => `checkin-${k}`) } }],
};

const whoIs: Game = {
  id: 'who-is',
  titleClip: 'feel.who-is-title',
  icon: '😊',
  levels: [
    { id: 'happy-sad', parentLabel: 'Happy and sad', rounds: 5, activity: { kind: 'touch-it', pool: ['happy', 'sad'], choices: 2, varied: 'none', askClip: 'feel.who-is', yesClip: 'feel.yes', oopsClip: 'feel.that-face-is' } },
    { id: 'four', parentLabel: '+ cross, scared', rounds: 6, activity: { kind: 'touch-it', pool: ['happy', 'sad', 'cross', 'scared'], choices: 3, varied: 'none', askClip: 'feel.who-is', yesClip: 'feel.yes', oopsClip: 'feel.that-face-is' } },
    { id: 'all', parentLabel: 'All eight feelings', rounds: 6, activity: { kind: 'touch-it', pool: Object.keys(items), choices: 4, varied: 'none', askClip: 'feel.who-is', yesClip: 'feel.yes', oopsClip: 'feel.that-face-is' } },
  ],
};

const feelings: Section = {
  id: 'feelings',
  order: 6,
  titleClip: 'feel.title',
  icon: '😊',
  colour: '#ffd43b',
  items: { ...items, ...checkInItems },
  clips: {
    ...clips,
    ...faceNames,
    'feel.title': 'Feelings',
    'feel.check-in-title': 'How do you feel?',
    'feel.who-is-title': 'Who is happy?',
    'feel.who-is': 'Who is',
    'feel.yes': 'Yes! That face is',
    'feel.that-face-is': 'Oops! That face is',
  },
  games: [checkInGame, whoIs],
};

export default feelings;
