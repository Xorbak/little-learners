import type { Game, Section } from '../../types/learning';
import { emojiItems } from '../../shared/ui/emojiItems';
import { simpleQuestions } from '../../shared/quiz';

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

/** How do they feel? A little situation, and the faces to choose from (NCF: match feelings to pictures) */
const { items: situations, clips: situationClips } = simpleQuestions(
  'feel.sit',
  [
    { key: 'present', scene: '🧒🏽🎁', ask: 'It’s his birthday, and he got a big present! How does he feel?', answers: [['😊', 'happy'], ['😢', 'sad'], ['😴', 'sleepy']], yes: 'He feels happy!' },
    { key: 'ice-cream', scene: '🍦💥', ask: 'Oh no! Her ice cream fell on the ground. How does she feel?', answers: [['😢', 'sad'], ['😊', 'happy'], ['🤪', 'silly']], yes: 'She feels sad. Maybe a hug will help.' },
    { key: 'tower', scene: '🧱💥', ask: 'Someone knocked his tower down, on purpose! How does he feel?', answers: [['😠', 'cross'], ['😴', 'sleepy'], ['😊', 'happy']], yes: 'He feels cross. He can take big breaths, and say: I don’t like that!' },
    { key: 'storm', scene: '⛈️🛏️', ask: 'There is a loud storm in the night. Boom! How does she feel?', answers: [['😨', 'scared'], ['😊', 'happy'], ['🤪', 'silly']], yes: 'She feels scared. A grown-up can give her a cuddle.' },
    { key: 'late', scene: '🌙🥱', ask: 'It’s very late, and he played all day long. How does he feel?', answers: [['😴', 'sleepy'], ['😠', 'cross'], ['😲', 'surprised']], yes: 'He feels sleepy. Time for bed!' },
    { key: 'box', scene: '📦🎈', ask: 'She opens a box, and balloons pop out! How does she feel?', answers: [['😲', 'surprised'], ['😢', 'sad'], ['😴', 'sleepy']], yes: 'She feels surprised! Ooh!' },
    { key: 'face', scene: '🤡👨🏾', ask: 'Daddy pulls a funny face. How does she feel?', answers: [['🤪', 'silly'], ['😨', 'scared'], ['😢', 'sad']], yes: 'She feels silly! Hee hee!' },
    { key: 'moved', scene: '👋🚚', ask: 'Her best friend moved far away. How does she feel?', answers: [['😢', 'sad'], ['🤩', 'excited'], ['🤪', 'silly']], yes: 'She feels sad. She can draw a picture for her friend.' },
    { key: 'party', scene: '🎢🎡', ask: 'Tomorrow they are going to the fun fair! How does he feel?', answers: [['🤩', 'excited'], ['😢', 'sad'], ['😴', 'sleepy']], yes: 'He feels excited! Woohoo!' },
    { key: 'dog', scene: '🐶💕', ask: 'Her puppy licks her face. How does she feel?', answers: [['😊', 'happy'], ['😠', 'cross'], ['😨', 'scared']], yes: 'She feels happy!' },
    { key: 'dark', scene: '🌑🔦', ask: 'The lights went out, and it’s very dark. How does he feel?', answers: [['😨', 'scared'], ['🤩', 'excited'], ['😊', 'happy']], yes: 'He feels a bit scared. It’s OK. A grown-up will find a torch.' },
    { key: 'grab', scene: '🧸🫳', ask: 'Her brother grabbed her teddy. How does she feel?', answers: [['😠', 'cross'], ['😊', 'happy'], ['😴', 'sleepy']], yes: 'She feels cross. She can say: Please give it back!' },
  ],
  { oops: ['feel.sit.hmm'] },
);

const howDoTheyFeel: Game = {
  id: 'how-feel',
  titleClip: 'feel.situations-title',
  icon: '🍦',
  levels: [{ id: 'all', parentLabel: 'How does she feel? (little situations)', rounds: 6, activity: { kind: 'pick-it', pool: Object.keys(situations) } }],
};

const feelings: Section = {
  id: 'feelings',
  order: 6,
  titleClip: 'feel.title',
  icon: '😊',
  colour: '#ffd43b',
  items: { ...items, ...checkInItems, ...situations },
  clips: {
    ...clips,
    ...situationClips,
    'feel.situations-title': 'How do they feel?',
    'feel.sit.hmm': 'Hmm, would they feel like that? Have another look!',
    ...faceNames,
    'feel.title': 'Feelings',
    'feel.check-in-title': 'How do you feel?',
    'feel.who-is-title': 'Who is happy?',
    'feel.who-is': 'Who is',
    'feel.yes': 'Yes! That face is',
    'feel.that-face-is': 'Oops! That face is',
  },
  games: [checkInGame, whoIs, howDoTheyFeel],
};

export default feelings;
