import type { LearningItem } from '../../types/learning';

/**
 * Every colour. `recipe` says which paints mix to make it (equal amounts),
 * used by the mixing game; colours without a recipe are the paints themselves.
 */
export const colourList: { key: string; hex: string; word?: string; recipe?: string[] }[] = [
  { key: 'red', hex: '#f03e3e' },
  { key: 'blue', hex: '#1c7ed6' },
  { key: 'yellow', hex: '#fcc419' },
  { key: 'green', hex: '#37b24d', recipe: ['yellow', 'blue'] },
  { key: 'orange', hex: '#fd7e14', recipe: ['red', 'yellow'] },
  { key: 'purple', hex: '#9c36b5', recipe: ['red', 'blue'] },
  { key: 'pink', hex: '#f783ac', recipe: ['red', 'white'] },
  { key: 'brown', hex: '#8d5524', recipe: ['red', 'yellow', 'blue'] },
  { key: 'white', hex: '#f8f9fa' },
  { key: 'black', hex: '#343a40' },
  { key: 'grey', hex: '#adb5bd', recipe: ['black', 'white'] },
  { key: 'light-blue', hex: '#74c0fc', word: 'light blue', recipe: ['blue', 'white'] },
  { key: 'dark-blue', hex: '#1b3a6b', word: 'dark blue', recipe: ['blue', 'black'] },
];

function Splat({ hex, size }: { hex: string; size: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <path
        d="M50 8c9 0 12 10 20 12s18-4 21 5-6 15-4 23 10 15 4 23-16 4-22 9-8 13-19 12-12-10-20-12-18 2-21-7 6-14 4-22-9-15-3-23 16-3 22-8 9-12 18-12z"
        fill={hex}
        stroke="rgba(43, 45, 66, 0.18)"
        strokeWidth="2"
      />
      <ellipse cx="38" cy="36" rx="8" ry="12" fill="#fff" opacity="0.3" transform="rotate(-25 38 36)" />
    </svg>
  );
}

export const colourItems: Record<string, LearningItem> = Object.fromEntries(
  colourList.map(({ key, hex, recipe }) => [
    key,
    {
      key,
      nameClip: `colours.name.${key}`,
      pluralClip: `colours.plural.${key}`,
      balloonColour: hex,
      hex,
      recipe,
      Display: ({ size }: { size: number }) => <Splat hex={hex} size={size} />,
    } satisfies LearningItem,
  ]),
);

export const colourClips = Object.fromEntries(
  colourList.flatMap(({ key, word = key }) => [
    [`colours.name.${key}`, word],
    [`colours.plural.${key}`, `${word} ones`],
  ]),
);
