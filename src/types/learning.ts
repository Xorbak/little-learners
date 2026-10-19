import type { FC } from 'react';

/**
 * A clip is one piece of narration, e.g. "Pop all the" or "threes".
 * Every clip has an id and the words it says. If a recording with the
 * same name exists in src/recordings, it is played; otherwise the words
 * are spoken with text-to-speech.
 */
export type ClipId = string;
export type ClipTable = Record<ClipId, string>;

/**
 * Something a child learns to recognise: a number, a colour, a letter, a shape.
 * Games never know what an item is; they only use these fields.
 */
export interface LearningItem {
  key: string;
  /** "three", "red" */
  nameClip: ClipId;
  /** "threes", "red ones" (used in "Pop all the ___") */
  pluralClip: ClipId;
  /** Big picture shown when asking for this item */
  Display: FC<{ size: number }>;
  /** What is printed on a balloon, if anything */
  BalloonLabel?: FC<{ size: number }>;
  /** Forces the balloon colour (colours section). Otherwise balloons get random colours. */
  balloonColour?: string;
  /** How many this item stands for (numbers only), used by counting games like Feed Me */
  value?: number;
  /** The item's actual colour (colours only), used by painting games */
  hex?: string;
  /** Which items mix to make this one, in equal amounts (e.g. orange = red + yellow) */
  recipe?: string[];
  /** A picture to paint (art section), used by Paint by Numbers */
  picture?: PaintPicture;
  /** The written word (letters section), e.g. "cat" */
  word?: string;
  /** The sound its first letter makes, e.g. 'letters.sound.c' ("k") */
  soundClip?: ClipId;
  /** One-colour version drawn in CSS currentColor (shapes), so games can recolour it */
  Plain?: FC<{ size: number }>;
  /** false keeps this item out of "What she knows" (e.g. flash-card words) */
  track?: boolean;
  /** What kind of thing it is, for odd-one-out (e.g. fruit) */
  group?: { key: string; clip: ClipId };
  /** A sorting activity (thinking section), used by Sort It */
  sortSet?: SortSet;
}

/** Baskets and the things that go in them */
export interface SortSet {
  /** Said at the start, e.g. "Put the red things in the red basket…" */
  askClip: ClipId;
  baskets: { key: string; clip: ClipId; icon: string; colour?: string; scale?: number }[];
  pieces: { emoji: string; basket: string; scale?: number }[];
}

/** One tappable part of a paint-by-numbers picture */
export interface PaintRegion {
  /** SVG path, in the picture's viewBox */
  d: string;
  /** The colour it should be painted */
  hex: string;
  /** That colour's name, e.g. 'colours.name.red' */
  colourClip: ClipId;
  /** Where the number/dot sits */
  label: [number, number];
}

export interface PaintPicture {
  viewBox: string;
  /** Drawn in order; later regions sit on top of earlier ones */
  regions: PaintRegion[];
  /** Lines drawn on top that can't be painted (eyes, smiles, bubbles) */
  Details?: FC;
}

// ---------------------------------------------------------------------------
// Activities: each `kind` is handled by one mechanic in src/engine.
// Add a new mechanic by adding its config type to the ActivityConfig union.
// ---------------------------------------------------------------------------

export interface PopBalloonsConfig {
  kind: 'pop-balloons';
  /** Item keys that can appear in this level */
  pool: string[];
  /** How many correct balloons to pop per round */
  targetsPerRound: number;
  /** Total balloons floating at once */
  balloonsOnScreen: number;
  /** Seconds a balloon takes to float from bottom to top (bigger = slower) */
  riseSeconds: number;
  /** Balloons stay in place (gently swaying) instead of floating up: for learning to tap first */
  still?: boolean;
}

export interface MemoryMatchConfig {
  kind: 'memory-match';
  /** Item keys that can appear on cards. Items repeat if the board needs more pairs than the pool has. */
  pool: string[];
  /** Grid size; rows × cols must be even. The grid turns sideways on a portrait screen. */
  rows: number;
  cols: number;
  /** Show every card face-up for this many seconds at the start (a head start for small boards) */
  peekSeconds?: number;
  /** Hide one bonus pair of stinky cards on the board */
  stinkyPair?: boolean;
}

export interface FeedMeConfig {
  kind: 'feed-me';
  /** Number item keys the animal can ask for */
  pool: string[];
  /** Dots under the numeral: always, only until she knows that number, or never */
  dots: 'always' | 'until-known' | 'never';
  /** true: the animal says thank you as soon as it has the right amount.
   *  false: she presses "Here you go!" when she thinks it's right. */
  autoComplete: boolean;
  /** Extra pieces of the right food in the pile, so she can give too many */
  extraFood: number;
  /** Pieces of food the animal doesn't eat, mixed into the pile */
  wrongFood?: number;
  /** Ask for a second food too, with an amount picked from these number keys */
  secondFoodPool?: string[];
}

export interface HoldToFillConfig {
  kind: 'hold-to-fill';
  /** Colour item keys the pipes can be */
  pool: string[];
  /** How many pipes to choose from (1 = just practise stopping) */
  pipes: number;
  /** Fill right up, or only to the halfway line */
  fillTo: 'full' | 'half';
  /** Seconds of holding to fill an empty bucket to the top (bigger = slower, easier) */
  fillSeconds: number;
  /**
   * 'pour' (default): fill with one named colour.
   * 'mix': make the target colour (from `pool`) by mixing the `paints` pipes.
   * 'lab': free play with the `paints` pipes; the narrator names what she made.
   */
  mode?: 'pour' | 'mix' | 'lab';
  /** Pipes for 'mix' and 'lab': item keys of paints (red, yellow, blue, white, black) */
  paints?: string[];
  /** 'mix': show the recipe card (red + yellow = orange) */
  hints?: boolean;
}

export interface PaintByNumbersConfig {
  kind: 'paint-by-numbers';
  /** Picture item keys */
  pool: string[];
  /**
   * What each part shows: a dot of its colour, a number on a coloured dot,
   * just the number, or nothing (free painting).
   */
  hints: 'colour' | 'number-and-colour' | 'number' | 'none';
  /** Free painting: any colour anywhere, repaint as much as she likes, finish with the tick button */
  free?: boolean;
  /** Start each round with a gallery of the pool so she picks the picture herself */
  choose?: boolean;
}

export interface FlashCardsConfig {
  kind: 'flash-cards';
  /** Word item keys the deck is dealt from */
  pool: string[];
  /** Cards in one deck (one round) */
  cardsPerDeck: number;
}

export interface TouchItConfig {
  kind: 'touch-it';
  /** Item keys that can appear */
  pool: string[];
  /** How many to choose from (target included) */
  choices: number;
  /**
   * 'none': every choice the same colour, upright.
   * 'colour': each choice a different colour.
   * 'all': different colours, sizes and tilts, so she learns the shape itself.
   */
  varied: 'none' | 'colour' | 'all';
  /** Ask with the item's name ("Touch the cow") or its sound ("Who says moo?"). Default 'name'. */
  askWith?: 'name' | 'sound';
  /** Clip said before the name/sound. Default 'touch.touch-the' ("Touch the") */
  askClip?: ClipId;
  /** Clip said before the name when right. Default 'touch.yes-thats' ("Yes! That's the") */
  yesClip?: ClipId;
  /** Clip said before the tapped name when wrong. Default 'touch.oops-thats' ("Oops! That's the") */
  oopsClip?: ClipId;
}

export interface CheckInConfig {
  kind: 'check-in';
  /** Feeling item keys to choose from. Items with group 'calm' get breathing together. */
  pool: string[];
}

export interface SortConfig {
  kind: 'sort';
  /** Sort set item keys */
  pool: string[];
  /** Things to sort in one round */
  pieces: number;
}

export interface PatternConfig {
  kind: 'pattern';
  /** Item keys the pattern can be made of */
  pool: string[];
  /** Pattern shapes: AB = 🍎🍌🍎🍌, AAB = 🍎🍎🍌🍎🍎🍌, ABB, ABC */
  types: ('AB' | 'AAB' | 'ABB' | 'ABC')[];
  /** Answers to choose from */
  choices: number;
}

export interface OddOneOutConfig {
  kind: 'odd-one-out';
  /** Item keys (each with a group) */
  pool: string[];
  /** Things shown: all but one from the same group */
  choices: number;
}

export interface MusicConfig {
  kind: 'music';
  /** Not used (the xylophone has no items); keep empty */
  pool: string[];
  /** 'free': play anything (with a 🎵 song button). 'follow': copy the tune the bars play. */
  mode: 'free' | 'follow';
  /** How many bars on the xylophone (5 = C to G, 8 = a full octave) */
  bars: number;
  /** 'follow': notes in each tune */
  notes?: number;
  /** 'follow': on her turn, the bar to tap next glows (first levels) */
  guide?: boolean;
}

export interface TraceConfig {
  kind: 'trace';
  /** Item keys to trace. Each needs a Plain drawing made of one outline (circle, polygon, path…). */
  pool: string[];
}

export type ActivityConfig =
  | TraceConfig
  | MusicConfig
  | SortConfig
  | PatternConfig
  | OddOneOutConfig
  | CheckInConfig
  | TouchItConfig
  | PopBalloonsConfig
  | MemoryMatchConfig
  | FeedMeConfig
  | HoldToFillConfig
  | PaintByNumbersConfig
  | FlashCardsConfig;

export interface Level {
  id: string;
  /** Shown to the parent only */
  parentLabel: string;
  /** Rounds to finish before the level counts as done */
  rounds: number;
  activity: ActivityConfig;
}

export interface Game {
  id: string;
  titleClip: ClipId;
  icon: string;
  levels: Level[];
}

export interface Section {
  id: string;
  /** Position on the home screen */
  order: number;
  titleClip: ClipId;
  icon: string;
  colour: string;
  items: Record<string, LearningItem>;
  clips: ClipTable;
  games: Game[];
  /** false hides this section from "What she knows" (e.g. Art, where items are pictures) */
  trackProgress?: boolean;
}
