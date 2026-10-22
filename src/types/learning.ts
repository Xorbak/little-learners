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
  /** A photo or drawing (URL), used by the jigsaw puzzle */
  photo?: string;
  /**
   * Other ways of showing this item, for Match It: a number as a numeral or as a
   * group of things, a letter as a capital, small letter or picture, a colour as
   * a thing of that colour, a shape as a thing that shape.
   */
  faces?: Record<string, Face>;
  /** A question for Pick It, made fresh each round (numbers and things can change) */
  quiz?: (config: PickItConfig) => QuizQuestion;
  /** Steps to put in order, for Put In Order (a routine, a life cycle, a story) */
  orderSet?: OrderSet;
  /** Parts to tap on the drum, for Beats (a word's syllables, a sentence's words, a rhythm) */
  beats?: BeatSet;
  /** A picture story, for Story Time */
  story?: Story;
}

export interface BeatSet {
  /** Each part, said as she taps (syllables: 'ell', 'uh', 'fant'; or words) */
  parts: ClipId[];
  /** The whole thing ("Elephant!", "I like cake.") */
  whole: ClipId;
  picture: string;
  /** Written under the picture (sentences) */
  text?: string;
  /** Copy the beat: the gaps between drum beats (ms) */
  rhythm?: number[];
}

/** A short picture story: pages read aloud, then questions */
export interface Story {
  title: ClipId;
  cover: string;
  pages: { scene: string; clip: ClipId }[];
  /** Asked after the story; the first answer is right */
  questions: { ask: ClipId; answers: { emoji: string; clip: ClipId }[] }[];
  /** "What do you think happens next?" before the last page; the first is what happens */
  next: { emoji: string; clip: ClipId }[];
}

/** One answer card in Pick It */
export interface QuizAnswer {
  key: string;
  View: FC<{ size: number }>;
  /** What it's called, said after a wrong tap ("Oops! That's the dog") */
  clip?: ClipId;
  /** Or a whole phrase for a wrong tap ("Oops! That one is under the table") */
  says?: ClipId[];
  /** The right answer; with `inOrder`, which tap it is (1, 2, 3…) */
  right?: boolean | number;
}

/** A question for Pick It: something to look at or hear, a question, answers to tap */
export interface QuizQuestion {
  /**
   * Picture at the top. `stage` counts the `tell` parts said so far (things can
   * arrive or go away as the story is told); `solved` is true once answered.
   */
  Scene?: FC<{ width: number; height: number; stage: number; solved: boolean }>;
  /** Said before the question, part by part */
  tell?: ClipId[][];
  /** The question */
  ask: ClipId[];
  /** Riddles: clues said one at a time (the first with the question; the speaker gives the next) */
  clues?: ClipId[][];
  /** A sound to listen to after the question (sounds around us, high or low…) */
  sound?: () => Promise<void> | void;
  answers: QuizAnswer[];
  /** Keep the answers in this order (default: shuffled) */
  fixedOrder?: boolean;
  /** Tap the right answers in order, e.g. "Touch the cat, then the ball" */
  inOrder?: boolean;
  /** Said when right (default: "Yes!" and the answer's name) */
  yes?: ClipId[];
  /** Said after a wrong tap, before the question again (default: "Oops! That's the …") */
  oops?: ClipId[];
  /** 'wide' answer cards (groups of things, little scenes); default square */
  cards?: 'square' | 'wide';
  /** Another question straight after this one (now count them, what happens next…) */
  then?: () => QuizQuestion;
}

/** Steps in the right order */
export interface OrderSet {
  /** Said at the start, e.g. "Let's wash our hands! What do we do first?" */
  askClip: ClipId;
  steps: OrderStep[];
  /** Said at the end, after going through the steps */
  doneClip?: ClipId;
  /** 'size': smallest to biggest (says "Smallest… bigger… biggest!" instead of first, then, last) */
  by?: 'time' | 'size';
  /** Don't say each step as it is placed (long steps, like story pages); they are all said at the end */
  quiet?: boolean;
}

export interface OrderStep {
  emoji: string;
  /** What happens, e.g. "Wet your hands." */
  clip: ClipId;
  /** Draw the emoji bigger or smaller (ordering by size) */
  scale?: number;
}

/**
 * One way of showing an item. `seed` picks a variety (which picture, which
 * objects) and is the same for every card in a round, so only the item differs.
 * `counting` (amounts only): how many of the objects are lit up while counting.
 */
export type Face = (seed: number) => {
  View: FC<{ size: number; counting?: number }>;
  /** What the narrator calls this face if it isn't the item's name (e.g. "cat" for the c picture) */
  clip?: ClipId;
};

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
  /** Made from a colouring page: the line art (in Details) gives the outlines, so areas have no stroke of their own */
  lineArt?: boolean;
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
  /** Take turns with a grown-up: a miss passes the turn; each finds pairs for their own pile */
  turns?: boolean;
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

export interface JigsawConfig {
  kind: 'jigsaw';
  /** Item keys of pictures (items with a photo) */
  pool: string[];
  cols: number;
  rows: number;
  /** Show the picture faintly on the board as a guide */
  ghost: boolean;
  /** Start with a gallery so she picks the picture (Today's lessons skips it) */
  choose?: boolean;
}

/** One way round for Match It: what is shown at the top, and what the cards show */
export interface MatchWay {
  /** Face at the top ('display' = the item's own picture) */
  show: string;
  /** Face on the cards */
  pick: string;
  /** Said to ask; '$name' is replaced by the target's name, e.g. ['match.find', '$name'] */
  ask: ClipId[];
  /** Said when right, e.g. ['match.yes', '$name']. '$count' counts the things out loud (amounts). */
  yes: ClipId[];
}

export interface MatchItConfig {
  kind: 'match-it';
  /** Item keys (each needs the faces the ways use) */
  pool: string[];
  /** Cards to choose from (target included) */
  choices: number;
  /** The ways round it can go; each round picks one (two ways = it goes back and forth) */
  ways: MatchWay[];
}

export interface LearnWordsConfig {
  kind: 'learn-words';
  /** Word keys, in the order she meets them */
  pool: string[];
  /** Don't bring in a new word while she is still learning this many (not yet learned) */
  maxLearning: number;
  /** New words a day, at most */
  newPerDay: number;
}

export interface WaitForItConfig {
  kind: 'wait-for-it';
  /** Not used; keep empty */
  pool: string[];
  /**
   * 'light': tap the frog only when the light turns green.
   * 'bear': tap the bunnies that pop up, but not the sleeping bear.
   */
  mode: 'light' | 'bear';
  /** Seconds to wait before green (or between pop-ups), from–to */
  wait: [number, number];
  /** Good taps to finish the round */
  taps: number;
  /** 'light': sometimes the light goes amber and back to red (a tease) */
  teases?: boolean;
  /** 'bear': how often the bear comes instead of a bunny (0–1) */
  bearChance?: number;
}

export interface PickItConfig {
  kind: 'pick-it';
  /** Question items (each with a `quiz`) */
  pool: string[];
  /** Answers to choose from (questions that can vary it) */
  choices?: number;
  /** Numbers questions: the smallest and biggest numbers used */
  min?: number;
  max?: number;
  /** Which kinds of question a generator may ask (e.g. ['more', 'fewer', 'same']) */
  modes?: string[];
}

export interface OrderConfig {
  kind: 'order';
  /** Items with an orderSet */
  pool: string[];
  /** Use at most this many steps (the first and last are always kept) */
  steps?: number;
  /** This many steps are already in place at the start (easier) */
  placed?: number;
}

export interface ShareConfig {
  kind: 'share';
  /** Not used; keep empty */
  pool: string[];
  /** How many friends to share between, from–to */
  friends: [number, number];
  /** How many treats each friend should end up with, from–to */
  each: [number, number];
}

export interface BeatsConfig {
  kind: 'beats';
  /** Items with beats */
  pool: string[];
  mode: 'syllables' | 'words' | 'copy';
  /** The narrator does it first, with the drum */
  demo?: boolean;
  /** Each tap says the next part */
  guide?: boolean;
}

export interface StoryConfig {
  kind: 'story';
  /** Story items */
  pool: string[];
  /** Questions after the story */
  questions: number;
  /** Stop before the last page: "What do you think happens next?" */
  guessNext?: boolean;
}

export interface SayItConfig {
  kind: 'say-it';
  /** Items to say (pictures with names) */
  pool: string[];
  /** The question before the word, e.g. "Can you say" (default) */
  askClip?: ClipId;
}

export interface AboutMeConfig {
  kind: 'about-me';
  /** Question keys (me-name, me-age, me-town…) */
  pool: string[];
}

export interface FamilyConfig {
  kind: 'family';
  /** Not used for picking (photos come from the grown-ups area); one item to keep her answers */
  pool: string[];
  /** 1 = "Who is this?" with one photo; more = "Touch Mama!" with that many photos */
  choices: number;
}

export type ActivityConfig =
  | PickItConfig
  | AboutMeConfig
  | FamilyConfig
  | BeatsConfig
  | StoryConfig
  | SayItConfig
  | ShareConfig
  | OrderConfig
  | MatchItConfig
  | LearnWordsConfig
  | WaitForItConfig
  | JigsawConfig
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
