import { amountFace } from '../../shared/ui/faces';
import type { LearningItem } from '../../types/learning';

/**
 * Each number is a character with its own colour and a little story about its shape.
 * Every game imports from here, so "3" always looks the same everywhere in the app.
 *
 * Note: balloons deliberately do NOT use these colours, so she learns the
 * shape of the number rather than "three is green".
 */
export interface NumberCharacter {
  value: number;
  word: string;
  plural: string;
  colour: string;
  /** How to remember its shape, for future games like Peekaboo and Trace */
  story: string;
}

export const numberCharacters: NumberCharacter[] = [
  { value: 0, word: 'zero', plural: 'zeros', colour: '#868e96', story: 'Zero is a round doughnut.' },
  { value: 1, word: 'one', plural: 'ones', colour: '#e03131', story: 'One stands tall like a soldier.' },
  { value: 2, word: 'two', plural: 'twos', colour: '#1c7ed6', story: 'Two is a swan on the water.' },
  { value: 3, word: 'three', plural: 'threes', colour: '#2f9e44', story: 'Three has two bumpy bellies.' },
  { value: 4, word: 'four', plural: 'fours', colour: '#f08c00', story: 'Four looks like a sailboat.' },
  { value: 5, word: 'five', plural: 'fives', colour: '#9c36b5', story: 'Five wears a hat and has a big round tummy.' },
  { value: 6, word: 'six', plural: 'sixes', colour: '#0c8599', story: 'Six is curled up like a snail.' },
  { value: 7, word: 'seven', plural: 'sevens', colour: '#d6336c', story: 'Seven is like a diving board.' },
  { value: 8, word: 'eight', plural: 'eights', colour: '#5c940d', story: 'Eight is a snowman.' },
  { value: 9, word: 'nine', plural: 'nines', colour: '#3b5bdb', story: 'Nine is a balloon on a string.' },
  { value: 10, word: 'ten', plural: 'tens', colour: '#e8590c', story: 'Ten is one and zero holding hands.' },
];

function NumeralCard({ character, size }: { character: NumberCharacter; size: number }) {
  return (
    <span className="numeral" style={{ fontSize: size, color: character.colour }}>
      {character.value}
    </span>
  );
}

function NumeralOnBalloon({ value, size }: { value: number; size: number }) {
  return (
    <span className="numeral numeral--balloon" style={{ fontSize: value === 10 ? size * 0.75 : size }}>
      {value}
    </span>
  );
}

export const numberItems: Record<string, LearningItem> = Object.fromEntries(
  numberCharacters.map((c) => [
    String(c.value),
    {
      key: String(c.value),
      value: c.value,
      nameClip: `numbers.name.${c.value}`,
      pluralClip: `numbers.plural.${c.value}`,
      Display: ({ size }: { size: number }) => <NumeralCard character={c} size={size} />,
      BalloonLabel: ({ size }: { size: number }) => <NumeralOnBalloon value={c.value} size={size} />,
      Plain: ({ size }: { size: number }) => (
        <span className="numeral" style={{ fontSize: c.value === 10 ? size * 0.8 : size }}>
          {c.value}
        </span>
      ),
      // Match It: the numeral, or that many things to count
      faces: {
        numeral: () => ({
          View: ({ size }) => (
            <span className="numeral" style={{ fontSize: (c.value === 10 ? 0.62 : 0.78) * size, color: c.colour }}>
              {c.value}
            </span>
          ),
        }),
        amount: amountFace(c.value),
      },
    } satisfies LearningItem,
  ]),
);

export const numberClips = Object.fromEntries(
  numberCharacters.flatMap((c) => [
    [`numbers.name.${c.value}`, c.word],
    [`numbers.plural.${c.value}`, c.plural],
    [`numbers.story.${c.value}`, c.story],
  ]),
);
