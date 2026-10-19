import type { ClipTable } from '../../types/learning';

/**
 * The animals and their food. Each animal has a favourite food (asked for first)
 * and a second food (for the "two foods" levels). Add an animal by adding a line
 * here plus its foods; the clips below are generated from these lists.
 */

export const FOODS = {
  carrot: { emoji: '🥕', one: 'carrot', many: 'carrots' },
  apple: { emoji: '🍎', one: 'apple', many: 'apples' },
  banana: { emoji: '🍌', one: 'banana', many: 'bananas' },
  grapes: { emoji: '🍇', one: 'grape', many: 'grapes' },
  cheese: { emoji: '🧀', one: 'piece of cheese', many: 'pieces of cheese' },
  strawberry: { emoji: '🍓', one: 'strawberry', many: 'strawberries' },
  bone: { emoji: '🦴', one: 'bone', many: 'bones' },
  cookie: { emoji: '🍪', one: 'cookie', many: 'cookies' },
} as const;

export type FoodId = keyof typeof FOODS;

export const ANIMALS = {
  rabbit: { emoji: '🐰', name: 'Bunny', foods: ['carrot', 'apple'] },
  monkey: { emoji: '🐵', name: 'Monkey', foods: ['banana', 'grapes'] },
  mouse: { emoji: '🐭', name: 'Mouse', foods: ['cheese', 'strawberry'] },
  dog: { emoji: '🐶', name: 'Doggy', foods: ['bone', 'cookie'] },
} as const satisfies Record<string, { emoji: string; name: string; foods: readonly [FoodId, FoodId] }>;

export type AnimalId = keyof typeof ANIMALS;

export const feedClips: ClipTable = {
  'feed.title': 'Feed me!',
  'feed.and': 'and',
  'feed.yum': 'Yum yum! Thank you!',
  'feed.full': "Oh! I'm so full!",
  'feed.too-many': 'Too many! You can have that one back.',
  'feed.hungry': "I'm still hungry!",
  'feed.no-thanks': 'No thank you!',
  'feed.i-eat': 'I eat',
  ...Object.fromEntries(Object.entries(ANIMALS).map(([id, a]) => [`feed.wants.${id}`, `${a.name} wants`])),
  ...Object.fromEntries(
    Object.entries(FOODS).flatMap(([id, f]) => [
      [`feed.food.${id}.one`, f.one],
      [`feed.food.${id}.many`, f.many],
    ]),
  ),
};
