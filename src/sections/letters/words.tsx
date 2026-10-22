import type { LearningItem } from '../../types/learning';
import { pictureFor } from '../../shared/pictures';

/**
 * Words for phonics, grouped in the usual teaching order (s a t p i n first).
 * Each word has a picture (emoji for now) and starts with the sound it teaches:
 * short vowels (a as in apple, not "ay"), and hard c/g (cat, goat).
 */
export const wordList: { word: string; emoji: string; letter: string }[] = [
  // s a t p i n
  { word: 'sun', emoji: '☀️', letter: 's' },
  { word: 'snake', emoji: '🐍', letter: 's' },
  { word: 'sock', emoji: '🧦', letter: 's' },
  { word: 'apple', emoji: '🍎', letter: 'a' },
  { word: 'ant', emoji: '🐜', letter: 'a' },
  { word: 'tiger', emoji: '🐯', letter: 't' },
  { word: 'train', emoji: '🚂', letter: 't' },
  { word: 'tent', emoji: '⛺', letter: 't' },
  { word: 'pig', emoji: '🐷', letter: 'p' },
  { word: 'pizza', emoji: '🍕', letter: 'p' },
  { word: 'penguin', emoji: '🐧', letter: 'p' },
  { word: 'iguana', emoji: '🦎', letter: 'i' },
  { word: 'nose', emoji: '👃', letter: 'n' },
  { word: 'nut', emoji: '🥜', letter: 'n' },
  // m d g o c k
  { word: 'moon', emoji: '🌙', letter: 'm' },
  { word: 'mouse', emoji: '🐭', letter: 'm' },
  { word: 'milk', emoji: '🥛', letter: 'm' },
  { word: 'dog', emoji: '🐶', letter: 'd' },
  { word: 'duck', emoji: '🦆', letter: 'd' },
  { word: 'drum', emoji: '🥁', letter: 'd' },
  { word: 'goat', emoji: '🐐', letter: 'g' },
  { word: 'grapes', emoji: '🍇', letter: 'g' },
  { word: 'gift', emoji: '🎁', letter: 'g' },
  { word: 'octopus', emoji: '🐙', letter: 'o' },
  { word: 'ox', emoji: '🐂', letter: 'o' },
  { word: 'cat', emoji: '🐱', letter: 'c' },
  { word: 'car', emoji: '🚗', letter: 'c' },
  { word: 'cake', emoji: '🎂', letter: 'c' },
  { word: 'kite', emoji: '🪁', letter: 'k' },
  { word: 'key', emoji: '🔑', letter: 'k' },
  { word: 'king', emoji: '🤴', letter: 'k' },
  // e u r h b f l
  { word: 'egg', emoji: '🥚', letter: 'e' },
  { word: 'elephant', emoji: '🐘', letter: 'e' },
  { word: 'umbrella', emoji: '☂️', letter: 'u' },
  { word: 'rabbit', emoji: '🐰', letter: 'r' },
  { word: 'rainbow', emoji: '🌈', letter: 'r' },
  { word: 'robot', emoji: '🤖', letter: 'r' },
  { word: 'hat', emoji: '🎩', letter: 'h' },
  { word: 'horse', emoji: '🐴', letter: 'h' },
  { word: 'house', emoji: '🏠', letter: 'h' },
  { word: 'ball', emoji: '⚽', letter: 'b' },
  { word: 'bee', emoji: '🐝', letter: 'b' },
  { word: 'bus', emoji: '🚌', letter: 'b' },
  { word: 'fish', emoji: '🐟', letter: 'f' },
  { word: 'frog', emoji: '🐸', letter: 'f' },
  { word: 'fox', emoji: '🦊', letter: 'f' },
  { word: 'lion', emoji: '🦁', letter: 'l' },
  { word: 'leaf', emoji: '🍃', letter: 'l' },
  { word: 'lemon', emoji: '🍋', letter: 'l' },
  // j v w y z q
  { word: 'juice', emoji: '🧃', letter: 'j' },
  { word: 'van', emoji: '🚐', letter: 'v' },
  { word: 'violin', emoji: '🎻', letter: 'v' },
  { word: 'whale', emoji: '🐳', letter: 'w' },
  { word: 'watch', emoji: '⌚', letter: 'w' },
  { word: 'yo-yo', emoji: '🪀', letter: 'y' },
  { word: 'zebra', emoji: '🦓', letter: 'z' },
  { word: 'queen', emoji: '👸', letter: 'q' },
];

/**
 * Letter SOUNDS can't be said properly by the computer voice, so until you record
 * them (letters.sound.<letter>.mp3, e.g. a short "k" for c), the voice says the
 * letter's NAME instead ("C"). Recordings replace the names automatically.
 * soundExamples says what each recording should sound like.
 */
export const letterSounds: Record<string, string> = Object.fromEntries(
  'abcdefghijklmnopqrstuvwxyz'.split('').map((l) => [l, l.toUpperCase()]),
);

/** For the recording list: the sound to make, as heard at the start of these words */
export const soundExamples: Record<string, string> = {
  a: 'a as in apple', b: 'b as in ball', c: 'c as in cat (a short "k")', d: 'd as in dog', e: 'e as in egg',
  f: 'f as in fish (ffff)', g: 'g as in goat (hard g)', h: 'h as in hat (a breath)', i: 'i as in iguana / insect',
  j: 'j as in juice', k: 'k as in kite', l: 'l as in lion (llll)', m: 'm as in moon (mmmm)', n: 'n as in nose (nnnn)',
  o: 'o as in octopus', p: 'p as in pig (a little pop)', q: 'qu as in queen ("kw")', r: 'r as in rabbit (rrrr)',
  s: 's as in sun (ssss)', t: 't as in tiger', u: 'u as in umbrella', v: 'v as in van (vvvv)', w: 'w as in whale',
  x: 'x as in fox ("ks")', y: 'y as in yo-yo', z: 'z as in zebra (zzzz)',
};

const keyOf = (word: string) => word.replace(/[^a-z]/g, '');

/** Your picture from src/pictures/words/<word>.png if there is one, otherwise the emoji */
function Picture({ word, emoji, size }: { word: string; emoji: string; size: number }) {
  const src = pictureFor(`words/${word}`);
  if (src) {
    return <img className="fc-emoji fc-picture" src={src} alt="" style={{ width: size, height: size, objectFit: 'contain' }} draggable={false} />;
  }
  return (
    <span className="fc-emoji" style={{ fontSize: size * 0.8 }} aria-hidden="true">
      {emoji}
    </span>
  );
}

export const wordItems: Record<string, LearningItem> = Object.fromEntries(
  wordList.map(({ word, emoji, letter }) => [
    keyOf(word),
    {
      key: keyOf(word),
      word,
      nameClip: `letters.word.${keyOf(word)}`,
      pluralClip: `letters.word.${keyOf(word)}`,
      soundClip: `letters.sound.${letter}`,
      track: false,
      Display: ({ size }: { size: number }) => <Picture word={keyOf(word)} emoji={emoji} size={size} />,
    } satisfies LearningItem,
  ]),
);

export const wordClips = {
  ...Object.fromEntries(wordList.map(({ word }) => [`letters.word.${keyOf(word)}`, word])),
  ...Object.fromEntries(Object.entries(letterSounds).map(([l, sound]) => [`letters.sound.${l}`, sound])),
};

/** Word keys for the given letters, in list order */
export const wordsFor = (letters: string) => wordList.filter((w) => letters.includes(w.letter)).map((w) => keyOf(w.word));

// ---------------------------------------------------------------------------
// Letters on their own, named by their sound (phonics first): "Touch the sss"
// ---------------------------------------------------------------------------

const INK = '#2b2d42';
/** Pictures that start with this letter */
const picturesFor = (letter: string) => wordList.filter((w) => w.letter === letter);

const LETTER_COLOURS = ['#f03e3e', '#1c7ed6', '#2f9e44', '#f08c00', '#9c36b5', '#0c8599', '#d6336c', '#e8590c'];

function Glyph({ letter, size, colour }: { letter: string; size: number; colour?: string }) {
  return (
    <span className="letter-glyph" style={{ fontSize: size, color: colour, lineHeight: 1, fontWeight: 700 }}>
      {letter}
    </span>
  );
}

export const letterItems: Record<string, LearningItem> = Object.fromEntries(
  'abcdefghijklmnopqrstuvwyz'.split('').map((l, i) => [
    `letter-${l}`,
    {
      key: `letter-${l}`,
      word: l,
      nameClip: `letters.sound.${l}`,
      pluralClip: `letters.sound.${l}`,
      soundClip: `letters.sound.${l}`,
      Display: ({ size }: { size: number }) => <Glyph letter={l} size={size} colour={LETTER_COLOURS[i % LETTER_COLOURS.length]} />,
      Plain: ({ size }: { size: number }) => <Glyph letter={l} size={size} />,
      BalloonLabel: ({ size }: { size: number }) => <Glyph letter={l} size={size} colour="#fff" />,
      // Match It: capital, small letter, or a picture that starts with it (all in one ink colour, so colour gives nothing away)
      faces: {
        upper: () => ({ View: ({ size }) => <Glyph letter={l.toUpperCase()} size={size * 0.72} colour={INK} /> }),
        lower: () => ({ View: ({ size }) => <Glyph letter={l} size={size * 0.72} colour={INK} /> }),
        ...(picturesFor(l).length
          ? {
              picture: (seed: number) => {
                const list = picturesFor(l);
                const w = list[seed % list.length];
                return {
                  clip: `letters.word.${keyOf(w.word)}`,
                  View: ({ size }: { size: number }) => <Picture word={keyOf(w.word)} emoji={w.emoji} size={size * 0.8} />,
                };
              },
            }
          : {}),
      },
    } satisfies LearningItem,
  ]),
);

/** Letter item keys for the given letters */
export const lettersFor = (letters: string) => letters.split('').map((l) => `letter-${l}`);
