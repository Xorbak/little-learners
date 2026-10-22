import type { ClipTable, LearningItem } from '../../types/learning';
import { pictureFor } from '../../shared/pictures';

/**
 * Afrikaans words, in the order she meets them: everyday things first, starting
 * with words that sound a bit like English (hond, kat, vis, bal, appel, huis).
 *
 * Each word is said with an Afrikaans voice if the phone has one, otherwise a
 * Dutch one (close enough for simple words), unless you record it:
 * src/recordings/af.word.<key>.mp3 (e.g. af.word.hond.mp3). Grown-ups →
 * Afrikaans lists them all. Your own picture can replace the emoji:
 * src/pictures/afrikaans/<key>.png.
 */
export const afrikaansWords: { key: string; af: string; en: string; emoji: string }[] = [
  { key: 'hond', af: 'hond', en: 'dog', emoji: '🐶' },
  { key: 'kat', af: 'kat', en: 'cat', emoji: '🐱' },
  { key: 'vis', af: 'vis', en: 'fish', emoji: '🐟' },
  { key: 'bal', af: 'bal', en: 'ball', emoji: '⚽' },
  { key: 'appel', af: 'appel', en: 'apple', emoji: '🍎' },
  { key: 'huis', af: 'huis', en: 'house', emoji: '🏠' },
  { key: 'son', af: 'son', en: 'sun', emoji: '☀️' },
  { key: 'maan', af: 'maan', en: 'moon', emoji: '🌙' },
  { key: 'melk', af: 'melk', en: 'milk', emoji: '🥛' },
  { key: 'boek', af: 'boek', en: 'book', emoji: '📖' },
  { key: 'eend', af: 'eend', en: 'duck', emoji: '🦆' },
  { key: 'koei', af: 'koei', en: 'cow', emoji: '🐮' },
  { key: 'vark', af: 'vark', en: 'pig', emoji: '🐷' },
  { key: 'perd', af: 'perd', en: 'horse', emoji: '🐴' },
  { key: 'voel', af: 'voël', en: 'bird', emoji: '🐦' },
  { key: 'piesang', af: 'piesang', en: 'banana', emoji: '🍌' },
  { key: 'brood', af: 'brood', en: 'bread', emoji: '🍞' },
  { key: 'kaas', af: 'kaas', en: 'cheese', emoji: '🧀' },
  { key: 'eier', af: 'eier', en: 'egg', emoji: '🥚' },
  { key: 'boom', af: 'boom', en: 'tree', emoji: '🌳' },
  { key: 'blom', af: 'blom', en: 'flower', emoji: '🌸' },
  { key: 'kar', af: 'kar', en: 'car', emoji: '🚗' },
  { key: 'skoen', af: 'skoen', en: 'shoe', emoji: '👟' },
  { key: 'hoed', af: 'hoed', en: 'hat', emoji: '👒' },
  { key: 'muis', af: 'muis', en: 'mouse', emoji: '🐭' },
  { key: 'skaap', af: 'skaap', en: 'sheep', emoji: '🐑' },
  { key: 'hoender', af: 'hoender', en: 'chicken', emoji: '🐔' },
  { key: 'leeu', af: 'leeu', en: 'lion', emoji: '🦁' },
  { key: 'olifant', af: 'olifant', en: 'elephant', emoji: '🐘' },
  { key: 'hand', af: 'hand', en: 'hand', emoji: '✋' },
  { key: 'voet', af: 'voet', en: 'foot', emoji: '🦶' },
  { key: 'neus', af: 'neus', en: 'nose', emoji: '👃' },
  { key: 'bed', af: 'bed', en: 'bed', emoji: '🛏️' },
  { key: 'stoel', af: 'stoel', en: 'chair', emoji: '🪑' },
  { key: 'koppie', af: 'koppie', en: 'cup', emoji: '☕' },
];

/** Every word key, in the order she meets them */
export const afrikaansOrder = afrikaansWords.map((w) => w.key);

function WordPicture({ wordKey, emoji, size }: { wordKey: string; emoji: string; size: number }) {
  const src = pictureFor(`afrikaans/${wordKey}`);
  if (src) return <img src={src} alt="" style={{ width: size, height: size, objectFit: 'contain' }} draggable={false} />;
  return (
    <span style={{ fontSize: size * 0.8, lineHeight: 1 }} aria-hidden="true">
      {emoji}
    </span>
  );
}

export const afrikaansItems: Record<string, LearningItem> = Object.fromEntries(
  afrikaansWords.map((w) => [
    w.key,
    {
      key: w.key,
      word: w.af,
      nameClip: `af.word.${w.key}`,
      pluralClip: `af.word.${w.key}`,
      Display: ({ size }: { size: number }) => <WordPicture wordKey={w.key} emoji={w.emoji} size={size} />,
    } satisfies LearningItem,
  ]),
);

/** The Afrikaans word (said with the Afrikaans voice) and its English meaning ("dog.") */
export const afrikaansClips: ClipTable = Object.fromEntries(
  afrikaansWords.flatMap((w) => [
    [`af.word.${w.key}`, w.af],
    [`af.en.${w.key}`, `${w.en}.`],
  ]),
);
