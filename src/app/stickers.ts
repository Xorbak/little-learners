import type { ClipTable } from '../types/learning';

/**
 * What each sticker does when she taps it in her sticker book: what the narrator
 * says and how it moves. Clips are `sticker.do.<key>`, so they can be recorded.
 */
export type StickerAction =
  | 'hop'
  | 'gallop'
  | 'wiggle'
  | 'roll'
  | 'roar'
  | 'stomp'
  | 'swing'
  | 'waddle'
  | 'fly'
  | 'buzz'
  | 'crawl'
  | 'swim'
  | 'leap'
  | 'blast'
  | 'drive'
  | 'spin'
  | 'grow'
  | 'munch'
  | 'float'
  | 'open'
  | 'bounce'
  | 'splat'
  | 'dance'
  | 'hug'
  | 'sleepy'
  | 'stretch'
  | 'sparkle';

export interface StickerInfo {
  key: string;
  says: string;
  action: StickerAction;
}

export const STICKER_INFO: Record<string, StickerInfo> = {
  '🦄': { key: 'unicorn', says: 'The unicorn gallops and sparkles! Neigh!', action: 'gallop' },
  '🐶': { key: 'dog', says: 'The puppy says woof woof!', action: 'hop' },
  '🐱': { key: 'cat', says: 'The kitty says meow!', action: 'wiggle' },
  '🐰': { key: 'rabbit', says: 'The bunny goes hop, hop, hop!', action: 'hop' },
  '🦊': { key: 'fox', says: 'The fox goes yip yip!', action: 'hop' },
  '🐻': { key: 'bear', says: 'The bear says grrr! Big bear hug!', action: 'hug' },
  '🐼': { key: 'panda', says: 'The panda rolls over!', action: 'roll' },
  '🐨': { key: 'koala', says: 'The koala gives you a cuddle!', action: 'hug' },
  '🐯': { key: 'tiger', says: 'The tiger says roar!', action: 'roar' },
  '🦁': { key: 'lion', says: 'The lion says roar!', action: 'roar' },
  '🐮': { key: 'cow', says: 'The cow says moo!', action: 'wiggle' },
  '🐷': { key: 'pig', says: 'The pig says oink oink!', action: 'wiggle' },
  '🐸': { key: 'frog', says: 'The frog says ribbit! Jump!', action: 'leap' },
  '🐵': { key: 'monkey', says: 'The monkey says ooh ooh, aah aah!', action: 'swing' },
  '🐔': { key: 'chicken', says: 'The chicken says cluck cluck!', action: 'hop' },
  '🐧': { key: 'penguin', says: 'The penguin waddles!', action: 'waddle' },
  '🐤': { key: 'chick', says: 'The chick says cheep cheep!', action: 'hop' },
  '🦉': { key: 'owl', says: 'The owl says hoo hoo!', action: 'fly' },
  '🐝': { key: 'bee', says: 'The bee says bzzz!', action: 'buzz' },
  '🦋': { key: 'butterfly', says: 'The butterfly flutters by!', action: 'fly' },
  '🐞': { key: 'ladybird', says: 'The ladybird crawls along!', action: 'crawl' },
  '🐢': { key: 'turtle', says: 'The turtle goes slowly, slowly!', action: 'crawl' },
  '🐙': { key: 'octopus', says: 'The octopus wiggles all its arms!', action: 'swim' },
  '🐳': { key: 'whale', says: 'The whale goes splash!', action: 'swim' },
  '🐬': { key: 'dolphin', says: 'The dolphin jumps! Splash!', action: 'leap' },
  '🐠': { key: 'fish', says: 'The fish swims along!', action: 'swim' },
  '🦕': { key: 'dinosaur', says: 'The dinosaur stomps! Stomp, stomp!', action: 'stomp' },
  '🦖': { key: 't-rex', says: 'The T-rex says roar!', action: 'roar' },
  '🐲': { key: 'dragon', says: 'The dragon flies! Rawr!', action: 'fly' },
  '🌈': { key: 'rainbow', says: 'A rainbow! So many colours!', action: 'sparkle' },
  '⭐': { key: 'star', says: 'Twinkle, twinkle, little star!', action: 'spin' },
  '🌟': { key: 'shiny-star', says: 'A shiny, shiny star!', action: 'spin' },
  '🌸': { key: 'blossom', says: 'A pretty flower grows!', action: 'grow' },
  '🌻': { key: 'sunflower', says: 'The sunflower grows so tall!', action: 'grow' },
  '🍓': { key: 'strawberry', says: 'A strawberry! Yum yum!', action: 'munch' },
  '🍉': { key: 'watermelon', says: 'Watermelon! Crunch, crunch!', action: 'munch' },
  '🍩': { key: 'doughnut', says: 'A doughnut! Yum!', action: 'munch' },
  '🍦': { key: 'ice-cream', says: 'Ice cream! Lick, lick!', action: 'munch' },
  '🧁': { key: 'cupcake', says: 'A cupcake! Yum yum!', action: 'munch' },
  '🍭': { key: 'lollipop', says: 'A swirly lollipop!', action: 'spin' },
  '🎈': { key: 'balloon', says: 'A balloon! Up, up, up!', action: 'float' },
  '🎁': { key: 'present', says: "A present! What's inside?", action: 'open' },
  '🎀': { key: 'bow', says: 'A pretty pink bow!', action: 'sparkle' },
  '👑': { key: 'crown', says: 'A crown for a princess!', action: 'sparkle' },
  '🚀': { key: 'rocket', says: 'Three, two, one, blast off!', action: 'blast' },
  '🚂': { key: 'train', says: 'The train goes choo choo!', action: 'drive' },
  '🚒': { key: 'fire-engine', says: 'The fire engine goes nee naw, nee naw!', action: 'drive' },
  '🚁': { key: 'helicopter', says: 'The helicopter flies up high!', action: 'fly' },
  '⚽': { key: 'ball', says: 'Kick the ball! Bounce, bounce!', action: 'bounce' },
  '🎨': { key: 'paint', says: 'Splish splash! Paint!', action: 'splat' },
  '🎵': { key: 'music', says: 'La la la! Music!', action: 'dance' },
  '🧸': { key: 'teddy', says: 'Teddy gives you a big hug!', action: 'hug' },
  '🪁': { key: 'kite', says: 'The kite flies in the wind!', action: 'fly' },
  '🏰': { key: 'castle', says: 'A castle! Hello, king and queen!', action: 'sparkle' },
  '🌙': { key: 'moon', says: 'The moon says goodnight! Shh!', action: 'sleepy' },
  '☀️': { key: 'sun', says: 'The sun says good morning!', action: 'spin' },
  '🍄': { key: 'mushroom', says: 'A mushroom pops up!', action: 'grow' },
  '🦒': { key: 'giraffe', says: 'The giraffe has a long, long neck! Stretch!', action: 'stretch' },
  '🦓': { key: 'zebra', says: 'The zebra gallops!', action: 'gallop' },
  '🏆': { key: 'trophy', says: "A trophy! You did all of today's games!", action: 'sparkle' },
};

export const stickerInfo = (emoji: string): StickerInfo => STICKER_INFO[emoji] ?? { key: 'sticker', says: 'A sticker!', action: 'wiggle' };

export const stickerClips: ClipTable = {
  'sticker.do.sticker': 'A sticker!',
  ...Object.fromEntries(Object.values(STICKER_INFO).map((s) => [`sticker.do.${s.key}`, s.says])),
};
